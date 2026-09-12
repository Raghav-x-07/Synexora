"use client";

import React, { useState, useEffect } from "react";
import { Target, Plus, CheckCircle2, Trash2, X, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { apiRequest } from "@/lib/apiClient";

interface GoalItem {
  id?: string;
  _id?: string;
  title: string;
  deadline?: string;
  targetDate?: string;
  progress?: number;
  progressPercentage?: number;
  status?: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDeadline, setNewDeadline] = useState("");

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest<GoalItem[]>("/goals");
      setGoals(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load goals");
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const getGoalId = (g: GoalItem) => g.id || g._id || "";
  const getProgress = (g: GoalItem) => g.progressPercentage ?? g.progress ?? 0;

  const updateProgress = async (goal: GoalItem, newProgress: number) => {
    const id = getGoalId(goal);
    setGoals(goals.map((g) => (getGoalId(g) === id ? { ...g, progress: newProgress, progressPercentage: newProgress } : g)));

    try {
      await apiRequest(`/goals/${id}`, {
        method: "PUT",
        body: JSON.stringify({ progressPercentage: newProgress }),
      });
    } catch (err) {
      // Revert if error
      fetchGoals();
    }
  };

  const deleteGoal = async (goal: GoalItem) => {
    const id = getGoalId(goal);
    setGoals(goals.filter((g) => getGoalId(g) !== id));

    try {
      await apiRequest(`/goals/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      fetchGoals();
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await apiRequest<GoalItem>("/goals", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle,
          deadline: newDeadline || "Ongoing",
          progressPercentage: 0,
          status: "In Progress",
        }),
      });

      setGoals([created, ...goals]);
      setNewTitle("");
      setNewDeadline("");
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to create goal");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime">Academic Aspirations</Badge>
            <span className="text-xs text-gray-500 font-mono">{goals.length} Goals Active</span>
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

      {/* Loading State */}
      {loading && (
        <div className="py-12 text-center text-gray-500 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#06383A]" />
          <span className="text-sm font-medium">Loading your goals...</span>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchGoals}>Retry</Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && goals.length === 0 && (
        <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-white/50 p-8 space-y-3">
          <Target className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-bold text-base text-[#06383A]">No goals established yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Define your semester targets, GPA objectives, or milestone targets to track continuous progress.
          </p>
          <Button
            variant="dark"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5 text-[#B7F34A]" />}
          >
            Create Your First Goal
          </Button>
        </div>
      )}

      {/* Goals List */}
      {!loading && !error && goals.length > 0 && (
        <div className="space-y-4">
          {goals.map((g) => {
            const id = getGoalId(g);
            const progressVal = getProgress(g);
            const deadlineText = g.deadline || g.targetDate || "Ongoing";
            const statusText = g.status || (progressVal >= 100 ? "Completed" : progressVal >= 80 ? "Ahead" : "On Track");

            return (
              <Card key={id} variant="light" className="p-6 space-y-4 hover:border-[#06383A]/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base text-[#06383A]">{g.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={progressVal >= 80 ? "emerald" : "lime"}>{statusText}</Badge>
                    <button
                      onClick={() => deleteGoal(g)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Target: {deadlineText}</span>
                    <span className="font-mono font-bold text-[#06383A]">{progressVal}% Completed</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressVal}
                    onChange={(e) => updateProgress(g, parseInt(e.target.value))}
                    className="w-full accent-[#06383A] cursor-pointer"
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

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

