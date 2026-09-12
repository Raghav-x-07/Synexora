const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const PDFParser = require('pdf2json');
const mammoth = require('mammoth');
const Groq = require('groq-sdk');
const { protect } = require('../middleware/authMiddleware');
const Document = require('../models/Document');

const router = express.Router();

// Configure Multer for in-memory file handling (up to 25MB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});

// Initialize Groq Client
const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured in backend environment variables.');
  }
  return new Groq({ apiKey });
};

// Helper: Extract text using pdf2json (handles URL-encoded streams and complex layouts)
const extractWithPdf2Json = (buffer) => {
  return new Promise((resolve) => {
    try {
      const pdfParser = new PDFParser(null, 1);
      pdfParser.on('pdfParser_dataError', (err) => {
        console.warn('[pdf2json error]', err);
        resolve('');
      });
      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        try {
          const raw = pdfParser.getRawTextContent();
          if (raw && raw.trim().length > 30) {
            return resolve(raw.trim());
          }

          let textRuns = [];
          if (pdfData && pdfData.Pages) {
            for (const page of pdfData.Pages) {
              if (page.Texts) {
                for (const t of page.Texts) {
                  if (t.R) {
                    for (const r of t.R) {
                      if (r.T) {
                        try {
                          textRuns.push(decodeURIComponent(r.T));
                        } catch {
                          textRuns.push(r.T);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          const combined = textRuns.join(' ').replace(/\s+/g, ' ').trim();
          resolve(combined);
        } catch (e) {
          resolve('');
        }
      });
      pdfParser.parseBuffer(buffer);
    } catch (err) {
      console.warn('[pdf2json exception]', err.message);
      resolve('');
    }
  });
};

// Helper: Split text into overlapping chunks for RAG
const chunkText = (text, chunkSize = 800, overlap = 200) => {
  if (!text || text.trim().length === 0) return [];
  const cleanText = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  const chunks = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < cleanText.length) {
    const endIndex = Math.min(startIndex + chunkSize, cleanText.length);
    const chunkTextContent = cleanText.slice(startIndex, endIndex).trim();
    if (chunkTextContent.length > 10) {
      chunks.push({
        chunkIndex,
        text: chunkTextContent,
      });
      chunkIndex++;
    }
    startIndex += chunkSize - overlap;
  }
  return chunks;
};

// Multi-Engine Robust Text Extractor
const extractTextFromBuffer = async (file) => {
  const originalName = file.originalname.toLowerCase();

  // 1. PDF Parser with dual engine (pdf-parse + pdf2json)
  if (originalName.endsWith('.pdf') || file.mimetype === 'application/pdf') {
    let extracted = '';

    // Try Engine A: pdf-parse
    try {
      const data = await pdfParse(file.buffer);
      if (data && data.text && data.text.trim().length > 30) {
        extracted = data.text.trim();
        console.log(`[PDF Parser] Extracted ${extracted.length} chars using pdf-parse.`);
        return extracted;
      }
    } catch (pdfErr) {
      console.warn(`[PDF Engine A Warning]: ${pdfErr.message}`);
    }

    // Try Engine B: pdf2json
    try {
      const pdf2jsonText = await extractWithPdf2Json(file.buffer);
      if (pdf2jsonText && pdf2jsonText.length > 30) {
        extracted = pdf2jsonText;
        console.log(`[PDF Parser] Extracted ${extracted.length} chars using pdf2json.`);
        return extracted;
      }
    } catch (err2) {
      console.warn(`[PDF Engine B Warning]: ${err2.message}`);
    }

    // Try Engine C: direct text stream scanner
    try {
      const latin1 = file.buffer.toString('latin1');
      const matches = latin1.match(/\(([^()]+)\)/g);
      if (matches && matches.length > 10) {
        extracted = matches.map((m) => m.slice(1, -1)).join(' ');
        if (extracted.trim().length > 30) {
          return extracted.replace(/\\/g, '').trim();
        }
      }
    } catch (streamErr) {
      console.warn(`[PDF Engine C Warning]: ${streamErr.message}`);
    }

    return `Document: ${file.originalname}\nNote: Text extraction produced limited characters.`;
  }

  // 2. DOCX Parser
  if (
    originalName.endsWith('.docx') ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      if (result && result.value && result.value.trim().length > 0) {
        return result.value.trim();
      }
    } catch (docxErr) {
      console.warn(`[DOCX Warning]: ${docxErr.message}`);
    }
    return `Document: ${file.originalname}\nWord document content.`;
  }

  // 3. Plain text, Markdown, CSV, JSON, Code files
  try {
    const txt = file.buffer.toString('utf-8');
    if (txt && txt.trim().length > 0) return txt.trim();
  } catch (txtErr) {
    console.warn(`[TXT Warning]: ${txtErr.message}`);
  }

  return `Document: ${file.originalname}`;
};

// Helper: Keyword & BM25-style relevance scoring for RAG
const retrieveRelevantChunks = (query, chunks, topK = 5) => {
  if (!chunks || chunks.length === 0) return [];

  const terms = query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);

  if (terms.length === 0) {
    return chunks.slice(0, topK);
  }

  const scoredChunks = chunks.map((chunk) => {
    const textLower = (chunk.text || '').toLowerCase();
    let score = 0;

    terms.forEach((term) => {
      const regex = new RegExp(`\\b${term}`, 'gi');
      const matches = textLower.match(regex);
      if (matches) {
        score += matches.length * 4;
      } else if (textLower.includes(term)) {
        score += 1.5;
      }
    });

    return { ...chunk, score };
  });

  scoredChunks.sort((a, b) => b.score - a.score);

  const topMatches = scoredChunks.filter((c) => c.score > 0);
  if (topMatches.length > 0) {
    return topMatches.slice(0, topK);
  }

  return chunks.slice(0, topK);
};

// Apply JWT authentication to all document routes
router.use(protect);

// @route   GET /api/documents
// @desc    Get all documents for current user
router.get('/', async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user._id })
      .select('-extractedText -chunks')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: documents.length, documents });
  } catch (err) {
    console.error('[Get Documents Error]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/documents/:id
// @desc    Get full document details with text preview
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    return res.status(200).json({ success: true, document });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/documents/upload
// @desc    Upload real file, extract full text, chunk, and save in MongoDB
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a file to upload.' });
    }

    const { category = 'General' } = req.body;
    const file = req.file;

    // Format readable size
    const sizeInKB = (file.size / 1024).toFixed(1);
    const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${sizeInKB} KB`;

    // Extract text safely using dual-engine parser
    const extractedText = await extractTextFromBuffer(file);
    let chunks = chunkText(extractedText);

    if (chunks.length === 0) {
      chunks = [{ chunkIndex: 0, text: extractedText || file.originalname }];
    }

    const ext = file.originalname.split('.').pop()?.toLowerCase() || 'pdf';

    const document = await Document.create({
      user: req.user._id,
      name: file.originalname,
      category,
      size: sizeStr,
      fileType: ext,
      extractedText: extractedText.slice(0, 500000),
      chunks,
      uploadDate: new Date().toISOString().split('T')[0],
    });

    console.log(`[Document Created] "${document.name}" (ID: ${document._id}) with ${chunks.length} chunks and ${extractedText.length} chars.`);

    return res.status(201).json({
      success: true,
      message: `Document "${file.originalname}" uploaded and parsed successfully! (${chunks.length} chunks indexed)`,
      document: {
        _id: document._id,
        name: document.name,
        category: document.category,
        size: document.size,
        fileType: document.fileType,
        chunksCount: chunks.length,
        uploadDate: document.uploadDate,
      },
    });
  } catch (err) {
    console.error('[Upload Document Error]', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to process and parse document.',
    });
  }
});

// @route   POST /api/documents/:id/query
// @desc    Ask a question against an uploaded document using RAG
router.post('/:id/query', async (req, res) => {
  const { question } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ success: false, message: 'Question is required.' });
  }

  try {
    const document = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const fullDocText = document.extractedText || '';
    const chunks = document.chunks && document.chunks.length > 0 ? document.chunks : [{ chunkIndex: 0, text: fullDocText || document.name }];

    // Retrieve relevant chunks
    const relevantChunks = retrieveRelevantChunks(question, chunks, 6);
    let contextText = '';

    // If document is short/medium (< 12,000 chars), include entire document text so nothing is missed
    if (fullDocText.length > 0 && fullDocText.length <= 12000) {
      contextText = `FULL DOCUMENT CONTENT:\n${fullDocText}`;
    } else {
      contextText = relevantChunks.map((c, i) => `[Excerpt ${i + 1}]:\n${c.text}`).join('\n\n');
    }

    // Query Groq AI with grounded context
    const groq = getGroqClient();

    const systemPrompt = `You are Synexora Document Intelligence AI.
You have full access to the student's uploaded document "${document.name}".
Your task is to answer the student's question accurately and helpfully using the provided document content.
- If the student asks for specific facts (like their Name, CGPA, University, Email, Skills, Projects, Conclusions), find and present them clearly.
- If the student asks for a summary or key takeaways, provide a structured breakdown.
- If the student asks for practice questions, generate 3 relevant questions based on the content.
- Be concise, professional, and clear.`;

    const userPrompt = `DOCUMENT CONTENT:\n${contextText}\n\nSTUDENT QUESTION:\n${question}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'qwen/qwen3.6-27b',
      temperature: 0.3,
      max_tokens: 800,
    });

    let rawReply = chatCompletion.choices[0]?.message?.content || 'No response generated.';
    if (rawReply.includes('</think>')) {
      rawReply = rawReply.split('</think>')[1].trim();
    }

    return res.status(200).json({
      success: true,
      answer: rawReply,
      documentName: document.name,
      sourcesCount: relevantChunks.length,
      retrievedExcerpts: relevantChunks.map((c) => c.text || ''),
    });
  } catch (err) {
    console.error('[RAG Query Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to process RAG query on document.',
      error: err.message,
    });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete a document
router.delete('/:id', async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    return res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
