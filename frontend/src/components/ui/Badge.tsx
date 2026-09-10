"use client";

import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "lime" | "dark" | "gray" | "amber" | "emerald";
  pulse?: boolean;
  className?: string;
}

export default function Badge({
  children,
  variant = "gray",
  pulse = false,
  className = "",
}: BadgeProps) {
  const variantStyles = {
    lime: "bg-[#B7F34A]/20 text-[#06383A] border border-[#B7F34A]/40",
    dark: "bg-[#06383A] text-white border border-white/10",
    gray: "bg-[#06383A]/5 text-[#06383A] border border-[#06383A]/10",
    amber: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${variantStyles[variant]} ${className}`}
    >
      {pulse && (
        <span className="w-2 h-2 rounded-full bg-current animate-pulse shrink-0" />
      )}
      <span>{children}</span>
    </span>
  );
}
