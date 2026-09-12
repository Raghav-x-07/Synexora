const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Task = require("../models/Task");
const Memory = require("../models/Memory");
const Goal = require("../models/Goal");
const CalendarEvent = require("../models/CalendarEvent");
const StudentProfile = require("../models/StudentProfile");

// @route   GET /api/v1/dashboard/summary
router.get("/summary", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const [profile, tasks, memories, goals, events] = await Promise.all([
      StudentProfile.findOne({ user: userId }),
      Task.find({ user: userId }).sort({ createdAt: -1 }),
      Memory.find({ user: userId, isConfirmed: true }).sort({ createdAt: -1 }),
      Goal.find({ user: userId }).sort({ createdAt: -1 }),
      CalendarEvent.find({ user: userId }).sort({ startTime: 1 }),
    ]);

    const completedTasks = tasks.filter((t) => t.status === "DONE").length;

    return res.json({
      studentName: req.user.fullName || "Student",
      masteryScore: profile?.masteryScore ?? 0.0,
      studyStreakDays: profile?.studyStreakDays ?? 0,
      totalTasks: tasks.length,
      completedTasks,
      totalMemories: memories.length,
      activeGoals: goals.length,
      upcomingEventsCount: events.length,
      recentTasks: tasks.slice(0, 5),
      recentMemories: memories.slice(0, 3),
      activeGoalsList: goals.slice(0, 3),
      upcomingEvents: events.slice(0, 3),
    });
  } catch (err) {
    console.error("[Dashboard Summary Error]", err.message);
    return res.status(500).json({ message: "Failed to load dashboard summary" });
  }
});

module.exports = router;
