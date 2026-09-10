const mongoose = require("mongoose");

const calendarEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    eventType: {
      type: String,
      enum: ["LECTURE", "AI_STUDY_BLOCK", "EXAM", "MEETING"],
      default: "AI_STUDY_BLOCK",
    },
    roomLocation: {
      type: String,
      default: "Library",
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.CalendarEvent || mongoose.model("CalendarEvent", calendarEventSchema);
