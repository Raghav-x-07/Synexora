const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { mockStore } = require("../utils/seedData");
const Goal = require("../models/Goal");
const { getIsConnected } = require("../config/db");

// @route   GET /api/v1/goals
router.get("/", protect, async (req, res) => {
  if (getIsConnected()) {
    try {
      const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
      return res.json(goals);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  res.json(mockStore.goals);
});

// @route   POST /api/v1/goals
router.post("/", protect, async (req, res) => {
  const { title, description, targetDate, progressPercentage, status } = req.body;

  if (getIsConnected()) {
    try {
      const goal = await Goal.create({
        user: req.user.id,
        title,
        description: description || "",
        targetDate: targetDate ? new Date(targetDate) : null,
        progressPercentage: progressPercentage || 0,
        status: status || "IN_PROGRESS",
      });
      return res.status(201).json(goal);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  const newGoal = {
    id: `goal-${Date.now()}`,
    title,
    description: description || "",
    targetDate: targetDate || new Date(Date.now() + 60 * 86400000).toISOString(),
    progressPercentage: progressPercentage || 10,
    status: status || "IN_PROGRESS",
    createdAt: new Date().toISOString(),
  };

  mockStore.goals.unshift(newGoal);
  res.status(201).json(newGoal);
});

// @route   PUT /api/v1/goals/:id
router.put("/:id", protect, async (req, res) => {
  if (getIsConnected()) {
    try {
      const goal = await Goal.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { $set: req.body },
        { new: true }
      );
      return res.json(goal);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  const idx = mockStore.goals.findIndex((g) => g.id === req.params.id);
  if (idx !== -1) {
    mockStore.goals[idx] = { ...mockStore.goals[idx], ...req.body };
    return res.json(mockStore.goals[idx]);
  }
  res.status(404).json({ message: "Goal not found" });
});

// @route   DELETE /api/v1/goals/:id
router.delete("/:id", protect, async (req, res) => {
  if (getIsConnected()) {
    try {
      await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  mockStore.goals = mockStore.goals.filter((g) => g.id !== req.params.id);
  res.status(204).send();
});

module.exports = router;
