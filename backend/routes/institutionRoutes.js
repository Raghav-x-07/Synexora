const express = require('express');
const User = require('../models/User');
const Institution = require('../models/Institution');
const Classroom = require('../models/Classroom');
const Assessment = require('../models/Assessment');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware: Require Institution Admin role or Super Admin
const requireInstitutionAdmin = async (req, res, next) => {
  if (
    req.user &&
    (req.user.role === 'institution_admin' ||
      req.user.role === 'super_admin' ||
      req.user.role === 'admin')
  ) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Institution Administrator privileges required.',
    });
  }
};

// @route   POST /api/institutions/verify-code
// @desc    Verify if an institution code is valid and active during student registration
// @access  Public
router.post('/verify-code', async (req, res) => {
  const { code } = req.body;

  if (!code || !code.trim()) {
    return res.status(400).json({ success: false, message: 'Institution code is required.' });
  }

  try {
    const institution = await Institution.findOne({
      code: code.trim().toUpperCase(),
      status: 'active',
    }).select('name code departments bannerTheme maxSeats usedSeats logo');

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'No active institution found matching this code. Please check with your campus administrator.',
      });
    }

    if (institution.usedSeats >= institution.maxSeats) {
      return res.status(400).json({
        success: false,
        message: 'This institution has reached its maximum student seat limit. Please contact your campus administrator.',
      });
    }

    return res.status(200).json({
      success: true,
      institution: {
        _id: institution._id,
        name: institution.name,
        code: institution.code,
        departments: institution.departments,
        bannerTheme: institution.bannerTheme,
        availableSeats: institution.maxSeats - institution.usedSeats,
      },
    });
  } catch (err) {
    console.error('[Verify Institution Code Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify institution code.',
      error: err.message,
    });
  }
});

// @route   GET /api/institutions/my-institution
// @desc    Get current user's institution details
// @access  Private
router.get('/my-institution', protect, async (req, res) => {
  try {
    let institution;
    if (req.user.institutionId) {
      institution = await Institution.findById(req.user.institutionId).populate('adminUser', 'name email');
    } else if (req.user.institutionCode) {
      institution = await Institution.findOne({ code: req.user.institutionCode }).populate('adminUser', 'name email');
    } else if (req.user.role === 'institution_admin') {
      institution = await Institution.findOne({ adminUser: req.user._id }).populate('adminUser', 'name email');
    }

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'No institution linked to your account.',
      });
    }

    // Refresh seat count
    const studentCount = await User.countDocuments({
      institutionId: institution._id,
      accountStatus: 'active',
    });

    if (institution.usedSeats !== studentCount) {
      institution.usedSeats = studentCount;
      await institution.save();
    }

    return res.status(200).json({
      success: true,
      institution,
    });
  } catch (err) {
    console.error('[Get My Institution Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch institution details.',
      error: err.message,
    });
  }
});

// @route   PUT /api/institutions/my-institution
// @desc    Update institution settings & departments
// @access  Private (Institution Admin)
router.put('/my-institution', protect, requireInstitutionAdmin, async (req, res) => {
  const { name, domain, departments, phone, address, bannerTheme } = req.body;

  try {
    let institution = await Institution.findOne({
      $or: [{ _id: req.user.institutionId }, { adminUser: req.user._id }],
    });

    if (!institution) {
      return res.status(404).json({ success: false, message: 'Institution not found.' });
    }

    if (name) institution.name = name.trim();
    if (domain) institution.domain = domain.trim();
    if (Array.isArray(departments)) institution.departments = departments;
    if (phone) institution.phone = phone.trim();
    if (address) institution.address = address.trim();
    if (bannerTheme) institution.bannerTheme = bannerTheme;

    await institution.save();

    return res.status(200).json({
      success: true,
      message: 'Institution details updated successfully.',
      institution,
    });
  } catch (err) {
    console.error('[Update Institution Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update institution.',
      error: err.message,
    });
  }
});

// @route   GET /api/institutions/my-institution/students
// @desc    Get student roster for the institution
// @access  Private (Institution Admin)
router.get('/my-institution/students', protect, requireInstitutionAdmin, async (req, res) => {
  const { department, search } = req.query;

  try {
    let institution = await Institution.findOne({
      $or: [{ _id: req.user.institutionId }, { adminUser: req.user._id }],
    });

    if (!institution) {
      return res.status(404).json({ success: false, message: 'Institution not found.' });
    }

    const query = {
      institutionId: institution._id,
      role: 'institution_student',
    };

    if (department && department !== 'all') {
      query.department = department;
    }

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { studentIdNumber: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const students = await User.find(query).select('-password').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (err) {
    console.error('[Get Students Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch student roster.',
      error: err.message,
    });
  }
});

// @route   POST /api/institutions/my-institution/students
// @desc    Manually enroll a student under the institution
// @access  Private (Institution Admin)
router.post('/my-institution/students', protect, requireInstitutionAdmin, async (req, res) => {
  const { name, email, password, studentIdNumber, department, batchYear } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and temporary password are required.',
    });
  }

  try {
    let institution = await Institution.findOne({
      $or: [{ _id: req.user.institutionId }, { adminUser: req.user._id }],
    });

    if (!institution) {
      return res.status(404).json({ success: false, message: 'Institution not found.' });
    }

    if (institution.usedSeats >= institution.maxSeats) {
      return res.status(400).json({
        success: false,
        message: `Maximum seat limit (${institution.maxSeats}) reached. Contact Super Admin to expand your plan.`,
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A student with this email address is already registered.',
      });
    }

    const student = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'institution_student',
      accountStatus: 'active',
      institutionId: institution._id,
      institutionCode: institution.code,
      studentIdNumber: studentIdNumber ? studentIdNumber.trim() : `STU-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      department: department ? department.trim() : institution.departments[0] || 'General',
      batchYear: batchYear ? batchYear.trim() : '2024-2028',
      university: institution.name,
    });

    institution.usedSeats += 1;
    await institution.save();

    return res.status(201).json({
      success: true,
      message: `Student "${student.name}" enrolled successfully.`,
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        studentIdNumber: student.studentIdNumber,
        department: student.department,
        accountStatus: student.accountStatus,
      },
    });
  } catch (err) {
    console.error('[Enroll Student Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to enroll student.',
      error: err.message,
    });
  }
});

// @route   GET /api/institutions/my-institution/analytics
// @desc    Campus-wide evaluation metrics, classroom counts & attendance
// @access  Private (Institution Admin)
router.get('/my-institution/analytics', protect, requireInstitutionAdmin, async (req, res) => {
  try {
    let institution = await Institution.findOne({
      $or: [{ _id: req.user.institutionId }, { adminUser: req.user._id }],
    });

    if (!institution) {
      return res.status(404).json({ success: false, message: 'Institution not found.' });
    }

    const totalStudents = await User.countDocuments({
      institutionId: institution._id,
      role: 'institution_student',
    });

    const activeStudents = await User.countDocuments({
      institutionId: institution._id,
      role: 'institution_student',
      accountStatus: 'active',
    });

    const totalClassrooms = await Classroom.countDocuments({
      $or: [{ creator: institution.adminUser }, { teachers: institution.adminUser }],
    });

    const assessmentsCount = await Assessment.countDocuments();

    return res.status(200).json({
      success: true,
      analytics: {
        totalStudents,
        activeStudents,
        totalClassrooms,
        assessmentsCount,
        maxSeats: institution.maxSeats,
        usedSeats: institution.usedSeats,
        seatUtilizationPct: Math.round((institution.usedSeats / institution.maxSeats) * 100) || 0,
        plan: institution.plan,
        status: institution.status,
      },
    });
  } catch (err) {
    console.error('[Institution Analytics Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch campus analytics.',
      error: err.message,
    });
  }
});

module.exports = router;
