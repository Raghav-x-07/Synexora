"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "UNDERSTAND",
      headline: "Ingests academic context and course materials",
      desc: "Upload your syllabus, lecture slides, and notes. Synexora indexes concepts, key formulas, and upcoming exam deadlines into your secure context vector space.",
    },
    {
      num: "02",
      title: "REASON",
      headline: "Detects knowledge gaps and synthesizes plans",
      desc: "Through continuous Socratic problem solving, Synexora pinpoints your misconceptions, optimizes your study schedule, and proposes verified memory items.",
    },
    {
      num: "03",
      title: "ACT",
      headline: "Executes adaptive practice & schedule reminders",
      desc: "Generates tailored diagnostic quizzes, auto-allocates study time on your calendar, and guides you step-by-step to comprehensive academic mastery.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-32 px-4 md:px-6 bg-[#F2F5EE]">
      <div className="max-w-[1360px] mx-auto space-y-16">
        
        {/* Header */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06383A]/5 text-[#06383A] text-xs font-bold uppercase tracking-wider">
            <span>Workflow & Lifecycle</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#06383A] tracking-tight">
            How Synexora works.
          </h2>
          <p className="text-base sm:text-lg text-[#06383A]/70">
            A continuous three-stage intelligence cycle that evolves as you learn.
          </p>
        </div>

        {/* 3 Steps Horizontal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-white rounded-[32px] p-8 sm:p-10 border border-[#06383A]/10 shadow-sm flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1.5"
            >
              <div>
                <div className="text-5xl sm:text-6xl font-black text-[#8FD63A] tracking-tighter mb-6 font-mono">
                  {step.num}
                </div>

                <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#06383A]/50 block mb-2">
                  {step.title}
                </span>

                <h3 className="text-xl font-extrabold text-[#06383A] mb-4 tracking-tight leading-snug">
                  {step.headline}
                </h3>

                <p className="text-sm text-[#06383A]/70 leading-relaxed font-normal">
                  {step.desc}
                </p>
              </div>

              <div className="pt-8 mt-6 border-t border-gray-100 flex items-center gap-2 text-xs font-bold text-[#06383A]">
                <span>Phase {step.num} Overview</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#8FD63A]" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
