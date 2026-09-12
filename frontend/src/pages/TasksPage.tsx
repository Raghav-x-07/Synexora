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
    if (priority === 'high') return 'bg-red-50 text-red-700 border-red-200';
    if (priority === 'medium') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-green-600" />
            <span>Academic Tasks & Deadlines</span>
          </h1>
          <p className="text-xs text-slate-500">Track homework, reading assignments, and deliverables saved to MongoDB</p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Add Task Input Form */}
        <form onSubmit={handleAddTask} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quick Add Task</h3>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              className="input-clean sm:col-span-5 text-sm"
            />
            <input
              type="text"
              value={newCourse}
              onChange={(e) => setNewCourse(e.target.value)}
              placeholder="Course (e.g. CS 301)"
              className="input-clean sm:col-span-2 text-sm"
            />
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="input-clean sm:col-span-2 text-sm"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="input-clean sm:col-span-2 text-sm"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary sm:col-span-1 py-2 text-xs flex items-center justify-center disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </form>

        {/* Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-md text-xs font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-white shadow-sm text-slate-900 font-semibold' : 'text-slate-600'}`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 rounded ${filter === 'active' ? 'bg-white shadow-sm text-slate-900 font-semibold' : 'text-slate-600'}`}
            >
              Active ({tasks.filter((t) => !t.completed).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded ${filter === 'completed' ? 'bg-white shadow-sm text-slate-900 font-semibold' : 'text-slate-600'}`}
            >
              Completed ({tasks.filter((t) => t.completed).length})
            </button>
          </div>
          <span className="text-xs text-slate-500">
            {tasks.filter((t) => t.completed).length} of {tasks.length} tasks completed
          </span>
        </div>

        {/* Tasks List */}
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-green-600" />
              <span>Loading tasks from database...</span>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No tasks found in this view. Use the form above to add a new task.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task._id}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task._id, task.completed)}
                    className="w-4 h-4 text-green-600 rounded border-slate-300 focus:ring-green-500 cursor-pointer"
                  />
                  <div className="truncate">
                    <p className={`text-sm font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span>{task.course}</span>
                      <span>•</span>
                      <span>Due: {task.dueDate || 'No due date'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
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
