"use client";

import React, { useState } from "react";
import { BookOpen, Sparkles, Plus, Calendar, Smile, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function DiaryPage() {
  const [reflectionText, setReflectionText] = useState("");

  const entries = [
    {
      date: "September 09, 2026",
      hours: "4.5 hrs",
      sentiment: "High Focus",
      summary: "Understood Raft leader election and log replication. Solved 4 practice problems with Synexora AI tutor without mistakes.",
      aiInsight: "Key insight: Raft consensus mastery is now solid at 92%. Ready to tackle network partitions.",
    },
    {
      date: "September 08, 2026",
      hours: "3.2 hrs",
      sentiment: "Moderate Struggle",
      summary: "DBMS Midterm exam completed. Scored 72. Found functional dependency decompositions difficult under time pressure.",
      aiInsight: "Action taken: Synexora automatically generated BCNF diagnostic matrix exercises.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime">Metacognitive Reflection</Badge>
            <span className="text-xs text-gray-500 font-mono">Weekly Insights Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#06383A] tracking-tight">
            AI Academic Reflection Diary
          </h1>
        </div>
      </div>

      {/* New Reflection Input Box */}
      <Card variant="light" className="p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#06383A] flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#8FD63A]" />
          Record Today's Study Reflection
        </h3>
        <textarea
          rows={3}
          placeholder="What did you learn today? What felt easy, and where did you struggle?..."
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          className="w-full bg-[#F2F5EE] border border-[#06383A]/10 rounded-2xl p-4 text-xs sm:text-sm text-[#06383A] placeholder-[#06383A]/40 focus:outline-none focus:border-[#06383A]/40"
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Synexora AI analyzes diary entries for focus and weakness trends.</span>
          <Button variant="dark" size="sm" icon={<Sparkles className="w-3.5 h-3.5 text-[#B7F34A]" />}>
            Save Reflection & Synthesize Insights
          </Button>
        </div>
      </Card>

      {/* Diary Entries Feed */}
      <div className="space-y-4">
        {entries.map((entry, idx) => (
          <Card key={idx} variant="light" className="p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="font-bold text-sm text-[#06383A]">{entry.date}</span>
              <div className="flex items-center gap-2">
                <Badge variant="gray">{entry.hours}</Badge>
                <Badge variant="lime">{entry.sentiment}</Badge>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#06383A]/80 leading-relaxed font-normal">{entry.summary}</p>
            <div className="p-3 rounded-xl bg-[#06383A] text-white text-xs space-y-1">
              <span className="text-[#B7F34A] font-bold block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Synexora AI Synthesis:
              </span>
              <span className="text-slate-200">{entry.aiInsight}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
