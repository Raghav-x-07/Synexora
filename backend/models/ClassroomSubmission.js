const mongoose = require('mongoose');

const classroomSubmissionSchema = new mongoose.Schema(
  {
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
    },
    classworkId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    studentEmail: {
      type: String,
    },
    submissionType: {
      type: String,
      enum: ['text', 'link', 'file'],
      default: 'link',
    },
    content: {
      type: String,
      required: true,
    },
    attachments: [
      {
        title: String,
        url: String,
      },
    ],
    status: {
      type: String,
      enum: ['submitted', 'graded', 'returned', 'late'],
      default: 'submitted',
    },
    grade: {
      type: Number,
      default: null,
    },
    feedback: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate submissions by indexing classroomId + classworkId + studentId
classroomSubmissionSchema.index({ classroomId: 1, classworkId: 1, studentId: 1 });

module.exports = mongoose.model('ClassroomSubmission', classroomSubmissionSchema);
