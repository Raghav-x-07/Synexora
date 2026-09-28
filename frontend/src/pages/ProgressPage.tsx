import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import API from '../lib/api';
import {
  BarChart3,
  Plus,
  Clock,
  BookOpen,
  Trash2,
  Loader2,
  Flame,
  Users,
  Search,
  Building2,
  Eye,
  X,
  Calendar,
  TrendingUp,
  Award,
  UserPlus,
  GraduationCap,
  Copy,
  Check,
  Key,
  UserCheck,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface StudyLog {
  _id: string;
  subject: string;
  durationMinutes: number;
  date: string;
  topic: string;
}

interface AssessmentItem {
  _id: string;
  title: string;
  course: string;
  score: string;
  status: string;
  date: string;
}

interface StudentProgressData {
  _id: string;
  name: string;
  email: string;
  studentIdNumber: string;
  department: string;
  batchYear: string;
  assignedTeacher?: any;
  assignedTeacherName?: string;
  gpa: number;
  streak: number;
  avatar?: string;
  createdAt?: string;
  totalMinutes: number;
  totalHours: string;
  sessionCount: number;
  recentLogs: StudyLog[];
  submissionsCount: number;
  gradedSubmissionsCount: number;
  avgAssignmentGrade: number | null;
  assessmentsCount: number;
  quizCount: number;
  avgQuizScore: number | null;
  recentAssessments: AssessmentItem[];
  overallProgressScore: number;
  masteryStatus: string;
  classrooms: Array<{
    _id: string;
    title: string;
    section: string;
    subject: string;
  }>;
}

interface CohortMetrics {
  totalStudents: number;
  totalStudyHours: string;
  avgStudyHours: string;
  totalSessions: number;
  avgSessions: number;
  avgGpa: string;
  avgStreak: number;
  avgAssignmentGrade: string;
  activeLearnersCount: number;
  avgQuizScore?: string;
  totalQuizzesTaken?: number;
}

interface SubjectBreakdown {
  subject: string;
  totalMinutes: number;
  totalHours: string;
}

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  compact?: boolean;
}

const PaginationBar: React.FC<PaginationBarProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20],
  itemLabel = 'items',
  compact = false,
}) => {
  if (totalItems === 0) return null;

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 select-none ${
        compact
          ? 'py-3 px-3 bg-[#FFFDF7] rounded-2xl border border-[#E8E1D2] text-xs mt-3'
          : 'py-4 px-6 bg-[#FFFFFF] border-t border-[#E8E1D2]'
      }`}
    >
      {/* Left: Summary text & Page size */}
      <div className="flex items-center gap-3 text-xs text-[#777777] font-medium flex-wrap">
        <span>
          Showing <strong className="text-[#111111]">{startIndex}</strong>–<strong className="text-[#111111]">{endIndex}</strong> of{' '}
          <strong className="text-[#111111]">{totalItems}</strong> {itemLabel}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 sm:ml-2 sm:pl-3 sm:border-l sm:border-[#E8E1D2]">
            <span className="text-[11px] text-[#777777]">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-[#FFF8E8] border border-[#E8E1D2] rounded-lg px-2 py-0.5 text-xs font-bold text-[#111111] focus:outline-none cursor-pointer"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Buttons */}
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {/* First Page Button */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-[#E8E1D2] bg-white text-[#111111] hover:bg-[#FFF8E8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="First Page"
          type="button"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Previous Page Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-2.5 py-1 rounded-lg border border-[#E8E1D2] bg-white text-xs font-bold text-[#111111] hover:bg-[#FFF8E8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          title="Previous Page"
          type="button"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-xs">Prev</span>
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1 mx-1">
          {pageNumbers.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1 text-xs text-[#777777] font-semibold">
                  ...
                </span>
              );
            }
            const isCurrent = p === currentPage;
            return (
              <button
                key={p}
                onClick={() => onPageChange(Number(p))}
                type="button"
                className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-[#111111] text-[#F4C542] shadow-xs'
                    : 'bg-white border border-[#E8E1D2] text-[#111111] hover:bg-[#FFF8E8]'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-2.5 py-1 rounded-lg border border-[#E8E1D2] bg-white text-xs font-bold text-[#111111] hover:bg-[#FFF8E8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          title="Next Page"
          type="button"
        >
          <span className="hidden sm:inline text-xs">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page Button */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-[#E8E1D2] bg-white text-[#111111] hover:bg-[#FFF8E8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Last Page"
          type="button"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const ProgressPage: React.FC = () => {
  const { user, isInstitutionTeacher, isInstitutionAdmin } = useAuth();
  const isTeacherOrAdmin = isInstitutionTeacher || isInstitutionAdmin;

  // --- Student Personal View State ---
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [totalHours, setTotalHours] = useState('0.0');
  const [avgQuizScore, setAvgQuizScore] = useState<number | null>(null);
  const [quizCount, setQuizCount] = useState(0);
  const [overallProgressScore, setOverallProgressScore] = useState(0);
  const [masteryStatus, setMasteryStatus] = useState('Developing');
  const [studentActiveTab, setStudentActiveTab] = useState<'study_logs' | 'quizzes'>('study_logs');
  const [isLoading, setIsLoading] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [subject, setSubject] = useState('CS 301 Distributed Systems');
  const [duration, setDuration] = useState('60');
  const [topic, setTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Teacher / Educator Students Progress State ---
  const [institutionInfo, setInstitutionInfo] = useState<{
    _id?: string;
    name: string;
    code: string;
    departments: string[];
  } | null>(null);
  const [metrics, setMetrics] = useState<CohortMetrics>({
    totalStudents: 0,
    totalStudyHours: '0.0',
    avgStudyHours: '0.0',
    totalSessions: 0,
    avgSessions: 0,
    avgGpa: '0.00',
    avgStreak: 0,
    avgAssignmentGrade: 'N/A',
    activeLearnersCount: 0,
    avgQuizScore: 'N/A',
    totalQuizzesTaken: 0,
  });
  const [students, setStudents] = useState<StudentProgressData[]>([]);
  const [subjectBreakdown, setSubjectBreakdown] = useState<SubjectBreakdown[]>([]);
  const [teacherClassrooms, setTeacherClassrooms] = useState<any[]>([]);

  // Filter & search state for Teacher
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedClassroom, setSelectedClassroom] = useState('all');
  const [assignedTeacherFilter, setAssignedTeacherFilter] = useState<string>('all');
  const [teachersList, setTeachersList] = useState<any[]>([]);

  // Selected student for detailed logs modal
  const [inspectStudent, setInspectStudent] = useState<StudentProgressData | null>(null);
  const [inspectTab, setInspectTab] = useState<'logs' | 'quizzes' | 'submissions'>('logs');

  // Teacher Student Progress Pagination State (Page-wise moving instead of scroll-down)
  const [teacherPage, setTeacherPage] = useState<number>(1);
  const [teacherPageSize, setTeacherPageSize] = useState<number>(5);

  // Inspect Modal Pagination State
  const [inspectLogPage, setInspectLogPage] = useState<number>(1);
  const [inspectQuizPage, setInspectQuizPage] = useState<number>(1);

  // Student Personal View Pagination State
  const [studentLogPage, setStudentLogPage] = useState<number>(1);
  const [studentQuizPage, setStudentQuizPage] = useState<number>(1);

  // Enroll Student Modal State
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [stName, setStName] = useState('');
  const [stEmail, setStEmail] = useState('');
  const [stPassword, setStPassword] = useState('');
  const [stRoll, setStRoll] = useState('');
  const [stDept, setStDept] = useState('');
  const [stAssignedTeacher, setStAssignedTeacher] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollMsg, setEnrollMsg] = useState<string | null>(null);

  // Generated Student Credentials Modal
  const [createdStudentCredentials, setCreatedStudentCredentials] = useState<{
    name: string;
    email: string;
    password: string;
    studentIdNumber: string;
    department: string;
    assignedTeacherName: string;
  } | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // Reassign Teacher Modal
  const [assigningStudent, setAssigningStudent] = useState<StudentProgressData | null>(null);
  const [selectedTeacherForAssign, setSelectedTeacherForAssign] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch personal student progress
  const fetchPersonalProgress = async () => {
    try {
      setIsLoading(true);
      const res = await API.get('/progress');
      if (res.data.success) {
        setLogs(res.data.logs || []);
        setAssessments(res.data.assessments || []);
        setTotalHours(res.data.totalHours || '0.0');
        setAvgQuizScore(res.data.avgQuizScore);
        setQuizCount(res.data.quizCount || 0);
        setOverallProgressScore(res.data.overallProgressScore || 0);
        setMasteryStatus(res.data.masteryStatus || 'Developing');
      }
    } catch (err) {
      console.error('Fetch progress error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch institution students progress for teacher
  const fetchTeacherStudentsProgress = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (selectedDept !== 'all') params.department = selectedDept;
      if (selectedClassroom !== 'all') params.classroomId = selectedClassroom;
      if (assignedTeacherFilter !== 'all') params.assignedTeacher = assignedTeacherFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const [res, teachRes] = await Promise.all([
        API.get('/progress/institution-students', { params }),
        API.get('/institutions/my-institution/teachers'),
      ]);

      if (res.data.success) {
        setInstitutionInfo(res.data.institution);
        setMetrics(res.data.metrics);
        setStudents(res.data.students || []);
        setSubjectBreakdown(res.data.subjectBreakdown || []);
        setTeacherClassrooms(res.data.teacherClassrooms || []);
        if (!stDept && res.data.institution?.departments?.length > 0) {
          setStDept(res.data.institution.departments[0]);
        }
      }

      if (teachRes.data.success && Array.isArray(teachRes.data.teachers)) {
        setTeachersList(teachRes.data.teachers);
      }
    } catch (err) {
      console.error('Fetch teacher students progress error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTeacherPage(1);
    if (isTeacherOrAdmin) {
      fetchTeacherStudentsProgress();
    } else {
      fetchPersonalProgress();
    }
  }, [isTeacherOrAdmin, selectedDept, selectedClassroom, assignedTeacherFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherPage(1);
    if (isTeacherOrAdmin) {
      fetchTeacherStudentsProgress();
    }
  };

  // Student Add Log handler
  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await API.post('/progress', {
        subject,
        durationMinutes: parseInt(duration, 10) || 60,
        topic,
      });

      if (res.data.success && res.data.log) {
        setTopic('');
        setIsAdding(false);
        fetchPersonalProgress();
      }
    } catch (err) {
      console.error('Add study log error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enroll Student Handler for Teachers & Admins
  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stName.trim() || !stEmail.trim() || !stPassword) return;

    try {
      setIsEnrolling(true);
      setEnrollMsg(null);
      const chosenTeacher = stAssignedTeacher || (isInstitutionTeacher ? user?._id : '');
      const res = await API.post('/institutions/my-institution/students', {
        name: stName.trim(),
        email: stEmail.trim(),
        password: stPassword,
        studentIdNumber: stRoll.trim(),
        department: stDept.trim(),
        assignedTeacher: chosenTeacher,
      });

      if (res.data.success) {
        setIsEnrollModalOpen(false);
        setCreatedStudentCredentials({
          name: stName.trim(),
          email: stEmail.trim(),
          password: stPassword,
          studentIdNumber: stRoll.trim() || res.data.student?.studentIdNumber || 'STU-ID',
          department: stDept.trim(),
          assignedTeacherName: res.data.student?.assignedTeacherName || (isInstitutionTeacher ? user?.name : 'Unassigned'),
        });
        setStName('');
        setStEmail('');
        setStPassword('');
        setStRoll('');
        setStAssignedTeacher('');
        fetchTeacherStudentsProgress();
      }
    } catch (err: any) {
      setEnrollMsg(err.response?.data?.message || err.message || 'Failed to enroll student.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleAssignTeacher = async (studentId: string, teacherId: string) => {
    try {
      setIsAssigning(true);
      const res = await API.put(`/institutions/my-institution/students/${studentId}/assign-teacher`, {
        teacherId,
      });
      if (res.data.success) {
        setAssigningStudent(null);
        fetchTeacherStudentsProgress();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign teacher.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCopyCredentials = (creds: {
    name: string;
    email: string;
    password: string;
    studentIdNumber: string;
    department: string;
    assignedTeacherName: string;
  }) => {
    const text = `🎓 Synexora Student Account Credentials\nInstitution: ${institutionInfo?.name || 'Synexora Campus'}\nStudent Name: ${creds.name}\nRoll / Student ID: ${creds.studentIdNumber}\nDepartment: ${creds.department}\nAssigned Teacher: ${creds.assignedTeacherName || 'N/A'}\n\nLogin URL: ${window.location.origin}/login\nEmail: ${creds.email}\nTemporary Password: ${creds.password}\n\nPlease change your password upon initial login.`;
    navigator.clipboard.writeText(text);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2500);
  };

  // Student Delete Log handler
  const handleDelete = async (id: string) => {
    try {
      const res = await API.delete(`/progress/${id}`);
      if (res.data.success) {
        fetchPersonalProgress();
      }
    } catch (err) {
      console.error('Delete log error:', err);
    }
  };

  const getMasteryLabel = (mastery: any) => {
    if (!mastery) return 'Developing';
    if (typeof mastery === 'object' && mastery.label) return mastery.label;
    return String(mastery);
  };

  const getMasteryColor = (status: any) => {
    const label = typeof status === 'object' && status?.label ? status.label : String(status || 'Developing');
    switch (label) {
      case 'Exemplary':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Proficient':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Developing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  // --- Pagination Computations ---
  // Teacher Students Directory
  const totalTeacherStudents = students.length;
  const totalTeacherPages = Math.max(1, Math.ceil(totalTeacherStudents / teacherPageSize));
  const currentTeacherPage = Math.min(Math.max(1, teacherPage), totalTeacherPages);
  const paginatedStudents = students.slice(
    (currentTeacherPage - 1) * teacherPageSize,
    currentTeacherPage * teacherPageSize
  );

  // Inspect Modal Log & Quiz Pagination
  const inspectLogPageSize = 4;
  const totalInspectLogs = inspectStudent?.recentLogs?.length || 0;
  const totalInspectLogPages = Math.max(1, Math.ceil(totalInspectLogs / inspectLogPageSize));
  const currentInspectLogPage = Math.min(Math.max(1, inspectLogPage), totalInspectLogPages);
  const paginatedInspectLogs = (inspectStudent?.recentLogs || []).slice(
    (currentInspectLogPage - 1) * inspectLogPageSize,
    currentInspectLogPage * inspectLogPageSize
  );

  const inspectQuizPageSize = 4;
  const totalInspectQuizzes = inspectStudent?.recentAssessments?.length || 0;
  const totalInspectQuizPages = Math.max(1, Math.ceil(totalInspectQuizzes / inspectQuizPageSize));
  const currentInspectQuizPage = Math.min(Math.max(1, inspectQuizPage), totalInspectQuizPages);
  const paginatedInspectQuizzes = (inspectStudent?.recentAssessments || []).slice(
    (currentInspectQuizPage - 1) * inspectQuizPageSize,
    currentInspectQuizPage * inspectQuizPageSize
  );

  // Student Personal View Pagination
  const studentLogPageSize = 5;
  const totalStudentLogs = logs.length;
  const totalStudentLogPages = Math.max(1, Math.ceil(totalStudentLogs / studentLogPageSize));
  const currentStudentLogPage = Math.min(Math.max(1, studentLogPage), totalStudentLogPages);
  const paginatedStudentLogs = logs.slice(
    (currentStudentLogPage - 1) * studentLogPageSize,
    currentStudentLogPage * studentLogPageSize
  );

  const studentQuizPageSize = 5;
  const totalStudentQuizzes = assessments.length;
  const totalStudentQuizPages = Math.max(1, Math.ceil(totalStudentQuizzes / studentQuizPageSize));
  const currentStudentQuizPage = Math.min(Math.max(1, studentQuizPage), totalStudentQuizPages);
  const paginatedStudentQuizzes = assessments.slice(
    (currentStudentQuizPage - 1) * studentQuizPageSize,
    currentStudentQuizPage * studentQuizPageSize
  );

  // =========================================================================
  // RENDER: TEACHER / INSTRUCTOR "STUDENTS PROGRESS" VIEW
  // =========================================================================
  if (isTeacherOrAdmin) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-fade-in">
          {/* Header Banner */}
          <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl p-6 sm:p-7 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold shadow-xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight">
                      Students Progress & Academic Telemetry
                    </h1>
                    <p className="text-xs text-[#777777] mt-0.5">
                      {institutionInfo ? (
                        <span>
                          Institution: <strong className="text-[#111111]">{institutionInfo.name}</strong> ({institutionInfo.code}) • Tracking Quiz performance, manual study logs & overall mastery.
                        </span>
                      ) : (
                        'Track student quiz scores, manually logged study sessions, and cohort mastery telemetry.'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Summary Pill */}
              <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
                <button
                  onClick={() => {
                    setEnrollMsg(null);
                    setStAssignedTeacher(isInstitutionTeacher ? user?._id || '' : '');
                    setIsEnrollModalOpen(true);
                  }}
                  className="btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Enroll Student</span>
                </button>

                <div className="flex items-center gap-2 bg-[#FFF8E8] border border-[#E8E1D2] px-3.5 py-1.5 rounded-full">
                  <Building2 className="w-3.5 h-3.5 text-[#111111]" />
                  <span className="text-xs font-bold text-[#111111]">
                    {metrics.totalStudents} Students
                  </span>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="mt-5 pt-5 border-t border-[#E8E1D2]/70 flex flex-col sm:flex-row items-center gap-3 flex-wrap">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[220px] w-full">
                <Search className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by student name, email, roll ID, or teacher..."
                  className="input-clean pl-10 text-xs font-medium w-full"
                />
              </form>

              {/* Department Filter */}
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="input-clean text-xs font-semibold sm:w-44 w-full bg-white"
              >
                <option value="all">All Departments</option>
                {institutionInfo?.departments?.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              {/* Assigned Teacher Filter */}
              <select
                value={assignedTeacherFilter}
                onChange={(e) => setAssignedTeacherFilter(e.target.value)}
                className="input-clean text-xs font-bold sm:w-48 w-full bg-white text-[#111111]"
              >
                <option value="all">All Teacher Allotments</option>
                {isInstitutionTeacher && <option value="me">⭐ My Assigned Students</option>}
                <option value="unassigned">⚠️ Unassigned Students</option>
                {teachersList.map((tc) => (
                  <option key={tc._id} value={tc._id}>
                    Prof. {tc.name} ({tc.department})
                  </option>
                ))}
              </select>

              {/* Classroom Filter */}
              {teacherClassrooms.length > 0 && (
                <select
                  value={selectedClassroom}
                  onChange={(e) => setSelectedClassroom(e.target.value)}
                  className="input-clean text-xs font-semibold sm:w-44 w-full bg-white"
                >
                  <option value="all">All Classrooms</option>
                  {teacherClassrooms.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.section || c.code})
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={fetchTeacherStudentsProgress}
                className="btn-secondary text-xs py-2 px-4 font-bold flex items-center gap-1.5 w-full sm:w-auto justify-center"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* OVERALL AVERAGE PROGRESS REPORT (Top KPI Metric Cards) */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-extrabold text-[#111111] uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-[#111111]" />
                Cohort Overall Progress & Telemetry Report
              </h2>
              <span className="text-[11px] text-[#777777] font-semibold">
                Strictly scoped to {institutionInfo?.name || 'your institution'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Study Time & Sessions */}
              <div className="card-clean-interactive p-5">
                <div className="flex items-center justify-between text-[#777777] mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Study Time Logged</span>
                  <div className="w-8 h-8 rounded-full bg-[#FFF8E8] text-[#111111] flex items-center justify-center">
                    <Clock className="w-4 h-4 text-[#111111]" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-[#111111] tracking-tight">
                  {metrics.avgStudyHours} <span className="text-sm font-semibold text-[#777777]">hrs / student</span>
                </p>
                <p className="text-[11px] text-[#777777] mt-1">
                  Cohort total: <strong className="text-[#111111]">{metrics.totalStudyHours} hrs</strong> ({metrics.totalSessions} sessions)
                </p>
              </div>

              {/* Card 2: Quiz Performance */}
              <div className="card-clean-interactive p-5">
                <div className="flex items-center justify-between text-[#777777] mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Quiz & AI Accuracy</span>
                  <div className="w-8 h-8 rounded-full bg-[#FFF8E8] text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-[#111111] tracking-tight">
                  {metrics.avgQuizScore || 'N/A'}
                </p>
                <p className="text-[11px] text-[#777777] mt-1">
                  Total quizzes taken: <strong className="text-[#111111]">{metrics.totalQuizzesTaken || 0}</strong>
                </p>
              </div>

              {/* Card 3: Assignment & Academic Mastery */}
              <div className="card-clean-interactive p-5">
                <div className="flex items-center justify-between text-[#777777] mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Assignment Grade</span>
                  <div className="w-8 h-8 rounded-full bg-[#FFF8E8] text-[#111111] flex items-center justify-center">
                    <Award className="w-4 h-4 text-[#111111]" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-[#111111] tracking-tight">
                  {metrics.avgAssignmentGrade}
                </p>
                <p className="text-[11px] text-[#777777] mt-1">
                  Average GPA: <strong className="text-[#111111]">{metrics.avgGpa}</strong>
                </p>
              </div>

              {/* Card 4: Active Learners & Streak */}
              <div className="card-clean-interactive p-5">
                <div className="flex items-center justify-between text-[#777777] mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Active Learners</span>
                  <div className="w-8 h-8 rounded-full bg-[#FFF8E8] text-[#F4C542] flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-[#111111] tracking-tight">
                  {metrics.activeLearnersCount} <span className="text-sm font-semibold text-[#777777]">/ {metrics.totalStudents}</span>
                </p>
                <p className="text-[11px] text-[#777777] mt-1">
                  Avg streak: <strong className="text-[#111111]">{metrics.avgStreak} days</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Subject Volume Breakdown Bar */}
          {subjectBreakdown.length > 0 && (
            <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl p-5 shadow-xs">
              <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-3">
                Top Studied Subjects in Institution
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {subjectBreakdown.map((sb, idx) => (
                  <div key={idx} className="bg-[#FFF8E8]/70 border border-[#E8E1D2] rounded-2xl p-3">
                    <p className="text-xs font-bold text-[#111111] truncate" title={sb.subject}>
                      {sb.subject}
                    </p>
                    <p className="text-lg font-extrabold text-[#111111] mt-1">
                      {sb.totalHours} <span className="text-[10px] font-semibold text-[#777777]">hrs</span>
                    </p>
                    <p className="text-[10px] text-[#777777] mt-0.5 font-medium">{sb.totalMinutes} total mins</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEPARATE INDIVIDUAL STUDENTS PROGRESS DIRECTORY */}
          <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl overflow-hidden shadow-xs">
            <div className="px-6 py-5 border-b border-[#E8E1D2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-extrabold text-[#111111]">
                  Institution Students Progress Directory
                </h2>
                <p className="text-xs text-[#777777] mt-0.5">
                  Track individual student quiz performance, study hours, and teacher mentor assignment.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-[#777777] font-semibold bg-[#FFF8E8] px-3 py-1 rounded-full border border-[#E8E1D2]">
                  {students.length} Students Total
                </span>
                {totalTeacherPages > 1 && (
                  <span className="text-xs font-bold text-[#111111] bg-[#FFFDF7] px-3 py-1 rounded-full border border-[#E8E1D2]">
                    Page {currentTeacherPage} of {totalTeacherPages}
                  </span>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-[#777777] text-sm flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
                <span>Loading student progress telemetry...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="p-12 text-center text-[#777777] text-sm">
                No institution students found matching the selected filter criteria.
              </div>
            ) : (
              <>
                <div className="divide-y divide-[#E8E1D2]/60">
                  {paginatedStudents.map((st) => {
                    const isAssignedToMe = isInstitutionTeacher && (st.assignedTeacher === user?._id || st.assignedTeacher?._id === user?._id);

                    return (
                      <div
                        key={st._id}
                        className="p-5 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#FFF8E8]/30 transition-colors"
                      >
                        {/* Left: Student Profile Info */}
                        <div className="flex items-center gap-3.5 min-w-[260px]">
                          <div className="w-10 h-10 rounded-full bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                            {st.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-[#111111]">{st.name}</span>
                              <span className="text-[10px] bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2] px-2 py-0.5 rounded-full font-bold">
                                ID: {st.studentIdNumber}
                              </span>
                              {isAssignedToMe && (
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#F4C542] text-[#111111] shadow-2xs">
                                  My Student
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#777777]">{st.email}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-[#777777]">
                              <span>Dept: <strong className="text-[#111111]">{st.department}</strong></span>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-semibold text-[#111111]">
                                <GraduationCap className="w-3 h-3 text-[#111111]" />
                                {st.assignedTeacherName && st.assignedTeacherName !== 'Unassigned' ? `Prof. ${st.assignedTeacherName}` : 'Unassigned'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Middle: Progress Telemetry Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left flex-1 max-w-2xl">
                          {/* Stat 1: Study Time */}
                          <div className="bg-[#FFFDF7] p-2.5 rounded-2xl border border-[#E8E1D2]">
                            <span className="text-[10px] font-bold uppercase text-[#777777] block">Study Hours</span>
                            <span className="text-base font-extrabold text-[#111111]">{st.totalHours} hrs</span>
                            <span className="text-[10px] text-[#777777] block">{st.sessionCount} sessions</span>
                          </div>

                          {/* Stat 2: Quizzes & Evaluations */}
                          <div className="bg-[#FFFDF7] p-2.5 rounded-2xl border border-[#E8E1D2]">
                            <span className="text-[10px] font-bold uppercase text-[#777777] block">Quiz Accuracy</span>
                            <span className="text-base font-extrabold text-emerald-700">
                              {st.avgQuizScore !== null ? `${st.avgQuizScore}%` : 'N/A'}
                            </span>
                            <span className="text-[10px] text-[#777777] block">{st.quizCount || 0} quizzes</span>
                          </div>

                          {/* Stat 3: Avg Assignment Grade */}
                          <div className="bg-[#FFFDF7] p-2.5 rounded-2xl border border-[#E8E1D2]">
                            <span className="text-[10px] font-bold uppercase text-[#777777] block">Assignment Grade</span>
                            <span className="text-base font-extrabold text-[#111111]">
                              {st.avgAssignmentGrade ? `${st.avgAssignmentGrade}%` : 'N/A'}
                            </span>
                            <span className="text-[10px] text-[#777777] block">{st.submissionsCount} submitted</span>
                          </div>

                          {/* Stat 4: Overall Progress & Mastery Badge */}
                          <div className="bg-[#FFFDF7] p-2.5 rounded-2xl border border-[#E8E1D2] flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] font-bold uppercase text-[#777777] block">Overall Progress</span>
                              <span className="text-base font-extrabold text-[#111111]">{st.overallProgressScore}%</span>
                            </div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border self-start mt-1 ${getMasteryColor(st.masteryStatus)}`}>
                              {getMasteryLabel(st.masteryStatus)}
                            </span>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 self-end lg:self-center flex-wrap">
                          <button
                            onClick={() => {
                              setAssigningStudent(st);
                              setSelectedTeacherForAssign(
                                st.assignedTeacher?._id || st.assignedTeacher || (isInstitutionTeacher ? user?._id || '' : '')
                              );
                            }}
                            className="btn-secondary text-xs py-2 px-3 font-bold flex items-center gap-1"
                            title="Assign or reassign teacher"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-[#111111]" />
                            <span>{st.assignedTeacherName && st.assignedTeacherName !== 'Unassigned' ? 'Change Teacher' : 'Assign Teacher'}</span>
                          </button>

                          <button
                            onClick={() => {
                              setInspectStudent(st);
                              setInspectTab('logs');
                              setInspectLogPage(1);
                              setInspectQuizPage(1);
                            }}
                            className="btn-primary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect Progress</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Page Navigation Controls */}
                <PaginationBar
                  currentPage={currentTeacherPage}
                  totalPages={totalTeacherPages}
                  totalItems={totalTeacherStudents}
                  pageSize={teacherPageSize}
                  onPageChange={(p) => setTeacherPage(p)}
                  onPageSizeChange={(sz) => {
                    setTeacherPageSize(sz);
                    setTeacherPage(1);
                  }}
                  pageSizeOptions={[5, 10, 20]}
                  itemLabel="students"
                />
              </>
            )}
          </div>

          {/* INSPECTION MODAL: DETAILED INDIVIDUAL STUDENT TELEMETRY & LOGS */}
          {inspectStudent && (
            <div className="fixed inset-0 z-50 bg-[#111111]/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in">
                {/* Modal Header */}
                <div className="p-6 border-b border-[#E8E1D2] flex items-center justify-between bg-[#FFF8E8]/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold">
                      {inspectStudent.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-[#111111]">
                          {inspectStudent.name}'s Academic Telemetry
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getMasteryColor(inspectStudent.masteryStatus)}`}>
                          {getMasteryLabel(inspectStudent.masteryStatus)} ({inspectStudent.overallProgressScore}%)
                        </span>
                      </div>
                      <p className="text-xs text-[#777777]">
                        {inspectStudent.email} • ID: {inspectStudent.studentIdNumber} • {inspectStudent.department}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectStudent(null)}
                    className="p-1.5 text-[#777777] hover:text-[#111111] hover:bg-[#FFF8E8] rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Summary KPI */}
                <div className="grid grid-cols-4 gap-2 p-4 bg-[#FFFDF7] border-b border-[#E8E1D2] text-center">
                  <div>
                    <span className="text-[10px] font-bold text-[#777777] uppercase block">Study Time</span>
                    <p className="text-base font-extrabold text-[#111111]">{inspectStudent.totalHours} hrs</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#777777] uppercase block">Study Blocks</span>
                    <p className="text-base font-extrabold text-[#111111]">{inspectStudent.sessionCount}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#777777] uppercase block">Quiz Accuracy</span>
                    <p className="text-base font-extrabold text-emerald-700">
                      {inspectStudent.avgQuizScore !== null ? `${inspectStudent.avgQuizScore}%` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#777777] uppercase block">Avg Assignment</span>
                    <p className="text-base font-extrabold text-[#111111]">
                      {inspectStudent.avgAssignmentGrade ? `${inspectStudent.avgAssignmentGrade}%` : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Modal Tabs Navigation */}
                <div className="flex border-b border-[#E8E1D2] bg-[#FFF8E8]/30 px-6">
                  <button
                    onClick={() => setInspectTab('logs')}
                    className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                      inspectTab === 'logs'
                        ? 'border-[#111111] text-[#111111]'
                        : 'border-transparent text-[#777777] hover:text-[#111111]'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>📚 Manually Logged Lessons ({inspectStudent.recentLogs.length})</span>
                  </button>
                  <button
                    onClick={() => setInspectTab('quizzes')}
                    className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                      inspectTab === 'quizzes'
                        ? 'border-[#111111] text-[#111111]'
                        : 'border-transparent text-[#777777] hover:text-[#111111]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>🎯 Completed Quizzes ({inspectStudent.recentAssessments?.length || 0})</span>
                  </button>
                </div>

                {/* Modal Tab Content */}
                <div className="p-6 overflow-y-auto space-y-3 flex-1">
                  {inspectTab === 'logs' && (
                    <>
                      <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
                        Manually Logged Study Sessions
                      </h4>
                      {inspectStudent.recentLogs.length === 0 ? (
                        <div className="text-center py-8 text-xs text-[#777777]">
                          This student has not logged any study sessions yet.
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            {paginatedInspectLogs.map((l, i) => (
                              <div
                                key={i}
                                className="p-3.5 bg-[#FFFDF7] border border-[#E8E1D2] rounded-2xl flex items-center justify-between hover:bg-[#FFF8E8]/40 transition-colors"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-[#111111]">{l.subject}</span>
                                    <span className="text-[10px] bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2] px-2 py-0.5 rounded-full font-bold">
                                      {l.durationMinutes} min
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#3F3F3F] mt-1 font-medium">{l.topic}</p>
                                </div>
                                <span className="text-[11px] text-[#777777] font-medium flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-[#777777]" />
                                  {l.date}
                                </span>
                              </div>
                            ))}
                          </div>
                          <PaginationBar
                            currentPage={currentInspectLogPage}
                            totalPages={totalInspectLogPages}
                            totalItems={totalInspectLogs}
                            pageSize={inspectLogPageSize}
                            onPageChange={(p) => setInspectLogPage(p)}
                            itemLabel="lessons"
                            compact={true}
                          />
                        </>
                      )}
                    </>
                  )}

                  {inspectTab === 'quizzes' && (
                    <>
                      <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
                        Completed Quizzes & Evaluation Results
                      </h4>
                      {!inspectStudent.recentAssessments || inspectStudent.recentAssessments.length === 0 ? (
                        <div className="text-center py-8 text-xs text-[#777777]">
                          This student has not completed any interactive quizzes yet.
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            {paginatedInspectQuizzes.map((quiz, i) => (
                              <div
                                key={i}
                                className="p-3.5 bg-[#FFFDF7] border border-[#E8E1D2] rounded-2xl flex items-center justify-between hover:bg-[#FFF8E8]/40 transition-colors"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-[#111111]">{quiz.title}</span>
                                    <span className="text-[10px] bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2] px-2 py-0.5 rounded-full font-bold">
                                      {quiz.course || 'Quiz Evaluation'}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#777777] mt-0.5 font-medium">Status: {quiz.status || 'Completed'}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                                    {quiz.score}
                                  </span>
                                  <span className="text-[11px] text-[#777777] font-medium flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-[#777777]" />
                                    {quiz.date}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <PaginationBar
                            currentPage={currentInspectQuizPage}
                            totalPages={totalInspectQuizPages}
                            totalItems={totalInspectQuizzes}
                            pageSize={inspectQuizPageSize}
                            onPageChange={(p) => setInspectQuizPage(p)}
                            itemLabel="quizzes"
                            compact={true}
                          />
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-[#E8E1D2] bg-[#FFFFFF] flex justify-end">
                  <button
                    onClick={() => setInspectStudent(null)}
                    className="btn-secondary text-xs py-2 px-5 font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL: ENROLL STUDENT & ISSUE LOGIN */}
          {isEnrollModalOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex min-h-screen items-center justify-center p-4 sm:p-6">
              <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E8E1D2] overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
                <div className="p-6 pb-4 border-b border-[#E8E1D2] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2] flex items-center justify-center font-bold">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[#111111]">Enroll Student & Issue Login</h3>
                      <p className="text-[11px] text-[#777777]">Provision student credentials under {institutionInfo?.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEnrollModalOpen(false)}
                    className="p-1.5 rounded-full hover:bg-[#FFF8E8] text-[#777777] hover:text-[#111111] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleEnrollStudent}>
                  <div className="p-6 space-y-4 text-xs">
                    {enrollMsg && (
                      <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-semibold">
                        {enrollMsg}
                      </div>
                    )}

                    <div>
                      <label className="font-bold text-[#111111] block mb-1.5">Student Full Name</label>
                      <input
                        type="text"
                        required
                        value={stName}
                        onChange={(e) => setStName(e.target.value)}
                        placeholder="e.g. Alex Johnson"
                        className="input-clean"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#111111] block mb-1.5">Student Institutional Email (Username)</label>
                      <input
                        type="email"
                        required
                        value={stEmail}
                        onChange={(e) => setStEmail(e.target.value)}
                        placeholder="alex.johnson@synexora.edu"
                        className="input-clean"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-[#111111] block mb-1.5">Student Roll / ID</label>
                        <input
                          type="text"
                          value={stRoll}
                          onChange={(e) => setStRoll(e.target.value)}
                          placeholder="e.g. STU-2026-001"
                          className="input-clean font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[#111111] block mb-1.5">Department</label>
                        <select
                          value={stDept}
                          onChange={(e) => setStDept(e.target.value)}
                          className="input-clean font-semibold"
                        >
                          {institutionInfo?.departments?.map((d, idx) => (
                            <option key={idx} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Allot Assigned Teacher */}
                    <div>
                      <label className="font-bold text-[#111111] block mb-1.5 flex items-center justify-between">
                        <span>Assign Teacher / Mentor</span>
                        {isInstitutionTeacher && (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Auto-allots to you
                          </span>
                        )}
                      </label>
                      <select
                        value={stAssignedTeacher}
                        onChange={(e) => setStAssignedTeacher(e.target.value)}
                        className="input-clean font-semibold"
                      >
                        {isInstitutionTeacher && (
                          <option value={user?._id}>
                            ⭐ Myself ({user?.name} - {user?.department || 'Faculty'})
                          </option>
                        )}
                        <option value="">-- Leave Unassigned / Allot Later --</option>
                        {teachersList
                          .filter((t) => !isInstitutionTeacher || t._id !== user?._id)
                          .map((tc) => (
                            <option key={tc._id} value={tc._id}>
                              Prof. {tc.name} ({tc.department} • {tc.designation || 'Faculty'})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-[#111111] block mb-1.5 flex items-center justify-between">
                        <span>Temporary Password (For Student Login)</span>
                        <span className="text-[10px] text-[#777777] font-normal">Min 6 chars</span>
                      </label>
                      <div className="relative">
                        <Key className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={stPassword}
                          onChange={(e) => setStPassword(e.target.value)}
                          placeholder="StudentPass123!"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#FFF8E8] border border-[#E8E1D2] rounded-2xl text-xs font-mono text-[#111111] placeholder:text-[#777777] focus:bg-white focus:border-[#111111] focus:ring-2 focus:ring-[#111111] outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-[#FFF8E8]/50 border-t border-[#E8E1D2] flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEnrollModalOpen(false)}
                      className="btn-secondary text-xs py-2 px-4 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isEnrolling || !stName.trim()}
                      className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-2 shadow-xs"
                    >
                      {isEnrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      <span>{isEnrolling ? 'Enrolling...' : 'Enroll & Issue Credentials'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: STUDENT CREDENTIALS HANDOVER */}
          {createdStudentCredentials && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 backdrop-blur-sm flex min-h-screen items-center justify-center p-4">
              <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E8E1D2] p-6 space-y-4 animate-in fade-in zoom-in duration-200">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold text-xl shadow-md">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#111111]">Student Account Created!</h3>
                  <p className="text-xs text-[#777777]">
                    Hand over these student login credentials directly to the student.
                  </p>
                </div>

                <div className="p-4 bg-[#FFF8E8] border border-[#E8E1D2] rounded-2xl space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-[#E8E1D2] pb-1.5">
                    <span className="text-[#777777]">Student Name:</span>
                    <strong className="text-[#111111] font-sans">{createdStudentCredentials.name}</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#E8E1D2] pb-1.5">
                    <span className="text-[#777777]">Login Email:</span>
                    <strong className="text-[#111111]">{createdStudentCredentials.email}</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#E8E1D2] pb-1.5">
                    <span className="text-[#777777]">Temporary Password:</span>
                    <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {createdStudentCredentials.password}
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-[#E8E1D2] pb-1.5">
                    <span className="text-[#777777]">Roll / ID:</span>
                    <span className="text-[#111111]">{createdStudentCredentials.studentIdNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#777777]">Assigned Teacher:</span>
                    <span className="text-[#111111] font-bold font-sans">
                      {createdStudentCredentials.assignedTeacherName}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleCopyCredentials(createdStudentCredentials)}
                    className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                  >
                    {copiedCreds ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCreds ? 'Copied Login Credentials!' : 'Copy Login Credentials'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreatedStudentCredentials(null)}
                    className="btn-secondary w-full py-2 text-xs font-bold"
                  >
                    Done / Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL: ASSIGN / REASSIGN TEACHER TO STUDENT */}
          {assigningStudent && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex min-h-screen items-center justify-center p-4">
              <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E8E1D2] p-6 space-y-4 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D2]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#111111]">Assign Teacher</h3>
                      <p className="text-[11px] text-[#777777]">Allot teacher mentor for {assigningStudent.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAssigningStudent(null)}
                    className="p-1.5 rounded-full hover:bg-[#FFF8E8] text-[#777777] hover:text-[#111111]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-[#111111] block mb-1">Select Teacher / Faculty Member</label>
                    <select
                      value={selectedTeacherForAssign}
                      onChange={(e) => setSelectedTeacherForAssign(e.target.value)}
                      className="input-clean text-xs font-semibold w-full"
                    >
                      {isInstitutionTeacher && (
                        <option value={user?._id}>
                          ⭐ Myself ({user?.name} - {user?.department || 'Faculty'})
                        </option>
                      )}
                      <option value="unassigned">-- Unassigned --</option>
                      {teachersList
                        .filter((t) => !isInstitutionTeacher || t._id !== user?._id)
                        .map((tc) => (
                          <option key={tc._id} value={tc._id}>
                            Prof. {tc.name} ({tc.department} • {tc.designation || 'Faculty'})
                          </option>
                        ))}
                    </select>
                  </div>

                  <p className="text-[11px] text-[#777777]">
                    The assigned teacher will be designated as this student's faculty mentor and will track their academic progress telemetry.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E1D2]">
                  <button
                    type="button"
                    onClick={() => setAssigningStudent(null)}
                    className="btn-secondary text-xs py-2 px-4 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAssignTeacher(assigningStudent._id, selectedTeacherForAssign)}
                    disabled={isAssigning}
                    className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5"
                  >
                    {isAssigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Save Allotment</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  // =========================================================================
  // RENDER: PERSONAL STUDENT / INDIVIDUAL LEARNER PROGRESS VIEW
  // =========================================================================
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight">
                Study Progress & Quiz Mastery
              </h1>
            </div>
            <p className="text-xs text-[#777777] mt-1">
              Track your quiz accuracy, manually logged study lessons, and overall mastery in real-time.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="btn-primary gap-1.5 self-start sm:self-auto text-xs font-bold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{isAdding ? 'Close Form' : 'Log Study Lesson'}</span>
            </button>
          </div>
        </div>

        {/* 4 Large Highlight Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Quiz Accuracy */}
          <div className="card-clean-interactive p-5">
            <div className="flex items-center justify-between text-[#777777] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Quiz Accuracy</span>
              <div className="w-8 h-8 rounded-full bg-[#FFF8E8] text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-emerald-700 tracking-tight">
              {avgQuizScore !== null ? `${avgQuizScore}%` : 'N/A'}
            </p>
            <p className="text-[11px] text-[#777777] mt-1">
              Across <strong className="text-[#111111]">{quizCount} completed quizzes</strong>
            </p>
          </div>

          {/* Card 2: Study Time */}
          <div className="card-clean-interactive p-5">
            <div className="flex items-center justify-between text-[#777777] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Study Time Logged</span>
              <div className="w-8 h-8 rounded-full bg-[#FFF8E8] text-[#111111] flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#111111]" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-[#111111] tracking-tight">
              {totalHours} <span className="text-base font-semibold text-[#777777]">hrs</span>
            </p>
            <p className="text-[11px] text-[#777777] mt-1">{logs.length} manually logged lessons</p>
          </div>

          {/* Card 3: Overall Mastery */}
          <div className="card-clean-interactive p-5">
            <div className="flex items-center justify-between text-[#777777] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Overall Progress</span>
              <div className="w-8 h-8 rounded-full bg-[#FFF8E8] text-[#111111] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#F4C542]" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-[#111111] tracking-tight">
              {overallProgressScore}%
            </p>
            <div className="mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getMasteryColor(masteryStatus)}`}>
                {getMasteryLabel(masteryStatus)}
              </span>
            </div>
          </div>

          {/* Card 4: Active Streak */}
          <div className="card-clean-interactive p-5">
            <div className="flex items-center justify-between text-[#777777] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Active Streak</span>
              <div className="w-8 h-8 rounded-full bg-[#FFF8E8] text-[#F4C542] flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-[#111111] tracking-tight">
              {user?.streak || 7} <span className="text-base font-semibold text-[#777777]">days</span>
            </p>
            <p className="text-[11px] text-[#777777] mt-1">Continuous learning streak</p>
          </div>
        </div>

        {/* Add Session Form */}
        {isAdding && (
          <form
            onSubmit={handleAddLog}
            className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl p-6 space-y-4 shadow-sm animate-fade-in"
          >
            <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
              Log Study Lesson Manually
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#777777] mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. CS 301 Distributed Systems"
                  required
                  className="input-clean text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#777777] mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="60"
                  required
                  className="input-clean text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#777777] mb-1">Topic / Lesson Summary</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Reviewed Raft consensus algorithm"
                  required
                  className="input-clean text-xs font-medium"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="btn-secondary text-xs py-2 px-4 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary text-xs py-2 px-5 font-bold disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Study Log'}
              </button>
            </div>
          </form>
        )}

        {/* Student Progress Sections (Tabs: Manually Logged Lessons & Completed Quizzes) */}
        <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl overflow-hidden shadow-xs">
          <div className="px-6 border-b border-[#E8E1D2] flex items-center justify-between bg-[#FFF8E8]/30">
            <div className="flex">
              <button
                onClick={() => setStudentActiveTab('study_logs')}
                className={`py-4 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                  studentActiveTab === 'study_logs'
                    ? 'border-[#111111] text-[#111111]'
                    : 'border-transparent text-[#777777] hover:text-[#111111]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>📚 Manually Logged Study Lessons ({logs.length})</span>
              </button>
              <button
                onClick={() => setStudentActiveTab('quizzes')}
                className={`py-4 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                  studentActiveTab === 'quizzes'
                    ? 'border-[#111111] text-[#111111]'
                    : 'border-transparent text-[#777777] hover:text-[#111111]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>🎯 Quiz & Evaluation History ({assessments.length})</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-[#E8E1D2]/60">
            {isLoading ? (
              <div className="p-8 text-center text-[#777777] text-sm flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
                <span>Loading your progress telemetry...</span>
              </div>
            ) : studentActiveTab === 'study_logs' ? (
              logs.length === 0 ? (
                <div className="p-8 text-center text-[#777777] text-sm">
                  No study lessons logged yet. Click "Log Study Lesson" above to record what you studied today!
                </div>
              ) : (
                <>
                  <div className="divide-y divide-[#E8E1D2]/60">
                    {paginatedStudentLogs.map((log) => (
                      <div
                        key={log._id}
                        className="p-4 sm:px-6 flex items-center justify-between hover:bg-[#FFF8E8]/40 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#111111]">{log.subject}</span>
                            <span className="text-[10px] bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2] px-2.5 py-0.5 rounded-full font-bold">
                              {log.durationMinutes} min
                            </span>
                          </div>
                          <p className="text-xs text-[#3F3F3F] mt-1 font-medium">{log.topic}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-[#777777] font-medium">{log.date}</span>
                          <button
                            onClick={() => handleDelete(log._id)}
                            className="p-1.5 text-[#777777] hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
                            title="Delete log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <PaginationBar
                    currentPage={currentStudentLogPage}
                    totalPages={totalStudentLogPages}
                    totalItems={totalStudentLogs}
                    pageSize={studentLogPageSize}
                    onPageChange={(p) => setStudentLogPage(p)}
                    itemLabel="lessons"
                  />
                </>
              )
            ) : assessments.length === 0 ? (
              <div className="p-8 text-center text-[#777777] text-sm">
                No quiz assessments completed yet. Take quizzes on your classroom or the Evaluation page to build up your quiz telemetry!
              </div>
            ) : (
              <>
                <div className="divide-y divide-[#E8E1D2]/60">
                  {paginatedStudentQuizzes.map((quiz) => (
                    <div
                      key={quiz._id}
                      className="p-4 sm:px-6 flex items-center justify-between hover:bg-[#FFF8E8]/40 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#111111]">{quiz.title}</span>
                          <span className="text-[10px] bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2] px-2.5 py-0.5 rounded-full font-bold">
                            {quiz.course || 'Evaluation'}
                          </span>
                        </div>
                        <p className="text-xs text-[#777777] mt-0.5 font-medium">Status: {quiz.status || 'Completed'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                          {quiz.score}
                        </span>
                        <span className="text-xs text-[#777777] font-medium">{quiz.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <PaginationBar
                  currentPage={currentStudentQuizPage}
                  totalPages={totalStudentQuizPages}
                  totalItems={totalStudentQuizzes}
                  pageSize={studentQuizPageSize}
                  onPageChange={(p) => setStudentQuizPage(p)}
                  itemLabel="quizzes"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

