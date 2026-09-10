const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
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
    courseCode: {
      type: String,
      default: "GENERAL",
    },
    content: {
      type: String,
      required: true,
    },
    isAiSuggested: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Note || mongoose.model("Note", noteSchema);
