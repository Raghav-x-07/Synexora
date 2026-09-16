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
  Loader2,
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

interface Analytics {
  totalStudents: number;
  activeStudents: number;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'departments'>('overview');

  // Search & Filter
  const [studentSearch, setStudentSearch] = useState('');
  const deptFilter = 'all';
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

  const fetchCampusData = async () => {
    try {
      setIsLoading(true);
      const [instRes, analRes, stuRes] = await Promise.all([
        API.get('/institutions/my-institution'),
        API.get('/institutions/my-institution/analytics'),
        API.get(`/institutions/my-institution/students?department=${deptFilter}&search=${studentSearch}`),
      ]);

      if (instRes.data.success) {
        setInstitution(instRes.data.institution);
        if (!stDept && instRes.data.institution.departments?.length > 0) {
          setStDept(instRes.data.institution.departments[0]);
        }
      }
      if (analRes.data.success) setAnalytics(analRes.data.analytics);
      if (stuRes.data.success) setStudents(stuRes.data.students);
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
      }
    } catch (err: any) {
      setEnrollMsg(err.response?.data?.message || 'Failed to enroll student.');
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-16">
        {isLoading && !institution ? (
          <div className="flex items-center justify-center py-24 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            <span className="text-xs font-semibold">Loading campus command center...</span>
          </div>
        ) : (
          <>
            {/* Campus Header Banner */}
            {institution && (
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-800 via-blue-900 to-slate-900 text-white shadow-lg relative overflow-hidden">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-white/20 backdrop-blur-xs">
                  {institution.plan.toUpperCase()} CAMPUS LICENSE
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Institution</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
                {institution.name}
              </h1>
              <p className="text-xs text-white/80">
                {institution.domain || 'Campus Portal'} • {institution.departments?.length || 0} Academic Departments
              </p>
            </div>

            {/* Campus Enrollment Code Card */}
            <div className="mt-5 sm:mt-0 sm:absolute sm:right-6 sm:bottom-6 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl text-xs flex items-center gap-3 shadow-md">
              <div>
                <span className="text-[10px] text-white/70 block uppercase font-bold">Student Enrollment Code</span>
                <span className="text-sm font-mono font-black text-white">{institution.code}</span>
              </div>
              <button
                onClick={() => handleCopyCode(institution.code)}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                title="Copy Code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Seat Quota & Metrics Bar */}
        {analytics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase">Seat Utilization</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {analytics.usedSeats} / {analytics.maxSeats}
              </p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${Math.min(analytics.seatUtilizationPct, 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase">Active Students</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{analytics.activeStudents}</p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">100% active standing</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase">Campus Classrooms</span>
                <BookOpen className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{analytics.totalClassrooms}</p>
              <p className="text-[11px] text-slate-500 mt-1">Active course spaces</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase">Evaluations & Quizzes</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{analytics.assessmentsCount}</p>
              <p className="text-[11px] text-slate-500 mt-1">Completed by students</p>
            </div>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3 text-xs font-bold">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'overview'
                  ? 'bg-indigo-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Campus Overview
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'students'
                  ? 'bg-indigo-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Student Roster ({students.length})
            </button>
          </div>

          <button
            onClick={() => setIsEnrollModalOpen(true)}
            className="btn-primary text-xs py-2 px-4 font-semibold bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1.5 shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && institution && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900">Academic Departments & Branches</h3>
              <p className="text-xs text-slate-500">
                Students enrolling with code <strong>{institution.code}</strong> can register under these departments.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                {institution.departments.map((dept, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800">
                    {dept}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
              <h3 className="text-sm font-black text-slate-900">Quick Share Invite</h3>
              <p className="text-slate-500">
                Share this code with incoming students for automatic campus enrollment:
              </p>
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                <span className="font-mono text-lg font-black text-indigo-950 block">{institution.code}</span>
                <span className="text-[10px] text-indigo-700 font-semibold">Valid for all departments</span>
              </div>
              <button
                onClick={() => handleCopyCode(institution.code)}
                className="btn-secondary w-full py-2 flex items-center justify-center gap-1 font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Code Copied!' : 'Copy Student Invite Code'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENTS ROSTER */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') fetchCampusData();
                    }}
                    placeholder="Search by name, email, roll ID..."
                    className="text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase">
                  <tr>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-3 py-3">Roll / Student ID</th>
                    <th className="px-3 py-3">Department</th>
                    <th className="px-3 py-3">Batch</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No students enrolled yet. Invite students using code <strong>{institution?.code}</strong>.
                      </td>
                    </tr>
                  ) : (
                    students.map((st) => (
                      <tr key={st._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-900">{st.name}</p>
                          <p className="text-[10px] text-slate-400">{st.email}</p>
                        </td>
                        <td className="px-3 py-3.5 font-mono font-semibold text-slate-700">
                          {st.studentIdNumber || 'N/A'}
                        </td>
                        <td className="px-3 py-3.5 font-semibold text-slate-800">
                          {st.department}
                        </td>
                        <td className="px-3 py-3.5 text-slate-500">{st.batchYear}</td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 uppercase">
                            {st.accountStatus}
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
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">Enroll Student under Campus</h3>
                <button onClick={() => setIsEnrollModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              {enrollMsg && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">
                  {enrollMsg}
                </div>
              )}

              <form onSubmit={handleEnrollStudent} className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Student Full Name</label>
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
                  <label className="font-bold text-slate-700 block mb-1">Student Email Address</label>
                  <input
                    type="email"
                    required
                    value={stEmail}
                    onChange={(e) => setStEmail(e.target.value)}
                    placeholder="alex@stanford.edu"
                    className="input-clean"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Temporary Password</label>
                  <input
                    type="text"
                    required
                    value={stPassword}
                    onChange={(e) => setStPassword(e.target.value)}
                    placeholder="TempPass123!"
                    className="input-clean font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Student Roll / ID</label>
                    <input
                      type="text"
                      value={stRoll}
                      onChange={(e) => setStRoll(e.target.value)}
                      placeholder="e.g. STU-2026-001"
                      className="input-clean"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Department</label>
                    <select
                      value={stDept}
                      onChange={(e) => setStDept(e.target.value)}
                      className="input-clean bg-white"
                    >
                      {institution?.departments?.map((d, idx) => (
                        <option key={idx} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEnrollModalOpen(false)}
                    className="btn-secondary py-2 px-4 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isEnrolling || !stName.trim()}
                    className="btn-primary py-2 px-5 font-semibold bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isEnrolling ? 'Enrolling...' : 'Enroll Student'}
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
