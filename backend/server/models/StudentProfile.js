const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    major: {
      type: String,
      default: "Computer Science & Engineering",
    },
    academicYear: {
      type: String,
      default: "Year 3",
    },
    gpa: {
      type: Number,
      default: 3.85,
    },
    masteryScore: {
      type: Number,
      default: 84.0,
    },
    studyStreakDays: {
      type: Number,
      default: 14,
    },
    learningStylePreference: {
      type: String,
      default: "Interactive Code Traces & Socratic Hints",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.StudentProfile || mongoose.model("StudentProfile", studentProfileSchema);
