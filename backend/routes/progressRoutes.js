const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const StudyLog = require('../models/StudyLog');

const router = express.Router();

router.use(protect);

// @route   GET /api/progress
// @desc    Get all study logs and summary statistics for current user
router.get('/', async (req, res) => {
  try {
    const logs = await StudyLog.find({ user: req.user._id }).sort({ createdAt: -1 });

    const totalMinutes = logs.reduce((sum, log) => sum + (log.durationMinutes || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    const avgSessionMinutes = logs.length > 0 ? Math.round(totalMinutes / logs.length) : 0;

    return res.status(200).json({
      success: true,
      count: logs.length,
      totalMinutes,
      totalHours,
      avgSessionMinutes,
      logs,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/progress
// @desc    Log a new study session
router.post('/', async (req, res) => {
  try {
    const { subject, durationMinutes, date, topic } = req.body;
    if (!subject || !durationMinutes || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Subject, duration, and topic summary are required',
      });
    }

    const log = await StudyLog.create({
      user: req.user._id,
      subject,
      durationMinutes: Number(durationMinutes),
      date: date || new Date().toISOString().split('T')[0],
      topic,
    });

    return res.status(201).json({ success: true, log });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/progress/:id
// @desc    Delete a study log
router.delete('/:id', async (req, res) => {
  try {
    const log = await StudyLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!log) {
      return res.status(404).json({ success: false, message: 'Study log not found' });
    }
    return res.status(200).json({ success: true, message: 'Study log deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
