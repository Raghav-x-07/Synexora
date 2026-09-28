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
  Timer,
  GraduationCap,
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

  // Build role-tailored nav items
  const navItems = [];

  if (isSuperAdmin) {
    // Super Admin: Dashboard, Manage Institutions, Notes, Calendar, Profile, Settings
    navItems.push(
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Manage Institutions', path: '/admin', icon: Building2 },
      { name: 'Notes', path: '/notes', icon: StickyNote },
      { name: 'Calendar', path: '/calendar', icon: Calendar },
      { name: 'Profile', path: '/profile', icon: User },
      { name: 'Settings', path: '/settings', icon: Settings }
    );
  } else if (isInstitutionAdmin) {
    // Campus Administrator: Campus Portal, Dashboard, Classroom, Students Progress, Calendar, Notes, Profile, Settings
    navItems.push(
      { name: 'Campus Portal', path: '/institution-portal', icon: Building2 },
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Classroom', path: '/classroom', icon: GraduationCap },
      { name: 'Students Progress', path: '/progress', icon: BarChart3 },
      { name: 'Calendar', path: '/calendar', icon: Calendar },
      { name: 'Notes', path: '/notes', icon: StickyNote },
      { name: 'Profile', path: '/profile', icon: User },
      { name: 'Settings', path: '/settings', icon: Settings }
    );
  } else if (isInstitutionTeacher) {
    // Faculty Educator: Campus Portal, Dashboard, Classroom, Learning AI, AI Video, Documents, Evaluation, Students Progress, Calendar, Notes, Profile, Settings
    navItems.push(
      { name: 'Campus Portal', path: '/institution-portal', icon: Building2 },
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Classroom', path: '/classroom', icon: GraduationCap },
      { name: 'Learning AI', path: '/learning-ai', icon: Bot },
      { name: 'AI Video', path: '/concept-video', icon: Film },
      { name: 'Documents', path: '/documents', icon: FileText },
      { name: 'Evaluation', path: '/evaluation', icon: Award },
      { name: 'Students Progress', path: '/progress', icon: BarChart3 },
      { name: 'Calendar', path: '/calendar', icon: Calendar },
      { name: 'Notes', path: '/notes', icon: StickyNote },
      { name: 'Profile', path: '/profile', icon: User },
      { name: 'Settings', path: '/settings', icon: Settings }
    );
  } else {
    // Students (Campus & Personal Learners): Full suite of study & classroom tools
    navItems.push({ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard });

    if (isInstitutionStudent) {
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
  }

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col md:flex-row antialiased selection:bg-[#F4C542] selection:text-[#111111]">
      {/* Mobile Top Nav */}
      <div className="md:hidden glass-panel px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-apple-sm border-b border-[#E8E1D2] bg-[#FFFDF7]/95">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Synexora"
            className="h-7 w-auto object-contain"
          />
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-[#3F3F3F] hover:bg-[#FFF8E8] transition-colors"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-5 h-5 text-[#111111]" /> : <Menu className="w-5 h-5 text-[#111111]" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-[#FFFFFF] border-r border-[#E8E1D2] flex-shrink-0 flex flex-col justify-between md:min-h-screen sticky top-0 z-20 shadow-apple-sm md:shadow-none`}
      >
        <div>
          {/* Logo Header */}
          <div className="hidden md:flex flex-col gap-1.5 px-5 py-4 border-b border-[#E8E1D2]/80">
            <Link to="/dashboard" className="flex items-center">
              <img
                src="/logo.png"
                alt="Synexora - Learn Plan Reflect Grow"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#777777] bg-[#FFF8E8] px-2 py-0.5 rounded-full border border-[#E8E1D2]">
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
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#111111] text-[#FFFFFF] shadow-sm'
                      : 'text-[#3F3F3F] hover:bg-[#FFF8E8] hover:text-[#111111]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F4C542]' : 'text-[#777777]'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & Logout footer */}
        <div className="p-3 border-t border-[#E8E1D2] bg-[#FFF8E8]/40">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FFFDF7] border border-[#E8E1D2] shadow-sm">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-[#111111] text-[#F4C542] font-bold flex items-center justify-center text-xs shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-[#111111] truncate leading-tight">
                  {user?.name || 'User'}
                </p>
                <span className="text-[10px] text-[#777777] font-medium block truncate capitalize">
                  {user?.role?.replace('_', ' ') || 'Personal Learner'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-full text-[#777777] hover:text-[#EF4444] hover:bg-rose-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-[#FFFDF7] min-h-screen">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};
