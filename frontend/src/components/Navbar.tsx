import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="glass-panel sticky top-0 z-40 transition-all duration-200 border-b border-[#E8E1D2] bg-[#FFFDF7]/90">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group py-1">
            <img
              src="/logo.png"
              alt="Synexora - Learn Plan Reflect Grow"
              className="h-9 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#3F3F3F]">
            <a href="#hero" className="hover:text-[#111111] transition-colors">Home</a>
            <a href="#skills" className="hover:text-[#111111] transition-colors">Skills</a>
            <a href="#features" className="hover:text-[#111111] transition-colors">Features</a>
            <a href="#modules" className="hover:text-[#111111] transition-colors">Modules</a>
            <a href="#faq" className="hover:text-[#111111] transition-colors">FAQ</a>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#777777] font-medium hidden lg:inline-block">
                  Signed in as <span className="font-semibold text-[#111111]">{user?.name}</span>
                </span>
                <Link
                  to="/dashboard"
                  className="btn-primary text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-[#3F3F3F] hover:text-[#111111] hover:bg-[#FFF8E8] rounded-full transition-all border border-transparent hover:border-[#E8E1D2]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <span>Start Learning</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
