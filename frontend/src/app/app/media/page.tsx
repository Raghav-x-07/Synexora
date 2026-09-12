"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  Layers,
  Video,
  Plus,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { API_BASE_URL } from "@/lib/apiClient";

interface Chapter {
  timestamp: string;
  seconds: number;
  title: string;
  summary: string;
  keyTakeaway: string;
}

interface Checkpoint {
  id: string;
  timestamp: string;
  seconds: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface VideoLesson {
  _id?: string;
  id?: string;
  title: string;
  subject: string;
  duration: string;
  embedUrl: string;
  description: string;
  chapters: Chapter[];
  checkpoints: Checkpoint[];
}

export default function MediaLearningPage() {
  const [lessons, setLessons] = useState<VideoLesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<VideoLesson | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Active Checkpoint Quiz State
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [checkpointResult, setCheckpointResult] = useState<{ isCorrect: boolean; explanation: string } | null>(null);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<{ [key: string]: boolean }>({});

  // Ingest Modal State
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState("https://www.youtube.com/watch?v=vYp4LYbnnW8");
  const [transcriptText, setTranscriptText] = useState("");
  const [subject, setSubject] = useState("Distributed Systems");
  const [isIngesting, setIsIngesting] = useState(false);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("synexora_token") : null;
      const res = await fetch(`${API_BASE_URL}/media/lessons`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) {
        const data = await res.json();
        setLessons(data);
        if (data && data.length > 0) {
          setActiveLesson(data[0]);
          if (data[0].checkpoints && data[0].checkpoints.length > 0) {
            setSelectedCheckpoint(data[0].checkpoints[0]);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load video lessons:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleIngestVideo = async () => {
    setIsIngesting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("synexora_token") : null;
      const res = await fetch(`${API_BASE_URL}/media/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          videoUrl,
          transcriptText,
          subject,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLessons((prev) => [data.lesson, ...prev]);
        setActiveLesson(data.lesson);
        setActiveChapterIndex(0);
        if (data.lesson.checkpoints && data.lesson.checkpoints.length > 0) {
          setSelectedCheckpoint(data.lesson.checkpoints[0]);
        }
        setShowIngestModal(false);
        setTranscriptText("");
      }
    } catch (err) {
      console.error("Ingest video error:", err);
    } finally {
      setIsIngesting(false);
    }
  };

  const handleEvaluateCheckpoint = () => {
    if (selectedOption === null || !selectedCheckpoint) return;
    const isCorrect = selectedOption === selectedCheckpoint.correctIndex;
    setCheckpointResult({
      isCorrect,
      explanation: selectedCheckpoint.explanation,
    });
    setCompletedCheckpoints((prev) => ({ ...prev, [selectedCheckpoint.id]: true }));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime" pulse>Phase 11 Media Learning</Badge>
            <span className="text-xs font-mono text-gray-500">AI Lecture Ingestion Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#06383A] tracking-tight">
            Video & Lecture Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            Synchronized timestamped lecture notes, concept checkpoints, and automated in-video comprehension quizzes.
          </p>
        </div>

        <Button
          variant="dark"
          size="sm"
          onClick={() => setShowIngestModal(true)}
          icon={<Plus className="w-4 h-4 text-[#B7F34A]" />}
        >
          Ingest Lecture Video (AI)
        </Button>
      </div>

      {/* Lesson Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {lessons.map((lesson) => {
          const isActive = (activeLesson?._id || activeLesson?.id) === (lesson._id || lesson.id);
          return (
            <button
              key={lesson._id || lesson.id}
              onClick={() => {
                setActiveLesson(lesson);
                setActiveChapterIndex(0);
                setSelectedOption(null);
                setCheckpointResult(null);
                if (lesson.checkpoints && lesson.checkpoints.length > 0) {
                  setSelectedCheckpoint(lesson.checkpoints[0]);
                }
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-2 ${
                isActive
                  ? "bg-[#06383A] text-[#B7F34A] border-[#06383A] shadow-sm"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>{lesson.title}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <Card variant="light" className="p-12 text-center flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#06383A] animate-spin" />
          <p className="text-xs font-mono font-bold text-[#06383A]">Loading video learning studio...</p>
        </Card>
      ) : activeLesson ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Video Embed & Checkpoint Quizzes (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Video Player Frame */}
            <Card variant="light" className="p-0 overflow-hidden bg-black rounded-3xl border border-gray-200 shadow-md">
              <div className="aspect-video w-full bg-black relative">
                <iframe
                  src={activeLesson.embedUrl}
                  title={activeLesson.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="p-5 bg-white space-y-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#06383A] bg-emerald-50 px-2 py-0.5 rounded">
                    {activeLesson.subject}
                  </span>
                  <span className="text-xs text-gray-500 font-mono font-bold">
                    Duration: {activeLesson.duration}
                  </span>
                </div>
                <h2 className="font-extrabold text-base text-[#06383A]">{activeLesson.title}</h2>
                <p className="text-xs text-gray-600 leading-relaxed">{activeLesson.description}</p>
              </div>
            </Card>

            {/* In-Video Checkpoint Quizzes */}
            {activeLesson.checkpoints && activeLesson.checkpoints.length > 0 && (
              <Card variant="light" className="p-6 space-y-4 bg-white/95 border border-gray-200/90 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#06383A]" />
                    <h3 className="font-extrabold text-sm text-[#06383A]">
                      In-Video Checkpoint Quiz
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {activeLesson.checkpoints.map((cp, cpIdx) => {
                      const isCompleted = completedCheckpoints[cp.id];
                      const isSelected = selectedCheckpoint?.id === cp.id;

                      return (
                        <button
                          key={cp.id}
                          onClick={() => {
                            setSelectedCheckpoint(cp);
                            setSelectedOption(null);
                            setCheckpointResult(null);
                          }}
                          className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition-all ${
                            isSelected
                              ? "bg-[#06383A] text-[#B7F34A] border-[#06383A]"
                              : isCompleted
                              ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          @{cp.timestamp}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedCheckpoint && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="lime">Timestamp: {selectedCheckpoint.timestamp}</Badge>
                      <span className="text-xs text-gray-500 font-mono">Concept Checkpoint</span>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-gray-800 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                      {selectedCheckpoint.question}
                    </p>

                    {/* Options */}
                    <div className="space-y-2">
                      {selectedCheckpoint.options.map((opt, optIdx) => {
                        const isSelected = selectedOption === optIdx;
                        const isCorrect = checkpointResult && optIdx === selectedCheckpoint.correctIndex;
                        const isWrongSelection = checkpointResult && isSelected && !checkpointResult.isCorrect;

                        let style = "border-gray-200 bg-white hover:bg-gray-50 text-gray-800";
                        if (isSelected && !checkpointResult) {
                          style = "border-[#06383A] bg-[#06383A] text-white font-semibold";
                        } else if (isCorrect) {
                          style = "!border-emerald-500 !bg-emerald-50 !text-emerald-950 font-bold";
                        } else if (isWrongSelection) {
                          style = "!border-red-400 !bg-red-50 !text-red-950 line-through";
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={checkpointResult !== null}
                            onClick={() => setSelectedOption(optIdx)}
                            className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${style}`}
                          >
                            <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                            {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                            {isWrongSelection && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {!checkpointResult ? (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={selectedOption === null}
                        onClick={handleEvaluateCheckpoint}
                      >
                        Submit Checkpoint Answer
                      </Button>
                    ) : (
                      <div className={`p-4 rounded-xl border text-xs space-y-1.5 animate-in fade-in ${
                        checkpointResult.isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-950" : "bg-red-50 border-red-200 text-red-950"
                      }`}>
                        <div className="font-bold flex items-center gap-1.5">
                          {checkpointResult.isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          ) : (
                            <HelpCircle className="w-4 h-4 text-red-600" />
                          )}
                          {checkpointResult.isCorrect ? "Checkpoint Passed!" : "Needs Review:"}
                        </div>
                        <p className="leading-relaxed">{checkpointResult.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Right Column: Synchronized Timestamped Chapters & Concept Notes (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card variant="light" className="p-6 space-y-4 bg-white/95 border border-gray-200/90 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#06383A]" />
                  <h3 className="font-extrabold text-sm text-[#06383A]">
                    Synchronized Concept Notes
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-gray-400">
                  {activeLesson.chapters.length} Chapters
                </span>
              </div>

              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {activeLesson.chapters.map((ch, chIdx) => {
                  const isActive = activeChapterIndex === chIdx;

                  return (
                    <div
                      key={chIdx}
                      onClick={() => setActiveChapterIndex(chIdx)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                        isActive
                          ? "bg-emerald-50/70 border-emerald-300 shadow-xs"
                          : "bg-gray-50/60 border-gray-200 hover:bg-gray-100/70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#06383A] bg-[#B7F34A]/40 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#06383A]" />
                          {ch.timestamp}
                        </span>
                        <Badge variant={isActive ? "lime" : "gray"}>Chapter {chIdx + 1}</Badge>
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-[#06383A]">{ch.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">{ch.summary}</p>

                      {ch.keyTakeaway && (
                        <div className="pt-2 border-t border-gray-200/70 text-[11px] font-mono text-emerald-900 font-medium">
                          <strong>Key Takeaway:</strong> {ch.keyTakeaway}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {/* Ingest Lecture Video Modal */}
      {showIngestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <Card variant="light" className="max-w-lg w-full p-6 sm:p-8 space-y-5 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#06383A]" />
                <h3 className="font-extrabold text-base text-[#06383A]">Ingest Lecture Video (AI)</h3>
              </div>
              <button
                onClick={() => setShowIngestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">YouTube or Video URL</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="e.g. https://www.youtube.com/watch?v=..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 font-medium text-[#06383A] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Subject Focus</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 font-medium text-[#06383A] outline-none"
                >
                  <option value="Distributed Systems">Distributed Systems & Consensus</option>
                  <option value="Database Management Systems">Database Management Systems</option>
                  <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                  <option value="Operating Systems">Operating Systems & Concurrency</option>
                  <option value="Artificial Intelligence & ML">Artificial Intelligence & Deep Learning</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Lecture Transcript / Audio Text</label>
                <textarea
                  rows={4}
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                  placeholder="Paste lecture transcript or key lecture notes here to auto-generate timestamped chapters and quizzes..."
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-xs text-[#06383A] outline-none leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowIngestModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isIngesting}
                onClick={handleIngestVideo}
                icon={<Sparkles className="w-4 h-4" />}
              >
                {isIngesting ? "Segmenting Lecture..." : "Ingest & Synthesize"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
