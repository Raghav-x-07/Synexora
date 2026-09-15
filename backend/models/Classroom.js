const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  authorName: {
    type: String,
    required: true,
  },
  authorEmail: {
    type: String,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const announcementSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  authorName: {
    type: String,
    required: true,
  },
  authorEmail: {
    type: String,
  },
  content: {
    type: String,
    required: true,
  },
  attachments: [
    {
      title: String,
      url: String,
      type: {
        type: String,
        enum: ['link', 'file', 'youtube', 'drive'],
        default: 'link',
      },
    },
  ],
  comments: [commentSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const classworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['assignment', 'material', 'quiz', 'question'],
    default: 'assignment',
  },
  topic: {
    type: String,
    default: 'General',
  },
  points: {
    type: Number,
    default: 100,
  },
  dueDate: {
    type: Date,
  },
  attachments: [
    {
      title: String,
      url: String,
      type: {
        type: String,
        enum: ['link', 'file', 'youtube', 'drive'],
        default: 'link',
      },
    },
  ],
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const classroomSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Classroom title is required'],
      trim: true,
    },
    section: {
      type: String,
      default: '',
      trim: true,
    },
    subject: {
      type: String,
      default: 'General',
      trim: true,
    },
    room: {
      type: String,
      default: '',
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    bannerTheme: {
      type: String,
      enum: ['emerald', 'indigo', 'rose', 'amber', 'cyan', 'purple', 'slate'],
      default: 'emerald',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    announcements: [announcementSchema],
    classwork: [classworkSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Classroom', classroomSchema);
