"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import MetricTile from "@/components/ui/MetricTile";
import CandidateActionCard from "@/components/ui/CandidateActionCard";

export default function StudentDashboardCockpit() {
  const [promptInput, setPromptInput] = useState("");

  const quickPrompts = [
    "Deconstruct Dijkstra's algorithm vs Bellman-Ford",
    "Generate 5 diagnostic practice questions on BCNF decomposition",
    "Summarize key takeaways from Lecture 8 slides",
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Student Hero Welcome & Daily Mission */}
      <div className="relative bg-[#06383A] text-white rounded-[32px] p-6 sm:p-10 border border-white/10 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-[450px] h-[300px] bg-radial-gradient from-[#B7F34A]/20 via-[#8FD63A]/10 to-transparent blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#B7F34A] font-bold">
                Student Cockpit • Fall Semester 2026
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Good morning, Alex.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              You have <strong className="text-white font-semibold">2 focus study blocks</strong> and <strong className="text-[#B7F34A] font-semibold">1 critical deadline</strong> scheduled today. Your academic mastery improved by 4% this week.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/app/tutor">
              <Button variant="primary" size="md" icon={<Sparkles className="w-4 h-4 text-[#06383A]" />}>
                Launch AI Tutor
              </Button>
            </Link>
            <Link href="/app/practice">
              <Button variant="outline" size="md" className="text-white border-white/20 hover:bg-white/10">
                Start Practice
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Controlled Memory Live Candidate Action Card */}
      <CandidateActionCard
        category="Academic Performance"
        title="DBMS Midterm Score: 72/100"
        value="Target: 85%+ in Final Exam. AI will tailor B-Tree and Normalization practice."
        sourceContext="Detected during your conversation with AI Tutor"
      />

      {/* 3. Four Key Academic KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricTile
          label="Subject Mastery"
          value="84%"
          change="+4.2%"
          sublabel="Across 4 enrolled courses"
          icon={<GraduationCap className="w-5 h-5 text-[#06383A]" />}
          theme="lime"
        />
        <MetricTile
          label="Study Streak"
          value="14 Days"
          change="Top 5%"
          sublabel="Personal record: 21 days"
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          theme="light"
        />
        <MetricTile
          label="Task Velocity"
          value="18/24"
          change="75%"
          sublabel="6 tasks remaining this week"
          icon={<CheckSquare className="w-5 h-5 text-[#8FD63A]" />}
          theme="light"
        />
        <MetricTile
          label="Focus Time"
          value="28.5h"
          change="On Track"
          sublabel="Weekly target: 30 hours"
          icon={<Clock className="w-5 h-5 text-[#B7F34A]" />}
          theme="dark"
        />
      </div>

      {/* 4. Socratic AI Quick Prompt Bar */}
      <Card variant="light" className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#06383A] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#8FD63A]" />
            Ask Synexora Socratic Tutor
          </span>
          <span className="text-xs text-gray-400 font-mono">Grounded across 1,420 course pages</span>
        </div>

        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Ask a doubt, request a step-by-step concept breakdown, or generate practice..."
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

      {/* 5. Dual Grid: Upcoming Deadlines & Adaptive Learning Path */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Deadlines & Calendar Radar */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#06383A] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#8FD63A]" />
              Deadlines & Exam Radar
            </h3>
            <Link href="/app/calendar" className="text-xs font-bold text-[#06383A] hover:text-[#8FD63A] flex items-center gap-1">
              <span>Full Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 border border-red-500/20 shadow-sm flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="amber" pulse>Due in 2 Days</Badge>
                  <span className="text-xs font-mono text-gray-400">CS301</span>
                </div>
                <div className="font-bold text-sm text-[#06383A]">Distributed Systems Project Submission</div>
                <div className="text-xs text-gray-500">Milestone: Raft Consensus Implementation Draft</div>
              </div>
              <CheckSquare className="w-5 h-5 text-gray-300 hover:text-emerald-500 cursor-pointer transition-colors shrink-0 mt-1" />
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#06383A]/10 shadow-sm flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="gray">In 5 Days</Badge>
                  <span className="text-xs font-mono text-gray-400">CS220</span>
                </div>
                <div className="font-bold text-sm text-[#06383A]">DBMS Midterm Assessment</div>
                <div className="text-xs text-gray-500">Target score: 85%+ • 3 Practice Quizzes remaining</div>
              </div>
              <CheckSquare className="w-5 h-5 text-gray-300 hover:text-emerald-500 cursor-pointer transition-colors shrink-0 mt-1" />
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#06383A]/10 shadow-sm flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="gray">Next Week</Badge>
                  <span className="text-xs font-mono text-gray-400">CS240</span>
                </div>
                <div className="font-bold text-sm text-[#06383A]">Graph Algorithms Lab Report</div>
                <div className="text-xs text-gray-500">Shortest path benchmark analysis</div>
              </div>
              <CheckSquare className="w-5 h-5 text-gray-300 hover:text-emerald-500 cursor-pointer transition-colors shrink-0 mt-1" />
            </div>
          </div>
        </div>

        {/* Right: Active Adaptive Learning Path */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#06383A] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8FD63A]" />
              Active Adaptive Learning Trajectory
            </h3>
            <Link href="/app/learning-path" className="text-xs font-bold text-[#06383A] hover:text-[#8FD63A] flex items-center gap-1">
              <span>View Trajectory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#06383A]/10 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[#8FD63A] uppercase">Active Path</span>
                <h4 className="text-base font-extrabold text-[#06383A]">Advanced Database Query Optimization</h4>
              </div>
              <span className="text-sm font-black font-mono text-[#06383A]">68% Mastered</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-[#B7F34A] rounded-full" style={{ width: "68%" }} />
            </div>

            {/* Steps in path */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F2F5EE] border border-[#06383A]/5">
                <span className="flex items-center gap-2 font-semibold text-[#06383A]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  1. B-Tree vs Hash Index Storage
                </span>
                <span className="text-emerald-600 font-bold">Done</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#B7F34A]/15 border border-[#B7F34A]/30">
                <span className="flex items-center gap-2 font-bold text-[#06383A]">
                  <span className="w-2 h-2 rounded-full bg-[#06383A] animate-pulse" />
                  2. Cost-Based Query Execution Plans
                </span>
                <span className="text-[#06383A] font-bold">In Progress</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 opacity-60">
                <span className="text-gray-600">3. Concurrency Control & Strict 2PL</span>
                <span className="text-gray-400">Upcoming</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
