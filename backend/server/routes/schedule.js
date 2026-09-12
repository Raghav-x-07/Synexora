const express = require("express");
const router = express.Router();
const CalendarEvent = require("../models/CalendarEvent");
const Task = require("../models/Task");
const PracticeAttempt = require("../models/PracticeAttempt");
const auth = require("../middleware/auth");
const axios = require("../utils/aiClient");
const { getIsConnected } = require("../config/db");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000/api/v1";

const DEFAULT_REMINDERS = [
  {
    id: "rem-1",
    title: "Impending CS301 Midterm Assessment",
    urgency: "HIGH",
    message: "Your DBMS & Distributed Systems exam is scheduled in 3 days. Your mastery in 'Transaction Concurrency & Strict 2PL' is 0%.",
    actionLabel: "Practice Concurrency (10 Qs)",
    actionUrl: "/app/practice",
    targetTopic: "Transaction Concurrency",
  },
  {
    id: "rem-2",
    title: "Spaced Repetition Memory Consolidation",
    urgency: "MEDIUM",
    message: "It has been 4 days since you mastered 'BCNF Normalization'. A 5-minute refresher will lock in long-term memory retention to 98%.",
    actionLabel: "Quick 5-Min Refresher",
    actionUrl: "/app/practice",
    targetTopic: "BCNF Decomposition",
  },
];

// @route   GET /api/schedule/reminders
// @desc    Get contextual smart study reminders
// @access  Private
router.get("/reminders", auth, async (req, res) => {
  try {
    const upcomingEvents = await CalendarEvent.find({ user: req.user.id }).limit(10);
    const lowMasteryAttempts = await PracticeAttempt.find({ user: req.user.id, isCorrect: false }).limit(5);

    try {
      const response = await axios.post(`${AI_SERVICE_URL}/adaptive/smart-reminders`, {
        upcomingEvents,
        weakTopics: lowMasteryAttempts,
      }, { timeout: 6000 });
      return res.json(response.data.reminders || []);
    } catch (aiErr) {
      return res.json([]);
    }
  } catch (err) {
    console.error("[Schedule Reminders GET Error]", err.message);
    return res.json([]);
  }
});

// @route   POST /api/schedule/auto-schedule
// @desc    Intelligently generate and populate AI study blocks into calendar
// @access  Private
router.post("/auto-schedule", auth, async (req, res) => {
  try {
    const { weeklyHours } = req.body;
    let existingEvents = [];
    let tasks = [];

    if (getIsConnected()) {
      try {
        existingEvents = await CalendarEvent.find({ user: req.user.id });
        tasks = await Task.find({ user: req.user.id, status: { $ne: "DONE" } });
      } catch (dbErr) {}
    }

    let recommendedBlocks = [];
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/adaptive/optimize-schedule`, {
        calendarEvents: existingEvents,
        tasks,
        weeklyStudyGoalHours: weeklyHours || 12,
      }, { timeout: 7000 });
      recommendedBlocks = response.data.recommendedBlocks;
    } catch (aiErr) {
      recommendedBlocks = [
        {
          title: "Synexora Auto-Scheduled: B+ Tree & Indexing Deep Work",
          time: "14:00 - 15:30",
          date: "Today",
          type: "AI Study Block",
          room: "Library Quiet Zone",
          durationMinutes: 90,
        },
        {
          title: "Synexora Auto-Scheduled: Graph Algorithms Practice",
          time: "16:30 - 17:30",
          date: "Tomorrow",
          type: "AI Study Block",
          room: "Online / Study Pod",
          durationMinutes: 60,
        },
        {
          title: "Synexora Auto-Scheduled: OS Deadlock Coffman Conditions",
          time: "10:00 - 11:30",
          date: "Friday",
          type: "AI Study Block",
          room: "Study Room 4B",
          durationMinutes: 90,
        },
      ];
    }

    // Save scheduled blocks to CalendarEvent collection if connected
    const createdEvents = [];
    for (const b of recommendedBlocks) {
      const eventObj = {
        user: req.user.id,
        title: b.title,
        time: b.time,
        type: "AI Study Block",
        room: b.room || "Library",
        date: new Date(),
      };
      if (getIsConnected()) {
        try {
          const event = new CalendarEvent(eventObj);
          await event.save();
          createdEvents.push(event);
        } catch (dbErr) {
          createdEvents.push({ _id: `ev-${Date.now()}-${Math.random()}`, ...eventObj });
        }
      } else {
        createdEvents.push({ _id: `ev-${Date.now()}-${Math.random()}`, ...eventObj });
      }
    }

    res.json({
      success: true,
      scheduledCount: createdEvents.length,
      createdEvents,
    });
  } catch (err) {
    console.error("Auto schedule error:", err.message);
    res.status(500).json({ error: "Failed to optimize schedule" });
  }
});

module.exports = router;
