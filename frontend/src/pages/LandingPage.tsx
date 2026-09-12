import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import {
  Bot,
  FileText,
  StickyNote,
  CheckSquare,
  Calendar,
  Brain,
  Award,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

const coreModules = [
  {
    title: 'Learning AI',
    description: 'Interactive conversational tutor to break down complex topics and answer questions.',
    icon: Bot,
  },
  {
    title: 'Documents',
    description: 'Centralized repository to organize textbooks, syllabus files, and course materials.',
    icon: FileText,
  },
  {
    title: 'Notes',
    description: 'Clean markdown-ready note taking with organization by course and topic tags.',
    icon: StickyNote,
  },
  {
    title: 'Tasks',
    description: 'Prioritized task and homework tracker to manage daily deliverables and deadlines.',
    icon: CheckSquare,
  },
  {
    title: 'Calendar & Schedule',
    description: 'Timeline view for exams, project submission deadlines, and scheduled study sessions.',
    icon: Calendar,
  },
  {
    title: 'Knowledge Memory',
    description: 'Active-recall concept storage to reinforce key definitions and formulas over time.',
    icon: Brain,
  },
  {
    title: 'Assessments',
    description: 'Diagnostic quizzes and performance tracker to identify topic weak points.',
    icon: Award,
  },
  {
    title: 'Study Progress',
    description: 'Clear study time logs and completion metrics without vanity vanity charts.',
    icon: BarChart3,
  },
];

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 md:py-28 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold mb-6">
          <span>Student Learning & Productivity Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          A focused workspace for student learning and life.
        </h1>

        <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Manage your notes, documents, tasks, and study schedule in one clean, reliable application with integrated AI assistance.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/register"
            className="w-full sm:w-auto px-6 py-3 rounded-md bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3 rounded-md bg-white border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors text-center"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Core Modules Grid */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-slate-900">Platform Modules</h2>
            <p className="text-sm text-slate-600 mt-1">
              Everything you need to organize your coursework and track daily study progress.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {coreModules.map((mod, index) => {
              const Icon = mod.icon;
              return (
                <div
                  key={index}
                  className="bg-white border border-slate-200 rounded-lg p-5 hover:border-green-300 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="w-9 h-9 rounded-md bg-green-50 text-green-700 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-base text-slate-900 mb-1">{mod.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{mod.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
