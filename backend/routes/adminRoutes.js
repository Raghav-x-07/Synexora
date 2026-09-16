const express = require('express');
const User = require('../models/User');
const Institution = require('../models/Institution');
const Classroom = require('../models/Classroom');
const Assessment = require('../models/Assessment');
const Document = require('../models/Document');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware: Require Super Admin role
const requireSuperAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'super_admin' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super Administrator authorization required.',
    });
  }
};

// @route   GET /api/admin/overview
// @desc    Get executive platform KPIs
// @access  Private (Super Admin)
router.get('/overview', protect, requireSuperAdmin, async (req, res) => {
  try {
    const totalInstitutions = await Institution.countDocuments();
    const activeInstitutions = await Institution.countDocuments({ status: 'active' });
    const pendingInstitutions = await Institution.countDocuments({ status: 'pending_approval' });

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ accountStatus: 'active' });
    const pendingUsers = await User.countDocuments({ accountStatus: 'pending_approval' });

    const totalClassrooms = await Classroom.countDocuments();
    const totalAssessments = await Assessment.countDocuments();
    const totalDocuments = await Document.countDocuments();

    // Aggregations
    const roleBreakdown = {
      superAdmin: await User.countDocuments({ role: { $in: ['super_admin', 'admin'] } }),
      institutionAdmin: await User.countDocuments({ role: 'institution_admin' }),
      institutionStudent: await User.countDocuments({ role: 'institution_student' }),
      personalStudent: await User.countDocuments({ role: { $in: ['personal_student', 'student', 'educator'] } }),
    };

    return res.status(200).json({
      success: true,
      stats: {
        totalInstitutions,
        activeInstitutions,
        pendingInstitutions,
        totalUsers,
        activeUsers,
        pendingUsers,
        totalClassrooms,
        totalAssessments,
        totalDocuments,
        roleBreakdown,
      },
    });
  } catch (err) {
    console.error('[Admin Overview Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin overview.',
      error: err.message,
    });
  }
});

// @route   GET /api/admin/institutions
// @desc    Get list of all institutions
// @access  Private (Super Admin)
router.get('/institutions', protect, requireSuperAdmin, async (req, res) => {
  try {
    const institutions = await Institution.find()
      .populate('adminUser', 'name email accountStatus')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      institutions,
    });
  } catch (err) {
    console.error('[Admin Get Institutions Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch institutions.',
      error: err.message,
    });
  }
});

// @route   POST /api/admin/institutions
// @desc    Onboard new institution by Super Admin
// @access  Private (Super Admin)
router.post('/institutions', protect, requireSuperAdmin, async (req, res) => {
  const { name, code, domain, maxSeats = 500, plan = 'professional', departments = [] } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Institution name is required.',
    });
  }

  try {
    let generatedCode = code ? code.trim().toUpperCase() : `INST-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const existing = await Institution.findOne({ code: generatedCode });
    if (existing) {
      generatedCode = `INST-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    }

    const institution = await Institution.create({
      name: name.trim(),
      code: generatedCode,
      domain: domain ? domain.trim() : '',
      maxSeats: parseInt(maxSeats, 10) || 500,
      plan,
      departments: departments.length > 0 ? departments : ['Computer Science', 'Data Science & AI', 'Business'],
      status: 'active',
      adminUser: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: `Institution "${institution.name}" onboarded successfully with code ${institution.code}`,
      institution,
    });
  } catch (err) {
    console.error('[Admin Onboard Institution Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to onboard institution.',
      error: err.message,
    });
  }
});

// @route   PUT /api/admin/institutions/:id/status
// @desc    Approve, activate, or suspend institution
// @access  Private (Super Admin)
router.put('/institutions/:id/status', protect, requireSuperAdmin, async (req, res) => {
  const { status } = req.body;

  if (!['active', 'pending_approval', 'suspended'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value.' });
  }

  try {
    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!institution) {
      return res.status(404).json({ success: false, message: 'Institution not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Institution status updated to "${status}".`,
      institution,
    });
  } catch (err) {
    console.error('[Admin Update Institution Status Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update institution status.',
      error: err.message,
    });
  }
});

// @route   PUT /api/admin/institutions/:id/seats
// @desc    Update institution seat quota
// @access  Private (Super Admin)
router.put('/institutions/:id/seats', protect, requireSuperAdmin, async (req, res) => {
  const { maxSeats, plan } = req.body;

  try {
    const updateData = {};
    if (maxSeats !== undefined) updateData.maxSeats = parseInt(maxSeats, 10);
    if (plan) updateData.plan = plan;

    const institution = await Institution.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!institution) {
      return res.status(404).json({ success: false, message: 'Institution not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Seat quota and plan updated successfully.',
      institution,
    });
  } catch (err) {
    console.error('[Admin Update Seats Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update institution seats.',
      error: err.message,
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with role & status filters
// @access  Private (Super Admin)
router.get('/users', protect, requireSuperAdmin, async (req, res) => {
  const { role, status, search } = req.query;

  try {
    const query = {};
    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.accountStatus = status;
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { institutionCode: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .populate('institutionId', 'name code')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    console.error('[Admin Get Users Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users.',
      error: err.message,
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Activate, approve, or suspend a user account
// @access  Private (Super Admin)
router.put('/users/:id/status', protect, requireSuperAdmin, async (req, res) => {
  const { status } = req.body;

  if (!['active', 'pending_approval', 'suspended'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value.' });
  }

  try {
    const user = await User.findByIdAndUpdate(req.params.id, { accountStatus: status }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `User account status updated to "${status}".`,
      user,
    });
  } catch (err) {
    console.error('[Admin Update User Status Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user status.',
      error: err.message,
    });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Change user role and permissions
// @access  Private (Super Admin)
router.put('/users/:id/role', protect, requireSuperAdmin, async (req, res) => {
  const { role, moduleAccess } = req.body;

  const validRoles = [
    'super_admin',
    'institution_admin',
    'institution_student',
    'personal_student',
    'student',
    'educator',
  ];

  if (!validRoles.includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role.' });
  }

  try {
    const updateData = { role };
    if (moduleAccess) updateData.moduleAccess = moduleAccess;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `User role updated to "${role}".`,
      user,
    });
  } catch (err) {
    console.error('[Admin Update User Role Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user role.',
      error: err.message,
    });
  }
});

// @route   POST /api/admin/users/create
// @desc    Direct provision of a user account by Super Admin
// @access  Private (Super Admin)
router.post('/users/create', protect, requireSuperAdmin, async (req, res) => {
  const { name, email, password, role = 'personal_student', department = 'General', institutionCode } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required.',
    });
  }

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    let institutionId = null;
    if (institutionCode) {
      const inst = await Institution.findOne({ code: institutionCode.toUpperCase().trim() });
      if (inst) institutionId = inst._id;
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      accountStatus: 'active',
      department: department.trim(),
      institutionCode: institutionCode ? institutionCode.toUpperCase().trim() : '',
      institutionId,
    });

    return res.status(201).json({
      success: true,
      message: `Account created and activated for ${user.email}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
      },
    });
  } catch (err) {
    console.error('[Admin Provision User Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user account.',
      error: err.message,
    });
  }
});

module.exports = router;
