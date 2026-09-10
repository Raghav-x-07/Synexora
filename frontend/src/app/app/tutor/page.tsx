"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  GraduationCap, 
  BrainCircuit, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  Lightbulb, 
  Code2, 
  ChevronRight, 
  HelpCircle, 
  RefreshCw,
  BookmarkPlus,
  Calendar,
  Check
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import CandidateActionCard from "@/components/ui/CandidateActionCard";
import { apiRequest } from "@/lib/apiClient";

interface Message {
  role: "assistant" | "user";
  text: string;
  hints?: string[];
  drillQuestions?: string[];
  proposedMemories?: any[];
  proposedTasks?: any[];
  codeTrace?: any;
}

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hello Alex! I'm Synexora, your Socratic AI Tutor. Rather than just giving answers, I'll guide you through intuitive reasoning and step-by-step problem breakdown. What topic or doubt are we exploring today?",
      hints: [
        "You can type: 'Why is BCNF stricter than 3NF?' or 'Explain recursion step by step'",
        "Mention your recent grades or deadlines (e.g. 'I got 72 in DBMS') to see candidate memory cards!"
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeHintIndex, setActiveHintIndex] = useState<{ [msgIdx: number]: number }>({});
  const [selectedSubject, setSelectedSubject] = useState("Database Management Systems");
  const [savedActionIds, setSavedActionIds] = useState<{ [key: string]: boolean }>({});
  const [codeTraceModal, setCodeTraceModal] = useState<any | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const newMsg: Message = { role: "user", text: userText };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await apiRequest("/ai/tutor/chat", {
        method: "POST",
        body: JSON.stringify({
          message: userText,
          subject: selectedSubject,
          masteryLevel: "INTERMEDIATE",
          conversationHistory: messages.slice(-4).map((m) => ({
            role: m.role,
            content: m.text,
          })),
        }),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: res.response_text || "Let's explore this step-by-step. What is the key constraint you notice first?",
          hints: res.hints || [],
          drillQuestions: res.drill_questions || [],
          proposedMemories: res.proposed_memories || [],
          proposedTasks: res.proposed_tasks || [],
        },
      ]);
    } catch (err) {
      // Graceful offline heuristic response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Let's break down "${userText}" together. What is the fundamental invariant or base condition in this scenario?`,
          hints: [
            "Think about the smallest possible valid input state.",
            "Consider what edge cases might break standard assumptions."
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMemory = async (mem: any) => {
    try {
      await apiRequest("/memories", {
        method: "POST",
        body: JSON.stringify({
          category: mem.category || "ACADEMIC",
          title: mem.title,
          value: mem.value,
          confidenceScore: mem.confidenceScore || 0.9,
          source: "Socratic AI Tutor",
        }),
      });
      setSavedActionIds((prev) => ({ ...prev, [mem.id || mem.title]: true }));
    } catch (e) {
      setSavedActionIds((prev) => ({ ...prev, [mem.id || mem.title]: true }));
    }
  };

  const handleSaveTask = async (task: any) => {
    try {
      await apiRequest("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: task.title,
          priority: task.priority || "HIGH",
          dueDate: task.dueDate || new Date().toISOString().split("T")[0],
          subjectTag: task.subjectTag || "Coursework",
        }),
      });
      setSavedActionIds((prev) => ({ ...prev, [task.id || task.title]: true }));
    } catch (e) {
      setSavedActionIds((prev) => ({ ...prev, [task.id || task.title]: true }));
    }
  };

  const openSampleCodeTrace = async () => {
    try {
      const trace = await apiRequest("/ai/tutor/code-trace", {
        method: "POST",
        body: JSON.stringify({
          codeSnippet: "function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}",
          language: "javascript",
        }),
      });
      setCodeTraceModal(trace);
    } catch (e) {
      setCodeTraceModal({
        code: "function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}",
        language: "javascript",
        total_steps: 4,
        trace_steps: [
          { step: 1, line: 1, explanation: "factorial(3) invoked on call stack.", variable_state: { n: 3 } },
          { step: 2, line: 3, explanation: "Guard (n <= 1) is false. Invoking factorial(2).", variable_state: { n: 2 } },
          { step: 3, line: 3, explanation: "Guard is false. Invoking factorial(1).", variable_state: { n: 1 } },
          { step: 4, line: 2, explanation: "Base condition reached! Returns 1. Unwinding stack: 3 * 2 * 1 = 6.", variable_state: { result: 6 } }
        ],
        complexity: { time: "O(N)", space: "O(N)" }
      });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime" pulse>Socratic Teaching Engine</Badge>
            <span className="text-xs font-mono text-gray-500">MERN Stack • Synexora v1.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#06383A] tracking-tight">
            AI Socratic Tutor
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Interactive reasoning, step-by-step doubt breakdown, and controlled memory transparency.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={openSampleCodeTrace}
            icon={<Code2 className="w-3.5 h-3.5 text-[#06383A]" />}
          >
            Code Trace Visualizer
          </Button>
          <div className="bg-[#06383A]/5 border border-[#06383A]/10 rounded-xl px-3 py-1.5 text-xs text-[#06383A] font-medium flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-[#06383A]" />
            <span>Subject:</span>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer"
            >
              <option value="Database Management Systems">DBMS (CS220)</option>
              <option value="Design & Analysis of Algorithms">Algorithms (CS301)</option>
              <option value="Operating Systems">Operating Systems (CS310)</option>
              <option value="Computer Networks">Networks (CS320)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Prompt Starters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-gray-400 font-medium shrink-0">Try asking:</span>
        <button
          onClick={() => setInput("Why is BCNF stricter than 3NF in database normalization?")}
          className="bg-white border border-[#06383A]/10 hover:border-[#B7F34A] px-3 py-1.5 rounded-full text-[#06383A] transition-colors shrink-0"
        >
          🔍 BCNF vs 3NF condition
        </button>
        <button
          onClick={() => setInput("I scored 72 in DBMS and need to submit the project on Friday.")}
          className="bg-white border border-[#06383A]/10 hover:border-[#B7F34A] px-3 py-1.5 rounded-full text-[#06383A] transition-colors shrink-0"
        >
          💡 "I scored 72 in DBMS and project is due Friday"
        </button>
        <button
          onClick={() => setInput("How does recursion handle call stack frames for factorial?")}
          className="bg-white border border-[#06383A]/10 hover:border-[#B7F34A] px-3 py-1.5 rounded-full text-[#06383A] transition-colors shrink-0"
        >
          🧩 Recursion stack frames
        </button>
      </div>

      {/* Interactive Chat Window */}
      <Card variant="light" className="p-0 overflow-hidden flex flex-col h-[560px] border border-[#06383A]/15 shadow-sm">
        
        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className="space-y-3">
              <div
                className={`flex items-start gap-3 ${
                  m.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs shadow-sm ${
                    m.role === "user"
                      ? "bg-[#06383A] text-white"
                      : "bg-[#B7F34A] text-[#06383A]"
                  }`}
                >
                  {m.role === "user" ? "AR" : <BrainCircuit className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div
                  className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#06383A] text-white"
                      : "bg-[#F4F7F2] text-[#06383A] border border-[#06383A]/10 shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {/* Socratic Progressive Hints */}
                  {m.hints && m.hints.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#06383A]/10 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold flex items-center gap-1.5 text-[#06383A]/80">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                          Socratic Thought Guides ({m.hints.length}):
                        </span>
                        <button
                          onClick={() =>
                            setActiveHintIndex((prev) => ({
                              ...prev,
                              [i]: ((prev[i] ?? -1) + 1) % m.hints!.length,
                            }))
                          }
                          className="text-xs font-bold text-[#06383A] underline hover:text-black cursor-pointer"
                        >
                          {activeHintIndex[i] === undefined ? "Reveal Hint" : "Next Hint →"}
                        </button>
                      </div>

                      {activeHintIndex[i] !== undefined && (
                        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-2.5 text-xs text-amber-900 animate-in fade-in">
                          <span className="font-bold">Hint {(activeHintIndex[i] || 0) + 1}:</span>{" "}
                          {m.hints[activeHintIndex[i] || 0]}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Drill Questions */}
                  {m.drillQuestions && m.drillQuestions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-[#06383A]/10 text-xs">
                      <span className="font-semibold text-gray-600 block mb-1">Self-Check Question:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-gray-700">
                        {m.drillQuestions.map((q, qIdx) => (
                          <li key={qIdx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Proposed Candidate Action Cards (Memories / Tasks) */}
              {m.proposedMemories && m.proposedMemories.length > 0 && (
                <div className="ml-11 max-w-xl space-y-2 animate-in fade-in slide-in-from-top-2">
                  {m.proposedMemories.map((mem, memIdx) => {
                    const isSaved = savedActionIds[mem.id || mem.title];
                    return (
                      <div 
                        key={memIdx}
                        className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 text-xs text-[#06383A] flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                            <BookmarkPlus className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Candidate Memory Detected</span>
                            <span className="bg-emerald-200 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-md uppercase font-mono">
                              {mem.category}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-800">{mem.title}: <span className="font-normal text-gray-600">{mem.value}</span></p>
                        </div>
                        <Button
                          variant={isSaved ? "outline" : "dark"}
                          size="sm"
                          onClick={() => handleSaveMemory(mem)}
                          disabled={isSaved}
                        >
                          {isSaved ? <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-600" /> Saved</span> : "Save to Memory"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {m.proposedTasks && m.proposedTasks.length > 0 && (
                <div className="ml-11 max-w-xl space-y-2 animate-in fade-in slide-in-from-top-2">
                  {m.proposedTasks.map((task, taskIdx) => {
                    const isSaved = savedActionIds[task.id || task.title];
                    return (
                      <div 
                        key={taskIdx}
                        className="bg-blue-50 border border-blue-200/80 rounded-2xl p-3.5 text-xs text-[#06383A] flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-blue-900">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            <span>Candidate Task & Deadline</span>
                            <span className="bg-blue-200 text-blue-800 text-[10px] px-1.5 py-0.2 rounded-md font-mono">
                              Due: {task.dueDate}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-800">{task.title}</p>
                        </div>
                        <Button
                          variant={isSaved ? "outline" : "dark"}
                          size="sm"
                          onClick={() => handleSaveTask(task)}
                          disabled={isSaved}
                        >
                          {isSaved ? <span className="flex items-center gap-1"><Check className="w-3 h-3 text-blue-600" /> Added</span> : "Add to Tasks"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#B7F34A] text-[#06383A] flex items-center justify-center font-bold text-xs animate-pulse">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div className="bg-[#F4F7F2] rounded-2xl px-4 py-3 text-xs text-gray-500 border border-[#06383A]/10 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#06383A]" />
                <span>Synexora is formulating Socratic hints & step-by-step reasoning...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-[#06383A]/10 flex items-center gap-3">
          <input
            type="text"
            placeholder="Type your response or concept doubt (e.g. 'I scored 72 in DBMS and need to review')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
            className="flex-1 bg-[#F2F5EE] border border-[#06383A]/10 rounded-full px-5 py-3 text-sm text-[#06383A] placeholder-[#06383A]/40 focus:outline-none focus:border-[#06383A]/40"
          />
          <Button 
            variant="dark" 
            size="md" 
            onClick={handleSend} 
            disabled={loading || !input.trim()}
            icon={<Send className="w-4 h-4 text-[#B7F34A]" />}
          >
            Send
          </Button>
        </div>
      </Card>

      {/* Code Trace Modal */}
      {codeTraceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 border border-[#06383A]/20 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#06383A]" />
                <h3 className="font-bold text-lg text-[#06383A]">Interactive Code Trace Visualizer</h3>
              </div>
              <button 
                onClick={() => setCodeTraceModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#06383A] text-[#B7F34A] p-4 rounded-2xl font-mono text-xs overflow-x-auto">
              <pre>{codeTraceModal.code}</pre>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Step-by-Step Execution Frames:</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {codeTraceModal.trace_steps?.map((step: any, sIdx: number) => (
                  <div key={sIdx} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs flex items-start gap-3">
                    <span className="bg-[#06383A] text-[#B7F34A] font-bold px-2 py-0.5 rounded-md font-mono">
                      Step {step.step}
                    </span>
                    <div className="flex-1 space-y-1">
                      <p className="text-gray-800 font-medium">{step.explanation}</p>
                      <div className="text-[11px] font-mono text-gray-500 bg-white border border-gray-200 p-1.5 rounded-lg">
                        State: {JSON.stringify(step.variable_state)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-gray-100 text-xs text-gray-500">
              <span>Time: <strong className="text-gray-800">{codeTraceModal.complexity?.time}</strong></span>
              <span>Space: <strong className="text-gray-800">{codeTraceModal.complexity?.space}</strong></span>
              <Button variant="dark" size="sm" onClick={() => setCodeTraceModal(null)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
