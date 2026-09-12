const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    size: {
      type: String,
      default: '500 KB',
    },
    fileType: {
      type: String,
      default: 'pdf',
    },
    uploadDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    extractedText: {
      type: String,
      default: '',
    },
    chunks: [
      {
        chunkIndex: Number,
        text: String,
      },
    ],
    summary: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Document', documentSchema);
