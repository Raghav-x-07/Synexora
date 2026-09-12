const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Generate signed JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'synexora_super_secret_jwt_key_2026_modern_ai_platform',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new student/user
// @access  Public
router.post(
  '/register',
  [
    body('name', 'Full name is required').trim().notEmpty(),
    body('email', 'Please provide a valid email address').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { name, email, password, major, university } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please log in.',
        });
      }

      // Create new user
      const user = await User.create({
        name,
        email,
        password,
        major: major || 'Computer Science & AI',
        university: university || 'Synexora Institute of Technology',
      });

      const token = generateToken(user._id);

      // Return clean response without password
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        major: user.major,
        university: user.university,
        gpa: user.gpa,
        streak: user.streak,
        semester: user.semester,
        preferences: user.preferences,
        createdAt: user.createdAt,
      };

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully!',
        token,
        user: userResponse,
      });
    } catch (err) {
      console.error('[Register Error]', err);
      return res.status(500).json({
        success: false,
        message: 'Server error during registration. Please try again later.',
        error: err.message,
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    body('email', 'Please provide a valid email address').isEmail().normalizeEmail(),
    body('password', 'Password cannot be empty').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists & select password field
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials.',
        });
      }

      // Match password
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials.',
        });
      }

      const token = generateToken(user._id);

      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        major: user.major,
        university: user.university,
        gpa: user.gpa,
        streak: user.streak,
        semester: user.semester,
        preferences: user.preferences,
        createdAt: user.createdAt,
      };

      return res.status(200).json({
        success: true,
        message: 'Login successful!',
        token,
        user: userResponse,
      });
    } catch (err) {
      console.error('[Login Error]', err);
      return res.status(500).json({
        success: false,
        message: 'Server error during login. Please try again later.',
        error: err.message,
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get currently logged in user profile
// @access  Private (Protected by JWT)
router.get('/me', protect, async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    console.error('[Get /me Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user profile.',
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile data
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, major, university, preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (major) user.major = major;
    if (university) user.university = university;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
    });
  } catch (err) {
    console.error('[Update Profile Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
      error: err.message,
    });
  }
});

module.exports = router;
