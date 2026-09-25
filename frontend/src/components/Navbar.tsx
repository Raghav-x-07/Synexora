import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="glass-panel sticky top-0 z-40 transition-all duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-apple-sm transition-transform duration-200 group-hover:scale-105">
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                Synexora
              </span>
              <span className="text-[10px] text-slate-400 font-medium -mt-1 hidden sm:block">
                Learning Workspace
              </span>
            </div>
          </Link>

          {/* Nav Links / Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-medium hidden md:inline-block">
                  Signed in as <span className="font-semibold text-slate-700">{user?.name}</span>
                </span>
                <Link
                  to="/dashboard"
                  className="btn-primary flex items-center gap-1.5"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-70" />
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-lg transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
