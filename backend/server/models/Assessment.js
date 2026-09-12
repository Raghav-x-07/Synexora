const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      default: "Computer Science",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Adaptive"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["IN_PROGRESS", "COMPLETED", "SCHEDULED"],
      default: "COMPLETED",
    },
    durationMinutes: {
      type: Number,
      default: 20,
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 100,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    questions: [
      {
        id: String,
        title: String,
        topic: String,
        difficulty: String,
        points: Number,
        question: String,
        options: [String],
        correctIndex: Number,
        userSelectedOption: Number,
        isCorrect: Boolean,
        explanation: String,
        keyConcept: String,
      },
    ],
    topicBreakdown: [
      {
        topic: String,
        total: Number,
        correct: Number,
        masteryScore: Number,
      },
    ],
    rubricEvaluation: {
      conceptualAccuracy: { type: Number, default: 0 },
      logicalReasoning: { type: Number, default: 0 },
      distractorAwareness: { type: Number, default: 0 },
    },
    diagnosticSummary: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Assessment || mongoose.model("Assessment", assessmentSchema);
