"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, Plus, Filter, Calendar, AlertCircle, CheckCircle2, Trash2, X, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { apiRequest } from "@/lib/apiClient";

interface TaskItem {
  id?: string;
  _id?: string;
  title: string;
  course?: string;
  dueDate?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  completed?: boolean;
  done?: boolean;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<"ALL" | "TODO" | "DONE">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCourse, setNewCourse] = useState("CS301");
  const [newDueDate, setNewDueDate] = useState("");
  const [newPriority, setNewPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest<TaskItem[]>("/tasks");
      setTasks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const getTaskId = (task: TaskItem) => task.id || task._id || "";
  const isDone = (task: TaskItem) => Boolean(task.completed ?? task.done);

  const toggleTask = async (task: TaskItem) => {
    const id = getTaskId(task);
    const updatedStatus = !isDone(task);
    // Optimistic UI update
    setTasks(tasks.map((t) => (getTaskId(t) === id ? { ...t, completed: updatedStatus, done: updatedStatus } : t)));

    try {
      await apiRequest(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify({ completed: updatedStatus }),
      });
    } catch (err) {
      // Revert if error
      setTasks(tasks.map((t) => (getTaskId(t) === id ? { ...t, completed: !updatedStatus, done: !updatedStatus } : t)));
    }
  };

  const deleteTask = async (task: TaskItem) => {
    const id = getTaskId(task);
    setTasks(tasks.filter((t) => getTaskId(t) !== id));

    try {
      await apiRequest(`/tasks/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      fetchTasks();
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await apiRequest<TaskItem>("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle,
          course: newCourse,
          dueDate: newDueDate || "Upcoming",
          priority: newPriority,
        }),
      });

      setTasks([created, ...tasks]);
      setNewTitle("");
      setNewDueDate("");
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to create task");
    }
  };

  const pendingCount = tasks.filter((t) => !isDone(t)).length;
  const completedCount = tasks.filter((t) => isDone(t)).length;

  const filteredTasks = tasks.filter((t) => {
    if (filter === "TODO") return !isDone(t);
    if (filter === "DONE") return isDone(t);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime">Context-Aware Planner</Badge>
            <span className="text-xs text-gray-500 font-mono">
              {pendingCount} Pending Tasks
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#06383A] tracking-tight">
            Tasks & Deadlines
          </h1>
        </div>

        <Button
          variant="dark"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4 text-[#B7F34A]" />}
        >
          Create Task
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        {(["ALL", "TODO", "DONE"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
              filter === f
                ? "bg-[#06383A] text-white"
                : "bg-white border border-[#06383A]/10 text-[#06383A] hover:bg-gray-50"
            }`}
          >
            {f === "ALL" ? `All (${tasks.length})` : f === "TODO" ? `To Do (${pendingCount})` : `Completed (${completedCount})`}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-12 text-center text-gray-500 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#06383A]" />
          <span className="text-sm font-medium">Loading your tasks...</span>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchTasks}>Retry</Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredTasks.length === 0 && (
        <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-white/50 p-8 space-y-3">
          <CheckSquare className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-bold text-base text-[#06383A]">No tasks found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {filter === "ALL"
              ? "You haven't added any tasks yet. Create a task to organize your academic deadlines."
              : filter === "TODO"
              ? "No pending tasks to do! You're all caught up."
              : "No completed tasks yet."}
          </p>
          {filter === "ALL" && (
            <Button
              variant="dark"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5 text-[#B7F34A]" />}
            >
              Add First Task
            </Button>
          )}
        </div>
      )}

      {/* Tasks List */}
      {!loading && !error && filteredTasks.length > 0 && (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const id = getTaskId(task);
            const done = isDone(task);
            return (
              <Card key={id} variant="light" className="p-4 flex items-center justify-between gap-4 hover:border-[#06383A]/30 transition-all">
                <div className="flex items-center gap-3.5">
                  <button
                    onClick={() => toggleTask(task)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                      done ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300 hover:border-[#06383A]"
                    }`}
                  >
                    {done && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <div>
                    <div className={`text-sm font-bold ${done ? "line-through text-gray-400" : "text-[#06383A]"}`}>
                      {task.title}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                      {task.course && <span className="font-mono font-bold text-[#06383A]/70">{task.course}</span>}
                      {task.course && task.dueDate && <span>•</span>}
                      {task.dueDate && <span>Due: {task.dueDate}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={task.priority === "HIGH" ? "amber" : "gray"}>
                    {task.priority}
                  </Badge>
                  <button
                    onClick={() => deleteTask(task)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl border border-[#06383A]/10 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-[#06383A]">Create New Task</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#06383A] font-bold block">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Raft leader election"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#F2F5EE] border border-[#06383A]/10 rounded-xl px-4 py-2.5 text-sm text-[#06383A] focus:outline-none focus:border-[#06383A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#06383A] font-bold block">Course</label>
                  <input
                    type="text"
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    className="w-full bg-[#F2F5EE] border border-[#06383A]/10 rounded-xl px-4 py-2 text-sm text-[#06383A] focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#06383A] font-bold block">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH")}
                    className="w-full bg-[#F2F5EE] border border-[#06383A]/10 rounded-xl px-4 py-2 text-sm text-[#06383A] focus:outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#06383A] font-bold block">Due Date</label>
                <input
                  type="text"
                  placeholder="e.g. Friday at 23:59"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full bg-[#F2F5EE] border border-[#06383A]/10 rounded-xl px-4 py-2.5 text-sm text-[#06383A] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="dark" size="sm" type="submit">
                  Save Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

