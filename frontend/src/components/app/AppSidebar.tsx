"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Layers,
  GraduationCap,
  Sparkles,
  FileText,
  BrainCircuit,
  BookOpen,
  CheckSquare,
  Calendar,
  Bell,
  Target,
  FileCheck2,
  TrendingUp,
  MapPin,
  PenTool,
  BarChart3,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Flame,
  Video,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export default function AppSidebar({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const navGroups: NavGroup[] = [
    {
      group: "Core",
      items: [
        { title: "Dashboard", href: "/app", icon: <Layers className="w-4 h-4" /> },
      ],
    },
    {
      group: "Intelligence & Learning",
      items: [
        { title: "AI Tutor", href: "/app/tutor", icon: <GraduationCap className="w-4 h-4" />, badge: "AI" },
        { title: "Controlled Memory", href: "/app/memory", icon: <BrainCircuit className="w-4 h-4" /> },
        { title: "RAG Knowledge Base", href: "/app/rag", icon: <FileText className="w-4 h-4" /> },
        { title: "Video Learning", href: "/app/media", icon: <Video className="w-4 h-4" /> },
        { title: "Intelligent Notes", href: "/app/notes", icon: <PenTool className="w-4 h-4" /> },
      ],
    },
    {
      group: "Productivity & Planning",
      items: [
        { title: "Tasks & Deadlines", href: "/app/tasks", icon: <CheckSquare className="w-4 h-4" /> },
        { title: "Adaptive Calendar", href: "/app/calendar", icon: <Calendar className="w-4 h-4" /> },
        { title: "Academic Goals", href: "/app/goals", icon: <Target className="w-4 h-4" /> },
      ],
    },
    {
      group: "Assessments & Adaptation",
      items: [
        { title: "Adaptive Practice", href: "/app/practice", icon: <Sparkles className="w-4 h-4" /> },
        { title: "Assessments", href: "/app/assessments", icon: <FileCheck2 className="w-4 h-4" /> },
        { title: "Learning Path", href: "/app/learning-path", icon: <MapPin className="w-4 h-4" /> },
      ],
    },
    {
      group: "Reflections & Insights",
      items: [
        { title: "AI Diary", href: "/app/diary", icon: <BookOpen className="w-4 h-4" /> },
        { title: "Academic Analytics", href: "/app/analytics", icon: <BarChart3 className="w-4 h-4" /> },
        { title: "Profile", href: "/app/profile", icon: <User className="w-4 h-4" /> },
        { title: "Settings", href: "/app/settings", icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#06383A] text-white border-r border-white/10 flex flex-col justify-between transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <Link href="/app" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-[#B7F34A] flex items-center justify-center shrink-0">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#06383A] rotate-45" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white">
                SYNEXORA
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#B7F34A] uppercase -mt-0.5">
                Student OS
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-300 transition-colors hidden md:block"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Groups List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-mono uppercase font-bold text-white/40 tracking-wider mb-1.5">
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all group ${
                    isActive
                      ? "bg-[#B7F34A] text-[#06383A] font-bold shadow-md"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                  title={isCollapsed ? item.title : undefined}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`shrink-0 ${
                        isActive
                          ? "text-[#06383A]"
                          : "text-slate-400 group-hover:text-[#B7F34A] transition-colors"
                      }`}
                    >
                      {item.icon}
                    </span>
                    {!isCollapsed && <span>{item.title}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-[#06383A] text-white"
                          : "bg-[#B7F34A]/20 text-[#B7F34A]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer User Card */}
      <div className="p-3 border-t border-white/10">
        <Link href="/app/profile" className="block p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#B7F34A] to-emerald-400 flex items-center justify-center text-[#06383A] font-bold text-xs shrink-0">
            {getInitials(user?.fullName)}
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">
                {user?.fullName || "Student Account"}
              </span>
              <span className="text-[10px] text-[#B7F34A] block truncate flex items-center gap-1">
                <Flame className="w-3 h-3 inline" /> {user?.studyStreakDays ?? 0}-Day Streak
              </span>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}

