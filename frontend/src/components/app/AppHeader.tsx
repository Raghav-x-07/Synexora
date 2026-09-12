"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  Bell,
  Sparkles,
  Flame,
  Plus,
  Brain,
  Menu,
  GraduationCap,
  CheckSquare,
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function AppHeader({
  onOpenCommandPalette,
  onToggleMobileSidebar,
}: {
  onOpenCommandPalette: () => void;
  onToggleMobileSidebar: () => void;
}) {
  const { user } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#F7F8F3]/90 backdrop-blur-md border-b border-[#06383A]/10 px-4 md:px-8 py-3.5 flex items-center justify-between">
      
      {/* Left: Mobile Toggle & Quick Search Launcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 text-[#06383A] hover:bg-[#06383A]/5 rounded-xl md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Trigger Bar */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-[#06383A]/10 text-xs md:text-sm text-[#06383A]/60 hover:border-[#06383A]/30 hover:text-[#06383A] transition-all shadow-sm w-48 sm:w-72 md:w-96 text-left"
        >
          <Search className="w-4 h-4 text-[#06383A]/40 shrink-0" />
          <span className="truncate">Search courses, notes, AI commands...</span>
          <kbd className="ml-auto hidden sm:inline-block px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-[10px] font-mono text-gray-500">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Streak, Notifications & Actions */}
      <div className="flex items-center gap-3">
        
        {/* Active Study Streak Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#B7F34A]/20 border border-[#B7F34A]/50 text-xs font-bold text-[#06383A]">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          <span>{user?.studyStreakDays ?? 0} Days Streak</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-9 h-9 rounded-full bg-white border border-[#06383A]/10 flex items-center justify-center text-[#06383A] hover:bg-gray-50 transition-colors shadow-sm relative"
          >
            <Bell className="w-4 h-4" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl p-4 shadow-2xl border border-[#06383A]/10 text-[#06383A] animate-in fade-in zoom-in-95 duration-200 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs font-bold uppercase tracking-wider">Notifications</span>
              </div>
              <div className="py-4 text-center text-xs text-gray-500">
                No new notifications.
              </div>
            </div>
          )}
        </div>

        {/* Quick Launch Action Button */}
        <Link href="/app/tutor">
          <Button variant="dark" size="sm" icon={<Sparkles className="w-3.5 h-3.5 text-[#B7F34A]" />}>
            <span className="hidden sm:inline">Ask</span> AI Tutor
          </Button>
        </Link>

      </div>
    </header>
  );
}

