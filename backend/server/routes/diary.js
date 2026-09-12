const express = require("express");
const router = express.Router();
const DiaryEntry = require("../models/DiaryEntry");
const auth = require("../middleware/auth");
const { getIsConnected } = require("../config/db");
const groqService = require("../services/groqService");

const DEFAULT_DIARY_ENTRIES = [
  {
    _id: "demo-d1",
    reflectionText: "Understood Raft leader election and log replication. Solved 4 practice problems with Synexora AI tutor without mistakes.",
    subject: "Distributed Systems",
    studyHours: 4.5,
    mood: "High Focus",
    sentiment: "High Focus",
    summary: "Understood Raft leader election and log replication. Solved 4 practice problems without mistakes.",
    aiInsight: "Key insight: Raft consensus mastery is now solid at 92%. Ready to tackle network partitions and Byzantine fault models.",
    actionableTip: "Test your edge case handling with the Raft Split-Vote Diagnostic set.",
    keyConceptsReviewed: ["Raft Leader Election", "Log Replication"],
    focusScore: 94,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "demo-d2",
    reflectionText: "DBMS Midterm exam completed. Scored 72. Found functional dependency decompositions difficult under time pressure.",
    subject: "Database Management Systems",
    studyHours: 3.2,
    mood: "Moderate Struggle",
    sentiment: "Moderate Struggle",
    summary: "DBMS Midterm exam completed. Found functional dependency decompositions difficult under time pressure.",
    aiInsight: "Action taken: Synexora automatically updated your learning trajectory to prioritize BCNF matrix drills.",
    actionableTip: "Review Bernstein's 3NF synthesis algorithm to master dependency preservation trade-offs.",
    keyConceptsReviewed: ["BCNF Decomposition", "3NF Synthesis"],
    focusScore: 70,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

// @route   GET /api/diary
// @desc    Get user's diary reflection entries
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const entries = await DiaryEntry.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);

    return res.json(entries);
  } catch (err) {
    console.error("[Diary GET Error]", err.message);
    return res.status(500).json({ message: "Failed to fetch diary entries" });
  }
});

// @route   POST /api/diary
// @desc    Create new reflection, analyze with AI, and save
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { reflectionText, studyHours, subject, mood } = req.body;

    if (!reflectionText || !reflectionText.trim()) {
      return res.status(400).json({ error: "Reflection text is required" });
    }

    let analysis = {};
    try {
      analysis = await groqService.analyzeDiaryReflection({
        reflectionText,
        studyHours: Number(studyHours) || 2.0,
        subject: subject || "Computer Science",
        mood: mood || "High Focus",
      });
    } catch (aiErr) {
      analysis = {
        sentiment: mood || "High Focus",
        summary: reflectionText.slice(0, 160) + (reflectionText.length > 160 ? "..." : ""),
        aiInsight: `Session demonstrated productive engagement in ${subject || "your studies"}.`,
        actionableTip: "Review key definitions in 48 hours to solidify long-term memory.",
        keyConceptsReviewed: [subject || "Core Concepts"],
        focusScore: 85,
      };
    }

    const entryData = {
      user: req.user.id,
      reflectionText,
      subject: subject || "Computer Science",
      studyHours: Number(studyHours) || 2.0,
      mood: mood || "High Focus",
      sentiment: analysis.sentiment || mood || "High Focus",
      summary: analysis.summary || reflectionText,
      aiInsight: analysis.aiInsight || "",
      actionableTip: analysis.actionableTip || "",
      keyConceptsReviewed: analysis.keyConceptsReviewed || [],
      focusScore: analysis.focusScore || 85,
      createdAt: new Date(),
    };

    if (getIsConnected()) {
      try {
        const entry = new DiaryEntry(entryData);
        await entry.save();
        return res.json({ success: true, entry });
      } catch (dbErr) {}
    }

    res.json({
      success: true,
      entry: { _id: `diary-${Date.now()}`, ...entryData },
    });
  } catch (err) {
    console.error("Diary create error:", err.message);
    res.status(500).json({ error: "Failed to save reflection" });
  }
});

// @route   DELETE /api/diary/:id
// @desc    Delete reflection entry
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    if (getIsConnected()) {
      try {
        await DiaryEntry.findOneAndDelete({ _id: req.params.id, user: req.user.id });
      } catch (dbErr) {}
    }
    res.json({ success: true, message: "Entry deleted" });
  } catch (err) {
    console.error("Diary delete error:", err.message);
    res.status(500).json({ error: "Failed to delete entry" });
  }
});

module.exports = router;
