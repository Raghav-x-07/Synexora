const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { mockStore } = require("../utils/seedData");
const Task = require("../models/Task");
const { getIsConnected } = require("../config/db");

// @route   GET /api/v1/tasks
router.get("/", protect, async (req, res) => {
  const { status } = req.query;

  if (getIsConnected()) {
    try {
      const query = { user: req.user.id };
      if (status) query.status = status;
      const tasks = await Task.find(query).sort({ createdAt: -1 });
      return res.json(tasks);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  let list = mockStore.tasks;
  if (status) list = list.filter((t) => t.status === status);
  res.json(list);
});

// @route   POST /api/v1/tasks
router.post("/", protect, async (req, res) => {
  const { title, courseCode, description, priority, dueDate } = req.body;

  if (getIsConnected()) {
    try {
      const task = await Task.create({
        user: req.user.id,
        title,
        courseCode: courseCode || "CS101",
        description: description || "",
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
      });
      return res.status(201).json(task);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  const newTask = {
    id: `task-${Date.now()}`,
    title,
    courseCode: courseCode || "CS101",
    description: description || "",
    status: "TODO",
    priority: priority || "MEDIUM",
    dueDate: dueDate || new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  };

  mockStore.tasks.unshift(newTask);
  res.status(201).json(newTask);
});

// @route   PUT /api/v1/tasks/:id
router.put("/:id", protect, async (req, res) => {
  if (getIsConnected()) {
    try {
      const task = await Task.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { $set: req.body },
        { new: true }
      );
      return res.json(task);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  const idx = mockStore.tasks.findIndex((t) => t.id === req.params.id);
  if (idx !== -1) {
    mockStore.tasks[idx] = { ...mockStore.tasks[idx], ...req.body };
    return res.json(mockStore.tasks[idx]);
  }
  res.status(404).json({ message: "Task not found" });
});

// @route   DELETE /api/v1/tasks/:id
router.delete("/:id", protect, async (req, res) => {
  if (getIsConnected()) {
    try {
      await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  mockStore.tasks = mockStore.tasks.filter((t) => t.id !== req.params.id);
  res.status(204).send();
});

module.exports = router;
