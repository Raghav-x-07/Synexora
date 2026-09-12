const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  id: { type: String, required: true },
  order: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  status: {
    type: String,
    enum: ["COMPLETED", "IN_PROGRESS", "UPCOMING", "LOCKED"],
    default: "UPCOMING",
  },
  estimatedHours: { type: Number, default: 6 },
  masteryScore: { type: Number, default: 0 },
  concepts: [{ type: String }],
  recommendedPractice: { type: String, default: "" },
});

const learningPathSchema = new mongoose.Schema(
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
      default: "Database Management Systems",
    },
    goal: {
      type: String,
      default: "Score 90%+ on Midterm",
    },
    targetGrade: {
      type: String,
      default: "A (90%+)",
    },
    estimatedWeeks: {
      type: Number,
      default: 4,
    },
    weeklyHours: {
      type: Number,
      default: 10,
    },
    totalMilestones: {
      type: Number,
      default: 5,
    },
    completedMilestones: {
      type: Number,
      default: 0,
    },
    progressPercentage: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    milestones: [milestoneSchema],
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.LearningPath ||
  mongoose.model("LearningPath", learningPathSchema);
