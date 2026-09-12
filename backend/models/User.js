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
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
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
      enum: ['student', 'educator', 'admin'],
      default: 'student',
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
