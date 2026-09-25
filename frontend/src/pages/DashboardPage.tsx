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
  Loader2,
  ChevronRight,
  Clock,
  Bell,
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
      <div className="space-y-6 animate-dashboard-reveal">
        {/* Welcome Banner Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-apple flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Welcome back, {user?.name?.split(' ')[0] || 'Student'}
              </h1>
              {user?.institutionCode ? (
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Campus: {user.institutionCode}
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Personal Learner
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              {user?.department || user?.major || 'Academic Focus'} • {user?.university || 'Synexora Platform'}
            </p>
          </div>
          <Link
            to="/learning-ai"
            className="btn-primary self-start sm:self-auto gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl shadow-apple hover:scale-[1.02] active:scale-[0.98]"
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>Open Learning AI</span>
          </Link>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-clean-interactive p-5">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Tasks</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isLoading ? '...' : pendingTasks.length}
            </p>
            <Link to="/tasks" className="text-xs text-slate-500 hover:text-slate-900 mt-3 inline-flex items-center gap-1 font-semibold transition-colors">
              <span>View all tasks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="card-clean-interactive p-5">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Notes</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <StickyNote className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isLoading ? '...' : noteCount}
            </p>
            <Link to="/notes" className="text-xs text-slate-500 hover:text-slate-900 mt-3 inline-flex items-center gap-1 font-semibold transition-colors">
              <span>Open notebooks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="card-clean-interactive p-5">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Documents</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isLoading ? '...' : docCount}
            </p>
            <Link to="/documents" className="text-xs text-slate-500 hover:text-slate-900 mt-3 inline-flex items-center gap-1 font-semibold transition-colors">
              <span>Browse files</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="card-clean-interactive p-5">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Next Schedule</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4" />
              </div>
            </div>
            {nextEvent ? (
              <>
                <p className="text-sm font-bold text-slate-900 truncate">{nextEvent.title}</p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{nextEvent.date} • {nextEvent.time}</span>
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-slate-500">No events</p>
                <Link to="/calendar" className="text-xs text-slate-500 hover:text-slate-900 mt-3 inline-flex items-center gap-1 font-semibold transition-colors">
                  <span>Add schedule</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Quick Action Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tasks List */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-apple">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Active Deliverables</h2>
              <Link to="/tasks" className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors">
                <span>Manage Tasks</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                <span>Syncing tasks...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                No tasks saved in your account yet.{' '}
                <Link to="/tasks" className="text-emerald-700 font-semibold underline">
                  Add your first task
                </Link>.
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task._id}
                    onClick={() => toggleTask(task._id, task.completed)}
                    className="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl hover:bg-slate-50/80 cursor-pointer transition-colors shadow-apple-sm"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task._id, task.completed)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                      />
                      <span className={`text-xs sm:text-sm font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.title}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {task.course}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts: Colored Square Tiles */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-apple flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Quick Shortcuts</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  6 Actions
                </span>
              </div>

              {/* 2x3 or 3x2 Colored Square Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {/* Note Tile - Amber */}
                <Link
                  to="/notes"
                  className="flex flex-col justify-between p-3 rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 to-amber-100/30 hover:from-amber-100/90 hover:to-amber-100/60 hover:border-amber-300 hover:shadow-apple-sm transition-all duration-200 group aspect-square"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <StickyNote className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-950 block leading-tight">
                      New Note
                    </span>
                    <span className="text-[10px] text-amber-700/80 font-medium">Notebooks</span>
                  </div>
                </Link>

                {/* Docs Tile - Blue */}
                <Link
                  to="/documents"
                  className="flex flex-col justify-between p-3 rounded-xl border border-blue-200/80 bg-gradient-to-br from-blue-50/70 to-blue-100/30 hover:from-blue-100/90 hover:to-blue-100/60 hover:border-blue-300 hover:shadow-apple-sm transition-all duration-200 group aspect-square"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-blue-950 block leading-tight">
                      Upload Docs
                    </span>
                    <span className="text-[10px] text-blue-700/80 font-medium">Repository</span>
                  </div>
                </Link>

                {/* Memory Tile - Emerald */}
                <Link
                  to="/memory"
                  className="flex flex-col justify-between p-3 rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 to-emerald-100/30 hover:from-emerald-100/90 hover:to-emerald-100/60 hover:border-emerald-300 hover:shadow-apple-sm transition-all duration-200 group aspect-square"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block leading-tight">
                      Flashcards
                    </span>
                    <span className="text-[10px] text-emerald-700/80 font-medium">Recall Vault</span>
                  </div>
                </Link>

                {/* Progress Tile - Rose */}
                <Link
                  to="/progress"
                  className="flex flex-col justify-between p-3 rounded-xl border border-rose-200/80 bg-gradient-to-br from-rose-50/70 to-rose-100/30 hover:from-rose-100/90 hover:to-rose-100/60 hover:border-rose-300 hover:shadow-apple-sm transition-all duration-200 group aspect-square"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-rose-950 block leading-tight">
                      Study Log
                    </span>
                    <span className="text-[10px] text-rose-700/80 font-medium">Analytics</span>
                  </div>
                </Link>

                {/* Reminder Tile - Indigo */}
                <Link
                  to="/timer"
                  className="flex flex-col justify-between p-3 rounded-xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 to-indigo-100/30 hover:from-indigo-100/90 hover:to-indigo-100/60 hover:border-indigo-300 hover:shadow-apple-sm transition-all duration-200 group aspect-square"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-indigo-950 block leading-tight">
                      Reminders
                    </span>
                    <span className="text-[10px] text-indigo-700/80 font-medium">Timer & Alarm</span>
                  </div>
                </Link>

                {/* Calendar Tile - Teal */}
                <Link
                  to="/calendar"
                  className="flex flex-col justify-between p-3 rounded-xl border border-teal-200/80 bg-gradient-to-br from-teal-50/70 to-teal-100/30 hover:from-teal-100/90 hover:to-teal-100/60 hover:border-teal-300 hover:shadow-apple-sm transition-all duration-200 group aspect-square"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-teal-950 block leading-tight">
                      Calendar
                    </span>
                    <span className="text-[10px] text-teal-700/80 font-medium">Timetable</span>
                  </div>
                </Link>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Database Sync</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Connected
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
