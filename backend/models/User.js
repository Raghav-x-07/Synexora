const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: [
        'super_admin',
        'institution_admin',
        'institution_teacher',
        'institution_student',
        'personal_student',
        'student',
        'educator',
        'admin',
      ],
      default: 'personal_student',
    },
    accountStatus: {
      type: String,
      enum: ['active', 'pending_approval', 'suspended'],
      default: 'active',
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      default: null,
    },
    institutionCode: {
      type: String,
      default: '',
      trim: true,
      uppercase: true,
    },
    studentIdNumber: {
      type: String,
      default: '',
      trim: true,
    },
    facultyIdNumber: {
      type: String,
      default: '',
      trim: true,
    },
    designation: {
      type: String,
      default: 'Faculty / Lecturer',
      trim: true,
    },
    department: {
      type: String,
      default: 'General',
      trim: true,
    },
    batchYear: {
      type: String,
      default: '2024-2028',
      trim: true,
    },
    moduleAccess: {
      aiTutor: { type: Boolean, default: true },
      documentRag: { type: Boolean, default: true },
      classrooms: { type: Boolean, default: true },
      evaluations: { type: Boolean, default: true },
      memoryRecall: { type: Boolean, default: true },
    },
    major: {
      type: String,
      default: 'Computer Science & AI',
      trim: true,
    },
    university: {
      type: String,
      default: 'Synexora Institute of Technology',
      trim: true,
    },
    semester: {
      type: Number,
      default: 4,
    },
    gpa: {
      type: Number,
      default: 3.85,
    },
    streak: {
      type: Number,
      default: 7,
    },
    avatar: {
      type: String,
      default: '',
    },
    preferences: {
      learningStyle: {
        type: String,
        enum: ['visual', 'socratic', 'hands-on', 'fast-paced'],
        default: 'socratic',
      },
      dailyStudyGoalMinutes: {
        type: Number,
        default: 120,
      },
      notificationsEnabled: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
