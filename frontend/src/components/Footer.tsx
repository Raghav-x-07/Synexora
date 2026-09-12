import React from 'react';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-8 text-slate-500 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-medium text-slate-700">
          <BookOpen className="w-4 h-4 text-green-600" />
          <span>Synexora Student Learning Platform</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <Link to="/login" className="hover:text-slate-800">Login</Link>
          <Link to="/register" className="hover:text-slate-800">Register</Link>
          <Link to="/dashboard" className="hover:text-slate-800">Dashboard</Link>
        </div>
        <p>© {new Date().getFullYear()} Synexora. All rights reserved.</p>
      </div>
    </footer>
  );
};
