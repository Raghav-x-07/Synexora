"use client";

import React, { useState } from "react";
import { PenTool, Sparkles, Plus, Search, FileText, Check } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function NotesPage() {
  const [notes, setNotes] = useState([
    {
      id: "1",
      title: "BFS vs DFS Queue Invariants",
      course: "CS240",
      content: "BFS uses FIFO Queue ensuring vertices at distance d are visited before d+1. DFS uses LIFO Stack and explores subtree depth first.",
      isAiSuggested: true,
      date: "Sep 09, 2026",
    },
    {
      id: "2",
      title: "Raft Consensus Key Principles",
      course: "CS301",
      content: "Leader Election: randomized election timers prevent split votes. Log Replication: Leader appends log entries and broadcasts AppendEntries RPCs.",
      isAiSuggested: false,
      date: "Sep 07, 2026",
    },
    {
      id: "3",
      title: "3NF to BCNF Lossless Join Conditions",
      course: "CS220",
      content: "BCNF strictly requires every determinant to be a candidate key. If dependency preservation is lost, 3NF may be preferred.",
      isAiSuggested: true,
      date: "Sep 05, 2026",
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime">Intelligent Notes</Badge>
            <span className="text-xs text-gray-500 font-mono">AI Synthesized & Manual</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#06383A] tracking-tight">
            Course Notes
          </h1>
        </div>

        <Button variant="dark" size="sm" icon={<Plus className="w-4 h-4 text-[#B7F34A]" />}>
          Create Note
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {notes.map((note) => (
          <Card key={note.id} variant="light" className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-[#8FD63A] uppercase">{note.course}</span>
                {note.isAiSuggested && (
                  <Badge variant="lime">
                    <Sparkles className="w-3 h-3 mr-1" /> AI Suggested
                  </Badge>
                )}
              </div>
              <h3 className="font-bold text-sm text-[#06383A] mb-2">{note.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">{note.content}</p>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-mono">
              <span>{note.date}</span>
              <span className="text-[#06383A] font-bold cursor-pointer hover:underline">Open Note →</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
