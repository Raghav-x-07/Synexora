const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema({
  timestamp: { type: String, required: true },
  seconds: { type: Number, required: true },
  title: { type: String, required: true },
  summary: { type: String, default: "" },
  keyTakeaway: { type: String, default: "" },
});

const checkpointSchema = new mongoose.Schema({
  id: { type: String, required: true },
  timestamp: { type: String, required: true },
  seconds: { type: Number, required: true },
  question: { type: String, required: true },
  options: [{ type: String }],
  correctIndex: { type: Number, default: 0 },
  explanation: { type: String, default: "" },
  userSelectedOption: { type: Number },
  isCompleted: { type: Boolean, default: false },
});

const videoLessonSchema = new mongoose.Schema(
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
      default: "Computer Science",
    },
    duration: {
      type: String,
      default: "15:00",
    },
    embedUrl: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    chapters: [chapterSchema],
    checkpoints: [checkpointSchema],
    userNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.VideoLesson ||
  mongoose.model("VideoLesson", videoLessonSchema);
