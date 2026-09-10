"use client";

import React from "react";
import { Target, Plus, CheckCircle2, ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function GoalsPage() {
  const goals = [
    { title: "Achieve 85%+ in DBMS Final Exam", deadline: "Dec 15, 2026", progress: 68, status: "On Track" },
    { title: "Complete Raft Consensus Implementation with 100% test pass", deadline: "Oct 01, 2026", progress: 85, status: "Ahead" },
    { title: "Maintain 30-Day Daily Study Streak", deadline: "Ongoing", progress: 46, status: "Active (14/30 Days)" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime">Academic Aspirations</Badge>
            <span className="text-xs text-gray-500 font-mono">Fall 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#06383A] tracking-tight">
            Academic Goals
          </h1>
        </div>

        <Button variant="dark" size="sm" icon={<Plus className="w-4 h-4 text-[#B7F34A]" />}>
          Set New Goal
        </Button>
      </div>

      <div className="space-y-4">
        {goals.map((g, idx) => (
          <Card key={idx} variant="light" className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-base text-[#06383A]">{g.title}</span>
              <Badge variant="lime">{g.status}</Badge>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Target Deadline: {g.deadline}</span>
              <span className="font-mono font-bold text-[#06383A]">{g.progress}% Completed</span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-[#B7F34A] rounded-full" style={{ width: `${g.progress}%` }} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
