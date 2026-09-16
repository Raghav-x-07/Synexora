const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Institution = require('../models/Institution');
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

const mongoose = require('mongoose');

// Auto-seed default Super Admin on first launch
const seedSuperAdminIfNeeded = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return;
    }
    const adminExists = await User.findOne({
      $or: [{ role: 'super_admin' }, { email: 'admin@synexora.com' }],
    });

    let superAdmin = adminExists;
    if (!adminExists) {
      superAdmin = await User.create({
        name: 'Super Administrator',
        email: 'admin@synexora.com',
        password: 'admin123',
        role: 'super_admin',
        accountStatus: 'active',
        major: 'Platform Administration',
        university: 'Synexora Central Command',
        moduleAccess: {
          aiTutor: true,
          documentRag: true,
          classrooms: true,
          evaluations: true,
          memoryRecall: true,
        },
      });
      console.log('👑 [Auto-Seed] Master Super Admin created: admin@synexora.com / admin123');
    }

    // Create a default institution if it does not exist
    let demoInst = await Institution.findOne({ code: 'INST-DEMO' });
    if (!demoInst) {
      demoInst = await Institution.create({
        name: 'Synexora University & Technology Institute',
        code: 'INST-DEMO',
        domain: '@synexora.edu',
        plan: 'enterprise',
        maxSeats: 500,
        usedSeats: 2,
        departments: ['Computer Science & AI', 'Data Engineering', 'Cybersecurity', 'Business & Tech'],
        status: 'active',
        adminUser: superAdmin?._id,
      });
      console.log('🏛️ [Auto-Seed] Demo Institution created with Code: INST-DEMO');
    }

    // Seed Demo Institution Admin
    const instAdminExists = await User.findOne({ email: 'admin@synexora.edu' });
    if (!instAdminExists) {
      const instAdmin = await User.create({
        name: 'Dr. Sarah Connor (Dean)',
        email: 'admin@synexora.edu',
        password: 'admin123',
        role: 'institution_admin',
        accountStatus: 'active',
        institutionId: demoInst._id,
        institutionCode: 'INST-DEMO',
        department: 'Computer Science & AI',
        major: 'Computer Science',
        university: demoInst.name,
      });
      demoInst.adminUser = instAdmin._id;
      await demoInst.save();
      console.log('🏛️ [Auto-Seed] Demo Institution Admin created: admin@synexora.edu / admin123');
    }

    // Seed Demo Campus Student
    const studentExists = await User.findOne({ email: 'student@synexora.edu' });
    if (!studentExists) {
      await User.create({
        name: 'Alex Rivera (Campus Student)',
        email: 'student@synexora.edu',
        password: 'student123',
        role: 'institution_student',
        accountStatus: 'active',
        institutionId: demoInst._id,
        institutionCode: 'INST-DEMO',
        studentIdNumber: 'CS-2026-042',
        department: 'Computer Science & AI',
        major: 'Computer Science & AI',
        university: demoInst.name,
      });
      console.log('🎓 [Auto-Seed] Demo Campus Student created: student@synexora.edu / student123');
    }

    // Seed Demo Personal Learner
    const learnerExists = await User.findOne({ email: 'learner@example.com' });
    if (!learnerExists) {
      await User.create({
        name: 'Jordan Lee (Self Learner)',
        email: 'learner@example.com',
        password: 'student123',
        role: 'personal_student',
        accountStatus: 'active',
        major: 'General Studies',
        university: 'Independent Learner',
      });
      console.log('👤 [Auto-Seed] Demo Personal Learner created: learner@example.com / student123');
    }
  } catch (err) {
    console.warn('[Seed Super Admin Warning]:', err.message);
  }
};

mongoose.connection.on('connected', () => {
  seedSuperAdminIfNeeded();
});
if (mongoose.connection.readyState === 1) {
  seedSuperAdminIfNeeded();
}

// Helper to determine redirect path based on role
const getRoleDefaultPath = (role) => {
  if (role === 'super_admin' || role === 'admin') return '/admin';
  if (role === 'institution_admin') return '/institution-portal';
  return '/dashboard';
};

// @route   POST /api/auth/register
// @desc    Register a new user (Personal Student, Institutional Student, or Institution Admin)
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

    const {
      name,
      email,
      password,
      role = 'personal_student',
      major,
      university,
      institutionCode,
      studentIdNumber,
      department,
      batchYear,
      institutionName,
    } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please log in.',
        });
      }

      let institutionId = null;
      let assignedUniversity = university || 'Synexora Institute of Technology';
      let assignedDept = department || major || 'General';
      let initialStatus = 'active';

      // 1. Institutional Student Registration
      if (role === 'institution_student') {
        if (!institutionCode || !institutionCode.trim()) {
          return res.status(400).json({
            success: false,
            message: 'An Institution Enrollment Code is required for institutional student signup.',
          });
        }

        const institution = await Institution.findOne({
          code: institutionCode.trim().toUpperCase(),
          status: 'active',
        });

        if (!institution) {
          return res.status(404).json({
            success: false,
            message: 'Invalid or inactive institution code. Please check with your campus administrator.',
          });
        }

        if (institution.usedSeats >= institution.maxSeats) {
          return res.status(400).json({
            success: false,
            message: `Seat capacity limit reached for ${institution.name}. Contact your campus administrator.`,
          });
        }

        institutionId = institution._id;
        assignedUniversity = institution.name;
        institution.usedSeats += 1;
        await institution.save();
      }

      // 2. Institution Admin Registration
      if (role === 'institution_admin') {
        const instName = institutionName || university || `${name}'s Academy`;
        let code = `INST-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        const newInst = await Institution.create({
          name: instName.trim(),
          code,
          domain: email.split('@')[1] ? `@${email.split('@')[1]}` : '',
          plan: 'professional',
          maxSeats: 250,
          usedSeats: 0,
          departments: ['Computer Science', 'Information Systems', 'Business'],
          status: 'active',
        });

        institutionId = newInst._id;
        assignedUniversity = newInst.name;
      }

      // Create new user
      const user = await User.create({
        name,
        email,
        password,
        role,
        accountStatus: initialStatus,
        institutionId,
        institutionCode: institutionCode ? institutionCode.trim().toUpperCase() : '',
        studentIdNumber: studentIdNumber ? studentIdNumber.trim() : '',
        department: assignedDept,
        batchYear: batchYear || '2024-2028',
        major: assignedDept,
        university: assignedUniversity,
      });

      // If institution admin, link back
      if (role === 'institution_admin' && institutionId) {
        await Institution.findByIdAndUpdate(institutionId, { adminUser: user._id });
      }

      const token = generateToken(user._id);

      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        institutionId: user.institutionId,
        institutionCode: user.institutionCode,
        studentIdNumber: user.studentIdNumber,
        department: user.department,
        major: user.major,
        university: user.university,
        gpa: user.gpa,
        streak: user.streak,
        semester: user.semester,
        preferences: user.preferences,
        moduleAccess: user.moduleAccess,
        defaultPath: getRoleDefaultPath(user.role),
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
// @desc    Authenticate user, check Super Admin approval/status & get token
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
      const user = await User.findOne({ email }).select('+password').populate('institutionId', 'name code status bannerTheme');
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

      // Super Admin Access Check
      if (user.accountStatus === 'suspended') {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: Your account has been suspended by the Super Administrator. Please contact support.',
        });
      }

      if (user.accountStatus === 'pending_approval') {
        return res.status(403).json({
          success: false,
          message: 'Access Pending: Your registration is awaiting approval by the Super Administrator.',
        });
      }

      // Check if affiliated institution is suspended
      if (user.institutionId && user.institutionId.status === 'suspended') {
        return res.status(403).json({
          success: false,
          message: 'Access Restricted: Your campus license has been suspended by the Super Administrator.',
        });
      }

      const token = generateToken(user._id);

      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        institutionId: user.institutionId,
        institutionCode: user.institutionCode,
        studentIdNumber: user.studentIdNumber,
        department: user.department,
        major: user.major,
        university: user.university,
        gpa: user.gpa,
        streak: user.streak,
        semester: user.semester,
        preferences: user.preferences,
        moduleAccess: user.moduleAccess,
        defaultPath: getRoleDefaultPath(user.role),
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
// @desc    Get currently logged in user profile with role & institution info
// @access  Private (Protected by JWT)
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('institutionId', 'name code status bannerTheme maxSeats usedSeats');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const userResponse = {
      ...user.toObject(),
      defaultPath: getRoleDefaultPath(user.role),
    };

    return res.status(200).json({
      success: true,
      user: userResponse,
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
    const { name, major, university, department, studentIdNumber, preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (major) user.major = major;
    if (department) user.department = department;
    if (studentIdNumber) user.studentIdNumber = studentIdNumber;
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
