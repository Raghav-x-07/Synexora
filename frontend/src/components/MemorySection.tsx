"use client";

import React, { useState } from "react";
import { ShieldCheck, Sparkles, Check, Trash2, Edit3, Lock, Plus, CheckCircle2 } from "lucide-react";

export default function MemorySection() {
  const [savedMemories, setSavedMemories] = useState([
    {
      id: "mem-1",
      category: "Academic Metric",
      title: "DBMS Midterm Score",
      value: "72/100 (Target: 85%+ Final)",
      status: "Verified by Student",
      date: "Just now",
    },
    {
      id: "mem-2",
      category: "Schedule & Deadlines",
      title: "Distributed Systems Project",
      value: "Friday Final Submission 23:59",
      status: "Verified by Student",
      date: "Today",
    },
    {
      id: "mem-3",
      category: "Learning Style",
      title: "Preferred Learning Format",
      value: "Prefers interactive code traces over pure theory",
      status: "Verified by Student",
      date: "2 days ago",
    },
  ]);

  const [candidateCardActive, setCandidateCardActive] = useState(true);

  const handleSaveCandidate = () => {
    setSavedMemories([
      {
        id: "mem-new",
        category: "Struggling Concept",
        title: "Dynamic Programming Subproblems",
        value: "Needs step-by-step state transition diagrams",
        status: "Verified by Student",
        date: "Just now",
      },
      ...savedMemories,
    ]);
    setCandidateCardActive(false);
  };

  return (
    <section id="memory" className="py-20 md:py-32 px-4 md:px-6 bg-[#042829] text-white">
      <div className="max-w-[1360px] mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B7F34A]/10 border border-[#B7F34A]/20 text-[#B7F34A] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#B7F34A]" />
            <span>Controlled AI Memory Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            The AI remembers what matters — <br />
            <span className="text-[#B7F34A]">only when you allow it.</span>
          </h2>

          <p className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
            Synexora can identify what matters during your study conversations. You decide what gets persisted into your private memory ledger.
          </p>
        </div>

        {/* Live Interactive Memory Control Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Interactive Notification Demonstration */}
          <div className="lg:col-span-6 bg-[#06383A] rounded-[32px] p-6 sm:p-10 border border-white/10 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B7F34A]" />
                Live Extraction Preview
              </span>
              <span className="text-[11px] font-mono text-[#B7F34A] bg-[#B7F34A]/10 px-2.5 py-0.5 rounded-full">
                Zero Auto-Commit
              </span>
            </div>

            {/* Simulated Chat Dialogue */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-slate-200">
                <span className="text-[11px] text-white/50 block mb-1">Student:</span>
                "I always struggle with Dynamic Programming state transitions, especially knapsack variations."
              </div>

              {/* Candidate Memory Approval Card */}
              {candidateCardActive ? (
                <div className="p-5 rounded-2xl bg-[#094748] border-2 border-[#B7F34A] space-y-3.5 shadow-xl animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#B7F34A] flex items-center gap-1.5 uppercase tracking-wide">
                      💡 Synexora Noticed Something Useful
                    </span>
                    <span className="text-[10px] text-white/60 bg-black/30 px-2 py-0.5 rounded">
                      Candidate Fact
                    </span>
                  </div>

                  <div className="bg-black/30 p-3 rounded-xl border border-white/10 text-xs space-y-1">
                    <div className="text-white/60 text-[11px]">Identified Gap:</div>
                    <div className="text-white font-bold">Dynamic Programming (Knapsack State Transitions)</div>
                    <div className="text-slate-300 text-[11px]">Action: Offer step-by-step visual matrices</div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={handleSaveCandidate}
                      className="btn-pill-primary px-4 py-2 text-xs font-bold text-[#06383A] flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save to Memory</span>
                    </button>
                    <button className="btn-pill-outline text-white border-white/20 hover:bg-white/10 px-3 py-2 text-xs">
                      Edit Value
                    </button>
                    <button
                      onClick={() => setCandidateCardActive(false)}
                      className="text-white/50 hover:text-white px-2 py-1 text-xs"
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#B7F34A]/10 border border-[#B7F34A]/30 text-xs text-[#B7F34A] flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Memory confirmed and committed to your private ledger.
                  </span>
                  <button
                    onClick={() => setCandidateCardActive(true)}
                    className="underline text-xs font-bold"
                  >
                    Reset Demo
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Every detail stored in Synexora is explicitly authenticated and authorized by you. No hidden profiling.
            </p>
          </div>

          {/* Right: Transparent Private Memory Ledger */}
          <div className="lg:col-span-6 bg-[#06383A] rounded-[32px] p-6 sm:p-10 border border-white/10 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#B7F34A]" />
                  Your Active Memory Ledger
                </h4>
                <span className="text-xs text-slate-400">Student Sovereignty Protocol</span>
              </div>
              <span className="text-xs font-mono text-[#B7F34A] bg-[#B7F34A]/10 px-2.5 py-1 rounded-full font-bold">
                {savedMemories.length} Active Memories
              </span>
            </div>

            <div className="space-y-3">
              {savedMemories.map((mem) => (
                <div
                  key={mem.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#B7F34A]/40 transition-colors flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-[#B7F34A]">
                        {mem.category}
                      </span>
                      <span className="text-[11px] text-white/40">{mem.date}</span>
                    </div>
                    <div className="font-bold text-sm text-white">{mem.title}</div>
                    <div className="text-xs text-slate-300">{mem.value}</div>
                  </div>

                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setSavedMemories(savedMemories.filter((m) => m.id !== mem.id))
                      }
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
