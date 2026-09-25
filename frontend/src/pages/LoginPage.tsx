import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Loader2,
  ShieldCheck,
  Building2,
  UserCheck,
  GraduationCap,
  ArrowRight,
  BookOpen,
  Sparkles,
  BookMarked,
  CheckCircle2,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated && user && !isTransitioning) {
      if (user.role === 'super_admin' || user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'institution_admin') {
        navigate('/institution-portal', { replace: true });
      } else {
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location, isTransitioning]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);

    if (result.success) {
      setIsTransitioning(true);
      const destination = result.defaultPath || (location.state as any)?.from?.pathname || '/dashboard';
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 750);
    } else {
      setIsSubmitting(false);
      setErrorMessage(result.message || 'Invalid email or password.');
    }
  };

  const handleQuickFill = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col justify-center items-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      {/* Ambient background illumination */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-emerald-100/45 via-teal-50/35 to-indigo-100/45 blur-3xl -z-10 pointer-events-none rounded-full animate-pulse-glow" />

      {/* Top Header */}
      <div className="mb-5 text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-apple transition-transform duration-200 group-hover:scale-105">
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors block leading-none">
              Synexora
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Academic Workspace & Study Registry</span>
          </div>
        </Link>
      </div>

      {/* Main Balanced Open Book Container */}
      <div className="w-full max-w-4xl lg:max-w-[920px] relative">
        {/* Silk Bookmark Ribbon Hanging from Top */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
          <div className="w-5 h-8 bg-emerald-600 rounded-t-xs shadow-md flex items-end justify-center pb-1">
            <div className="w-2.5 h-2.5 bg-emerald-700 rotate-45 transform translate-y-1.5" />
          </div>
        </div>

        {/* Transition Overlay */}
        {isTransitioning && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-md rounded-2xl sm:rounded-3xl animate-fade-in text-white text-center p-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-3 animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Access Granted</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-sm">
              Synchronizing knowledge vault & opening your Synexora dashboard...
            </p>
            <div className="w-40 h-1 bg-slate-800 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full w-full animate-pulse" />
            </div>
          </div>
        )}

        {/* 3D Book Shell */}
        <div
          className={`relative rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 bg-slate-900 border-2 border-slate-800 shadow-book-large transition-all duration-700 ease-out ${
            isTransitioning ? 'animate-book-transition-exit' : 'animate-book-unfold'
          }`}
          style={{ perspective: '1400px' }}
        >
          {/* Hardcover Inner Folio Paper */}
          <div className="relative rounded-xl sm:rounded-2xl bg-[#fdfdfd] border border-slate-200/90 overflow-hidden flex flex-col md:flex-row min-h-[480px] sm:min-h-[530px]">
            
            {/* Center Spine Crease (Desktop) */}
            <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-10 book-spine-crease z-20 pointer-events-none" />

            {/* LEFT PAGE: Portal Info, Chapter Index, Quick Role Switcher */}
            <div className="w-full md:w-1/2 p-6 sm:p-7 lg:p-8 bg-gradient-to-br from-[#fafbfc] to-[#f4f6f8] book-page-left flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200/80 relative">
              <div>
                {/* Page Number & Seal */}
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 border-b border-slate-200/80 pb-2.5 mb-4">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider text-slate-700 font-mono">
                    <BookMarked className="w-3.5 h-3.5 text-emerald-600" />
                    Chapter I: Authentication
                  </span>
                  <span className="font-mono text-slate-400 text-[10px]">Folio 01</span>
                </div>

                {/* Left Page Title & Book Illustration */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200/80 shadow-apple-sm shrink-0 bg-white p-1">
                    <img
                      src="/synexora-book.jpg"
                      alt="Academic Volume"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                      Learning Portal
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Select your institutional or personal role to unlock your active workspace.
                    </p>
                  </div>
                </div>

                {/* Quick Role Fill Chips */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Quick Role Directory
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => handleQuickFill('admin@synexora.com', 'admin123')}
                      className="p-2 rounded-xl border border-slate-200/90 bg-white hover:border-slate-900 hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-all text-left shadow-apple-sm group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-900 group-hover:text-white shrink-0" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="font-bold text-slate-900 block text-[11px] truncate">Super Admin</span>
                        <span className="text-[9px] text-slate-400 font-normal block truncate">Platform Master</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickFill('admin@synexora.edu', 'admin123')}
                      className="p-2 rounded-xl border border-slate-200/90 bg-white hover:border-indigo-600 hover:bg-indigo-50/50 text-slate-700 flex items-center gap-2 transition-all text-left shadow-apple-sm group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600 group-hover:text-white shrink-0" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="font-bold text-slate-900 block text-[11px] truncate">Campus Admin</span>
                        <span className="text-[9px] text-slate-400 font-normal block truncate">Institutional Lead</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickFill('teacher@synexora.edu', 'teacher123')}
                      className="p-2 rounded-xl border border-slate-200/90 bg-white hover:border-amber-600 hover:bg-amber-50/50 text-slate-700 flex items-center gap-2 transition-all text-left shadow-apple-sm group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-600 group-hover:text-white shrink-0" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="font-bold text-slate-900 block text-[11px] truncate">Institute Teacher</span>
                        <span className="text-[9px] text-slate-400 font-normal block truncate">Faculty Educator</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickFill('student@synexora.edu', 'student123')}
                      className="p-2 rounded-xl border border-slate-200/90 bg-white hover:border-blue-600 hover:bg-blue-50/50 text-slate-700 flex items-center gap-2 transition-all text-left shadow-apple-sm group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600 group-hover:text-white shrink-0" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="font-bold text-slate-900 block text-[11px] truncate">Institute Student</span>
                        <span className="text-[9px] text-slate-400 font-normal block truncate">Enrolled Courses</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickFill('learner@example.com', 'student123')}
                      className="col-span-2 p-2 rounded-xl border border-slate-200/90 bg-white hover:border-emerald-600 hover:bg-emerald-50/50 text-slate-700 flex items-center justify-center gap-2 transition-all text-center shadow-apple-sm group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white shrink-0" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-[11px]">Personal Learner</span>
                        <span className="text-[9px] text-slate-400 font-normal ml-1.5">• Self-Paced Track</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Quote on Left Page */}
              <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span className="italic font-medium">"Knowledge structured is retained."</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">§ 104.2</span>
              </div>
            </div>

            {/* RIGHT PAGE: Sign In Form Box */}
            <div className="w-full md:w-1/2 p-6 sm:p-7 lg:p-8 bg-white book-page-right flex flex-col justify-between relative">
              <div>
                {/* Page Number & Right Header */}
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 border-b border-slate-100 pb-2.5 mb-4">
                  <span className="text-slate-700 font-mono uppercase tracking-wider">Access Authorization</span>
                  <span className="font-mono text-slate-400 text-[10px]">Folio 02</span>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    Sign In to Synexora
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Enter your credentials to unlock your active study journal.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-3.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-medium animate-fade-in">
                    {errorMessage}
                  </div>
                )}

                {/* The Form Fields */}
                <form className="space-y-3.5" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@synexora.edu"
                      required
                      className="input-clean bg-[#fafbfc] py-2 px-3 text-sm"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Password
                      </label>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="input-clean bg-[#fafbfc] py-2 px-3 text-sm"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || isTransitioning}
                      className="w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50 font-bold shadow-apple rounded-xl group"
                    >
                      {isSubmitting || isTransitioning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Unlocking Journal...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In to Journal</span>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Bottom Footer on Right Page */}
              <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-3.5 mt-5">
                Don't have an account in the registry?{' '}
                <Link to="/register" className="text-emerald-700 font-bold hover:underline">
                  Enroll / Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
