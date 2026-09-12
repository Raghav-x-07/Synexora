const mongoose = require("mongoose");

const practiceAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problemId: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      default: "Computer Science",
    },
    topic: {
      type: String,
      default: "Core Concepts",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Adaptive"],
      default: "Medium",
    },
    format: {
      type: String,
      default: "mcq",
    },
    userAnswer: mongoose.Schema.Types.Mixed,
    isCorrect: {
      type: Boolean,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    masteryDelta: {
      type: Number,
      default: 0,
    },
    diagnosticFeedback: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.PracticeAttempt ||
  mongoose.model("PracticeAttempt", practiceAttemptSchema);
