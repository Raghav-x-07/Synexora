"use client";

import React from "react";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function CalendarPage() {
  const events = [
    { time: "09:00 - 10:30", title: "CS301 Lecture: Distributed Consensus & Raft", type: "Lecture", room: "Hall B" },
    { time: "14:00 - 15:30", title: "Synexora Auto-Scheduled Study: B-Tree Practice", type: "AI Study Block", room: "Library" },
    { time: "18:00 - 19:00", title: "DBMS Group Project Sync", type: "Meeting", room: "Online" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime">Intelligent Time Blocking</Badge>
            <span className="text-xs text-gray-500 font-mono">Synced with Syllabus Deadlines</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#06383A] tracking-tight">
            Adaptive Academic Calendar
          </h1>
        </div>

        <Button variant="dark" size="sm" icon={<Plus className="w-4 h-4 text-[#B7F34A]" />}>
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
          {events.map((ev, i) => (
            <div key={i} className="p-4 rounded-2xl bg-[#F2F5EE] border border-[#06383A]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white border border-[#06383A]/10 text-[#06383A]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-[#8FD63A] uppercase block">{ev.time}</span>
                  <span className="font-bold text-sm text-[#06383A]">{ev.title}</span>
                </div>
              </div>
              <Badge variant={ev.type === "AI Study Block" ? "lime" : "gray"}>{ev.type}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
