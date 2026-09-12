const express = require("express");
const router = express.Router();
const LearningPath = require("../models/LearningPath");
const auth = require("../middleware/auth");
const { getIsConnected } = require("../config/db");
const groqService = require("../services/groqService");

const DEFAULT_PATH_DATA = {
  title: "DBMS & Distributed Architecture Mastery Trajectory",
  subject: "Database Management Systems",
  goal: "Target: 90%+ on Midterms",
  targetGrade: "A (90%+)",
  estimatedWeeks: 4,
  weeklyHours: 10,
  totalMilestones: 5,
  completedMilestones: 2,
  progressPercentage: 40,
  isActive: true,
  milestones: [
    {
      id: "m1",
      order: 1,
      title: "Relational Algebra & Armstrong Axioms",
      description: "Soundness and completeness of Armstrong Axioms verified with minimal canonical cover proofs.",
      status: "COMPLETED",
      estimatedHours: 6,
      masteryScore: 95,
      concepts: [
        "Attribute Closure Calculation",
        "Minimal Cover (Canonical Cover)",
        "Armstrong's Axioms"
      ],
      recommendedPractice: "DBMS Normalization Practice Set"
    },
    {
      id: "m2",
      order: 2,
      title: "BCNF Decomposition vs 3NF Synthesis",
      description: "Lossless join property and dependency preservation trade-offs using Bernstein's 3NF synthesis algorithm.",
      status: "COMPLETED",
      estimatedHours: 8,
      masteryScore: 88,
      concepts: [
        "Boyce-Codd Normal Form (BCNF)",
        "Third Normal Form (3NF) Synthesis",
        "Lossless Join Verification"
      ],
      recommendedPractice: "BCNF Decomposition Diagnostics"
    },
    {
      id: "m3",
      order: 3,
      title: "Cost-Based Query Execution Plans & Heuristics",
      description: "Relational algebra operator pushing, B+ tree cluster index scans, and join cost estimation formulas.",
      status: "IN_PROGRESS",
      estimatedHours: 10,
      masteryScore: 65,
      concepts: [
        "B+ Tree Leaf Insertion & Rebalancing",
        "Clustered vs Unclustered Index Scans",
        "Relational Algebra Operator Pushing"
      ],
      recommendedPractice: "B+ Tree Height & I/O Cost Analysis"
    },
    {
      id: "m4",
      order: 4,
      title: "Transaction Concurrency & Strict 2PL Protocol",
      description: "Conflict serializability precedence graphs, strict two-phase locking, and deadlock resolution mechanisms.",
      status: "UPCOMING",
      estimatedHours: 8,
      masteryScore: 0,
      concepts: [
        "Conflict vs View Serializability",
        "Strict Two-Phase Locking (2PL)",
        "Wait-Die vs Wound-Wait Deadlock Prevention"
      ],
      recommendedPractice: "Precedence Graph Cycle Detection"
    },
    {
      id: "m5",
      order: 5,
      title: "Distributed Transactions & 2PC Consensus",
      description: "Two-Phase Commit (2PC), Paxos/Raft consensus logs, and Byzantine fault tolerance.",
      status: "LOCKED",
      estimatedHours: 12,
      masteryScore: 0,
      concepts: [
        "Two-Phase Commit (Prepare/Commit phases)",
        "Split-brain prevention in Quorum systems",
        "CAP Theorem trade-offs"
      ],
      recommendedPractice: "Distributed Consensus Diagnostic Exam"
    }
  ]
};

// @route   GET /api/learning-path
// @desc    Get user's current active learning trajectory
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const path = await LearningPath.findOne({ user: req.user.id, isActive: true });
    return res.json(path || null);
  } catch (err) {
    console.error("[LearningPath GET Error]", err.message);
    return res.status(500).json({ message: "Failed to fetch learning path" });
  }
});

// @route   POST /api/learning-path/generate
// @desc    Generate a new personalized learning path
// @access  Private
router.post("/generate", auth, async (req, res) => {
  try {
    const { subject, goal, targetDate, weakAreas, weeklyHours } = req.body;

    let generatedData;
    try {
      const resData = await groqService.generateAdaptiveLearningPath({
        subject: subject || "Computer Science",
        goal: goal || "Score 90%+ on Midterm",
        weakAreas: weakAreas || [],
        weeklyHours: weeklyHours || 10,
      });
      generatedData = resData.learningPath;
    } catch (aiErr) {
      generatedData = {
        title: `${subject || "Computer Science"} Accelerated Trajectory`,
        subject: subject || "Computer Science",
        targetGrade: "A (90%+)",
        estimatedWeeks: 4,
        totalMilestones: 4,
        milestones: [
          {
            id: "m1",
            order: 1,
            title: "Foundational Principles & Core Terminology",
            description: "Master foundational theorems and problem templates.",
            status: "COMPLETED",
            estimatedHours: 6,
            masteryScore: 90,
            concepts: ["Axiomatic Definitions", "Basic Operations"],
            recommendedPractice: "Core Diagnostic Set"
          },
          {
            id: "m2",
            order: 2,
            title: "Intermediate Optimization & Trade-offs",
            description: "Analyze complexity bounds and edge conditions.",
            status: "IN_PROGRESS",
            estimatedHours: 8,
            masteryScore: 60,
            concepts: ["Complexity Optimization", "Edge Case Handling"],
            recommendedPractice: "Intermediate Practice Suite"
          }
        ]
      };
    }

    // Deactivate previous active path
    await LearningPath.updateMany({ user: req.user.id }, { isActive: false });

    const total = generatedData.milestones ? generatedData.milestones.length : 0;
    const completed = generatedData.milestones ? generatedData.milestones.filter(m => m.status === "COMPLETED").length : 0;
    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const newPath = new LearningPath({
      user: req.user.id,
      title: generatedData.title,
      subject: generatedData.subject || subject,
      goal: goal || "Target A Grade",
      targetGrade: generatedData.targetGrade || "A (90%+)",
      estimatedWeeks: generatedData.estimatedWeeks || 4,
      weeklyHours: weeklyHours || 10,
      totalMilestones: total,
      completedMilestones: completed,
      progressPercentage,
      isActive: true,
      milestones: generatedData.milestones || [],
    });

    await newPath.save();
    res.json({ success: true, learningPath: newPath });
  } catch (err) {
    console.error("Learning path generate error:", err.message);
    res.status(500).json({ error: "Failed to generate learning path" });
  }
});

// @route   PATCH /api/learning-path/milestone/:id
// @desc    Update milestone status and recalculate progress
// @access  Private
router.patch("/milestone/:id", auth, async (req, res) => {
  try {
    const { status, masteryScore } = req.body;
    const path = await LearningPath.findOne({ user: req.user.id, isActive: true });
    if (!path) {
      return res.status(404).json({ error: "No active learning path found" });
    }

    const milestone = path.milestones.find(m => m.id === req.params.id || m._id.toString() === req.params.id);
    if (!milestone) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    if (status) milestone.status = status;
    if (masteryScore !== undefined) milestone.masteryScore = masteryScore;

    // Recalculate completed count and progress percentage
    const completed = path.milestones.filter(m => m.status === "COMPLETED").length;
    path.completedMilestones = completed;
    path.progressPercentage = Math.round((completed / path.milestones.length) * 100);

    await path.save();
    res.json({ success: true, learningPath: path });
  } catch (err) {
    console.error("Milestone update error:", err.message);
    res.status(500).json({ error: "Failed to update milestone" });
  }
});

module.exports = router;
