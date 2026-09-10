"use client";

import React, { useState } from "react";
import { BrainCircuit, ShieldCheck, Lock, Plus, Edit3, Trash2, Search, Filter } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function MemoryPage() {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [memories, setMemories] = useState([
    {
      id: "1",
      category: "Academic Performance",
      title: "DBMS Midterm Score",
      value: "72/100 (Aiming for 85%+ in Final Exam)",
      confidence: "98%",
      date: "2026-09-08",
      isSensitive: false,
    },
    {
      id: "2",
      category: "Important Dates",
      title: "Distributed Systems Project Submission",
      value: "Friday September 12 at 23:59",
      confidence: "99%",
      date: "2026-09-09",
      isSensitive: false,
    },
    {
      id: "3",
      category: "Learning Style",
      title: "Explanation Format Preference",
      value: "Prefers interactive code traces and Socratic hints over plain textbook definitions",
      confidence: "94%",
      date: "2026-09-05",
      isSensitive: false,
    },
    {
      id: "4",
      category: "Goals",
      title: "Mastery Target for Graph Algorithms",
      value: "Achieve 90%+ diagnostic score on Dijkstra and Bellman-Ford",
      confidence: "95%",
      date: "2026-09-06",
      isSensitive: false,
    },
  ]);

  const categories = ["ALL", "Academic Performance", "Important Dates", "Learning Style", "Goals"];

  const filtered = memories.filter((m) => {
    const matchesCat = selectedCategory === "ALL" || m.category === selectedCategory;
    const matchesQuery = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.value.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime" pulse>Student Sovereignty Protocol</Badge>
            <span className="text-xs text-gray-500 font-mono">Zero Auto-Commit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#06383A] tracking-tight">
            Controlled Memory Ledger
          </h1>
        </div>

        <Button variant="dark" size="sm" icon={<Plus className="w-4 h-4 text-[#B7F34A]" />}>
          Add Manual Memory
        </Button>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-2xl bg-[#06383A] text-white border border-white/10 flex items-center justify-between text-xs">
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#B7F34A]" />
          Synexora can identify what matters. You decide what Synexora remembers.
        </span>
        <span className="font-mono text-[#B7F34A]">{memories.length} Active Records</span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? "bg-[#06383A] text-white"
                  : "bg-white border border-[#06383A]/10 text-[#06383A] hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#06383A]/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-[#06383A] focus:outline-none"
          />
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((mem) => (
          <Card key={mem.id} variant="light" className="p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#06383A]/5 text-[#06383A] font-bold">
                  {mem.category}
                </span>
                <span className="text-xs text-gray-400 font-mono">{mem.date}</span>
              </div>
              <h3 className="font-bold text-sm text-[#06383A] mb-1">{mem.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{mem.value}</p>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-400 font-mono text-[11px]">Confidence: {mem.confidence}</span>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setMemories(memories.filter((m) => m.id !== mem.id))}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

    </div>
  );
}
