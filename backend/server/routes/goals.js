const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Goal = require("../models/Goal");

// @route   GET /api/v1/goals
router.get("/", protect, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.json(goals);
  } catch (err) {
    console.error("[Goals GET Error]", err.message);
    return res.status(500).json({ message: "Failed to fetch goals" });
  }
});

// @route   POST /api/v1/goals
router.post("/", protect, async (req, res) => {
  const { title, description, targetDate, progressPercentage, status } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Goal title is required" });
  }

  try {
    const goal = await Goal.create({
      user: req.user.id,
      title: title.trim(),
      description: description || "",
      targetDate: targetDate ? new Date(targetDate) : null,
      progressPercentage: progressPercentage !== undefined ? Number(progressPercentage) : 0,
      status: status || "IN_PROGRESS",
    });
    return res.status(201).json(goal);
  } catch (err) {
    console.error("[Goals POST Error]", err.message);
    return res.status(500).json({ message: "Failed to create goal" });
  }
});

// @route   PUT /api/v1/goals/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    return res.json(goal);
  } catch (err) {
    console.error("[Goals PUT Error]", err.message);
    return res.status(500).json({ message: "Failed to update goal" });
  }
});

// @route   DELETE /api/v1/goals/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const result = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!result) {
      return res.status(404).json({ message: "Goal not found" });
    }
    return res.status(204).send();
  } catch (err) {
    console.error("[Goals DELETE Error]", err.message);
    return res.status(500).json({ message: "Failed to delete goal" });
  }
});

module.exports = router;
