"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
  Sparkles,
  Zap,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { API_BASE_URL } from "@/lib/apiClient";
import Link from "next/link";

interface CalendarEventItem {
  id?: string;
  _id?: string;
  time: string;
  title: string;
  type: string;
  room?: string;
}

interface SmartReminder {
  id: string;
  title: string;
  urgency: "HIGH" | "MEDIUM" | "LOW";
  message: string;
  actionLabel: string;
  actionUrl: string;
  targetTopic: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [reminders, setReminders] = useState<SmartReminder[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("16:00 - 17:30");
  const [newType, setNewType] = useState("AI Study Block");
  const [newRoom, setNewRoom] = useState("Library");
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    fetchEventsAndReminders().finally(() => setLoading(false));
  }, []);

  const fetchEventsAndReminders = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("synexora_token") : null;
      // Fetch calendar events
      const resEvents = await fetch(`${API_BASE_URL}/calendar/events`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (resEvents.ok) {
        const data = await resEvents.json();
        setEvents(Array.isArray(data) ? data : []);
      }

      // Fetch smart reminders
      const resRem = await fetch(`${API_BASE_URL}/schedule/reminders`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (resRem.ok) {
        const remData = await resRem.json();
        setReminders(Array.isArray(remData) ? remData : []);
      }
    } catch (err) {
      setEvents([]);
      setReminders([]);
    }
  };

  const handleAutoSchedule = async () => {
    setIsOptimizing(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("synexora_token") : null;
      const res = await fetch(`${API_BASE_URL}/schedule/auto-schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ weeklyHours: 12 }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.createdEvents && data.createdEvents.length > 0) {
          setEvents((prev) => [...data.createdEvents, ...prev]);
        }
      }
    } catch (err) {
      console.error("Auto schedule error:", err);
    } finally {
      setIsOptimizing(false);
    }
  };


  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newEvent: CalendarEventItem = {
      id: Date.now().toString(),
      title: newTitle,
      time: newTime,
      type: newType,
      room: newRoom,
    };
    setEvents([newEvent, ...events]);
    setNewTitle("");
    setIsModalOpen(false);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("synexora_token") : null;
      await fetch(`${API_BASE_URL}/calendar/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newEvent),
      });
    } catch (err) {
      console.warn("Saved event locally");
    }
  };

  const deleteEvent = (id?: string) => {
    if (!id) return;
    setEvents(events.filter((e) => (e.id || e._id) !== id));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime" pulse>Phase 8 Intelligent Scheduler</Badge>
            <span className="text-xs text-gray-500 font-mono font-medium">{events.length} Scheduled Blocks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#06383A] tracking-tight">
            Adaptive Academic Calendar
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Synchronize lecture commitments, auto-schedule high-focus study slots, and receive proactive reminders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="dark"
            size="sm"
            disabled={isOptimizing}
            onClick={handleAutoSchedule}
            icon={<Sparkles className="w-4 h-4 text-[#B7F34A]" />}
          >
            {isOptimizing ? "Optimizing Slots..." : "Auto-Schedule AI Blocks"}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Event
          </Button>
        </div>
      </div>

      {/* Contextual Smart Reminders Bar */}
      {reminders.length > 0 && (
        <div className="space-y-3">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
                rem.urgency === "HIGH"
                  ? "bg-amber-50/90 border-amber-300/80 text-amber-950"
                  : "bg-emerald-50/90 border-emerald-300/80 text-emerald-950"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl mt-0.5 ${
                    rem.urgency === "HIGH" ? "bg-amber-200/70 text-amber-900" : "bg-emerald-200/70 text-emerald-900"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm">{rem.title}</span>
                    <Badge variant={rem.urgency === "HIGH" ? "amber" : "emerald"}>{rem.urgency} Priority</Badge>
                  </div>
                  <p className="text-xs text-gray-700 mt-1 leading-relaxed max-w-2xl">{rem.message}</p>
                </div>
              </div>

              <Link href={rem.actionUrl} className="shrink-0">
                <Button variant="dark" size="sm" icon={<ArrowRight className="w-3.5 h-3.5 text-[#B7F34A]" />}>
                  {rem.actionLabel}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Calendar Week Container */}
      <Card variant="light" className="p-6 sm:p-8 space-y-6 bg-white/90 border border-gray-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-gray-400">Current Academic Term</span>
            <h2 className="font-extrabold text-lg text-[#06383A]">September 2026 • Week 37 (Midterm Prep)</h2>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1.5 text-xs font-mono font-bold bg-[#06383A] text-[#B7F34A] rounded-xl shadow-sm">
              Today
            </button>
            <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scheduled Blocks List */}
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="py-12 text-center text-gray-500 space-y-2">
              <CalendarIcon className="w-8 h-8 text-gray-300 mx-auto" />
              <div className="text-sm font-bold text-[#06383A]">No scheduled calendar blocks</div>
              <div className="text-xs text-gray-400">Add an event or use Auto-Schedule to plan your study blocks.</div>
            </div>
          ) : (
            events.map((ev, i) => {
              const evId = ev.id || ev._id || `ev-${i}`;
              const isAIBlock = ev.type === "AI Study Block";
              const isExam = ev.type === "Exam";
              const isLecture = ev.type === "Lecture";

              let badgeVariant: "lime" | "amber" | "gray" | "emerald" = "gray";
              if (isAIBlock) badgeVariant = "lime";
              else if (isExam) badgeVariant = "amber";
              else if (isLecture) badgeVariant = "emerald";

              return (
                <div
                  key={evId}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isAIBlock
                      ? "bg-emerald-50/40 border-emerald-200/80 shadow-sm"
                      : "bg-gray-50/70 border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        isAIBlock
                          ? "bg-[#06383A] text-[#B7F34A] border-[#06383A]"
                          : "bg-white text-gray-700 border-gray-200"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#06383A] uppercase">
                          {ev.time}
                        </span>
                        {ev.room && (
                          <span className="text-xs text-gray-500 font-mono">• {ev.room}</span>
                        )}
                      </div>
                      <span className="font-bold text-sm text-[#06383A] block mt-0.5">{ev.title}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <Badge variant={badgeVariant}>{ev.type}</Badge>
                    <button
                      onClick={() => deleteEvent(evId)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <Card variant="light" className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-black text-[#06383A]">Schedule Calendar Block</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 block">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Graph Algorithms Practice"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#06383A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 block">Time Slot</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#06383A] focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 block">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#06383A] focus:outline-none"
                  >
                    <option value="AI Study Block">AI Study Block</option>
                    <option value="Lecture">Lecture</option>
                    <option value="Exam">Exam</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 block">Location / Room</label>
                <input
                  type="text"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  placeholder="e.g. Library Quiet Zone"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#06383A] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="dark" size="sm" type="submit">
                  Save Event
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
