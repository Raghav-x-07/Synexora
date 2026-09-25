import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Download,
  Volume2,
  VolumeX,
  Film,
  Image as ImageIcon,
  Sparkles,
  Clock,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { LiveMotionSimulation } from './LiveMotionSimulation';

export interface VideoMilestone {
  seconds: number;
  timestamp: string;
  title: string;
  desc: string;
}

export interface TopicVisual {
  topic: string;
  caption: string;
  visualPrompt: string;
  imageUrl: string;
  seed: number;
  videoTitle?: string;
  videoPrompt?: string;
  category?: string;
  simulationType?: string;
  milestones?: VideoMilestone[];
  keyMechanics?: string[];
  videoUrl?: string;
  duration?: number;
}

interface AIVideoVisualizerCardProps {
  visual: TopicVisual;
  onRegenerate?: () => void;
  onEnlarge: (visual: TopicVisual, initialMode?: 'video' | 'diagram') => void;
}

export const AIVideoVisualizerCard: React.FC<AIVideoVisualizerCardProps> = ({
  visual,
  onRegenerate,
  onEnlarge,
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'diagram'>('video');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration] = useState<number>(visual.duration || 10);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  const milestones: VideoMilestone[] = visual.milestones && visual.milestones.length > 0
    ? visual.milestones
    : [
        { seconds: 0, timestamp: '0:00', title: 'Phase 1: Initial State', desc: `Foundational structure of ${visual.topic}` },
        { seconds: 4, timestamp: '0:04', title: 'Phase 2: Dynamics & Flow', desc: `Core interactions and transformations` },
        { seconds: 8, timestamp: '0:08', title: 'Phase 3: Outcome', desc: `Synthesized result and equilibrium` },
      ];

  // 60fps Live Motion Simulation Engine Loop
  useEffect(() => {
    let animFrame: number;
    let lastTime = performance.now();

    const updateLoop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + delta * playbackRate;
          if (next >= duration) {
            return 0; // loop seamlessly
          }
          return next;
        });
      }
      animFrame = requestAnimationFrame(updateLoop);
    };

    animFrame = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, playbackRate, duration]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
  };

  const handleMilestoneClick = (seconds: number) => {
    setCurrentTime(seconds);
    setIsPlaying(true);
  };

  const cyclePlaybackRate = () => {
    const rates = [0.5, 1.0, 1.5, 2.0];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    setPlaybackRate(rates[nextIdx]);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleDownload = async (type: 'video' | 'image') => {
    const url = visual.imageUrl;
    const ext = type === 'video' ? 'webm' : 'png';
    const filename = `${visual.topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_synexora_${type}.${ext}`;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  // Find active milestone based on current time
  const activeMilestoneIndex = milestones.reduce((latestIdx, m, idx) => {
    return currentTime >= m.seconds ? idx : latestIdx;
  }, 0);

  return (
    <div className="mt-3 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs animate-in fade-in duration-200">
      {/* Header Bar with Dual Mode Switcher */}
      <div className="px-3.5 py-2.5 bg-slate-900 text-white flex items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2 truncate">
          <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            {activeTab === 'video' ? <Film className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
              <span>{visual.videoTitle || visual.topic}</span>
            </h4>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700/80 text-[11px] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`px-2 py-1 rounded-md flex items-center gap-1 font-medium transition-all ${
              activeTab === 'video'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Film className="w-3 h-3" />
            <span>AI Motion Video</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('diagram')}
            className={`px-2 py-1 rounded-md flex items-center gap-1 font-medium transition-all ${
              activeTab === 'diagram'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            <span>8K Diagram</span>
          </button>
        </div>
      </div>

      {/* Main Visual Content View */}
      {activeTab === 'video' ? (
        <div className="bg-slate-950 text-white">
          {/* Live Motion Simulation Player Display */}
          <div className="relative group overflow-hidden bg-black flex items-center justify-center min-h-[220px] max-h-[300px]">
            <LiveMotionSimulation
              visual={visual}
              currentTime={currentTime}
              isPlaying={isPlaying}
              width={800}
              height={450}
              className="cursor-pointer"
            />

            {/* Active Milestone Badge Overlay */}
            <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 shadow-lg pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{milestones[activeMilestoneIndex]?.title || 'Dynamic Simulation'}</span>
            </div>

            {/* Play/Pause Center Indicator on hover */}
            <button
              type="button"
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-slate-900/70 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            {/* Quick Action Overlay (Right Top) */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onEnlarge(visual, 'video')}
                className="p-1.5 rounded-lg bg-slate-900/80 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                title="Fullscreen Theater Mode"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Player Controls */}
          <div className="p-3 bg-slate-900/95 border-t border-slate-800 space-y-2.5">
            {/* Timeline Bar */}
            <div className="flex items-center gap-2.5 text-[11px] font-mono text-slate-400">
              <span className="w-8 text-right text-emerald-400 font-bold">
                0:{Math.floor(currentTime).toString().padStart(2, '0')}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 10}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:h-2 transition-all"
              />
              <span className="w-8">
                0:{Math.floor(duration).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-transform active:scale-95 flex items-center justify-center"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={handleRestart}
                  className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Restart Animation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={cyclePlaybackRate}
                  className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono font-bold transition-colors"
                  title="Change Playback Speed"
                >
                  {playbackRate}x
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDownload('video')}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Download MP4 Video"
                >
                  <Download className="w-3 h-3" />
                  <span>Save Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => onEnlarge(visual, 'video')}
                  className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Theater Mode"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Interactive Milestone Timeline Pills */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>Simulation Phases (Click to Jump):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                {milestones.map((m, idx) => {
                  const isActive = activeMilestoneIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleMilestoneClick(m.seconds)}
                      className={`p-2 rounded-lg text-left transition-all text-[11px] border ${
                        isActive
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-200 shadow-sm'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5 font-bold">
                        <span className="truncate">{m.title}</span>
                        <span className="font-mono text-[10px] text-emerald-400">{m.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{m.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 8K Diagram Poster View */
        <div className="bg-slate-900">
          <div className="relative group overflow-hidden bg-slate-950 flex items-center justify-center min-h-[220px] max-h-[320px]">
            <img
              src={visual.imageUrl}
              alt={visual.topic}
              className="w-full h-full max-h-[320px] object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
              onClick={() => onEnlarge(visual, 'diagram')}
              loading="lazy"
            />
            {/* Synexora AI Brand Overlay */}
            <div className="absolute bottom-2.5 left-2.5 bg-slate-950/85 backdrop-blur-md border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1.5 shadow-md pointer-events-none">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Synexora AI • 8K Concept</span>
            </div>

            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onEnlarge(visual, 'diagram')}
                className="p-2 rounded-full bg-white/90 text-slate-800 hover:bg-white shadow-md transition-transform hover:scale-110"
                title="Enlarge Diagram"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDownload('image')}
                className="p-2 rounded-full bg-white/90 text-slate-800 hover:bg-white shadow-md transition-transform hover:scale-110"
                title="Download 8K PNG"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info & Key Mechanics */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-slate-700 leading-relaxed text-[11px]">{visual.caption}</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold shrink-0 border border-emerald-200">
            Synexora AI
          </span>
        </div>

        {/* Key Visual Mechanics Badges */}
        {visual.keyMechanics && visual.keyMechanics.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-600" />
              <span>Key Dynamics:</span>
            </span>
            {visual.keyMechanics.map((km, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 font-medium"
              >
                {km}
              </span>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
          {onRegenerate ? (
            <button
              type="button"
              onClick={onRegenerate}
              className="text-slate-600 hover:text-emerald-700 flex items-center gap-1 font-medium transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Re-synthesize Motion Visual</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownload(activeTab === 'video' ? 'video' : 'image')}
              className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-semibold"
            >
              <Download className="w-3 h-3" />
              <span>Export {activeTab === 'video' ? 'MP4' : 'PNG'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
