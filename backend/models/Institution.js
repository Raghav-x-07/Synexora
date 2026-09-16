const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    domain: {
      type: String,
      default: '',
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    bannerTheme: {
      type: String,
      enum: ['emerald', 'indigo', 'rose', 'amber', 'cyan', 'purple', 'slate'],
      default: 'emerald',
    },
    plan: {
      type: String,
      enum: ['starter', 'professional', 'enterprise'],
      default: 'professional',
    },
    maxSeats: {
      type: Number,
      default: 500,
    },
    usedSeats: {
      type: Number,
      default: 0,
    },
    departments: {
      type: [String],
      default: ['Computer Science', 'Data Science & AI', 'Information Technology', 'Business & Management'],
    },
    status: {
      type: String,
      enum: ['active', 'pending_approval', 'suspended'],
      default: 'active',
    },
    modulePermissions: {
      aiTutor: { type: Boolean, default: true },
      documentRag: { type: Boolean, default: true },
      classrooms: { type: Boolean, default: true },
      evaluations: { type: Boolean, default: true },
      memoryRecall: { type: Boolean, default: true },
    },
    adminUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    contactEmail: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Institution', institutionSchema);
