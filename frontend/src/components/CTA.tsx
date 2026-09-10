"use client";

import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section id="cta" className="py-20 md:py-32 px-4 md:px-6">
      <div className="max-w-[1360px] mx-auto">
        <div className="relative bg-[#06383A] text-white rounded-[36px] md:rounded-[48px] px-6 sm:px-12 md:px-20 py-20 md:py-28 overflow-hidden text-center shadow-2xl border border-white/10">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-radial-gradient from-[#B7F34A]/25 via-[#8FD63A]/10 to-transparent blur-[110px] pointer-events-none rounded-full" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-xs md:text-sm font-semibold text-[#B7F34A] border border-white/10">
              <Sparkles className="w-4 h-4 text-[#B7F34A]" />
              <span>Synexora Student Intelligence</span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.08]">
              Your next teammate <br />
              <span className="text-[#B7F34A]">is intelligent.</span>
            </h2>

            <p className="text-lg sm:text-xl text-slate-300 font-normal max-w-xl mx-auto leading-relaxed">
              Build, learn, organize and execute with an AI that works alongside you.
            </p>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="btn-pill-primary px-8 py-4 text-base font-bold text-[#06383A] flex items-center gap-2 group shadow-xl">
                <span>Get started now</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
              <a
                href="#memory"
                className="btn-pill-outline text-white border-white/20 hover:bg-white/10 px-7 py-4 text-base font-medium"
              >
                Learn about Controlled Memory
              </a>
            </div>

            <p className="text-xs text-slate-400 pt-4 font-mono">
              Zero credit card required • Free student tier available • 100% data privacy
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
