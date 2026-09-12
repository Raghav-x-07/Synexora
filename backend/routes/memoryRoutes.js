const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Memory = require('../models/Memory');

const router = express.Router();

router.use(protect);

// @route   GET /api/memory
// @desc    Get all memory recall concepts for current user
router.get('/', async (req, res) => {
  try {
    const cards = await Memory.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: cards.length, cards });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/memory
// @desc    Create concept
router.post('/', async (req, res) => {
  try {
    const { concept, definition, course } = req.body;
    if (!concept || !definition) {
      return res.status(400).json({ success: false, message: 'Concept and definition are required' });
    }

    const card = await Memory.create({
      user: req.user._id,
      concept,
      definition,
      course: course || 'General',
    });

    return res.status(201).json({ success: true, card });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/memory/:id
// @desc    Delete concept
router.delete('/:id', async (req, res) => {
  try {
    const card = await Memory.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!card) {
      return res.status(404).json({ success: false, message: 'Concept not found' });
    }
    return res.status(200).json({ success: true, message: 'Concept deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
