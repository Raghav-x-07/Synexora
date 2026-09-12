"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Sparkles,
  Flame,
  BrainCircuit,
  GraduationCap,
  Calendar,
  CheckSquare,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  Layers,
  Target,
  Send,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import MetricTile from "@/components/ui/MetricTile";
import { apiRequest } from "@/lib/apiClient";

interface DashboardData {
  masteryScore?: number;
  studyStreakDays?: number;
  totalTasks?: number;
  completedTasks?: number;
  pendingTasks?: number;
  totalNotes?: number;
  totalMemories?: number;
  activeGoals?: number;
  upcomingDeadlines?: Array<{
    id: string;
    title: string;
    course?: string;
    dueDate?: string;
    priority?: string;
  }>;
}

export default function StudentDashboardCockpit() {
  const { user } = useAuth();
  const [promptInput, setPromptInput] = useState("");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<DashboardData>("/dashboard/summary")
      .then((data) => setDashboardData(data))
      .catch(() => {
        setDashboardData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const quickPrompts = [
    "Deconstruct Dijkstra's algorithm vs Bellman-Ford",
    "Generate 5 diagnostic practice questions on BCNF decomposition",
    "Summarize key takeaways from Lecture 8 slides",
  ];

  const studentFirstName = user?.fullName ? user.fullName.split(" ")[0] : "Student";
  const streakDays = dashboardData?.studyStreakDays ?? user?.studyStreakDays ?? 0;
  const mastery = dashboardData?.masteryScore ?? user?.masteryScore ?? 0;
  const completedTasks = dashboardData?.completedTasks ?? 0;
  const totalTasks = dashboardData?.totalTasks ?? 0;
  const deadlines = dashboardData?.upcomingDeadlines ?? [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Student Hero Welcome */}
      <div className="relative bg-[#06383A] text-white rounded-[32px] p-6 sm:p-10 border border-white/10 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-[450px] h-[300px] bg-radial-gradient from-[#B7F34A]/20 via-[#8FD63A]/10 to-transparent blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#B7F34A] font-bold">
                Student Cockpit • Synexora OS
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Good day, {studentFirstName}.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {deadlines.length > 0 ? (
                <>
                  You have <strong className="text-white font-semibold">{deadlines.length} upcoming deadlines</strong> scheduled. Your current study streak is <strong className="text-[#B7F34A] font-semibold">{streakDays} days</strong>.
                </>
              ) : (
                <>
                  Welcome to your workspace. Start by adding tasks, setting academic goals, or exploring study materials with the AI Tutor.
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/app/tutor">
              <Button variant="primary" size="md" icon={<Sparkles className="w-4 h-4 text-[#06383A]" />}>
                Launch AI Tutor
              </Button>
            </Link>
            <Link href="/app/tasks">
              <Button variant="outline" size="md" className="text-white border-white/20 hover:bg-white/10">
                View Tasks
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Four Key Academic KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricTile
          label="Subject Mastery"
          value={`${mastery}%`}
          change={mastery > 0 ? "Tracking" : "Baseline"}
          sublabel="Across enrolled courses"
          icon={<GraduationCap className="w-5 h-5 text-[#06383A]" />}
          theme="lime"
        />
        <MetricTile
          label="Study Streak"
          value={`${streakDays} Days`}
          change={streakDays > 0 ? "Active" : "Start today"}
          sublabel="Consistent daily focus"
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          theme="light"
        />
        <MetricTile
          label="Task Velocity"
          value={`${completedTasks}/${totalTasks}`}
          change={totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : "0%"}
          sublabel={`${totalTasks - completedTasks} tasks remaining`}
          icon={<CheckSquare className="w-5 h-5 text-[#8FD63A]" />}
          theme="light"
        />
        <MetricTile
          label="Active Goals"
          value={`${dashboardData?.activeGoals ?? 0}`}
          change="Goals set"
          sublabel="Target milestones"
          icon={<Target className="w-5 h-5 text-[#B7F34A]" />}
          theme="dark"
        />
      </div>

      {/* 3. Socratic AI Quick Prompt Bar */}
      <Card variant="light" className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#06383A] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#8FD63A]" />
            Ask Synexora AI Tutor
          </span>
          <span className="text-xs text-gray-400 font-mono">Interactive Socratic Learning</span>
        </div>

        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Ask a doubt, request a step-by-step concept breakdown, or explore a topic..."
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            className="w-full bg-[#F2F5EE] border border-[#06383A]/10 rounded-2xl px-4 py-3 text-sm text-[#06383A] placeholder-[#06383A]/40 focus:outline-none focus:border-[#06383A]/40 pr-12 font-medium"
          />
          <Link href="/app/tutor">
            <button className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-[#06383A] flex items-center justify-center text-[#B7F34A] hover:bg-[#08484B] transition-colors">
              <Send className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">Quick suggestions:</span>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => setPromptInput(qp)}
              className="text-xs px-3 py-1 rounded-lg bg-[#06383A]/5 hover:bg-[#B7F34A]/30 text-[#06383A] font-medium transition-colors text-left"
            >
              {qp}
            </button>
          ))}
        </div>
      </Card>

      {/* 4. Dual Grid: Upcoming Deadlines & Quick Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Deadlines Radar */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#06383A] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#8FD63A]" />
              Deadlines & Upcoming Tasks
            </h3>
            <Link href="/app/tasks" className="text-xs font-bold text-[#06383A] hover:text-[#8FD63A] flex items-center gap-1">
              <span>All Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {deadlines.length > 0 ? (
              deadlines.map((dl) => (
                <div key={dl.id} className="bg-white rounded-2xl p-4 border border-[#06383A]/10 shadow-sm flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={dl.priority === "HIGH" ? "amber" : "gray"}>Due: {dl.dueDate || "Upcoming"}</Badge>
                      {dl.course && <span className="text-xs font-mono text-gray-400">{dl.course}</span>}
                    </div>
                    <div className="font-bold text-sm text-[#06383A]">{dl.title}</div>
                  </div>
                  <Link href="/app/tasks">
                    <CheckSquare className="w-5 h-5 text-gray-300 hover:text-emerald-500 cursor-pointer transition-colors shrink-0 mt-1" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-[#06383A]/10 shadow-sm text-center space-y-2">
                <CheckSquare className="w-8 h-8 text-gray-300 mx-auto" />
                <div className="text-sm font-bold text-[#06383A]">No upcoming deadlines</div>
                <div className="text-xs text-gray-500">You are all caught up! Add a new task in Tasks & Deadlines.</div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Features Navigation */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#06383A] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8FD63A]" />
              Quick Access Hub
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/app/notes" className="p-4 rounded-2xl bg-white border border-[#06383A]/10 hover:border-[#06383A]/30 transition-all space-y-2">
              <FileText className="w-5 h-5 text-[#8FD63A]" />
              <div className="font-bold text-sm text-[#06383A]">Course Notes</div>
              <p className="text-xs text-gray-500">Capture, summarize, and review your notes.</p>
            </Link>

            <Link href="/app/goals" className="p-4 rounded-2xl bg-white border border-[#06383A]/10 hover:border-[#06383A]/30 transition-all space-y-2">
              <Target className="w-5 h-5 text-[#8FD63A]" />
              <div className="font-bold text-sm text-[#06383A]">Academic Goals</div>
              <p className="text-xs text-gray-500">Track milestones and semester objectives.</p>
            </Link>

            <Link href="/app/calendar" className="p-4 rounded-2xl bg-white border border-[#06383A]/10 hover:border-[#06383A]/30 transition-all space-y-2">
              <Calendar className="w-5 h-5 text-[#8FD63A]" />
              <div className="font-bold text-sm text-[#06383A]">Adaptive Calendar</div>
              <p className="text-xs text-gray-500">Schedule your study slots and deadlines.</p>
            </Link>

            <Link href="/app/tutor" className="p-4 rounded-2xl bg-white border border-[#06383A]/10 hover:border-[#06383A]/30 transition-all space-y-2">
              <Sparkles className="w-5 h-5 text-[#8FD63A]" />
              <div className="font-bold text-sm text-[#06383A]">AI Socratic Tutor</div>
              <p className="text-xs text-gray-500">Interactive guidance and concept drills.</p>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}

