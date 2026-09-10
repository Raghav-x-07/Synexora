"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { featureStoryData } from "@/data/features";
import { ArrowRight, Check, Search, Database, Layers, Sparkles, BookOpen, Clock, FileCode, CheckCircle2 } from "lucide-react";

export default function FeatureStory() {
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const current = featureStoryData[activeStoryIndex];

  return (
    <section id="story" className="py-16 md:py-28 px-4 md:px-6">
      <div className="max-w-[1360px] mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06383A]/5 text-[#06383A] text-xs font-bold uppercase tracking-wider">
              <span>Scroll-Driven Story</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#06383A] tracking-tight">
              One unified intelligence layer. <br className="hidden sm:block" />
              Three distinct capabilities.
            </h2>
          </div>

          {/* Interactive Feature Selectors */}
          <div className="flex items-center gap-2 bg-[#F2F5EE] p-1.5 rounded-full border border-[#06383A]/10 self-start">
            {featureStoryData.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setActiveStoryIndex(idx)}
                className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 ${
                  activeStoryIndex === idx
                    ? "bg-[#06383A] text-white shadow-sm"
                    : "text-[#06383A]/70 hover:text-[#06383A]"
                }`}
              >
                0{idx + 1}. {item.tag}
              </button>
            ))}
          </div>
        </div>

        {/* Large Rounded Feature Container (55% Content / 45% Visual) */}
        <div className="bg-[#06383A] rounded-[32px] md:rounded-[44px] border border-white/10 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
            
            {/* Left 55% Content Area */}
            <div className="lg:col-span-7 p-8 sm:p-12 md:p-16 flex flex-col justify-between text-white border-b lg:border-b-0 lg:border-r border-white/10">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-6"
                >
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B7F34A]/10 border border-[#B7F34A]/20 text-xs font-semibold text-[#B7F34A] uppercase tracking-wider">
                    {current.tag}
                  </div>

                  <h3 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.12]">
                    {current.title}
                  </h3>

                  <p className="text-lg sm:text-xl text-[#B7F34A] font-medium leading-snug">
                    "{current.headline}"
                  </p>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                    {current.description}
                  </p>

                  <div className="pt-2 space-y-2.5">
                    {current.bullets.map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                        <div className="w-5 h-5 rounded-full bg-[#B7F34A]/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-[#B7F34A]" />
                        </div>
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Bottom Metric Strip */}
              <div className="pt-10 mt-8 border-t border-white/10 flex items-center gap-6">
                <div>
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#B7F34A] tracking-tight block">
                    {current.metric}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {current.metricLabel}
                  </span>
                </div>
              </div>

            </div>

            {/* Right 45% Visual & Dynamic Mockup Area */}
            <div className="lg:col-span-5 bg-[#042829] p-6 sm:p-10 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient from-[#B7F34A]/10 to-transparent blur-3xl pointer-events-none" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.4 }}
                  className="w-full relative z-10 space-y-4"
                >
                  {current.mockupType === "knowledge" && (
                    <div className="bg-[#06383A] border border-white/15 rounded-2xl p-5 text-white space-y-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#B7F34A]" />
                          <span className="text-xs font-bold">RAG Document Ingestion</span>
                        </div>
                        <span className="text-[10px] bg-[#B7F34A]/20 text-[#B7F34A] px-2 py-0.5 rounded-full font-mono">
                          1,420 Chunks Indexed
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between">
                          <span className="text-slate-300">CS301_Distributed_Systems.pdf</span>
                          <span className="text-[#B7F34A] font-semibold text-[11px]">Grounded ✓</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between">
                          <span className="text-slate-300">DBMS_Normalization_Formulas.pdf</span>
                          <span className="text-[#B7F34A] font-semibold text-[11px]">Grounded ✓</span>
                        </div>
                      </div>

                      <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-[11px] text-slate-300">
                        <span className="text-[#B7F34A] font-bold block mb-1">Semantic Query Preview:</span>
                        "BCNF decomposition guarantees lossless join and dependency preservation?"
                      </div>
                    </div>
                  )}

                  {current.mockupType === "reasoning" && (
                    <div className="bg-[#06383A] border border-white/15 rounded-2xl p-5 text-white space-y-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#B7F34A]" />
                          <span className="text-xs font-bold">Adaptive Mastery Radar</span>
                        </div>
                        <span className="text-[10px] bg-white/10 text-white/80 px-2 py-0.5 rounded-full font-mono">
                          Live Diagnostic
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center text-slate-300">
                          <span>Graph Algorithms</span>
                          <span className="text-[#B7F34A] font-bold">88%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-[#B7F34A] rounded-full" style={{ width: "88%" }} />
                        </div>

                        <div className="flex justify-between items-center text-slate-300 pt-2">
                          <span>SQL Query Tuning</span>
                          <span className="text-[#B7F34A] font-bold">72%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-[#8FD63A] rounded-full" style={{ width: "72%" }} />
                        </div>
                      </div>

                      <div className="p-3 bg-[#B7F34A]/10 border border-[#B7F34A]/30 rounded-xl text-[11px] text-slate-200">
                        💡 Synexora has scheduled 2 targeted practice problems to elevate SQL Query Tuning to 85%+.
                      </div>
                    </div>
                  )}

                  {current.mockupType === "action" && (
                    <div className="bg-[#06383A] border border-white/15 rounded-2xl p-5 text-white space-y-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#B7F34A]" />
                          <span className="text-xs font-bold">Proactive Task Calendar</span>
                        </div>
                        <span className="text-[10px] bg-[#B7F34A] text-[#06383A] px-2 py-0.5 rounded-full font-bold">
                          Synced
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                          <div>
                            <span className="text-white font-semibold block">DSA Mock Assessment</span>
                            <span className="text-[10px] text-slate-400">Scheduled: Tomorrow at 15:00</span>
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-[#B7F34A]" />
                        </div>

                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                          <div>
                            <span className="text-white font-semibold block">Submit DBMS Final Draft</span>
                            <span className="text-[10px] text-slate-400">Scheduled: Friday at 23:59</span>
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-[#B7F34A]" />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
