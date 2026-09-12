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
    if (chunkTextContent.length > 20) {
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

// Helper: Extract text from file buffer based on MIME / extension
const extractTextFromBuffer = async (file) => {
  const originalName = file.originalname.toLowerCase();

  if (originalName.endsWith('.pdf') || file.mimetype === 'application/pdf') {
    const data = await pdfParse(file.buffer);
    return data.text || '';
  }

  if (
    originalName.endsWith('.docx') ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value || '';
  }

  // Plain text, markdown, CSV, code files
  return file.buffer.toString('utf-8');
};

// Helper: Keyword & BM25-style relevance scoring for RAG
const retrieveRelevantChunks = (query, chunks, topK = 4) => {
  if (!chunks || chunks.length === 0) return [];

  // Normalize query terms
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
      // Term frequency
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

  // Sort by highest relevance score
  scoredChunks.sort((a, b) => b.score - a.score);

  // If top scores are 0, return first chunks
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

    // Extract text from file buffer
    const extractedText = await extractTextFromBuffer(file);
    const chunks = chunkText(extractedText);

    // Determine file extension
    const ext = file.originalname.split('.').pop()?.toLowerCase() || 'txt';

    const document = await Document.create({
      user: req.user._id,
      name: file.originalname,
      category,
      size: sizeStr,
      fileType: ext,
      extractedText: extractedText.slice(0, 500000), // store up to 500k chars
      chunks,
      uploadDate: new Date().toISOString().split('T')[0],
    });

    return res.status(201).json({
      success: true,
      message: `Document "${file.originalname}" uploaded and parsed successfully! ${chunks.length} chunks indexed for RAG queries.`,
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
      message: 'Failed to process and parse document.',
      error: err.message,
    });
  }
});

// @route   POST /api/documents/:id/query
// @desc    Ask a question against an uploaded document using RAG (Retrieval-Augmented Generation)
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

    if (!document.extractedText || document.extractedText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'This document does not contain readable text to answer questions.',
      });
    }

    // Step 1: Retrieve top relevant chunks
    const relevantChunks = retrieveRelevantChunks(question, document.chunks, 5);
    const contextText = relevantChunks.map((c, i) => `[Excerpt ${i + 1}]:\n${c.text}`).join('\n\n');

    // Step 2: Query Groq AI with grounded RAG context
    const groq = getGroqClient();

    const systemPrompt = `You are Synexora Document Intelligence AI.
You have access to excerpts from the student's uploaded document "${document.name}".
Your task is to answer the user's question accurately and helpfully based on the provided document excerpts.
- Answer clearly with proper structure.
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
// @desc    Delete a document and its stored text chunks
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
