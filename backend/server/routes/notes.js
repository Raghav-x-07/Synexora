const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { mockStore } = require("../utils/seedData");
const Note = require("../models/Note");
const { getIsConnected } = require("../config/db");

// @route   GET /api/v1/notes
router.get("/", protect, async (req, res) => {
  if (getIsConnected()) {
    try {
      const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 });
      return res.json(notes);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  res.json(mockStore.notes);
});

// @route   POST /api/v1/notes
router.post("/", protect, async (req, res) => {
  const { title, courseCode, content, isAiSuggested, tags } = req.body;

  if (getIsConnected()) {
    try {
      const note = await Note.create({
        user: req.user.id,
        title,
        courseCode: courseCode || "GENERAL",
        content,
        isAiSuggested: isAiSuggested || false,
        tags: tags || "",
      });
      return res.status(201).json(note);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  const newNote = {
    id: `note-${Date.now()}`,
    title,
    courseCode: courseCode || "GENERAL",
    content,
    isAiSuggested: isAiSuggested || false,
    tags: tags || "",
    createdAt: new Date().toISOString(),
  };

  mockStore.notes.unshift(newNote);
  res.status(201).json(newNote);
});

// @route   DELETE /api/v1/notes/:id
router.delete("/:id", protect, async (req, res) => {
  if (getIsConnected()) {
    try {
      await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  mockStore.notes = mockStore.notes.filter((n) => n.id !== req.params.id);
  res.status(204).send();
});

module.exports = router;
