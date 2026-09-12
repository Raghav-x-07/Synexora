import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/AppLayout';
import {
  CheckSquare,
  StickyNote,
  FileText,
  Calendar as CalendarIcon,
  Bot,
  ArrowRight,
  Plus,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([
    { id: '1', title: 'Review Chapter 4 Algorithms lecture notes', completed: false, course: 'CS 301' },
    { id: '2', title: 'Submit Calculus II Problem Set', completed: true, course: 'MATH 201' },
    { id: '3', title: 'Prepare presentation slides for AI Seminar', completed: false, course: 'AI 402' },
  ]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, {user?.name || 'Student'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {user?.major || 'General Studies'} • {user?.university || 'University'}
            </p>
          </div>
          <Link to="/learning-ai" className="btn-primary self-start sm:self-auto gap-2">
            <Bot className="w-4 h-4" />
            <span>Open Learning AI</span>
          </Link>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Pending Tasks</span>
              <CheckSquare className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {tasks.filter(t => !t.completed).length}
            </p>
            <Link to="/tasks" className="text-xs text-green-600 hover:underline mt-2 inline-block font-medium">
              View all tasks →
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Total Notes</span>
              <StickyNote className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">12</p>
            <Link to="/notes" className="text-xs text-green-600 hover:underline mt-2 inline-block font-medium">
              Open notebooks →
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Documents</span>
              <FileText className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">6</p>
            <Link to="/documents" className="text-xs text-green-600 hover:underline mt-2 inline-block font-medium">
              Browse files →
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Next Event</span>
              <CalendarIcon className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm font-semibold text-slate-900 truncate">CS Midterm Exam</p>
            <p className="text-xs text-slate-500 mt-1">Tomorrow, 10:00 AM</p>
          </div>
        </div>

        {/* Quick Action Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tasks List */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Recent Tasks</h2>
              <Link to="/tasks" className="text-xs font-medium text-green-600 hover:underline flex items-center gap-1">
                <span>Manage Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center justify-between p-3 border border-slate-100 rounded-md hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="w-4 h-4 text-green-600 rounded border-slate-300 focus:ring-green-500"
                    />
                    <span className={`text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {task.title}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {task.course}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-3">Quick Navigation</h2>
              <div className="space-y-2">
                <Link
                  to="/notes"
                  className="flex items-center justify-between p-2.5 rounded-md border border-slate-200 hover:border-green-400 hover:bg-green-50/40 text-sm text-slate-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <StickyNote className="w-4 h-4 text-green-600" /> Create New Note
                  </span>
                  <Plus className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  to="/documents"
                  className="flex items-center justify-between p-2.5 rounded-md border border-slate-200 hover:border-green-400 hover:bg-green-50/40 text-sm text-slate-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-600" /> Upload Course Material
                  </span>
                  <Plus className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  to="/memory"
                  className="flex items-center justify-between p-2.5 rounded-md border border-slate-200 hover:border-green-400 hover:bg-green-50/40 text-sm text-slate-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-green-600" /> Review Flashcards
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
              Synexora Light v1.0 • All systems ready
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
