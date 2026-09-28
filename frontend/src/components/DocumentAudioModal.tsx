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
  Minimize2,
  Maximize2,
  User,
} from 'lucide-react';

export interface DocItem {
  _id: string;
  name: string;
  category: string;
  size: string;
  fileType: string;
  url?: string;
  uploadDate: string;
  extractedText?: string;
  chunks?: { chunkIndex: number; text: string }[];
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

  // Minimized floating player bar state
  const [isMinimized, setIsMinimized] = useState(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Available voices
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');

  // Audio summary mode
  const [isSummaryMode, setIsSummaryMode] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const chunkRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Populate browser voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
      setVoices(available);
      if (available.length > 0 && !selectedVoiceURI) {
        const naturalVoice = available.find(
          (v) =>
            v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Daniel')
        );
        setSelectedVoiceURI(naturalVoice ? naturalVoice.voiceURI : available[0].voiceURI);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, [selectedVoiceURI]);

  // Fetch full document or load direct text
  useEffect(() => {
    if (!doc) return;

    // Check if doc already contains extracted text or chunks (Direct Text Playback)
    if (doc.extractedText || (doc.chunks && doc.chunks.length > 0)) {
      const rawText = doc.extractedText || doc.name;
      const chunks =
        doc.chunks && doc.chunks.length > 0
          ? doc.chunks
          : rawText
              .split(/\n\s*\n/)
              .filter((p: string) => p.trim().length > 0)
              .map((text: string, idx: number) => ({ chunkIndex: idx, text: text.trim() }));

      setFullDoc({
        _id: doc._id,
        name: doc.name,
        category: doc.category,
        size: doc.size,
        fileType: doc.fileType,
        url: doc.url,
        uploadDate: doc.uploadDate,
        extractedText: rawText,
        chunks: chunks.length > 0 ? chunks : [{ chunkIndex: 0, text: rawText }],
      });
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const fetchFullDoc = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await API.get(`/documents/${doc._id}`);
        if (isMounted && res.data.success && res.data.document) {
          const fetched = res.data.document;
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
    if (isPlaying && chunkRefs.current[currentChunkIndex] && !isMinimized) {
      chunkRefs.current[currentChunkIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentChunkIndex, isPlaying, isMinimized]);

  // Core Speech Synthesis Player for a given chunk index
  const playChunk = (index: number, chunksArray?: ChunkItem[], customSpeed?: number) => {
    if (!('speechSynthesis' in window)) {
      setError('Text-to-Speech is not supported in this browser.');
      return;
    }

    const chunks = chunksArray || fullDoc?.chunks || [];
    if (!chunks || index >= chunks.length || index < 0) {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentChunkIndex(0);
      return;
    }

    window.speechSynthesis.cancel();

    const currentText = chunks[index].text;
    const cleaned = cleanTextForSpeech(currentText);

    if (!cleaned) {
      playChunk(index + 1, chunks, customSpeed);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = customSpeed !== undefined ? customSpeed : playbackSpeed;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    if (selectedVoiceURI) {
      const chosenVoice = voices.find((v) => v.voiceURI === selectedVoiceURI);
      if (chosenVoice) utterance.voice = chosenVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentChunkIndex(index);
    };

    utterance.onend = () => {
      if (index + 1 < chunks.length) {
        playChunk(index + 1, chunks, customSpeed);
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

    if (selectedVoiceURI) {
      const chosenVoice = voices.find((v) => v.voiceURI === selectedVoiceURI);
      if (chosenVoice) utterance.voice = chosenVoice;
    }

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
      if (isSummaryMode && summaryText) {
        playSummaryAudio(summaryText);
      } else {
        playChunk(currentChunkIndex, fullDoc?.chunks, speed);
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
        question: 'Provide a concise, engaging 4-paragraph spoken audio summary of this entire material highlighting key takeaways, concepts, and formulas.',
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

  // Render Minimized Floating Dock
  if (isMinimized) {
    return (
      <aside className="fixed bottom-4 right-4 z-50 bg-[#111111] text-white rounded-full shadow-2xl border border-[#333333] px-4 py-2.5 flex items-center gap-3 animate-slide-up max-w-sm">
        <div className="w-7 h-7 rounded-full bg-[#F4C542] text-[#111111] flex items-center justify-center shrink-0">
          <Headphones className="w-3.5 h-3.5" />
        </div>
        <div className="truncate flex-1">
          <p className="text-xs font-bold truncate text-[#FFFDF7]">{doc.name}</p>
          <p className="text-[10px] text-[#F4C542]">
            {isSummaryMode ? 'AI Summary' : `Paragraph ${currentChunkIndex + 1} of ${totalChunks}`}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            disabled={isLoading || isSummaryMode || currentChunkIndex === 0}
            className="p-1.5 rounded-full text-[#999999] hover:text-white hover:bg-white/10 disabled:opacity-30"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          {isPlaying ? (
            <button
              onClick={handlePause}
              className="p-2 rounded-full bg-[#F4C542] text-[#111111] hover:bg-[#E5B635] transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleStartPlay}
              disabled={isLoading}
              className="p-2 rounded-full bg-[#F4C542] text-[#111111] hover:bg-[#E5B635] transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-[#111111]" />
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={isLoading || isSummaryMode || currentChunkIndex >= totalChunks - 1}
            className="p-1.5 rounded-full text-[#999999] hover:text-white hover:bg-white/10 disabled:opacity-30"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsMinimized(false)}
            className="p-1.5 rounded-full text-[#999999] hover:text-white hover:bg-white/10"
            title="Expand Full Reader"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              handleStop();
              onClose();
            }}
            className="p-1.5 rounded-full text-[#999999] hover:text-red-400 hover:bg-white/10"
            title="Close Player"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    );
  }

  // Render Full Audiobook & Document Modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-6 animate-fade-in">
      <div className="bg-[#FFFDF7] rounded-3xl shadow-2xl border border-[#E8E1D2] w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E1D2] bg-[#111111] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#222222] border border-[#333333] flex items-center justify-center text-[#F4C542]">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#222222] text-[#F4C542] border border-[#333333]">
                  {doc.fileType === 'youtube' ? 'YouTube Audio Reader' : 'Document & Text Audiobook'}
                </span>
                <span className="text-xs text-[#999999]">{doc.category}</span>
              </div>
              <h2 className="text-sm font-bold text-white truncate max-w-md sm:max-w-lg mt-0.5">
                {doc.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-full text-[#999999] hover:text-white hover:bg-white/10 transition-colors"
              title="Minimize to floating bottom player"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                handleStop();
                onClose();
              }}
              className="p-1.5 rounded-full text-[#999999] hover:text-white hover:bg-white/10 transition-colors"
              title="Close reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Equalizer / Player Controls Bar */}
        <div className="px-6 py-3.5 bg-[#FFF8E8] border-b border-[#E8E1D2] flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Playback main controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={isLoading || isSummaryMode || currentChunkIndex === 0}
              className="p-2 rounded-full text-[#555555] hover:bg-[#E8E1D2] disabled:opacity-30 transition-colors"
              title="Previous Paragraph"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {isPlaying ? (
              <button
                onClick={handlePause}
                className="px-4 py-2 rounded-full bg-[#111111] hover:bg-[#222222] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Pause className="w-4 h-4 text-[#F4C542]" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={handleStartPlay}
                disabled={isLoading}
                className="btn-primary text-xs py-2 px-4 gap-1.5 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-[#111111]" />
                <span>{isPaused ? 'Resume' : 'Listen Now'}</span>
              </button>
            )}

            <button
              onClick={handleStop}
              disabled={!isPlaying && !isPaused}
              className="p-2 rounded-full text-[#555555] hover:bg-[#E8E1D2] disabled:opacity-30 transition-colors"
              title="Stop Playback"
            >
              <Square className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              disabled={isLoading || isSummaryMode || currentChunkIndex >= totalChunks - 1}
              className="p-2 rounded-full text-[#555555] hover:bg-[#E8E1D2] disabled:opacity-30 transition-colors"
              title="Next Paragraph"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Animated waveform when playing */}
          {isPlaying && (
            <div className="hidden sm:flex items-center gap-1 h-6 px-3.5 py-1 bg-[#FFFDF7] border border-[#E8E1D2] rounded-full">
              <span className="w-1 h-3 bg-[#F4C542] rounded-full animate-pulse" />
              <span className="w-1 h-4 bg-[#111111] rounded-full animate-pulse delay-75" />
              <span className="w-1 h-2 bg-[#F4C542] rounded-full animate-pulse delay-150" />
              <span className="w-1 h-5 bg-[#111111] rounded-full animate-pulse delay-100" />
              <span className="w-1 h-3 bg-[#F4C542] rounded-full animate-pulse delay-200" />
              <span className="text-[11px] font-bold text-[#111111] ml-1.5">Narrating Audio</span>
            </div>
          )}

          {/* Speed & Voice & Summary Actions */}
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-white border border-[#E8E1D2] rounded-full p-1 text-xs">
              <Gauge className="w-3.5 h-3.5 text-[#999999] ml-1.5" />
              {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleSpeedChange(rate)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                    playbackSpeed === rate
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'text-[#555555] hover:bg-[#FFF8E8]'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Voice picker if multiple voices exist */}
            {voices.length > 1 && (
              <div className="hidden md:flex items-center gap-1 bg-white border border-[#E8E1D2] rounded-full px-3 py-1 text-xs text-[#555555]">
                <User className="w-3.5 h-3.5 text-[#999999] shrink-0" />
                <select
                  value={selectedVoiceURI}
                  onChange={(e) => {
                    setSelectedVoiceURI(e.target.value);
                    if (isPlaying) {
                      if (isSummaryMode && summaryText) {
                        playSummaryAudio(summaryText);
                      } else {
                        playChunk(currentChunkIndex);
                      }
                    }
                  }}
                  className="bg-transparent text-[11px] text-[#111111] font-medium outline-none max-w-[110px] truncate"
                >
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name.slice(0, 18)}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
              className={`btn-secondary text-xs py-1.5 px-3 gap-1.5 ${
                isSummaryMode ? 'bg-[#111111] text-[#F4C542] border-[#111111]' : ''
              }`}
              title="Generate and listen to concise AI summary"
            >
              {isGeneratingSummary ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#111111]" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[#111111]" />
              )}
              <span>{isSummaryMode ? 'Full Text Mode' : 'AI Summary Audio'}</span>
            </button>
          </div>
        </div>

        {/* Progress status */}
        {!isSummaryMode && totalChunks > 0 && (
          <div className="px-6 py-2.5 bg-[#FFF8E8]/50 border-b border-[#E8E1D2] text-[11px] text-[#555555] flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <span className="font-bold text-[#111111]">
                Paragraph {currentChunkIndex + 1} of {totalChunks}
              </span>
              <span>•</span>
              <span>{progressPercent}% completed</span>
            </div>
            <div className="w-32 bg-[#E8E1D2] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#F4C542] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="m-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        {/* Interactive Text / Reading View */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-[#FFFDF7]">
          {isLoading ? (
            <div className="py-16 text-center text-[#777777]">
              <Loader2 className="w-6 h-6 animate-spin text-[#111111] mx-auto mb-2" />
              <p className="text-xs">Preparing document audio chunks and transcript...</p>
            </div>
          ) : isSummaryMode ? (
            <div className="p-5 bg-white border border-[#E8E1D2] rounded-3xl shadow-xs">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#F0EBE0] text-[#111111] font-bold text-xs">
                <Sparkles className="w-4 h-4 text-[#F4C542]" />
                <span>AI Spoken Executive Summary</span>
              </div>
              <p className="text-xs text-[#333333] leading-relaxed whitespace-pre-wrap">
                {summaryText}
              </p>
            </div>
          ) : chunks.length === 0 ? (
            <div className="py-12 text-center text-[#777777] text-xs">
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
                  className={`p-4 rounded-2xl border text-xs leading-relaxed cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#FFF8E8] border-[#F4C542] text-[#111111] shadow-xs ring-1 ring-[#F4C542]'
                      : 'bg-white border-[#E8E1D2] text-[#444444] hover:bg-[#FFFDF7] hover:border-[#D8D0BE]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-[#111111] text-[#F4C542]'
                          : 'bg-[#FFF8E8] text-[#777777] border border-[#E8E1D2]'
                      }`}
                    >
                      Section {idx + 1}
                    </span>
                    {isActive ? (
                      <span className="text-[10px] font-bold text-[#111111] flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5 text-[#F4C542] animate-pulse" />
                        <span>Now Playing</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#888888] hover:text-[#111111]">
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
        <div className="px-6 py-3.5 border-t border-[#E8E1D2] bg-white flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="text-xs text-[#111111] hover:underline font-bold flex items-center gap-1.5"
            >
              <Minimize2 className="w-3.5 h-3.5 text-[#F4C542]" />
              <span>Minimize to Floating Player</span>
            </button>
          </div>
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
