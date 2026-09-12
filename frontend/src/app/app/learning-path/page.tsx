"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Award,
  Clock,
  BookOpen,
  Target,
  RefreshCw,
  Plus,
  PlayCircle,
  Lock,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  CheckSquare,
  BarChart3,
  X,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { API_BASE_URL } from "@/lib/apiClient";
import Link from "next/link";

interface Milestone {
  id: string;
  order: number;
  title: string;
  description: string;
  status: "COMPLETED" | "IN_PROGRESS" | "UPCOMING" | "LOCKED";
  estimatedHours: number;
  masteryScore: number;
  concepts: string[];
  recommendedPractice: string;
}

interface LearningPath {
  _id: string;
  title: string;
  subject: string;
  goal: string;
  targetGrade: string;
  estimatedWeeks: number;
  weeklyHours: number;
  totalMilestones: number;
  completedMilestones: number;
  progressPercentage: number;
  milestones: Milestone[];
}

export default function LearningPathPage() {
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(null);

  // Generate Path Modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [subject, setSubject] = useState("Database Management Systems");
  const [goal, setGoal] = useState("Score 90%+ on Midterm Exam");
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchLearningPath();
  }, []);

  const fetchLearningPath = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("synexora_token") : null;
      const res = await fetch(`${API_BASE_URL}/learning-path`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setLearningPath(data);
        if (data.milestones && data.milestones.length > 0) {
          const active = data.milestones.find((m: Milestone) => m.status === "IN_PROGRESS") || data.milestones[0];
          setExpandedMilestoneId(active.id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch learning path:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePath = async () => {
    setIsGenerating(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("synexora_token") : null;
      const res = await fetch(`${API_BASE_URL}/learning-path/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject,
          goal,
          weeklyHours,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLearningPath(data.learningPath);
        setShowGenerateModal(false);
        if (data.learningPath.milestones && data.learningPath.milestones.length > 0) {
          setExpandedMilestoneId(data.learningPath.milestones[0].id);
        }
      }
    } catch (err) {
      console.error("Generate learning path error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleMilestoneStatus = async (mId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED";
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("synexora_token") : null;
      const res = await fetch(`${API_BASE_URL}/learning-path/milestone/${mId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: nextStatus,
          masteryScore: nextStatus === "COMPLETED" ? 95 : 60,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLearningPath(data.learningPath);
      }
    } catch (err) {
      console.error("Update milestone error:", err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime" pulse>Phase 8 Adaptive Engine</Badge>
            <span className="text-xs text-gray-500 font-mono font-medium">Dynamic Trajectory Synthesizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#06383A] tracking-tight">
            Adaptive Learning Trajectory
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Personalized concept roadmap automatically calibrated to your assessment scores and deadlines.
          </p>
        </div>

        <Button
          variant="dark"
          size="sm"
          onClick={() => setShowGenerateModal(true)}
          icon={<Sparkles className="w-4 h-4 text-[#B7F34A]" />}
        >
          Generate New Roadmap
        </Button>
      </div>

      {loading ? (
        <Card variant="light" className="p-12 text-center flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#06383A] animate-spin" />
          <p className="text-xs font-mono font-bold text-[#06383A]">Synthesizing optimal prerequisite graph...</p>
        </Card>
      ) : learningPath ? (
        <>
          {/* Active Roadmap Overview Card */}
          <Card variant="light" className="p-6 sm:p-8 space-y-6 bg-white/90 border border-gray-200/90 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-[#06383A] bg-[#B7F34A]/30 px-2.5 py-1 rounded-lg">
                  {learningPath.subject}
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#06383A] mt-2">
                  {learningPath.title}
                </h2>
                <p className="text-xs text-gray-600 mt-1">
                  Goal: <span className="font-semibold text-gray-900">{learningPath.goal}</span> • Target: <span className="font-semibold text-gray-900">{learningPath.targetGrade}</span>
                </p>
              </div>

              {/* Progress Ring / Percentage Pill */}
              <div className="bg-[#06383A] text-white p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-md">
                <div>
                  <span className="text-[10px] uppercase font-mono text-gray-300 block font-bold">Overall Progress</span>
                  <div className="text-2xl font-black font-mono text-[#B7F34A]">
                    {learningPath.progressPercentage}%
                  </div>
                  <span className="text-[11px] text-gray-300 font-mono">
                    {learningPath.completedMilestones}/{learningPath.totalMilestones} Milestones
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-[#B7F34A] flex items-center justify-center font-mono font-bold text-xs">
                  {learningPath.progressPercentage}%
                </div>
              </div>
            </div>

            {/* Trajectory Milestone Timeline */}
            <div className="relative border-l-2 border-[#06383A]/15 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8 pt-2">
              {learningPath.milestones.map((m) => {
                const isCompleted = m.status === "COMPLETED";
                const isActive = m.status === "IN_PROGRESS";
                const isUpcoming = m.status === "UPCOMING";
                const isLocked = m.status === "LOCKED";
                const isExpanded = expandedMilestoneId === m.id;

                let nodeColor = "bg-gray-300 border-gray-400";
                if (isCompleted) nodeColor = "bg-emerald-600 border-emerald-700 text-white";
                else if (isActive) nodeColor = "bg-[#06383A] border-[#B7F34A] text-[#B7F34A] animate-pulse";
                else if (isUpcoming) nodeColor = "bg-amber-400 border-amber-500 text-white";

                return (
                  <div key={m.id} className="relative space-y-2 group">
                    {/* Node Dot Icon */}
                    <div
                      className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-sm transition-all ${nodeColor}`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      ) : isLocked ? (
                        <Lock className="w-3 h-3 text-gray-500" />
                      ) : (
                        <span className="text-[10px] font-mono font-bold">{m.order}</span>
                      )}
                    </div>

                    {/* Milestone Card Header */}
                    <div
                      onClick={() => setExpandedMilestoneId(isExpanded ? null : m.id)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isActive
                          ? "bg-emerald-50/50 border-emerald-200 shadow-sm"
                          : isCompleted
                          ? "bg-gray-50/80 border-gray-200"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm sm:text-base text-[#06383A]">
                            {m.title}
                          </span>
                          <Badge
                            variant={
                              isCompleted ? "emerald" : isActive ? "lime" : isUpcoming ? "amber" : "gray"
                            }
                          >
                            {m.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed max-w-xl">
                          {m.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="hidden sm:block text-right">
                          <span className="text-[10px] font-mono uppercase text-gray-400 block font-bold">Estimated</span>
                          <span className="text-xs font-mono font-bold text-[#06383A]">{m.estimatedHours} hrs</span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Milestone Deep-Dive Details */}
                    {isExpanded && (
                      <div className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-1 text-xs">
                        {/* Concept Checklist */}
                        <div>
                          <span className="font-mono font-bold uppercase text-gray-400 block mb-2">
                            Key Concept Competencies:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {m.concepts.map((c, cIdx) => (
                              <div
                                key={cIdx}
                                className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100"
                              >
                                <CheckSquare className={`w-3.5 h-3.5 ${isCompleted ? "text-emerald-600" : "text-gray-400"}`} />
                                <span className="font-medium text-gray-800">{c}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons: Practice, Tutor, Toggle */}
                        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Link href="/app/practice">
                              <Button
                                variant="dark"
                                size="sm"
                                icon={<Target className="w-3.5 h-3.5 text-[#B7F34A]" />}
                              >
                                Practice Subtopic
                              </Button>
                            </Link>

                            <Link href="/app/tutor">
                              <Button
                                variant="outline"
                                size="sm"
                                icon={<MessageSquare className="w-3.5 h-3.5" />}
                              >
                                Ask AI Tutor
                              </Button>
                            </Link>
                          </div>

                          <Button
                            variant={isCompleted ? "outline" : "primary"}
                            size="sm"
                            onClick={() => handleToggleMilestoneStatus(m.id, m.status)}
                          >
                            {isCompleted ? "Mark Incomplete" : "Mark Milestone Complete"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      ) : null}

      {/* Generate Custom Learning Path Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <Card variant="light" className="max-w-md w-full p-6 space-y-5 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#06383A]" />
                <h3 className="font-extrabold text-base text-[#06383A]">Synthesize Learning Trajectory</h3>
              </div>
              <button onClick={() => setShowGenerateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Select Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 font-medium text-[#06383A] outline-none"
                >
                  <option value="Database Management Systems">Database Management Systems</option>
                  <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                  <option value="Operating Systems">Operating Systems & Concurrency</option>
                  <option value="Distributed Systems">Distributed Systems & Consensus</option>
                  <option value="Artificial Intelligence & ML">Artificial Intelligence & Deep Learning</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Target Academic Goal</label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Score 90%+ on Midterm Exam"
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 font-medium text-[#06383A] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Weekly Study Hours Budget: <span className="font-mono font-bold text-[#06383A]">{weeklyHours} hrs/wk</span>
                </label>
                <input
                  type="range"
                  min={4}
                  max={30}
                  step={2}
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full accent-[#06383A]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowGenerateModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isGenerating}
                onClick={handleGeneratePath}
                icon={<Sparkles className="w-4 h-4" />}
              >
                {isGenerating ? "Synthesizing Path..." : "Generate Roadmap"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
