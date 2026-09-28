import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import API from '../lib/api';
import {
  Users,
  Copy,
  Check,
  Search,
  Award,
  BookOpen,
  ShieldCheck,
  UserPlus,
  GraduationCap,
  Briefcase,
  Loader2,
  Mail,
  Building,
  Key,
  X,
  Sparkles,
  UserCheck,
  FileSpreadsheet,
  UploadCloud,
  Download,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface InstitutionDetails {
  _id: string;
  name: string;
  code: string;
  domain: string;
  plan: string;
  maxSeats: number;
  usedSeats: number;
  departments: string[];
  status: 'active' | 'pending_approval' | 'suspended';
  bannerTheme: string;
}

interface StudentItem {
  _id: string;
  name: string;
  email: string;
  studentIdNumber: string;
  department: string;
  batchYear: string;
  accountStatus: string;
  assignedTeacher?: any;
  assignedTeacherName?: string;
  createdAt: string;
}

interface TeacherItem {
  _id: string;
  name: string;
  email: string;
  facultyIdNumber?: string;
  designation?: string;
  department: string;
  accountStatus: string;
  createdAt: string;
}

interface Analytics {
  totalStudents: number;
  activeStudents: number;
  totalTeachers?: number;
  totalClassrooms: number;
  assessmentsCount: number;
  maxSeats: number;
  usedSeats: number;
  seatUtilizationPct: number;
  plan: string;
  status: string;
}

export const InstitutionPortalPage: React.FC = () => {
  const { user, isInstitutionAdmin, isInstitutionTeacher } = useAuth();
  const [institution, setInstitution] = useState<InstitutionDetails | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'teachers'>('overview');

  // Search & Filter
  const [studentSearch, setStudentSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [deptFilter] = useState('all');
  const [assignedTeacherFilter, setAssignedTeacherFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Copy code state
  const [copied, setCopied] = useState(false);

  // Enroll Student Modal
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollTab, setEnrollTab] = useState<'single' | 'excel'>('single');
  const [stName, setStName] = useState('');
  const [stEmail, setStEmail] = useState('');
  const [stPassword, setStPassword] = useState('');
  const [stRoll, setStRoll] = useState('');
  const [stDept, setStDept] = useState('');
  const [stAssignedTeacher, setStAssignedTeacher] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollMsg, setEnrollMsg] = useState<string | null>(null);

  // Excel Bulk Enrollment State
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelDefaultDept, setExcelDefaultDept] = useState('');
  const [excelDefaultTeacher, setExcelDefaultTeacher] = useState('');
  const [isUploadingExcel, setIsUploadingExcel] = useState(false);
  const [excelErrorMsg, setExcelErrorMsg] = useState<string | null>(null);
  const [isDownloadingSample, setIsDownloadingSample] = useState(false);

  // Excel Batch Result Modal
  const [batchResult, setBatchResult] = useState<{
    enrolledCount: number;
    skippedCount: number;
    students: any[];
    skipped: any[];
    excelBase64?: string;
    fileName?: string;
  } | null>(null);

  // Generated Student Credentials Modal (Single)
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
  const [assigningStudent, setAssigningStudent] = useState<StudentItem | null>(null);
  const [selectedTeacherForAssign, setSelectedTeacherForAssign] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Enroll Teacher Modal
  const [isEnrollTeacherModalOpen, setIsEnrollTeacherModalOpen] = useState(false);
  const [enrollTeacherTab, setEnrollTeacherTab] = useState<'single' | 'excel'>('single');
  const [tcName, setTcName] = useState('');
  const [tcEmail, setTcEmail] = useState('');
  const [tcPassword, setTcPassword] = useState('');
  const [tcFacultyId, setTcFacultyId] = useState('');
  const [tcDept, setTcDept] = useState('');
  const [tcDesignation, setTcDesignation] = useState('Assistant Professor');
  const [isEnrollingTeacher, setIsEnrollingTeacher] = useState(false);
  const [enrollTeacherMsg, setEnrollTeacherMsg] = useState<string | null>(null);

  // Teacher Excel Bulk Enrollment State
  const [excelTeacherFile, setExcelTeacherFile] = useState<File | null>(null);
  const [excelTeacherDept, setExcelTeacherDept] = useState('');
  const [excelTeacherDesignation, setExcelTeacherDesignation] = useState('Assistant Professor');
  const [isUploadingTeacherExcel, setIsUploadingTeacherExcel] = useState(false);
  const [excelTeacherErrorMsg, setExcelTeacherErrorMsg] = useState<string | null>(null);
  const [isDownloadingTeacherSample, setIsDownloadingTeacherSample] = useState(false);

  // Teacher Excel Batch Result Modal
  const [teacherBatchResult, setTeacherBatchResult] = useState<{
    enrolledCount: number;
    skippedCount: number;
    teachers: any[];
    skipped: any[];
    excelBase64?: string;
    fileName?: string;
  } | null>(null);

  // Generated Teacher Credentials Modal (Single)
  const [createdTeacherCredentials, setCreatedTeacherCredentials] = useState<{
    name: string;
    email: string;
    password: string;
    facultyIdNumber: string;
    department: string;
    designation: string;
  } | null>(null);
  const [copiedTeacherCreds, setCopiedTeacherCreds] = useState(false);

  const fetchCampusData = async () => {
    try {
      setIsLoading(true);
      const studentQuery = `/institutions/my-institution/students?department=${deptFilter}&search=${studentSearch}&assignedTeacher=${assignedTeacherFilter}`;
      
      const results = await Promise.allSettled([
        API.get('/institutions/my-institution'),
        API.get('/institutions/my-institution/analytics'),
        API.get(studentQuery),
        API.get(`/institutions/my-institution/teachers?department=${deptFilter}&search=${teacherSearch}`),
      ]);

      const [instRes, analRes, stuRes, teachRes] = results;

      if (instRes.status === 'fulfilled' && instRes.value?.data?.success) {
        const inst = instRes.value.data.institution;
        setInstitution(inst);
        if (!stDept && inst.departments?.length > 0) {
          setStDept(inst.departments[0]);
        }
        if (!tcDept && inst.departments?.length > 0) {
          setTcDept(inst.departments[0]);
        }
      }
      if (analRes.status === 'fulfilled' && analRes.value?.data?.success) {
        setAnalytics(analRes.value.data.analytics);
      }
      if (stuRes.status === 'fulfilled' && stuRes.value?.data?.success) {
        setStudents(stuRes.value.data.students);
      }
      if (teachRes.status === 'fulfilled' && teachRes.value?.data?.success) {
        setTeachers(teachRes.value.data.teachers);
      }
    } catch (err) {
      console.error('Fetch campus data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampusData();
  }, [deptFilter, assignedTeacherFilter]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        fetchCampusData();
        setActiveTab('students');
      }
    } catch (err: any) {
      setEnrollMsg(err.response?.data?.message || err.message || 'Failed to enroll student.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const downloadBase64Excel = (base64Data: string, fileName?: string) => {
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || `Synexora_Student_Credentials_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download excel error:', err);
    }
  };

  const handleDownloadSampleTemplate = async () => {
    try {
      setIsDownloadingSample(true);
      const res = await API.get('/institutions/my-institution/students/sample-excel', {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Synexora_Student_Enrollment_Template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to download sample template.');
    } finally {
      setIsDownloadingSample(false);
    }
  };

  const handleUploadExcelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelFile) {
      setExcelErrorMsg('Please choose an Excel (.xlsx, .xls) or CSV file first.');
      return;
    }

    try {
      setIsUploadingExcel(true);
      setExcelErrorMsg(null);

      const formData = new FormData();
      formData.append('file', excelFile);
      formData.append('defaultDepartment', excelDefaultDept || stDept || (institution?.departments?.[0] || 'General'));

      const chosenTeacher = excelDefaultTeacher || (isInstitutionTeacher ? (user?._id || '') : '');
      if (chosenTeacher) {
        formData.append('defaultAssignedTeacherId', chosenTeacher);
      }

      const res = await API.post('/institutions/my-institution/students/upload-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.success) {
        setIsEnrollModalOpen(false);
        setExcelFile(null);
        setBatchResult(res.data);
        if (res.data.excelBase64) {
          downloadBase64Excel(res.data.excelBase64, res.data.fileName);
        }
        fetchCampusData();
        setActiveTab('students');
      }
    } catch (err: any) {
      setExcelErrorMsg(err.response?.data?.message || err.message || 'Failed to process Excel enrollment.');
    } finally {
      setIsUploadingExcel(false);
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
        fetchCampusData();
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
    const text = `🎓 Synexora Student Account Credentials\nInstitution: ${institution?.name || 'Synexora Campus'}\nStudent Name: ${creds.name}\nRoll / Student ID: ${creds.studentIdNumber}\nDepartment: ${creds.department}\nAssigned Teacher: ${creds.assignedTeacherName || 'N/A'}\n\nLogin URL: ${window.location.origin}/login\nEmail: ${creds.email}\nTemporary Password: ${creds.password}\n\nPlease change your password upon initial login.`;
    navigator.clipboard.writeText(text);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2500);
  };

  const handleCopyTeacherCredentials = (creds: {
    name: string;
    email: string;
    password: string;
    facultyIdNumber: string;
    department: string;
    designation: string;
  }) => {
    const text = `💼 Synexora Faculty Educator Credentials\nInstitution: ${institution?.name || 'Synexora Campus'}\nFaculty Name: ${creds.name}\nDesignation: ${creds.designation}\nFaculty ID / Emp #: ${creds.facultyIdNumber}\nDepartment: ${creds.department}\n\nLogin URL: ${window.location.origin}/login\nEmail: ${creds.email}\nTemporary Password: ${creds.password}\n\nPlease change your password upon initial login.`;
    navigator.clipboard.writeText(text);
    setCopiedTeacherCreds(true);
    setTimeout(() => setCopiedTeacherCreds(false), 2500);
  };

  const handleEnrollTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tcName.trim() || !tcEmail.trim() || !tcPassword) return;

    try {
      setIsEnrollingTeacher(true);
      setEnrollTeacherMsg(null);
      const res = await API.post('/institutions/my-institution/teachers', {
        name: tcName.trim(),
        email: tcEmail.trim(),
        password: tcPassword,
        facultyIdNumber: tcFacultyId.trim(),
        department: tcDept.trim(),
        designation: tcDesignation.trim(),
      });

      if (res.data.success) {
        setIsEnrollTeacherModalOpen(false);
        setCreatedTeacherCredentials({
          name: tcName.trim(),
          email: tcEmail.trim(),
          password: tcPassword,
          facultyIdNumber: tcFacultyId.trim() || res.data.teacher?.facultyIdNumber || 'FAC-EMP',
          department: tcDept.trim(),
          designation: tcDesignation.trim(),
        });
        setTcName('');
        setTcEmail('');
        setTcPassword('');
        setTcFacultyId('');
        fetchCampusData();
        setActiveTab('teachers');
      }
    } catch (err: any) {
      setEnrollTeacherMsg(err.response?.data?.message || err.message || 'Failed to enroll faculty teacher.');
    } finally {
      setIsEnrollingTeacher(false);
    }
  };

  const handleDownloadTeacherSampleTemplate = async () => {
    try {
      setIsDownloadingTeacherSample(true);
      const res = await API.get('/institutions/my-institution/teachers/sample-excel', {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Synexora_Teacher_Enrollment_Template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to download sample teacher template.');
    } finally {
      setIsDownloadingTeacherSample(false);
    }
  };

  const handleUploadTeacherExcelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelTeacherFile) {
      setExcelTeacherErrorMsg('Please select an Excel (.xlsx, .xls) or CSV file first.');
      return;
    }

    try {
      setIsUploadingTeacherExcel(true);
      setExcelTeacherErrorMsg(null);

      const formData = new FormData();
      formData.append('file', excelTeacherFile);
      formData.append('defaultDepartment', excelTeacherDept || tcDept || (institution?.departments?.[0] || 'General'));
      formData.append('defaultDesignation', excelTeacherDesignation || 'Assistant Professor');

      const res = await API.post('/institutions/my-institution/teachers/upload-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.success) {
        setIsEnrollTeacherModalOpen(false);
        setExcelTeacherFile(null);
        setTeacherBatchResult(res.data);
        if (res.data.excelBase64) {
          downloadBase64Excel(res.data.excelBase64, res.data.fileName);
        }
        fetchCampusData();
        setActiveTab('teachers');
      }
    } catch (err: any) {
      setExcelTeacherErrorMsg(err.response?.data?.message || err.message || 'Failed to process Excel teacher enrollment.');
    } finally {
      setIsUploadingTeacherExcel(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-20 px-2 sm:px-4">
        {isLoading && !institution ? (
          <div className="flex flex-col items-center justify-center py-32 text-[#777777] gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#111111]" />
            <span className="text-xs font-bold tracking-wide">Loading campus command center...</span>
          </div>
        ) : (
          <>
            {/* Campus Header Hero Banner */}
            {institution && (
              <div className="relative overflow-hidden rounded-3xl bg-[#111111] text-white p-7 sm:p-9 shadow-md border border-[#E8E1D2]">
                {/* Background Ambient Warm Glow */}
                <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#F4C542]/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="space-y-2.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FFF8E8]/15 text-[#F4C542] border border-[#F4C542]/30 backdrop-blur-md">
                        {institution.plan.toUpperCase()} CAMPUS LICENSE
                      </span>
                      <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5 backdrop-blur-md">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified Institution</span>
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {institution.name}
                    </h1>

                    <p className="text-xs text-white/80 flex items-center gap-2">
                      <span>{institution.domain || 'synexora.edu'}</span>
                      <span>•</span>
                      <span>{institution.departments?.length || 0} Academic Departments</span>
                    </p>
                  </div>

                  {/* Campus Student Token Card */}
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4 shrink-0">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#F4C542] block mb-0.5">
                        Student Invite Code
                      </span>
                      <span className="font-mono text-base sm:text-lg font-black tracking-wider text-white">
                        {institution.code}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyCode(institution.code)}
                      className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all active:scale-95 flex items-center gap-1.5 font-bold text-xs"
                      title="Copy Code"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span className="text-emerald-300">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Metrics & Quota Bar */}
            {analytics && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {/* Seat Quota */}
                <div className="bg-white p-5 rounded-3xl border border-[#E8E1D2] shadow-xs hover:border-[#111111] transition-all">
                  <div className="flex items-center justify-between text-[#777777] mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#555555]">Seat Quota</span>
                    <div className="w-7 h-7 rounded-lg bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2] flex items-center justify-center">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-xl font-black text-[#111111]">
                    {analytics.usedSeats} <span className="text-xs text-[#777777] font-normal">/ {analytics.maxSeats}</span>
                  </p>
                  <div className="w-full bg-[#FFF8E8] border border-[#E8E1D2] rounded-full h-2 mt-2.5 overflow-hidden">
                    <div
                      className="bg-[#111111] h-full rounded-full transition-all"
                      style={{ width: `${Math.min(analytics.seatUtilizationPct, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Students */}
                <div className="bg-white p-5 rounded-3xl border border-[#E8E1D2] shadow-xs hover:border-[#111111] transition-all">
                  <div className="flex items-center justify-between text-[#777777] mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#555555]">Students</span>
                    <div className="w-7 h-7 rounded-lg bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2] flex items-center justify-center">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-xl font-black text-[#111111]">{analytics.activeStudents || students.length}</p>
                  <p className="text-[10px] text-emerald-700 font-bold mt-1">Enrolled Learners</p>
                </div>

                {/* Teachers */}
                <div className="bg-white p-5 rounded-3xl border border-[#E8E1D2] shadow-xs hover:border-[#111111] transition-all">
                  <div className="flex items-center justify-between text-[#777777] mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#555555]">Faculty</span>
                    <div className="w-7 h-7 rounded-lg bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2] flex items-center justify-center">
                      <Briefcase className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-xl font-black text-[#111111]">{analytics.totalTeachers ?? teachers.length}</p>
                  <p className="text-[10px] text-[#111111] font-bold mt-1">Teaching Staff</p>
                </div>

                {/* Classrooms */}
                <div className="bg-white p-5 rounded-3xl border border-[#E8E1D2] shadow-xs hover:border-[#111111] transition-all">
                  <div className="flex items-center justify-between text-[#777777] mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#555555]">Classrooms</span>
                    <div className="w-7 h-7 rounded-lg bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2] flex items-center justify-center">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-xl font-black text-[#111111]">{analytics.totalClassrooms}</p>
                  <p className="text-[10px] text-[#777777] font-semibold mt-1">Course Spaces</p>
                </div>

                {/* Evaluations */}
                <div className="bg-white p-5 rounded-3xl border border-[#E8E1D2] shadow-xs hover:border-[#111111] transition-all col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between text-[#777777] mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#555555]">Assessments</span>
                    <div className="w-7 h-7 rounded-lg bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2] flex items-center justify-center">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-xl font-black text-[#111111]">{analytics.assessmentsCount}</p>
                  <p className="text-[10px] text-[#111111] font-bold mt-1">Graded Tests</p>
                </div>
              </div>
            )}

            {/* Tab Navigation & Provisioning Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E1D2] pb-4 pt-1">
              {/* Segmented Control */}
              <div className="flex items-center gap-1 bg-[#FFF8E8] p-1.5 rounded-full border border-[#E8E1D2]">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeTab === 'overview'
                      ? 'bg-[#111111] text-[#F4C542] shadow-xs'
                      : 'text-[#555555] hover:text-[#111111]'
                  }`}
                >
                  Campus Overview
                </button>
                <button
                  onClick={() => setActiveTab('students')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'students'
                      ? 'bg-[#111111] text-[#F4C542] shadow-xs'
                      : 'text-[#555555] hover:text-[#111111]'
                  }`}
                >
                  <span>Students</span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-[#111111] text-[10px] font-bold border border-[#E8E1D2]">
                    {students.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('teachers')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'teachers'
                      ? 'bg-[#111111] text-[#F4C542] shadow-xs'
                      : 'text-[#555555] hover:text-[#111111]'
                  }`}
                >
                  <span>Faculty & Teachers</span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-[#111111] text-[10px] font-bold border border-[#E8E1D2]">
                    {teachers.length}
                  </span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                {isInstitutionAdmin && (
                  <button
                    onClick={() => {
                      setEnrollTeacherMsg(null);
                      setExcelTeacherErrorMsg(null);
                      setIsEnrollTeacherModalOpen(true);
                    }}
                    className="btn-secondary text-xs py-2 px-4 font-bold flex items-center gap-1.5"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-[#111111]" />
                    <span>Enroll Teacher</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setEnrollMsg(null);
                    setExcelErrorMsg(null);
                    setIsEnrollModalOpen(true);
                  }}
                  className="btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Enroll Student</span>
                </button>
              </div>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && institution && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E1D2] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-[#111111]">Academic Departments & Disciplines</h3>
                      <p className="text-xs text-[#777777] mt-0.5">
                        Students and faculty are categorized across these registered branches:
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#111111] bg-[#FFF8E8] px-3 py-1 rounded-full border border-[#E8E1D2]">
                      {institution.departments?.length || 0} Departments
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {institution.departments?.map((dept, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-[#FFF8E8] border border-[#E8E1D2] rounded-2xl flex items-center gap-3"
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold text-xs shrink-0">
                          <Building className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#111111] truncate">{dept}</p>
                          <p className="text-[10px] text-[#777777]">Department Node</p>
                        </div>
                      </div>
                    ))}
                  </div>

                    {isInstitutionAdmin && (
                      <div className="pt-4 border-t border-[#E8E1D2] flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-[#777777] font-medium">Ready to register new educators?</span>
                        <button
                          onClick={() => {
                            setEnrollTeacherMsg(null);
                            setIsEnrollTeacherModalOpen(true);
                          }}
                          className="text-xs font-bold text-[#111111] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>+ Provision Faculty Member</span>
                        </button>
                      </div>
                    )}
                </div>

                {/* Quick Share Card */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E1D2] shadow-xs space-y-4 text-xs">
                  <div className="flex items-center gap-2 text-[#111111] font-bold">
                    <Sparkles className="w-4 h-4 text-[#F4C542]" />
                    <span>Campus Student Access</span>
                  </div>
                  <p className="text-[#555555]">
                    Incoming students can register and bind their account to <strong>{institution.name}</strong> using this key:
                  </p>
                  <div className="p-5 bg-[#FFF8E8] border border-[#E8E1D2] rounded-2xl text-center space-y-1">
                    <span className="font-mono text-xl font-black text-[#111111] tracking-wider block">
                      {institution.code}
                    </span>
                    <span className="text-[10px] text-[#777777] font-semibold block">Valid for all university branches</span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(institution.code)}
                    className="btn-secondary w-full py-2.5 font-bold flex items-center justify-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#777777]" />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Student Invite Code'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: STUDENTS ROSTER */}
            {activeTab === 'students' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') fetchCampusData();
                      }}
                      placeholder="Search student by name, email, roll ID..."
                      className="text-xs pl-10 pr-4 py-2.5 bg-white border border-[#E8E1D2] rounded-full focus:outline-none focus:ring-2 focus:ring-[#111111] w-full shadow-2xs"
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Filter by Assigned Teacher */}
                    <select
                      value={assignedTeacherFilter}
                      onChange={(e) => setAssignedTeacherFilter(e.target.value)}
                      className="text-xs px-3 py-2 bg-white border border-[#E8E1D2] rounded-full font-bold text-[#111111] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#111111]"
                    >
                      <option value="all">All Teacher Allotments</option>
                      {isInstitutionTeacher && <option value="me">⭐ My Assigned Students</option>}
                      <option value="unassigned">⚠️ Unassigned Students</option>
                      {teachers.map((tc) => (
                        <option key={tc._id} value={tc._id}>
                          Prof. {tc.name} ({tc.department})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-white border border-[#E8E1D2] rounded-3xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FFF8E8] border-b border-[#E8E1D2] font-bold text-[#555555] uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Student</th>
                        <th className="px-4 py-4">Roll / Student ID</th>
                        <th className="px-4 py-4">Department</th>
                        <th className="px-4 py-4">Assigned Teacher</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E1D2]">
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-[#777777]">
                            No students found. Enroll a student using the button above or invite them using code <strong>{institution?.code}</strong>.
                          </td>
                        </tr>
                      ) : (
                        students.map((st) => {
                          const isAssignedToMe = isInstitutionTeacher && (st.assignedTeacher === user?._id || st.assignedTeacher?._id === user?._id);

                          return (
                            <tr key={st._id} className="hover:bg-[#FFF8E8] transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#111111] text-[#F4C542] font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                                    {st.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-[#111111] flex items-center gap-1.5">
                                      <span>{st.name}</span>
                                      {isAssignedToMe && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#FFF8E8] border border-[#F4C542] text-[#111111]">
                                          My Student
                                        </span>
                                      )}
                                    </p>
                                    <p className="text-[10px] text-[#777777]">{st.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 font-mono font-semibold text-[#111111]">
                                <span className="px-2.5 py-0.5 rounded-full bg-[#FFF8E8] border border-[#E8E1D2] text-[11px]">
                                  {st.studentIdNumber || 'N/A'}
                                </span>
                              </td>
                              <td className="px-4 py-4 font-semibold text-[#111111]">
                                {st.department}
                              </td>
                              <td className="px-4 py-4">
                                {st.assignedTeacherName || (st.assignedTeacher && st.assignedTeacher.name) ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2] flex items-center gap-1">
                                      <GraduationCap className="w-3 h-3 text-[#111111]" />
                                      <span>{st.assignedTeacherName || st.assignedTeacher?.name}</span>
                                    </span>
                                  </div>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                    Unassigned
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <span className="inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  <span className="uppercase">{st.accountStatus || 'active'}</span>
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => {
                                    setAssigningStudent(st);
                                    setSelectedTeacherForAssign(
                                      st.assignedTeacher?._id || st.assignedTeacher || (isInstitutionTeacher ? user?._id || '' : '')
                                    );
                                  }}
                                  className="btn-secondary text-[11px] py-1 px-3 font-bold inline-flex items-center gap-1"
                                  title="Assign or change teacher allotment"
                                >
                                  <UserCheck className="w-3 h-3 text-[#111111]" />
                                  <span>{st.assignedTeacherName ? 'Change Teacher' : 'Assign Teacher'}</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: TEACHERS & FACULTY */}
            {activeTab === 'teachers' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={teacherSearch}
                      onChange={(e) => setTeacherSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') fetchCampusData();
                      }}
                      placeholder="Search faculty by name, email, employee ID..."
                      className="text-xs pl-10 pr-4 py-2.5 bg-white border border-[#E8E1D2] rounded-full focus:outline-none focus:ring-2 focus:ring-[#111111] w-full shadow-2xs"
                    />
                  </div>
                </div>

                <div className="bg-white border border-[#E8E1D2] rounded-3xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FFF8E8] border-b border-[#E8E1D2] font-bold text-[#555555] uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Faculty Member</th>
                        <th className="px-4 py-4">Designation</th>
                        <th className="px-4 py-4">Faculty ID</th>
                        <th className="px-4 py-4">Department</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E1D2]">
                      {teachers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-[#777777]">
                            {isInstitutionAdmin ? (
                              <>No faculty teachers registered yet. Click <strong>Enroll Teacher</strong> to provision educators.</>
                            ) : (
                              <>No faculty teachers registered in the department directory yet.</>
                            )}
                          </td>
                        </tr>
                      ) : (
                        teachers.map((tc) => (
                          <tr key={tc._id} className="hover:bg-[#FFF8E8] transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#111111] text-[#F4C542] font-bold flex items-center justify-center text-xs shrink-0">
                                  {tc.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-[#111111]">{tc.name}</p>
                                  <p className="text-[10px] text-[#777777] flex items-center gap-1">
                                    <Mail className="w-2.5 h-2.5" />
                                    {tc.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2]">
                                {tc.designation || 'Faculty / Lecturer'}
                              </span>
                            </td>
                            <td className="px-4 py-4 font-mono font-semibold text-[#111111]">
                              <span className="px-2.5 py-0.5 rounded-full bg-[#FFF8E8] border border-[#E8E1D2] text-[11px]">
                                {tc.facultyIdNumber || 'FAC-EMP'}
                              </span>
                            </td>
                            <td className="px-4 py-4 font-semibold text-[#111111]">
                              {tc.department}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="uppercase">{tc.accountStatus || 'active'}</span>
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MODAL: ENROLL STUDENT */}
            {isEnrollModalOpen && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex min-h-screen items-center justify-center p-4 sm:p-6">
                <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#E8E1D2] overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
                  {/* Modal Header */}
                  <div className="p-6 pb-4 border-b border-[#E8E1D2] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2] flex items-center justify-center font-bold">
                        {enrollTab === 'excel' ? <FileSpreadsheet className="w-5 h-5 text-emerald-700" /> : <UserPlus className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-[#111111]">
                          {enrollTab === 'excel' ? 'Batch Student Enrollment (Excel / CSV)' : 'Enroll Student & Issue Login'}
                        </h3>
                        <p className="text-[11px] text-[#777777]">Provision accounts and allot assigned mentors under {institution?.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEnrollModalOpen(false)}
                      className="p-1.5 rounded-full hover:bg-[#FFF8E8] text-[#777777] hover:text-[#111111] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Enrollment Mode Tabs */}
                  <div className="px-6 pt-4">
                    <div className="flex bg-[#FFF8E8] p-1 rounded-2xl border border-[#E8E1D2]">
                      <button
                        type="button"
                        onClick={() => setEnrollTab('single')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          enrollTab === 'single'
                            ? 'bg-[#111111] text-[#F4C542] shadow-xs'
                            : 'text-[#555555] hover:text-[#111111]'
                        }`}
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Manual Entry (1 Student)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnrollTab('excel')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          enrollTab === 'excel'
                            ? 'bg-[#111111] text-[#F4C542] shadow-xs'
                            : 'text-[#555555] hover:text-[#111111]'
                        }`}
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                        <span>📊 Enroll using Excel / CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* TAB 1: MANUAL SINGLE ENTRY FORM */}
                  {enrollTab === 'single' && (
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
                          <label className="font-bold text-[#111111] block mb-1.5">Student Institutional Email (Login Username)</label>
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
                              className="input-clean"
                            >
                              {institution?.departments?.map((d, idx) => (
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
                            {teachers
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
                            <span>Temporary Access Password (Given to Student)</span>
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

                      {/* Modal Footer */}
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
                  )}

                  {/* TAB 2: EXCEL / CSV BULK UPLOAD FORM */}
                  {enrollTab === 'excel' && (
                    <form onSubmit={handleUploadExcelSubmit}>
                      <div className="p-6 space-y-4 text-xs">
                        {excelErrorMsg && (
                          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-semibold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                            <span>{excelErrorMsg}</span>
                          </div>
                        )}

                        {/* Guide Banner */}
                        <div className="p-3.5 bg-[#FFF8E8] border border-[#E8E1D2] rounded-2xl space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-bold text-[#111111] flex items-center gap-1.5 text-xs">
                              <Sparkles className="w-3.5 h-3.5 text-[#F4C542]" />
                              <span>Excel Student Roster Upload</span>
                            </span>
                            <button
                              type="button"
                              onClick={handleDownloadSampleTemplate}
                              disabled={isDownloadingSample}
                              className="text-[11px] font-bold text-[#111111] hover:text-black hover:underline flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-full border border-[#E8E1D2] shadow-2xs"
                            >
                              {isDownloadingSample ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                              <span>Download Sample Excel</span>
                            </button>
                          </div>
                          <p className="text-[11px] text-[#555555]">
                            Upload your spreadsheet. Synexora will automatically create all student accounts and export their temporary login passwords in a downloadable Excel file!
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8E1D2] text-[10px] font-bold text-[#111111]">
                              ✓ Student Name
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8E1D2] text-[10px] font-bold text-[#111111]">
                              ✓ Gmail / Email
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8E1D2] text-[10px] font-bold text-[#111111]">
                              ✓ Course / Department
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8E1D2] text-[10px] text-[#777777]">
                              • Roll No (Optional)
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8E1D2] text-[10px] text-[#777777]">
                              • Batch Year (Optional)
                            </span>
                          </div>
                        </div>

                        {/* File Dropzone */}
                        <div>
                          <label className="font-bold text-[#111111] block mb-1.5">Select Excel or CSV Spreadsheet File</label>
                          {!excelFile ? (
                            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#E8E1D2] hover:border-[#111111] bg-[#FFF8E8]/40 hover:bg-[#FFF8E8] rounded-2xl cursor-pointer transition-all">
                              <UploadCloud className="w-8 h-8 text-[#111111] mb-2" />
                              <p className="text-xs font-bold text-[#111111]">Click to select or drag & drop file</p>
                              <p className="text-[10px] text-[#777777] mt-0.5">Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv)</p>
                              <input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    setExcelFile(e.target.files[0]);
                                    setExcelErrorMsg(null);
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          ) : (
                            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                                  <FileSpreadsheet className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-emerald-950 truncate text-xs">{excelFile.name}</p>
                                  <p className="text-[10px] text-emerald-700">{(excelFile.size / 1024).toFixed(1)} KB • Ready to upload</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setExcelFile(null)}
                                className="p-1.5 rounded-full hover:bg-emerald-100 text-emerald-800 transition-colors cursor-pointer"
                                title="Remove File"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Fallback Department */}
                        <div>
                          <label className="font-bold text-[#111111] block mb-1.5 flex items-center justify-between">
                            <span>Default Department / Course</span>
                            <span className="text-[10px] text-[#777777] font-normal">Used if column is blank</span>
                          </label>
                          <select
                            value={excelDefaultDept}
                            onChange={(e) => setExcelDefaultDept(e.target.value)}
                            className="input-clean"
                          >
                            {institution?.departments?.map((d, idx) => (
                              <option key={idx} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        {/* Teacher Mentor Allotment */}
                        <div>
                          <label className="font-bold text-[#111111] block mb-1.5 flex items-center justify-between">
                            <span>Allot Assigned Teacher / Mentor</span>
                            {isInstitutionTeacher && (
                              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Auto-allots to you
                              </span>
                            )}
                          </label>
                          <select
                            value={excelDefaultTeacher}
                            onChange={(e) => setExcelDefaultTeacher(e.target.value)}
                            className="input-clean font-semibold"
                          >
                            {isInstitutionTeacher && (
                              <option value={user?._id}>
                                ⭐ Myself ({user?.name} - {user?.department || 'Faculty'})
                              </option>
                            )}
                            <option value="unassigned">-- Leave Unassigned / Allot Later --</option>
                            {teachers
                              .filter((t) => !isInstitutionTeacher || t._id !== user?._id)
                              .map((tc) => (
                                <option key={tc._id} value={tc._id}>
                                  Prof. {tc.name} ({tc.department} • {tc.designation || 'Faculty'})
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                      {/* Modal Footer */}
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
                          disabled={isUploadingExcel || !excelFile}
                          className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-2 shadow-xs bg-emerald-700 hover:bg-emerald-800 text-white border-none cursor-pointer"
                        >
                          {isUploadingExcel ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Processing Excel...</span>
                            </>
                          ) : (
                            <>
                              <FileSpreadsheet className="w-4 h-4" />
                              <span>Upload Excel & Issue Credentials</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* MODAL: SINGLE STUDENT CREDENTIALS HANDOVER */}
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

            {/* MODAL: SINGLE TEACHER CREDENTIALS HANDOVER */}
            {createdTeacherCredentials && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 backdrop-blur-sm flex min-h-screen items-center justify-center p-4">
                <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E8E1D2] p-6 space-y-4 animate-in fade-in zoom-in duration-200">
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold text-xl shadow-md">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-extrabold text-[#111111]">Faculty Teacher Enrolled!</h3>
                    <p className="text-xs text-[#777777]">
                      Hand over these educator login credentials directly to the faculty member.
                    </p>
                  </div>

                  <div className="p-4 bg-[#FFF8E8] border border-[#E8E1D2] rounded-2xl space-y-2 text-xs font-mono">
                    <div className="flex justify-between border-b border-[#E8E1D2] pb-1.5">
                      <span className="text-[#777777]">Faculty Name:</span>
                      <strong className="text-[#111111] font-sans">{createdTeacherCredentials.name}</strong>
                    </div>
                    <div className="flex justify-between border-b border-[#E8E1D2] pb-1.5">
                      <span className="text-[#777777]">Login Email:</span>
                      <strong className="text-[#111111]">{createdTeacherCredentials.email}</strong>
                    </div>
                    <div className="flex justify-between border-b border-[#E8E1D2] pb-1.5">
                      <span className="text-[#777777]">Temporary Password:</span>
                      <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        {createdTeacherCredentials.password}
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-[#E8E1D2] pb-1.5">
                      <span className="text-[#777777]">Faculty ID:</span>
                      <span className="text-[#111111]">{createdTeacherCredentials.facultyIdNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#E8E1D2] pb-1.5">
                      <span className="text-[#777777]">Designation:</span>
                      <span className="text-[#111111] font-sans font-semibold">{createdTeacherCredentials.designation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#777777]">Department:</span>
                      <span className="text-[#111111] font-bold font-sans">
                        {createdTeacherCredentials.department}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleCopyTeacherCredentials(createdTeacherCredentials)}
                      className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                    >
                      {copiedTeacherCreds ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedTeacherCreds ? 'Copied Teacher Credentials!' : 'Copy Teacher Credentials'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreatedTeacherCredentials(null)}
                      className="btn-secondary w-full py-2 text-xs font-bold"
                    >
                      Done / Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL: EXCEL BATCH ENROLLMENT RESULT & CREDENTIALS EXPORT */}
            {batchResult && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex min-h-screen items-center justify-center p-4 sm:p-6">
                <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#E8E1D2] overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
                  {/* Result Header */}
                  <div className="p-6 bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center font-bold text-xl">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white">Batch Enrollment Complete!</h3>
                        <p className="text-xs text-emerald-200/90">
                          {batchResult.enrolledCount} student accounts provisioned under {institution?.name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setBatchResult(null)}
                      className="p-1.5 rounded-full hover:bg-white/10 text-emerald-200 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Summary Ribbon */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Created Accounts</span>
                        <span className="text-xl font-black text-emerald-900">{batchResult.enrolledCount} Students</span>
                      </div>
                      <div className="p-3.5 bg-[#FFF8E8] border border-[#E8E1D2] rounded-2xl">
                        <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider block">Status</span>
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mt-1">
                          <CheckCircle2 className="w-4 h-4" /> Ready to Login
                        </span>
                      </div>
                      {batchResult.skippedCount > 0 && (
                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
                          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Skipped / Duplicates</span>
                          <span className="text-xl font-black text-amber-900">{batchResult.skippedCount} Rows</span>
                        </div>
                      )}
                    </div>

                    {/* Prominent Download Credentials Button */}
                    {batchResult.excelBase64 && (
                      <div className="p-4 bg-[#FFF8E8] border border-[#E8E1D2] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div>
                          <p className="font-extrabold text-[#111111] text-xs flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#F4C542]" />
                            <span>Download All Student Passwords & Credentials</span>
                          </p>
                          <p className="text-[11px] text-[#777777]">
                            Spreadsheet containing student names, login emails, temporary passwords, and allotted mentors.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => downloadBase64Excel(batchResult.excelBase64!, batchResult.fileName)}
                          className="btn-primary text-xs py-2.5 px-5 font-bold flex items-center gap-2 shrink-0 bg-[#111111] text-[#F4C542] hover:bg-black cursor-pointer shadow-md"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Credentials (.xlsx)</span>
                        </button>
                      </div>
                    )}

                    {/* Table Preview */}
                    {batchResult.students && batchResult.students.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-[#111111] uppercase tracking-wider">
                            Generated Credentials Preview ({batchResult.students.length})
                          </h4>
                          <span className="text-[10px] text-[#777777]">Temporary passwords are case-sensitive</span>
                        </div>
                        <div className="max-h-60 overflow-y-auto border border-[#E8E1D2] rounded-2xl divide-y divide-[#E8E1D2]">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#FFF8E8] text-[#777777] font-semibold sticky top-0">
                              <tr>
                                <th className="px-4 py-2.5">Student Name</th>
                                <th className="px-4 py-2.5">Login Email</th>
                                <th className="px-4 py-2.5">Temporary Password</th>
                                <th className="px-4 py-2.5">Course / Dept</th>
                                <th className="px-4 py-2.5">Teacher Mentor</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E8E1D2]">
                              {batchResult.students.map((st, idx) => (
                                <tr key={idx} className="hover:bg-[#FFF8E8]/60 transition-colors font-mono">
                                  <td className="px-4 py-2.5 font-sans font-bold text-[#111111]">{st.name}</td>
                                  <td className="px-4 py-2.5 text-[#555555]">{st.email}</td>
                                  <td className="px-4 py-2.5">
                                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                                      {st.password}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2.5 font-sans text-[#555555]">{st.department}</td>
                                  <td className="px-4 py-2.5 font-sans font-semibold text-[#111111]">{st.assignedTeacherName}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Skipped Details (if any) */}
                    {batchResult.skipped && batchResult.skipped.length > 0 && (
                      <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                        <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                          <span>Skipped Rows ({batchResult.skipped.length})</span>
                        </span>
                        <div className="max-h-32 overflow-y-auto space-y-1 text-[11px] font-mono">
                          {batchResult.skipped.map((sk, idx) => (
                            <div key={idx} className="flex items-center justify-between text-amber-900 bg-white/80 p-1.5 rounded-lg border border-amber-200/50">
                              <span>Row {sk.row}: {sk.name} ({sk.email})</span>
                              <span className="text-red-700 font-sans font-semibold">{sk.reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="px-6 py-4 bg-[#FFF8E8]/50 border-t border-[#E8E1D2] flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setBatchResult(null)}
                      className="btn-primary text-xs py-2 px-6 font-bold"
                    >
                      Done & Close
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
                        {teachers
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

            {/* MODAL: ENROLL TEACHER (Admins Only) */}
            {isInstitutionAdmin && isEnrollTeacherModalOpen && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex min-h-screen items-center justify-center p-4 sm:p-6">
                <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#E8E1D2] overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
                  {/* Modal Header */}
                  <div className="p-6 pb-4 border-b border-[#E8E1D2] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2] flex items-center justify-center font-bold">
                        {enrollTeacherTab === 'excel' ? <FileSpreadsheet className="w-5 h-5 text-emerald-700" /> : <Briefcase className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-[#111111]">
                          {enrollTeacherTab === 'excel' ? 'Batch Faculty Enrollment (Excel / CSV)' : 'Enroll Campus Teacher'}
                        </h3>
                        <p className="text-[11px] text-[#777777]">Provision educator accounts under {institution?.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEnrollTeacherModalOpen(false)}
                      className="p-1.5 rounded-full hover:bg-[#FFF8E8] text-[#777777] hover:text-[#111111] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Enrollment Mode Tabs */}
                  <div className="px-6 pt-4">
                    <div className="flex bg-[#FFF8E8] p-1 rounded-2xl border border-[#E8E1D2]">
                      <button
                        type="button"
                        onClick={() => setEnrollTeacherTab('single')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          enrollTeacherTab === 'single'
                            ? 'bg-[#111111] text-[#F4C542] shadow-xs'
                            : 'text-[#555555] hover:text-[#111111]'
                        }`}
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Manual Entry (1 Teacher)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnrollTeacherTab('excel')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          enrollTeacherTab === 'excel'
                            ? 'bg-[#111111] text-[#F4C542] shadow-xs'
                            : 'text-[#555555] hover:text-[#111111]'
                        }`}
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                        <span>📊 Enroll using Excel / CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* TAB 1: MANUAL SINGLE TEACHER FORM */}
                  {enrollTeacherTab === 'single' && (
                    <form onSubmit={handleEnrollTeacher}>
                      <div className="p-6 space-y-4 text-xs">
                        {enrollTeacherMsg && (
                          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-semibold">
                            {enrollTeacherMsg}
                          </div>
                        )}

                        <div>
                          <label className="font-bold text-[#111111] block mb-1.5">Faculty Full Name</label>
                          <input
                            type="text"
                            required
                            value={tcName}
                            onChange={(e) => setTcName(e.target.value)}
                            placeholder="e.g. Dr. Sarah Mitchell"
                            className="input-clean"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-[#111111] block mb-1.5">Faculty Institutional Email</label>
                          <input
                            type="email"
                            required
                            value={tcEmail}
                            onChange={(e) => setTcEmail(e.target.value)}
                            placeholder="sarah.mitchell@synexora.edu"
                            className="input-clean"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-[#111111] block mb-1.5">Academic Designation</label>
                            <select
                              value={tcDesignation}
                              onChange={(e) => setTcDesignation(e.target.value)}
                              className="input-clean"
                            >
                              <option value="Assistant Professor">Assistant Professor</option>
                              <option value="Associate Professor">Associate Professor</option>
                              <option value="Professor & HOD">Professor & HOD</option>
                              <option value="Lecturer / Instructor">Lecturer / Instructor</option>
                              <option value="Research Faculty">Research Faculty</option>
                              <option value="Lab Instructor">Lab Instructor</option>
                            </select>
                          </div>

                          <div>
                            <label className="font-bold text-[#111111] block mb-1.5">Faculty ID / Emp #</label>
                            <input
                              type="text"
                              value={tcFacultyId}
                              onChange={(e) => setTcFacultyId(e.target.value)}
                              placeholder="e.g. FAC-CS-101"
                              className="input-clean font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-bold text-[#111111] block mb-1.5">Academic Department</label>
                          <select
                            value={tcDept}
                            onChange={(e) => setTcDept(e.target.value)}
                            className="input-clean"
                          >
                            {institution?.departments?.map((d, idx) => (
                              <option key={idx} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-[#111111] block mb-1.5 flex items-center justify-between">
                            <span>Temporary Access Password</span>
                            <span className="text-[10px] text-[#777777] font-normal">Min 6 characters</span>
                          </label>
                          <div className="relative">
                            <Key className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              required
                              value={tcPassword}
                              onChange={(e) => setTcPassword(e.target.value)}
                              placeholder="TeacherPass123!"
                              className="w-full pl-10 pr-4 py-2.5 bg-[#FFF8E8] border border-[#E8E1D2] rounded-2xl text-xs font-mono text-[#111111] placeholder:text-[#777777] focus:bg-white focus:border-[#111111] focus:ring-2 focus:ring-[#111111] outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="px-6 py-4 bg-[#FFF8E8]/50 border-t border-[#E8E1D2] flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setIsEnrollTeacherModalOpen(false)}
                          className="btn-secondary text-xs py-2 px-4 font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isEnrollingTeacher || !tcName.trim() || !tcEmail.trim()}
                          className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-2"
                        >
                          {isEnrollingTeacher ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
                          <span>{isEnrollingTeacher ? 'Enrolling Teacher...' : 'Enroll Teacher'}</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* TAB 2: EXCEL BULK TEACHER ENROLLMENT FORM */}
                  {enrollTeacherTab === 'excel' && (
                    <form onSubmit={handleUploadTeacherExcelSubmit}>
                      <div className="p-6 space-y-4 text-xs">
                        {excelTeacherErrorMsg && (
                          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-semibold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                            <span>{excelTeacherErrorMsg}</span>
                          </div>
                        )}

                        {/* Guide Banner */}
                        <div className="p-3.5 bg-[#FFF8E8] border border-[#E8E1D2] rounded-2xl space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-bold text-[#111111] flex items-center gap-1.5 text-xs">
                              <Sparkles className="w-3.5 h-3.5 text-[#F4C542]" />
                              <span>Excel Faculty Roster Upload</span>
                            </span>
                            <button
                              type="button"
                              onClick={handleDownloadTeacherSampleTemplate}
                              disabled={isDownloadingTeacherSample}
                              className="text-[11px] font-bold text-[#111111] hover:text-black hover:underline flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-full border border-[#E8E1D2] shadow-2xs"
                            >
                              {isDownloadingTeacherSample ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                              <span>Download Sample Excel</span>
                            </button>
                          </div>
                          <p className="text-[11px] text-[#555555]">
                            Upload your faculty spreadsheet. Synexora will automatically create all educator accounts and export their temporary login passwords in a downloadable Excel file!
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8E1D2] text-[10px] font-bold text-[#111111]">
                              ✓ Teacher Name
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8E1D2] text-[10px] font-bold text-[#111111]">
                              ✓ Gmail / Email
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8E1D2] text-[10px] font-bold text-[#111111]">
                              ✓ Course / Department
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8E1D2] text-[10px] text-[#777777]">
                              • Designation (Optional)
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8E1D2] text-[10px] text-[#777777]">
                              • Faculty ID (Optional)
                            </span>
                          </div>
                        </div>

                        {/* File Dropzone */}
                        <div>
                          <label className="font-bold text-[#111111] block mb-1.5">Select Excel or CSV Spreadsheet File</label>
                          {!excelTeacherFile ? (
                            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#E8E1D2] hover:border-[#111111] bg-[#FFF8E8]/40 hover:bg-[#FFF8E8] rounded-2xl cursor-pointer transition-all">
                              <UploadCloud className="w-8 h-8 text-[#111111] mb-2" />
                              <p className="text-xs font-bold text-[#111111]">Click to select or drag & drop file</p>
                              <p className="text-[10px] text-[#777777] mt-0.5">Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv)</p>
                              <input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    setExcelTeacherFile(e.target.files[0]);
                                    setExcelTeacherErrorMsg(null);
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          ) : (
                            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                                  <FileSpreadsheet className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-emerald-950 truncate text-xs">{excelTeacherFile.name}</p>
                                  <p className="text-[10px] text-emerald-700">{(excelTeacherFile.size / 1024).toFixed(1)} KB • Ready to upload</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setExcelTeacherFile(null)}
                                className="p-1.5 rounded-full hover:bg-emerald-100 text-emerald-800 transition-colors cursor-pointer"
                                title="Remove File"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-[#111111] block mb-1.5">Default Academic Department</label>
                            <select
                              value={excelTeacherDept}
                              onChange={(e) => setExcelTeacherDept(e.target.value)}
                              className="input-clean"
                            >
                              {institution?.departments?.map((d, idx) => (
                                <option key={idx} value={d}>{d}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="font-bold text-[#111111] block mb-1.5">Default Designation</label>
                            <select
                              value={excelTeacherDesignation}
                              onChange={(e) => setExcelTeacherDesignation(e.target.value)}
                              className="input-clean"
                            >
                              <option value="Assistant Professor">Assistant Professor</option>
                              <option value="Associate Professor">Associate Professor</option>
                              <option value="Professor & HOD">Professor & HOD</option>
                              <option value="Lecturer / Instructor">Lecturer / Instructor</option>
                              <option value="Research Faculty">Research Faculty</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="px-6 py-4 bg-[#FFF8E8]/50 border-t border-[#E8E1D2] flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setIsEnrollTeacherModalOpen(false)}
                          className="btn-secondary text-xs py-2 px-4 font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isUploadingTeacherExcel || !excelTeacherFile}
                          className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-2 shadow-xs bg-emerald-700 hover:bg-emerald-800 text-white border-none cursor-pointer"
                        >
                          {isUploadingTeacherExcel ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Processing Teachers...</span>
                            </>
                          ) : (
                            <>
                              <FileSpreadsheet className="w-4 h-4" />
                              <span>Upload Excel & Issue Credentials</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* MODAL: TEACHER EXCEL BATCH RESULT & CREDENTIALS EXPORT */}
            {teacherBatchResult && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex min-h-screen items-center justify-center p-4 sm:p-6">
                <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#E8E1D2] overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
                  {/* Result Header */}
                  <div className="p-6 bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center font-bold text-xl">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white">Faculty Batch Enrollment Complete!</h3>
                        <p className="text-xs text-emerald-200/90">
                          {teacherBatchResult.enrolledCount} educator accounts provisioned under {institution?.name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setTeacherBatchResult(null)}
                      className="p-1.5 rounded-full hover:bg-white/10 text-emerald-200 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Summary Ribbon */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Created Faculty</span>
                        <span className="text-xl font-black text-emerald-900">{teacherBatchResult.enrolledCount} Teachers</span>
                      </div>
                      <div className="p-3.5 bg-[#FFF8E8] border border-[#E8E1D2] rounded-2xl">
                        <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider block">Status</span>
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mt-1">
                          <CheckCircle2 className="w-4 h-4" /> Ready to Login
                        </span>
                      </div>
                      {teacherBatchResult.skippedCount > 0 && (
                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
                          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Skipped / Duplicates</span>
                          <span className="text-xl font-black text-amber-900">{teacherBatchResult.skippedCount} Rows</span>
                        </div>
                      )}
                    </div>

                    {/* Prominent Download Credentials Button */}
                    {teacherBatchResult.excelBase64 && (
                      <div className="p-4 bg-[#FFF8E8] border border-[#E8E1D2] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div>
                          <p className="font-extrabold text-[#111111] text-xs flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#F4C542]" />
                            <span>Download All Teacher Passwords & Credentials</span>
                          </p>
                          <p className="text-[11px] text-[#777777]">
                            Spreadsheet containing faculty names, login emails, temporary passwords, departments, and designations.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => downloadBase64Excel(teacherBatchResult.excelBase64!, teacherBatchResult.fileName)}
                          className="btn-primary text-xs py-2.5 px-5 font-bold flex items-center gap-2 shrink-0 bg-[#111111] text-[#F4C542] hover:bg-black cursor-pointer shadow-md"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Credentials (.xlsx)</span>
                        </button>
                      </div>
                    )}

                    {/* Table Preview */}
                    {teacherBatchResult.teachers && teacherBatchResult.teachers.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-[#111111] uppercase tracking-wider">
                            Generated Faculty Credentials Preview ({teacherBatchResult.teachers.length})
                          </h4>
                          <span className="text-[10px] text-[#777777]">Temporary passwords are case-sensitive</span>
                        </div>
                        <div className="max-h-60 overflow-y-auto border border-[#E8E1D2] rounded-2xl divide-y divide-[#E8E1D2]">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#FFF8E8] text-[#777777] font-semibold sticky top-0">
                              <tr>
                                <th className="px-4 py-2.5">Teacher Name</th>
                                <th className="px-4 py-2.5">Login Email</th>
                                <th className="px-4 py-2.5">Temporary Password</th>
                                <th className="px-4 py-2.5">Designation</th>
                                <th className="px-4 py-2.5">Department</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E8E1D2]">
                              {teacherBatchResult.teachers.map((tc, idx) => (
                                <tr key={idx} className="hover:bg-[#FFF8E8]/60 transition-colors font-mono">
                                  <td className="px-4 py-2.5 font-sans font-bold text-[#111111]">{tc.name}</td>
                                  <td className="px-4 py-2.5 text-[#555555]">{tc.email}</td>
                                  <td className="px-4 py-2.5">
                                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                                      {tc.password}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2.5 font-sans font-semibold text-[#111111]">{tc.designation}</td>
                                  <td className="px-4 py-2.5 font-sans text-[#555555]">{tc.department}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Skipped Details (if any) */}
                    {teacherBatchResult.skipped && teacherBatchResult.skipped.length > 0 && (
                      <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                        <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                          <span>Skipped Rows ({teacherBatchResult.skipped.length})</span>
                        </span>
                        <div className="max-h-32 overflow-y-auto space-y-1 text-[11px] font-mono">
                          {teacherBatchResult.skipped.map((sk, idx) => (
                            <div key={idx} className="flex items-center justify-between text-amber-900 bg-white/80 p-1.5 rounded-lg border border-amber-200/50">
                              <span>Row {sk.row}: {sk.name} ({sk.email})</span>
                              <span className="text-red-700 font-sans font-semibold">{sk.reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="px-6 py-4 bg-[#FFF8E8]/50 border-t border-[#E8E1D2] flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setTeacherBatchResult(null)}
                      className="btn-primary text-xs py-2 px-6 font-bold"
                    >
                      Done & Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};
