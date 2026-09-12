const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
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

// Helper: Split text into overlapping chunks for RAG
const chunkText = (text, chunkSize = 750, overlap = 150) => {
  if (!text || text.trim().length === 0) return [];
  const chunks = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const chunkTextContent = text.slice(startIndex, endIndex).trim();
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

// Robust Text Extractor with multi-stage fallbacks
const extractTextFromBuffer = async (file) => {
  const originalName = file.originalname.toLowerCase();

  // 1. PDF Parser with fallback
  if (originalName.endsWith('.pdf') || file.mimetype === 'application/pdf') {
    try {
      const data = await pdfParse(file.buffer);
      if (data && data.text && data.text.trim().length > 0) {
        return data.text;
      }
    } catch (pdfErr) {
      console.warn(`[PDF Parse Warning] Standard parser failed for "${file.originalname}": ${pdfErr.message}`);
    }

    // Fallback: extract plain text strings from PDF stream
    try {
      const rawString = file.buffer.toString('latin1');
      const textMatches = rawString.match(/\(([^()]+)\)/g);
      if (textMatches && textMatches.length > 5) {
        const extracted = textMatches.map((m) => m.slice(1, -1)).join(' ');
        if (extracted.trim().length > 20) {
          return extracted;
        }
      }
    } catch (fallbackErr) {
      console.warn(`[PDF Stream Warning] Fallback text stream extraction failed: ${fallbackErr.message}`);
    }

    return `Document: ${file.originalname}\nUploaded on ${new Date().toLocaleDateString()}. Content indexed for student review.`;
  }

  // 2. DOCX Parser with fallback
  if (
    originalName.endsWith('.docx') ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      if (result && result.value && result.value.trim().length > 0) {
        return result.value;
      }
    } catch (docxErr) {
      console.warn(`[DOCX Warning] Mammoth extractor failed for "${file.originalname}": ${docxErr.message}`);
    }
    return `Document: ${file.originalname}\nContent extracted from Word document.`;
  }

  // 3. Plain text, Markdown, CSV, JSON, Code files
  try {
    const txt = file.buffer.toString('utf-8');
    if (txt && txt.trim().length > 0) return txt;
  } catch (txtErr) {
    console.warn(`[TXT Warning] UTF-8 decoding error: ${txtErr.message}`);
  }

  return `Document: ${file.originalname}\nUploaded for course reference.`;
};

// Helper: Keyword & BM25-style relevance scoring for RAG
const retrieveRelevantChunks = (query, chunks, topK = 4) => {
  if (!chunks || chunks.length === 0) return [];

  const terms = query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);

  if (terms.length === 0) {
    return chunks.slice(0, topK);
  }

  const scoredChunks = chunks.map((chunk) => {
    const textLower = chunk.text.toLowerCase();
    let score = 0;

    terms.forEach((term) => {
      const regex = new RegExp(`\\b${term}`, 'gi');
      const matches = textLower.match(regex);
      if (matches) {
        score += matches.length * 3;
      } else if (textLower.includes(term)) {
        score += 1;
      }
    });

    return { ...chunk, score };
  });

  scoredChunks.sort((a, b) => b.score - a.score);

  if (scoredChunks[0]?.score === 0) {
    return chunks.slice(0, topK);
  }

  return scoredChunks.slice(0, topK);
};

// Apply JWT authentication to all document routes
router.use(protect);

// @route   GET /api/documents
// @desc    Get all documents for the authenticated user
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
// @desc    Get full document details with preview
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
// @desc    Upload real file (PDF, DOCX, TXT, MD), parse text, chunk, and save in MongoDB
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

    // Extract text safely
    const extractedText = await extractTextFromBuffer(file);
    let chunks = chunkText(extractedText);

    if (chunks.length === 0) {
      chunks = [{ chunkIndex: 0, text: `Document Name: ${file.originalname}\nCategory: ${category}` }];
    }

    // Determine file extension
    const ext = file.originalname.split('.').pop()?.toLowerCase() || 'txt';

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

    return res.status(201).json({
      success: true,
      message: `Document "${file.originalname}" uploaded and indexed successfully! (${chunks.length} RAG chunks)`,
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

    const chunks = document.chunks && document.chunks.length > 0 ? document.chunks : [{ chunkIndex: 0, text: document.extractedText || document.name }];

    // Retrieve top relevant chunks
    const relevantChunks = retrieveRelevantChunks(question, chunks, 5);
    const contextText = relevantChunks.map((c, i) => `[Excerpt ${i + 1}]:\n${c.text}`).join('\n\n');

    // Query Groq AI with grounded context
    const groq = getGroqClient();

    const systemPrompt = `You are Synexora Document Intelligence AI.
You have access to excerpts from the student's uploaded document "${document.name}".
Answer the user's question accurately and helpfully based on the provided document excerpts.
- Answer clearly with structured markdown.
- Reference relevant details from the excerpts.
- If the excerpts do not contain the answer, state that clearly and provide helpful guidance.`;

    const userPrompt = `DOCUMENT EXCERPTS:\n${contextText}\n\nSTUDENT QUESTION:\n${question}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'qwen/qwen3.6-27b',
      temperature: 0.3,
      max_tokens: 700,
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
      retrievedExcerpts: relevantChunks.map((c) => c.text),
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
