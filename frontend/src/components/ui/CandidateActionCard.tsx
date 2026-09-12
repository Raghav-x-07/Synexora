"use client";

import React, { useState } from "react";
import { Sparkles, Check, X, Edit3, ShieldAlert, CheckCircle2 } from "lucide-react";
import Button from "./Button";

export interface CandidateActionCardProps {
  category: string;
  title: string;
  value: string;
  sourceContext?: string;
  onSave?: (data: { category: string; title: string; value: string }) => void;
  onIgnore?: () => void;
}

export default function CandidateActionCard({
  category,
  title,
  value,
  sourceContext = "Detected from conversation with AI Tutor",
  onSave,
  onIgnore,
}: CandidateActionCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isIgnored, setIsIgnored] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    setIsSaved(true);
    if (onSave) onSave({ category, title, value: editValue });
  };

  const handleIgnore = () => {
    setIsIgnored(true);
    if (onIgnore) onIgnore();
  };

  if (isIgnored) return null;

  if (isSaved) {
    return (
      <div className="bg-[#B7F34A]/15 border border-[#B7F34A]/50 rounded-[20px] p-4 flex items-center justify-between text-xs text-[#06383A] animate-in fade-in duration-300">
        <div className="flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#06383A]" />
          <span>Confirmed & saved to Controlled Memory ledger: <strong>{title}</strong></span>
        </div>
        <button
          onClick={() => setIsSaved(false)}
          className="text-xs font-bold underline hover:opacity-80"
        >
          Undo
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#094748] border-2 border-[#B7F34A] rounded-[24px] p-5 sm:p-6 text-white shadow-xl space-y-4 animate-in slide-in-from-top-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#B7F34A] flex items-center justify-center text-[#06383A]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#B7F34A] block">
              Synexora Candidate Memory Notice
            </span>
            <span className="text-[11px] text-slate-300">{sourceContext}</span>
          </div>
        </div>
        <span className="text-[10px] font-mono uppercase bg-white/10 text-white/80 px-2.5 py-1 rounded-full">
          Explicit Permission Required
        </span>
      </div>

      {/* Extracted Payload */}
      <div className="bg-black/30 border border-white/10 rounded-2xl p-4 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase text-[#B7F34A]">
            Category: {category}
          </span>
          <span className="text-[11px] text-white/40">Confidence: 96%</span>
        </div>
        <div className="text-sm font-bold text-white">{title}</div>
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full bg-white/10 border border-[#B7F34A] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
          />
        ) : (
          <div className="text-xs text-slate-200">{editValue}</div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleSave} icon={<Check className="w-3.5 h-3.5" />}>
            Save to Memory
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-white border-white/20 hover:bg-white/10"
            icon={<Edit3 className="w-3.5 h-3.5" />}
          >
            {isEditing ? "Done Editing" : "Edit Details"}
          </Button>
        </div>
        <button
          onClick={handleIgnore}
          className="text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-colors px-2 py-1"
        >
          <X className="w-3.5 h-3.5" />
          <span>Ignore</span>
        </button>
      </div>
    </div>
  );
}
