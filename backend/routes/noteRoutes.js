const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Note = require('../models/Note');

const router = express.Router();

router.use(protect);

// @route   GET /api/notes
// @desc    Get all notes for current user
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, count: notes.length, notes });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/notes
// @desc    Create new note
router.post('/', async (req, res) => {
  try {
    const { title, content, tag } = req.body;
    const note = await Note.create({
      user: req.user._id,
      title: title || 'Untitled Note',
      content: content || '',
      tag: tag || 'General',
    });
    return res.status(201).json({ success: true, note });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/notes/:id
// @desc    Update a note
router.put('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const { title, content, tag } = req.body;
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tag !== undefined) note.tag = tag;

    await note.save();
    return res.status(200).json({ success: true, note });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    return res.status(200).json({ success: true, message: 'Note deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
