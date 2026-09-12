import React from 'react';
import { Cpu, Heart, Sparkles, Shield, Zap, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#070a11] border-t border-indigo-950/80 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1px]">
                <div className="w-full h-full bg-[#0b0f19] rounded-[11px] flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">SYNEXORA</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The Next-Generation AI-powered Student Learning & Life Intelligence Operating System. Built to elevate student performance, focus, and academic mastery.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-indigo-300">
              <span className="px-2.5 py-1 rounded-md bg-indigo-950/60 border border-indigo-500/20 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Multi-Model AI Engine
              </span>
              <span className="px-2.5 py-1 rounded-md bg-indigo-950/60 border border-indigo-500/20 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> End-to-End Encrypted
              </span>
            </div>
          </div>

          {/* Module Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> Intelligence
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#intelligence" className="hover:text-cyan-400 transition-colors">Socratic Tutor</a></li>
              <li><a href="#workload" className="hover:text-cyan-400 transition-colors">Predictive Workload</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Focus Deep Work Engine</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Flashcard Generator</a></li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/register" className="hover:text-cyan-400 transition-colors">Create Account</Link></li>
              <li><Link to="/login" className="hover:text-cyan-400 transition-colors">Student Login</Link></li>
              <li><Link to="/dashboard" className="hover:text-cyan-400 transition-colors">Academic Hub</Link></li>
              <li><span className="text-slate-600 cursor-not-allowed">API & SDK (v2.0)</span></li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">MERN Architecture</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> MongoDB / Mongoose ODM
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> Node.js & Express REST API
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> React 18 + TypeScript + Vite
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> JWT Security & bcryptjs
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Synexora Intelligence Systems Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Engineered for ambitious students with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
            <span>and AI Precision.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
