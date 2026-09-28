import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import API from '../lib/api';
import {
  Building2,
  Users,
  Search,
  Plus,
  Loader2,
  RefreshCw,
  Trash2,
  Edit,
  CheckCircle2,
  AlertTriangle,
  X,
  Mail,
  ArrowLeft,
  UserCheck,
  GraduationCap,
} from 'lucide-react';

interface InstitutionItem {
  _id: string;
  name: string;
  code: string;
  domain: string;
  plan: 'starter' | 'professional' | 'enterprise' | string;
  maxSeats: number;
  usedSeats: number;
  departments: string[];
  status: 'active' | 'pending_approval' | 'suspended';
  contactEmail?: string;
  phone?: string;
  address?: string;
  bannerTheme?: string;
  adminUser?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface StudentItem {
  _id: string;
  name: string;
  email: string;
  studentIdNumber: string;
  department: string;
  batchYear: string;
  gpa: number;
  streak: number;
  accountStatus: 'active' | 'pending_approval' | 'suspended';
  totalMinutes: number;
  totalHours: string;
  sessionCount: number;
  enrolledClasses: number;
  createdAt: string;
}

interface Stats {
  totalInstitutions: number;
  activeInstitutions: number;
  pendingInstitutions: number;
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
  const [stats, setStats] = useState<Stats | null>(null);
  const [institutions, setInstitutions] = useState<InstitutionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Status filters for institutions list
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Institution for Viewing its Student Details
  const [selectedInstitution, setSelectedInstitution] = useState<InstitutionItem | null>(null);
  const [institutionStudents, setInstitutionStudents] = useState<StudentItem[]>([]);
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDeptFilter, setStudentDeptFilter] = useState('all');

  // Notification Toast
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal: Add Institution State
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [newInstName, setNewInstName] = useState('');
  const [newInstCode, setNewInstCode] = useState('');
  const [newInstDomain, setNewInstDomain] = useState('');
  const [newInstSeats, setNewInstSeats] = useState(500);
  const [newInstPlan, setNewInstPlan] = useState('professional');
  const [newInstDepts, setNewInstDepts] = useState('Computer Science & AI, Data Science, Business');
  const [newInstEmail, setNewInstEmail] = useState('');
  const [newInstPhone, setNewInstPhone] = useState('');
  const [newInstAddress, setNewInstAddress] = useState('');
  const [isOnboarding, setIsOnboarding] = useState(false);

  // Modal: Edit Institution State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInst, setEditingInst] = useState<InstitutionItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editDomain, setEditDomain] = useState('');
  const [editSeats, setEditSeats] = useState(500);
  const [editPlan, setEditPlan] = useState('professional');
  const [editDepts, setEditDepts] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editTheme, setEditTheme] = useState('indigo');
  const [editStatus, setEditStatus] = useState<'active' | 'pending_approval' | 'suspended'>('active');
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal: Delete Institution State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingInst, setDeletingInst] = useState<InstitutionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal: Add Student to Selected Institution State
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('student123');
  const [newStudentIdNumber, setNewStudentIdNumber] = useState('');
  const [newStudentDept, setNewStudentDept] = useState('');
  const [newStudentBatch, setNewStudentBatch] = useState('2024-2028');
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, instRes] = await Promise.all([
        API.get('/admin/overview'),
        API.get('/admin/institutions'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (instRes.data.success) setInstitutions(instRes.data.institutions);
    } catch (err) {
      console.error('Fetch admin data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Fetch Students for a specific Institution
  const fetchInstitutionStudents = async (instId: string) => {
    try {
      setIsStudentsLoading(true);
      const params: any = {};
      if (studentDeptFilter !== 'all') params.department = studentDeptFilter;
      if (studentSearch.trim()) params.search = studentSearch.trim();

      const res = await API.get(`/admin/institutions/${instId}/students`, { params });
      if (res.data.success) {
        setInstitutionStudents(res.data.students || []);
      }
    } catch (err: any) {
      console.error('Fetch institution students error:', err);
      showToast('error', err.response?.data?.message || 'Failed to fetch students for this institution.');
    } finally {
      setIsStudentsLoading(false);
    }
  };

  // Open Student Details View inside an Institution
  const handleOpenInstitutionStudents = (inst: InstitutionItem) => {
    setSelectedInstitution(inst);
    setStudentSearch('');
    setStudentDeptFilter('all');
    fetchInstitutionStudents(inst._id);
  };

  useEffect(() => {
    if (selectedInstitution) {
      fetchInstitutionStudents(selectedInstitution._id);
    }
  }, [studentDeptFilter]);

  // Handle Student Search Submit
  const handleStudentSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInstitution) {
      fetchInstitutionStudents(selectedInstitution._id);
    }
  };

  // Handle Institution Status Toggle
  const handleToggleInstitutionStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await API.put(`/admin/institutions/${id}/status`, { status: nextStatus });
      if (res.data.success) {
        setInstitutions(institutions.map((i) => (i._id === id ? { ...i, status: nextStatus as any } : i)));
        if (selectedInstitution && selectedInstitution._id === id) {
          setSelectedInstitution({ ...selectedInstitution, status: nextStatus as any });
        }
        showToast('success', `Institution status updated to ${nextStatus}.`);
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to update institution status.');
    }
  };

  // Handle Student Status Toggle
  const handleToggleStudentStatus = async (studentId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await API.put(`/admin/users/${studentId}/status`, { status: nextStatus });
      if (res.data.success) {
        setInstitutionStudents(
          institutionStudents.map((s) => (s._id === studentId ? { ...s, accountStatus: nextStatus as any } : s))
        );
        showToast('success', `Student account status updated to ${nextStatus}.`);
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to update student status.');
    }
  };

  // Handle Add Student to Institution
  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstitution || !newStudentName.trim() || !newStudentEmail.trim() || !newStudentPassword) return;

    try {
      setIsAddingStudent(true);
      const res = await API.post(`/admin/institutions/${selectedInstitution._id}/students`, {
        name: newStudentName.trim(),
        email: newStudentEmail.trim(),
        password: newStudentPassword,
        studentIdNumber: newStudentIdNumber.trim(),
        department: newStudentDept || selectedInstitution.departments?.[0] || 'General',
        batchYear: newStudentBatch.trim(),
      });

      if (res.data.success) {
        showToast('success', res.data.message || 'Student enrolled successfully!');
        setIsAddStudentModalOpen(false);
        setNewStudentName('');
        setNewStudentEmail('');
        setNewStudentPassword('student123');
        setNewStudentIdNumber('');
        fetchInstitutionStudents(selectedInstitution._id);
        fetchAdminData();
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to enroll student.');
    } finally {
      setIsAddingStudent(false);
    }
  };

  // Handle Delete Student from Institution
  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!selectedInstitution) return;
    if (!window.confirm(`Are you sure you want to remove "${studentName}" from ${selectedInstitution.name}?`)) return;

    try {
      const res = await API.delete(`/admin/institutions/${selectedInstitution._id}/students/${studentId}`);
      if (res.data.success) {
        showToast('success', res.data.message || 'Student removed successfully.');
        setInstitutionStudents(institutionStudents.filter((s) => s._id !== studentId));
        fetchAdminData();
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to remove student.');
    }
  };

  // Onboard Institution Form Submit
  const handleOnboardInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstName.trim()) return;

    try {
      setIsOnboarding(true);
      const res = await API.post('/admin/institutions', {
        name: newInstName.trim(),
        code: newInstCode.trim().toUpperCase(),
        domain: newInstDomain.trim(),
        maxSeats: newInstSeats,
        plan: newInstPlan,
        departments: newInstDepts.split(',').map((d) => d.trim()).filter(Boolean),
        contactEmail: newInstEmail.trim(),
        phone: newInstPhone.trim(),
        address: newInstAddress.trim(),
        bannerTheme: 'indigo',
      });

      if (res.data.success && res.data.institution) {
        setInstitutions([res.data.institution, ...institutions]);
        setIsOnboardModalOpen(false);
        setNewInstName('');
        setNewInstCode('');
        setNewInstDomain('');
        setNewInstEmail('');
        setNewInstPhone('');
        setNewInstAddress('');
        showToast('success', `Institution "${res.data.institution.name}" successfully created!`);
        fetchAdminData();
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to onboard institution.');
    } finally {
      setIsOnboarding(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (inst: InstitutionItem) => {
    setEditingInst(inst);
    setEditName(inst.name);
    setEditCode(inst.code);
    setEditDomain(inst.domain || '');
    setEditSeats(inst.maxSeats || 500);
    setEditPlan(inst.plan || 'professional');
    setEditDepts(inst.departments?.join(', ') || '');
    setEditEmail(inst.contactEmail || '');
    setEditPhone(inst.phone || '');
    setEditAddress(inst.address || '');
    setEditTheme(inst.bannerTheme || 'indigo');
    setEditStatus(inst.status || 'active');
    setIsEditModalOpen(true);
  };

  // Submit Edit Form
  const handleUpdateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInst || !editName.trim()) return;

    try {
      setIsUpdating(true);
      const res = await API.put(`/admin/institutions/${editingInst._id}`, {
        name: editName.trim(),
        code: editCode.trim().toUpperCase(),
        domain: editDomain.trim(),
        maxSeats: editSeats,
        plan: editPlan,
        departments: editDepts.split(',').map((d) => d.trim()).filter(Boolean),
        contactEmail: editEmail.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
        bannerTheme: editTheme,
        status: editStatus,
      });

      if (res.data.success && res.data.institution) {
        setInstitutions(institutions.map((i) => (i._id === editingInst._id ? res.data.institution : i)));
        if (selectedInstitution && selectedInstitution._id === editingInst._id) {
          setSelectedInstitution(res.data.institution);
        }
        setIsEditModalOpen(false);
        setEditingInst(null);
        showToast('success', `Institution "${res.data.institution.name}" updated successfully!`);
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to update institution.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (inst: InstitutionItem) => {
    setDeletingInst(inst);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingInst) return;

    try {
      setIsDeleting(true);
      const res = await API.delete(`/admin/institutions/${deletingInst._id}`);
      if (res.data.success) {
        setInstitutions(institutions.filter((i) => i._id !== deletingInst._id));
        if (selectedInstitution && selectedInstitution._id === deletingInst._id) {
          setSelectedInstitution(null);
        }
        setIsDeleteModalOpen(false);
        setDeletingInst(null);
        showToast('success', res.data.message || 'Institution removed successfully.');
        fetchAdminData();
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to delete institution.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered institutions
  const filteredInstitutions = institutions.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(institutionSearch.toLowerCase()) ||
      inst.code.toLowerCase().includes(institutionSearch.toLowerCase()) ||
      (inst.domain && inst.domain.toLowerCase().includes(institutionSearch.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || inst.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Toast Notification */}
        {notification && (
          <div
            className={`fixed top-5 right-5 z-50 p-4 rounded-3xl shadow-xl flex items-center gap-3 border text-xs font-bold animate-bounce ${
              notification.type === 'success'
                ? 'bg-[#111111] text-[#F4C542] border-[#F4C542]/40'
                : 'bg-rose-900 text-white border-rose-700'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#F4C542]" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* TOP EXECUTIVE HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl p-6 sm:p-7 shadow-sm">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight">
                  Manage Institutions
                </h1>
                <p className="text-xs text-[#777777] mt-0.5">
                  Provision and configure campus institutions, and inspect enrolled student details inside each institution.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-auto">
            <button
              onClick={fetchAdminData}
              className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center gap-2"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsOnboardModalOpen(true)}
              className="btn-primary text-xs py-2.5 px-4.5 font-extrabold flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Institution</span>
            </button>
          </div>
        </div>

        {/* 4 HIGH-LEVEL KPI METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-clean-interactive p-5">
            <div className="flex items-center justify-between text-[#777777] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Total Institutions</span>
              <div className="w-8 h-8 rounded-full bg-[#FFF8E8] text-[#111111] flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#111111]" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-[#111111] tracking-tight">{stats?.totalInstitutions || institutions.length}</p>
            <p className="text-[11px] text-[#777777] mt-1">Registered academic campuses</p>
          </div>

          <div className="card-clean-interactive p-5">
            <div className="flex items-center justify-between text-[#777777] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Active Campuses</span>
              <div className="w-8 h-8 rounded-full bg-[#FFF8E8] text-[#111111] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-[#111111]" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-[#111111] tracking-tight">{stats?.activeInstitutions || 0}</p>
            <p className="text-[11px] text-[#777777] mt-1">Operational with active licenses</p>
          </div>

          <div className="card-clean-interactive p-5">
            <div className="flex items-center justify-between text-[#777777] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Enrolled Campus Students</span>
              <div className="w-8 h-8 rounded-full bg-[#FFF8E8] text-[#F4C542] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-[#111111] tracking-tight">
              {stats?.roleBreakdown?.institutionStudent || 0}
            </p>
            <p className="text-[11px] text-[#777777] mt-1">Across all registered institutions</p>
          </div>

          <div className="card-clean-interactive p-5">
            <div className="flex items-center justify-between text-[#777777] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Academic Classrooms</span>
              <div className="w-8 h-8 rounded-full bg-[#FFF8E8] text-[#111111] flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-[#111111]" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-[#111111] tracking-tight">{stats?.totalClassrooms || 0}</p>
            <p className="text-[11px] text-[#777777] mt-1">Active courses & sections</p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: INSIDE SPECIFIC INSTITUTION - SHOW STUDENT DETAILS */}
        {/* ========================================================================= */}
        {selectedInstitution ? (
          <div className="space-y-6 animate-fade-in">
            {/* Institution Banner & Navigation */}
            <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <button
                  onClick={() => setSelectedInstitution(null)}
                  className="btn-secondary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 self-start"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to All Institutions</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setNewStudentDept(selectedInstitution.departments?.[0] || '');
                      setIsAddStudentModalOpen(true);
                    }}
                    className="btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Student to Institution</span>
                  </button>
                </div>
              </div>

              {/* Institution Summary Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-[#E8E1D2]/70">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#111111] text-[#F4C542] flex items-center justify-center font-extrabold text-lg shadow-xs">
                    {selectedInstitution.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-extrabold text-[#111111] tracking-tight">
                        {selectedInstitution.name}
                      </h2>
                      <span className="text-[10px] bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2] px-2.5 py-0.5 rounded-full font-bold">
                        Code: {selectedInstitution.code}
                      </span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                          selectedInstitution.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {selectedInstitution.status === 'active' ? 'Active Campus' : 'Suspended'}
                      </span>
                    </div>
                    <p className="text-xs text-[#777777] mt-0.5">
                      {selectedInstitution.domain ? `Domain: ${selectedInstitution.domain} • ` : ''}
                      Plan: <span className="text-[#111111] font-semibold uppercase text-[10px]">{selectedInstitution.plan}</span> • {institutionStudents.length} Students Enrolled
                    </p>
                  </div>
                </div>

                {/* Seat Quota Chip */}
                <div className="bg-[#FFFDF7] p-3 rounded-2xl border border-[#E8E1D2] min-w-[200px]">
                  <div className="flex justify-between text-xs font-bold text-[#111111] mb-1">
                    <span>Enrolled Seats</span>
                    <span>{institutionStudents.length} / {selectedInstitution.maxSeats}</span>
                  </div>
                  <div className="w-full bg-[#E8E1D2] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#111111] h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.round((institutionStudents.length / selectedInstitution.maxSeats) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Student Search & Department Filter */}
              <div className="mt-5 pt-4 border-t border-[#E8E1D2]/70 flex flex-col sm:flex-row items-center gap-3">
                <form onSubmit={handleStudentSearchSubmit} className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search student by name, email, or Student ID..."
                    className="input-clean pl-10 text-xs font-medium w-full"
                  />
                </form>

                <select
                  value={studentDeptFilter}
                  onChange={(e) => setStudentDeptFilter(e.target.value)}
                  className="input-clean text-xs font-semibold sm:w-48 w-full bg-white"
                >
                  <option value="all">All Departments</option>
                  {selectedInstitution.departments?.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => fetchInstitutionStudents(selectedInstitution._id)}
                  className="btn-secondary text-xs py-2 px-4 font-bold flex items-center gap-1.5 w-full sm:w-auto justify-center"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Students Roster Table */}
            <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl overflow-hidden shadow-xs">
              <div className="px-6 py-5 border-b border-[#E8E1D2] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#111111]">
                    Enrolled Students in {selectedInstitution.name}
                  </h3>
                  <p className="text-xs text-[#777777] mt-0.5">
                    Individual student profiles, department, study telemetry, and account statuses.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#111111] bg-[#FFF8E8] px-3 py-1 rounded-full border border-[#E8E1D2]">
                  {institutionStudents.length} Students Listed
                </span>
              </div>

              {isStudentsLoading ? (
                <div className="p-12 text-center text-[#777777] text-sm flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
                  <span>Loading students for {selectedInstitution.name}...</span>
                </div>
              ) : institutionStudents.length === 0 ? (
                <div className="p-12 text-center text-[#777777] text-sm space-y-3">
                  <p>No students enrolled under this institution yet matching your filter.</p>
                  <button
                    onClick={() => {
                      setNewStudentDept(selectedInstitution.departments?.[0] || '');
                      setIsAddStudentModalOpen(true);
                    }}
                    className="btn-primary text-xs py-2 px-4 font-bold inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Enroll First Student</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FFFDF7] border-b border-[#E8E1D2] text-[#777777] font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-4 pl-6">Student</th>
                        <th className="p-4">Student ID / Batch</th>
                        <th className="p-4">Department</th>
                        <th className="p-4">Study Time</th>
                        <th className="p-4">GPA / Streak</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E1D2]/60">
                      {institutionStudents.map((st) => (
                        <tr key={st._id} className="hover:bg-[#FFF8E8]/30 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold text-xs shrink-0">
                                {st.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-[#111111] block">{st.name}</span>
                                <span className="text-[11px] text-[#777777]">{st.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-[#111111] block">{st.studentIdNumber || 'N/A'}</span>
                            <span className="text-[10px] text-[#777777]">{st.batchYear || '2024-2028'}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-medium text-[#111111]">{st.department || 'General'}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-[#111111] block">{st.totalHours} hrs</span>
                            <span className="text-[10px] text-[#777777]">{st.sessionCount} sessions</span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-[#111111] block">{st.gpa || 3.8} GPA</span>
                            <span className="text-[10px] text-[#777777]">{st.streak || 0}d streak</span>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleStudentStatus(st._id, st.accountStatus)}
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                                st.accountStatus === 'active'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                              }`}
                            >
                              {st.accountStatus === 'active' ? 'Active' : 'Suspended'}
                            </button>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button
                              onClick={() => handleDeleteStudent(st._id, st.name)}
                              className="p-1.5 text-[#777777] hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
                              title="Remove student from institution"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: ALL INSTITUTIONS DIRECTORY */
          /* ========================================================================= */
          <div className="space-y-4">
            {/* Search & Status Filter */}
            <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3 shadow-xs">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={institutionSearch}
                  onChange={(e) => setInstitutionSearch(e.target.value)}
                  placeholder="Search institutions by name, code, or domain..."
                  className="input-clean pl-10 text-xs font-medium w-full"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-clean text-xs font-semibold sm:w-44 w-full bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending_approval">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Institutions Grid Cards */}
            {isLoading ? (
              <div className="p-12 text-center text-[#777777] text-sm flex items-center justify-center gap-2 bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl">
                <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
                <span>Loading institution registry...</span>
              </div>
            ) : filteredInstitutions.length === 0 ? (
              <div className="p-12 text-center text-[#777777] text-sm bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl">
                No institutions found matching your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredInstitutions.map((inst) => {
                  const fillPercent = Math.min(100, Math.round((inst.usedSeats / (inst.maxSeats || 500)) * 100));

                  return (
                    <div
                      key={inst._id}
                      className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl p-6 flex flex-col justify-between hover:shadow-apple-sm transition-all relative overflow-hidden"
                    >
                      <div>
                        {/* Top Row: Institution Name & Code */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-[#111111] text-[#F4C542] flex items-center justify-center font-extrabold text-base shadow-xs shrink-0">
                              {inst.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-base font-extrabold text-[#111111] tracking-tight">
                                {inst.name}
                              </h3>
                              <p className="text-xs text-[#777777]">
                                {inst.domain ? inst.domain : 'Campus Domain Not Configured'}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border shrink-0 ${
                              inst.status === 'active'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            {inst.status === 'active' ? 'Active' : 'Suspended'}
                          </span>
                        </div>

                        {/* Code & Plan Chips */}
                        <div className="flex items-center gap-2 flex-wrap mb-4">
                          <span className="text-[10px] bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2] px-2.5 py-0.5 rounded-full font-bold">
                            Code: {inst.code}
                          </span>
                          <span className="text-[10px] bg-[#FFFDF7] text-[#777777] border border-[#E8E1D2] px-2.5 py-0.5 rounded-full font-semibold uppercase">
                            Plan: {inst.plan}
                          </span>
                          {inst.contactEmail && (
                            <span className="text-[10px] text-[#777777] flex items-center gap-1">
                              <Mail className="w-3 h-3 text-[#777777]" />
                              {inst.contactEmail}
                            </span>
                          )}
                        </div>

                        {/* Seat Usage Bar */}
                        <div className="bg-[#FFFDF7] p-3 rounded-2xl border border-[#E8E1D2] mb-4">
                          <div className="flex justify-between text-xs font-bold text-[#111111] mb-1">
                            <span>Student Enrollment</span>
                            <span>{inst.usedSeats} / {inst.maxSeats} seats</span>
                          </div>
                          <div className="w-full bg-[#E8E1D2] h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#111111] h-full rounded-full transition-all"
                              style={{ width: `${fillPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Departments Chips */}
                        {inst.departments && inst.departments.length > 0 && (
                          <div className="mb-4">
                            <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider block mb-1.5">
                              Departments
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {inst.departments.slice(0, 4).map((d, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] bg-[#FFF8E8]/80 text-[#111111] border border-[#E8E1D2] px-2 py-0.5 rounded-full font-medium"
                                >
                                  {d}
                                </span>
                              ))}
                              {inst.departments.length > 4 && (
                                <span className="text-[10px] text-[#777777] font-semibold self-center">
                                  +{inst.departments.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="pt-4 border-t border-[#E8E1D2] flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenInstitutionStudents(inst)}
                          className="btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5 shadow-xs"
                        >
                          <Users className="w-3.5 h-3.5 text-[#111111]" />
                          <span>View Students ({inst.usedSeats})</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleInstitutionStatus(inst._id, inst.status)}
                            className="btn-secondary text-xs py-2 px-3 font-semibold"
                            title="Toggle License Status"
                          >
                            {inst.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(inst)}
                            className="p-2 text-[#777777] hover:text-[#111111] hover:bg-[#FFF8E8] rounded-full transition-colors border border-[#E8E1D2]"
                            title="Edit Institution"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(inst)}
                            className="p-2 text-[#777777] hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors border border-[#E8E1D2]"
                            title="Delete Institution"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODALS */}
        {/* ========================================================================= */}

        {/* 1. ONBOARD NEW INSTITUTION MODAL */}
        {isOnboardModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#111111]/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#E8E1D2] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#111111]">Add New Institution</h3>
                    <p className="text-xs text-[#777777]">Provision campus code and seat quota</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOnboardModalOpen(false)}
                  className="p-1 text-[#777777] hover:text-[#111111] rounded-full hover:bg-[#FFF8E8]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleOnboardInstitution} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">Institution Name</label>
                  <input
                    type="text"
                    required
                    value={newInstName}
                    onChange={(e) => setNewInstName(e.target.value)}
                    placeholder="e.g. Stanford Academy of Science"
                    className="input-clean text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">Institution Code (Unique)</label>
                    <input
                      type="text"
                      value={newInstCode}
                      onChange={(e) => setNewInstCode(e.target.value)}
                      placeholder="e.g. STAN2024 (Auto-generated if blank)"
                      className="input-clean text-xs font-medium uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">Domain URL</label>
                    <input
                      type="text"
                      value={newInstDomain}
                      onChange={(e) => setNewInstDomain(e.target.value)}
                      placeholder="e.g. stanford.edu"
                      className="input-clean text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">Seat Quota</label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={newInstSeats}
                      onChange={(e) => setNewInstSeats(parseInt(e.target.value, 10))}
                      className="input-clean text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">Plan</label>
                    <select
                      value={newInstPlan}
                      onChange={(e) => setNewInstPlan(e.target.value)}
                      className="input-clean text-xs font-medium bg-white"
                    >
                      <option value="starter">Starter (100 seats)</option>
                      <option value="professional">Professional (500 seats)</option>
                      <option value="enterprise">Enterprise (Unlimited)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">Departments (Comma-separated)</label>
                  <input
                    type="text"
                    value={newInstDepts}
                    onChange={(e) => setNewInstDepts(e.target.value)}
                    placeholder="Computer Science, Data Science, AI, Business"
                    className="input-clean text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={newInstEmail}
                      onChange={(e) => setNewInstEmail(e.target.value)}
                      placeholder="admin@institution.edu"
                      className="input-clean text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">Phone</label>
                    <input
                      type="text"
                      value={newInstPhone}
                      onChange={(e) => setNewInstPhone(e.target.value)}
                      placeholder="+1 (555) 019-2831"
                      className="input-clean text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#E8E1D2]">
                  <button
                    type="button"
                    onClick={() => setIsOnboardModalOpen(false)}
                    className="btn-secondary text-xs py-2 px-4 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isOnboarding}
                    className="btn-primary text-xs py-2 px-5 font-bold disabled:opacity-50"
                  >
                    {isOnboarding ? 'Provisioning...' : 'Create Institution'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. EDIT INSTITUTION MODAL */}
        {isEditModalOpen && editingInst && (
          <div className="fixed inset-0 z-50 bg-[#111111]/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#E8E1D2] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold">
                    <Edit className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#111111]">Edit {editingInst.name}</h3>
                    <p className="text-xs text-[#777777]">Update parameters and seat quotas</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 text-[#777777] hover:text-[#111111] rounded-full hover:bg-[#FFF8E8]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateInstitution} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">Institution Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input-clean text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">Institution Code</label>
                    <input
                      type="text"
                      required
                      value={editCode}
                      onChange={(e) => setEditCode(e.target.value)}
                      className="input-clean text-xs font-medium uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">Domain</label>
                    <input
                      type="text"
                      value={editDomain}
                      onChange={(e) => setEditDomain(e.target.value)}
                      className="input-clean text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">Seat Quota</label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={editSeats}
                      onChange={(e) => setEditSeats(parseInt(e.target.value, 10))}
                      className="input-clean text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">License Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="input-clean text-xs font-medium bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="pending_approval">Pending Approval</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">Departments</label>
                  <input
                    type="text"
                    value={editDepts}
                    onChange={(e) => setEditDepts(e.target.value)}
                    className="input-clean text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="input-clean text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">Phone</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="input-clean text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#E8E1D2]">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="btn-secondary text-xs py-2 px-4 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="btn-primary text-xs py-2 px-5 font-bold disabled:opacity-50"
                  >
                    {isUpdating ? 'Saving...' : 'Update Institution'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. DELETE INSTITUTION MODAL */}
        {isDeleteModalOpen && deletingInst && (
          <div className="fixed inset-0 z-50 bg-[#111111]/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4 animate-fade-in">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#111111]">Delete Institution</h3>
                  <p className="text-xs text-[#777777]">This action revokes all user access</p>
                </div>
              </div>

              <p className="text-xs text-[#3F3F3F] leading-relaxed">
                Are you sure you want to delete <strong className="text-[#111111]">{deletingInst.name}</strong> ({deletingInst.code})? 
                This will suspend all associated students and administrators, blocking sign-in access.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="btn-secondary text-xs py-2 px-4 font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. ENROLL STUDENT INTO INSTITUTION MODAL */}
        {isAddStudentModalOpen && selectedInstitution && (
          <div className="fixed inset-0 z-50 bg-[#111111]/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl max-w-lg w-full shadow-2xl p-6 sm:p-7 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#E8E1D2] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#111111]">Enroll Student</h3>
                    <p className="text-xs text-[#777777]">Add student into {selectedInstitution.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="p-1 text-[#777777] hover:text-[#111111] rounded-full hover:bg-[#FFF8E8]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddStudentSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="input-clean text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={newStudentEmail}
                      onChange={(e) => setNewStudentEmail(e.target.value)}
                      placeholder="alex@stanford.edu"
                      className="input-clean text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">Temporary Password</label>
                    <input
                      type="password"
                      required
                      value={newStudentPassword}
                      onChange={(e) => setNewStudentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-clean text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">Student ID Number</label>
                    <input
                      type="text"
                      value={newStudentIdNumber}
                      onChange={(e) => setNewStudentIdNumber(e.target.value)}
                      placeholder="e.g. STU-9482"
                      className="input-clean text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">Department</label>
                    <select
                      value={newStudentDept}
                      onChange={(e) => setNewStudentDept(e.target.value)}
                      className="input-clean text-xs font-medium bg-white"
                    >
                      {selectedInstitution.departments?.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">Batch Year</label>
                  <input
                    type="text"
                    value={newStudentBatch}
                    onChange={(e) => setNewStudentBatch(e.target.value)}
                    placeholder="2024-2028"
                    className="input-clean text-xs font-medium"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#E8E1D2]">
                  <button
                    type="button"
                    onClick={() => setIsAddStudentModalOpen(false)}
                    className="btn-secondary text-xs py-2 px-4 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingStudent}
                    className="btn-primary text-xs py-2 px-5 font-bold disabled:opacity-50"
                  >
                    {isAddingStudent ? 'Enrolling...' : 'Enroll Student'}
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
