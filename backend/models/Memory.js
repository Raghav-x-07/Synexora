const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    concept: {
      type: String,
      required: [true, 'Concept title is required'],
      trim: true,
    },
    definition: {
      type: String,
      required: [true, 'Definition is required'],
    },
    course: {
      type: String,
      default: 'General',
      trim: true,
    },
    source: {
      type: String,
      enum: ['learning-ai', 'rag', 'manual'],
      default: 'manual',
    },
    flowchart: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    videoUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Memory', memorySchema);
