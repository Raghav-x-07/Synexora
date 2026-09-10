"use client";

import React, { useState } from "react";
import { Sparkles, Send, GraduationCap, BrainCircuit, BookOpen, Layers, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import CandidateActionCard from "@/components/ui/CandidateActionCard";

export default function AITutorPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello Alex! I am your Synexora Socratic AI Tutor. Which topic or problem would you like to explore together today?",
    },
    {
      role: "user",
      text: "Can you help me understand why BCNF is stricter than 3NF in database normalization?",
    },
    {
      role: "assistant",
      text: "Great question! Let's break this down Socratically. Recall the condition for 3NF: for every non-trivial functional dependency X → Y, either X is a superkey OR Y is a prime attribute. What limitation do you think arises when Y is allowed to be a prime attribute without X being a superkey?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { role: "user", text: input };
    setMessages((prev) => [
      ...prev,
      newMsg,
      {
        role: "assistant",
        text: `Understood. Analyzing "${input}" against your course notes. Let's examine the dependencies step-by-step: what happens to anomalies when redundancy remains in non-superkey determinants?`,
      },
    ]);
    setInput("");
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime" pulse>Socratic Teaching Engine</Badge>
            <span className="text-xs font-mono text-gray-500">CS220 • DBMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#06383A] tracking-tight">
            AI Socratic Tutor
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<BookOpen className="w-3.5 h-3.5" />}>
            Course Syllabus
          </Button>
          <Button variant="dark" size="sm" icon={<Layers className="w-3.5 h-3.5" />}>
            Diagnostic Mode
          </Button>
        </div>
      </div>

      {/* Candidate Notice Component */}
      <CandidateActionCard
        category="Target Goal"
        title="Master BCNF & 3NF Lossless Decomposition"
        value="Target: Complete 5 practice problems before Friday."
        sourceContext="Detected from current Socratic session"
      />

      {/* Interactive Chat Window */}
      <Card variant="light" className="p-0 overflow-hidden flex flex-col h-[520px]">
        {/* Chat Stream Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${
                m.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                  m.role === "user"
                    ? "bg-[#06383A] text-white"
                    : "bg-[#B7F34A] text-[#06383A]"
                }`}
              >
                {m.role === "user" ? "AR" : "S"}
              </div>

              <div
                className={`max-w-xl rounded-2xl p-4 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#06383A] text-white"
                    : "bg-[#F2F5EE] text-[#06383A] border border-[#06383A]/10"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-[#06383A]/10 flex items-center gap-3">
          <input
            type="text"
            placeholder="Type your response or question to continue the Socratic dialogue..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-[#F2F5EE] border border-[#06383A]/10 rounded-full px-5 py-3 text-sm text-[#06383A] placeholder-[#06383A]/40 focus:outline-none focus:border-[#06383A]/40"
          />
          <Button variant="dark" size="md" onClick={handleSend} icon={<Send className="w-4 h-4 text-[#B7F34A]" />}>
            Send
          </Button>
        </div>
      </Card>

    </div>
  );
}
