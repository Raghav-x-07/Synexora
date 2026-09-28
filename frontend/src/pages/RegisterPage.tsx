import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Sparkles,
  Building2,
  GraduationCap,
  UserCheck,
  ArrowRight,
  Loader2,
  CheckCircle2,
  BookMarked,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [regMode, setRegMode] = useState<'personal' | 'institution'>('personal');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Institution Admin Fields
  const [institutionName, setInstitutionName] = useState('');
  const [major, setMajor] = useState('Computer Science & AI');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
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
    <div className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#FFFDF7] px-4 py-8 antialiased selection:bg-[#F4C542] selection:text-[#111111] relative">
      {/* Ambient Radial Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 40%, rgba(244, 197, 66, 0.16), transparent 70%)',
        }}
      />

      {/* Top Synexora Header */}
      <div className="mb-4 text-center z-10">
        <Link to="/" className="inline-flex flex-col items-center group">
          <img
            src="/logo.png"
            alt="Synexora - Learn Plan Reflect Grow"
            className="h-14 sm:h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </Link>
      </div>

      {/* 3D Book Container */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-5xl" style={{ perspective: '1600px' }}>
        {/* Silk Bookmark Ribbon */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none">
          <div className="w-5 h-7 bg-[#F4C542] rounded-t-xs shadow-md flex items-end justify-center pb-1">
            <div className="w-2.5 h-2.5 bg-[#d8a825] rotate-45 transform translate-y-1.5" />
          </div>
        </div>

        {/* Transition Overlay */}
        {isTransitioning && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#111111]/85 backdrop-blur-md rounded-2xl sm:rounded-3xl animate-fade-in text-white text-center p-6">
            <div className="w-12 h-12 rounded-full bg-[#F4C542]/20 border border-[#F4C542]/40 flex items-center justify-center text-[#F4C542] mb-3 animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Account Inscribed</h3>
            <p className="text-xs text-[#E8E1D2] mt-1 max-w-sm">
              Initializing your academic repository & personal workspace...
            </p>
            <div className="w-40 h-1.5 bg-[#222222] rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-[#F4C542] rounded-full w-full animate-pulse" />
            </div>
          </div>
        )}

        {/* Book Body */}
        <div
          className="relative mx-auto transition-all duration-700 ease-out"
          style={{
            width: open ? 'min(94vw, 860px)' : 'min(84vw, 360px)',
            height: open ? 'min(86vh, 620px)' : 'min(68vh, 490px)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Inside Pages (Revealed when open) */}
          <div
            className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-r-3xl rounded-l-md border border-[#E8E1D2] bg-white shadow-2xl transition-opacity duration-500"
            style={{ opacity: open ? 1 : 0 }}
          >
            {/* LEFT PAGE: Mode Selection & Campus Notice */}
            <div className="flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E8E1D2]/80 bg-[#FFFDF7] p-6 sm:p-7 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#777777] border-b border-[#E8E1D2] pb-2 mb-3">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider text-[#111111] font-mono text-[10px]">
                    <BookMarked className="w-3.5 h-3.5 text-[#F4C542]" />
                    Chapter II: Enrollment Registry
                  </span>
                  <span className="font-mono text-[#777777] text-[10px]">Folio 01</span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold shadow-xs shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#111111] tracking-tight">
                      Enrollment Track
                    </h2>
                    <p className="text-[11px] text-[#777777] leading-snug">
                      Self-register as a Personal Learner or establish a new Institution.
                    </p>
                  </div>
                </div>

                {/* Mode Selector Tabs */}
                <div className="space-y-1.5 mb-3">
                  <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider block">
                    Choose Registration Mode
                  </span>
                  <div className="grid grid-cols-2 gap-2 bg-[#FFF8E8] border border-[#E8E1D2] p-1.5 rounded-2xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setRegMode('personal');
                        setErrorMessage(null);
                      }}
                      className={`py-2 px-2 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 text-xs ${
                        regMode === 'personal'
                          ? 'bg-[#111111] text-white shadow-xs font-bold'
                          : 'text-[#777777] hover:text-[#111111]'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#F4C542]" />
                      <span>Personal Learner</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRegMode('institution');
                        setErrorMessage(null);
                      }}
                      className={`py-2 px-2 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 text-xs ${
                        regMode === 'institution'
                          ? 'bg-[#111111] text-white shadow-xs font-bold'
                          : 'text-[#777777] hover:text-[#111111]'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#F4C542]" />
                      <span>Institution Admin</span>
                    </button>
                  </div>
                </div>

                {/* Campus Student Notice Box */}
                <div className="p-3.5 rounded-2xl bg-[#FFF8E8] border border-[#E8E1D2] text-xs text-[#111111] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#111111] text-[11px]">
                    <GraduationCap className="w-4 h-4 text-[#111111] shrink-0" />
                    <span>Enrolled Campus Student?</span>
                  </div>
                  <p className="text-[10.5px] text-[#777777] leading-relaxed">
                    Student accounts are provisioned directly by your Institution Administrator. You do not need to sign up here.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#111111] hover:underline pt-0.5"
                  >
                    <span>Sign in with your campus credentials</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Bottom Quote on Left Page */}
              <div className="mt-3 pt-2 border-t border-[#E8E1D2] flex items-center justify-between text-[11px] text-[#777777]">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F4C542]" />
                  <span className="italic font-medium">"Begin your chapter today."</span>
                </div>
                <span className="text-[10px] font-mono text-[#777777]">§ 104.3</span>
              </div>
            </div>

            {/* RIGHT PAGE: Registration Form */}
            <div className="flex flex-col justify-between p-6 sm:p-7 bg-white overflow-y-auto">
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#777777] border-b border-[#E8E1D2] pb-2 mb-3">
                  <span className="text-[#111111] font-mono uppercase tracking-wider text-[10px]">Candidate Registry</span>
                  <span className="font-mono text-[#777777] text-[10px]">Folio 02</span>
                </div>

                <div className="mb-3">
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#111111] tracking-tight">
                    {regMode === 'institution' ? 'Register Campus Institution' : 'Create Personal Account'}
                  </h3>
                  <p className="text-[11px] text-[#777777] mt-0.5">
                    Fill out your credentials to initialize your academic workspace.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-3 p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-fade-in">
                    {errorMessage}
                  </div>
                )}

                <form className="space-y-2.5" onSubmit={handleSubmit}>
                  {/* Institution Field */}
                  {regMode === 'institution' && (
                    <div>
                      <label className="block text-xs font-bold text-[#111111] mb-1">
                        Institution / University Name
                      </label>
                      <div className="flex items-center gap-2 rounded-2xl border border-[#E8E1D2] bg-[#FFFDF7] px-3">
                        <Building2 className="h-4 w-4 text-[#777777]" />
                        <input
                          type="text"
                          required
                          value={institutionName}
                          onChange={(e) => setInstitutionName(e.target.value)}
                          placeholder="e.g. Stanford Academy of Science"
                          className="h-9 w-full bg-transparent text-xs sm:text-sm text-[#111111] outline-none placeholder:text-[#777777]/60"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">
                      {regMode === 'institution' ? 'Administrator Full Name' : 'Full Name'}
                    </label>
                    <div className="flex items-center gap-2 rounded-2xl border border-[#E8E1D2] bg-[#FFFDF7] px-3">
                      <User className="h-4 w-4 text-[#777777]" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Doe"
                        className="h-9 w-full bg-transparent text-xs sm:text-sm text-[#111111] outline-none placeholder:text-[#777777]/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">
                      Email Address
                    </label>
                    <div className="flex items-center gap-2 rounded-2xl border border-[#E8E1D2] bg-[#FFFDF7] px-3">
                      <Mail className="h-4 w-4 text-[#777777]" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={regMode === 'institution' ? 'dean@university.edu' : 'jane@example.com'}
                        className="h-9 w-full bg-transparent text-xs sm:text-sm text-[#111111] outline-none placeholder:text-[#777777]/60"
                      />
                    </div>
                  </div>

                  {regMode === 'personal' && (
                    <div>
                      <label className="block text-xs font-bold text-[#111111] mb-1">
                        Primary Study Focus
                      </label>
                      <div className="flex items-center gap-2 rounded-2xl border border-[#E8E1D2] bg-[#FFFDF7] px-3">
                        <GraduationCap className="h-4 w-4 text-[#777777]" />
                        <input
                          type="text"
                          value={major}
                          onChange={(e) => setMajor(e.target.value)}
                          placeholder="Computer Science & AI"
                          className="h-9 w-full bg-transparent text-xs sm:text-sm text-[#111111] outline-none placeholder:text-[#777777]/60"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">
                      Password (min 6 chars)
                    </label>
                    <div className="flex items-center gap-2 rounded-2xl border border-[#E8E1D2] bg-[#FFFDF7] px-3 focus-within:border-[#111111] transition-colors">
                      <Lock className="h-4 w-4 text-[#777777] shrink-0" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-9 w-full bg-transparent text-xs sm:text-sm text-[#111111] outline-none placeholder:text-[#777777]/60"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-[#777777] hover:text-[#111111] transition-colors focus:outline-none"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || isTransitioning}
                    className="btn-primary h-10 w-full rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm mt-2"
                  >
                    {isSubmitting || isTransitioning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
                        <span>Inscribing Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {regMode === 'institution'
                            ? 'Register Campus Institution'
                            : 'Create Personal Account'}
                        </span>
                        <ArrowRight className="w-4 h-4 text-[#111111]" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Bottom Footer on Right Page */}
              <div className="text-center text-xs text-[#777777] border-t border-[#E8E1D2] pt-3 mt-3">
                Already registered in the directory?{' '}
                <Link to="/login" className="font-extrabold text-[#111111] underline-offset-2 hover:underline">
                  Sign in
                </Link>
              </div>
            </div>
          </div>

          {/* Spine */}
          <div
            className="absolute left-0 top-0 h-full w-4 rounded-l-md bg-[#111111] border-r border-[#F4C542]/30 shadow-md"
            style={{ transform: 'translateZ(1px)' }}
          />

          {/* Front Cover (Rotates open via CSS 3D transform) */}
          <div
            className="absolute inset-0 origin-left rounded-r-3xl rounded-l-md border-2 border-[#111111] bg-[#111111] shadow-2xl transition-transform duration-1000 ease-in-out cursor-pointer"
            style={{
              transformStyle: 'preserve-3d',
              transform: open ? 'rotateY(-160deg)' : 'rotateY(0deg)',
              pointerEvents: open ? 'none' : 'auto',
            }}
            onClick={() => !open && setOpen(true)}
          >
            {/* Front Cover Face */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-r-3xl rounded-l-md p-8 bg-gradient-to-br from-[#181818] to-[#0a0a0a] text-white border border-[#F4C542]/20 shadow-inner"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* Gold Emblem */}
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#F4C542] bg-[#111111] shadow-lg">
                <BookOpen className="h-10 w-10 text-[#F4C542]" />
              </div>

              <div className="text-center">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#F4C542] block mb-1">
                  Academic Registry II
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                  Synexora
                </h1>
                <p className="mt-2 text-xs text-[#E8E1D2]/80 max-w-xs leading-relaxed">
                  Inscribe your learner profile or register your campus institution
                </p>
              </div>

              {/* Decorative Divider */}
              <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-[#F4C542] to-transparent my-1" />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(true);
                }}
                className="btn-primary rounded-full px-8 py-2.5 text-xs font-extrabold text-[#111111] shadow-md hover:scale-105 transition-transform"
              >
                Open Book to Enroll
              </button>
            </div>

            {/* Back Face of Front Cover */}
            <div
              className="absolute inset-0 rounded-l-3xl rounded-r-md bg-[#181818] border border-[#2a2a2a]"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Book Close/Open Toggle Button */}
      {open ? (
        <button
          onClick={() => setOpen(false)}
          className="mt-6 text-xs font-bold text-[#777777] hover:text-[#111111] underline-offset-4 hover:underline transition-colors z-10"
        >
          Close the book
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="mt-6 text-xs font-bold text-[#111111] hover:underline underline-offset-4 transition-colors z-10"
        >
          Open the book
        </button>
      )}
    </div>
  );
};
