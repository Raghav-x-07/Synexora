"use client";

import React from "react";
import { ArrowUpRight, TrendingUp } from "lucide-react";

export interface MetricTileProps {
  label: string;
  value: string;
  change?: string;
  sublabel?: string;
  icon?: React.ReactNode;
  theme?: "light" | "dark" | "lime";
}

export default function MetricTile({
  label,
  value,
  change,
  sublabel,
  icon,
  theme = "light",
}: MetricTileProps) {
  const isDark = theme === "dark";
  const isLime = theme === "lime";

  return (
    <div
      className={`rounded-[24px] p-6 border transition-all duration-300 hover:-translate-y-1 ${
        isDark
          ? "bg-[#06383A] text-white border-white/10 shadow-lg"
          : isLime
          ? "bg-[#B7F34A] text-[#06383A] border-[#06383A]/10 shadow-md"
          : "bg-white text-[#06383A] border-[#06383A]/10 shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span
          className={`text-xs font-mono font-bold tracking-wider uppercase ${
            isDark ? "text-slate-300" : isLime ? "text-[#06383A]/70" : "text-[#06383A]/60"
          }`}
        >
          {label}
        </span>
        {icon && (
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isDark
                ? "bg-white/10 text-[#B7F34A]"
                : isLime
                ? "bg-[#06383A]/10 text-[#06383A]"
                : "bg-[#06383A]/5 text-[#8FD63A]"
            }`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl sm:text-4xl font-black tracking-tight font-mono">
          {value}
        </span>
        {change && (
          <span
            className={`text-xs font-bold flex items-center ${
              isDark ? "text-[#B7F34A]" : isLime ? "text-[#06383A]" : "text-emerald-600"
            }`}
          >
            <TrendingUp className="w-3 h-3 mr-0.5" />
            {change}
          </span>
        )}
      </div>

      {sublabel && (
        <span
          className={`text-xs block ${
            isDark ? "text-slate-400" : isLime ? "text-[#06383A]/70" : "text-[#06383A]/50"
          }`}
        >
          {sublabel}
        </span>
      )}
    </div>
  );
}
