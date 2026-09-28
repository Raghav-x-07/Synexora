import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/AppLayout';
import API from '../lib/api';
import {
  CheckSquare,
  StickyNote,
  Calendar as CalendarIcon,
  Bot,
  Loader2,
  ChevronRight,
  Clock,
  Building2,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Flame,
  CheckCircle2,
  Plus,
  Search,
  X,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface DeliverableItem {
  _id: string;
  title: string;
  course: string;
  priority?: 'high' | 'medium' | 'low';
  dueDate?: string;
  completed: boolean;
  type: 'personal_task' | 'classroom_work';
  classroomId?: string;
  points?: number;
}

export const DashboardPage: React.FC = () => {
  const { user, isSuperAdmin, isInstitutionAdmin, isInstitutionTeacher } = useAuth();

  const [tasks, setTasks] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [noteCount, setNoteCount] = useState(0);
  const [nextEvent, setNextEvent] = useState<any | null>(null);
  const [deliverablesTab, setDeliverablesTab] = useState<'all' | 'tasks' | 'classwork' | 'due_soon' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Quick Task Add state
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskPriority, setQuickTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Interactive micro-toast notification
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3200);
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [tasksRes, notesRes, eventsRes, classroomsRes] = await Promise.all([
        API.get('/tasks').catch(() => ({ data: { tasks: [] } })),
        API.get('/notes').catch(() => ({ data: { count: 0 } })),
        API.get('/events').catch(() => ({ data: { events: [] } })),
        API.get('/classrooms').catch(() => ({ data: { classrooms: [] } })),
      ]);

      if (tasksRes.data.tasks) {
        setTasks(tasksRes.data.tasks);
      }
      if (notesRes.data.notes) {
        setNoteCount(notesRes.data.notes.length);
      } else if (notesRes.data.count !== undefined) {
        setNoteCount(notesRes.data.count);
      }
      if (eventsRes.data.events && eventsRes.data.events.length > 0) {
        setNextEvent(eventsRes.data.events[0]);
      }
      if (classroomsRes.data.classrooms) {
        setClassrooms(classroomsRes.data.classrooms);
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
      const nextState = !currentCompleted;
      // Optimistic update
      setTasks(tasks.map((t) => (t._id === id ? { ...t, completed: nextState } : t)));
      
      if (nextState) {
        showToast('🎉 Task completed! Keep up the great pace.', 'success');
      }

      const res = await API.put(`/tasks/${id}`, { completed: nextState });
      if (!res.data.success) {
        // Revert if failed
        setTasks(tasks.map((t) => (t._id === id ? { ...t, completed: currentCompleted } : t)));
      }
    } catch (err) {
      console.error('Toggle task error:', err);
      setTasks(tasks.map((t) => (t._id === id ? { ...t, completed: currentCompleted } : t)));
    }
  };

  const handleQuickAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    try {
      setIsCreatingTask(true);
      const res = await API.post('/tasks', {
        title: quickTaskTitle.trim(),
        course: 'General',
        priority: quickTaskPriority,
        dueDate: 'No due date',
      });
      if (res.data.success && res.data.task) {
        setTasks([res.data.task, ...tasks]);
        setQuickTaskTitle('');
        setIsQuickAdding(false);
        showToast('⚡ Task added directly to your schedule!', 'success');
      }
    } catch (err) {
      console.error('Failed to create quick task:', err);
      showToast('Could not add task. Please try again.', 'info');
    } finally {
      setIsCreatingTask(false);
    }
  };

  // Build unified deliverables list combining personal tasks + classroom assignments
  const personalDeliverables: DeliverableItem[] = tasks.map((t) => ({
    _id: t._id,
    title: t.title,
    course: t.course || 'Personal Task',
    priority: t.priority || 'medium',
    dueDate: t.dueDate || '',
    completed: !!t.completed,
    type: 'personal_task',
  }));

  const classroomDeliverables: DeliverableItem[] = classrooms.flatMap((c) =>
    (c.classwork || []).map((cw: any) => ({
      _id: cw._id,
      title: cw.title,
      course: c.title || c.subject || 'Classroom Assignment',
      priority: cw.type === 'quiz' ? 'high' : 'medium',
      dueDate: cw.dueDate || '',
      completed: false,
      type: 'classroom_work',
      classroomId: c._id,
      points: cw.points,
    }))
  );

  const allDeliverables: DeliverableItem[] = [...personalDeliverables, ...classroomDeliverables];

  // Format and analyze due dates with color-coded urgency
  const getDueDateInfo = (dueDateStr?: string) => {
    if (!dueDateStr || !dueDateStr.trim() || dueDateStr.toLowerCase() === 'no due date') {
      return {
        text: 'No Due Date',
        badgeClass: 'bg-[#FFF8E8] text-[#777777] border-[#E8E1D2]',
        isUrgent: false,
        daysUntil: 999,
      };
    }

    const parsedDate = new Date(dueDateStr);
    if (isNaN(parsedDate.getTime())) {
      return {
        text: `Due: ${dueDateStr}`,
        badgeClass: 'bg-[#FFF8E8] text-[#111111] border-[#E8E1D2]',
        isUrgent: false,
        daysUntil: 999,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(parsedDate);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `Overdue (${Math.abs(diffDays)}d)`,
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
        isUrgent: true,
        daysUntil: diffDays,
      };
    }
    if (diffDays === 0) {
      return {
        text: 'Due Today',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-bold animate-pulse',
        isUrgent: true,
        daysUntil: 0,
      };
    }
    if (diffDays === 1) {
      return {
        text: 'Due Tomorrow',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 font-bold',
        isUrgent: true,
        daysUntil: 1,
      };
    }
    if (diffDays <= 3) {
      return {
        text: `Due in ${diffDays}d`,
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
        isUrgent: true,
        daysUntil: diffDays,
      };
    }
    return {
      text: `Due: ${target.toLocaleDateString([], { month: 'short', day: 'numeric' })}`,
      badgeClass: 'bg-[#FFF8E8] text-[#111111] border-[#E8E1D2]',
      isUrgent: false,
      daysUntil: diffDays,
    };
  };

  // Filter deliverables based on selected tab and search query
  const getFilteredDeliverables = () => {
    let list = allDeliverables;

    if (deliverablesTab === 'completed') {
      list = list.filter((d) => d.completed);
    } else {
      const pending = list.filter((d) => !d.completed);
      if (deliverablesTab === 'tasks') {
        list = pending.filter((d) => d.type === 'personal_task');
      } else if (deliverablesTab === 'classwork') {
        list = pending.filter((d) => d.type === 'classroom_work');
      } else if (deliverablesTab === 'due_soon') {
        list = pending.filter((d) => {
          const info = getDueDateInfo(d.dueDate);
          return info.isUrgent;
        });
      } else {
        list = pending;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) => d.title.toLowerCase().includes(q) || d.course.toLowerCase().includes(q)
      );
    }

    return list;
  };

  const filteredDeliverables = getFilteredDeliverables();
  const pendingDeliverablesCount = allDeliverables.filter((d) => !d.completed).length;
  const completedDeliverablesCount = allDeliverables.filter((d) => d.completed).length;
  const dueSoonCount = allDeliverables.filter((d) => !d.completed && getDueDateInfo(d.dueDate).isUrgent).length;
  const totalDeliverablesCount = allDeliverables.length;
  const completionPercentage =
    totalDeliverablesCount > 0
      ? Math.round((completedDeliverablesCount / totalDeliverablesCount) * 100)
      : 0;

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const userInitial = (user?.name || 'Student').charAt(0).toUpperCase();
  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-dashboard-reveal">
        {/* Floating Toast Notification */}
        {feedbackToast && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-[#111111] text-[#FFFDF7] px-4 py-2.5 rounded-2xl shadow-xl border border-[#F4C542]/40 animate-fade-in text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-[#F4C542] shrink-0" />
            <span>{feedbackToast.message}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* WELCOME BANNER CARD (Elevated, Time-Aware, Interactive Streak & Actions)  */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[#FFFFFF] to-[#FFFDF9] border border-[#E8E1D2] rounded-3xl p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-md before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#F4C542] before:via-[#111111] before:to-[#F4C542]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              {/* User Avatar with Ring Glow & Initial */}
              <div className="w-13 h-13 rounded-2xl bg-[#111111] text-[#F4C542] flex items-center justify-center font-black text-xl shadow-xs ring-4 ring-[#FFF8E8] shrink-0 relative group">
                {userInitial}
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Active learner" />
              </div>

              <div>
                <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                    {getGreeting()}, {user?.name?.split(' ')[0] || 'Learner'}
                  </h1>

                  {/* Date Badge */}
                  <span className="text-[10px] font-bold bg-[#FFF8E8] text-[#555555] px-2.5 py-0.5 rounded-full border border-[#E8E1D2]">
                    {todayFormatted}
                  </span>

                  {/* Campus Badge */}
                  {user?.institutionCode ? (
                    <span className="text-[10px] font-bold bg-[#FFF8E8] text-[#111111] px-3 py-0.5 rounded-full border border-[#E8E1D2] shadow-2xs">
                      Campus: {user.institutionCode}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-[#FFF8E8] text-[#111111] px-3 py-0.5 rounded-full border border-[#E8E1D2] shadow-2xs">
                      Personal Learner
                    </span>
                  )}

                  {/* Interactive Streak Pill */}
                  <span
                    className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 cursor-default hover:bg-amber-100 transition-colors"
                    title="Active study streak - consistency fuels mastery!"
                  >
                    <Flame className="w-3 h-3 text-[#F4C542] fill-[#F4C542] animate-bounce" />
                    <span>{user?.streak || 7}d Streak</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#777777] font-medium">
                  {user?.department || user?.major || 'Academic Focus'} • {user?.university || 'Synexora Adaptive Platform'}
                </p>
              </div>
            </div>

            {/* Quick Action Navigation Buttons (Admin / Teacher only) */}
            {isSuperAdmin ? (
              <Link
                to="/admin"
                className="btn-primary sm:self-start lg:self-auto gap-2 px-5 py-2.5 text-xs font-bold shadow-xs shrink-0 hover:-translate-y-0.5 transition-transform"
              >
                <Building2 className="w-4 h-4 text-[#111111]" />
                <span>Manage Institutions</span>
              </Link>
            ) : isInstitutionAdmin || isInstitutionTeacher ? (
              <Link
                to="/institution-portal"
                className="btn-primary sm:self-start lg:self-auto gap-2 px-5 py-2.5 text-xs font-bold shadow-xs shrink-0 hover:-translate-y-0.5 transition-transform"
              >
                <Building2 className="w-4 h-4 text-[#111111]" />
                <span>Open Campus Portal</span>
              </Link>
            ) : null}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4 SUMMARY TOP METRIC KPI CARDS (Lifted Aesthetics & Micro-Interactions)   */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Enrolled Classrooms */}
          <div className="card-clean-interactive p-5 group flex flex-col justify-between hover:border-[#111111]/30">
            <div>
              <div className="flex items-center justify-between text-[#777777] mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">
                  Enrolled Classrooms
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#FFF8E8] text-[#111111] group-hover:bg-[#111111] group-hover:text-[#F4C542] transition-all duration-300 flex items-center justify-center font-bold shadow-2xs">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#111111] tracking-tight">
                {isLoading ? '...' : classrooms.length}
              </p>
            </div>
            <Link
              to="/classroom"
              className="text-xs text-[#777777] hover:text-[#111111] mt-3 pt-2 border-t border-[#E8E1D2]/60 inline-flex items-center justify-between font-semibold transition-colors group-hover:text-[#111111]"
            >
              <span>{classrooms.length === 1 ? '1 active course' : `${classrooms.length} active courses`}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 2: Pending Tasks & Assigned Work */}
          <div className="card-clean-interactive p-5 group flex flex-col justify-between hover:border-[#111111]/30">
            <div>
              <div className="flex items-center justify-between text-[#777777] mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">
                  Pending Tasks & Work
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#FFF8E8] text-[#111111] group-hover:bg-[#111111] group-hover:text-[#F4C542] transition-all duration-300 flex items-center justify-center font-bold shadow-2xs">
                  <CheckSquare className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#111111] tracking-tight">
                {isLoading ? '...' : pendingDeliverablesCount}
              </p>
            </div>
            <Link
              to="/tasks"
              className="text-xs text-[#777777] hover:text-[#111111] mt-3 pt-2 border-t border-[#E8E1D2]/60 inline-flex items-center justify-between font-semibold transition-colors group-hover:text-[#111111]"
            >
              <span>View all deliverables</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 3: Total Notes */}
          <div className="card-clean-interactive p-5 group flex flex-col justify-between hover:border-[#111111]/30">
            <div>
              <div className="flex items-center justify-between text-[#777777] mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">
                  Total Notebooks
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#FFF8E8] text-[#111111] group-hover:bg-[#111111] group-hover:text-[#F4C542] transition-all duration-300 flex items-center justify-center font-bold shadow-2xs">
                  <StickyNote className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#111111] tracking-tight">
                {isLoading ? '...' : noteCount}
              </p>
            </div>
            <Link
              to="/notes"
              className="text-xs text-[#777777] hover:text-[#111111] mt-3 pt-2 border-t border-[#E8E1D2]/60 inline-flex items-center justify-between font-semibold transition-colors group-hover:text-[#111111]"
            >
              <span>Open notebooks</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 4: Next Schedule / Timetable */}
          <div className="card-clean-interactive p-5 group flex flex-col justify-between hover:border-[#111111]/30">
            <div>
              <div className="flex items-center justify-between text-[#777777] mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">
                  Next Schedule
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#FFF8E8] text-[#111111] group-hover:bg-[#111111] group-hover:text-[#F4C542] transition-all duration-300 flex items-center justify-center font-bold shadow-2xs">
                  <CalendarIcon className="w-4 h-4" />
                </div>
              </div>
              {nextEvent ? (
                <>
                  <p className="text-sm font-bold text-[#111111] truncate">{nextEvent.title}</p>
                  <p className="text-xs text-[#777777] mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#777777]" />
                    <span>
                      {nextEvent.date} • {nextEvent.time}
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-[#777777]">No upcoming events</p>
                  <p className="text-xs text-[#999999] mt-0.5">Schedule is clear</p>
                </>
              )}
            </div>
            <Link
              to="/calendar"
              className="text-xs text-[#777777] hover:text-[#111111] mt-3 pt-2 border-t border-[#E8E1D2]/60 inline-flex items-center justify-between font-semibold transition-colors group-hover:text-[#111111]"
            >
              <span>{nextEvent ? 'View full calendar' : 'Add schedule'}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE QUICK COMMAND LAUNCHPAD                                        */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/learning-ai"
            className="p-3.5 bg-[#FFFFFF] border border-[#E8E1D2] rounded-2xl hover:border-[#111111] hover:shadow-xs transition-all flex items-center gap-3 group hover:-translate-y-0.5"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FFF8E8] group-hover:bg-[#111111] text-[#111111] group-hover:text-[#F4C542] flex items-center justify-center transition-colors shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#111111] truncate">Learning AI</div>
              <div className="text-[10px] text-[#777777] truncate">Ask study questions</div>
            </div>
          </Link>

          <Link
            to="/notes"
            className="p-3.5 bg-[#FFFFFF] border border-[#E8E1D2] rounded-2xl hover:border-[#111111] hover:shadow-xs transition-all flex items-center gap-3 group hover:-translate-y-0.5"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FFF8E8] group-hover:bg-[#111111] text-[#111111] group-hover:text-[#F4C542] flex items-center justify-center transition-colors shrink-0">
              <StickyNote className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#111111] truncate">Scratchpad</div>
              <div className="text-[10px] text-[#777777] truncate">Capture quick notes</div>
            </div>
          </Link>

          <Link
            to="/progress"
            className="p-3.5 bg-[#FFFFFF] border border-[#E8E1D2] rounded-2xl hover:border-[#111111] hover:shadow-xs transition-all flex items-center gap-3 group hover:-translate-y-0.5"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FFF8E8] group-hover:bg-[#111111] text-[#111111] group-hover:text-[#F4C542] flex items-center justify-center transition-colors shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#111111] truncate">Performance</div>
              <div className="text-[10px] text-[#777777] truncate">Track mastery & score</div>
            </div>
          </Link>

          <Link
            to="/calendar"
            className="p-3.5 bg-[#FFFFFF] border border-[#E8E1D2] rounded-2xl hover:border-[#111111] hover:shadow-xs transition-all flex items-center gap-3 group hover:-translate-y-0.5"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FFF8E8] group-hover:bg-[#111111] text-[#111111] group-hover:text-[#F4C542] flex items-center justify-center transition-colors shrink-0">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#111111] truncate">Timetable</div>
              <div className="text-[10px] text-[#777777] truncate">Manage class times</div>
            </div>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* ASSIGNED TASKS & DELIVERABLES (Lifted Card, Quick-Add & Search Filter)     */}
        {/* ========================================================================= */}
        <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
          <div>
            {/* Header with Title & Quick Add Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-[#111111] tracking-tight flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#111111]" />
                    <span>Assigned Tasks & Due Dates</span>
                  </h2>
                  {totalDeliverablesCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2]">
                      {completionPercentage}% Done
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#777777] mt-0.5">
                  Track coursework deliverables, upcoming deadlines, and personal task sprints.
                </p>
              </div>

              {/* Quick Add Toggle Button */}
              <button
                onClick={() => setIsQuickAdding(!isQuickAdding)}
                className="btn-secondary gap-1.5 px-3.5 py-1.5 text-xs font-bold self-start sm:self-auto hover:-translate-y-0.5 transition-transform"
              >
                {isQuickAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{isQuickAdding ? 'Cancel' : 'Quick Task'}</span>
              </button>
            </div>

            {/* Quick Add Form Drawer */}
            {isQuickAdding && (
              <form
                onSubmit={handleQuickAddTask}
                className="mb-4 p-3.5 bg-[#FFF8E8] border border-[#E8E1D2] rounded-2xl animate-fade-in flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center"
              >
                <input
                  type="text"
                  placeholder="What do you need to get done?"
                  value={quickTaskTitle}
                  onChange={(e) => setQuickTaskTitle(e.target.value)}
                  autoFocus
                  className="flex-1 bg-white border border-[#E8E1D2] px-3.5 py-2 rounded-xl text-xs font-medium text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111]"
                />

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={quickTaskPriority}
                    onChange={(e) => setQuickTaskPriority(e.target.value as any)}
                    aria-label="Task Priority"
                    className="bg-white border border-[#E8E1D2] px-3 py-2 rounded-xl text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#111111]"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>

                  <button
                    type="submit"
                    disabled={isCreatingTask || !quickTaskTitle.trim()}
                    className="btn-primary px-4 py-2 text-xs font-bold gap-1.5 disabled:opacity-50"
                  >
                    {isCreatingTask ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>Add Task</span>
                  </button>
                </div>
              </form>
            )}

            {/* Search and Tabs Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#FFF8E8] p-1 rounded-full border border-[#E8E1D2] text-[11px] font-bold self-start md:self-auto flex-wrap">
                <button
                  onClick={() => setDeliverablesTab('all')}
                  className={`px-3 py-1 rounded-full transition-all duration-200 ${
                    deliverablesTab === 'all'
                      ? 'bg-[#111111] text-[#F4C542] shadow-xs'
                      : 'text-[#555555] hover:text-[#111111]'
                  }`}
                >
                  All ({pendingDeliverablesCount})
                </button>
                <button
                  onClick={() => setDeliverablesTab('tasks')}
                  className={`px-3 py-1 rounded-full transition-all duration-200 ${
                    deliverablesTab === 'tasks'
                      ? 'bg-[#111111] text-[#F4C542] shadow-xs'
                      : 'text-[#555555] hover:text-[#111111]'
                  }`}
                >
                  Tasks ({personalDeliverables.filter((t) => !t.completed).length})
                </button>
                <button
                  onClick={() => setDeliverablesTab('classwork')}
                  className={`px-3 py-1 rounded-full transition-all duration-200 ${
                    deliverablesTab === 'classwork'
                      ? 'bg-[#111111] text-[#F4C542] shadow-xs'
                      : 'text-[#555555] hover:text-[#111111]'
                  }`}
                >
                  Classwork ({classroomDeliverables.length})
                </button>
                {dueSoonCount > 0 && (
                  <button
                    onClick={() => setDeliverablesTab('due_soon')}
                    className={`px-3 py-1 rounded-full transition-all duration-200 ${
                      deliverablesTab === 'due_soon'
                        ? 'bg-[#111111] text-[#F4C542] shadow-xs'
                        : 'text-amber-700 hover:text-[#111111]'
                    }`}
                  >
                    Due Soon ({dueSoonCount})
                  </button>
                )}
                <button
                  onClick={() => setDeliverablesTab('completed')}
                  className={`px-3 py-1 rounded-full transition-all duration-200 ${
                    deliverablesTab === 'completed'
                      ? 'bg-[#111111] text-[#F4C542] shadow-xs'
                      : 'text-[#555555] hover:text-[#111111]'
                  }`}
                >
                  Completed ({completedDeliverablesCount})
                </button>
              </div>

              {/* Search Filter Input */}
              <div className="relative w-full md:w-56">
                <Search className="w-3.5 h-3.5 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter deliverables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#FFFDF7] border border-[#E8E1D2] rounded-full text-xs font-medium text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#111111]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Micro Progress Bar */}
            {totalDeliverablesCount > 0 && (
              <div className="mb-4 bg-[#FFF8E8] p-2.5 rounded-2xl border border-[#E8E1D2] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-bold text-[#111111] truncate">
                    {completedDeliverablesCount} of {totalDeliverablesCount} tasks completed
                  </span>
                </div>
                <div className="w-28 sm:w-44 bg-[#E8E1D2]/60 h-2 rounded-full overflow-hidden shrink-0">
                  <div
                    className="bg-gradient-to-r from-[#111111] to-[#F4C542] h-full rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Deliverables List with Due Dates */}
            {isLoading ? (
              <div className="p-10 text-center text-[#777777] text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
                <span>Loading assigned tasks and due dates...</span>
              </div>
            ) : filteredDeliverables.length === 0 ? (
              <div className="p-10 text-center text-[#777777] text-xs bg-[#FFF8E8]/40 rounded-2xl border border-dashed border-[#E8E1D2]">
                {searchQuery ? (
                  <span>
                    No tasks matching "<strong>{searchQuery}</strong>".{' '}
                    <button onClick={() => setSearchQuery('')} className="underline font-bold text-[#111111]">
                      Clear search
                    </button>
                  </span>
                ) : deliverablesTab === 'completed' ? (
                  'No completed tasks yet. Mark tasks as done to see them here.'
                ) : deliverablesTab === 'due_soon' ? (
                  'No immediate upcoming deadlines in the next 3 days.'
                ) : (
                  <span>
                    🎉 All caught up! No pending tasks or assignments due.{' '}
                    <button
                      onClick={() => setIsQuickAdding(true)}
                      className="text-[#111111] font-bold underline hover:text-[#000000]"
                    >
                      Create a quick task
                    </button>
                  </span>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredDeliverables.slice(0, 8).map((item) => {
                  const dueInfo = getDueDateInfo(item.dueDate);

                  return (
                    <div
                      key={item._id}
                      className={`p-3.5 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs ${
                        item.completed
                          ? 'bg-slate-50/70 border-slate-200 opacity-60'
                          : 'bg-[#FFFDF7] border-[#E8E1D2] hover:bg-[#FFF8E8]/40 hover:border-[#D6CCA8]'
                      }`}
                    >
                      {/* Left Side: Checkbox & Task info */}
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        {item.type === 'personal_task' ? (
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => toggleTask(item._id, item.completed)}
                            className="w-4 h-4 mt-0.5 sm:mt-0 text-[#F4C542] rounded border-[#E8E1D2] focus:ring-[#111111] cursor-pointer accent-[#111111]"
                            title="Toggle completion"
                          />
                        ) : (
                          <Link
                            to={`/classroom?classId=${item.classroomId}`}
                            className="w-6 h-6 rounded-lg bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 hover:bg-[#111111] hover:text-[#F4C542] transition-colors"
                            title="Go to classroom coursework"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-xs sm:text-sm font-bold truncate ${
                                item.completed ? 'line-through text-[#888888]' : 'text-[#111111]'
                              }`}
                            >
                              {item.title}
                            </span>
                            <span className="text-[10px] bg-[#FFF8E8] text-[#555555] px-2 py-0.5 rounded-full border border-[#E8E1D2] font-semibold">
                              {item.course}
                            </span>
                            {item.priority === 'high' && (
                              <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200 font-bold">
                                High Priority
                              </span>
                            )}
                            {item.points && (
                              <span className="text-[10px] bg-white text-[#111111] px-2 py-0.5 rounded-full border border-[#E8E1D2] font-mono font-bold">
                                {item.points} pts
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Exact Due Date Pill & Actions */}
                      <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                        {/* Due Date Indicator */}
                        <span
                          className={`text-[11px] px-3 py-1 rounded-full border flex items-center gap-1.5 ${dueInfo.badgeClass}`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{dueInfo.text}</span>
                        </span>

                        {item.type === 'classroom_work' ? (
                          <Link
                            to={`/classroom?classId=${item.classroomId}`}
                            className="text-[11px] font-bold text-[#111111] hover:underline flex items-center gap-0.5 shrink-0"
                          >
                            <span>Classroom</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <Link
                            to="/tasks"
                            className="text-[11px] font-semibold text-[#777777] hover:text-[#111111] shrink-0"
                          >
                            Edit
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 mt-5 border-t border-[#E8E1D2] flex items-center justify-between text-xs">
            <span className="text-[#777777] font-medium">
              Showing top active deliverables. Consistency powers results!
            </span>
            <Link
              to="/tasks"
              className="text-xs font-bold text-[#111111] hover:underline flex items-center gap-1 group"
            >
              <span>Manage all tasks</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};


