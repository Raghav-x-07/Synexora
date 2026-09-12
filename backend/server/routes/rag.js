const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000/api/v1";

// @route   GET /api/v1/rag/documents
router.get("/documents", async (req, res) => {
  try {
    const aiRes = await fetch(`${FASTAPI_URL}/rag/documents`);
    if (aiRes.ok) {
      const data = await aiRes.json();
      return res.json(data.documents || data);
    }
  } catch (err) {
    // Service may be unavailable or not yet configured
  }

  // Return empty array when no documents are indexed
  res.json([]);
});

// @route   POST /api/v1/rag/upload
router.post("/upload", async (req, res) => {
  const { title, subject, size } = req.body;

  try {
    const aiRes = await fetch(`${FASTAPI_URL}/rag/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, subject, size }),
    });

    if (aiRes.ok) {
      const data = await aiRes.json();
      return res.status(201).json(data.document || data);
    }
    return res.status(aiRes.status).json({ message: "Failed to process document in AI service" });
  } catch (err) {
    return res.status(503).json({ message: "AI indexing service unavailable" });
  }
});

// @route   POST /api/v1/rag/query
router.post("/query", async (req, res) => {
  const { query, documentIds } = req.body;

  try {
    const aiRes = await fetch(`${FASTAPI_URL}/rag/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, document_ids: documentIds }),
    });

    if (aiRes.ok) {
      return res.json(await aiRes.json());
    }
    return res.status(aiRes.status).json({ message: "AI query failed" });
  } catch (err) {
    return res.status(503).json({
      message: "AI query service unavailable. Please ensure the AI service is running.",
      answer: null,
      citations: [],
    });
  }
});

// @route   POST /api/v1/rag/flashcards
router.post("/flashcards", async (req, res) => {
  const { documentId } = req.body;

  try {
    const aiRes = await fetch(`${FASTAPI_URL}/rag/flashcards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_id: documentId }),
    });

    if (aiRes.ok) {
      const data = await aiRes.json();
      return res.json(data.flashcards || data);
    }
  } catch (err) {}

  res.json([]);
});

// @route   DELETE /api/v1/rag/documents/:id
router.delete("/documents/:id", async (req, res) => {
  try {
    const aiRes = await fetch(`${FASTAPI_URL}/rag/documents/${req.params.id}`, {
      method: "DELETE",
    });
    if (aiRes.ok) {
      return res.status(204).send();
    }
  } catch (err) {}

  res.status(204).send();
});

module.exports = router;

