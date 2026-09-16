import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Loader2, ShieldCheck, Building2, UserCheck, GraduationCap } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'super_admin' || user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'institution_admin') {
        navigate('/institution-portal', { replace: true });
      } else {
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      const destination = result.defaultPath || (location.state as any)?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } else {
      setErrorMessage(result.message || 'Invalid email or password.');
    }
  };

  const handleQuickFill = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setErrorMessage(null);
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
        <h2 className="mt-4 text-2xl font-bold text-slate-900">Sign in to your account</h2>
        <p className="mt-1 text-sm text-slate-500">Access your academic and institutional portal</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-slate-200 rounded-lg shadow-sm sm:px-8 space-y-5">
          {/* Quick Role Fill Chips */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              Quick Role Switcher
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@synexora.com', 'admin123')}
                className="p-2 rounded border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 flex items-center gap-1.5 transition-colors text-left"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Super Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin@synexora.edu', 'admin123')}
                className="p-2 rounded border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-slate-700 flex items-center gap-1.5 transition-colors text-left"
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">Institution Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('student@synexora.edu', 'student123')}
                className="p-2 rounded border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 flex items-center gap-1.5 transition-colors text-left"
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">Campus Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('learner@example.com', 'student123')}
                className="p-2 rounded border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 flex items-center gap-1.5 transition-colors text-left"
              >
                <UserCheck className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span className="truncate">Personal Learner</span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="input-clean"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </div>
          </form>

          <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-600 font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
