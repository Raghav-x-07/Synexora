const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Note = require("../models/Note");

// @route   GET /api/v1/notes
router.get("/", protect, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.json(notes);
  } catch (err) {
    console.error("[Notes GET Error]", err.message);
    return res.status(500).json({ message: "Failed to fetch notes" });
  }
});

// @route   POST /api/v1/notes
router.post("/", protect, async (req, res) => {
  const { title, courseCode, content, isAiSuggested, tags } = req.body;

  if (!title || !title.trim() || !content || !content.trim()) {
    return res.status(400).json({ message: "Title and content are required for notes" });
  }

  try {
    const note = await Note.create({
      user: req.user.id,
      title: title.trim(),
      courseCode: courseCode || "GENERAL",
      content: content.trim(),
      isAiSuggested: isAiSuggested || false,
      tags: tags || "",
    });
    return res.status(201).json(note);
  } catch (err) {
    console.error("[Notes POST Error]", err.message);
    return res.status(500).json({ message: "Failed to create note" });
  }
});

// @route   DELETE /api/v1/notes/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const result = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!result) {
      return res.status(404).json({ message: "Note not found" });
    }
    return res.status(204).send();
  } catch (err) {
    console.error("[Notes DELETE Error]", err.message);
    return res.status(500).json({ message: "Failed to delete note" });
  }
});

module.exports = router;
