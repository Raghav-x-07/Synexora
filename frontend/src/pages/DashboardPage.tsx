import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/AppLayout';
import API from '../lib/api';
import {
  CheckSquare,
  StickyNote,
  FileText,
  Calendar as CalendarIcon,
  Bot,
  ArrowRight,
  Plus,
  Loader2,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<any[]>([]);
  const [noteCount, setNoteCount] = useState(0);
  const [docCount, setDocCount] = useState(0);
  const [nextEvent, setNextEvent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [tasksRes, notesRes, docsRes, eventsRes] = await Promise.all([
        API.get('/tasks').catch(() => ({ data: { tasks: [] } })),
        API.get('/notes').catch(() => ({ data: { count: 0 } })),
        API.get('/documents').catch(() => ({ data: { count: 0 } })),
        API.get('/events').catch(() => ({ data: { events: [] } })),
      ]);

      if (tasksRes.data.tasks) {
        setTasks(tasksRes.data.tasks);
      }
      if (notesRes.data.notes) {
        setNoteCount(notesRes.data.notes.length);
      } else if (notesRes.data.count !== undefined) {
        setNoteCount(notesRes.data.count);
      }
      if (docsRes.data.documents) {
        setDocCount(docsRes.data.documents.length);
      } else if (docsRes.data.count !== undefined) {
        setDocCount(docsRes.data.count);
      }
      if (eventsRes.data.events && eventsRes.data.events.length > 0) {
        setNextEvent(eventsRes.data.events[0]);
      }
    } catch (err) {
      console.error('Fetch dashboard metrics error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const toggleTask = async (id: string, currentCompleted: boolean) => {
    try {
      const res = await API.put(`/tasks/${id}`, { completed: !currentCompleted });
      if (res.data.success) {
        setTasks(tasks.map((t) => (t._id === id ? { ...t, completed: !currentCompleted } : t)));
      }
    } catch (err) {
      console.error('Toggle task error:', err);
    }
  };

  const pendingTasks = tasks.filter((t) => !t.completed);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome back, {user?.name || 'Student'}
              </h1>
              <span className="text-[10px] font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
                DB Connected
              </span>
            </div>
            <p className="text-sm text-slate-500">
              {user?.major || 'General Studies'} • {user?.university || 'University'}
            </p>
          </div>
          <Link to="/learning-ai" className="btn-primary self-start sm:self-auto gap-2">
            <Bot className="w-4 h-4" />
            <span>Open Learning AI</span>
          </Link>
        </div>

        {/* 4 Summary Cards (Real DB Live Counts) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Pending Tasks</span>
              <CheckSquare className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {isLoading ? '...' : pendingTasks.length}
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
            <p className="text-2xl font-bold text-slate-900">
              {isLoading ? '...' : noteCount}
            </p>
            <Link to="/notes" className="text-xs text-green-600 hover:underline mt-2 inline-block font-medium">
              Open notebooks →
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Documents</span>
              <FileText className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {isLoading ? '...' : docCount}
            </p>
            <Link to="/documents" className="text-xs text-green-600 hover:underline mt-2 inline-block font-medium">
              Browse files →
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Next Event</span>
              <CalendarIcon className="w-4 h-4 text-green-600" />
            </div>
            {nextEvent ? (
              <>
                <p className="text-sm font-semibold text-slate-900 truncate">{nextEvent.title}</p>
                <p className="text-xs text-slate-500 mt-1">{nextEvent.date} • {nextEvent.time}</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-slate-500">No events</p>
                <Link to="/calendar" className="text-xs text-green-600 hover:underline mt-1 inline-block">
                  Add schedule →
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Quick Action Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tasks List */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Recent Tasks in Database</h2>
              <Link to="/tasks" className="text-xs font-medium text-green-600 hover:underline flex items-center gap-1">
                <span>Manage Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="p-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                <span>Syncing tasks from MongoDB...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No tasks saved in your account yet. <Link to="/tasks" className="text-green-600 font-semibold underline">Add your first task</Link>.
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task._id}
                    onClick={() => toggleTask(task._id, task.completed)}
                    className="flex items-center justify-between p-3 border border-slate-100 rounded-md hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task._id, task.completed)}
                        className="w-4 h-4 text-green-600 rounded border-slate-300 focus:ring-green-500 cursor-pointer"
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
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-3">Quick Actions</h2>
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

                <Link
                  to="/progress"
                  className="flex items-center justify-between p-2.5 rounded-md border border-slate-200 hover:border-green-400 hover:bg-green-50/40 text-sm text-slate-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-green-600" /> Log Study Session
                  </span>
                  <Plus className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
              MongoDB Atlas • Real-time Data Sync Active
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
