"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck2,
  Award,
  ArrowRight,
  Clock,
  Plus,
  Target,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BookOpen,
  RefreshCw,
  Layers,
  Flag,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  X,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { API_BASE_URL } from "@/lib/apiClient";

interface AssessmentItem {
  _id: string;
  title: string;
  subject: string;
  difficulty: string;
  status: string;
  score: number;
  totalPoints: number;
  percentage: number;
  durationMinutes: number;
  timeSpentSeconds?: number;
  questions: any[];
  topicBreakdown: { topic: string; total: number; correct: number; masteryScore: number }[];
  rubricEvaluation?: {
    conceptualAccuracy: number;
    logicalReasoning: number;
    distractorAwareness: number;
  };
  diagnosticSummary: string;
  createdAt: string;
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateSubject, setGenerateSubject] = useState("Distributed Systems");
  const [generateQuestionCount, setGenerateQuestionCount] = useState(5);
  const [generateDifficulty, setGenerateDifficulty] = useState("Medium");
  const [generateDuration, setGenerateDuration] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);

  // Live Exam Runner State
  const [activeExam, setActiveExam] = useState<any | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: number }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<{ [key: string]: boolean }>({});
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail / Review Modal State
  const [selectedReviewAssessment, setSelectedReviewAssessment] = useState<AssessmentItem | null>(null);

  // Load Assessments
  useEffect(() => {
    fetchAssessments();
  }, []);

  // Timer countdown for active exam
  useEffect(() => {
    if (!activeExam || secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeExam, secondsRemaining]);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("synexora_token") : null;
      const res = await fetch(`${API_BASE_URL}/assessments`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAssessments(data);
      }
    } catch (err) {
      console.error("Failed to load assessments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartGenerateExam = async () => {
    setIsGenerating(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("synexora_token") : null;
      const res = await fetch(`${API_BASE_URL}/assessments/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject: generateSubject,
          questionCount: generateQuestionCount,
          difficulty: generateDifficulty,
          durationMinutes: generateDuration,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const exam = data.assessment;
        setShowGenerateModal(false);
        // Launch live exam runner
        setActiveExam(exam);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setFlaggedQuestions({});
        setSecondsRemaining(exam.durationMinutes * 60);
      }
    } catch (err) {
      console.error("Exam generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinishExam = async () => {
    if (!activeExam || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("synexora_token") : null;
      const timeSpent = activeExam.durationMinutes * 60 - secondsRemaining;

      const res = await fetch(`${API_BASE_URL}/assessments/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: activeExam.title,
          subject: activeExam.subject,
          difficulty: activeExam.difficulty,
          durationMinutes: activeExam.durationMinutes,
          timeSpentSeconds: timeSpent,
          questions: activeExam.questions,
          userAnswers,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveExam(null);
        setSelectedReviewAssessment(data.assessment);
        fetchAssessments();
      }
    } catch (err) {
      console.error("Exam submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // If in Live Exam Runner Mode
  if (activeExam) {
    const currentQ = activeExam.questions[currentQuestionIndex] || activeExam.questions[0];
    const qKey = currentQ.id || currentQuestionIndex;
    const answeredCount = Object.keys(userAnswers).length;

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Sticky Exam Progress Bar */}
        <div className="bg-[#06383A] text-white p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#B7F34A] uppercase font-bold tracking-wider">
                Live Assessment Session
              </span>
              <span className="text-xs text-gray-300">• {activeExam.subject}</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">{activeExam.title}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15">
              <Clock className="w-4 h-4 text-[#B7F34A]" />
              <span className="font-mono font-bold text-sm text-[#B7F34A]">{formatTime(secondsRemaining)}</span>
            </div>

            <Button
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              onClick={handleFinishExam}
            >
              {isSubmitting ? "Grading..." : "Finish & Grade"}
            </Button>
          </div>
        </div>

        {/* Question Navigation Drawer Pills */}
        <div className="flex items-center gap-2 overflow-x-auto p-3 bg-white rounded-2xl border border-gray-200 scrollbar-none">
          <span className="text-xs font-mono font-bold text-gray-400 mr-1 uppercase">Questions:</span>
          {activeExam.questions.map((q: any, idx: number) => {
            const isAnswered = userAnswers[q.id || idx] !== undefined;
            const isCurrent = currentQuestionIndex === idx;
            const isFlagged = flaggedQuestions[q.id || idx];

            return (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-8 h-8 rounded-xl text-xs font-mono font-bold flex items-center justify-center transition-all relative shrink-0 ${
                  isCurrent
                    ? "bg-[#06383A] text-[#B7F34A] ring-2 ring-[#06383A] ring-offset-1"
                    : isAnswered
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {idx + 1}
                {isFlagged && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
                )}
              </button>
            );
          })}
          <div className="ml-auto text-xs font-mono text-gray-500 font-bold whitespace-nowrap pl-2">
            {answeredCount}/{activeExam.questions.length} Answered
          </div>
        </div>

        {/* Active Question Card */}
        <Card variant="light" className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="lime">Question {currentQuestionIndex + 1} of {activeExam.questions.length}</Badge>
              <span className="text-xs font-mono text-gray-500 font-medium uppercase">
                {currentQ.topic || "Diagnostic Topic"}
              </span>
            </div>

            <button
              onClick={() => {
                setFlaggedQuestions((prev) => ({
                  ...prev,
                  [qKey]: !prev[qKey],
                }));
              }}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                flaggedQuestions[qKey]
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200"
              }`}
            >
              <Flag className={`w-3.5 h-3.5 ${flaggedQuestions[qKey] ? "text-amber-600 fill-amber-600" : ""}`} />
              {flaggedQuestions[qKey] ? "Flagged for Review" : "Flag for Review"}
            </button>
          </div>

          <div className="space-y-2">
            {currentQ.title && (
              <h3 className="font-bold text-base text-[#06383A]">{currentQ.title}</h3>
            )}
            <p className="text-base text-gray-800 leading-relaxed font-medium bg-gray-50/70 p-4 rounded-2xl border border-gray-100 whitespace-pre-line">
              {currentQ.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt: string, optIdx: number) => {
              const isSelected = userAnswers[qKey] === optIdx;

              return (
                <button
                  key={optIdx}
                  onClick={() => {
                    setUserAnswers((prev) => ({
                      ...prev,
                      [qKey]: optIdx,
                    }));
                  }}
                  className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between ${
                    isSelected
                      ? "border-[#06383A] bg-[#06383A] text-white shadow-md font-semibold"
                      : "border-gray-200 bg-white hover:bg-gray-50 text-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-[#B7F34A] text-[#06383A]" : "bg-gray-100 text-gray-600"
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Stepper Controls */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            {currentQuestionIndex < activeExam.questions.length - 1 ? (
              <Button
                variant="dark"
                size="sm"
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              >
                Next Question <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                disabled={isSubmitting}
                onClick={handleFinishExam}
                icon={<FileCheck2 className="w-4 h-4" />}
              >
                {isSubmitting ? "Grading..." : "Submit Examination"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime">Phase 7 Diagnostic System</Badge>
            <span className="text-xs text-gray-500 font-mono font-medium">Continuous Academic Evaluation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#06383A] tracking-tight">
            Academic Assessments & Rubrics
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Timed mock examinations, diagnostic rubrics, and automated weakness identification.
          </p>
        </div>

        <Button
          variant="dark"
          size="sm"
          icon={<Plus className="w-4 h-4 text-[#B7F34A]" />}
          onClick={() => setShowGenerateModal(true)}
        >
          Generate Custom Assessment
        </Button>
      </div>

      {/* Overview Analytics Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="light" className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-gray-400 uppercase block font-bold">Average Diagnostic Score</span>
            <span className="text-2xl font-black font-mono text-[#06383A]">84.5%</span>
          </div>
        </Card>

        <Card variant="light" className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-gray-400 uppercase block font-bold">Completed Exams</span>
            <span className="text-2xl font-black font-mono text-[#06383A]">{assessments.length}</span>
          </div>
        </Card>

        <Card variant="light" className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-gray-400 uppercase block font-bold">Mastery Level</span>
            <span className="text-2xl font-black font-mono text-[#06383A]">Proficient</span>
          </div>
        </Card>
      </div>

      {/* Assessments Catalog Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-[#06383A] flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600" />
          Assessment Records & Diagnostic Logs
        </h2>

        {loading ? (
          <div className="p-12 text-center text-gray-500 font-mono text-xs">
            Loading assessment logs...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {assessments.map((a) => {
              const scorePct = a.percentage || a.score || 0;
              const isHigh = scorePct >= 80;

              return (
                <Card
                  key={a._id}
                  variant="light"
                  className="p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-all border border-gray-200/90"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={a.status === "COMPLETED" ? (isHigh ? "emerald" : "amber") : "gray"}>
                        {a.status}
                      </Badge>
                      <span className="text-xs text-gray-400 font-mono">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-[#06383A] bg-emerald-50 px-2 py-0.5 rounded">
                        {a.subject}
                      </span>
                      <h3 className="font-bold text-sm text-[#06383A] mt-1.5 leading-snug">
                        {a.title}
                      </h3>
                    </div>

                    {a.diagnosticSummary && (
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {a.diagnosticSummary}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-gray-400 block font-mono font-bold">Diagnostic Score</span>
                      <span className={`text-xl font-black font-mono ${isHigh ? "text-emerald-700" : "text-amber-700"}`}>
                        {scorePct}%
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReviewAssessment(a)}
                    >
                      Review Rubric
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Generate Custom Assessment Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <Card variant="light" className="max-w-md w-full p-6 space-y-5 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#06383A]" />
                <h3 className="font-extrabold text-base text-[#06383A]">Generate Diagnostic Exam</h3>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Select Subject / Discipline</label>
                <select
                  value={generateSubject}
                  onChange={(e) => setGenerateSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 font-medium text-[#06383A] outline-none focus:border-[#06383A]"
                >
                  <option value="Distributed Systems">Distributed Systems & Consensus</option>
                  <option value="Database Management Systems">Database Management Systems</option>
                  <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                  <option value="Operating Systems">Operating Systems & Concurrency</option>
                  <option value="Artificial Intelligence & ML">Artificial Intelligence & Deep Learning</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Target Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Easy", "Medium", "Hard"].map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setGenerateDifficulty(diff)}
                      className={`py-2 rounded-xl border font-bold text-center transition-all ${
                        generateDifficulty === diff
                          ? "bg-[#06383A] text-white border-[#06383A]"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Questions</label>
                  <select
                    value={generateQuestionCount}
                    onChange={(e) => setGenerateQuestionCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 font-medium text-[#06383A] outline-none"
                  >
                    <option value={3}>3 Questions (Quick)</option>
                    <option value={5}>5 Questions (Standard)</option>
                    <option value={10}>10 Questions (Deep Exam)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Time Limit</label>
                  <select
                    value={generateDuration}
                    onChange={(e) => setGenerateDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 font-medium text-[#06383A] outline-none"
                  >
                    <option value={10}>10 Minutes</option>
                    <option value={20}>20 Minutes</option>
                    <option value={35}>35 Minutes</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowGenerateModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isGenerating}
                onClick={handleStartGenerateExam}
                icon={<Sparkles className="w-4 h-4" />}
              >
                {isGenerating ? "Synthesizing Exam..." : "Launch Assessment"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Review Breakdown & Rubric Modal */}
      {selectedReviewAssessment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <Card variant="light" className="max-w-2xl w-full p-6 sm:p-8 space-y-6 bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-700 uppercase">
                  {selectedReviewAssessment.subject}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-[#06383A]">
                  {selectedReviewAssessment.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedReviewAssessment(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score & Rubric Bar */}
            <div className="bg-[#06383A] text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-gray-300 uppercase font-bold">Final Diagnostic Result</span>
                <div className="text-4xl font-black font-mono text-[#B7F34A] mt-1">
                  {selectedReviewAssessment.percentage || selectedReviewAssessment.score}%
                </div>
                <p className="text-xs text-gray-300 mt-1">
                  Duration: {selectedReviewAssessment.durationMinutes} mins • Status: {selectedReviewAssessment.status}
                </p>
              </div>

              {selectedReviewAssessment.rubricEvaluation && (
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-3 rounded-xl border border-white/15 text-center">
                    <span className="text-[10px] uppercase font-mono text-gray-300 block">Accuracy</span>
                    <span className="text-sm font-bold font-mono text-[#B7F34A]">
                      {selectedReviewAssessment.rubricEvaluation.conceptualAccuracy}%
                    </span>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl border border-white/15 text-center">
                    <span className="text-[10px] uppercase font-mono text-gray-300 block">Reasoning</span>
                    <span className="text-sm font-bold font-mono text-white">
                      {selectedReviewAssessment.rubricEvaluation.logicalReasoning}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Diagnostic Summary */}
            {selectedReviewAssessment.diagnosticSummary && (
              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <span className="font-bold flex items-center gap-1 text-emerald-900">
                  <Award className="w-4 h-4 text-emerald-700" />
                  AI Diagnostic Assessment Report:
                </span>
                <p className="leading-relaxed">{selectedReviewAssessment.diagnosticSummary}</p>
              </div>
            )}

            {/* Topic Mastery Breakdown */}
            {selectedReviewAssessment.topicBreakdown && selectedReviewAssessment.topicBreakdown.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase text-gray-500">
                  Subtopic Competency Analysis
                </h4>
                <div className="space-y-2">
                  {selectedReviewAssessment.topicBreakdown.map((t, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-[#06383A]">{t.topic}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 font-mono">{t.correct}/{t.total} Solved</span>
                        <Badge variant={t.masteryScore >= 80 ? "emerald" : "amber"}>
                          {t.masteryScore}% Mastery
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
              <Button
                variant="dark"
                size="sm"
                onClick={() => setSelectedReviewAssessment(null)}
              >
                Close Report
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
