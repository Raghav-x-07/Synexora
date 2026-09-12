const express = require("express");
const router = express.Router();
const PracticeAttempt = require("../models/PracticeAttempt");
const auth = require("../middleware/auth");
const { getIsConnected } = require("../config/db");
const groqService = require("../services/groqService");

// @route   POST /api/practice/generate
// @desc    Generate a dynamic adaptive practice problem
// @access  Private
router.post("/generate", auth, async (req, res) => {
  try {
    const { subject, topic, difficulty, formatType } = req.body;
    
    const result = await groqService.generatePracticeProblem({
      subject: subject || "Computer Science",
      topic: topic || null,
      difficulty: difficulty || "Medium",
      formatType: formatType || "mcq",
    });

    return res.json(result);
  } catch (err) {
    console.error("Practice generate error:", err.message);
    res.status(500).json({ error: "Failed to generate practice problem" });
  }
});

// @route   POST /api/practice/hint
// @desc    Get progressive hint for a problem
// @access  Private
router.post("/hint", auth, async (req, res) => {
  try {
    const { problem, hintLevel } = req.body;
    const result = await groqService.generateProgressiveHint({
      problem,
      hintLevel: Number(hintLevel) || 1,
    });
    return res.json(result);
  } catch (err) {
    console.error("Practice hint error:", err.message);
    res.status(500).json({ error: "Failed to get hint" });
  }
});

// @route   POST /api/practice/submit
// @desc    Submit answer, evaluate diagnostics, and save attempt
// @access  Private
router.post("/submit", auth, async (req, res) => {
  try {
    const { problem, userAnswer, userNotes } = req.body;
    
    const evaluation = await groqService.evaluateSubmission({
      problem,
      userAnswer,
      userNotes,
    });

    const attemptData = {
      user: req.user.id,
      problemId: problem.id || "p-" + Date.now(),
      subject: problem.subject || "Computer Science",
      topic: problem.topic || "Core Concepts",
      difficulty: problem.difficulty || "Medium",
      format: problem.format || "mcq",
      userAnswer,
      isCorrect: evaluation.isCorrect,
      score: evaluation.score,
      masteryDelta: evaluation.masteryDelta,
      diagnosticFeedback: evaluation.diagnosticFeedback,
      createdAt: new Date(),
    };

    if (getIsConnected()) {
      try {
        const attempt = new PracticeAttempt(attemptData);
        await attempt.save();
        return res.json({ success: true, evaluation, attempt });
      } catch (dbErr) {}
    }

    res.json({
      success: true,
      evaluation,
      attempt: { _id: `attempt-${Date.now()}`, ...attemptData },
    });
  } catch (err) {
    console.error("Practice submit error:", err.message);
    res.status(500).json({ error: "Failed to evaluate submission" });
  }
});

// @route   GET /api/practice/stats
// @desc    Get practice history, mastery metrics & streak
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    let attempts = [];
    if (getIsConnected()) {
      try {
        attempts = await PracticeAttempt.find({ user: req.user.id })
          .sort({ createdAt: -1 })
          .limit(50);
      } catch (dbErr) {}
    }

    const totalSolved = attempts.length;
    const correctCount = attempts.filter((a) => a.isCorrect).length;
    const accuracy = totalSolved > 0 ? Math.round((correctCount / totalSolved) * 100) : 0;

    let streak = 0;
    for (const a of attempts) {
      if (a.isCorrect) streak++;
      else break;
    }

    const topicMap = {};
    attempts.forEach((a) => {
      if (!topicMap[a.topic]) {
        topicMap[a.topic] = { total: 0, correct: 0, deltaSum: 50 };
      }
      topicMap[a.topic].total++;
      if (a.isCorrect) topicMap[a.topic].correct++;
      topicMap[a.topic].deltaSum = Math.min(100, Math.max(10, topicMap[a.topic].deltaSum + a.masteryDelta));
    });

    const topicMastery = Object.keys(topicMap).map((k) => ({
      topic: k,
      total: topicMap[k].total,
      accuracy: Math.round((topicMap[k].correct / topicMap[k].total) * 100),
      masteryLevel: topicMap[k].deltaSum,
    }));

    res.json({
      totalSolved,
      correctCount,
      accuracy,
      streak,
      topicMastery,
      recentAttempts: attempts.slice(0, 10),
    });
  } catch (err) {
    console.error("Practice stats error:", err.message);
    res.status(500).json({ error: "Failed to fetch practice statistics" });
  }
});

module.exports = router;
