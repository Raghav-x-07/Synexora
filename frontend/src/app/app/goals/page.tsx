"use client";

import React, { useState } from "react";
import { Target, Plus, CheckCircle2, Trash2, X } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function GoalsPage() {
  const [goals, setGoals] = useState([
    { id: "1", title: "Achieve 85%+ in DBMS Final Exam", deadline: "Dec 15, 2026", progress: 68, status: "On Track" },
    { id: "2", title: "Complete Raft Consensus Implementation with 100% test pass", deadline: "Oct 01, 2026", progress: 85, status: "Ahead" },
    { id: "3", title: "Maintain 30-Day Daily Study Streak", deadline: "Ongoing", progress: 46, status: "Active (14/30 Days)" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDeadline, setNewDeadline] = useState("Dec 2026");

  const updateProgress = (id: string, progress: number) => {
    setGoals(goals.map((g) => (g.id === id ? { ...g, progress } : g)));
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newGoal = {
      id: Date.now().toString(),
      title: newTitle,
      deadline: newDeadline,
      progress: 10,
      status: "On Track",
    };
    setGoals([newGoal, ...goals]);
    setNewTitle("");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime">Academic Aspirations</Badge>
            <span className="text-xs text-gray-500 font-mono">Fall 2026 Target Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#06383A] tracking-tight">
            Academic Goals
          </h1>
        </div>

        <Button
          variant="dark"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4 text-[#B7F34A]" />}
        >
          Set New Goal
        </Button>
      </div>

      <div className="space-y-4">
        {goals.map((g) => (
          <Card key={g.id} variant="light" className="p-6 space-y-4 hover:border-[#06383A]/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="font-bold text-base text-[#06383A]">{g.title}</span>
              <div className="flex items-center gap-2">
                <Badge variant={g.progress >= 80 ? "emerald" : "lime"}>{g.status}</Badge>
                <button
                  onClick={() => deleteGoal(g.id)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Target: {g.deadline}</span>
                <span className="font-mono font-bold text-[#06383A]">{g.progress}% Completed</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={g.progress}
                onChange={(e) => updateProgress(g.id, parseInt(e.target.value))}
                className="w-full accent-[#06383A] cursor-pointer"
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Add Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl border border-[#06383A]/10 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-[#06383A]">Set New Academic Goal</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#06383A] font-bold block">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Graph Theory by Midterms"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#F2F5EE] border border-[#06383A]/10 rounded-xl px-4 py-2.5 text-sm text-[#06383A] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#06383A] font-bold block">
                  Target Deadline
                </label>
                <input
                  type="text"
                  placeholder="e.g. November 30, 2026"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full bg-[#F2F5EE] border border-[#06383A]/10 rounded-xl px-4 py-2.5 text-sm text-[#06383A] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="dark" size="sm" type="submit">
                  Save Goal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
