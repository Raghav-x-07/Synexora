"use client";

import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "dark" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  icon,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3.5 text-base gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-[#B7F34A] text-[#06383A] hover:bg-[#A6E838] hover:shadow-[0_8px_20px_-6px_rgba(183,243,74,0.5)] active:scale-98",
    dark:
      "bg-[#06383A] text-white hover:bg-[#08484B] hover:shadow-[0_8px_20px_-6px_rgba(6,56,58,0.4)] active:scale-98",
    outline:
      "border border-[#06383A]/15 bg-transparent text-[#06383A] hover:bg-[#06383A]/5 hover:border-[#06383A]/30 active:scale-98",
    ghost:
      "bg-transparent text-[#06383A] hover:bg-[#06383A]/5 active:scale-98",
    danger:
      "bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20 active:scale-98",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
