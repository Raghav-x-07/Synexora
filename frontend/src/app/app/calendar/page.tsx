"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function CalendarPage() {
  const [events, setEvents] = useState([
    { id: "1", time: "09:00 - 10:30", title: "CS301 Lecture: Distributed Consensus & Raft", type: "Lecture", room: "Hall B" },
    { id: "2", time: "14:00 - 15:30", title: "Synexora Auto-Scheduled Study: B-Tree Practice", type: "AI Study Block", room: "Library" },
    { id: "3", time: "18:00 - 19:00", title: "DBMS Group Project Sync", type: "Meeting", room: "Online" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("16:00 - 17:30");
  const [newType, setNewType] = useState("AI Study Block");
  const [newRoom, setNewRoom] = useState("Library");

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newEvent = {
      id: Date.now().toString(),
      title: newTitle,
      time: newTime,
      type: newType,
      room: newRoom,
    };
    setEvents([...events, newEvent]);
    setNewTitle("");
    setIsModalOpen(false);
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime">Intelligent Time Blocking</Badge>
            <span className="text-xs text-gray-500 font-mono">{events.length} Scheduled Blocks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#06383A] tracking-tight">
            Adaptive Academic Calendar
          </h1>
        </div>

        <Button
          variant="dark"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4 text-[#B7F34A]" />}
        >
          Add Study Block
        </Button>
      </div>

      <Card variant="light" className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="font-extrabold text-lg text-[#06383A]">September 2026 • Week 37</div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"><ChevronLeft className="w-4 h-4" /></button>
            <button className="px-3 py-1 text-xs font-bold bg-[#06383A] text-white rounded-lg">Today</button>
            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="space-y-3">
          {events.map((ev) => (
            <div key={ev.id} className="p-4 rounded-2xl bg-[#F2F5EE] border border-[#06383A]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white border border-[#06383A]/10 text-[#06383A]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-[#8FD63A] uppercase block">{ev.time} • {ev.room}</span>
                  <span className="font-bold text-sm text-[#06383A]">{ev.title}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={ev.type === "AI Study Block" ? "lime" : "gray"}>{ev.type}</Badge>
                <button
                  onClick={() => deleteEvent(ev.id)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl border border-[#06383A]/10 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-[#06383A]">Schedule Calendar Block</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#06383A] font-bold block">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Graph Algorithms Practice"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#F2F5EE] border border-[#06383A]/10 rounded-xl px-4 py-2.5 text-sm text-[#06383A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#06383A] font-bold block">Time Slot</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-[#F2F5EE] border border-[#06383A]/10 rounded-xl px-4 py-2 text-sm text-[#06383A] focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#06383A] font-bold block">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-[#F2F5EE] border border-[#06383A]/10 rounded-xl px-4 py-2 text-sm text-[#06383A] focus:outline-none"
                  >
                    <option value="AI Study Block">AI Study Block</option>
                    <option value="Lecture">Lecture</option>
                    <option value="Exam">Exam</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="dark" size="sm" type="submit">
                  Save Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
