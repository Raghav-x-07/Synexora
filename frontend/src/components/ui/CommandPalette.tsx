"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  BrainCircuit,
  GraduationCap,
  FileText,
  Calendar,
  CheckSquare,
  BookOpen,
  Sparkles,
  Layers,
  BarChart3,
  Settings,
  X,
  ArrowRight,
} from "lucide-react";

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger handled by parent or state
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { title: "Dashboard Cockpit", href: "/app", icon: <Layers className="w-4 h-4" />, category: "Core" },
    { title: "AI Socratic Tutor", href: "/app/tutor", icon: <GraduationCap className="w-4 h-4" />, category: "Learning" },
    { title: "Controlled Memory Ledger", href: "/app/memory", icon: <BrainCircuit className="w-4 h-4" />, category: "Memory" },
    { title: "RAG Document Knowledge Base", href: "/app/rag", icon: <FileText className="w-4 h-4" />, category: "Learning" },
    { title: "Tasks & Deadlines", href: "/app/tasks", icon: <CheckSquare className="w-4 h-4" />, category: "Productivity" },
    { title: "Adaptive Calendar", href: "/app/calendar", icon: <Calendar className="w-4 h-4" />, category: "Productivity" },
    { title: "Practice & Diagnostics", href: "/app/practice", icon: <Sparkles className="w-4 h-4" />, category: "Assessments" },
    { title: "AI Reflection Diary", href: "/app/diary", icon: <BookOpen className="w-4 h-4" />, category: "Insights" },
    { title: "Academic Analytics", href: "/app/analytics", icon: <BarChart3 className="w-4 h-4" />, category: "Insights" },
    { title: "Workspace Settings", href: "/app/settings", icon: <Settings className="w-4 h-4" />, category: "Preferences" },
  ];

  const filtered = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-[24px] shadow-2xl border border-[#06383A]/10 overflow-hidden text-[#06383A]">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#06383A]/50 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search modules, lecture notes, or ask Synexora..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm md:text-base font-medium text-[#06383A] placeholder-[#06383A]/40 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((cmd) => (
              <button
                key={cmd.title}
                onClick={() => handleSelect(cmd.href)}
                className="w-full px-3 py-2.5 rounded-xl hover:bg-[#F2F5EE] flex items-center justify-between text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#06383A]/5 group-hover:bg-[#B7F34A]/30 flex items-center justify-center text-[#06383A] transition-colors">
                    {cmd.icon}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#06383A] block">
                      {cmd.title}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-[#06383A]/50">
                      {cmd.category}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#06383A]/30 group-hover:text-[#06383A] transition-colors" />
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">
              No matching modules found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-[#F7F8F3] border-t border-gray-100 flex items-center justify-between text-[11px] text-[#06383A]/60">
          <span>Navigate with <strong>↑</strong> <strong>↓</strong> and <strong>Enter</strong></span>
          <span><strong>ESC</strong> to close</span>
        </div>

      </div>
    </div>
  );
}
