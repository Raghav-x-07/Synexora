"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Brain, CheckCircle2, ChevronRight, FileText, Send, Calendar } from "lucide-react";

export default function Hero() {
  const [activeTab, setActiveTab] = useState<"tutor" | "memory" | "schedule">("memory");

  return (
    <section className="pt-28 md:pt-36 pb-12 md:pb-20 px-4 md:px-6">
      <div className="max-w-[1360px] mx-auto">
        {/* Large Rounded Hero Container */}
        <div className="relative bg-[#F2F5EE] border border-[#06383A]/10 rounded-[32px] md:rounded-[44px] px-6 sm:px-12 md:px-16 py-16 md:py-24 overflow-hidden shadow-sm">
          
          {/* Subtle Soft Green/Lime Glow in Background */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[800px] h-[350px] md:h-[500px] bg-radial-gradient from-[#B7F34A]/30 via-[#8FD63A]/15 to-transparent blur-[90px] md:blur-[130px] pointer-events-none rounded-full" />

          {/* Top Pill Badge */}
          <div className="relative z-10 flex justify-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#06383A]/10 text-xs md:text-[13px] font-semibold text-[#06383A] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#8FD63A] animate-pulse" />
              <span>Synexora Intelligence OS — Now in Early Access</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[80px] font-extrabold text-[#06383A] tracking-tighter leading-[1.05]">
              Meet Synexora, <br />
              <span className="relative inline-block">
                your intelligent AI teammate
              </span>
            </h1>

            {/* Supporting Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl text-[#06383A]/75 font-normal max-w-2xl mx-auto leading-relaxed tracking-tight">
              One intelligent workspace that understands your work, helps you think, and gets things done.
            </p>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/app"
                className="btn-pill-dark px-8 py-3.5 text-base font-semibold flex items-center gap-2 group shadow-md"
              >
                <span>Get started</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <a
                href="#story"
                className="btn-pill-outline px-7 py-3.5 text-base font-medium"
              >
                Explore platform
              </a>
            </div>
          </div>

          {/* Interactive AI Teammate Demonstration Cockpit */}
          <div className="relative z-10 mt-14 md:mt-20 max-w-4xl mx-auto">
            <div className="bg-[#06383A] text-white rounded-[28px] border border-white/15 p-4 sm:p-7 shadow-[0_25px_60px_-15px_rgba(6,56,58,0.35)] overflow-hidden">
              
              {/* Cockpit Header / Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  <span className="ml-2 text-xs font-mono text-white/50">synexora-intelligence-layer</span>
                </div>

                <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-full text-xs font-medium">
                  <button
                    onClick={() => setActiveTab("memory")}
                    className={`px-3 py-1 rounded-full transition-all ${
                      activeTab === "memory"
                        ? "bg-[#B7F34A] text-[#06383A] font-semibold shadow-sm"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    Controlled Memory
                  </button>
                  <button
                    onClick={() => setActiveTab("tutor")}
                    className={`px-3 py-1 rounded-full transition-all ${
                      activeTab === "tutor"
                        ? "bg-[#B7F34A] text-[#06383A] font-semibold shadow-sm"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    AI Tutor
                  </button>
                  <button
                    onClick={() => setActiveTab("schedule")}
                    className={`px-3 py-1 rounded-full transition-all ${
                      activeTab === "schedule"
                        ? "bg-[#B7F34A] text-[#06383A] font-semibold shadow-sm"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    Auto-Planner
                  </button>
                </div>
              </div>

              {/* Dynamic Interactive Stage */}
              <div className="py-5 space-y-4">
                {activeTab === "memory" && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-semibold text-xs text-white">
                        You
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-sm text-slate-200 max-w-xl">
                        "I got a 72 on my DBMS mid-term exam, and our Distributed Systems project is due on Friday."
                      </div>
                    </div>

                    {/* AI Response with Controlled Candidate Memory Card */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#B7F34A] text-[#06383A] flex items-center justify-center shrink-0 font-extrabold text-xs">
                        S
                      </div>
                      <div className="space-y-3 flex-1">
                        <div className="bg-white/10 border border-white/15 rounded-2xl p-3.5 text-sm text-white">
                          Understood! I'll tailor our review on indexing to boost your DBMS score, and I've structured your Friday project milestones.
                        </div>

                        {/* Interactive Candidate Memory Banner */}
                        <div className="bg-[#094748] border-2 border-[#B7F34A]/50 rounded-2xl p-4 space-y-2.5 shadow-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#B7F34A] uppercase tracking-wider">
                              <Sparkles className="w-4 h-4 text-[#B7F34A]" />
                              <span>Synexora noticed useful facts</span>
                            </div>
                            <span className="text-[11px] text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
                              Requires Student Approval
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl">
                              <span className="text-white/50 block text-[11px]">Academic Metric</span>
                              <span className="font-semibold text-white">DBMS Midterm Score: 72/100</span>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl">
                              <span className="text-white/50 block text-[11px]">Deadline Detected</span>
                              <span className="font-semibold text-white">Distributed Systems: Friday</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button className="btn-pill-primary px-3.5 py-1.5 text-xs font-bold text-[#06383A]">
                              Save to Memory
                            </button>
                            <button className="btn-pill-outline text-white border-white/20 hover:bg-white/10 px-3 py-1.5 text-xs">
                              Edit Details
                            </button>
                            <button className="text-white/50 hover:text-white px-2 py-1 text-xs">
                              Ignore
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "tutor" && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-semibold text-xs text-white">
                        You
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-sm text-slate-200">
                        "Can you explain why Dijkstra's algorithm fails with negative edge weights?"
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#B7F34A] text-[#06383A] flex items-center justify-center shrink-0 font-extrabold text-xs">
                        S
                      </div>
                      <div className="bg-white/10 border border-white/15 rounded-2xl p-4 text-sm text-white space-y-2 max-w-xl">
                        <p className="font-semibold text-[#B7F34A]">Socratic Diagnostic:</p>
                        <p className="text-white/90">
                          Dijkstra greedily assumes once a vertex is marked 'visited', its shortest distance is finalized. If a negative edge appears later, this greedy invariant is violated.
                        </p>
                        <div className="p-2.5 rounded-xl bg-black/30 text-xs font-mono text-[#B7F34A]">
                          💡 Recommended follow-up: "Would you like to trace Bellman-Ford on a 4-node counterexample?"
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "schedule" && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#B7F34A] text-[#06383A] flex items-center justify-center shrink-0 font-extrabold text-xs">
                        S
                      </div>
                      <div className="bg-white/10 border border-white/15 rounded-2xl p-4 text-sm text-white space-y-3 w-full max-w-xl">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-[#B7F34A]" />
                            Optimized Study Schedule Synthesized
                          </span>
                          <span className="text-[11px] text-[#B7F34A] font-mono">Exam in 3 Days</span>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                            <span>Today 18:00 - 19:30</span>
                            <span className="font-semibold text-[#B7F34A]">B-Tree & Indexing Practice</span>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                            <span>Tomorrow 10:00 - 11:30</span>
                            <span className="font-semibold text-white/90">Concurrency Control & 2PL</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Command Bar */}
              <div className="pt-2">
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value="Ask Synexora anything about your courses, research papers, or schedule..."
                    className="w-full bg-white/5 border border-white/15 rounded-full px-4 py-2.5 text-xs text-white/60 focus:outline-none cursor-default"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#B7F34A] flex items-center justify-center text-[#06383A]">
                    <Send className="w-3 h-3" />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
