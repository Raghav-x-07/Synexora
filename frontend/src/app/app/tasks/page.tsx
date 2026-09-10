"use client";

import React, { useState } from "react";
import { CheckSquare, Plus, Filter, Calendar, AlertCircle, CheckCircle2, Trash2, X } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function TasksPage() {
  const [tasks, setTasks] = useState([
    { id: "1", title: "Submit Distributed Systems Project Draft", course: "CS301", dueDate: "Friday, 23:59", priority: "HIGH", done: false },
    { id: "2", title: "Complete BCNF Decomposition Practice Set", course: "CS220", dueDate: "Tomorrow, 18:00", priority: "HIGH", done: false },
    { id: "3", title: "Review Bellman-Ford Shortest Path Proof", course: "CS240", dueDate: "Monday, 12:00", priority: "MEDIUM", done: true },
    { id: "4", title: "Draft AI Ethics Weekly Diary Reflection", course: "GEN101", dueDate: "Sunday, 20:00", priority: "LOW", done: false },
  ]);

  const [filter, setFilter] = useState<"ALL" | "TODO" | "DONE">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCourse, setNewCourse] = useState("CS301");
  const [newDueDate, setNewDueDate] = useState("This Friday");
  const [newPriority, setNewPriority] = useState("MEDIUM");

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      title: newTitle,
      course: newCourse,
      dueDate: newDueDate,
      priority: newPriority,
      done: false,
    };
    setTasks([newTask, ...tasks]);
    setNewTitle("");
    setIsModalOpen(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "TODO") return !t.done;
    if (filter === "DONE") return t.done;
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
              {tasks.filter((t) => !t.done).length} Pending Tasks
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
            {f === "ALL" ? `All (${tasks.length})` : f === "TODO" ? `To Do (${tasks.filter(t => !t.done).length})` : `Completed (${tasks.filter(t => t.done).length})`}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <Card key={task.id} variant="light" className="p-4 flex items-center justify-between gap-4 hover:border-[#06383A]/30 transition-all">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                  task.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300 hover:border-[#06383A]"
                }`}
              >
                {task.done && <CheckCircle2 className="w-4 h-4" />}
              </button>
              <div>
                <div className={`text-sm font-bold ${task.done ? "line-through text-gray-400" : "text-[#06383A]"}`}>
                  {task.title}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                  <span className="font-mono font-bold text-[#06383A]/70">{task.course}</span>
                  <span>•</span>
                  <span>Due: {task.dueDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={task.priority === "HIGH" ? "amber" : "gray"}>
                {task.priority}
              </Badge>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

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
                    onChange={(e) => setNewPriority(e.target.value)}
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
