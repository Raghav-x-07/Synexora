const express = require("express");
const router = express.Router();
const Assessment = require("../models/Assessment");
const auth = require("../middleware/auth");
const { getIsConnected } = require("../config/db");
const groqService = require("../services/groqService");

const SEED_ASSESSMENTS = [
  {
    _id: "demo-a1",
    title: "Distributed Systems Raft & Paxos Evaluation",
    subject: "Distributed Systems",
    difficulty: "Hard",
    status: "COMPLETED",
    score: 92,
    totalPoints: 100,
    percentage: 92,
    durationMinutes: 30,
    timeSpentSeconds: 1420,
    questions: [
      {
        id: "q1",
        title: "Leader Election Safety in Raft Consensus",
        topic: "Consensus & Raft",
        difficulty: "Hard",
        points: 20,
        question: "In Raft consensus, how does the voting protocol guarantee that a candidate node with stale/missing log entries cannot be elected as the new cluster leader?",
        options: [
          "By relying on a synchronized hardware clock and NTP timestamps.",
          "Candidates include their last log index and term in RequestVote RPCs; peers reject candidates whose log is less up-to-date than their own.",
          "Followers only vote for candidates with the lowest node ID during split votes.",
          "The previous leader must explicitly sign a cryptographic token transferring leadership."
        ],
        correctIndex: 1,
        userSelectedOption: 1,
        isCorrect: true,
        explanation: "Raft's RequestVote RPC includes candidate term and lastLogIndex.",
        keyConcept: "Election Restriction prevents uncommitted leaders."
      }
    ],
    topicBreakdown: [
      { topic: "Consensus & Raft", total: 10, correct: 9, masteryScore: 92 },
      { topic: "RPC Failure Modes", total: 5, correct: 5, masteryScore: 100 }
    ],
    rubricEvaluation: {
      conceptualAccuracy: 95,
      logicalReasoning: 90,
      distractorAwareness: 92,
    },
    diagnosticSummary: "High conceptual clarity on Raft leader safety and state machine replication. Ready for Byzantine fault tolerance topics.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "demo-a2",
    title: "DBMS Relational Algebra & SQL Mock Assessment",
    subject: "Database Systems",
    difficulty: "Medium",
    status: "COMPLETED",
    score: 72,
    totalPoints: 100,
    percentage: 72,
    durationMinutes: 25,
    timeSpentSeconds: 1200,
    questions: [],
    topicBreakdown: [
      { topic: "Normalization", total: 8, correct: 6, masteryScore: 75 },
      { topic: "Transactions & ACID", total: 6, correct: 4, masteryScore: 66 }
    ],
    rubricEvaluation: {
      conceptualAccuracy: 75,
      logicalReasoning: 70,
      distractorAwareness: 72,
    },
    diagnosticSummary: "Solid understanding of relational algebra; needs more practice with 3NF vs BCNF transitive dependency decomposition.",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

// @route   GET /api/assessments
// @desc    Get user's past and upcoming assessments
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const assessments = await Assessment.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);

    return res.json(assessments);
  } catch (err) {
    console.error("[Assessments GET Error]", err.message);
    return res.status(500).json({ message: "Failed to fetch assessments" });
  }
});

// @route   POST /api/assessments/generate
// @desc    Generate a custom exam from AI service
// @access  Private
router.post("/generate", auth, async (req, res) => {
  try {
    const { subject, topics, questionCount, difficulty, durationMinutes } = req.body;

    const result = await groqService.generateAssessment({
      subject: subject || "Computer Science",
      topics: topics || [],
      questionCount: Number(questionCount) || 3,
      difficulty: difficulty || "Medium",
      durationMinutes: Number(durationMinutes) || 20,
    });

    return res.json(result);
  } catch (err) {
    console.error("Assessment generate error:", err.message);
    res.status(500).json({ error: "Failed to generate assessment" });
  }
});

// @route   POST /api/assessments/submit
// @desc    Grade submitted assessment, compute topic breakdown & store
// @access  Private
router.post("/submit", auth, async (req, res) => {
  try {
    const { title, subject, difficulty, durationMinutes, timeSpentSeconds, questions, userAnswers } = req.body;

    let totalPoints = 0;
    let earnedPoints = 0;
    const gradedQuestions = [];
    const topicMap = {};

    (questions || []).forEach((q, idx) => {
      const selected = userAnswers ? userAnswers[q.id || idx] : null;
      const isCorrect = selected !== null && selected !== undefined && Number(selected) === Number(q.correctIndex);
      const points = q.points || 10;
      totalPoints += points;
      if (isCorrect) earnedPoints += points;

      gradedQuestions.push({
        ...q,
        userSelectedOption: selected,
        isCorrect,
      });

      const topic = q.topic || "General";
      if (!topicMap[topic]) topicMap[topic] = { total: 0, correct: 0 };
      topicMap[topic].total++;
      if (isCorrect) topicMap[topic].correct++;
    });

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    const topicBreakdown = Object.keys(topicMap).map((k) => ({
      topic: k,
      total: topicMap[k].total,
      correct: topicMap[k].correct,
      masteryScore: Math.round((topicMap[k].correct / topicMap[k].total) * 100),
    }));

    const rubricEvaluation = {
      conceptualAccuracy: percentage,
      logicalReasoning: Math.min(100, percentage + (percentage > 70 ? 5 : -5)),
      distractorAwareness: Math.max(20, percentage - 5),
    };

    let diagnosticSummary = `Assessment completed with ${percentage}% score (${earnedPoints}/${totalPoints} pts). `;
    if (percentage >= 80) {
      diagnosticSummary += "Outstanding mastery across evaluated topics. Keep up the high retention streak!";
    } else if (percentage >= 60) {
      diagnosticSummary += "Good foundation. Target targeted practice on lower accuracy subtopics.";
    } else {
      diagnosticSummary += "Key conceptual gaps identified. Recommend initiating an AI Tutor review session.";
    }

    const assessmentData = {
      user: req.user.id,
      title: title || `${subject || "Computer Science"} Diagnostic Assessment`,
      subject: subject || "Computer Science",
      difficulty: difficulty || "Medium",
      status: "COMPLETED",
      durationMinutes: durationMinutes || 20,
      timeSpentSeconds: timeSpentSeconds || 0,
      score: earnedPoints,
      totalPoints,
      percentage,
      questions: gradedQuestions,
      topicBreakdown,
      rubricEvaluation,
      diagnosticSummary,
      createdAt: new Date(),
    };

    if (getIsConnected()) {
      try {
        const assessment = new Assessment(assessmentData);
        await assessment.save();
        return res.json({ success: true, assessment });
      } catch (dbErr) {}
    }

    res.json({
      success: true,
      assessment: { _id: `a-${Date.now()}`, ...assessmentData },
    });
  } catch (err) {
    console.error("Assessment submit error:", err.message);
    res.status(500).json({ error: "Failed to grade and save assessment" });
  }
});

// @route   GET /api/assessments/:id
// @desc    Get assessment detail
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    if (getIsConnected()) {
      try {
        const assessment = await Assessment.findOne({ _id: req.params.id, user: req.user.id });
        if (assessment) return res.json(assessment);
      } catch (dbErr) {}
    }
    const seed = SEED_ASSESSMENTS.find(a => a._id === req.params.id) || SEED_ASSESSMENTS[0];
    res.json(seed);
  } catch (err) {
    const seed = SEED_ASSESSMENTS[0];
    res.json(seed);
  }
});

module.exports = router;
