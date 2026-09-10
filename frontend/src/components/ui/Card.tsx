"use client";

import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "dark" | "lime" | "outline" | "elevated";
  children: React.ReactNode;
}

export default function Card({
  variant = "light",
  children,
  className = "",
  ...props
}: CardProps) {
  const baseStyles = "rounded-[24px] md:rounded-[32px] p-6 sm:p-8 transition-all duration-300";

  const variantStyles = {
    light: "bg-white border border-[#06383A]/10 shadow-sm text-[#06383A]",
    dark: "bg-[#06383A] text-white border border-white/10 shadow-xl",
    lime: "bg-[#B7F34A] text-[#06383A] border border-[#06383A]/10 shadow-lg",
    outline: "bg-transparent border border-[#06383A]/15 text-[#06383A]",
    elevated: "bg-white border border-[#06383A]/10 shadow-[0_20px_40px_-15px_rgba(6,56,58,0.08)] text-[#06383A]",
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
