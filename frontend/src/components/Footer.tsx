import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FFF8E8] border-t border-[#E8E1D2] py-12 text-[#777777] text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Synexora"
            className="h-8 w-auto object-contain"
          />
          <span className="text-[#777777] text-xs hidden sm:inline-block border-l border-[#E8E1D2] pl-3">
            Modern AI Academic Operating System
          </span>
        </div>
        
        <div className="flex items-center gap-6 text-[#3F3F3F] font-semibold">
          <Link to="/login" className="hover:text-[#111111] transition-colors">Login</Link>
          <Link to="/register" className="hover:text-[#111111] transition-colors">Start Learning</Link>
          <Link to="/dashboard" className="hover:text-[#111111] transition-colors">Dashboard</Link>
        </div>

        <p className="text-[#777777]">© {new Date().getFullYear()} Synexora. Designed for focused, smarter learning.</p>
      </div>
    </footer>
  );
};
