"use client";

import React from "react";
import { capabilitiesData } from "@/data/capabilities";
import {
  GraduationCap,
  BrainCircuit,
  FileText,
  Calendar,
  Target,
  Sparkles,
  BookOpen,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function Capabilities() {
  const iconMap: Record<string, React.ReactNode> = {
    GraduationCap: <GraduationCap className="w-5 h-5 text-[#8FD63A]" />,
    BrainCircuit: <BrainCircuit className="w-5 h-5 text-[#8FD63A]" />,
    FileText: <FileText className="w-5 h-5 text-[#8FD63A]" />,
    Calendar: <Calendar className="w-5 h-5 text-[#8FD63A]" />,
    Target: <Target className="w-5 h-5 text-[#8FD63A]" />,
    Sparkles: <Sparkles className="w-5 h-5 text-[#8FD63A]" />,
    BookOpen: <BookOpen className="w-5 h-5 text-[#8FD63A]" />,
    ShieldCheck: <ShieldCheck className="w-5 h-5 text-[#8FD63A]" />,
  };

  return (
    <section id="capabilities" className="py-20 md:py-32 px-4 md:px-6">
      <div className="max-w-[1360px] mx-auto space-y-14">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06383A]/5 text-[#06383A] text-xs font-bold uppercase tracking-wider">
              <span>Full-Spectrum AI Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#06383A] tracking-tight">
              An entire academic operating system in one platform.
            </h2>
          </div>
          <p className="text-base text-[#06383A]/70 max-w-md">
            Every feature is architected to eliminate cognitive friction and elevate your academic performance.
          </p>
        </div>

        {/* 8-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilitiesData.map((cap) => (
            <div
              key={cap.id}
              className="bg-white rounded-[24px] p-7 border border-[#06383A]/10 hover:border-[#06383A]/30 transition-all duration-300 hover:-translate-y-1 shadow-sm flex flex-col justify-between group"
            >
              <div>
                <div className="w-11 h-11 rounded-2xl bg-[#F2F5EE] border border-[#06383A]/10 flex items-center justify-center mb-6 group-hover:bg-[#B7F34A]/20 transition-colors">
                  {iconMap[cap.iconName] || <Sparkles className="w-5 h-5 text-[#8FD63A]" />}
                </div>

                <span className="text-[11px] font-mono uppercase font-bold text-[#06383A]/50 tracking-wider block mb-2">
                  {cap.category}
                </span>

                <h3 className="text-lg font-extrabold text-[#06383A] mb-2 tracking-tight">
                  {cap.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#06383A]/70 leading-relaxed">
                  {cap.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 flex items-center gap-1 text-xs font-bold text-[#06383A] group-hover:text-[#8FD63A] transition-colors">
                <span>Explore capability</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
