const mongoose = require("mongoose");

const diaryEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reflectionText: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      default: "Computer Science",
    },
    studyHours: {
      type: Number,
      default: 2.0,
    },
    mood: {
      type: String,
      enum: ["High Focus", "Breakthrough", "Moderate Struggle", "Fatigued", "Focused"],
      default: "High Focus",
    },
    sentiment: {
      type: String,
      default: "High Focus",
    },
    summary: {
      type: String,
      default: "",
    },
    aiInsight: {
      type: String,
      default: "",
    },
    actionableTip: {
      type: String,
      default: "",
    },
    keyConceptsReviewed: [{ type: String }],
    focusScore: {
      type: Number,
      default: 85,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.DiaryEntry || mongoose.model("DiaryEntry", diaryEntrySchema);
