const express = require('express');
const crypto = require('crypto');
const Groq = require('groq-sdk');
const Classroom = require('../models/Classroom');
const ClassroomSubmission = require('../models/ClassroomSubmission');
const User = require('../models/User');
const Institution = require('../models/Institution');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Allowed roles for classroom access: Institution Admins, Faculty Teachers, Campus Students
const allowedClassroomRoles = ['institution_admin', 'institution_teacher', 'institution_student', 'educator', 'student', 'super_admin', 'admin'];

const requireClassroomAccess = (req, res, next) => {
  if (!req.user || !allowedClassroomRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access restricted. Classrooms are exclusively available for Institution Admins, Faculty Teachers, and Campus Students.',
    });
  }
  next();
};

// Apply authentication and role check to all classroom endpoints
router.use(protect, requireClassroomAccess);

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return new Groq({ apiKey });
};

// Generate unique 6-character classroom code
const generateClassCode = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = 'SX-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// @route   GET /api/classrooms
// @desc    Get classrooms scoped to user role:
//          - Campus Admin: sees ALL teachers' classrooms in that campus/institution
//          - Institution Teacher: sees ONLY the classrooms they created
//          - Students: sees classrooms they are enrolled in
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let query = {};

    if (userRole === 'institution_admin') {
      // Campus Admin: Show all classrooms created by all teachers in this campus
      let institutionId = req.user.institutionId;
      let institutionCode = req.user.institutionCode;

      if (!institutionId && institutionCode) {
        const inst = await Institution.findOne({ code: institutionCode.toUpperCase().trim() });
        if (inst) institutionId = inst._id;
      }
      if (!institutionId) {
        const inst = await Institution.findOne({ adminUser: userId });
        if (inst) institutionId = inst._id;
      }

      let campusTeacherIds = [userId];
      if (institutionId) {
        const campusUsers = await User.find({
          institutionId: institutionId,
          role: { $in: ['institution_teacher', 'educator', 'institution_admin'] },
        }).select('_id');
        campusTeacherIds = campusUsers.map((u) => u._id);
      }

      query = {
        $or: [
          ...(institutionId ? [{ institutionId: institutionId }] : []),
          ...(institutionCode ? [{ institutionCode: institutionCode.toUpperCase().trim() }] : []),
          { creator: { $in: [userId, ...campusTeacherIds] } },
          { teachers: userId },
          { students: userId },
        ],
      };
    } else if (userRole === 'institution_teacher' || userRole === 'educator') {
      // Institution Teacher: Shows ONLY classrooms that they created
      query = { creator: userId };
    } else if (userRole === 'super_admin' || userRole === 'admin') {
      // Super Admin manages institutions; return all or empty
      query = {};
    } else {
      // Institution Student & Personal Student: classrooms they are enrolled in
      query = { students: userId };
    }

    const classrooms = await Classroom.find(query)
      .populate('creator', 'name email avatar department designation')
      .populate('teachers', 'name email avatar department designation')
      .populate('students', 'name email avatar studentIdNumber')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      role: userRole,
      count: classrooms.length,
      classrooms,
    });
  } catch (err) {
    console.error('[Get Classrooms Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch classrooms.',
      error: err.message,
    });
  }
});

// @route   POST /api/classrooms
// @desc    Create a new classroom
// @access  Private (Institution Admin and Institution Teacher)
router.post('/', protect, async (req, res) => {
  if (
    req.user.role !== 'institution_admin' &&
    req.user.role !== 'institution_teacher' &&
    req.user.role !== 'super_admin'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Access restricted. Only Campus Admins and Teachers can create classrooms.',
    });
  }

  const { title, section = '', subject = 'General', room = '', bannerTheme = 'emerald' } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Classroom title is required.',
    });
  }

  try {
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = generateClassCode();
      const existing = await Classroom.findOne({ code });
      if (!existing) isUnique = true;
    }

    let institutionId = req.user.institutionId || null;
    let institutionCode = req.user.institutionCode || '';

    if (!institutionId && institutionCode) {
      const inst = await Institution.findOne({ code: institutionCode.toUpperCase().trim() });
      if (inst) institutionId = inst._id;
    }
    if (!institutionId && req.user.role === 'institution_admin') {
      const inst = await Institution.findOne({ adminUser: req.user._id });
      if (inst) {
        institutionId = inst._id;
        institutionCode = inst.code;
      }
    }

    const classroom = await Classroom.create({
      title: title.trim(),
      section: section.trim(),
      subject: subject.trim(),
      room: room.trim(),
      code,
      bannerTheme,
      institutionId,
      institutionCode: institutionCode ? institutionCode.toUpperCase().trim() : '',
      creator: req.user._id,
      teachers: [req.user._id],
      students: [],
      announcements: [
        {
          authorId: req.user._id,
          authorName: req.user.name || 'Instructor',
          authorEmail: req.user.email,
          content: `Welcome to ${title.trim()}! Check here for class stream updates, announcements, lecture notes, and assignments.`,
          attachments: [],
          comments: [],
        },
      ],
      classwork: [],
    });

    const populated = await Classroom.findById(classroom._id)
      .populate('creator', 'name email avatar department designation')
      .populate('teachers', 'name email avatar department designation')
      .populate('students', 'name email avatar');

    return res.status(201).json({
      success: true,
      classroom: populated,
    });
  } catch (err) {
    console.error('[Create Classroom Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create classroom.',
      error: err.message,
    });
  }
});

// @route   POST /api/classrooms/join
// @desc    Join a classroom using class code
// @access  Private (Campus Student only)
router.post('/join', protect, async (req, res) => {
  if (req.user.role !== 'institution_student') {
    return res.status(403).json({
      success: false,
      message: 'Access restricted. Only Campus Students can join classrooms using a class code.',
    });
  }

  const { code } = req.body;

  if (!code || !code.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Class code is required.',
    });
  }

  try {
    const formattedCode = code.trim().toUpperCase();
    const classroom = await Classroom.findOne({ code: formattedCode });

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'No classroom found with that code. Please check and try again.',
      });
    }

    const userId = req.user._id;

    // Check if already in class
    const isTeacher = classroom.teachers.some((t) => t.toString() === userId.toString());
    const isStudent = classroom.students.some((s) => s.toString() === userId.toString());

    if (isTeacher || isStudent) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this classroom.',
      });
    }

    classroom.students.push(userId);
    await classroom.save();

    const populated = await Classroom.findById(classroom._id)
      .populate('creator', 'name email')
      .populate('teachers', 'name email')
      .populate('students', 'name email');

    return res.status(200).json({
      success: true,
      message: `Successfully joined "${classroom.title}"!`,
      classroom: populated,
    });
  } catch (err) {
    console.error('[Join Classroom Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to join classroom.',
      error: err.message,
    });
  }
});

// @route   GET /api/classrooms/:id
// @desc    Get detailed single classroom by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('teachers', 'name email')
      .populate('students', 'name email');

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Classroom not found.',
      });
    }

    return res.status(200).json({
      success: true,
      classroom,
    });
  } catch (err) {
    console.error('[Get Single Classroom Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve classroom details.',
      error: err.message,
    });
  }
});

// @route   POST /api/classrooms/:id/announcements
// @desc    Post a new announcement to the classroom stream
// @access  Private
router.post('/:id/announcements', protect, async (req, res) => {
  const { content, attachments = [] } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Announcement content cannot be empty.',
    });
  }

  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Classroom not found.',
      });
    }

    const newAnnouncement = {
      authorId: req.user._id,
      authorName: req.user.name || 'Instructor',
      authorEmail: req.user.email,
      content: content.trim(),
      attachments: Array.isArray(attachments) ? attachments : [],
      comments: [],
      createdAt: new Date(),
    };

    classroom.announcements.unshift(newAnnouncement);
    await classroom.save();

    return res.status(201).json({
      success: true,
      announcement: classroom.announcements[0],
    });
  } catch (err) {
    console.error('[Post Announcement Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to publish announcement.',
      error: err.message,
    });
  }
});

// @route   POST /api/classrooms/:id/announcements/:announcementId/comments
// @desc    Add a comment to an announcement thread
// @access  Private
router.post('/:id/announcements/:announcementId/comments', protect, async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Comment text is required.',
    });
  }

  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found.' });
    }

    const announcement = classroom.announcements.id(req.params.announcementId);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    const comment = {
      authorId: req.user._id,
      authorName: req.user.name || 'Student',
      authorEmail: req.user.email,
      text: text.trim(),
      createdAt: new Date(),
    };

    announcement.comments.push(comment);
    await classroom.save();

    return res.status(201).json({
      success: true,
      comment: announcement.comments[announcement.comments.length - 1],
    });
  } catch (err) {
    console.error('[Add Comment Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to add comment.',
      error: err.message,
    });
  }
});

// @route   POST /api/classrooms/:id/classwork
// @desc    Create new classwork item (assignment, material, quiz)
// @access  Private
router.post('/:id/classwork', protect, async (req, res) => {
  const { title, description = '', type = 'assignment', topic = 'General', points = 100, dueDate, attachments = [] } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Classwork title is required.',
    });
  }

  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found.' });
    }

    const isTeacher =
      classroom.creator.toString() === req.user._id.toString() ||
      classroom.teachers.some((t) => t.toString() === req.user._id.toString()) ||
      req.user.role === 'institution_admin' ||
      req.user.role === 'super_admin';

    if (!isTeacher) {
      return res.status(403).json({
        success: false,
        message: 'Only instructors and institution admins can create classwork.',
      });
    }

    const newClasswork = {
      title: title.trim(),
      description: description.trim(),
      type,
      topic: topic.trim() || 'General',
      points: parseInt(points, 10) || 100,
      dueDate: dueDate ? new Date(dueDate) : null,
      attachments: Array.isArray(attachments) ? attachments : [],
      creatorId: req.user._id,
      createdAt: new Date(),
    };

    classroom.classwork.unshift(newClasswork);

    // Also auto-post an announcement on the stream if it is an assignment
    if (type === 'assignment' || type === 'quiz') {
      classroom.announcements.unshift({
        authorId: req.user._id,
        authorName: req.user.name || 'Instructor',
        authorEmail: req.user.email,
        content: `📋 New ${type === 'quiz' ? 'Quiz' : 'Assignment'} posted: "${title.trim()}" (Due: ${
          dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date'
        }, Points: ${points} pts)`,
        attachments: Array.isArray(attachments) ? attachments : [],
        comments: [],
        createdAt: new Date(),
      });
    }

    await classroom.save();

    return res.status(201).json({
      success: true,
      classwork: classroom.classwork[0],
    });
  } catch (err) {
    console.error('[Create Classwork Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create classwork.',
      error: err.message,
    });
  }
});

// @route   GET /api/classrooms/:id/submissions/:classworkId
// @desc    Get submissions for a classwork item
// @access  Private
router.get('/:id/submissions/:classworkId', protect, async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found.' });
    }

    const isTeacher =
      classroom.creator.toString() === req.user._id.toString() ||
      classroom.teachers.some((t) => t.toString() === req.user._id.toString());

    let submissions;
    if (isTeacher) {
      submissions = await ClassroomSubmission.find({
        classroomId: req.params.id,
        classworkId: req.params.classworkId,
      }).sort({ submittedAt: -1 });
    } else {
      submissions = await ClassroomSubmission.find({
        classroomId: req.params.id,
        classworkId: req.params.classworkId,
        studentId: req.user._id,
      });
    }

    return res.status(200).json({
      success: true,
      submissions,
      isTeacher,
    });
  } catch (err) {
    console.error('[Get Submissions Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load submissions.',
      error: err.message,
    });
  }
});

// @route   POST /api/classrooms/:id/submissions/:classworkId
// @desc    Submit or turn in assignment work
// @access  Private
router.post('/:id/submissions/:classworkId', protect, async (req, res) => {
  const { content, submissionType = 'link', attachments = [] } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Submission content or link is required to turn in.',
    });
  }

  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found.' });
    }

    const classworkItem = classroom.classwork.id(req.params.classworkId);
    if (!classworkItem) {
      return res.status(404).json({ success: false, message: 'Assignment not found in classroom.' });
    }

    const isLate = classworkItem.dueDate && new Date() > new Date(classworkItem.dueDate);

    let submission = await ClassroomSubmission.findOne({
      classroomId: req.params.id,
      classworkId: req.params.classworkId,
      studentId: req.user._id,
    });

    if (submission) {
      submission.content = content.trim();
      submission.submissionType = submissionType;
      submission.attachments = attachments;
      submission.status = isLate ? 'late' : 'submitted';
      submission.submittedAt = new Date();
      await submission.save();
    } else {
      submission = await ClassroomSubmission.create({
        classroomId: req.params.id,
        classworkId: req.params.classworkId,
        studentId: req.user._id,
        studentName: req.user.name || 'Student',
        studentEmail: req.user.email,
        submissionType,
        content: content.trim(),
        attachments,
        status: isLate ? 'late' : 'submitted',
        submittedAt: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Work turned in successfully!',
      submission,
    });
  } catch (err) {
    console.error('[Submit Assignment Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit assignment work.',
      error: err.message,
    });
  }
});

// @route   PUT /api/classrooms/:id/submissions/:submissionId/grade
// @desc    Grade a student submission
// @access  Private
router.put('/:id/submissions/:submissionId/grade', protect, async (req, res) => {
  const { grade, feedback = '' } = req.body;

  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found.' });
    }

    const isTeacher =
      classroom.creator.toString() === req.user._id.toString() ||
      classroom.teachers.some((t) => t.toString() === req.user._id.toString());

    if (!isTeacher) {
      return res.status(403).json({
        success: false,
        message: 'Only classroom instructors can grade submissions.',
      });
    }

    const submission = await ClassroomSubmission.findById(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    submission.grade = typeof grade === 'number' ? grade : parseFloat(grade) || 0;
    submission.feedback = feedback.trim();
    submission.status = 'graded';
    await submission.save();

    return res.status(200).json({
      success: true,
      message: 'Submission graded successfully.',
      submission,
    });
  } catch (err) {
    console.error('[Grade Submission Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to grade submission.',
      error: err.message,
    });
  }
});

// @route   DELETE /api/classrooms/:id/submissions/:submissionId
// @desc    Unsubmit assignment work
// @access  Private
router.delete('/:id/submissions/:submissionId', protect, async (req, res) => {
  try {
    const submission = await ClassroomSubmission.findOne({
      _id: req.params.submissionId,
      studentId: req.user._id,
    });

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found or unauthorized.' });
    }

    await ClassroomSubmission.findByIdAndDelete(req.params.submissionId);

    return res.status(200).json({
      success: true,
      message: 'Assignment unsubmitted successfully.',
    });
  } catch (err) {
    console.error('[Unsubmit Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to unsubmit work.',
      error: err.message,
    });
  }
});

// @route   DELETE /api/classrooms/:id
// @desc    Delete classroom (if creator) or leave classroom (if student)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found.' });
    }

    const userId = req.user._id.toString();

    if (classroom.creator.toString() === userId) {
      await Classroom.findByIdAndDelete(req.params.id);
      await ClassroomSubmission.deleteMany({ classroomId: req.params.id });
      return res.status(200).json({
        success: true,
        message: 'Classroom and all associated data deleted successfully.',
      });
    }

    // Otherwise, student leaves
    classroom.students = classroom.students.filter((s) => s.toString() !== userId);
    await classroom.save();

    return res.status(200).json({
      success: true,
      message: 'You have left the classroom.',
    });
  } catch (err) {
    console.error('[Delete/Leave Classroom Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to process request.',
      error: err.message,
    });
  }
});

// @route   POST /api/classrooms/ai-helper
// @desc    AI Assistant for Classroom (Rubric breakdown, assignment simplification, study hints)
// @access  Private
router.post('/ai-helper', protect, async (req, res) => {
  const { action = 'summarize', title, description, subject = 'General' } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: 'Assignment title/details are required for AI assistance.',
    });
  }

  try {
    const groq = getGroqClient();
    if (!groq) {
      return res.status(500).json({
        success: false,
        message: 'Groq AI is not configured.',
      });
    }

    let prompt = '';
    if (action === 'rubric') {
      prompt = `You are Synexora Academic Instructor AI.
Generate a structured 4-tier grading rubric (Exemplary, Proficient, Developing, Incomplete) and key expectations for the following assignment:
SUBJECT: ${subject}
ASSIGNMENT: ${title}
INSTRUCTIONS / DESCRIPTION: ${description || 'Standard academic coursework'}`;
    } else if (action === 'study-guide') {
      prompt = `You are Synexora Academic Coach.
Provide a step-by-step student completion guide, recommended resources/formulas, and common pitfalls for completing this assignment:
SUBJECT: ${subject}
ASSIGNMENT: ${title}
INSTRUCTIONS: ${description || 'Standard academic coursework'}`;
    } else {
      prompt = `You are Synexora AI Tutor.
Provide a clear, student-friendly 3-bullet summary of the core goals and deliverable for this assignment:
SUBJECT: ${subject}
ASSIGNMENT: ${title}
INSTRUCTIONS: ${description || 'Standard coursework'}`;
    }

    const candidateModels = ['qwen/qwen3.8-27b', 'groq/compound', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
    let completion = null;
    for (const model of candidateModels) {
      try {
        completion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model,
          temperature: 0.4,
          max_tokens: 800,
        });
        if (completion) break;
      } catch (e) {
        console.warn(`[AI Helper Model ${model} Failed]:`, e.message);
      }
    }

    let rawReply = completion?.choices[0]?.message?.content || 'Could not generate AI assistance at this time.';
    if (rawReply.includes('</think>')) {
      rawReply = rawReply.split('</think>')[1].trim();
    }

    return res.status(200).json({
      success: true,
      result: rawReply,
    });
  } catch (err) {
    console.error('[Classroom AI Helper Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to process AI assistant request.',
      error: err.message,
    });
  }
});

// @route   POST /api/classrooms/:id/students
// @desc    Add / enroll student directly into a classroom by Teacher or Admin
// @access  Private (Teacher or Campus Admin)
router.post('/:id/students', protect, async (req, res) => {
  const { studentId, email, name, password, studentIdNumber, department, batchYear } = req.body;

  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found.' });
    }

    const isTeacher =
      classroom.creator.toString() === req.user._id.toString() ||
      classroom.teachers.some((t) => t.toString() === req.user._id.toString()) ||
      req.user.role === 'institution_admin' ||
      req.user.role === 'super_admin';

    if (!isTeacher) {
      return res.status(403).json({
        success: false,
        message: 'Only the classroom instructor or campus administrator can add students.',
      });
    }

    let targetStudent = null;

    // 1. If existing studentId passed
    if (studentId) {
      targetStudent = await User.findById(studentId);
    }

    // 2. If email passed, find existing user or provision new
    if (!targetStudent && email) {
      targetStudent = await User.findOne({ email: email.toLowerCase().trim() });
    }

    // 3. If student doesn't exist and name + password provided, create new student account under this institution
    if (!targetStudent && email && name && password) {
      let institutionId = classroom.institutionId || req.user.institutionId;
      let institutionCode = classroom.institutionCode || req.user.institutionCode || '';

      if (!institutionId && institutionCode) {
        const inst = await Institution.findOne({ code: institutionCode.toUpperCase().trim() });
        if (inst) institutionId = inst._id;
      }

      targetStudent = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: 'institution_student',
        accountStatus: 'active',
        institutionId,
        institutionCode,
        studentIdNumber: studentIdNumber ? studentIdNumber.trim() : `STU-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        department: department ? department.trim() : classroom.subject || 'Computer Science',
        batchYear: batchYear ? batchYear.trim() : '2024-2028',
        university: req.user.university || 'Synexora Campus',
      });

      if (institutionId) {
        await Institution.findByIdAndUpdate(institutionId, { $inc: { usedSeats: 1 } });
      }
    }

    if (!targetStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student account not found. To create and add a new student, provide their name, email, and temporary password.',
      });
    }

    // Check if already in class
    const isAlreadyEnrolled = classroom.students.some(
      (s) => s.toString() === targetStudent._id.toString()
    );

    if (isAlreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: `Student "${targetStudent.name}" is already enrolled in this classroom.`,
      });
    }

    classroom.students.push(targetStudent._id);
    await classroom.save();

    const updatedClassroom = await Classroom.findById(classroom._id)
      .populate('creator', 'name email avatar department designation')
      .populate('teachers', 'name email avatar department designation')
      .populate('students', 'name email avatar studentIdNumber department');

    return res.status(200).json({
      success: true,
      message: `Student "${targetStudent.name}" successfully added to "${classroom.title}".`,
      classroom: updatedClassroom,
      student: {
        _id: targetStudent._id,
        name: targetStudent.name,
        email: targetStudent.email,
        studentIdNumber: targetStudent.studentIdNumber,
        department: targetStudent.department,
      },
    });
  } catch (err) {
    console.error('[Add Student to Classroom Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to add student to classroom.',
      error: err.message,
    });
  }
});

// @route   DELETE /api/classrooms/:id/students/:studentId
// @desc    Remove a student from classroom by Teacher or Admin
// @access  Private (Teacher or Campus Admin)
router.delete('/:id/students/:studentId', protect, async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found.' });
    }

    const isTeacher =
      classroom.creator.toString() === req.user._id.toString() ||
      classroom.teachers.some((t) => t.toString() === req.user._id.toString()) ||
      req.user.role === 'institution_admin' ||
      req.user.role === 'super_admin';

    if (!isTeacher) {
      return res.status(403).json({
        success: false,
        message: 'Only the instructor or campus admin can remove students from this class.',
      });
    }

    classroom.students = classroom.students.filter(
      (s) => s.toString() !== req.params.studentId.toString()
    );
    await classroom.save();

    const updatedClassroom = await Classroom.findById(classroom._id)
      .populate('creator', 'name email avatar department designation')
      .populate('teachers', 'name email avatar department designation')
      .populate('students', 'name email avatar studentIdNumber department');

    return res.status(200).json({
      success: true,
      message: 'Student removed from classroom.',
      classroom: updatedClassroom,
    });
  } catch (err) {
    console.error('[Remove Student from Classroom Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove student from classroom.',
      error: err.message,
    });
  }
});

// @route   DELETE /api/classrooms/:id/announcements/:announcementId
// @desc    Delete an announcement from classroom stream by Teacher or Author
// @access  Private (Teacher or Author)
router.delete('/:id/announcements/:announcementId', protect, async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found.' });
    }

    const announcement = classroom.announcements.id(req.params.announcementId);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    const isAuthor = announcement.authorId && announcement.authorId.toString() === req.user._id.toString();
    const isTeacher =
      classroom.creator.toString() === req.user._id.toString() ||
      classroom.teachers.some((t) => t.toString() === req.user._id.toString()) ||
      req.user.role === 'institution_admin' ||
      req.user.role === 'institution_teacher' ||
      req.user.role === 'educator' ||
      req.user.role === 'super_admin';

    if (!isAuthor && !isTeacher) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this announcement.',
      });
    }

    classroom.announcements.pull({ _id: req.params.announcementId });
    await classroom.save();

    return res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully.',
      announcements: classroom.announcements,
    });
  } catch (err) {
    console.error('[Delete Announcement Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete announcement.',
      error: err.message,
    });
  }
});

// @route   DELETE /api/classrooms/:id/classwork/:classworkId
// @desc    Delete a classwork item (material / assignment) by Teacher or Admin
// @access  Private (Teacher or Admin)
router.delete('/:id/classwork/:classworkId', protect, async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found.' });
    }

    const classwork = classroom.classwork.id(req.params.classworkId);
    if (!classwork) {
      return res.status(404).json({ success: false, message: 'Classwork not found.' });
    }

    const isTeacher =
      classroom.creator.toString() === req.user._id.toString() ||
      classroom.teachers.some((t) => t.toString() === req.user._id.toString()) ||
      req.user.role === 'institution_admin' ||
      req.user.role === 'institution_teacher' ||
      req.user.role === 'educator' ||
      req.user.role === 'super_admin';

    if (!isTeacher) {
      return res.status(403).json({
        success: false,
        message: 'Only instructors and campus administrators can delete classwork.',
      });
    }

    classroom.classwork.pull({ _id: req.params.classworkId });
    await classroom.save();

    // Clean up related submissions
    await ClassroomSubmission.deleteMany({
      classroomId: req.params.id,
      classworkId: req.params.classworkId,
    });

    return res.status(200).json({
      success: true,
      message: 'Classwork item deleted successfully.',
      classwork: classroom.classwork,
    });
  } catch (err) {
    console.error('[Delete Classwork Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete classwork.',
      error: err.message,
    });
  }
});

module.exports = router;
