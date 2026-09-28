const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const User = require('../models/User');
const Institution = require('../models/Institution');
const Classroom = require('../models/Classroom');
const Assessment = require('../models/Assessment');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

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

// Middleware: Require Institution Faculty Teacher or Admin
const requireInstitutionFacultyOrAdmin = async (req, res, next) => {
  if (
    req.user &&
    (req.user.role === 'institution_admin' ||
      req.user.role === 'institution_teacher' ||
      req.user.role === 'educator' ||
      req.user.role === 'super_admin' ||
      req.user.role === 'admin')
  ) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Institution Administrator or Faculty Educator privileges required.',
    });
  }
};

// Helper to robustly find an institution for an admin or user
const getAdminInstitution = async (user) => {
  if (!user) return null;
  let institution = null;
  if (user.institutionId) {
    institution = await Institution.findById(user.institutionId);
  }
  if (!institution && user.institutionCode) {
    institution = await Institution.findOne({ code: user.institutionCode.trim().toUpperCase() });
  }
  if (!institution) {
    institution = await Institution.findOne({ adminUser: user._id });
  }
  return institution;
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
    let institution = await getAdminInstitution(req.user);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'No institution linked to your account.',
      });
    }

    // Refresh seat count
    const studentCount = await User.countDocuments({
      institutionId: institution._id,
      role: 'institution_student',
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
    let institution = await getAdminInstitution(req.user);

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
// @access  Private (Institution Admin & Faculty Teachers)
router.get('/my-institution/students', protect, requireInstitutionFacultyOrAdmin, async (req, res) => {
  const { department, search, assignedTeacher } = req.query;

  try {
    let institution = await getAdminInstitution(req.user);

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

    if (assignedTeacher && assignedTeacher !== 'all') {
      if (assignedTeacher === 'me') {
        query.assignedTeacher = req.user._id;
      } else if (assignedTeacher === 'unassigned') {
        query.$or = [{ assignedTeacher: null }, { assignedTeacher: { $exists: false } }];
      } else {
        query.assignedTeacher = assignedTeacher;
      }
    }

    if (search && search.trim()) {
      const searchOr = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { studentIdNumber: { $regex: search.trim(), $options: 'i' } },
        { assignedTeacherName: { $regex: search.trim(), $options: 'i' } },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchOr }];
        delete query.$or;
      } else {
        query.$or = searchOr;
      }
    }

    const students = await User.find(query)
      .select('-password')
      .populate('assignedTeacher', 'name email facultyIdNumber designation department')
      .sort({ createdAt: -1 });

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
// @desc    Manually enroll a student under the institution and allot assigned teacher
// @access  Private (Institution Admin & Faculty Teachers)
router.post('/my-institution/students', protect, requireInstitutionFacultyOrAdmin, async (req, res) => {
  const { name, email, password, studentIdNumber, department, batchYear, assignedTeacher } = req.body;

  if (!name || !name.trim() || !email || !email.trim() || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and temporary password are required.',
    });
  }

  try {
    let institution = await getAdminInstitution(req.user);

    if (!institution) {
      return res.status(404).json({ success: false, message: 'Institution not found.' });
    }

    if (institution.usedSeats >= institution.maxSeats) {
      return res.status(400).json({
        success: false,
        message: `Maximum seat limit (${institution.maxSeats}) reached. Contact Super Admin to expand your plan.`,
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A user with email "${cleanEmail}" is already registered.`,
      });
    }

    // Determine assigned teacher
    let targetTeacherId = null;
    let targetTeacherName = '';

    if (assignedTeacher && assignedTeacher.trim()) {
      const teacherObj = await User.findOne({
        _id: assignedTeacher,
        institutionId: institution._id,
        role: { $in: ['institution_teacher', 'educator', 'institution_admin'] },
      });
      if (teacherObj) {
        targetTeacherId = teacherObj._id;
        targetTeacherName = teacherObj.name;
      }
    } else if (req.user.role === 'institution_teacher' || req.user.role === 'educator') {
      // If teacher is enrolling the student, automatically allot to this teacher
      targetTeacherId = req.user._id;
      targetTeacherName = req.user.name;
    }

    const student = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: 'institution_student',
      accountStatus: 'active',
      institutionId: institution._id,
      institutionCode: institution.code,
      studentIdNumber: studentIdNumber ? studentIdNumber.trim() : `STU-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      department: department ? department.trim() : (institution.departments && institution.departments[0]) || 'General',
      batchYear: batchYear ? batchYear.trim() : '2024-2028',
      university: institution.name,
      assignedTeacher: targetTeacherId,
      assignedTeacherName: targetTeacherName,
    });

    institution.usedSeats += 1;
    await institution.save();

    return res.status(201).json({
      success: true,
      message: `Student "${student.name}" enrolled successfully. Allotted teacher: ${targetTeacherName || 'None'}.`,
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        studentIdNumber: student.studentIdNumber,
        department: student.department,
        accountStatus: student.accountStatus,
        assignedTeacher: student.assignedTeacher,
        assignedTeacherName: student.assignedTeacherName,
      },
    });
  } catch (err) {
    console.error('[Enroll Student Error]', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to enroll student.',
      error: err.message,
    });
  }
});

// @route   GET /api/institutions/my-institution/students/sample-excel
// @desc    Download sample student enrollment Excel template
// @access  Private (Institution Admin & Faculty Teachers)
router.get('/my-institution/students/sample-excel', protect, requireInstitutionFacultyOrAdmin, async (req, res) => {
  try {
    const institution = await getAdminInstitution(req.user);
    const sampleDept = (institution && institution.departments && institution.departments[0]) || 'Computer Science & AI';

    const sampleData = [
      {
        'Student Name': 'Alex Johnson',
        'Gmail / Email': 'alex.johnson@gmail.com',
        'Course / Department': sampleDept,
        'Roll / Student ID (Optional)': 'CS-2026-001',
        'Batch Year (Optional)': '2024-2028',
      },
      {
        'Student Name': 'Samantha Reed',
        'Gmail / Email': 'samantha.reed@gmail.com',
        'Course / Department': sampleDept,
        'Roll / Student ID (Optional)': 'CS-2026-002',
        'Batch Year (Optional)': '2024-2028',
      },
      {
        'Student Name': 'Michael Chen',
        'Gmail / Email': 'michael.chen@gmail.com',
        'Course / Department': sampleDept,
        'Roll / Student ID (Optional)': 'CS-2026-003',
        'Batch Year (Optional)': '2024-2028',
      },
    ];

    const outSheet = XLSX.utils.json_to_sheet(sampleData);
    const outWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(outWb, outSheet, 'Student Enrollment Template');
    const buf = XLSX.write(outWb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Synexora_Student_Enrollment_Template.xlsx"');
    return res.send(buf);
  } catch (err) {
    console.error('[Sample Excel Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to generate sample Excel.' });
  }
});

// @route   POST /api/institutions/my-institution/students/upload-excel
// @desc    Bulk enroll students via Excel/CSV and generate credentials spreadsheet
// @access  Private (Institution Admin & Faculty Teachers)
router.post('/my-institution/students/upload-excel', protect, requireInstitutionFacultyOrAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an Excel (.xlsx, .xls) or CSV file to upload.',
      });
    }

    let institution = await getAdminInstitution(req.user);
    if (!institution) {
      return res.status(404).json({ success: false, message: 'Institution not found.' });
    }

    const { defaultAssignedTeacherId, defaultDepartment } = req.body;

    // Read workbook from buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).json({ success: false, message: 'Excel file contains no readable sheets.' });
    }

    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ success: false, message: 'Uploaded sheet is empty. Please ensure it has student rows.' });
    }

    // Determine target teacher allotment
    let targetTeacherId = null;
    let targetTeacherName = '';

    if (req.user.role === 'institution_teacher' || req.user.role === 'educator') {
      targetTeacherId = req.user._id;
      targetTeacherName = req.user.name || 'Faculty Mentor';
    } else if (defaultAssignedTeacherId && defaultAssignedTeacherId !== 'unassigned') {
      const assignedTeacher = await User.findOne({
        _id: defaultAssignedTeacherId,
        institutionId: institution._id,
        role: { $in: ['institution_teacher', 'educator', 'institution_admin'] },
      });
      if (assignedTeacher) {
        targetTeacherId = assignedTeacher._id;
        targetTeacherName = assignedTeacher.name;
      }
    }

    const createdStudents = [];
    const skippedStudents = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];

      // Flexible column mapping
      let name = '';
      let email = '';
      let course = '';
      let rollNo = '';
      let batchYear = '';

      for (const [key, val] of Object.entries(row)) {
        // Normalize key by removing all spaces, punctuation, special chars
        const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanVal = String(val).trim();

        if (
          cleanKey.includes('name') ||
          ['student', 'learner'].includes(cleanKey)
        ) {
          name = cleanVal;
        } else if (
          cleanKey.includes('gmail') ||
          cleanKey.includes('email') ||
          cleanKey.includes('mail')
        ) {
          email = cleanVal;
        } else if (
          cleanKey.includes('course') ||
          cleanKey.includes('dept') ||
          cleanKey.includes('department') ||
          cleanKey.includes('branch') ||
          cleanKey.includes('major') ||
          cleanKey.includes('program')
        ) {
          course = cleanVal;
        } else if (
          cleanKey.includes('roll') ||
          cleanKey.includes('studentid') ||
          cleanKey.includes('rollno') ||
          cleanKey === 'id'
        ) {
          rollNo = cleanVal;
        } else if (
          cleanKey.includes('batch') ||
          cleanKey.includes('year')
        ) {
          batchYear = cleanVal;
        }
      }

      if (!name || !email) {
        skippedStudents.push({
          row: i + 2,
          name: name || 'Empty Name',
          email: email || 'Empty Email',
          reason: 'Missing Name or Email/Gmail address',
        });
        continue;
      }

      // Check for valid email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        skippedStudents.push({
          row: i + 2,
          name,
          email,
          reason: 'Invalid email address format',
        });
        continue;
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        skippedStudents.push({
          row: i + 2,
          name,
          email,
          reason: 'Email already registered in system',
        });
        continue;
      }

      // Check seat limit
      if (institution.usedSeats + createdStudents.length >= institution.maxSeats) {
        skippedStudents.push({
          row: i + 2,
          name,
          email,
          reason: `Seat capacity limit (${institution.maxSeats}) reached.`,
        });
        continue;
      }

      // Generate random temporary password
      const tempPassword = `SynexoraPass${Math.floor(1000 + Math.random() * 9000)}!`;
      const finalDept = course || defaultDepartment || (institution.departments && institution.departments[0]) || 'General';
      const finalRoll = rollNo || `STU-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const finalBatch = batchYear || '2024-2028';

      const newStudent = await User.create({
        name,
        email: email.toLowerCase(),
        password: tempPassword,
        role: 'institution_student',
        accountStatus: 'active',
        institutionId: institution._id,
        institutionCode: institution.code,
        studentIdNumber: finalRoll,
        department: finalDept,
        batchYear: finalBatch,
        university: institution.name,
        assignedTeacher: targetTeacherId,
        assignedTeacherName: targetTeacherName,
      });

      createdStudents.push({
        _id: newStudent._id,
        name: newStudent.name,
        email: newStudent.email,
        password: tempPassword,
        studentIdNumber: newStudent.studentIdNumber,
        department: newStudent.department,
        batchYear: newStudent.batchYear,
        assignedTeacherName: targetTeacherName || 'Unassigned',
        institutionName: institution.name,
        institutionCode: institution.code,
      });
    }

    if (createdStudents.length > 0) {
      institution.usedSeats += createdStudents.length;
      await institution.save();
    }

    // Generate result Excel workbook with student credentials
    const exportData = createdStudents.map((st, idx) => ({
      'S.No': idx + 1,
      'Student Name': st.name,
      'Login Email / Gmail': st.email,
      'Temporary Password': st.password,
      'Roll / Student ID': st.studentIdNumber,
      'Course / Department': st.department,
      'Batch Year': st.batchYear,
      'Assigned Teacher / Mentor': st.assignedTeacherName,
      'Institution Name': st.institutionName,
      'Institution Code': st.institutionCode,
      'Account Status': 'Active (Ready to Login)',
    }));

    let base64Workbook = '';
    if (exportData.length > 0) {
      const outSheet = XLSX.utils.json_to_sheet(exportData);
      const outWb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(outWb, outSheet, 'Student Credentials');
      const buf = XLSX.write(outWb, { type: 'buffer', bookType: 'xlsx' });
      base64Workbook = buf.toString('base64');
    }

    return res.status(200).json({
      success: true,
      message: `Batch enrollment complete. Successfully created ${createdStudents.length} student account(s).`,
      enrolledCount: createdStudents.length,
      skippedCount: skippedStudents.length,
      students: createdStudents,
      skipped: skippedStudents,
      excelBase64: base64Workbook,
      fileName: `Synexora_Student_Credentials_${institution.code}_${Date.now()}.xlsx`,
    });
  } catch (err) {
    console.error('[Excel Student Enrollment Error]', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to process Excel batch student enrollment.',
      error: err.message,
    });
  }
});

// @route   PUT /api/institutions/my-institution/students/:id/assign-teacher
// @desc    Assign or reassign an institution student to a specific teacher
// @access  Private (Institution Admin & Faculty Teachers)
router.put('/my-institution/students/:id/assign-teacher', protect, requireInstitutionFacultyOrAdmin, async (req, res) => {
  const { teacherId } = req.body;
  const studentId = req.params.id;

  try {
    let institution = await getAdminInstitution(req.user);

    if (!institution) {
      return res.status(404).json({ success: false, message: 'Institution not found.' });
    }

    const student = await User.findOne({
      _id: studentId,
      institutionId: institution._id,
      role: 'institution_student',
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found in this institution.' });
    }

    if (teacherId && teacherId !== 'unassigned') {
      const teacher = await User.findOne({
        _id: teacherId,
        institutionId: institution._id,
        role: { $in: ['institution_teacher', 'educator', 'institution_admin'] },
      });

      if (!teacher) {
        return res.status(404).json({ success: false, message: 'Selected teacher not found in this institution.' });
      }

      student.assignedTeacher = teacher._id;
      student.assignedTeacherName = teacher.name;
    } else {
      student.assignedTeacher = null;
      student.assignedTeacherName = '';
    }

    await student.save();

    return res.status(200).json({
      success: true,
      message: student.assignedTeacher
        ? `Student "${student.name}" successfully assigned to Teacher "${student.assignedTeacherName}".`
        : `Student "${student.name}" is now unassigned.`,
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        assignedTeacher: student.assignedTeacher,
        assignedTeacherName: student.assignedTeacherName,
      },
    });
  } catch (err) {
    console.error('[Assign Teacher Error]', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to assign teacher.',
      error: err.message,
    });
  }
});

// @route   GET /api/institutions/my-institution/teachers
// @desc    Get faculty/teacher roster for the institution
// @access  Private (Institution Admin & Faculty Teachers)
router.get('/my-institution/teachers', protect, requireInstitutionFacultyOrAdmin, async (req, res) => {
  const { department, search } = req.query;

  try {
    let institution = await getAdminInstitution(req.user);

    if (!institution) {
      return res.status(404).json({ success: false, message: 'Institution not found.' });
    }

    const query = {
      institutionId: institution._id,
      role: { $in: ['institution_teacher', 'educator'] },
    };

    if (department && department !== 'all') {
      query.department = department;
    }

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { facultyIdNumber: { $regex: search.trim(), $options: 'i' } },
        { designation: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const teachers = await User.find(query).select('-password').sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: teachers.length,
      teachers,
    });
  } catch (err) {
    console.error('[Get Teachers Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty roster.',
      error: err.message,
    });
  }
});

// @route   POST /api/institutions/my-institution/teachers
// @desc    Manually enroll a teacher/faculty member under the institution
// @access  Private (Institution Admin)
router.post('/my-institution/teachers', protect, requireInstitutionAdmin, async (req, res) => {
  const { name, email, password, facultyIdNumber, department, designation } = req.body;

  if (!name || !name.trim() || !email || !email.trim() || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, faculty email, and temporary password are required.',
    });
  }

  try {
    let institution = await getAdminInstitution(req.user);

    if (!institution) {
      return res.status(404).json({ success: false, message: 'Institution not found for your account.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A user with email "${cleanEmail}" is already registered in the platform.`,
      });
    }

    const teacher = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: 'institution_teacher',
      accountStatus: 'active',
      institutionId: institution._id,
      institutionCode: institution.code,
      facultyIdNumber: facultyIdNumber && facultyIdNumber.trim() ? facultyIdNumber.trim() : `FAC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      designation: designation && designation.trim() ? designation.trim() : 'Assistant Professor',
      department: department && department.trim() ? department.trim() : (institution.departments && institution.departments[0]) || 'General',
      university: institution.name,
    });

    return res.status(201).json({
      success: true,
      message: `Teacher "${teacher.name}" enrolled successfully as ${teacher.designation}.`,
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        facultyIdNumber: teacher.facultyIdNumber,
        designation: teacher.designation,
        department: teacher.department,
        accountStatus: teacher.accountStatus,
      },
    });
  } catch (err) {
    console.error('[Enroll Teacher Error]', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to enroll faculty teacher.',
      error: err.message,
    });
  }
});

// @route   GET /api/institutions/my-institution/teachers/sample-excel
// @desc    Download sample Excel spreadsheet template for bulk teacher enrollment
// @access  Private (Institution Admin)
router.get('/my-institution/teachers/sample-excel', protect, requireInstitutionAdmin, async (req, res) => {
  try {
    let institution = await getAdminInstitution(req.user);
    const primaryDept = (institution && institution.departments && institution.departments[0]) || 'Computer Science & AI';
    const secondaryDept = (institution && institution.departments && institution.departments[1]) || 'Data Engineering';

    const sampleData = [
      {
        'Teacher Name': 'Dr. Robert Oppenheimer',
        'Gmail / Email': 'robert.oppenheimer@gmail.com',
        'Course / Department': primaryDept,
        'Designation (Optional)': 'Professor & HOD',
        'Faculty ID / Emp ID (Optional)': 'FAC-2026-001',
      },
      {
        'Teacher Name': 'Prof. Ada Lovelace',
        'Gmail / Email': 'ada.lovelace@gmail.com',
        'Course / Department': secondaryDept,
        'Designation (Optional)': 'Associate Professor',
        'Faculty ID / Emp ID (Optional)': 'FAC-2026-002',
      },
      {
        'Teacher Name': 'Dr. Alan Turing',
        'Gmail / Email': 'alan.turing@gmail.com',
        'Course / Department': primaryDept,
        'Designation (Optional)': 'Assistant Professor',
        'Faculty ID / Emp ID (Optional)': 'FAC-2026-003',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Teacher Enrollment Template');

    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Synexora_Teacher_Enrollment_Template.xlsx"');
    return res.send(buf);
  } catch (err) {
    console.error('[Sample Teacher Excel Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to generate sample teacher Excel.' });
  }
});

// @route   POST /api/institutions/my-institution/teachers/upload-excel
// @desc    Bulk enroll faculty teachers via Excel/CSV and generate credentials spreadsheet
// @access  Private (Institution Admin)
router.post('/my-institution/teachers/upload-excel', protect, requireInstitutionAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an Excel (.xlsx, .xls) or CSV file to upload.',
      });
    }

    let institution = await getAdminInstitution(req.user);
    if (!institution) {
      return res.status(404).json({ success: false, message: 'Institution not found.' });
    }

    const { defaultDepartment, defaultDesignation } = req.body;

    // Read workbook from buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).json({ success: false, message: 'Excel file contains no readable sheets.' });
    }

    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ success: false, message: 'Uploaded sheet is empty. Please ensure it has teacher rows.' });
    }

    const createdTeachers = [];
    const skippedTeachers = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];

      // Flexible column mapping
      let name = '';
      let email = '';
      let course = '';
      let designation = '';
      let facultyId = '';

      for (const [key, val] of Object.entries(row)) {
        const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanVal = String(val).trim();

        if (
          cleanKey.includes('name') ||
          ['teacher', 'faculty', 'professor', 'educator'].includes(cleanKey)
        ) {
          name = cleanVal;
        } else if (
          cleanKey.includes('gmail') ||
          cleanKey.includes('email') ||
          cleanKey.includes('mail')
        ) {
          email = cleanVal;
        } else if (
          cleanKey.includes('course') ||
          cleanKey.includes('dept') ||
          cleanKey.includes('department') ||
          cleanKey.includes('branch') ||
          cleanKey.includes('major') ||
          cleanKey.includes('program')
        ) {
          course = cleanVal;
        } else if (
          cleanKey.includes('designation') ||
          cleanKey.includes('title') ||
          cleanKey.includes('role') ||
          cleanKey.includes('post') ||
          cleanKey.includes('position')
        ) {
          designation = cleanVal;
        } else if (
          cleanKey.includes('facultyid') ||
          cleanKey.includes('empid') ||
          cleanKey.includes('id') ||
          cleanKey.includes('code')
        ) {
          facultyId = cleanVal;
        }
      }

      if (!name || !email) {
        skippedTeachers.push({
          row: i + 2,
          name: name || 'Empty Name',
          email: email || 'Empty Email',
          reason: 'Missing Teacher Name or Email/Gmail address',
        });
        continue;
      }

      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        skippedTeachers.push({
          row: i + 2,
          name,
          email,
          reason: 'Invalid email address format',
        });
        continue;
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        skippedTeachers.push({
          row: i + 2,
          name,
          email,
          reason: 'Email already registered in platform',
        });
        continue;
      }

      // Generate random temporary password
      const tempPassword = `SynexoraFaculty${Math.floor(1000 + Math.random() * 9000)}!`;
      const finalDept = course || defaultDepartment || (institution.departments && institution.departments[0]) || 'General';
      const finalDesignation = designation || defaultDesignation || 'Assistant Professor';
      const finalFacultyId = facultyId || `FAC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const newTeacher = await User.create({
        name,
        email: email.toLowerCase(),
        password: tempPassword,
        role: 'institution_teacher',
        accountStatus: 'active',
        institutionId: institution._id,
        institutionCode: institution.code,
        facultyIdNumber: finalFacultyId,
        department: finalDept,
        designation: finalDesignation,
        university: institution.name,
      });

      createdTeachers.push({
        _id: newTeacher._id,
        name: newTeacher.name,
        email: newTeacher.email,
        password: tempPassword,
        facultyIdNumber: newTeacher.facultyIdNumber,
        department: newTeacher.department,
        designation: newTeacher.designation,
        institutionName: institution.name,
        institutionCode: institution.code,
      });
    }

    // Generate result Excel workbook with teacher credentials
    const exportData = createdTeachers.map((tc, idx) => ({
      'S.No': idx + 1,
      'Teacher / Faculty Name': tc.name,
      'Login Email / Gmail': tc.email,
      'Temporary Password': tc.password,
      'Faculty / Employee ID': tc.facultyIdNumber,
      'Department / Course': tc.department,
      'Designation': tc.designation,
      'Institution Name': tc.institutionName,
      'Institution Code': tc.institutionCode,
      'Account Status': 'Active (Ready to Login)',
    }));

    let base64Workbook = '';
    if (exportData.length > 0) {
      const outSheet = XLSX.utils.json_to_sheet(exportData);
      const outWb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(outWb, outSheet, 'Faculty Credentials');
      const buf = XLSX.write(outWb, { type: 'buffer', bookType: 'xlsx' });
      base64Workbook = buf.toString('base64');
    }

    return res.status(200).json({
      success: true,
      message: `Batch faculty enrollment complete. Successfully created ${createdTeachers.length} educator account(s).`,
      enrolledCount: createdTeachers.length,
      skippedCount: skippedTeachers.length,
      teachers: createdTeachers,
      skipped: skippedTeachers,
      excelBase64: base64Workbook,
      fileName: `Synexora_Faculty_Credentials_${institution.code}_${Date.now()}.xlsx`,
    });
  } catch (err) {
    console.error('[Excel Teacher Enrollment Error]', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to process Excel batch teacher enrollment.',
      error: err.message,
    });
  }
});

// @route   GET /api/institutions/my-institution/analytics
// @desc    Campus-wide evaluation metrics, classroom counts & attendance
// @access  Private (Institution Admin & Faculty Teachers)
router.get('/my-institution/analytics', protect, requireInstitutionFacultyOrAdmin, async (req, res) => {
  try {
    let institution = await getAdminInstitution(req.user);

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

    const totalTeachers = await User.countDocuments({
      institutionId: institution._id,
      role: 'institution_teacher',
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
        totalTeachers,
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
