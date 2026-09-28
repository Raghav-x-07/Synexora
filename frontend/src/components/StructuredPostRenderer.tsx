import React from 'react';
import {
  Film,
  GitFork,
  Bot,
  Sparkles,
  ExternalLink,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Layers,
  Link as LinkIcon,
  Download,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { resolveMediaUrl } from '../lib/api';

interface Attachment {
  title: string;
  url: string;
  type?: 'link' | 'file' | 'youtube' | 'drive';
}

interface StructuredPostRendererProps {
  content: string;
  authorName?: string;
  attachments?: Attachment[];
  createdAt?: string;
}

export const StructuredPostRenderer: React.FC<StructuredPostRendererProps> = ({
  content,
  authorName,
  attachments = [],
}) => {

  // 1. Detect AI Content Type
  const isVideoPost =
    content.includes('🎬') ||
    content.includes('AI Concept Video Lesson') ||
    attachments.some(
      (a) =>
        a.title?.toLowerCase().includes('video') ||
        a.url?.endsWith('.mp4') ||
        a.url?.includes('/generated-videos/') ||
        a.url?.includes('blob:')
    );

  const isFlowchartPost =
    content.includes('📊') ||
    content.includes('AI Process Flowchart') ||
    attachments.some((a) => a.title?.toLowerCase().includes('flowchart') || a.url?.includes('flowchart'));

  const isAiGuidePost =
    content.includes('💡') ||
    content.includes('AI Learning Guide') ||
    content.includes('AI Tutor Topic') ||
    content.includes('AI Explanation');

  const isAiContent = isVideoPost || isFlowchartPost || isAiGuidePost;

  // Find video attachment if available
  const videoAttachment = attachments.find(
    (a) =>
      a.url?.includes('/generated-videos/') ||
      a.url?.endsWith('.mp4') ||
      a.url?.includes('.mp4?') ||
      a.title?.toLowerCase().includes('video') ||
      a.type === 'file' ||
      a.url?.startsWith('blob:') ||
      a.url?.includes('/api/ai/video')
  );

  // Parse instructor note from content
  const instructorNoteMatch = content.match(/> 💬 \*\*Instructor Note:\*\*\s*(.+?)(?=\n\n|\n\*\*|$)/s);
  const instructorNote = instructorNoteMatch ? instructorNoteMatch[1].trim() : null;

  // Parse title
  const titleMatch = content.match(/\*\*(?:🎬|📊|💡)?\s*(?:AI Concept Video Lesson|AI Process Flowchart|AI Learning Guide):\s*(.+?)\*\*/);
  const parsedTitle = titleMatch ? titleMatch[1].trim() : null;

  // Parse topic
  const topicMatch = content.match(/\*\*Topic:\*\*\s*(.+?)(?=\n|$)/);
  const parsedTopic = topicMatch ? topicMatch[1].trim() : null;

  // Parse overview
  const overviewMatch = content.match(/\*\*(?:Lesson Overview|Overview):\*\*\s*(.+?)(?=\n\n|\n\*\*Key Steps Preview:\*\*|$)/s);
  const parsedOverview = overviewMatch ? overviewMatch[1].trim() : null;

  // Parse flowchart steps
  const stepsSectionMatch = content.match(/\*\*Key Steps Preview:\*\*\s*([\s\S]+?)(?=$|\n\n\*\*)/);
  const rawSteps = stepsSectionMatch ? stepsSectionMatch[1].trim() : '';
  const parsedSteps = rawSteps
    ? rawSteps
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.startsWith('•') || line.startsWith('-') || /^\d+\./.test(line))
        .map((line) => {
          const stepMatch = line.match(/(?:•|-|\d+\.)\s*(?:Step\s*(\d+))?\s*(?:\[(.*?)\])?\s*:?\s*(.*)/i);
          if (stepMatch) {
            return {
              stepNum: stepMatch[1] || '',
              tag: stepMatch[2] || 'STEP',
              text: stepMatch[3] || line.replace(/^[•\-\d\.]\s*/, ''),
            };
          }
          return { stepNum: '', tag: 'INFO', text: line.replace(/^[•\-\d\.]\s*/, '') };
        })
    : [];

  // Parse clean body if it's a general guide or non-AI post
  const cleanBodyLines = () => {
    if (!isAiContent) return content;
    // Strip out the parsed header, instructor note, topic line, and overview to avoid duplication
    let remaining = content
      .replace(/\*\*(?:🎬|📊|💡)?\s*(?:AI Concept Video Lesson|AI Process Flowchart|AI Learning Guide):\s*.+?\*\*/g, '')
      .replace(/> 💬 \*\*Instructor Note:\*\*[\s\S]*?(?=\n\n|\n\*\*|$)/g, '')
      .replace(/\*\*Topic:\*\*\s*.+?(?=\n|$)/g, '')
      .replace(/\*\*(?:Lesson Overview|Overview):\*\*[\s\S]*?(?=\n\n|\n\*\*Key Steps Preview:\*\*|$)/g, '')
      .replace(/\*\*Key Steps Preview:\*\*[\s\S]*$/g, '')
      .trim();

    return remaining;
  };

  const remainingBody = cleanBodyLines();

  // If not AI post, render neatly formatted standard post
  if (!isAiContent) {
    return (
      <div className="space-y-3">
        <div className="text-xs text-[#111111] leading-relaxed whitespace-pre-wrap font-normal">
          {content.split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('>')) {
              return (
                <blockquote
                  key={idx}
                  className="p-3.5 my-2 rounded-2xl bg-[#FFF8E8] border-l-4 border-[#F4C542] text-[#333333] italic text-xs"
                >
                  {paragraph.replace(/^>\s*/, '')}
                </blockquote>
              );
            }
            return <p key={idx} className="mb-2 last:mb-0">{paragraph}</p>;
          })}
        </div>

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E8E1D2]/60">
            {attachments.map((att, idx) => (
              <a
                key={idx}
                href={resolveMediaUrl(att.url)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#E8E1D2] bg-[#FFF8E8] hover:bg-white text-xs font-semibold text-[#111111] transition-all hover:shadow-2xs"
              >
                <LinkIcon className="w-3 h-3 text-[#111111]" />
                <span>{att.title || 'Attached Resource'}</span>
                <ExternalLink className="w-3 h-3 text-[#777777]" />
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  // AI Structured Post Card
  return (
    <div className="space-y-4 font-sans animate-fade-in">
      {/* 1. Header Banner Badge */}
      <div className="rounded-2xl bg-gradient-to-r from-[#FFF8E8] via-[#FFFDF8] to-[#FFF8E8] border border-[#E8E1D2] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold shrink-0 shadow-xs">
            {isVideoPost && <Film className="w-5 h-5" />}
            {isFlowchartPost && <GitFork className="w-5 h-5" />}
            {isAiGuidePost && <Bot className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#111111] text-[#F4C542] flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {isVideoPost && 'AI Concept Video Lesson'}
                {isFlowchartPost && 'AI Process Flowchart'}
                {isAiGuidePost && 'AI Study Guide & Breakdown'}
              </span>
              {(parsedTopic || parsedTitle) && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#555555] border border-[#E8E1D2]">
                  {parsedTopic || 'Core Curriculum'}
                </span>
              )}
            </div>
            <h4 className="text-sm font-black text-[#111111] tracking-tight">
              {parsedTitle || parsedTopic || 'AI Generated Learning Module'}
            </h4>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          {parsedTopic && (
            <Link
              to={`/learning-ai?topic=${encodeURIComponent(parsedTopic)}`}
              className="btn-secondary text-[11px] py-1.5 px-3 font-bold inline-flex items-center gap-1.5"
            >
              <span>Explore Topic</span>
              <ArrowRight className="w-3 h-3 text-[#111111]" />
            </Link>
          )}
        </div>
      </div>

      {/* 2. Instructor Guidance Note Box (If present) */}
      {instructorNote && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FFFDF8] border-2 border-[#F4C542]/40 shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2] flex items-center justify-center shrink-0 mt-0.5">
            <GraduationCap className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#111111]">
                Instructor's Guidance for Students
              </span>
              <span className="text-[10px] text-[#777777] font-semibold">
                {authorName || 'Faculty Mentor'}
              </span>
            </div>
            <p className="text-xs text-[#333333] font-medium leading-relaxed italic bg-white/70 p-2.5 rounded-xl border border-[#E8E1D2]/60">
              "{instructorNote}"
            </p>
          </div>
        </div>
      )}

      {/* 3. Inline Video Player (If AI Video) */}
      {isVideoPost && videoAttachment?.url && (
        <div className="rounded-2xl border border-[#E8E1D2] bg-[#111111] overflow-hidden shadow-md space-y-0">
          <div className="p-3 bg-[#1A1A1A] border-b border-white/10 flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-[#F4C542]" />
              <span className="font-bold">{videoAttachment.title || parsedTitle || 'AI Concept Video Lesson'}</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={resolveMediaUrl(videoAttachment.url)}
                download={`${(parsedTopic || 'concept').toLowerCase().replace(/\s+/g, '-')}-lesson.mp4`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-colors"
                title="Download or open original MP4 video"
              >
                <Download className="w-3 h-3 text-[#F4C542]" />
                <span>Save MP4</span>
              </a>
              <span className="text-[10px] font-mono text-[#F4C542] bg-[#F4C542]/10 border border-[#F4C542]/30 px-2 py-0.5 rounded-full">
                Full HD • AI
              </span>
            </div>
          </div>

          <div className="relative bg-black flex items-center justify-center">
            <video
              src={resolveMediaUrl(videoAttachment.url)}
              controls
              playsInline
              preload="auto"
              className="w-full max-h-[420px] object-contain rounded-b-2xl bg-black"
            >
              Your browser does not support HTML5 video playback.
            </video>
          </div>
        </div>
      )}

      {/* 4. Lesson Synopsis / Overview */}
      {parsedOverview && (
        <div className="p-4 rounded-2xl bg-[#FFF8E8]/70 border border-[#E8E1D2] space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#777777] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#111111]" />
            <span>Concept Overview & Lesson Breakdown</span>
          </span>
          <p className="text-xs text-[#222222] leading-relaxed font-normal">
            {parsedOverview}
          </p>
        </div>
      )}

      {/* 5. Flowchart Structured Step Sequence (If Flowchart) */}
      {isFlowchartPost && parsedSteps.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E1D2] shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D2]">
            <span className="text-xs font-black text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#F4C542]" />
              <span>Process Flow Execution Steps</span>
            </span>
            <span className="text-[10px] font-bold text-[#777777]">
              {parsedSteps.length} Sequential Nodes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {parsedSteps.map((step, sIdx) => {
              const tagColors: Record<string, string> = {
                PROCESS: 'bg-blue-50 text-blue-800 border-blue-200',
                DECISION: 'bg-amber-50 text-amber-800 border-amber-200',
                INPUT: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                OUTPUT: 'bg-purple-50 text-purple-800 border-purple-200',
                START: 'bg-slate-100 text-slate-800 border-slate-300',
                END: 'bg-slate-100 text-slate-800 border-slate-300',
              };
              const badgeStyle = tagColors[step.tag.toUpperCase()] || 'bg-[#FFF8E8] text-[#111111] border-[#E8E1D2]';

              return (
                <div
                  key={sIdx}
                  className="p-3 rounded-xl bg-[#FFF8E8]/40 border border-[#E8E1D2] flex items-start gap-2.5 hover:bg-[#FFF8E8] transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#111111] text-[#F4C542] font-mono text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    {step.stepNum || sIdx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border uppercase tracking-wider ${badgeStyle}`}>
                        {step.tag}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#111111] leading-snug">
                      {step.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {parsedTopic && (
            <div className="pt-2 flex justify-end">
              <Link
                to={`/learning-ai?topic=${encodeURIComponent(parsedTopic)}`}
                className="btn-primary text-xs py-2 px-4 font-bold inline-flex items-center gap-2"
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>Open Full Interactive Diagram Studio</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 6. Remaining Detailed Notes / Guide text (If present) */}
      {remainingBody && (
        <div className="text-xs text-[#222222] leading-relaxed whitespace-pre-wrap p-4 bg-white rounded-2xl border border-[#E8E1D2] shadow-2xs">
          {remainingBody}
        </div>
      )}

      {/* 7. Attachments Pills */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {attachments.map((att, idx) => (
            <a
              key={idx}
              href={resolveMediaUrl(att.url)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-[#E8E1D2] bg-white hover:bg-[#FFF8E8] text-xs font-bold text-[#111111] transition-all shadow-2xs hover:shadow-xs"
            >
              {att.title?.toLowerCase().includes('video') ? (
                <Film className="w-3.5 h-3.5 text-[#111111]" />
              ) : att.title?.toLowerCase().includes('flowchart') ? (
                <GitFork className="w-3.5 h-3.5 text-[#111111]" />
              ) : (
                <LinkIcon className="w-3.5 h-3.5 text-[#111111]" />
              )}
              <span>{att.title || 'Learning Resource'}</span>
              <ExternalLink className="w-3 h-3 text-[#777777]" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
