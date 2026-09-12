"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  GraduationCap,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { API_BASE_URL } from "@/lib/apiClient";

interface Message {
  role: "assistant" | "user";
  text: string;
  timestamp?: string;
}

function renderInline(text: string): React.ReactNode {
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
  return tokens.map((token, i) => {
    if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      return (
        <strong key={i} className="font-bold text-[#06383A]">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
      return (
        <code key={i} className="bg-[#06383A]/10 text-[#06383A] font-mono text-[11px] px-1.5 py-0.5 rounded">
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      return (
        <em key={i} className="italic text-gray-700">
          {token.slice(1, -1)}
        </em>
      );
    }
    return token;
  });
}

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-[#06383A]/20 shadow-xs">
      <div className="bg-[#031d1e] text-[#8FD63A] text-[10px] font-mono px-3 py-1.5 border-b border-white/10 flex items-center justify-between uppercase tracking-wider">
        <span>{lang || "code"}</span>
        <button
          onClick={handleCopy}
          className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors text-[10px] lowercase cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[#B7F34A]" />
              <span className="text-[#B7F34A]">copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="bg-[#042829] text-[#B7F34A] p-3.5 text-xs font-mono overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderMarkdownContent(rawText: string) {
  if (!rawText) return null;

  const blocks = rawText.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 leading-relaxed text-[#06383A]">
      {blocks.map((block, bIdx) => {
        if (block.startsWith("```")) {
          const firstLineEnd = block.indexOf("\n");
          const lang = block.slice(3, firstLineEnd).trim();
          const code = block.slice(firstLineEnd + 1, -3);
          return <CodeBlock key={bIdx} code={code} lang={lang} />;
        }

        const paragraphs = block.split(/\n\n+/);
        return paragraphs.map((para, pIdx) => {
          const trimmed = para.trim();
          if (!trimmed) return null;

          if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
            return <hr key={`${bIdx}-${pIdx}`} className="border-t border-[#06383A]/10 my-2" />;
          }

          if (trimmed.startsWith("### ")) {
            return (
              <h4 key={`${bIdx}-${pIdx}`} className="font-extrabold text-sm sm:text-base text-[#06383A] mt-2 mb-1 flex items-center gap-1.5">
                {renderInline(trimmed.replace(/^###\s+/, ""))}
              </h4>
            );
          }
          if (trimmed.startsWith("## ")) {
            return (
              <h3 key={`${bIdx}-${pIdx}`} className="font-black text-base sm:text-lg text-[#06383A] mt-2.5 mb-1">
                {renderInline(trimmed.replace(/^##\s+/, ""))}
              </h3>
            );
          }
          if (trimmed.startsWith("# ")) {
            return (
              <h2 key={`${bIdx}-${pIdx}`} className="font-black text-lg sm:text-xl text-[#06383A] mt-3 mb-1">
                {renderInline(trimmed.replace(/^#\s+/, ""))}
              </h2>
            );
          }

          if (trimmed.startsWith("> ")) {
            const quoteContent = trimmed
              .split("\n")
              .map((l) => l.replace(/^>\s*/, ""))
              .join("\n");
            return (
              <blockquote
                key={`${bIdx}-${pIdx}`}
                className="border-l-4 border-[#8FD63A] bg-[#B7F34A]/10 pl-3.5 py-2 rounded-r-xl text-xs sm:text-sm font-medium italic my-2 space-y-1"
              >
                {renderInline(quoteContent)}
              </blockquote>
            );
          }

          if (trimmed.includes("|") && trimmed.split("\n").some((l) => l.trim().startsWith("|"))) {
            const rows = trimmed.split("\n").filter((l) => l.includes("|") && !l.includes("---"));
            return (
              <div key={`${bIdx}-${pIdx}`} className="overflow-x-auto my-2 rounded-xl border border-gray-200 shadow-2xs">
                <table className="w-full text-xs text-left">
                  <tbody>
                    {rows.map((row, rIdx) => {
                      const cells = row.split("|").filter((c, ci, arr) => ci > 0 && ci < arr.length - 1);
                      if (rIdx === 0) {
                        return (
                          <tr key={rIdx} className="bg-[#06383A]/5 font-bold border-b border-gray-200">
                            {cells.map((cell, cIdx) => (
                              <th key={cIdx} className="px-3 py-2 text-[#06383A]">
                                {renderInline(cell.trim())}
                              </th>
                            ))}
                          </tr>
                        );
                      }
                      return (
                        <tr key={rIdx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60">
                          {cells.map((cell, cIdx) => (
                            <td key={cIdx} className="px-3 py-2 text-gray-700">
                              {renderInline(cell.trim())}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          }

          const lines = trimmed.split("\n");
          if (lines.length > 1 && lines.every((l) => /^\s*([*\-•]|\d+\.)\s+/.test(l))) {
            return (
              <ul key={`${bIdx}-${pIdx}`} className="space-y-1.5 my-1 pl-1">
                {lines.map((line, lIdx) => {
                  const itemText = line.replace(/^\s*([*\-•]|\d+\.)\s+/, "");
                  return (
                    <li key={lIdx} className="flex items-start gap-2 text-xs sm:text-sm">
                      <span className="text-[#8FD63A] font-bold mt-0.5">•</span>
                      <span>{renderInline(itemText)}</span>
                    </li>
                  );
                })}
              </ul>
            );
          }

          return (
            <p key={`${bIdx}-${pIdx}`} className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
              {renderInline(trimmed)}
            </p>
          );
        });
      })}
    </div>
  );
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  text: "Hello Alex! I am your **AI Tutor**. Ask me any doubt, paste a complex concept you want to break down, or request step-by-step problem walkthroughs. What would you like to master today?",
  timestamp: "Just now",
};

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("Database Management Systems");
  const [copiedMessageIdx, setCopiedMessageIdx] = useState<number | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageIdx(index);
    setTimeout(() => setCopiedMessageIdx(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  const handleSend = async (customText?: string) => {
    const userText = (customText || input).trim();
    if (!userText || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMsg: Message = { role: "user", text: userText, timestamp: timeStr };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setLoading(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("synexora_token") : null;
      const res = await fetch(`${API_BASE_URL}/orchestrator/dispatch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          query: userText,
          activeCourse: selectedSubject,
        }),
      });

      const responseTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      if (res.ok) {
        const data = await res.json();
        const responseContent =
          data.content ||
          data.response_text ||
          data.text ||
          data.message ||
          "Let's explore this concept step-by-step. What is the fundamental invariant or rule here?";
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: responseContent,
            timestamp: responseTime,
          },
        ]);
      } else {
        throw new Error("Orchestration request failed");
      }
    } catch (err) {
      // Direct fallback to AI tutor engine
      try {
        const fallbackRes = await fetch(`${API_BASE_URL}/ai/tutor/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userText, subject: selectedSubject }),
        });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          const fallbackTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              text: fallbackData.response_text || fallbackData.content || `Let's break down "${userText}" step-by-step.`,
              timestamp: fallbackTime,
            },
          ]);
          return;
        }
      } catch (fbErr) {}

      const errTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Let's break down **${userText}** together.\n\nTo understand this clearly, let's start with the core principle and work our way through each step. What is your initial intuition about how this behaves?`,
          timestamp: errTime,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { label: "BCNF vs 3NF", prompt: "Why is BCNF strictly stronger than 3NF in database normalization? Give a clear example." },
    { label: "Raft Consensus", prompt: "Explain how Raft leader election handles split votes during network partitions." },
    { label: "Process vs Thread", prompt: "What are the key memory and scheduling differences between a process and a thread?" },
    { label: "Dijkstra's Algorithm", prompt: "Walk me step-by-step through Dijkstra's shortest path algorithm with time complexity." },
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700 tracking-wide uppercase">Active Tutoring Session</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#06383A] tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-[#06383A]" />
            AI Tutor
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            Personalized step-by-step learning, concept breakdowns, and doubt resolution.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetChat}
            icon={<RotateCcw className="w-3.5 h-3.5 text-[#06383A]" />}
            className="hover:bg-gray-100 shadow-2xs"
          >
            New Chat
          </Button>
        </div>
      </div>

      {/* Quick Prompt Starters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
        <span className="text-gray-400 font-medium shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Suggested:
        </span>
        {quickPrompts.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(item.prompt)}
            className="bg-white border border-[#06383A]/10 hover:border-[#8FD63A] hover:bg-[#F4F7F2] px-3 py-1.5 rounded-full text-[#06383A] transition-all shrink-0 font-medium shadow-2xs cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Clean Interactive Chat Window */}
      <Card variant="light" className="p-0 overflow-hidden flex flex-col h-[600px] border border-[#06383A]/15 shadow-sm bg-white rounded-2xl">
        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-[#FAFCF9]/50">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${
                m.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs shadow-xs ${
                  m.role === "user"
                    ? "bg-[#06383A] text-white"
                    : "bg-[#B7F34A] text-[#06383A]"
                }`}
              >
                {m.role === "user" ? "You" : <GraduationCap className="w-4 h-4" />}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#06383A] text-white shadow-xs font-normal rounded-tr-xs"
                    : "bg-white text-[#06383A] border border-[#06383A]/10 shadow-xs rounded-tl-xs"
                }`}
              >
                {m.role === "user" ? (
                  <p className="whitespace-pre-wrap">{m.text}</p>
                ) : (
                  renderMarkdownContent(m.text)
                )}

                {/* Subtle Action & Timestamp Footer */}
                <div
                  className={`mt-2.5 pt-2 flex items-center justify-between text-[11px] ${
                    m.role === "user"
                      ? "text-white/60 border-t border-white/10"
                      : "text-gray-400 border-t border-gray-100"
                  }`}
                >
                  <span>{m.timestamp || ""}</span>

                  {m.role === "assistant" && (
                    <button
                      onClick={() => handleCopyMessage(m.text, i)}
                      className="hover:text-[#06383A] flex items-center gap-1 transition-colors cursor-pointer"
                      title="Copy response"
                    >
                      {copiedMessageIdx === i ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3 animate-in fade-in">
              <div className="w-8 h-8 rounded-full bg-[#B7F34A] text-[#06383A] flex items-center justify-center font-bold text-xs animate-pulse shadow-xs">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-gray-600 border border-[#06383A]/10 shadow-xs flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#06383A]" />
                <span className="font-medium text-[#06383A]">AI Tutor is thinking...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-white border-t border-[#06383A]/10 flex items-center gap-2.5">
          <input
            type="text"
            placeholder="Ask a question or explain a concept (e.g., 'Explain BCNF with a real-world example')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
            className="flex-1 bg-[#F2F5EE] border border-[#06383A]/10 rounded-xl px-4 py-3 text-sm text-[#06383A] placeholder-[#06383A]/40 focus:outline-none focus:border-[#06383A]/40 transition-colors"
          />
          <Button
            variant="dark"
            size="md"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            icon={<Send className="w-4 h-4 text-[#B7F34A]" />}
            className="rounded-xl px-5"
          >
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
}
