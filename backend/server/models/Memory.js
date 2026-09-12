const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: "Academic Performance",
    },
    title: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    confidenceScore: {
      type: Number,
      default: 1.0,
    },
    isConfirmed: {
      type: Boolean,
      default: true,
    },
    isSensitive: {
      type: Boolean,
      default: false,
    },
    sourceContext: {
      type: String,
      default: "Detected from conversation with Socratic Tutor",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Memory || mongoose.model("Memory", memorySchema);
