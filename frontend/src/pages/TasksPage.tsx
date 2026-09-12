import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';

interface TaskItem {
  id: string;
  title: string;
  course: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  completed: boolean;
}

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: '1', title: 'Review Chapter 4 Algorithms lecture notes', course: 'CS 301', priority: 'high', dueDate: '2026-09-14', completed: false },
    { id: '2', title: 'Submit Calculus II Problem Set', course: 'MATH 201', priority: 'medium', dueDate: '2026-09-15', completed: true },
    { id: '3', title: 'Prepare presentation slides for AI Seminar', course: 'AI 402', priority: 'high', dueDate: '2026-09-16', completed: false },
    { id: '4', title: 'Read Machine Learning research paper', course: 'AI 402', priority: 'low', dueDate: '2026-09-18', completed: false },
  ]);

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('CS 301');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDueDate, setNewDueDate] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: Date.now().toString(),
      title: newTitle,
      course: newCourse || 'General',
      priority: newPriority,
      dueDate: newDueDate || 'No due date',
      completed: false,
    };

    setTasks([newTask, ...tasks]);
    setNewTitle('');
    setNewDueDate('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
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
          <p className="text-xs text-slate-500">Track homework, reading assignments, and project deliverables</p>
        </div>

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
            <button type="submit" className="btn-primary sm:col-span-1 py-2 text-xs flex items-center justify-center">
              <Plus className="w-4 h-4" />
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
              Active ({tasks.filter(t => !t.completed).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded ${filter === 'completed' ? 'bg-white shadow-sm text-slate-900 font-semibold' : 'text-slate-600'}`}
            >
              Completed ({tasks.filter(t => t.completed).length})
            </button>
          </div>
          <span className="text-xs text-slate-500">
            {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
          </span>
        </div>

        {/* Tasks List */}
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No tasks found in this view.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="w-4 h-4 text-green-600 rounded border-slate-300 focus:ring-green-500"
                  />
                  <div className="truncate">
                    <p className={`text-sm font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span>{task.course}</span>
                      <span>•</span>
                      <span>Due: {task.dueDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
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
