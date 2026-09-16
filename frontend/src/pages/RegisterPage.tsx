import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Loader2, UserCheck, GraduationCap, Building2, Check } from 'lucide-react';
import API from '../lib/api';

export const RegisterPage: React.FC = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [regMode, setRegMode] = useState<'personal' | 'student' | 'institution'>('personal');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Institutional Student Fields
  const [institutionCode, setInstitutionCode] = useState('');
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [verifiedInstName, setVerifiedInstName] = useState<string | null>(null);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  // Institution Admin Fields
  const [institutionName, setInstitutionName] = useState('');
  const [major, setMajor] = useState('Computer Science & AI');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Verify Institution Code on blur or button click
  const handleVerifyCode = async (code: string) => {
    if (!code || !code.trim()) {
      setVerifiedInstName(null);
      return;
    }

    try {
      setIsVerifyingCode(true);
      const res = await API.post('/institutions/verify-code', { code: code.trim() });
      if (res.data.success && res.data.institution) {
        setVerifiedInstName(res.data.institution.name);
        setErrorMessage(null);
      }
    } catch (err: any) {
      setVerifiedInstName(null);
      setErrorMessage(err.response?.data?.message || 'Invalid institution code.');
    } finally {
      setIsVerifyingCode(false);
    }
  };

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

    if (regMode === 'student' && !institutionCode.trim()) {
      setErrorMessage('Please provide an Institution Code.');
      return;
    }

    if (regMode === 'institution' && !institutionName.trim()) {
      setErrorMessage('Please provide your Institution / University Name.');
      return;
    }

    let role = 'personal_student';
    if (regMode === 'student') role = 'institution_student';
    if (regMode === 'institution') role = 'institution_admin';

    setIsSubmitting(true);
    const result = await register({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      major: department || major,
      department,
      institutionCode: institutionCode.trim().toUpperCase(),
      studentIdNumber: studentIdNumber.trim(),
      institutionName: institutionName.trim(),
    });
    setIsSubmitting(false);

    if (result.success) {
      const destination = result.defaultPath || '/dashboard';
      navigate(destination, { replace: true });
    } else {
      setErrorMessage(result.message || 'Registration failed. Please check inputs.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl text-slate-900">
          <div className="w-8 h-8 rounded-md bg-green-600 flex items-center justify-center text-white">
            <BookOpen className="w-5 h-5" />
          </div>
          <span>Synexora</span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold text-slate-900">Create your account</h2>
        <p className="mt-1 text-sm text-slate-500">Choose your registration type to get started</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-slate-200 rounded-lg shadow-sm sm:px-8 space-y-5">
          {/* Role Selection Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setRegMode('personal');
                setErrorMessage(null);
              }}
              className={`py-2 px-1 rounded-lg text-center transition-all flex flex-col items-center gap-1 ${
                regMode === 'personal'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="text-[11px] truncate">Personal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRegMode('student');
                setErrorMessage(null);
              }}
              className={`py-2 px-1 rounded-lg text-center transition-all flex flex-col items-center gap-1 ${
                regMode === 'student'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="text-[11px] truncate">Campus Student</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRegMode('institution');
                setErrorMessage(null);
              }}
              className={`py-2 px-1 rounded-lg text-center transition-all flex flex-col items-center gap-1 ${
                regMode === 'institution'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="text-[11px] truncate">Institution</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <form className="space-y-4 text-xs" onSubmit={handleSubmit}>
            {/* Institution Specific Field */}
            {regMode === 'institution' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Institution / University Name
                </label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="e.g. Stanford Academy of Science & Technology"
                  required
                  className="input-clean"
                />
              </div>
            )}

            {/* Campus Student Specific Fields */}
            {regMode === 'student' && (
              <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Institution Code
                    </label>
                    <span className="text-[10px] text-slate-400">e.g. INST-DEMO</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={institutionCode}
                      onChange={(e) => {
                        setInstitutionCode(e.target.value.toUpperCase());
                        setVerifiedInstName(null);
                      }}
                      onBlur={() => handleVerifyCode(institutionCode)}
                      placeholder="INST-DEMO"
                      required
                      className="input-clean font-mono font-bold uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => handleVerifyCode(institutionCode)}
                      disabled={isVerifyingCode || !institutionCode.trim()}
                      className="btn-secondary px-3 text-xs font-semibold shrink-0"
                    >
                      {isVerifyingCode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Verify'}
                    </button>
                  </div>

                  {verifiedInstName && (
                    <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Verified: {verifiedInstName}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Student Roll / ID</label>
                    <input
                      type="text"
                      value={studentIdNumber}
                      onChange={(e) => setStudentIdNumber(e.target.value)}
                      placeholder="e.g. CS-2026-042"
                      className="input-clean"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="input-clean"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                {regMode === 'institution' ? 'Administrator Name' : 'Full Name'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
                className="input-clean"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={regMode === 'institution' ? 'admin@university.edu' : 'jane@example.com'}
                required
                className="input-clean"
              />
            </div>

            {regMode === 'personal' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Study Focus / Major
                </label>
                <input
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="e.g. Computer Science & AI"
                  className="input-clean"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="input-clean"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 disabled:opacity-50 font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>
                    {regMode === 'institution'
                      ? 'Register Institution'
                      : regMode === 'student'
                      ? 'Register Campus Student'
                      : 'Create Personal Account'}
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
