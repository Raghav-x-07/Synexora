import React, { useState } from 'react';
import {
  GitFork,
  ArrowDown,
  CheckCircle2,
  PlayCircle,
  HelpCircle,
  Cpu,
  Layers,
  Sparkles,
  Maximize2,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  RotateCcw,
  Brain,
  GraduationCap,
} from 'lucide-react';

export interface FlowchartStep {
  step: number;
  type: 'start' | 'process' | 'decision' | 'end' | string;
  title: string;
  description: string;
  details?: string;
  badge?: string;
}

export interface FlowchartConnection {
  from: number;
  to: number;
  label?: string;
}

export interface TopicFlowchart {
  topic: string;
  flowchartTitle: string;
  flowchartSummary: string;
  category?: string;
  steps: FlowchartStep[];
  connections?: FlowchartConnection[];
  keyTakeaways?: string[];
}

interface FlowchartVisualizerCardProps {
  flowchart: TopicFlowchart;
  onEnlarge?: (flowchart: TopicFlowchart) => void;
  onStoreToMemory?: (flowchart: TopicFlowchart) => void;
  onPostToClassroom?: (flowchart: TopicFlowchart) => void;
  isStoredInMemory?: boolean;
}

export const FlowchartVisualizerCard: React.FC<FlowchartVisualizerCardProps> = ({
  flowchart,
  onEnlarge,
  onStoreToMemory,
  onPostToClassroom,
  isStoredInMemory = false,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isInteractiveMode, setIsInteractiveMode] = useState<boolean>(false);

  const steps = flowchart.steps || [];
  const connections = flowchart.connections || [];

  const handleCopyOutline = () => {
    const text = `${flowchart.flowchartTitle}\n${flowchart.flowchartSummary}\n\n` +
      steps.map((s) => `[Step ${s.step}: ${s.type.toUpperCase()}] ${s.title}\n- ${s.description}${s.details ? `\n- Details: ${s.details}` : ''}`).join('\n\n') +
      (flowchart.keyTakeaways ? `\n\nKey Takeaways:\n` + flowchart.keyTakeaways.map((k) => `• ${k}`).join('\n') : '');

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'start':
        return <PlayCircle className="w-4 h-4 text-emerald-400" />;
      case 'decision':
        return <HelpCircle className="w-4 h-4 text-amber-400" />;
      case 'end':
        return <CheckCircle2 className="w-4 h-4 text-purple-400" />;
      default:
        return <Cpu className="w-4 h-4 text-blue-400" />;
    }
  };

  const getStepTheme = (type: string, isHighlighted: boolean) => {
    switch (type) {
      case 'start':
        return {
          cardBg: isHighlighted ? 'bg-emerald-950/90 border-emerald-400 ring-2 ring-emerald-400/50' : 'bg-slate-900 border-emerald-500/40 hover:border-emerald-400',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          numBg: 'bg-emerald-500 text-slate-950 font-bold',
        };
      case 'decision':
        return {
          cardBg: isHighlighted ? 'bg-amber-950/90 border-amber-400 ring-2 ring-amber-400/50' : 'bg-slate-900 border-amber-500/40 hover:border-amber-400',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          numBg: 'bg-amber-500 text-slate-950 font-bold',
        };
      case 'end':
        return {
          cardBg: isHighlighted ? 'bg-purple-950/90 border-purple-400 ring-2 ring-purple-400/50' : 'bg-slate-900 border-purple-500/40 hover:border-purple-400',
          badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          numBg: 'bg-purple-500 text-slate-950 font-bold',
        };
      default:
        return {
          cardBg: isHighlighted ? 'bg-blue-950/90 border-blue-400 ring-2 ring-blue-400/50' : 'bg-slate-900 border-slate-700 hover:border-blue-400',
          badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          numBg: 'bg-blue-600 text-white font-bold',
        };
    }
  };

  return (
    <div className="mt-3 bg-slate-950 text-slate-100 border border-slate-800 rounded-xl overflow-hidden shadow-md animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <GitFork className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-2">
              <span>{flowchart.flowchartTitle || `${flowchart.topic} Process Flowchart`}</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Category: {flowchart.category?.toUpperCase() || 'CONCEPT WORKFLOW'} • {steps.length} Steps
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsInteractiveMode(!isInteractiveMode);
              if (!isInteractiveMode) setActiveStepIndex(0);
              else setActiveStepIndex(null);
            }}
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 border transition-colors ${
              isInteractiveMode
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
            }`}
            title="Step through process interactively"
          >
            <Layers className="w-3 h-3" />
            <span>{isInteractiveMode ? 'Step Mode: ON' : 'Step-Through'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyOutline}
            className="p-1.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 transition-colors"
            title="Copy flowchart outline"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {onStoreToMemory && (
            <button
              type="button"
              onClick={() => onStoreToMemory(flowchart)}
              disabled={isStoredInMemory}
              className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 border transition-colors ${
                isStoredInMemory
                  ? 'bg-green-900/60 text-green-300 border-green-700 cursor-default'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-green-950 hover:border-green-600 hover:text-green-300'
              }`}
              title={isStoredInMemory ? 'Stored in Memory' : 'Save flowchart to Knowledge Memory'}
            >
              {isStoredInMemory ? (
                <>
                  <Check className="w-3 h-3 text-green-400" />
                  <span>Stored</span>
                </>
              ) : (
                <>
                  <Brain className="w-3 h-3 text-green-400" />
                  <span>Save Flowchart</span>
                </>
              )}
            </button>
          )}

          {onPostToClassroom && (
            <button
              type="button"
              onClick={() => onPostToClassroom(flowchart)}
              className="px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 border border-[#F4C542]/70 bg-[#F4C542] text-[#111111] hover:bg-[#E5B532] transition-colors shadow-xs"
              title="Post flowchart directly to your classroom"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#111111]" />
              <span>Post to Class</span>
            </button>
          )}

          {onEnlarge && (
            <button
              type="button"
              onClick={() => onEnlarge(flowchart)}
              className="p-1.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 transition-colors"
              title="Fullscreen Theater View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Summary Box */}
      <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">{flowchart.flowchartSummary}</p>
      </div>

      {/* Interactive Step Navigator Bar (when interactive mode is on) */}
      {isInteractiveMode && (
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-emerald-400 font-bold">
              Active Step: {activeStepIndex !== null ? activeStepIndex + 1 : 1} / {steps.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveStepIndex((prev) => Math.max((prev || 0) - 1, 0))}
              disabled={activeStepIndex === 0}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 flex items-center gap-1 text-[11px]"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>Prev</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStepIndex((prev) => Math.min((prev ?? -1) + 1, steps.length - 1))}
              disabled={activeStepIndex === steps.length - 1}
              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold disabled:opacity-40 flex items-center gap-1 text-[11px]"
            >
              <span>Next</span>
              <ChevronRight className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setActiveStepIndex(0)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400"
              title="Reset to Step 1"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Flowchart Steps Timeline / Nodes */}
      <div className="p-4 space-y-3 max-h-[520px] overflow-y-auto">
        {steps.map((step, idx) => {
          const isHighlighted = activeStepIndex === idx;
          const theme = getStepTheme(step.type, isHighlighted);
          const nextStep = steps[idx + 1];
          const conn = connections.find((c) => c.from === step.step);

          return (
            <div key={idx} className="flex flex-col items-center w-full">
              {/* Node Card */}
              <div
                onClick={() => {
                  if (isInteractiveMode) setActiveStepIndex(idx);
                }}
                className={`w-full p-3.5 rounded-xl border transition-all cursor-pointer ${theme.cardBg}`}
              >
                <div className="flex items-start justify-between gap-2.5 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${theme.numBg}`}>
                      {step.step}
                    </span>
                    <h5 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                      {getStepIcon(step.type)}
                      <span>{step.title}</span>
                    </h5>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wide ${theme.badgeBg}`}>
                    {step.badge || step.type}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-7">
                  {step.description}
                </p>

                {step.details && (
                  <div className="mt-2 ml-7 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 font-mono">
                    <span className="text-emerald-400 font-bold mr-1.5">⚡ Key Logic:</span>
                    {step.details}
                  </div>
                )}
              </div>

              {/* Connecting Directional Arrow */}
              {nextStep && (
                <div className="my-1.5 flex flex-col items-center gap-0.5 text-slate-500">
                  {conn?.label && (
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-400">
                      {conn.label}
                    </span>
                  )}
                  <ArrowDown className="w-4 h-4 text-emerald-500 animate-bounce" />
                </div>
              )}
            </div>
          );
        })}

        {/* Key Takeaways Section */}
        {flowchart.keyTakeaways && flowchart.keyTakeaways.length > 0 && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Core Flowchart Insights & Takeaways</span>
            </div>
            <ul className="space-y-1.5 pl-1 text-slate-300">
              {flowchart.keyTakeaways.map((takeaway, tIdx) => (
                <li key={tIdx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="font-mono">Engine: Synexora AI Flowchart Modeler</span>
        <span className="text-emerald-400 font-medium">Deterministic Step Sequence</span>
      </div>
    </div>
  );
};
