"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Sparkles,
  Plus,
  Calendar,
  Smile,
  TrendingUp,
  Clock,
  Award,
  Zap,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Layers,
  ChevronRight,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { API_BASE_URL } from "@/lib/apiClient";
import Link from "next/link";

interface DiaryEntry {
  _id?: string;
  id?: string;
  reflectionText: string;
  subject: string;
  studyHours: number;
  mood: string;
  sentiment: string;
  summary: string;
  aiInsight: string;
  actionableTip?: string;
  keyConceptsReviewed?: string[];
  focusScore?: number;
  createdAt: string;
}

const SUBJECT_OPTIONS = [
  "Distributed Systems",
  "Database Management Systems",
  "Data Structures & Algorithms",
  "Operating Systems",
  "Artificial Intelligence & ML",
];

const MOOD_OPTIONS = [
  { label: "High Focus", emoji: "⚡" },
  { label: "Breakthrough", emoji: "💡" },
  { label: "Moderate Struggle", emoji: "🧩" },
  { label: "Fatigued", emoji: "☕" },
];

export default function DiaryPage() {
  const [reflectionText, setReflectionText] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Distributed Systems");
  const [studyHours, setStudyHours] = useState(3.5);
  const [selectedMood, setSelectedMood] = useState("High Focus");
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<DiaryEntry | null>(null);

  useEffect(() => {
    fetchDiaryEntries();
  }, []);

  const fetchDiaryEntries = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("synexora_token") : null;
      const res = await fetch(`${API_BASE_URL}/diary`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error("Failed to load diary entries:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReflection = async () => {
    if (!reflectionText.trim()) return;
    setIsSaving(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("synexora_token") : null;
      const res = await fetch(`${API_BASE_URL}/diary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          reflectionText,
          subject: selectedSubject,
          studyHours,
          mood: selectedMood,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLatestAnalysis(data.entry);
        setEntries((prev) => [data.entry, ...prev]);
        setReflectionText("");
      }
    } catch (err) {
      console.error("Save reflection error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (id?: string) => {
    if (!id) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("synexora_token") : null;
      await fetch(`${API_BASE_URL}/diary/${id}`, {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      setEntries((prev) => prev.filter((e) => (e._id || e.id) !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime" pulse>Phase 9 Metacognitive Engine</Badge>
            <span className="text-xs text-gray-500 font-mono font-medium">Daily AI Study Reflection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#06383A] tracking-tight">
            AI Academic Reflection Diary
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Log your daily learning reflections to track cognitive focus, emotional sentiment, and receive proactive study tips.
          </p>
        </div>
      </div>

      {/* New Reflection Logger Card */}
      <Card variant="light" className="p-6 sm:p-8 space-y-5 bg-white/90 border border-gray-200/90 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#06383A] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#06383A]" />
            Record Today's Study Reflection
          </h3>
          <span className="text-xs text-gray-400 font-mono">
            {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>

        {/* Form Controls: Subject & Study Hours & Mood */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Subject Focus</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 font-medium text-[#06383A] outline-none"
            >
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">
              Study Duration: <span className="font-mono font-bold text-[#06383A]">{studyHours} hrs</span>
            </label>
            <input
              type="range"
              min={0.5}
              max={10}
              step={0.5}
              value={studyHours}
              onChange={(e) => setStudyHours(Number(e.target.value))}
              className="w-full accent-[#06383A] mt-2"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Session Feeling / Mood</label>
            <div className="grid grid-cols-2 gap-1.5">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => setSelectedMood(m.label)}
                  className={`px-2 py-1.5 rounded-xl border text-[11px] font-bold text-center transition-all flex items-center justify-center gap-1 ${
                    selectedMood === m.label
                      ? "bg-[#06383A] text-white border-[#06383A]"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reflection Text Area */}
        <div className="space-y-1.5">
          <textarea
            rows={4}
            placeholder="What concepts clicked today? What problems or proofs felt challenging? Where did you experience cognitive friction?..."
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl p-4 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#06383A] focus:bg-white transition-all leading-relaxed"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
          <span className="text-[11px] text-gray-500">
            Synexora AI analyzes diary entries for focus, sentiment trends, and cognitive blockers.
          </span>
          <Button
            variant="primary"
            size="md"
            disabled={!reflectionText.trim() || isSaving}
            onClick={handleSaveReflection}
            icon={<Sparkles className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            {isSaving ? "Synthesizing Metacognitive Insights..." : "Save Reflection & Synthesize Insights"}
          </Button>
        </div>

        {/* Immediate AI Synthesis Card */}
        {latestAnalysis && (
          <div className="p-5 rounded-2xl bg-[#06383A] text-white space-y-3 animate-in fade-in slide-in-from-top-2 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B7F34A]" />
                <span className="font-bold text-xs font-mono text-[#B7F34A] uppercase tracking-wider">
                  AI Metacognitive Synthesis
                </span>
              </div>
              <Badge variant="lime">{latestAnalysis.sentiment}</Badge>
            </div>

            <p className="text-xs sm:text-sm text-gray-100 leading-relaxed">
              {latestAnalysis.aiInsight}
            </p>

            {latestAnalysis.actionableTip && (
              <div className="p-3 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-gray-200">
                  <Lightbulb className="w-4 h-4 text-[#B7F34A] shrink-0" />
                  <span><strong className="text-white">Next Step:</strong> {latestAnalysis.actionableTip}</span>
                </div>
                <Link href="/app/practice">
                  <Button variant="outline" size="sm" className="!text-[#06383A] !bg-[#B7F34A] !border-[#B7F34A] whitespace-nowrap">
                    Take Action
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Diary Entries History Feed */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#06383A] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          Reflection Journal History ({entries.length})
        </h2>

        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-gray-400">
            Loading reflection journal...
          </div>
        ) : entries.length === 0 ? (
          <Card variant="light" className="p-8 text-center text-gray-500 text-xs">
            No reflection entries logged yet. Record your first study reflection above!
          </Card>
        ) : (
          entries.map((entry, idx) => {
            const entryId = entry._id || entry.id || `entry-${idx}`;
            const dateStr = entry.createdAt
              ? new Date(entry.createdAt).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recent Reflection";

            let sentimentVariant: "lime" | "emerald" | "amber" | "gray" = "lime";
            if (entry.sentiment === "Moderate Struggle" || entry.sentiment === "Fatigued") {
              sentimentVariant = "amber";
            }

            return (
              <Card
                key={entryId}
                variant="light"
                className="p-6 space-y-4 hover:shadow-md transition-all border border-gray-200/90"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-sm text-[#06383A]">{dateStr}</span>
                    <span className="text-xs font-mono font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {entry.subject}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Badge variant="gray">{entry.studyHours} hrs logged</Badge>
                    <Badge variant={sentimentVariant}>{entry.sentiment || entry.mood}</Badge>
                    <button
                      onClick={() => handleDeleteEntry(entryId)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                  {entry.reflectionText || entry.summary}
                </p>

                {/* Synexora AI Synthesis Box */}
                {entry.aiInsight && (
                  <div className="p-4 rounded-xl bg-[#06383A] text-white text-xs space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[#B7F34A] font-bold flex items-center gap-1.5 font-mono uppercase text-[11px]">
                        <Sparkles className="w-3.5 h-3.5" /> Synexora AI Metacognitive Insight:
                      </span>
                      {entry.focusScore && (
                        <span className="text-xs font-mono text-gray-300 font-bold">
                          Focus Score: {entry.focusScore}/100
                        </span>
                      )}
                    </div>
                    <p className="text-gray-200 leading-relaxed">{entry.aiInsight}</p>

                    {entry.actionableTip && (
                      <div className="pt-2 border-t border-white/10 text-[11px] text-[#B7F34A]">
                        <strong>Action Recommendation:</strong> {entry.actionableTip}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
