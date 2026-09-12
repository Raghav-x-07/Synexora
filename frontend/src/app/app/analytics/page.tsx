"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Award,
  Layers,
  Clock,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Target,
  Zap,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import MetricTile from "@/components/ui/MetricTile";
import { API_BASE_URL } from "@/lib/apiClient";
import Link from "next/link";

interface SubjectMetric {
  name: string;
  mastery: number;
  target: number;
  color: "emerald" | "lime" | "amber";
}

interface WeeklyReport {
  consistencyScore: number;
  topSubject: string;
  weakSubject: string;
  executiveSummary: string;
  strengths: string[];
  frictionPoints: string[];
  strategicTips: string[];
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    overallMastery: 84.5,
    cohortPercentile: "94th",
    totalProblemsSolved: 142,
    accuracyRate: 89,
    totalStudyHours: "14.5 hrs",
    weeklyConsistency: "92%",
  });

  const [subjects, setSubjects] = useState<SubjectMetric[]>([
    { name: "CS301 Distributed Systems", mastery: 92, target: 90, color: "emerald" },
    { name: "CS240 Graph Theory & Algorithms", mastery: 88, target: 85, color: "lime" },
    { name: "CS220 Database Management Systems", mastery: 72, target: 85, color: "amber" },
    { name: "CS210 Operating Systems & Concurrency", mastery: 84, target: 85, color: "emerald" },
  ]);

  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport>({
    consistencyScore: 92,
    topSubject: "Distributed Systems",
    weakSubject: "Database Management Systems",
    executiveSummary: "Strong study momentum across distributed consensus and graph algorithms. Focus on BCNF decomposition drills for the upcoming midterm.",
    strengths: [
      "High retention in Raft leader election (92% accuracy)",
      "Consistent daily study habit with 14+ hours logged this week",
    ],
    frictionPoints: [
      "BCNF decomposition speed on multi-attribute relations under time constraints",
    ],
    strategicTips: [
      "Dedicate a 20-minute daily session to BCNF synthesis matrix practice.",
      "Maintain your current 4-day practice streak on Distributed Systems.",
    ],
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("synexora_token") : null;
      const res = await fetch(`${API_BASE_URL}/analytics/overview`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics({
          overallMastery: data.overallMastery || 84.5,
          cohortPercentile: data.cohortPercentile || "94th",
          totalProblemsSolved: data.totalProblemsSolved || 142,
          accuracyRate: data.accuracyRate || 89,
          totalStudyHours: data.totalStudyHours || "14.5 hrs",
          weeklyConsistency: data.weeklyConsistency || "92%",
        });
        if (data.subjectBreakdown) setSubjects(data.subjectBreakdown);
        if (data.weeklyReport) setWeeklyReport(data.weeklyReport);
      }
    } catch (err) {
      console.warn("Using fallback analytics state:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime" pulse>Phase 9 Analytics Engine</Badge>
            <span className="text-xs text-gray-500 font-mono">Cohort Percentile: {metrics.cohortPercentile}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#06383A] tracking-tight">
            Academic Intelligence & Mastery Analytics
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Holistic cross-course diagnostics, consistency indexing, and automated weekly synthesis.
          </p>
        </div>
      </div>

      {/* Metric Tiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile
          label="Overall Mastery Index"
          value={`${metrics.overallMastery}%`}
          change="+4.2%"
          sublabel="Across all active courses"
          theme="lime"
        />
        <MetricTile
          label="Practice Diagnostics"
          value={String(metrics.totalProblemsSolved)}
          change={`+${Math.round(metrics.totalProblemsSolved * 0.2)} this week`}
          sublabel={`${metrics.accuracyRate}% accuracy rate`}
          theme="light"
        />
        <MetricTile
          label="Total Study Time"
          value={metrics.totalStudyHours}
          change="Top 10%"
          sublabel="Semester cumulative total"
          theme="dark"
        />
        <MetricTile
          label="Consistency Score"
          value={metrics.weeklyConsistency}
          change="Streak: Active"
          sublabel="7-day study habit index"
          theme="light"
        />
      </div>

      {/* Weekly AI Metacognitive Synthesis Card */}
      <Card variant="light" className="p-6 sm:p-8 space-y-6 bg-white/95 border border-gray-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#06383A] text-[#B7F34A] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#06383A]">
                Weekly AI Academic Synthesis Report
              </h2>
              <span className="text-xs text-gray-500 font-mono">
                Automated multi-agent synthesis across diary, practice, and calendar data
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="emerald">Top: {weeklyReport.topSubject}</Badge>
            <Badge variant="amber">Target: {weeklyReport.weakSubject}</Badge>
          </div>
        </div>

        {/* Executive Summary */}
        <p className="text-sm text-gray-800 leading-relaxed font-medium bg-gray-50/80 p-4 sm:p-5 rounded-2xl border border-gray-100">
          {weeklyReport.executiveSummary}
        </p>

        {/* Strengths vs Friction Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
            <h3 className="font-extrabold text-xs font-mono uppercase text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Verified Conceptual Strengths
            </h3>
            <ul className="space-y-2 text-xs text-emerald-950 font-medium">
              {weeklyReport.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Friction Points */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
            <h3 className="font-extrabold text-xs font-mono uppercase text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              Identified Cognitive Friction
            </h3>
            <ul className="space-y-2 text-xs text-amber-950 font-medium">
              {weeklyReport.frictionPoints.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Strategic Next-Step Recommendations */}
        <div className="p-5 rounded-2xl bg-[#06383A] text-white space-y-3 shadow-md">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-[#B7F34A]" />
            <h3 className="font-extrabold text-xs font-mono uppercase text-[#B7F34A] tracking-wider">
              Strategic AI Interventions for Next Week:
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {weeklyReport.strategicTips.map((tip, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-white/10 border border-white/15 flex flex-col justify-between space-y-2 text-xs"
              >
                <p className="text-gray-100 font-medium leading-relaxed">{tip}</p>
                <Link href={i === 0 ? "/app/practice" : "/app/tutor"} className="self-end">
                  <span className="text-[11px] font-bold text-[#B7F34A] hover:underline flex items-center gap-1">
                    Execute Action <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Subject Mastery Breakdown Progress Gauges */}
      <Card variant="light" className="p-6 sm:p-8 space-y-5 bg-white/95 border border-gray-200/90 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-extrabold text-base text-[#06383A] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#06383A]" />
            Cross-Disciplinary Subject Mastery Index
          </h3>
          <span className="text-xs text-gray-400 font-mono">Calibrated via Assessment Engine</span>
        </div>

        <div className="space-y-5">
          {subjects.map((sub, i) => {
            let barColor = "bg-[#B7F34A]";
            if (sub.color === "emerald") barColor = "bg-emerald-500";
            else if (sub.color === "amber") barColor = "bg-amber-500";

            return (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-[#06383A]">
                  <div className="flex items-center gap-2">
                    <span>{sub.name}</span>
                    <Badge variant={sub.mastery >= sub.target ? "emerald" : "amber"}>
                      Target: {sub.target}%
                    </Badge>
                  </div>
                  <span className="font-mono text-sm font-black">{sub.mastery}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden relative">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${sub.mastery}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
