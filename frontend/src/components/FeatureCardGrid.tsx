"use client";

import React from "react";
import { featureCardsData } from "@/data/features";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";

export default function FeatureCardGrid() {
  return (
    <section id="features" className="py-16 md:py-24 px-4 md:px-6">
      <div className="max-w-[1360px] mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06383A]/5 text-[#06383A] text-xs font-bold uppercase tracking-wider mb-3">
            <span>Modular Intelligence System</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#06383A] tracking-tight">
            Designed for depth. <br />
            Engineered for speed.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#06383A]/70">
            Every layer of Synexora connects harmoniously to form one continuous academic intelligence loop.
          </p>
        </div>

        {/* Asymmetric Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureCardsData.map((card) => {
            const isDark = card.theme === "dark";
            const isLime = card.theme === "lime";

            return (
              <div
                key={card.id}
                className={`rounded-[28px] md:rounded-[36px] p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                  card.span === "col-span-2" ? "md:col-span-2" : "md:col-span-1"
                } ${
                  isDark
                    ? "bg-[#06383A] text-white border border-white/10 shadow-xl"
                    : isLime
                    ? "bg-[#B7F34A] text-[#06383A] border border-[#06383A]/10 shadow-lg"
                    : "bg-white text-[#06383A] border border-[#06383A]/10 shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span
                      className={`text-xs font-mono font-bold tracking-wider uppercase px-3 py-1 rounded-full ${
                        isDark
                          ? "bg-white/10 text-[#B7F34A]"
                          : isLime
                          ? "bg-[#06383A]/15 text-[#06383A]"
                          : "bg-[#06383A]/5 text-[#06383A]"
                      }`}
                    >
                      {card.tag}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        isDark
                          ? "bg-white/10 text-white"
                          : isLime
                          ? "bg-[#06383A] text-white"
                          : "bg-[#06383A]/5 text-[#06383A]"
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                    {card.title}
                  </h3>
                  <h4
                    className={`text-base font-semibold mb-4 ${
                      isDark
                        ? "text-[#B7F34A]"
                        : isLime
                        ? "text-[#06383A]/85"
                        : "text-[#8FD63A]"
                    }`}
                  >
                    {card.subtitle}
                  </h4>
                  <p
                    className={`text-sm sm:text-base leading-relaxed ${
                      isDark
                        ? "text-slate-300"
                        : isLime
                        ? "text-[#06383A]/85"
                        : "text-[#06383A]/70"
                    }`}
                  >
                    {card.description}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-current/10 flex flex-wrap gap-2">
                  {card.details.map((detail, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                        isDark
                          ? "bg-white/10 text-slate-200"
                          : isLime
                          ? "bg-[#06383A]/10 text-[#06383A]"
                          : "bg-[#06383A]/5 text-[#06383A]/80"
                      }`}
                    >
                      {detail}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
