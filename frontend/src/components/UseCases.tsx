"use client";

import React from "react";
import { useCasesData } from "@/data/useCases";
import { ArrowRight, Check } from "lucide-react";

export default function UseCases() {
  return (
    <section className="py-20 md:py-32 px-4 md:px-6">
      <div className="max-w-[1360px] mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#06383A]/5 text-[#06383A] text-xs font-bold uppercase tracking-wider">
            <span>Tailored Workspaces</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#06383A] tracking-tight">
            Built for ambitious thinkers across disciplines.
          </h2>
          <p className="text-base sm:text-lg text-[#06383A]/70">
            Synexora adapts its tone, depth, and tooling to match your exact academic and technical workflow.
          </p>
        </div>

        {/* Alternating Layouts */}
        <div className="space-y-8">
          {useCasesData.map((useCase, index) => {
            const isDark = useCase.accent === "dark";
            const isEven = index % 2 === 1;

            return (
              <div
                key={useCase.id}
                className={`rounded-[32px] md:rounded-[44px] p-8 sm:p-12 md:p-16 border transition-all ${
                  isDark
                    ? "bg-[#06383A] text-white border-white/10 shadow-xl"
                    : "bg-[#F2F5EE] text-[#06383A] border-[#06383A]/10 shadow-sm"
                }`}
              >
                <div
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-10 items-center ${
                    isEven ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Text Column */}
                  <div className="lg:col-span-7 space-y-6">
                    <span
                      className={`text-xs font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full inline-block ${
                        isDark ? "bg-[#B7F34A]/15 text-[#B7F34A]" : "bg-[#06383A]/10 text-[#06383A]"
                      }`}
                    >
                      {useCase.badge}
                    </span>

                    <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                      {useCase.title}
                    </h3>

                    <p
                      className={`text-base sm:text-lg font-medium leading-snug ${
                        isDark ? "text-[#B7F34A]" : "text-[#06383A]/90"
                      }`}
                    >
                      "{useCase.headline}"
                    </p>

                    <p
                      className={`text-sm sm:text-base leading-relaxed ${
                        isDark ? "text-slate-300" : "text-[#06383A]/75"
                      }`}
                    >
                      {useCase.description}
                    </p>

                    <div className="space-y-2.5 pt-2">
                      {useCase.points.map((point, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              isDark ? "bg-[#B7F34A]/20 text-[#B7F34A]" : "bg-[#06383A]/10 text-[#06383A]"
                            }`}
                          >
                            <Check className="w-3 h-3" />
                          </div>
                          <span className={isDark ? "text-slate-200" : "text-[#06383A]"}>
                            {point}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <a
                        href="#cta"
                        className={isDark ? "btn-pill-primary px-6 py-3 text-sm font-bold" : "btn-pill-dark px-6 py-3 text-sm font-bold"}
                      >
                        <span>{useCase.ctaText}</span>
                        <ArrowRight className="w-4 h-4 ml-1.5 inline-block" />
                      </a>
                    </div>
                  </div>

                  {/* Visual Stat / Metric Column */}
                  <div className="lg:col-span-5 flex flex-col justify-center">
                    <div
                      className={`p-8 sm:p-10 rounded-[28px] border flex flex-col items-center justify-center text-center space-y-3 ${
                        isDark
                          ? "bg-[#042829] border-white/10 shadow-lg"
                          : "bg-white border-[#06383A]/10 shadow-md"
                      }`}
                    >
                      <span
                        className={`text-6xl sm:text-7xl font-black font-mono tracking-tighter ${
                          isDark ? "text-[#B7F34A]" : "text-[#06383A]"
                        }`}
                      >
                        {useCase.statNumber}
                      </span>
                      <span
                        className={`text-sm sm:text-base font-semibold max-w-xs ${
                          isDark ? "text-slate-300" : "text-[#06383A]/80"
                        }`}
                      >
                        {useCase.statLabel}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
