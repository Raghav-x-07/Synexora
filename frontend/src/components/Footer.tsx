import React from 'react';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 py-10 text-slate-500 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="font-semibold text-slate-800 text-sm">Synexora</span>
          <span className="text-slate-400 text-xs">• Focused Academic Workspace</span>
        </div>
        
        <div className="flex items-center gap-6 text-slate-500 font-medium">
          <Link to="/login" className="hover:text-slate-900 transition-colors">Login</Link>
          <Link to="/register" className="hover:text-slate-900 transition-colors">Register</Link>
          <Link to="/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</Link>
        </div>

        <p className="text-slate-400">© {new Date().getFullYear()} Synexora. All rights reserved.</p>
      </div>
    </footer>
  );
};
