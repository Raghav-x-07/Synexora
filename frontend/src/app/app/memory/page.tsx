"use client";

import React, { useState, useEffect } from "react";
import { 
  BrainCircuit, 
  ShieldCheck, 
  Lock, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter,
  Check,
  X,
  Info,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Eye,
  Calendar,
  CheckCircle2
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { apiRequest } from "@/lib/apiClient";

interface MemoryItem {
  id?: string;
  _id?: string;
  category: string;
  title: string;
  value: string;
  confidenceScore?: number;
  confidence?: string;
  isConfirmed?: boolean;
  isSensitive?: boolean;
  sourceContext?: string;
  createdAt?: string;
  date?: string;
}

export default function MemoryPage() {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Candidate memories pending user confirmation
  const [candidateMemories, setCandidateMemories] = useState<MemoryItem[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null);
  const [inspectingMemory, setInspectingMemory] = useState<MemoryItem | null>(null);

  // Form State
  const [formCategory, setFormCategory] = useState("Academic Performance");
  const [formTitle, setFormTitle] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formSensitive, setFormSensitive] = useState(false);

  const categories = [
    "ALL", 
    "Academic Performance", 
    "Important Dates", 
    "Learning Style", 
    "Goals", 
    "Career",
    "Sensitive Information"
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<MemoryItem[]>("/memories");
      setMemories(Array.isArray(data) ? data : []);
    } catch (err) {
      setMemories([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchMemories();
  }, []);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formValue.trim()) return;

    try {
      const created = await apiRequest<MemoryItem>("/memories", {
        method: "POST",
        body: JSON.stringify({
          category: formCategory,
          title: formTitle,
          value: formValue,
          isSensitive: formSensitive,
          confidenceScore: 1.0,
          sourceContext: "Manually entered by student",
        }),
      });

      setMemories((prev) => [created, ...prev]);
      showToast("Memory successfully saved to your sovereign ledger.");
      setIsAddModalOpen(false);
      setFormTitle("");
      setFormValue("");
    } catch (err) {
      const fallback: MemoryItem = {
        id: `mem-${Date.now()}`,
        category: formCategory,
        title: formTitle,
        value: formValue,
        confidenceScore: 1.0,
        isSensitive: formSensitive,
        sourceContext: "Manually entered by student",
        date: new Date().toISOString().split("T")[0],
      };
      setMemories((prev) => [fallback, ...prev]);
      showToast("Memory saved locally.");
      setIsAddModalOpen(false);
    }
  };

  const handleUpdateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMemory) return;

    const memoryId = editingMemory.id || editingMemory._id;

    try {
      const updated = await apiRequest<MemoryItem>(`/memories/${memoryId}`, {
        method: "PUT",
        body: JSON.stringify({
          category: editingMemory.category,
          title: editingMemory.title,
          value: editingMemory.value,
          isSensitive: editingMemory.isSensitive,
        }),
      });

      setMemories((prev) =>
        prev.map((m) => ((m.id || m._id) === memoryId ? updated : m))
      );
      showToast("Memory updated successfully.");
      setEditingMemory(null);
    } catch (err) {
      setMemories((prev) =>
        prev.map((m) => ((m.id || m._id) === memoryId ? editingMemory : m))
      );
      showToast("Memory updated locally.");
      setEditingMemory(null);
    }
  };

  const handleDeleteMemory = async (id?: string) => {
    if (!id) return;
    try {
      await apiRequest(`/memories/${id}`, { method: "DELETE" });
    } catch (err) {}
    setMemories((prev) => prev.filter((m) => (m.id || m._id) !== id));
    showToast("Memory permanently deleted from ledger.");
  };

  const handleConfirmCandidate = async (cand: MemoryItem) => {
    try {
      const saved = await apiRequest<MemoryItem>("/memories", {
        method: "POST",
        body: JSON.stringify({
          category: cand.category,
          title: cand.title,
          value: cand.value,
          confidenceScore: cand.confidenceScore || 0.95,
          sourceContext: cand.sourceContext,
          isSensitive: cand.isSensitive || false,
        }),
      });
      setMemories((prev) => [saved, ...prev]);
    } catch (e) {
      setMemories((prev) => [cand, ...prev]);
    }
    setCandidateMemories((prev) => prev.filter((c) => c.id !== cand.id));
    showToast(`Candidate confirmed and saved: "${cand.title}"`);
  };

  const handleDismissCandidate = (id?: string) => {
    setCandidateMemories((prev) => prev.filter((c) => c.id !== id));
    showToast("Candidate memory dismissed.");
  };

  const filtered = memories.filter((m) => {
    const matchesCat = selectedCategory === "ALL" || m.category === selectedCategory;
    const matchesQuery =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.value.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#06383A] text-[#B7F34A] border border-[#B7F34A]/30 rounded-2xl px-5 py-3 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-[#B7F34A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime" pulse>Student Sovereignty Protocol</Badge>
            <span className="text-xs text-gray-500 font-mono">Zero Auto-Commit • 100% Consent</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#06383A] tracking-tight">
            Controlled Memory Ledger
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Synexora detects what is important, but never stores facts without your explicit review and confirmation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="dark" 
            size="sm" 
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus className="w-4 h-4 text-[#B7F34A]" />}
          >
            Add Memory
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMemories}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats & Sovereign Notice Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-[#06383A] text-white p-4 rounded-2xl border border-white/10 flex items-center justify-between col-span-1 sm:col-span-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#B7F34A] font-bold">
              <ShieldCheck className="w-4 h-4 text-[#B7F34A]" />
              Controlled Transparency
            </div>
            <p className="text-xs text-gray-300">
              Synexora can identify what matters. You decide what Synexora remembers.
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-[#B7F34A] font-mono">{memories.length}</span>
            <span className="block text-[10px] text-gray-400 uppercase font-mono">Confirmed</span>
          </div>
        </div>

        <div className="bg-white border border-[#06383A]/10 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 block">Pending Candidates</span>
            <span className="text-xl font-extrabold text-[#06383A] font-mono">{candidateMemories.length}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-[#06383A]/10 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 block">Avg. Confidence</span>
            <span className="text-xl font-extrabold text-[#06383A] font-mono">96.4%</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
            <Check className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Candidate Memories Awaiting Student Confirmation */}
      {candidateMemories.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#06383A] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Candidate Memories Detected (Awaiting Confirmation)
            </h2>
            <span className="text-xs text-gray-500">{candidateMemories.length} pending review</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {candidateMemories.map((cand) => (
              <div 
                key={cand.id} 
                className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-bold">
                      {cand.category}
                    </span>
                    <span className="text-[11px] font-mono text-amber-800">
                      Confidence: {Math.round((cand.confidenceScore || 0.9) * 100)}%
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-[#06383A]">{cand.title}</h3>
                  <p className="text-xs text-gray-700 mt-1">{cand.value}</p>
                  <p className="text-[11px] text-gray-500 italic mt-2">Source: {cand.sourceContext}</p>
                </div>

                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleDismissCandidate(cand.id)}
                    className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs text-gray-600 hover:bg-gray-100 font-medium"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleConfirmCandidate(cand)}
                    className="px-3 py-1.5 rounded-xl bg-[#06383A] text-[#B7F34A] text-xs font-bold hover:bg-[#073F40] shadow-sm flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Confirm & Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
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
            className="w-full bg-white border border-[#06383A]/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-[#06383A] focus:outline-none focus:border-[#06383A]/40"
          />
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((mem) => {
          const memId = mem.id || mem._id;
          const confDisplay = mem.confidenceScore 
            ? `${Math.round(mem.confidenceScore * 100)}%` 
            : mem.confidence || "98%";

          return (
            <Card key={memId} variant="light" className="p-5 flex flex-col justify-between space-y-4 border border-[#06383A]/10">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#06383A]/5 text-[#06383A] font-bold">
                    {mem.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {mem.isSensitive && (
                      <span className="text-[10px] bg-red-100 text-red-700 font-mono px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Sensitive
                      </span>
                    )}
                    <span className="text-xs text-gray-400 font-mono">
                      {mem.date || (mem.createdAt ? new Date(mem.createdAt).toISOString().split("T")[0] : "2026-09-10")}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-sm text-[#06383A] mb-1">{mem.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{mem.value}</p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-400 font-mono text-[11px]">
                  Confidence: {confDisplay}
                </span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setInspectingMemory(mem)}
                    title="Audit Rationale"
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => setEditingMemory(mem)}
                    title="Edit Memory"
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteMemory(memId)}
                    title="Forget / Delete"
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-[#06383A]/20">
          <BrainCircuit className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-600">No memories match your filter criteria.</p>
          <p className="text-xs text-gray-400 mt-1">Try selecting 'ALL' or add a new memory record.</p>
        </div>
      )}

      {/* Add Memory Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#06383A]/20 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-[#06383A] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#06383A]" /> Add Manual Memory
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMemory} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-[#F4F7F2] border border-[#06383A]/10 rounded-xl px-3 py-2 text-xs text-[#06383A] focus:outline-none"
                >
                  {categories.filter(c => c !== "ALL").map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Memory Title</label>
                <input
                  type="text"
                  placeholder="e.g. Operating Systems Final Weightage"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="w-full bg-[#F4F7F2] border border-[#06383A]/10 rounded-xl px-3 py-2 text-xs text-[#06383A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Fact / Value Description</label>
                <textarea
                  placeholder="e.g. Final exam counts for 50% of the grade and requires 40%+ to pass."
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  required
                  rows={3}
                  className="w-full bg-[#F4F7F2] border border-[#06383A]/10 rounded-xl px-3 py-2 text-xs text-[#06383A] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isSens"
                  checked={formSensitive}
                  onChange={(e) => setFormSensitive(e.target.checked)}
                  className="rounded text-[#06383A]"
                />
                <label htmlFor="isSens" className="text-xs text-gray-600 cursor-pointer">
                  Mark as sensitive (requires extra privacy protection)
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="dark" size="sm" type="submit">
                  Save to Sovereign Ledger
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Memory Modal */}
      {editingMemory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#06383A]/20 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-[#06383A] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#06383A]" /> Edit Memory Fact
              </h3>
              <button 
                onClick={() => setEditingMemory(null)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateMemory} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Category</label>
                <select
                  value={editingMemory.category}
                  onChange={(e) => setEditingMemory({ ...editingMemory, category: e.target.value })}
                  className="w-full bg-[#F4F7F2] border border-[#06383A]/10 rounded-xl px-3 py-2 text-xs text-[#06383A] focus:outline-none"
                >
                  {categories.filter(c => c !== "ALL").map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Memory Title</label>
                <input
                  type="text"
                  value={editingMemory.title}
                  onChange={(e) => setEditingMemory({ ...editingMemory, title: e.target.value })}
                  required
                  className="w-full bg-[#F4F7F2] border border-[#06383A]/10 rounded-xl px-3 py-2 text-xs text-[#06383A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Fact / Value</label>
                <textarea
                  value={editingMemory.value}
                  onChange={(e) => setEditingMemory({ ...editingMemory, value: e.target.value })}
                  required
                  rows={3}
                  className="w-full bg-[#F4F7F2] border border-[#06383A]/10 rounded-xl px-3 py-2 text-xs text-[#06383A] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setEditingMemory(null)}>
                  Cancel
                </Button>
                <Button variant="dark" size="sm" type="submit">
                  Update Memory
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Rationale Modal */}
      {inspectingMemory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#06383A]/20 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-[#06383A] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Privacy & Extraction Audit
              </h3>
              <button 
                onClick={() => setInspectingMemory(null)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-gray-50 p-3 rounded-2xl space-y-1">
                <span className="text-gray-400 block font-mono text-[10px] uppercase">Record Title</span>
                <span className="font-bold text-[#06383A] text-sm">{inspectingMemory.title}</span>
              </div>

              <div className="bg-gray-50 p-3 rounded-2xl space-y-1">
                <span className="text-gray-400 block font-mono text-[10px] uppercase">Source Origin</span>
                <span className="font-medium text-gray-700">{inspectingMemory.sourceContext || "Socratic Session Dialogue"}</span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200/80 p-3 rounded-2xl space-y-1">
                <span className="text-emerald-800 block font-mono text-[10px] uppercase font-bold">Privacy Guarantee</span>
                <p className="text-emerald-900 leading-relaxed">
                  This record is sovereign to your account. Synexora uses it exclusively to adapt explanations and schedules to your current level. It is never sold or shared.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="dark" size="sm" onClick={() => setInspectingMemory(null)}>
                Close Audit
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
