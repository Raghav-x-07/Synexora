const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const StudyLog = require('../models/StudyLog');
const User = require('../models/User');
const Institution = require('../models/Institution');
const Classroom = require('../models/Classroom');
const ClassroomSubmission = require('../models/ClassroomSubmission');
const Assessment = require('../models/Assessment');

const router = express.Router();

router.use(protect);

// Helper to find current user's institution
const getUserInstitution = async (user) => {
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

// Helper to parse numerical score percentage
const parseScorePercent = (scoreVal) => {
  if (typeof scoreVal === 'number' && !isNaN(scoreVal)) return scoreVal;
  if (typeof scoreVal === 'string') {
    const match = scoreVal.match(/(\d+(?:\.\d+)?)/);
    if (match) return parseFloat(match[1]);
  }
  return null;
};

// Helper to compute overall progress / mastery percentage
const computeOverallMastery = (avgQuiz, totalMinutes, sessionCount, avgAssignment) => {
  let hasQuiz = typeof avgQuiz === 'number' && !isNaN(avgQuiz);
  let hasStudy = totalMinutes > 0 || sessionCount > 0;
  let hasAssignment = typeof avgAssignment === 'number' && !isNaN(avgAssignment);

  if (hasQuiz && hasStudy) {
    // Benchmark study target: 5 hours (300 mins)
    const studyScore = Math.min(100, (totalMinutes / 300) * 100);
    const assignmentScore = hasAssignment ? avgAssignment : avgQuiz;
    const combined = (avgQuiz * 0.5) + (studyScore * 0.3) + (assignmentScore * 0.2);
    return Math.min(100, Math.round(combined));
  } else if (hasQuiz) {
    return Math.min(100, Math.round(avgQuiz));
  } else if (hasStudy) {
    return Math.min(100, Math.round((totalMinutes / 300) * 100));
  } else if (hasAssignment) {
    return Math.min(100, Math.round(avgAssignment));
  }
  return 0;
};

const getMasteryStatus = (score) => {
  if (score >= 85) return { label: 'Exemplary', color: 'emerald' };
  if (score >= 70) return { label: 'Proficient', color: 'indigo' };
  if (score >= 50) return { label: 'Developing', color: 'amber' };
  return { label: 'Needs Focus', color: 'rose' };
};

// @route   GET /api/progress
// @desc    Get all study logs, quiz assessments, and combined progress for current user
router.get('/', async (req, res) => {
  try {
    const [logs, assessments] = await Promise.all([
      StudyLog.find({ user: req.user._id }).sort({ createdAt: -1 }).lean(),
      Assessment.find({ user: req.user._id }).sort({ createdAt: -1 }).lean(),
    ]);

    const totalMinutes = logs.reduce((sum, log) => sum + (log.durationMinutes || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    const avgSessionMinutes = logs.length > 0 ? Math.round(totalMinutes / logs.length) : 0;

    // Quizzes & Assessments Breakdown
    let quizSum = 0;
    let quizCount = 0;
    assessments.forEach((ass) => {
      const parsed = parseScorePercent(ass.score);
      if (parsed !== null) {
        quizSum += parsed;
        quizCount += 1;
      }
    });

    const avgQuizScore = quizCount > 0 ? Math.round(quizSum / quizCount) : null;
    const overallProgressScore = computeOverallMastery(avgQuizScore, totalMinutes, logs.length, null);
    const masteryStatus = getMasteryStatus(overallProgressScore);

    return res.status(200).json({
      success: true,
      count: logs.length,
      totalMinutes,
      totalHours,
      avgSessionMinutes,
      logs,
      assessments,
      quizCount,
      avgQuizScore,
      overallProgressScore,
      masteryStatus,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/progress/institution-students
// @desc    Get aggregated and separate student progress telemetry for institution faculty/admins
// @access  Private (Institution Teacher, Admin, Super Admin)
router.get('/institution-students', async (req, res) => {
  try {
    const isTeacherOrAdmin =
      req.user.role === 'institution_teacher' ||
      req.user.role === 'educator' ||
      req.user.role === 'institution_admin' ||
      req.user.role === 'super_admin' ||
      req.user.role === 'admin';

    if (!isTeacherOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only institution educators and campus administrators can view student progress.',
      });
    }

    const institution = await getUserInstitution(req.user);

    if (!institution) {
      return res.status(200).json({
        success: true,
        institution: null,
        metrics: {
          totalStudents: 0,
          totalStudyHours: '0.0',
          avgStudyHours: '0.0',
          totalSessions: 0,
          avgSessions: 0,
          avgGpa: '0.0',
          avgStreak: 0,
          avgAssignmentGrade: '0%',
          avgQuizScore: 'N/A',
          totalQuizzesTaken: 0,
          activeLearnersCount: 0,
        },
        students: [],
        subjectBreakdown: [],
      });
    }

    const { department, search, classroomId, assignedTeacher } = req.query;

    // Build query strictly scoped to this institution's students only
    const studentQuery = {
      institutionId: institution._id,
      role: 'institution_student',
    };

    if (department && department !== 'all') {
      studentQuery.department = department;
    }

    if (assignedTeacher && assignedTeacher !== 'all') {
      if (assignedTeacher === 'me') {
        studentQuery.assignedTeacher = req.user._id;
      } else if (assignedTeacher === 'unassigned') {
        studentQuery.$or = [{ assignedTeacher: null }, { assignedTeacher: { $exists: false } }];
      } else {
        studentQuery.assignedTeacher = assignedTeacher;
      }
    }

    if (search && search.trim()) {
      const searchOr = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { studentIdNumber: { $regex: search.trim(), $options: 'i' } },
        { assignedTeacherName: { $regex: search.trim(), $options: 'i' } },
      ];
      if (studentQuery.$or) {
        studentQuery.$and = [{ $or: studentQuery.$or }, { $or: searchOr }];
        delete studentQuery.$or;
      } else {
        studentQuery.$or = searchOr;
      }
    }

    // If filtered by specific classroom
    if (classroomId && classroomId !== 'all') {
      const targetClassroom = await Classroom.findById(classroomId);
      if (targetClassroom && Array.isArray(targetClassroom.students)) {
        studentQuery._id = { $in: targetClassroom.students };
      }
    }

    // Fetch strictly institution students
    const students = await User.find(studentQuery)
      .select('-password')
      .sort({ name: 1 })
      .lean();

    const studentIds = students.map((s) => s._id);

    // Fetch study logs for these students
    const allStudyLogs = await StudyLog.find({ user: { $in: studentIds } })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch classroom submissions for these students
    const allSubmissions = await ClassroomSubmission.find({ studentId: { $in: studentIds } })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch assessments/quizzes for these students
    const allAssessments = await Assessment.find({ user: { $in: studentIds } })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch classrooms associated with this institution
    const institutionClassrooms = await Classroom.find({ institutionId: institution._id })
      .select('title section code subject students teachers creator')
      .lean();

    // Map logs, submissions, assessments by student ID
    const logsByStudent = {};
    const submissionsByStudent = {};
    const assessmentsByStudent = {};
    const classroomsByStudent = {};

    studentIds.forEach((id) => {
      const idStr = id.toString();
      logsByStudent[idStr] = [];
      submissionsByStudent[idStr] = [];
      assessmentsByStudent[idStr] = [];
      classroomsByStudent[idStr] = [];
    });

    allStudyLogs.forEach((log) => {
      const idStr = log.user?.toString();
      if (logsByStudent[idStr]) {
        logsByStudent[idStr].push(log);
      }
    });

    allSubmissions.forEach((sub) => {
      const idStr = sub.studentId?.toString();
      if (submissionsByStudent[idStr]) {
        submissionsByStudent[idStr].push(sub);
      }
    });

    allAssessments.forEach((ass) => {
      const idStr = ass.user?.toString();
      if (assessmentsByStudent[idStr]) {
        assessmentsByStudent[idStr].push(ass);
      }
    });

    institutionClassrooms.forEach((c) => {
      if (Array.isArray(c.students)) {
        c.students.forEach((stId) => {
          const idStr = stId.toString();
          if (classroomsByStudent[idStr]) {
            classroomsByStudent[idStr].push({
              _id: c._id,
              title: c.title,
              section: c.section,
              subject: c.subject,
            });
          }
        });
      }
    });

    // Subject aggregate for all institute students
    const subjectMinutesMap = {};

    // Transform individual students data
    let totalCohortMinutes = 0;
    let totalCohortSessions = 0;
    let totalCohortGpa = 0;
    let totalCohortStreak = 0;
    let totalGradedScores = 0;
    let totalGradedCount = 0;
    let totalCohortQuizScores = 0;
    let totalCohortQuizzes = 0;
    let activeLearnersCount = 0;

    const transformedStudents = students.map((student) => {
      const idStr = student._id.toString();
      const sLogs = logsByStudent[idStr] || [];
      const sSubs = submissionsByStudent[idStr] || [];
      const sAssessments = assessmentsByStudent[idStr] || [];
      const sClassrooms = classroomsByStudent[idStr] || [];

      const totalStudentMinutes = sLogs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);
      const totalStudentHours = (totalStudentMinutes / 60).toFixed(1);
      const sessionCount = sLogs.length;

      // Quizzes stats for this student
      let studentQuizSum = 0;
      let studentQuizNum = 0;
      sAssessments.forEach((ass) => {
        const parsed = parseScorePercent(ass.score);
        if (parsed !== null) {
          studentQuizSum += parsed;
          studentQuizNum += 1;
          totalCohortQuizScores += parsed;
          totalCohortQuizzes += 1;
        }
      });

      const avgQuizScore = studentQuizNum > 0 ? Math.round(studentQuizSum / studentQuizNum) : null;

      // Student average assignment grade
      let studentGradedSum = 0;
      let studentGradedNum = 0;
      sSubs.forEach((sub) => {
        if (typeof sub.grade === 'number' && !isNaN(sub.grade)) {
          studentGradedSum += sub.grade;
          studentGradedNum += 1;
          totalGradedScores += sub.grade;
          totalGradedCount += 1;
        }
      });

      const avgAssignmentGrade =
        studentGradedNum > 0 ? Math.round(studentGradedSum / studentGradedNum) : null;

      if (sessionCount > 0 || sSubs.length > 0 || studentQuizNum > 0) {
        activeLearnersCount += 1;
      }

      totalCohortMinutes += totalStudentMinutes;
      totalCohortSessions += sessionCount;
      totalCohortGpa += (student.gpa || 0);
      totalCohortStreak += (student.streak || 0);

      // Subject breakdown for this student and globally
      sLogs.forEach((l) => {
        const subName = l.subject || 'General Studies';
        subjectMinutesMap[subName] = (subjectMinutesMap[subName] || 0) + (l.durationMinutes || 0);
      });

      // Compute overall progress & mastery
      const overallProgressScore = computeOverallMastery(avgQuizScore, totalStudentMinutes, sessionCount, avgAssignmentGrade);
      const masteryStatus = getMasteryStatus(overallProgressScore);

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        studentIdNumber: student.studentIdNumber || 'N/A',
        department: student.department || 'General',
        batchYear: student.batchYear || 'N/A',
        assignedTeacher: student.assignedTeacher || null,
        assignedTeacherName: student.assignedTeacherName || 'Unassigned',
        gpa: student.gpa || 0,
        streak: student.streak || 0,
        avatar: student.avatar || '',
        createdAt: student.createdAt,
        totalMinutes: totalStudentMinutes,
        totalHours: totalStudentHours,
        sessionCount,
        recentLogs: sLogs,
        submissionsCount: sSubs.length,
        submissions: sSubs,
        gradedSubmissionsCount: studentGradedNum,
        avgAssignmentGrade,
        assessmentsCount: sAssessments.length,
        quizCount: studentQuizNum,
        avgQuizScore,
        recentAssessments: sAssessments,
        overallProgressScore,
        masteryStatus,
        classrooms: sClassrooms,
      };
    });

    // Overall Average Progress Calculations
    const studentCount = students.length;
    const totalCohortHours = (totalCohortMinutes / 60).toFixed(1);
    const avgStudyHours = studentCount > 0 ? (totalCohortMinutes / 60 / studentCount).toFixed(1) : '0.0';
    const avgSessions = studentCount > 0 ? Math.round(totalCohortSessions / studentCount) : 0;
    const avgGpa = studentCount > 0 ? (totalCohortGpa / studentCount).toFixed(2) : '0.00';
    const avgStreak = studentCount > 0 ? Math.round(totalCohortStreak / studentCount) : 0;
    const overallAvgGrade =
      totalGradedCount > 0 ? `${Math.round(totalGradedScores / totalGradedCount)}%` : 'N/A';
    const overallAvgQuiz =
      totalCohortQuizzes > 0 ? `${Math.round(totalCohortQuizScores / totalCohortQuizzes)}%` : 'N/A';

    // Top subjects across the institution
    const subjectBreakdown = Object.keys(subjectMinutesMap)
      .map((subj) => ({
        subject: subj,
        totalMinutes: subjectMinutesMap[subj],
        totalHours: (subjectMinutesMap[subj] / 60).toFixed(1),
      }))
      .sort((a, b) => b.totalMinutes - a.totalMinutes)
      .slice(0, 6);

    return res.status(200).json({
      success: true,
      institution: {
        _id: institution._id,
        name: institution.name,
        code: institution.code,
        departments: institution.departments || [],
      },
      metrics: {
        totalStudents: studentCount,
        totalStudyHours: totalCohortHours,
        avgStudyHours,
        totalSessions: totalCohortSessions,
        avgSessions,
        avgGpa,
        avgStreak,
        avgAssignmentGrade: overallAvgGrade,
        avgQuizScore: overallAvgQuiz,
        totalQuizzesTaken: totalCohortQuizzes,
        activeLearnersCount,
      },
      students: transformedStudents,
      subjectBreakdown,
      teacherClassrooms: institutionClassrooms.filter(
        (c) =>
          c.creator?.toString() === req.user._id.toString() ||
          (Array.isArray(c.teachers) &&
            c.teachers.some((t) => t.toString() === req.user._id.toString()))
      ),
    });
  } catch (err) {
    console.error('[Get Institution Students Progress Error]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/progress
// @desc    Log a new study session
router.post('/', async (req, res) => {
  try {
    const { subject, durationMinutes, date, topic } = req.body;
    if (!subject || !durationMinutes || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Subject, duration, and topic summary are required',
      });
    }

    const log = await StudyLog.create({
      user: req.user._id,
      subject,
      durationMinutes: Number(durationMinutes),
      date: date || new Date().toISOString().split('T')[0],
      topic,
    });

    return res.status(201).json({ success: true, log });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/progress/:id
// @desc    Delete a study log
router.delete('/:id', async (req, res) => {
  try {
    const log = await StudyLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!log) {
      return res.status(404).json({ success: false, message: 'Study log not found' });
    }
    return res.status(200).json({ success: true, message: 'Study log deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

