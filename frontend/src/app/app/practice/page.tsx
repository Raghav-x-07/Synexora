"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Target,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  Zap,
  Flame,
  ArrowRight,
  Lightbulb,
  RefreshCw,
  BookOpen,
  Code2,
  Cpu,
  Database,
  Network,
  Binary,
  Layers,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { API_BASE_URL } from "@/lib/apiClient";

interface Question {
  id: string;
  subject: string;
  topic: string;
  difficulty: string;
  format?: string;
  title: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  keyConcept: string;
  hints?: string[];
}

interface EvaluationResult {
  isCorrect: boolean;
  score: number;
  correctIndex: number;
  explanation: string;
  keyConcept: string;
  masteryDelta: number;
  rubricBreakdown: {
    conceptualAccuracy: number;
    logicalReasoning: number;
    distractorAwareness: number;
  };
  diagnosticFeedback: string;
  topic: string;
}

const SUBJECTS = [
  { id: "Database Management Systems", label: "DBMS & SQL", icon: Database },
  { id: "Data Structures & Algorithms", label: "DSA & Algorithms", icon: Binary },
  { id: "Operating Systems", label: "Operating Systems", icon: Cpu },
  { id: "Distributed Systems", label: "Distributed Systems", icon: Network },
  { id: "Artificial Intelligence & ML", label: "AI & Neural Networks", icon: Layers },
];

const DIFFICULTIES = ["Adaptive", "Easy", "Medium", "Hard"];

export default function PracticePage() {
  const [selectedSubject, setSelectedSubject] = useState("Database Management Systems");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Adaptive");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(4);
  const [totalSolved, setTotalSolved] = useState(18);
  const [currentHintLevel, setCurrentHintLevel] = useState(0);
  const [activeHintText, setActiveHintText] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);

  // Initial load
  useEffect(() => {
    fetchNextQuestion(selectedSubject, selectedDifficulty);
  }, []);

  const fetchNextQuestion = async (subj: string, diff: string) => {
    setLoading(true);
    setSelectedOption(null);
    setEvaluation(null);
    setCurrentHintLevel(0);
    setActiveHintText(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("synexora_token") : null;
      const res = await fetch(`${API_BASE_URL}/practice/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject: subj,
          difficulty: diff,
          formatType: "mcq",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.problem) {
          setCurrentQuestion(data.problem);
        }
      } else {
        // Fallback default
        setCurrentQuestion({
          id: "q-fallback",
          subject: subj,
          topic: "Core Principles",
          difficulty: diff === "Adaptive" ? "Medium" : diff,
          title: "Identifying Normal Forms with Transitive Dependencies",
          question: "Given relation R(A, B, C, D) with functional dependencies { A -> B, B -> C, C -> D, D -> A }. In which normal form is relation R?",
          options: ["1NF only", "2NF only", "3NF but not BCNF", "BCNF"],
          correctIndex: 3,
          explanation: "Since every single attribute can derive all other attributes (A->B->C->D->A), every single attribute is a candidate key. Thus for every functional dependency X -> Y, X is a superkey, strictly satisfying BCNF.",
          keyConcept: "BCNF requires every determinant to be a superkey.",
          hints: [
            "Compute the attribute closure for each determinant: A+, B+, C+, and D+.",
            "Notice that every single attribute derives {A, B, C, D}. What does that mean for candidate keys?",
            "If every determinant X in X -> Y is a candidate key, which highest normal form condition is strictly met?"
          ]
        });
      }
    } catch (err) {
      console.error("Failed to load question:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestHint = async () => {
    if (!currentQuestion) return;
    const nextLevel = currentHintLevel + 1;
    if (nextLevel > 3) return;

    setHintLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("synexora_token") : null;
      const res = await fetch(`${API_BASE_URL}/practice/hint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          problem: currentQuestion,
          hintLevel: nextLevel,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveHintText(data.hint.hint);
        setCurrentHintLevel(nextLevel);
      } else {
        const fallbackHints = currentQuestion.hints || [
          "Focus on the primary definition and underlying rules.",
          "Check how each determinant is constrained.",
          "Verify candidate superkeys."
        ];
        setActiveHintText(fallbackHints[Math.min(nextLevel - 1, fallbackHints.length - 1)]);
        setCurrentHintLevel(nextLevel);
      }
    } catch (err) {
      console.error("Hint error:", err);
    } finally {
      setHintLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedOption === null || !currentQuestion || evaluation) return;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("synexora_token") : null;
      const res = await fetch(`${API_BASE_URL}/practice/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          problem: currentQuestion,
          userAnswer: selectedOption,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEvaluation(data.evaluation);
        if (data.evaluation.isCorrect) {
          setStreak((prev) => prev + 1);
        } else {
          setStreak(0);
        }
        setTotalSolved((prev) => prev + 1);
      } else {
        // Local evaluation fallback
        const isCorrect = selectedOption === currentQuestion.correctIndex;
        const evalRes: EvaluationResult = {
          isCorrect,
          score: isCorrect ? 100 : 0,
          correctIndex: currentQuestion.correctIndex,
          explanation: currentQuestion.explanation,
          keyConcept: currentQuestion.keyConcept,
          masteryDelta: isCorrect ? 15 : -8,
          rubricBreakdown: {
            conceptualAccuracy: isCorrect ? 100 : 25,
            logicalReasoning: isCorrect ? 100 : 40,
            distractorAwareness: isCorrect ? 100 : 20,
          },
          diagnosticFeedback: isCorrect
            ? `Solid mastery demonstrated in ${currentQuestion.topic}!`
            : `Misconception identified. Review the foundational axioms for ${currentQuestion.topic}.`,
          topic: currentQuestion.topic,
        };
        setEvaluation(evalRes);
        if (isCorrect) setStreak((s) => s + 1);
        else setStreak(0);
        setTotalSolved((t) => t + 1);
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header & Mastery Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime" pulse>Phase 7 AI Engine</Badge>
            <span className="text-xs text-gray-500 font-mono font-medium">Adaptive Question Generator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#06383A] tracking-tight">
            Adaptive Practice & Diagnostics
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Target conceptual weaknesses with real-time rubric grading and progressive Socratic hints.
          </p>
        </div>

        {/* Gamified Stats Pill */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-gray-200 shadow-sm self-start md:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-xl border border-amber-200/60">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span className="text-xs font-bold text-amber-800 font-mono">{streak} Streak</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-xl border border-emerald-200/60">
            <Zap className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-800 font-mono">{totalSolved} Solved</span>
          </div>
        </div>
      </div>

      {/* Subject & Difficulty Selector Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-gray-200/80 shadow-sm">
        {/* Subject Chips */}
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
          {SUBJECTS.map((sub) => {
            const Icon = sub.icon;
            const active = selectedSubject === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => {
                  setSelectedSubject(sub.id);
                  fetchNextQuestion(sub.id, selectedDifficulty);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  active
                    ? "bg-[#06383A] text-[#B7F34A] shadow-sm"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-[#B7F34A]" : "text-gray-500"}`} />
                {sub.label}
              </button>
            );
          })}
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl self-end lg:self-auto">
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff}
              onClick={() => {
                setSelectedDifficulty(diff);
                fetchNextQuestion(selectedSubject, diff);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedDifficulty === diff
                  ? "bg-white text-[#06383A] font-bold shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Main Problem Interactive Card */}
      {loading ? (
        <Card variant="light" className="p-12 text-center flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#06383A] animate-spin" />
          <p className="text-sm font-bold text-[#06383A]">Synthesizing diagnostic problem from knowledge graphs...</p>
        </Card>
      ) : currentQuestion ? (
        <Card variant="light" className="p-6 sm:p-8 space-y-6 relative overflow-hidden">
          {/* Question Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#06383A] bg-[#B7F34A]/30 px-2.5 py-1 rounded-lg">
                {currentQuestion.topic || currentQuestion.subject}
              </span>
              <span className="text-xs text-gray-400 font-mono">ID: {currentQuestion.id}</span>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={currentQuestion.difficulty === "Hard" ? "amber" : "lime"}>
                Difficulty: {currentQuestion.difficulty}
              </Badge>
              {evaluation && (
                <Badge variant={evaluation.isCorrect ? "emerald" : "amber"}>
                  {evaluation.isCorrect ? "Mastered" : "Needs Review"}
                </Badge>
              )}
            </div>
          </div>

          {/* Question Title & Problem Statement */}
          <div className="space-y-3">
            {currentQuestion.title && (
              <h2 className="text-lg font-bold text-[#06383A] tracking-tight">
                {currentQuestion.title}
              </h2>
            )}
            <div className="text-base sm:text-lg text-gray-800 font-medium leading-relaxed whitespace-pre-line bg-gray-50/70 p-4 sm:p-5 rounded-2xl border border-gray-100">
              {currentQuestion.question}
            </div>
          </div>

          {/* Socratic Hint Drawer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <button
                onClick={handleRequestHint}
                disabled={hintLoading || currentHintLevel >= 3 || evaluation !== null}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100/80 px-3 py-1.5 rounded-xl border border-amber-200/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                {currentHintLevel === 0 ? "Ask AI for Socratic Hint (Tier 1)" : `Next Hint Tier (${currentHintLevel}/3)`}
              </button>

              {currentHintLevel > 0 && (
                <span className="text-[11px] font-mono text-gray-500 font-medium">
                  Hint Tier {currentHintLevel} Active
                </span>
              )}
            </div>

            {activeHintText && (
              <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 leading-relaxed animate-in fade-in flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Tier {currentHintLevel} Guidance: </span>
                  {activeHintText}
                </div>
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold font-mono uppercase text-gray-400">Select Answer Option:</span>
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectAnswer = evaluation && idx === evaluation.correctIndex;
                const isWrongSelection = evaluation && isSelected && !evaluation.isCorrect;

                let optionStyles = "border-gray-200 bg-white hover:bg-gray-50 text-gray-800";
                if (isSelected && !evaluation) {
                  optionStyles = "border-[#06383A] bg-[#06383A] text-white shadow-md font-semibold";
                } else if (isCorrectAnswer) {
                  optionStyles = "!border-emerald-500 !bg-emerald-50 !text-emerald-950 font-bold shadow-sm";
                } else if (isWrongSelection) {
                  optionStyles = "!border-red-400 !bg-red-50 !text-red-950 line-through opacity-85";
                }

                return (
                  <button
                    key={idx}
                    disabled={evaluation !== null}
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between ${optionStyles}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                        isSelected && !evaluation
                          ? "bg-[#B7F34A] text-[#06383A]"
                          : isCorrectAnswer
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-snug">{option}</span>
                    </div>

                    {isCorrectAnswer && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isWrongSelection && (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Button: Submit or Next Question */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            {!evaluation ? (
              <Button
                variant="primary"
                size="md"
                disabled={selectedOption === null}
                onClick={handleSubmit}
                icon={<Target className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Submit for Instant AI Rubric Analysis
              </Button>
            ) : (
              <Button
                variant="dark"
                size="md"
                onClick={() => fetchNextQuestion(selectedSubject, selectedDifficulty)}
                icon={<Sparkles className="w-4 h-4 text-[#B7F34A]" />}
                className="w-full sm:w-auto"
              >
                Generate Next Adaptive Question
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNextQuestion(selectedSubject, selectedDifficulty)}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              className="w-full sm:w-auto"
            >
              Skip Problem
            </Button>
          </div>

          {/* Comprehensive Evaluation Diagnostic Card */}
          {evaluation && (
            <div className={`p-6 rounded-2xl border space-y-4 animate-in fade-in slide-in-from-bottom-2 ${
              evaluation.isCorrect ? "bg-emerald-50/70 border-emerald-200" : "bg-red-50/60 border-red-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {evaluation.isCorrect ? (
                    <Award className="w-5 h-5 text-emerald-700" />
                  ) : (
                    <HelpCircle className="w-5 h-5 text-red-600" />
                  )}
                  <h3 className="font-extrabold text-sm text-[#06383A]">
                    {evaluation.isCorrect ? "Diagnostic Passed: Core Concept Mastered" : "Diagnostic Finding: Review Recommended"}
                  </h3>
                </div>

                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                  evaluation.masteryDelta > 0 ? "bg-emerald-200 text-emerald-900" : "bg-red-200 text-red-900"
                }`}>
                  {evaluation.masteryDelta > 0 ? `+${evaluation.masteryDelta}%` : `${evaluation.masteryDelta}%`} Mastery Delta
                </span>
              </div>

              <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                {evaluation.diagnosticFeedback}
              </p>

              {/* Solution Walkthrough */}
              <div className="p-4 rounded-xl bg-white/90 border border-gray-200/80 space-y-2 text-xs">
                <span className="font-bold text-[#06383A] block font-mono uppercase tracking-wider">
                  Deep Conceptual Walkthrough:
                </span>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {evaluation.explanation}
                </p>
              </div>

              {/* Key Axiom Takeaway */}
              {evaluation.keyConcept && (
                <div className="p-3.5 rounded-xl bg-[#06383A] text-white flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-[#B7F34A] shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-[#B7F34A] font-mono uppercase">Key Axiom / Formula: </span>
                    <span className="font-medium text-gray-100">{evaluation.keyConcept}</span>
                  </div>
                </div>
              )}

              {/* Rubric Radar Breakdown */}
              {evaluation.rubricBreakdown && (
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-white/80 p-3 rounded-xl border border-gray-200 text-center">
                    <span className="text-[10px] uppercase font-mono text-gray-500 block">Conceptual Accuracy</span>
                    <span className="text-base font-black font-mono text-[#06383A]">
                      {evaluation.rubricBreakdown.conceptualAccuracy}%
                    </span>
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-gray-200 text-center">
                    <span className="text-[10px] uppercase font-mono text-gray-500 block">Logical Reasoning</span>
                    <span className="text-base font-black font-mono text-[#06383A]">
                      {evaluation.rubricBreakdown.logicalReasoning}%
                    </span>
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-gray-200 text-center">
                    <span className="text-[10px] uppercase font-mono text-gray-500 block">Distractor Awareness</span>
                    <span className="text-base font-black font-mono text-[#06383A]">
                      {evaluation.rubricBreakdown.distractorAwareness}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      ) : null}
    </div>
  );
}
