const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Task = require('../models/Task');

const router = express.Router();

// Apply JWT protection to all task endpoints
router.use(protect);

// @route   GET /api/tasks
// @desc    Get all tasks for current user
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/tasks
// @desc    Create new task
router.post('/', async (req, res) => {
  try {
    const { title, course, priority, dueDate } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const task = await Task.create({
      user: req.user._id,
      title,
      course: course || 'General',
      priority: priority || 'medium',
      dueDate: dueDate || 'No due date',
      completed: false,
    });

    return res.status(201).json({ success: true, task });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update / toggle task
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { title, course, priority, dueDate, completed } = req.body;
    if (title !== undefined) task.title = title;
    if (course !== undefined) task.course = course;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (completed !== undefined) task.completed = completed;

    await task.save();
    return res.status(200).json({ success: true, task });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    return res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
