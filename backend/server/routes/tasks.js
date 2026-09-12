const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Task = require("../models/Task");

// @route   GET /api/v1/tasks
router.get("/", protect, async (req, res) => {
  const { status } = req.query;

  try {
    const query = { user: req.user.id };
    if (status && status !== "ALL") query.status = status;
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (err) {
    console.error("[Tasks GET Error]", err.message);
    return res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// @route   POST /api/v1/tasks
router.post("/", protect, async (req, res) => {
  const { title, courseCode, description, priority, dueDate } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Task title is required" });
  }

  try {
    const task = await Task.create({
      user: req.user.id,
      title: title.trim(),
      courseCode: courseCode || "GENERAL",
      description: description || "",
      priority: priority || "MEDIUM",
      dueDate: dueDate ? new Date(dueDate) : null,
    });
    return res.status(201).json(task);
  } catch (err) {
    console.error("[Tasks POST Error]", err.message);
    return res.status(500).json({ message: "Failed to create task" });
  }
});

// @route   PUT /api/v1/tasks/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.json(task);
  } catch (err) {
    console.error("[Tasks PUT Error]", err.message);
    return res.status(500).json({ message: "Failed to update task" });
  }
});

// @route   DELETE /api/v1/tasks/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const result = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!result) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(204).send();
  } catch (err) {
    console.error("[Tasks DELETE Error]", err.message);
    return res.status(500).json({ message: "Failed to delete task" });
  }
});

module.exports = router;
