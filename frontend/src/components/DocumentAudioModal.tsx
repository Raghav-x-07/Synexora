import React, { useState, useEffect, useRef } from 'react';
import API from '../lib/api';
import { cleanTextForSpeech } from '../hooks/useVoiceAssistant';
import {
  X,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  Headphones,
  Loader2,
  Sparkles,
  Gauge,
} from 'lucide-react';

interface DocItem {
  _id: string;
  name: string;
  category: string;
  size: string;
  fileType: string;
  url?: string;
  uploadDate: string;
}

interface ChunkItem {
  chunkIndex: number;
  text: string;
}

interface FullDocumentData {
  _id: string;
  name: string;
  category: string;
  size: string;
  fileType: string;
  url?: string;
  uploadDate: string;
  extractedText: string;
  chunks: ChunkItem[];
}

interface DocumentAudioModalProps {
  doc: DocItem | null;
  onClose: () => void;
}

export const DocumentAudioModal: React.FC<DocumentAudioModalProps> = ({ doc, onClose }) => {
  const [fullDoc, setFullDoc] = useState<FullDocumentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Audio summary mode
  const [isSummaryMode, setIsSummaryMode] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const chunkRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Fetch full document data (with extracted text & chunks)
  useEffect(() => {
    if (!doc) return;

    let isMounted = true;
    const fetchFullDoc = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await API.get(`/documents/${doc._id}`);
        if (isMounted && res.data.success && res.data.document) {
          const fetched = res.data.document;
          // Fallback if chunks are empty
          if (!fetched.chunks || fetched.chunks.length === 0) {
            const rawText = fetched.extractedText || fetched.name;
            const splitParagraphs = rawText
              .split(/\n\s*\n/)
              .filter((p: string) => p.trim().length > 0)
              .map((text: string, idx: number) => ({ chunkIndex: idx, text: text.trim() }));
            fetched.chunks = splitParagraphs.length > 0 ? splitParagraphs : [{ chunkIndex: 0, text: rawText }];
          }
          setFullDoc(fetched);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load document content.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFullDoc();

    return () => {
      isMounted = false;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [doc]);

  // Scroll active chunk into view
  useEffect(() => {
    if (isPlaying && chunkRefs.current[currentChunkIndex]) {
      chunkRefs.current[currentChunkIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentChunkIndex, isPlaying]);

  // Core Speech Synthesis Player for a given chunk index
  const playChunk = (index: number, chunksArray?: ChunkItem[]) => {
    if (!('speechSynthesis' in window)) {
      setError('Text-to-Speech is not supported in this browser.');
      return;
    }

    const chunks = chunksArray || fullDoc?.chunks || [];
    if (!chunks || index >= chunks.length || index < 0) {
      // Completed all chunks
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentChunkIndex(0);
      return;
    }

    window.speechSynthesis.cancel();

    const currentText = chunks[index].text;
    const cleaned = cleanTextForSpeech(currentText);

    if (!cleaned) {
      // If empty chunk, skip to next
      playChunk(index + 1, chunks);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    // Pick a natural sounding English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Google') ||
          v.name.includes('Natural') ||
          v.name.includes('Samantha') ||
          v.name.includes('Daniel'))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentChunkIndex(index);
    };

    utterance.onend = () => {
      if (index + 1 < chunks.length) {
        // Automatically proceed to next chunk/paragraph
        playChunk(index + 1, chunks);
      } else {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentChunkIndex(0);
      }
    };

    utterance.onerror = (e) => {
      console.warn('[SpeechSynthesis Error]', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Play Summary Speech
  const playSummaryAudio = (summary: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const cleaned = cleanTextForSpeech(summary);
    if (!cleaned) return;

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleStartPlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      if (isSummaryMode && summaryText) {
        playSummaryAudio(summaryText);
      } else {
        playChunk(currentChunkIndex);
      }
    }
  };

  const handlePause = () => {
    if ('speechSynthesis' in window && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleNext = () => {
    const chunks = fullDoc?.chunks || [];
    if (currentChunkIndex + 1 < chunks.length) {
      playChunk(currentChunkIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentChunkIndex > 0) {
      playChunk(currentChunkIndex - 1);
    } else {
      playChunk(0);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (isPlaying) {
      // Restart current chunk with new speed
      if (isSummaryMode && summaryText) {
        playSummaryAudio(summaryText);
      } else {
        playChunk(currentChunkIndex);
      }
    }
  };

  // Generate Quick AI Audio Summary
  const handleGenerateSummary = async () => {
    if (!fullDoc) return;
    try {
      setIsGeneratingSummary(true);
      setError(null);
      handleStop();
      const res = await API.post(`/documents/${fullDoc._id}/query`, {
        question: 'Provide a concise, highly engaging 4-paragraph spoken audio summary of this entire material highlighting key takeaways, concepts, and conclusions.',
      });
      if (res.data.success && res.data.answer) {
        setSummaryText(res.data.answer);
        setIsSummaryMode(true);
        playSummaryAudio(res.data.answer);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate audio summary.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  if (!doc) return null;

  const chunks = fullDoc?.chunks || [];
  const totalChunks = chunks.length;
  const progressPercent = totalChunks > 0 ? Math.round(((currentChunkIndex + 1) / totalChunks) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Audiobook & Audio Reader
                </span>
                <span className="text-xs text-slate-300">{doc.category}</span>
              </div>
              <h2 className="text-sm font-bold text-white truncate max-w-md sm:max-w-lg mt-0.5">
                {doc.name}
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              handleStop();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Equalizer / Player Controls Bar */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Playback main controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={isLoading || isSummaryMode || currentChunkIndex === 0}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-colors"
              title="Previous Paragraph"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {isPlaying ? (
              <button
                onClick={handlePause}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={handleStartPlay}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isPaused ? 'Resume' : 'Listen Now'}</span>
              </button>
            )}

            <button
              onClick={handleStop}
              disabled={!isPlaying && !isPaused}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-colors"
              title="Stop Playback"
            >
              <Square className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              disabled={isLoading || isSummaryMode || currentChunkIndex >= totalChunks - 1}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-colors"
              title="Next Paragraph"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Animated waveform when playing */}
          {isPlaying && (
            <div className="hidden sm:flex items-center gap-1 h-5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
              <span className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <span className="w-1 h-4 bg-emerald-600 rounded-full animate-pulse delay-75" />
              <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse delay-150" />
              <span className="w-1 h-5 bg-emerald-700 rounded-full animate-pulse delay-100" />
              <span className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse delay-200" />
              <span className="text-[11px] font-semibold text-emerald-700 ml-1">Narrating Audio</span>
            </div>
          )}

          {/* Speed & Summary Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
              <Gauge className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleSpeedChange(rate)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    playbackSpeed === rate
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* AI Summary Audio Generator */}
            <button
              onClick={() => {
                if (isSummaryMode) {
                  setIsSummaryMode(false);
                  handleStop();
                } else {
                  if (summaryText) {
                    setIsSummaryMode(true);
                    playSummaryAudio(summaryText);
                  } else {
                    handleGenerateSummary();
                  }
                }
              }}
              disabled={isLoading || isGeneratingSummary}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isSummaryMode
                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                  : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
              }`}
              title="Generate and listen to concise AI summary"
            >
              {isGeneratingSummary ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              )}
              <span>{isSummaryMode ? 'Full Text Mode' : 'AI Summary Audio'}</span>
            </button>
          </div>
        </div>

        {/* Progress status */}
        {!isSummaryMode && totalChunks > 0 && (
          <div className="px-5 py-2 bg-slate-100/70 border-b border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">
                Paragraph {currentChunkIndex + 1} of {totalChunks}
              </span>
              <span>•</span>
              <span>{progressPercent}% completed</span>
            </div>
            <div className="w-32 bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="m-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        {/* Interactive Text / Reading View */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3 bg-slate-50/40">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
              <p className="text-xs">Preparing document audio chunks and transcript...</p>
            </div>
          ) : isSummaryMode ? (
            <div className="p-4 bg-white border border-purple-200 rounded-xl shadow-xs">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-purple-100 text-purple-800 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>AI Spoken Executive Summary</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {summaryText}
              </p>
            </div>
          ) : chunks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No extracted text found in this document.
            </div>
          ) : (
            chunks.map((chunk, idx) => {
              const isActive = idx === currentChunkIndex && (isPlaying || isPaused);
              return (
                <div
                  key={chunk.chunkIndex || idx}
                  ref={(el) => (chunkRefs.current[idx] = el)}
                  onClick={() => playChunk(idx)}
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed cursor-pointer transition-all ${
                    isActive
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-sm ring-1 ring-emerald-400'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isActive
                          ? 'bg-emerald-200/70 text-emerald-900'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      Section {idx + 1}
                    </span>
                    {isActive ? (
                      <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                        <Volume2 className="w-3 h-3 animate-pulse" />
                        <span>Now Playing</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 hover:text-emerald-600">
                        Click to listen here
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap">{chunk.text}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 text-[11px]">
            Tip: Click any paragraph or section above to instantly listen from that point.
          </span>
          <button
            onClick={() => {
              handleStop();
              onClose();
            }}
            className="btn-secondary text-xs px-4 py-1.5"
          >
            Close Reader
          </button>
        </div>
      </div>
    </div>
  );
};
