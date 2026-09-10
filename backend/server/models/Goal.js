const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
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
    description: {
      type: String,
      default: "",
    },
    targetDate: {
      type: Date,
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["IN_PROGRESS", "COMPLETED", "PAUSED"],
      default: "IN_PROGRESS",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Goal || mongoose.model("Goal", goalSchema);
