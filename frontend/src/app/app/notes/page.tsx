"use client";

import React, { useState } from "react";
import { PenTool, Sparkles, Plus, Search, FileText, Trash2, X, Check } from "lucide-react";
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCourse, setNewCourse] = useState("CS220");
  const [newContent, setNewContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    const newNote = {
      id: Date.now().toString(),
      title: newTitle,
      course: newCourse,
      content: newContent,
      isAiSuggested: false,
      date: "Just now",
    };
    setNotes([newNote, ...notes]);
    setNewTitle("");
    setNewContent("");
    setIsModalOpen(false);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        <Button
          variant="dark"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4 text-[#B7F34A]" />}
        >
          Create Note
        </Button>
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search notes or concepts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-[#06383A]/10 rounded-full pl-10 pr-4 py-2 text-xs text-[#06383A] focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filteredNotes.map((note) => (
          <Card key={note.id} variant="light" className="p-6 flex flex-col justify-between space-y-4 hover:border-[#06383A]/30 transition-all">
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
              <button
                onClick={() => deleteNote(note.id)}
                className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl border border-[#06383A]/10 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-[#06383A]">Create Course Note</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#06383A] font-bold block">
                  Note Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2PL Strict vs Rigorous Locks"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#F2F5EE] border border-[#06383A]/10 rounded-xl px-4 py-2.5 text-sm text-[#06383A] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#06383A] font-bold block">Course Code</label>
                <input
                  type="text"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  className="w-full bg-[#F2F5EE] border border-[#06383A]/10 rounded-xl px-4 py-2 text-sm text-[#06383A] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#06383A] font-bold block">Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Record your concept explanation, key formulas, or code snippets..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-[#F2F5EE] border border-[#06383A]/10 rounded-xl p-3 text-sm text-[#06383A] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="dark" size="sm" type="submit">
                  Save Note
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
