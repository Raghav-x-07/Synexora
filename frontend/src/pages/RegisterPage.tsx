import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Loader2,
  UserCheck,
  Building2,
  ArrowRight,
  BookOpen,
  Sparkles,
  BookMarked,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [regMode, setRegMode] = useState<'personal' | 'institution'>('personal');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Institution Admin Fields
  const [institutionName, setInstitutionName] = useState('');
  const [major, setMajor] = useState('Computer Science & AI');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated && !isTransitioning) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, isTransitioning]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (regMode === 'institution' && !institutionName.trim()) {
      setErrorMessage('Please provide your Institution / University Name.');
      return;
    }

    const role = regMode === 'institution' ? 'institution_admin' : 'personal_student';

    setIsSubmitting(true);
    const result = await register({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      major: major || 'Computer Science & AI',
      department: major || 'Computer Science & AI',
      institutionName: institutionName.trim(),
    });

    if (result.success) {
      setIsTransitioning(true);
      const destination = result.defaultPath || '/dashboard';
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 750);
    } else {
      setIsSubmitting(false);
      setErrorMessage(result.message || 'Registration failed. Please check inputs.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col justify-center items-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      {/* Ambient background glow */}
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
            <span className="text-[10px] text-slate-400 font-medium">Student & Academic Registry</span>
          </div>
        </Link>
      </div>

      {/* Main Balanced Open Book Container */}
      <div className="w-full max-w-4xl lg:max-w-[920px] relative">
        {/* Silk Bookmark Ribbon */}
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
            <h3 className="text-xl font-bold tracking-tight">Account Inscribed</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-sm">
              Initializing your academic repository & personal workspace...
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
          {/* Hardcover Inner Border & Paper */}
          <div className="relative rounded-xl sm:rounded-2xl bg-[#fdfdfd] border border-slate-200/90 overflow-hidden flex flex-col md:flex-row min-h-[490px] sm:min-h-[540px]">
            
            {/* Center Spine Crease (Desktop) */}
            <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-10 book-spine-crease z-20 pointer-events-none" />

            {/* LEFT PAGE: Chapter II & Policy Notice */}
            <div className="w-full md:w-1/2 p-6 sm:p-7 lg:p-8 bg-gradient-to-br from-[#fafbfc] to-[#f4f6f8] book-page-left flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200/80 relative">
              <div>
                {/* Page Number & Seal */}
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 border-b border-slate-200/80 pb-2.5 mb-4">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider text-slate-700 font-mono">
                    <BookMarked className="w-3.5 h-3.5 text-emerald-600" />
                    Chapter II: Enrollment Registry
                  </span>
                  <span className="font-mono text-slate-400 text-[10px]">Folio 01</span>
                </div>

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
                      Enrollment Track
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Self-register as a Personal Learner or establish a new Institution.
                    </p>
                  </div>
                </div>

                {/* Role Selection Tabs (Only Personal & Institution) */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Choose Registration Mode
                  </span>
                  <div className="grid grid-cols-2 gap-2 bg-white border border-slate-200/90 p-1.5 rounded-xl text-xs font-semibold shadow-apple-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setRegMode('personal');
                        setErrorMessage(null);
                      }}
                      className={`py-2.5 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-2 ${
                        regMode === 'personal'
                          ? 'bg-slate-900 text-white shadow-apple-sm font-bold'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span className="text-xs">Personal Learner</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRegMode('institution');
                        setErrorMessage(null);
                      }}
                      className={`py-2.5 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-2 ${
                        regMode === 'institution'
                          ? 'bg-slate-900 text-white shadow-apple-sm font-bold'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span className="text-xs">Institution Admin</span>
                    </button>
                  </div>
                </div>

                {/* Notice for Campus Students: Provisioned by Institute Only */}
                <div className="mt-4 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-blue-800 text-[11px]">
                    <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Enrolled Campus Student?</span>
                  </div>
                  <p className="text-[10.5px] text-blue-700 leading-relaxed">
                    Student accounts are registered & provisioned directly by your Institution Administrator. You do not need to sign up here.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 hover:underline pt-0.5"
                  >
                    <span>Sign in with your campus credentials</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Bottom Footer on Left Page */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span className="italic font-medium">"Begin your chapter today."</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">§ 104.3</span>
              </div>
            </div>

            {/* RIGHT PAGE: Registration Form Box */}
            <div className="w-full md:w-1/2 p-6 sm:p-7 lg:p-8 bg-white book-page-right flex flex-col justify-between relative">
              <div>
                {/* Page Number & Header */}
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 border-b border-slate-100 pb-2.5 mb-3.5">
                  <span className="text-slate-700 font-mono uppercase tracking-wider">Candidate Registry</span>
                  <span className="font-mono text-slate-400 text-[10px]">Folio 02</span>
                </div>

                {errorMessage && (
                  <div className="mb-3.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-medium animate-fade-in">
                    {errorMessage}
                  </div>
                )}

                <form className="space-y-3.5" onSubmit={handleSubmit}>
                  {/* Institution Specific Field */}
                  {regMode === 'institution' && (
                    <div className="animate-fade-in">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Institution / University Name
                      </label>
                      <input
                        type="text"
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                        placeholder="e.g. Stanford Academy of Science"
                        required
                        className="input-clean bg-[#fafbfc] py-2 px-3 text-sm"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {regMode === 'institution' ? 'Administrator Full Name' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      required
                      className="input-clean bg-[#fafbfc] py-2 px-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={regMode === 'institution' ? 'dean@university.edu' : 'jane@example.com'}
                      required
                      className="input-clean bg-[#fafbfc] py-2 px-3 text-sm"
                    />
                  </div>

                  {regMode === 'personal' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Primary Study Focus
                      </label>
                      <input
                        type="text"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        placeholder="Computer Science & AI"
                        className="input-clean bg-[#fafbfc] py-2 px-3 text-sm"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
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
                          <span>Inscribing Credentials...</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {regMode === 'institution'
                              ? 'Register Campus Institution'
                              : 'Create Personal Account'}
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Bottom Footer on Right Page */}
              <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-3 mt-4">
                Already registered in the directory?{' '}
                <Link to="/login" className="text-emerald-700 font-bold hover:underline">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
