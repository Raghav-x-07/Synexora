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
      default: "General Studies",
    },
    academicYear: {
      type: String,
      default: "Year 1",
    },
    gpa: {
      type: Number,
      default: 0.0,
    },
    masteryScore: {
      type: Number,
      default: 0.0,
    },
    studyStreakDays: {
      type: Number,
      default: 0,
    },
    learningStylePreference: {
      type: String,
      default: "Socratic Guidance & Practice",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.StudentProfile || mongoose.model("StudentProfile", studentProfileSchema);
