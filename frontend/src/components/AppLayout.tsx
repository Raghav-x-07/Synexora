import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Bot,
  FileText,
  StickyNote,
  CheckSquare,
  Calendar,
  Brain,
  Award,
  BarChart3,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  BookOpen,
  Timer,
  GraduationCap,
  ShieldCheck,
  Building2,
  Film,
} from 'lucide-react';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isSuperAdmin, isInstitutionAdmin, isInstitutionTeacher, isInstitutionStudent } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Build role-tailored nav items while keeping identical UI
  const navItems = [];

  if (isSuperAdmin) {
    navItems.push({ name: 'Super Admin', path: '/admin', icon: ShieldCheck });
  }

  if (isInstitutionAdmin) {
    navItems.push({ name: 'Campus Portal', path: '/institution-portal', icon: Building2 });
  }

  navItems.push({ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard });

  // Classroom is available for Institution Admins, Teachers, Campus Students, and Super Admin
  if (isInstitutionAdmin || isInstitutionTeacher || isInstitutionStudent || isSuperAdmin) {
    navItems.push({ name: 'Classroom', path: '/classroom', icon: GraduationCap });
  }

  navItems.push(
    { name: 'Learning AI', path: '/learning-ai', icon: Bot },
    { name: 'AI Video', path: '/concept-video', icon: Film },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'Notes', path: '/notes', icon: StickyNote },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Memory', path: '/memory', icon: Brain },
    { name: 'Timer & Alarm', path: '/timer', icon: Timer },
    { name: 'Evaluation', path: '/evaluation', icon: Award },
    { name: 'Progress', path: '/progress', icon: BarChart3 },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings }
  );

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col md:flex-row antialiased selection:bg-emerald-500 selection:text-white">
      {/* Mobile Top Nav */}
      <div className="md:hidden glass-panel px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-apple-sm">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-slate-900">
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-sm font-bold tracking-tight">Synexora</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-white border-r border-slate-200/80 flex-shrink-0 flex flex-col justify-between md:min-h-screen sticky top-0 z-20 shadow-apple-sm md:shadow-none`}
      >
        <div>
          {/* Logo Header */}
          <div className="hidden md:flex items-center gap-3 px-6 py-5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-apple-sm">
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 block leading-tight tracking-tight">
                Synexora
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {isSuperAdmin
                  ? 'Master Platform'
                  : isInstitutionAdmin
                  ? 'Campus Admin'
                  : isInstitutionTeacher
                  ? 'Faculty Educator'
                  : 'Student Workspace'}
              </span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1 max-h-[calc(100vh-140px)] overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-apple-sm'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & Logout footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70 shadow-apple-sm">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 truncate leading-tight">
                  {user?.name || 'User'}
                </p>
                <span className="text-[10px] text-slate-400 font-medium block truncate capitalize">
                  {user?.role?.replace('_', ' ') || 'Personal Learner'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-[#fafbfc] min-h-screen">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};
