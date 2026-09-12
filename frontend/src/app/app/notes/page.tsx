"use client";

import React, { useState, useEffect } from "react";
import { PenTool, Sparkles, Plus, Search, FileText, Trash2, X, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { apiRequest } from "@/lib/apiClient";

interface NoteItem {
  id?: string;
  _id?: string;
  title: string;
  course?: string;
  courseId?: string;
  content: string;
  isAiSuggested?: boolean;
  isAiGenerated?: boolean;
  createdAt?: string;
  date?: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCourse, setNewCourse] = useState("CS220");
  const [newContent, setNewContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest<NoteItem[]>("/notes");
      setNotes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load notes");
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const getNoteId = (note: NoteItem) => note.id || note._id || "";

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const created = await apiRequest<NoteItem>("/notes", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle,
          course: newCourse,
          content: newContent,
        }),
      });

      setNotes([created, ...notes]);
      setNewTitle("");
      setNewContent("");
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to create note");
    }
  };

  const deleteNote = async (note: NoteItem) => {
    const id = getNoteId(note);
    setNotes(notes.filter((n) => getNoteId(n) !== id));

    try {
      await apiRequest(`/notes/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      fetchNotes();
    }
  };

  const filteredNotes = notes.filter((n) =>
    (n.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (n.content || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (n.course || n.courseId || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime">Intelligent Notes</Badge>
            <span className="text-xs text-gray-500 font-mono">{notes.length} Notes Total</span>
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

      {/* Loading State */}
      {loading && (
        <div className="py-12 text-center text-gray-500 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#06383A]" />
          <span className="text-sm font-medium">Loading your notes...</span>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchNotes}>Retry</Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredNotes.length === 0 && (
        <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-white/50 p-8 space-y-3">
          <FileText className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-bold text-base text-[#06383A]">No notes found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery
              ? `No notes matching "${searchQuery}". Try a different keyword.`
              : "You haven't recorded any notes yet. Create your first course note."}
          </p>
          {!searchQuery && (
            <Button
              variant="dark"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5 text-[#B7F34A]" />}
            >
              Create First Note
            </Button>
          )}
        </div>
      )}

      {/* Notes Grid */}
      {!loading && !error && filteredNotes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredNotes.map((note) => {
            const id = getNoteId(note);
            const courseCode = note.course || note.courseId || "General";
            const isAi = note.isAiSuggested || note.isAiGenerated;
            const dateStr = note.createdAt ? new Date(note.createdAt).toLocaleDateString() : (note.date || "Recent");

            return (
              <Card key={id} variant="light" className="p-6 flex flex-col justify-between space-y-4 hover:border-[#06383A]/30 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-[#8FD63A] uppercase">{courseCode}</span>
                    {isAi && (
                      <Badge variant="lime">
                        <Sparkles className="w-3 h-3 mr-1" /> AI Suggested
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-[#06383A] mb-2">{note.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-normal line-clamp-4">{note.content}</p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-mono">
                  <span>{dateStr}</span>
                  <button
                    onClick={() => deleteNote(note)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

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

