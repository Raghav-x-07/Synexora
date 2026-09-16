import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import API from '../lib/api';
import {
  ShieldCheck,
  Building2,
  Users,
  Search,
  Plus,
  Loader2,
  RefreshCw,
  Cpu,
  Award,
  Key,
} from 'lucide-react';

interface InstitutionItem {
  _id: string;
  name: string;
  code: string;
  domain: string;
  plan: string;
  maxSeats: number;
  usedSeats: number;
  departments: string[];
  status: 'active' | 'pending_approval' | 'suspended';
  adminUser?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  accountStatus: 'active' | 'pending_approval' | 'suspended';
  institutionCode?: string;
  institutionId?: {
    name: string;
    code: string;
  };
  department?: string;
  studentIdNumber?: string;
  createdAt: string;
}

interface Stats {
  totalInstitutions: number;
  activeInstitutions: number;
  pendingInstitutions: number;
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  totalClassrooms: number;
  totalAssessments: number;
  totalDocuments: number;
  roleBreakdown: {
    superAdmin: number;
    institutionAdmin: number;
    institutionStudent: number;
    personalStudent: number;
  };
}

export const SuperAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'institutions' | 'users' | 'provision'>('institutions');
  const [stats, setStats] = useState<Stats | null>(null);
  const [institutions, setInstitutions] = useState<InstitutionItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  // Modal: Onboard Institution
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [newInstName, setNewInstName] = useState('');
  const [newInstCode, setNewInstCode] = useState('');
  const [newInstDomain, setNewInstDomain] = useState('');
  const [newInstSeats, setNewInstSeats] = useState(500);
  const [newInstPlan, setNewInstPlan] = useState('professional');
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardMsg, setOnboardMsg] = useState<string | null>(null);

  // Provision User state
  const [provName, setProvName] = useState('');
  const [provEmail, setProvEmail] = useState('');
  const [provPassword, setProvPassword] = useState('');
  const [provRole, setProvRole] = useState('institution_admin');
  const [provInstCode, setProvInstCode] = useState('');
  const [provDept, setProvDept] = useState('Computer Science');
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provSuccess, setProvSuccess] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, instRes, usersRes] = await Promise.all([
        API.get('/admin/overview'),
        API.get('/admin/institutions'),
        API.get(`/admin/users?role=${userRoleFilter}&status=${userStatusFilter}&search=${userSearch}`),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (instRes.data.success) setInstitutions(instRes.data.institutions);
      if (usersRes.data.success) setUsers(usersRes.data.users);
    } catch (err) {
      console.error('Fetch admin data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [userRoleFilter, userStatusFilter]);

  // Handle Institution Status Toggle
  const handleToggleInstitutionStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await API.put(`/admin/institutions/${id}/status`, { status: nextStatus });
      if (res.data.success) {
        setInstitutions(institutions.map((i) => (i._id === id ? { ...i, status: nextStatus } : i)));
      }
    } catch (err) {
      console.error('Update institution status error:', err);
    }
  };

  // Handle User Status Toggle
  const handleToggleUserStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await API.put(`/admin/users/${id}/status`, { status: nextStatus });
      if (res.data.success) {
        setUsers(users.map((u) => (u._id === id ? { ...u, accountStatus: nextStatus } : u)));
      }
    } catch (err) {
      console.error('Update user status error:', err);
    }
  };

  // Onboard Institution Form Submit
  const handleOnboardInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstName.trim()) return;

    try {
      setIsOnboarding(true);
      setOnboardMsg(null);
      const res = await API.post('/admin/institutions', {
        name: newInstName.trim(),
        code: newInstCode.trim().toUpperCase(),
        domain: newInstDomain.trim(),
        maxSeats: newInstSeats,
        plan: newInstPlan,
      });

      if (res.data.success && res.data.institution) {
        setInstitutions([res.data.institution, ...institutions]);
        setIsOnboardModalOpen(false);
        setNewInstName('');
        setNewInstCode('');
        setNewInstDomain('');
        fetchAdminData();
      }
    } catch (err: any) {
      setOnboardMsg(err.response?.data?.message || 'Failed to onboard institution.');
    } finally {
      setIsOnboarding(false);
    }
  };

  // Direct Provision User Submit
  const handleProvisionUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provName.trim() || !provEmail.trim() || !provPassword) return;

    try {
      setIsProvisioning(true);
      setProvSuccess(null);
      const res = await API.post('/admin/users/create', {
        name: provName.trim(),
        email: provEmail.trim(),
        password: provPassword,
        role: provRole,
        institutionCode: provInstCode.trim(),
        department: provDept.trim(),
      });

      if (res.data.success) {
        setProvSuccess(`Account provisioned and activated for ${provEmail.trim()}!`);
        setProvName('');
        setProvEmail('');
        setProvPassword('');
        fetchAdminData();
      }
    } catch (err: any) {
      setProvSuccess(err.response?.data?.message || 'Failed to provision account.');
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 flex items-center justify-center text-emerald-400 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Super Administrator Portal</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Master Control
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Central management for campus licenses, user permissions, seat quotas, and platform operations.
              </p>
            </div>
          </div>

          <button
            onClick={fetchAdminData}
            disabled={isLoading}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 font-semibold text-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Updating...' : 'Refresh Metrics'}</span>
          </button>
        </div>

        {/* Executive KPI Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase">Institutions</span>
                <Building2 className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.totalInstitutions}</p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                {stats.activeInstitutions} active campus licenses
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase">Platform Users</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.totalUsers}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                {stats.activeUsers} active • {stats.pendingUsers} pending
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase">Classrooms</span>
                <Award className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.totalClassrooms}</p>
              <p className="text-[11px] text-slate-500 mt-1">{stats.totalAssessments} evaluations taken</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase">System Status</span>
                <Cpu className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-sm font-black text-emerald-700 flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Operational</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">AI Engine Online</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('institutions')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'institutions'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Institutions & Campus Licenses ({institutions.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'users'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            User Access & Permissions Directory ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('provision')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'provision'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            + Quick Provision Account
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: INSTITUTIONS & LICENSES                                 */}
        {/* ============================================================== */}
        {activeTab === 'institutions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={institutionSearch}
                  onChange={(e) => setInstitutionSearch(e.target.value)}
                  placeholder="Search by campus name or code..."
                  className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={() => setIsOnboardModalOpen(true)}
                className="btn-primary text-xs py-2 px-4 font-semibold bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard New Institution</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase">
                  <tr>
                    <th className="px-5 py-3">Institution / Campus</th>
                    <th className="px-3 py-3">Code</th>
                    <th className="px-3 py-3">Plan & Seats</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Access Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {institutions
                    .filter(
                      (i) =>
                        i.name.toLowerCase().includes(institutionSearch.toLowerCase()) ||
                        i.code.toLowerCase().includes(institutionSearch.toLowerCase())
                    )
                    .map((inst) => (
                      <tr key={inst._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-900">{inst.name}</p>
                          <p className="text-[10px] text-slate-400">{inst.domain || 'All domains'} • {inst.departments?.length || 0} Depts</p>
                        </td>
                        <td className="px-3 py-3.5">
                          <span className="font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px]">
                            {inst.code}
                          </span>
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="text-slate-700">
                            <span className="font-bold capitalize">{inst.plan}</span>
                            <span className="text-[11px] text-slate-400 block">
                              {inst.usedSeats || 0} / {inst.maxSeats} Seats Used
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                              inst.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inst.status === 'pending_approval'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {inst.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => handleToggleInstitutionStatus(inst._id, inst.status)}
                            className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors ${
                              inst.status === 'active'
                                ? 'text-red-700 hover:bg-red-50 border border-red-200'
                                : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                            }`}
                          >
                            {inst.status === 'active' ? 'Suspend License' : 'Activate License'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: USER ACCESS & PERMISSIONS DIRECTORY                     */}
        {/* ============================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') fetchAdminData();
                    }}
                    placeholder="Search name, email, code..."
                    className="text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="text-xs py-2 px-2.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700"
                >
                  <option value="all">All Roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="institution_admin">Institution Admin</option>
                  <option value="institution_student">Campus Student</option>
                  <option value="personal_student">Personal Learner</option>
                </select>

                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="text-xs py-2 px-2.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending_approval">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase">
                  <tr>
                    <th className="px-5 py-3">User Name & Email</th>
                    <th className="px-3 py-3">Role</th>
                    <th className="px-3 py-3">Campus Affiliation</th>
                    <th className="px-3 py-3">Account Status</th>
                    <th className="px-4 py-3 text-right">Super Admin Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 uppercase">
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="font-semibold text-slate-800">
                          {u.institutionId?.name || u.institutionCode || 'Personal Workspace'}
                        </p>
                        {u.department && <p className="text-[10px] text-slate-400">{u.department}</p>}
                      </td>
                      <td className="px-3 py-3.5">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                            u.accountStatus === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : u.accountStatus === 'pending_approval'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {u.accountStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u._id, u.accountStatus)}
                          className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors ${
                            u.accountStatus === 'active'
                              ? 'text-red-700 hover:bg-red-50 border border-red-200'
                              : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                          }`}
                        >
                          {u.accountStatus === 'active' ? 'Suspend Access' : 'Activate Access'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: PROVISION ACCOUNT                                       */}
        {/* ============================================================== */}
        {activeTab === 'provision' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-lg space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600" />
              <span>Direct Pre-Approved Account Provisioning</span>
            </h3>
            <p className="text-xs text-slate-500">
              Super Admin can directly issue pre-approved active credentials for campus administrators, faculty, or students.
            </p>

            {provSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
                {provSuccess}
              </div>
            )}

            <form onSubmit={handleProvisionUser} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={provName}
                  onChange={(e) => setProvName(e.target.value)}
                  placeholder="e.g. Dr. Alan Turing"
                  className="input-clean"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={provEmail}
                  onChange={(e) => setProvEmail(e.target.value)}
                  placeholder="e.g. dean@stanford.edu"
                  className="input-clean"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Temporary Password</label>
                <input
                  type="text"
                  required
                  value={provPassword}
                  onChange={(e) => setProvPassword(e.target.value)}
                  placeholder="e.g. TempPass2026!"
                  className="input-clean font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role</label>
                  <select
                    value={provRole}
                    onChange={(e) => setProvRole(e.target.value)}
                    className="input-clean bg-white"
                  >
                    <option value="institution_admin">Institution Admin</option>
                    <option value="institution_student">Campus Student</option>
                    <option value="personal_student">Personal Learner</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Institution Code (Optional)</label>
                  <input
                    type="text"
                    value={provInstCode}
                    onChange={(e) => setProvInstCode(e.target.value.toUpperCase())}
                    placeholder="INST-DEMO"
                    className="input-clean font-mono uppercase"
                  />
                </div>
              </div>

              {(provRole === 'institution_student' || provRole === 'institution_admin') && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department</label>
                  <input
                    type="text"
                    value={provDept}
                    onChange={(e) => setProvDept(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="input-clean"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isProvisioning}
                className="btn-primary w-full py-2.5 font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-1.5"
              >
                {isProvisioning ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Provision & Activate Account</span>
              </button>
            </form>
          </div>
        )}

        {/* MODAL: ONBOARD INSTITUTION */}
        {isOnboardModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">Onboard New Campus Institution</h3>
                <button onClick={() => setIsOnboardModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              {onboardMsg && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">
                  {onboardMsg}
                </div>
              )}

              <form onSubmit={handleOnboardInstitution} className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Institution Name</label>
                  <input
                    type="text"
                    required
                    value={newInstName}
                    onChange={(e) => setNewInstName(e.target.value)}
                    placeholder="e.g. Oxford Institute of AI & Technology"
                    className="input-clean"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Custom Code (Optional)</label>
                    <input
                      type="text"
                      value={newInstCode}
                      onChange={(e) => setNewInstCode(e.target.value.toUpperCase())}
                      placeholder="INST-OXF1"
                      className="input-clean font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Domain</label>
                    <input
                      type="text"
                      value={newInstDomain}
                      onChange={(e) => setNewInstDomain(e.target.value)}
                      placeholder="@oxford.edu"
                      className="input-clean"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Seat License Limit</label>
                    <input
                      type="number"
                      min={10}
                      value={newInstSeats}
                      onChange={(e) => setNewInstSeats(parseInt(e.target.value, 10) || 500)}
                      className="input-clean"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Plan Tier</label>
                    <select
                      value={newInstPlan}
                      onChange={(e) => setNewInstPlan(e.target.value)}
                      className="input-clean bg-white"
                    >
                      <option value="starter">Starter (100 Seats)</option>
                      <option value="professional">Professional (500 Seats)</option>
                      <option value="enterprise">Enterprise (Unlimited)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsOnboardModalOpen(false)}
                    className="btn-secondary py-2 px-4 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isOnboarding || !newInstName.trim()}
                    className="btn-primary py-2 px-5 font-semibold bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isOnboarding ? 'Onboarding...' : 'Onboard Institution'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
