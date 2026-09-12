const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Assessment = require('../models/Assessment');

const router = express.Router();

router.use(protect);

// @route   GET /api/assessments
// @desc    Get all assessments for current user
router.get('/', async (req, res) => {
  try {
    const assessments = await Assessment.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: assessments.length, assessments });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/assessments
// @desc    Log new assessment record
router.post('/', async (req, res) => {
  try {
    const { title, course, date, score, status } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Assessment title is required' });
    }

    const assessment = await Assessment.create({
      user: req.user._id,
      title,
      course: course || 'General',
      date: date || new Date().toISOString().split('T')[0],
      score: score || 'Pending',
      status: status || (score && score.includes('%') ? 'completed' : 'upcoming'),
    });

    return res.status(201).json({ success: true, assessment });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/assessments/:id
// @desc    Delete assessment record
router.delete('/:id', async (req, res) => {
  try {
    const assessment = await Assessment.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    return res.status(200).json({ success: true, message: 'Assessment deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
