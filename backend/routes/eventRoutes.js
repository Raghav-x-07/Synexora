const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Event = require('../models/Event');

const router = express.Router();

router.use(protect);

// @route   GET /api/events
// @desc    Get all calendar events for current user
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ user: req.user._id }).sort({ date: 1 });
    return res.status(200).json({ success: true, count: events.length, events });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/events
// @desc    Create new event
router.post('/', async (req, res) => {
  try {
    const { title, date, time, type, course } = req.body;
    if (!title || !date) {
      return res.status(400).json({ success: false, message: 'Title and date are required' });
    }

    const event = await Event.create({
      user: req.user._id,
      title,
      date,
      time: time || 'All Day',
      type: type || 'study',
      course: course || 'General',
    });

    return res.status(201).json({ success: true, event });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    return res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
