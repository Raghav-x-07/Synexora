import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import API from '../lib/api';
import { CheckSquare, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';

interface TaskItem {
  _id: string;
  title: string;
  course: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  completed: boolean;
}

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('CS 301');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const res = await API.get('/tasks');
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err: any) {
      console.error('Fetch tasks error:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to fetch tasks from database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await API.post('/tasks', {
        title: newTitle,
        course: newCourse || 'General',
        priority: newPriority,
        dueDate: newDueDate || 'No due date',
      });

      if (res.data.success && res.data.task) {
        setTasks([res.data.task, ...tasks]);
        setNewTitle('');
        setNewDueDate('');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTask = async (id: string, currentCompleted: boolean) => {
    try {
      const res = await API.put(`/tasks/${id}`, { completed: !currentCompleted });
      if (res.data.success) {
        setTasks(tasks.map((t) => (t._id === id ? { ...t, completed: !currentCompleted } : t)));
      }
    } catch (err: any) {
      console.error('Toggle task error:', err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const res = await API.delete(`/tasks/${id}`);
      if (res.data.success) {
        setTasks(tasks.filter((t) => t._id !== id));
      }
    } catch (err: any) {
      console.error('Delete task error:', err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    if (priority === 'high') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (priority === 'medium') return 'bg-[#FFF8E8] text-[#111111] border-[#F4C542]';
    return 'bg-[#F7F1E3] text-[#777777] border-[#E8E1D2]';
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold">
                <CheckSquare className="w-4 h-4" />
              </div>
              <span>Academic Tasks & Deliverables</span>
            </h1>
            <p className="text-xs text-[#777777] mt-1">Track assignments, project milestones, and homework checklists in real-time.</p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Add Task Input Form */}
        <form onSubmit={handleAddTask} className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl p-6 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">Quick Add Task</h3>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What needs to be completed?"
              required
              className="input-clean sm:col-span-5 text-xs font-medium"
            />
            <input
              type="text"
              value={newCourse}
              onChange={(e) => setNewCourse(e.target.value)}
              placeholder="Course (e.g. CS 301)"
              className="input-clean sm:col-span-2 text-xs font-medium"
            />
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="input-clean sm:col-span-2 text-xs font-medium"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="input-clean sm:col-span-2 text-xs font-medium"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary sm:col-span-1 py-2 text-xs font-bold flex items-center justify-center disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-[#111111]" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </form>

        {/* Filter Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-[#FFF8E8] border border-[#E8E1D2] rounded-full text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1 rounded-full transition-all ${filter === 'all' ? 'bg-[#111111] text-[#FFFFFF] shadow-xs' : 'text-[#3F3F3F] hover:text-[#111111]'}`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3.5 py-1 rounded-full transition-all ${filter === 'active' ? 'bg-[#111111] text-[#FFFFFF] shadow-xs' : 'text-[#3F3F3F] hover:text-[#111111]'}`}
            >
              Active ({tasks.filter((t) => !t.completed).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3.5 py-1 rounded-full transition-all ${filter === 'completed' ? 'bg-[#111111] text-[#FFFFFF] shadow-xs' : 'text-[#3F3F3F] hover:text-[#111111]'}`}
            >
              Completed ({tasks.filter((t) => t.completed).length})
            </button>
          </div>
          <span className="text-xs text-[#777777] font-medium">
            {tasks.filter((t) => t.completed).length} of {tasks.length} tasks completed
          </span>
        </div>

        {/* Tasks List */}
        <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl divide-y divide-[#E8E1D2]/60 overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="p-8 text-center text-[#777777] text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
              <span>Loading tasks from database...</span>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-[#777777] text-sm">
              No tasks found in this view. Use the form above to add a new task.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task._id}
                className="p-4 sm:px-6 flex items-center justify-between hover:bg-[#FFF8E8]/40 transition-colors gap-3"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task._id, task.completed)}
                    className="w-4 h-4 text-[#F4C542] rounded border-[#E8E1D2] focus:ring-[#F4C542] cursor-pointer accent-[#F4C542]"
                  />
                  <div className="truncate">
                    <p className={`text-sm font-semibold ${task.completed ? 'line-through text-[#9CA3AF]' : 'text-[#111111]'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-[#777777]">
                      <span className="font-bold">{task.course}</span>
                      <span>•</span>
                      <span>Due: {task.dueDate || 'No due date'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="p-1.5 text-[#777777] hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};
