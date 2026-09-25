import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
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
  const [institution, setInstitution] = useState<InstitutionDetails | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'teachers'>('overview');

  // Search & Filter
  const [studentSearch, setStudentSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [deptFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Copy code state
  const [copied, setCopied] = useState(false);

  // Enroll Student Modal
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [stName, setStName] = useState('');
  const [stEmail, setStEmail] = useState('');
  const [stPassword, setStPassword] = useState('');
  const [stRoll, setStRoll] = useState('');
  const [stDept, setStDept] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollMsg, setEnrollMsg] = useState<string | null>(null);

  // Enroll Teacher Modal
  const [isEnrollTeacherModalOpen, setIsEnrollTeacherModalOpen] = useState(false);
  const [tcName, setTcName] = useState('');
  const [tcEmail, setTcEmail] = useState('');
  const [tcPassword, setTcPassword] = useState('');
  const [tcFacultyId, setTcFacultyId] = useState('');
  const [tcDept, setTcDept] = useState('');
  const [tcDesignation, setTcDesignation] = useState('Assistant Professor');
  const [isEnrollingTeacher, setIsEnrollingTeacher] = useState(false);
  const [enrollTeacherMsg, setEnrollTeacherMsg] = useState<string | null>(null);

  const fetchCampusData = async () => {
    try {
      setIsLoading(true);
      const [instRes, analRes, stuRes, teachRes] = await Promise.all([
        API.get('/institutions/my-institution'),
        API.get('/institutions/my-institution/analytics'),
        API.get(`/institutions/my-institution/students?department=${deptFilter}&search=${studentSearch}`),
        API.get(`/institutions/my-institution/teachers?department=${deptFilter}&search=${teacherSearch}`),
      ]);

      if (instRes.data?.success) {
        setInstitution(instRes.data.institution);
        if (!stDept && instRes.data.institution.departments?.length > 0) {
          setStDept(instRes.data.institution.departments[0]);
        }
        if (!tcDept && instRes.data.institution.departments?.length > 0) {
          setTcDept(instRes.data.institution.departments[0]);
        }
      }
      if (analRes.data?.success) setAnalytics(analRes.data.analytics);
      if (stuRes.data?.success) setStudents(stuRes.data.students);
      if (teachRes.data?.success) setTeachers(teachRes.data.teachers);
    } catch (err) {
      console.error('Fetch campus data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampusData();
  }, [deptFilter]);

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
      const res = await API.post('/institutions/my-institution/students', {
        name: stName.trim(),
        email: stEmail.trim(),
        password: stPassword,
        studentIdNumber: stRoll.trim(),
        department: stDept.trim(),
      });

      if (res.data.success) {
        setIsEnrollModalOpen(false);
        setStName('');
        setStEmail('');
        setStPassword('');
        setStRoll('');
        fetchCampusData();
        setActiveTab('students');
      }
    } catch (err: any) {
      setEnrollMsg(err.response?.data?.message || err.message || 'Failed to enroll student.');
    } finally {
      setIsEnrolling(false);
    }
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

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-20 px-2 sm:px-4">
        {isLoading && !institution ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
            <span className="text-xs font-semibold tracking-wide">Loading campus command center...</span>
          </div>
        ) : (
          <>
            {/* Campus Header Hero Banner */}
            {institution && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-7 sm:p-9 shadow-xl border border-slate-800">
                {/* Background Ambient Glows */}
                <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
                <div className="absolute right-1/3 -bottom-16 w-64 h-64 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="space-y-2.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md">
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

                    <p className="text-xs text-slate-300 flex items-center gap-2">
                      <span>{institution.domain || 'synexora.edu'}</span>
                      <span>•</span>
                      <span>{institution.departments?.length || 0} Academic Departments</span>
                    </p>
                  </div>

                  {/* Campus Student Token Card */}
                  <div className="bg-white/10 backdrop-blur-xl border border-white/15 p-4 rounded-2xl shadow-lg flex items-center justify-between gap-4 shrink-0">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-200/80 block mb-0.5">
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
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                {/* Seat Quota */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Seat Quota</span>
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-xl font-black text-slate-900">
                    {analytics.usedSeats} <span className="text-xs text-slate-400 font-normal">/ {analytics.maxSeats}</span>
                  </p>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(analytics.seatUtilizationPct, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Students */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Students</span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-xl font-black text-slate-900">{analytics.activeStudents || students.length}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1">Enrolled Learners</p>
                </div>

                {/* Teachers */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Faculty</span>
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Briefcase className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-xl font-black text-slate-900">{analytics.totalTeachers ?? teachers.length}</p>
                  <p className="text-[10px] text-purple-600 font-semibold mt-1">Teaching Staff</p>
                </div>

                {/* Classrooms */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Classrooms</span>
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-xl font-black text-slate-900">{analytics.totalClassrooms}</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">Course Spaces</p>
                </div>

                {/* Evaluations */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assessments</span>
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-xl font-black text-slate-900">{analytics.assessmentsCount}</p>
                  <p className="text-[10px] text-teal-600 font-semibold mt-1">Graded Tests</p>
                </div>
              </div>
            )}

            {/* Tab Navigation & Provisioning Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3.5 pt-1">
              {/* Segmented Control */}
              <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-2xl border border-slate-200/80">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'overview'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Campus Overview
                </button>
                <button
                  onClick={() => setActiveTab('students')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'students'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Students</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px]">
                    {students.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('teachers')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'teachers'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Faculty & Teachers</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-800 text-[10px]">
                    {teachers.length}
                  </span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEnrollTeacherMsg(null);
                    setIsEnrollTeacherModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Enroll Teacher</span>
                </button>

                <button
                  onClick={() => {
                    setEnrollMsg(null);
                    setIsEnrollModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Enroll Student</span>
                </button>
              </div>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && institution && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Academic Departments & Disciplines</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Students and faculty are categorized across these registered branches:
                      </p>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      {institution.departments?.length || 0} Departments
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {institution.departments?.map((dept, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          <Building className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate">{dept}</p>
                          <p className="text-[10px] text-slate-400">Department Node</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-slate-500 font-medium">Ready to register new educators?</span>
                    <button
                      onClick={() => {
                        setEnrollTeacherMsg(null);
                        setIsEnrollTeacherModalOpen(true);
                      }}
                      className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>+ Provision Faculty Member</span>
                    </button>
                  </div>
                </div>

                {/* Quick Share Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 text-xs">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>Campus Student Access</span>
                  </div>
                  <p className="text-slate-500">
                    Incoming students can register and bind their account to <strong>{institution.name}</strong> using this key:
                  </p>
                  <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-center space-y-1">
                    <span className="font-mono text-xl font-black text-indigo-950 tracking-wider block">
                      {institution.code}
                    </span>
                    <span className="text-[10px] text-indigo-600 font-semibold block">Valid for all university branches</span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(institution.code)}
                    className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-50 font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
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
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') fetchCampusData();
                      }}
                      placeholder="Search student by name, email, roll ID..."
                      className="text-xs pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 w-full shadow-xs"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setEnrollMsg(null);
                      setIsEnrollModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Enroll Student</span>
                  </button>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/90 border-b border-slate-200 font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Student</th>
                        <th className="px-4 py-4">Roll / Student ID</th>
                        <th className="px-4 py-4">Department</th>
                        <th className="px-4 py-4">Batch</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-slate-400">
                            No students found. Enroll a student using the button above or invite them using code <strong>{institution?.code}</strong>.
                          </td>
                        </tr>
                      ) : (
                        students.map((st) => (
                          <tr key={st._id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                                  {st.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{st.name}</p>
                                  <p className="text-[10px] text-slate-400">{st.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 font-mono font-semibold text-slate-700">
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200/60 text-[11px]">
                                {st.studentIdNumber || 'N/A'}
                              </span>
                            </td>
                            <td className="px-4 py-4 font-semibold text-slate-800">
                              {st.department}
                            </td>
                            <td className="px-4 py-4 text-slate-500 font-medium">{st.batchYear || '2024-2028'}</td>
                            <td className="px-6 py-4 text-right">
                              <span className="inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="uppercase">{st.accountStatus || 'active'}</span>
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

            {/* TAB 3: TEACHERS & FACULTY */}
            {activeTab === 'teachers' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={teacherSearch}
                      onChange={(e) => setTeacherSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') fetchCampusData();
                      }}
                      placeholder="Search faculty by name, email, employee ID..."
                      className="text-xs pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 w-full shadow-xs"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setEnrollTeacherMsg(null);
                      setIsEnrollTeacherModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Enroll Teacher</span>
                  </button>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/90 border-b border-slate-200 font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Faculty Member</th>
                        <th className="px-4 py-4">Designation</th>
                        <th className="px-4 py-4">Faculty ID</th>
                        <th className="px-4 py-4">Department</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {teachers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-slate-400">
                            No faculty teachers registered yet. Click <strong>Enroll Teacher</strong> to provision educators.
                          </td>
                        </tr>
                      ) : (
                        teachers.map((tc) => (
                          <tr key={tc._id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-xs shrink-0">
                                  {tc.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{tc.name}</p>
                                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Mail className="w-2.5 h-2.5" />
                                    {tc.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                {tc.designation || 'Faculty / Lecturer'}
                              </span>
                            </td>
                            <td className="px-4 py-4 font-mono font-semibold text-slate-700">
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200/60 text-[11px]">
                                {tc.facultyIdNumber || 'FAC-EMP'}
                              </span>
                            </td>
                            <td className="px-4 py-4 font-semibold text-slate-800">
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
                <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
                  {/* Modal Header */}
                  <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                        <UserPlus className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900">Enroll Student</h3>
                        <p className="text-[11px] text-slate-400">Directly provision a learner under {institution?.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEnrollModalOpen(false)}
                      className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modal Body Form */}
                  <form onSubmit={handleEnrollStudent}>
                    <div className="p-6 space-y-4 text-xs">
                      {enrollMsg && (
                        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
                          {enrollMsg}
                        </div>
                      )}

                      <div>
                        <label className="font-bold text-slate-700 block mb-1.5">Student Full Name</label>
                        <input
                          type="text"
                          required
                          value={stName}
                          onChange={(e) => setStName(e.target.value)}
                          placeholder="e.g. Alex Johnson"
                          className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1.5">Student Institutional Email</label>
                        <input
                          type="email"
                          required
                          value={stEmail}
                          onChange={(e) => setStEmail(e.target.value)}
                          placeholder="alex.johnson@synexora.edu"
                          className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1.5">Student Roll / ID</label>
                          <input
                            type="text"
                            value={stRoll}
                            onChange={(e) => setStRoll(e.target.value)}
                            placeholder="e.g. STU-2026-001"
                            className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1.5">Department</label>
                          <select
                            value={stDept}
                            onChange={(e) => setStDept(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                          >
                            {institution?.departments?.map((d, idx) => (
                              <option key={idx} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                          <span>Temporary Access Password</span>
                          <span className="text-[10px] text-slate-400 font-normal">Min 6 chars</span>
                        </label>
                        <div className="relative">
                          <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            required
                            value={stPassword}
                            onChange={(e) => setStPassword(e.target.value)}
                            placeholder="StudentPass123!"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEnrollModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isEnrolling || !stName.trim()}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                      >
                        {isEnrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                        <span>{isEnrolling ? 'Enrolling...' : 'Enroll Student'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL: ENROLL TEACHER */}
            {isEnrollTeacherModalOpen && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex min-h-screen items-center justify-center p-4 sm:p-6">
                <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
                  {/* Modal Header */}
                  <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900">Enroll Campus Teacher</h3>
                        <p className="text-[11px] text-slate-400">Register faculty educator for {institution?.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEnrollTeacherModalOpen(false)}
                      className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modal Body Form */}
                  <form onSubmit={handleEnrollTeacher}>
                    <div className="p-6 space-y-4 text-xs">
                      {enrollTeacherMsg && (
                        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
                          {enrollTeacherMsg}
                        </div>
                      )}

                      <div>
                        <label className="font-bold text-slate-700 block mb-1.5">Faculty Full Name</label>
                        <input
                          type="text"
                          required
                          value={tcName}
                          onChange={(e) => setTcName(e.target.value)}
                          placeholder="e.g. Dr. Sarah Mitchell"
                          className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1.5">Faculty Institutional Email</label>
                        <input
                          type="email"
                          required
                          value={tcEmail}
                          onChange={(e) => setTcEmail(e.target.value)}
                          placeholder="sarah.mitchell@synexora.edu"
                          className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1.5">Academic Designation</label>
                          <select
                            value={tcDesignation}
                            onChange={(e) => setTcDesignation(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
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
                          <label className="font-bold text-slate-700 block mb-1.5">Faculty ID / Emp #</label>
                          <input
                            type="text"
                            value={tcFacultyId}
                            onChange={(e) => setTcFacultyId(e.target.value)}
                            placeholder="e.g. FAC-CS-101"
                            className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1.5">Academic Department</label>
                        <select
                          value={tcDept}
                          onChange={(e) => setTcDept(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                        >
                          {institution?.departments?.map((d, idx) => (
                            <option key={idx} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                          <span>Temporary Access Password</span>
                          <span className="text-[10px] text-slate-400 font-normal">Min 6 characters</span>
                        </label>
                        <div className="relative">
                          <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            required
                            value={tcPassword}
                            onChange={(e) => setTcPassword(e.target.value)}
                            placeholder="TeacherPass123!"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEnrollTeacherModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isEnrollingTeacher || !tcName.trim() || !tcEmail.trim()}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                      >
                        {isEnrollingTeacher ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
                        <span>{isEnrollingTeacher ? 'Enrolling Teacher...' : 'Enroll Teacher'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};
