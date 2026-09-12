const mongoose = require('mongoose');

const studyLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: 1,
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    topic: {
      type: String,
      required: [true, 'Topic / Notes are required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StudyLog', studyLogSchema);
