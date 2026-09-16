import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '../components/AppLayout';
import API from '../lib/api';
import jsPDF from 'jspdf';
import {
  Brain,
  Plus,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Loader2,
  Bot,
  FileText,
  Layers,
  Download,
  HelpCircle,
  X,
  Send,
  Sparkles,
  User as UserIcon,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  BookOpen,
  Lightbulb,
  Target,
  Copy,
  Check,
} from 'lucide-react';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';

type MemorySource = 'all' | 'rag' | 'learning-ai' | 'manual';

interface MemoryCard {
  _id: string;
  concept: string;
  definition: string;
  course: string;
  source?: 'learning-ai' | 'rag' | 'manual';
  createdAt?: string;
}

interface DoubtMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

// Inline Markdown & Code Formatter
const renderInlineMarkdown = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="font-mono text-[11px] bg-slate-200/80 text-emerald-800 px-1 py-0.5 rounded font-semibold">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

// Formatted AI / Memory Message with cleanly aligned Concept Definition, Solution Steps, and Takeaways
const FormattedMemoryContent: React.FC<{ text: string }> = ({ text }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(codeText);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const lines = text.split('\n');
  const blocks: Array<{
    type: 'definition-card' | 'solution-card' | 'takeaway-card' | 'header' | 'paragraph';
    title?: string;
    content: string[];
  }> = [];

  let currentSection: 'definition' | 'solution' | 'takeaway' | 'none' = 'none';
  let currentLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      if (currentLines.length > 0 && currentSection === 'none') {
        blocks.push({ type: 'paragraph', content: currentLines });
        currentLines = [];
      }
      continue;
    }

    // Check for standard structured sections
    if (
      trimmed.includes('Concept Definition') ||
      trimmed.startsWith('### 📖') ||
      trimmed.startsWith('### Concept') ||
      trimmed.startsWith('**Concept Definition:**')
    ) {
      if (currentLines.length > 0) {
        blocks.push({
          type: currentSection === 'definition' ? 'definition-card' : currentSection === 'solution' ? 'solution-card' : currentSection === 'takeaway' ? 'takeaway-card' : 'paragraph',
          content: currentLines,
        });
        currentLines = [];
      }
      currentSection = 'definition';
      continue;
    } else if (
      trimmed.includes('Step-by-Step Solution') ||
      trimmed.includes('Solution & Explanation') ||
      trimmed.startsWith('### 💡') ||
      trimmed.startsWith('### Solution') ||
      trimmed.startsWith('**Step-by-Step Solution:**')
    ) {
      if (currentLines.length > 0) {
        blocks.push({
          type: currentSection === 'definition' ? 'definition-card' : currentSection === 'solution' ? 'solution-card' : currentSection === 'takeaway' ? 'takeaway-card' : 'paragraph',
          content: currentLines,
        });
        currentLines = [];
      }
      currentSection = 'solution';
      continue;
    } else if (
      trimmed.includes('Key Takeaway') ||
      trimmed.includes('Takeaway & Example') ||
      trimmed.startsWith('### 🎯') ||
      trimmed.startsWith('### Key Takeaway') ||
      trimmed.startsWith('**Key Takeaway:**')
    ) {
      if (currentLines.length > 0) {
        blocks.push({
          type: currentSection === 'definition' ? 'definition-card' : currentSection === 'solution' ? 'solution-card' : currentSection === 'takeaway' ? 'takeaway-card' : 'paragraph',
          content: currentLines,
        });
        currentLines = [];
      }
      currentSection = 'takeaway';
      continue;
    } else if (trimmed.startsWith('### ')) {
      if (currentLines.length > 0) {
        blocks.push({
          type: currentSection === 'definition' ? 'definition-card' : currentSection === 'solution' ? 'solution-card' : currentSection === 'takeaway' ? 'takeaway-card' : 'paragraph',
          content: currentLines,
        });
        currentLines = [];
      }
      currentSection = 'none';
      blocks.push({ type: 'header', content: [trimmed.replace(/^###\s*/, '')] });
      continue;
    }

    currentLines.push(trimmed);
  }

  if (currentLines.length > 0) {
    blocks.push({
      type: currentSection === 'definition' ? 'definition-card' : currentSection === 'solution' ? 'solution-card' : currentSection === 'takeaway' ? 'takeaway-card' : 'paragraph',
      content: currentLines,
    });
  }

  // Fallback cleanly if no section card was explicitly formatted
  if (!blocks.some((b) => b.type === 'definition-card' || b.type === 'solution-card' || b.type === 'takeaway-card')) {
    return (
      <div className="space-y-2 text-slate-800 text-xs leading-relaxed">
        {lines.map((l, idx) => {
          const t = l.trim();
          if (!t) return <div key={idx} className="h-1" />;
          if (t.startsWith('- ') || t.startsWith('* ') || t.startsWith('• ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="flex-1">{renderInlineMarkdown(t.replace(/^[-*•]\s*/, ''))}</div>
              </div>
            );
          }
          if (/^\d+\.\s/.test(t)) {
            const num = t.match(/^(\d+)\.\s/)?.[1];
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded shrink-0">
                  {num}
                </span>
                <div className="flex-1">{renderInlineMarkdown(t.replace(/^\d+\.\s*/, ''))}</div>
              </div>
            );
          }
          if (t.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-slate-900 text-xs mt-2 mb-1 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                {t.replace(/^###\s*/, '')}
              </h4>
            );
          }
          return <p key={idx}>{renderInlineMarkdown(t)}</p>;
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2.5 text-xs text-slate-800">
      {blocks.map((block, idx) => {
        if (block.type === 'definition-card') {
          return (
            <div
              key={idx}
              className="bg-emerald-50/80 border-l-3 border-emerald-500 rounded-r-md p-2.5 shadow-2xs space-y-1"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-900 uppercase tracking-wide">
                <BookOpen className="w-3 h-3 text-emerald-600" />
                <span>Concept Definition</span>
              </div>
              <div className="text-slate-800 leading-relaxed space-y-1">
                {block.content.map((line, lIdx) => (
                  <p key={lIdx}>{renderInlineMarkdown(line)}</p>
                ))}
              </div>
            </div>
          );
        }

        if (block.type === 'solution-card') {
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-md p-2.5 shadow-xs space-y-1.5"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-1">
                <Lightbulb className="w-3 h-3 text-amber-500" />
                <span>Step-by-Step Solution & Explanation</span>
              </div>
              <div className="space-y-1.5 text-slate-700 leading-relaxed">
                {block.content.map((line, lIdx) => {
                  const isStep =
                    line.startsWith('- **Step') ||
                    line.startsWith('**Step') ||
                    /^\d+\./.test(line) ||
                    line.startsWith('- ') ||
                    line.startsWith('• ');

                  if (isStep) {
                    return (
                      <div
                        key={lIdx}
                        className="bg-slate-50 border border-slate-200/80 rounded p-2 flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <div className="flex-1">{renderInlineMarkdown(line.replace(/^[-*•]\s*/, ''))}</div>
                      </div>
                    );
                  }

                  if (line.startsWith('```')) {
                    const code = line.replace(/```[a-z]*/g, '').trim();
                    return (
                      <div key={lIdx} className="relative group my-1">
                        <pre className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded overflow-x-auto">
                          <code>{code}</code>
                        </pre>
                        <button
                          onClick={() => handleCopy(code)}
                          className="absolute top-1.5 right-1.5 p-1 rounded bg-slate-800 text-slate-300 hover:text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                          title="Copy Code"
                        >
                          {copiedCode === code ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    );
                  }

                  return <p key={lIdx}>{renderInlineMarkdown(line)}</p>;
                })}
              </div>
            </div>
          );
        }

        if (block.type === 'takeaway-card') {
          return (
            <div
              key={idx}
              className="bg-indigo-50/80 border-l-3 border-indigo-500 rounded-r-md p-2.5 shadow-2xs space-y-1"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-900 uppercase tracking-wide">
                <Target className="w-3 h-3 text-indigo-600" />
                <span>Key Takeaway & Example</span>
              </div>
              <div className="text-slate-800 leading-relaxed space-y-1">
                {block.content.map((line, lIdx) => (
                  <p key={lIdx}>{renderInlineMarkdown(line)}</p>
                ))}
              </div>
            </div>
          );
        }

        if (block.type === 'header') {
          return (
            <h4 key={idx} className="font-bold text-slate-900 text-xs mt-1.5 border-b border-slate-200 pb-0.5">
              {block.content.join(' ')}
            </h4>
          );
        }

        return (
          <div key={idx} className="space-y-1">
            {block.content.map((l, lIdx) => (
              <p key={lIdx}>{renderInlineMarkdown(l)}</p>
            ))}
          </div>
        );
      })}
    </div>
  );
};

// Parser helper for generating aligned styled PDFs
const parseSectionsForPdf = (rawText: string) => {
  const lines = rawText.split('\n');
  const definitionLines: string[] = [];
  const solutionLines: string[] = [];
  const takeawayLines: string[] = [];
  const generalLines: string[] = [];

  let currentSection: 'definition' | 'solution' | 'takeaway' | 'none' = 'none';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (
      trimmed.includes('Concept Definition') ||
      trimmed.startsWith('### 📖') ||
      trimmed.startsWith('### Concept') ||
      trimmed.startsWith('**Concept Definition:**')
    ) {
      currentSection = 'definition';
      continue;
    } else if (
      trimmed.includes('Step-by-Step Solution') ||
      trimmed.includes('Solution & Explanation') ||
      trimmed.startsWith('### 💡') ||
      trimmed.startsWith('### Solution') ||
      trimmed.startsWith('**Step-by-Step Solution:**')
    ) {
      currentSection = 'solution';
      continue;
    } else if (
      trimmed.includes('Key Takeaway') ||
      trimmed.includes('Takeaway & Example') ||
      trimmed.startsWith('### 🎯') ||
      trimmed.startsWith('### Key Takeaway') ||
      trimmed.startsWith('**Key Takeaway:**')
    ) {
      currentSection = 'takeaway';
      continue;
    } else if (trimmed.startsWith('### ')) {
      currentSection = 'none';
      generalLines.push(trimmed.replace(/^###\s*/, ''));
      continue;
    }

    if (currentSection === 'definition') {
      definitionLines.push(trimmed);
    } else if (currentSection === 'solution') {
      solutionLines.push(trimmed);
    } else if (currentSection === 'takeaway') {
      takeawayLines.push(trimmed);
    } else {
      generalLines.push(trimmed);
    }
  }

  return { definitionLines, solutionLines, takeawayLines, generalLines };
};

export const MemoryPage: React.FC = () => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MemorySource>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newConcept, setNewConcept] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [newCourse, setNewCourse] = useState('General');
  const [newSource, setNewSource] = useState<'manual' | 'learning-ai' | 'rag'>('manual');
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // RAG Doubt Modal State
  const [doubtModalCard, setDoubtModalCard] = useState<MemoryCard | null>(null);
  const [doubtMessages, setDoubtMessages] = useState<DoubtMessage[]>([]);
  const [doubtInput, setDoubtInput] = useState('');
  const [isDoubtThinking, setIsDoubtThinking] = useState(false);
  const [doubtError, setDoubtError] = useState<string | null>(null);

  // Voice input and audio output
  const {
    isListening,
    micError,
    startListening,
    stopListening,
    speakingId,
    toggleSpeak,
  } = useVoiceAssistant();

  const fetchCards = async () => {
    try {
      setIsLoading(true);
      const res = await API.get('/memory');
      if (res.data.success && res.data.cards) {
        setCards(res.data.cards);
      }
    } catch (err) {
      console.error('Fetch memory cards error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // Helper to accurately resolve card source (including backward compatibility)
  const getCardSource = (card: MemoryCard): 'rag' | 'learning-ai' | 'manual' => {
    if (card.source) return card.source;
    if (
      card.concept.includes(' — ') ||
      card.concept.match(/\.(pdf|docx|txt|md|csv)/i)
    ) {
      return 'rag';
    }
    return 'manual';
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConcept.trim() || !newDefinition.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await API.post('/memory', {
        concept: newConcept.trim(),
        definition: newDefinition.trim(),
        course: newCourse.trim() || 'General',
        source: newSource,
      });

      if (res.data.success && res.data.card) {
        setCards([res.data.card, ...cards]);
        setNewConcept('');
        setNewDefinition('');
        setNewCourse('General');
        setNewSource('manual');
        setIsAdding(false);
      }
    } catch (err) {
      console.error('Add memory card error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this memory concept?')) return;
    try {
      const res = await API.delete(`/memory/${id}`);
      if (res.data.success) {
        setCards(cards.filter((c) => c._id !== id));
      }
    } catch (err) {
      console.error('Delete card error:', err);
    }
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Download Structured Notes PDF Handler matching the exact aligned layout
  const handleDownloadPdf = (card: MemoryCard) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const src = getCardSource(card);
    const sourceLabel =
      src === 'rag'
        ? 'Ask RAG Document Knowledge'
        : src === 'learning-ai'
        ? 'Synexora AI Learning Tutor'
        : 'Manual Study Flashcard';

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const maxContentWidth = pageWidth - margin * 2;

    const drawHeader = () => {
      doc.setFillColor(16, 185, 129); // Synexora green
      doc.rect(0, 0, pageWidth, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('SYNEXORA — STUDY KNOWLEDGE & MEMORY NOTES', margin, 10.5);
    };

    const drawFooter = () => {
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Synexora AI Academic Workspace — Active Recall & Study Hub', margin, pageHeight - 8);
    };

    drawHeader();

    // Meta Header
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Source: ${sourceLabel}   |   Course: ${card.course}   |   Date: ${new Date(
        card.createdAt || Date.now()
      ).toLocaleDateString()}`,
      margin,
      22
    );

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, 25, pageWidth - margin, 25);

    // Concept Title Header
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const splitTitle = doc.splitTextToSize(card.concept, maxContentWidth);
    doc.text(splitTitle, margin, 33);

    let currentY = 33 + splitTitle.length * 6 + 3;

    const checkPageBreak = (neededHeight: number) => {
      if (currentY + neededHeight > pageHeight - 18) {
        drawFooter();
        doc.addPage();
        drawHeader();
        currentY = 22;
      }
    };

    // Parse structured sections
    const { definitionLines, solutionLines, takeawayLines, generalLines } = parseSectionsForPdf(card.definition);
    const hasSections = definitionLines.length > 0 || solutionLines.length > 0 || takeawayLines.length > 0;

    if (hasSections) {
      // 1. CONCEPT DEFINITION CARD
      if (definitionLines.length > 0) {
        const cleanDef = definitionLines.join(' ').replace(/\*\*/g, '');
        const textLines = doc.splitTextToSize(cleanDef, maxContentWidth - 10);
        const cardHeight = Math.max(16, 9 + textLines.length * 4.6);

        checkPageBreak(cardHeight + 6);

        // Fill background
        doc.setFillColor(240, 253, 244); // light emerald
        doc.roundedRect(margin, currentY, maxContentWidth, cardHeight, 2, 2, 'F');

        // Left accent bar
        doc.setFillColor(16, 185, 129); // emerald-500
        doc.rect(margin, currentY, 2.5, cardHeight, 'F');

        // Header
        doc.setTextColor(6, 78, 59); // emerald-900
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('CONCEPT DEFINITION', margin + 6, currentY + 5.5);

        // Text
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.text(textLines, margin + 6, currentY + 11);

        currentY += cardHeight + 5;
      }

      // 2. STEP-BY-STEP SOLUTION CARD
      if (solutionLines.length > 0) {
        let totalStepHeight = 11;
        const formattedSteps: string[][] = [];
        for (const s of solutionLines) {
          const cleanLine = s.replace(/^[-*•]\s*/, '').replace(/\*\*/g, '');
          const wrapped = doc.splitTextToSize(cleanLine, maxContentWidth - 14);
          formattedSteps.push(wrapped);
          totalStepHeight += wrapped.length * 4.4 + 3;
        }

        checkPageBreak(Math.min(totalStepHeight, 70));

        // Draw Solution Box
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, currentY, maxContentWidth, totalStepHeight, 2, 2, 'FD');

        // Solution Header
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('STEP-BY-STEP SOLUTION & EXPLANATION', margin + 5, currentY + 6);

        currentY += 10;

        for (let idx = 0; idx < formattedSteps.length; idx++) {
          const stepLines = formattedSteps[idx];
          const stepHeight = stepLines.length * 4.4 + 3;

          checkPageBreak(stepHeight + 4);

          // Step Bullet Badge
          doc.setFillColor(16, 185, 129);
          doc.circle(margin + 6, currentY + 1.5, 1, 'F');

          doc.setTextColor(51, 65, 85);
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'normal');
          doc.text(stepLines, margin + 10, currentY + 2.5);

          currentY += stepHeight;
        }

        currentY += 4;
      }

      // 3. KEY TAKEAWAY CARD
      if (takeawayLines.length > 0) {
        const cleanTakeaway = takeawayLines.join(' ').replace(/\*\*/g, '');
        const textLines = doc.splitTextToSize(cleanTakeaway, maxContentWidth - 10);
        const cardHeight = Math.max(16, 9 + textLines.length * 4.6);

        checkPageBreak(cardHeight + 6);

        // Fill background
        doc.setFillColor(238, 242, 255); // light indigo
        doc.roundedRect(margin, currentY, maxContentWidth, cardHeight, 2, 2, 'F');

        // Left accent bar
        doc.setFillColor(99, 102, 241); // indigo-500
        doc.rect(margin, currentY, 2.5, cardHeight, 'F');

        // Header
        doc.setTextColor(49, 46, 129); // indigo-900
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('KEY TAKEAWAY & EXAMPLE', margin + 6, currentY + 5.5);

        // Text
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.text(textLines, margin + 6, currentY + 11);

        currentY += cardHeight + 5;
      }
    } else {
      // General / Unstructured lines
      const splitDef = doc.splitTextToSize((generalLines.length > 0 ? generalLines.join('\n') : card.definition).replace(/\*\*/g, ''), maxContentWidth - 8);
      const boxHeight = splitDef.length * 4.8 + 8;
      checkPageBreak(boxHeight);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, currentY, maxContentWidth, boxHeight, 2, 2, 'FD');

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(splitDef, margin + 4, currentY + 6);
      currentY += boxHeight + 5;
    }

    drawFooter();

    const sanitizedTitle = (card.concept || 'Notes')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 35);
    doc.save(`${sanitizedTitle}_Structured_Notes.pdf`);
  };

  // Open Doubt Modal
  const handleOpenDoubtModal = (card: MemoryCard) => {
    setDoubtModalCard(card);
    setDoubtMessages([
      {
        id: '1',
        sender: 'ai',
        text: `### 📖 Concept Context\nGrounded in **${card.concept}** (${card.course}).\n\n### 💡 Step-by-Step Guidance\nAsk any question, formula breakdown, or intuition about this note!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setDoubtInput('');
    setDoubtError(null);
  };

  // Send Doubt Question
  const handleSendDoubt = async (e?: React.FormEvent, customQuestion?: string) => {
    if (e) e.preventDefault();
    const question = (customQuestion || doubtInput).trim();
    if (!question || !doubtModalCard || isDoubtThinking) return;

    const userMsg: DoubtMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setDoubtMessages((prev) => [...prev, userMsg]);
    setDoubtInput('');
    setIsDoubtThinking(true);
    setDoubtError(null);

    try {
      const res = await API.post('/ai/memory-doubt', {
        concept: doubtModalCard.concept,
        definition: doubtModalCard.definition,
        course: doubtModalCard.course,
        question,
        history: doubtMessages,
      });

      if (res.data.success && res.data.reply) {
        const aiMsg: DoubtMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: res.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setDoubtMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(res.data.message || 'No reply received');
      }
    } catch (err: any) {
      console.error('Doubt solving error:', err);
      const errMsg = err.response?.data?.message || 'Failed to solve doubt with Groq AI.';
      setDoubtError(errMsg);
    } finally {
      setIsDoubtThinking(false);
    }
  };

  // Section Counts
  const counts = useMemo(() => {
    let rag = 0;
    let learningAi = 0;
    let manual = 0;

    cards.forEach((c) => {
      const src = getCardSource(c);
      if (src === 'rag') rag++;
      else if (src === 'learning-ai') learningAi++;
      else manual++;
    });

    return { all: cards.length, rag, 'learning-ai': learningAi, manual };
  }, [cards]);

  const filteredCards = cards.filter((c) => {
    const src = getCardSource(c);
    if (activeTab !== 'all' && src !== activeTab) {
      return false;
    }

    const q = searchQuery.toLowerCase();
    return (
      c.concept.toLowerCase().includes(q) ||
      c.course.toLowerCase().includes(q) ||
      c.definition.toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-green-600" />
              <span>Knowledge Memory & Recall Hub</span>
            </h1>
            <p className="text-xs text-slate-500">
              Categorized memory vault storing concepts from Ask RAG, Learning AI Tutor, and custom flashcards.
            </p>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="btn-primary text-xs self-start sm:self-auto gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{isAdding ? 'Cancel' : 'Add Concept'}</span>
          </button>
        </div>

        {/* Add Concept Form */}
        {isAdding && (
          <form
            onSubmit={handleAddCard}
            className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-xs"
          >
            <h2 className="text-sm font-bold text-slate-900">Add New Memory Concept</h2>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Concept / Title</label>
                <input
                  type="text"
                  value={newConcept}
                  onChange={(e) => setNewConcept(e.target.value)}
                  placeholder="e.g. QuickSort Algorithm"
                  required
                  className="input-clean text-xs"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Course / Subject</label>
                <input
                  type="text"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  placeholder="e.g. CS 301"
                  className="input-clean text-xs"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Memory Section</label>
                <select
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value as any)}
                  className="input-clean text-xs"
                >
                  <option value="manual">Manual Flashcard</option>
                  <option value="learning-ai">Learning AI Tutor</option>
                  <option value="rag">Ask RAG Document</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Explanation / Definition / Notes</label>
              <textarea
                value={newDefinition}
                onChange={(e) => setNewDefinition(e.target.value)}
                placeholder="Write the definition, formula, or summary..."
                required
                className="input-clean text-xs min-h-[80px]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-primary text-xs disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Save to Memory'}
              </button>
            </div>
          </form>
        )}

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Memory</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rag')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'rag'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-purple-50 hover:text-purple-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ask RAG Memory</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'rag' ? 'bg-purple-700 text-white' : 'bg-purple-50 text-purple-700 border border-purple-200'
            }`}>
              {counts.rag}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('learning-ai')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'learning-ai'
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-green-50 hover:text-green-700'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Learning AI Memory</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'learning-ai' ? 'bg-green-700 text-white' : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {counts['learning-ai']}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'manual'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Manual Flashcards</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'manual' ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {counts.manual}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'rag'
                ? 'Search Ask RAG document memory...'
                : activeTab === 'learning-ai'
                ? 'Search Learning AI tutor memory...'
                : 'Search concepts, courses, or definitions...'
            }
            className="input-clean pl-9 text-xs"
          />
        </div>

        {/* Concepts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <div className="md:col-span-2 p-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-green-600" />
              <span>Loading memory cards from database...</span>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="md:col-span-2 p-12 text-center text-slate-400 text-sm border border-slate-200 rounded-lg bg-slate-50/50">
              <Brain className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600 mb-1">
                {activeTab === 'rag'
                  ? 'No Ask RAG memory items found.'
                  : activeTab === 'learning-ai'
                  ? 'No Learning AI memory items found.'
                  : 'No memory concepts found.'}
              </p>
              <p className="text-xs text-slate-400">
                {activeTab === 'rag'
                  ? 'Open the Documents page, ask questions on your uploaded files, and click "Store to Memory".'
                  : activeTab === 'learning-ai'
                  ? 'Open the Learning AI page, chat with the AI tutor, and click "Store to Memory" on any response.'
                  : 'Use "Add Concept" above or store explanations directly from Learning AI or Documents page.'}
              </p>
            </div>
          ) : (
            filteredCards.map((card) => {
              const isRevealed = !!revealedIds[card._id];
              const src = getCardSource(card);

              return (
                <div
                  key={card._id}
                  className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-sm"
                >
                  <div>
                    {/* Card Top Metadata & Source Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Source Badge */}
                        {src === 'rag' ? (
                          <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>Ask RAG</span>
                          </span>
                        ) : src === 'learning-ai' ? (
                          <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200 flex items-center gap-1">
                            <Bot className="w-3 h-3" />
                            <span>Learning AI</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                            <Brain className="w-3 h-3" />
                            <span>Manual Flashcard</span>
                          </span>
                        )}

                        <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          {card.course}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDelete(card._id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete concept"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Concept Title */}
                    <h3 className="text-sm font-bold text-slate-900 mb-3 leading-snug">
                      {card.concept}
                    </h3>

                    {/* Definition / Explanation Body */}
                    <div className="bg-slate-50/70 border border-slate-150 rounded-lg p-3 min-h-[60px] text-xs text-slate-700">
                      {isRevealed ? (
                        <FormattedMemoryContent text={card.definition} />
                      ) : (
                        <p className="text-slate-400 italic flex items-center gap-1.5">
                          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                          <span>Definition hidden for active recall practice</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleReveal(card._id)}
                        className="btn-secondary text-xs py-1 px-2.5 gap-1.5"
                      >
                        {isRevealed ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hide</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Reveal Definition</span>
                          </>
                        )}
                      </button>

                      {isRevealed && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(card)}
                            className="btn-secondary text-xs py-1 px-2.5 gap-1.5 text-green-700 hover:bg-green-50 hover:border-green-300 transition-colors font-medium"
                            title="Download this note as a structured aligned PDF"
                          >
                            <Download className="w-3.5 h-3.5 text-green-600" />
                            <span>Download PDF</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDoubtModal(card)}
                            className="btn-secondary text-xs py-1 px-2.5 gap-1.5 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-colors font-medium"
                            title="Ask AI Doubt grounded in this concept"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                            <span>Ask Doubt</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MODAL: GROUNDED AI DOUBT SOLVER */}
        {doubtModalCard && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-xl max-w-xl w-full p-0 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Ask Doubt:</span>
                      <span className="text-purple-700 truncate max-w-[200px]">{doubtModalCard.concept}</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">Grounded in your saved memory context • {doubtModalCard.course}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDoubtModalCard(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200/50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages Body */}
              <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-white">
                {doubtMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center text-xs font-semibold shrink-0 ${
                        msg.sender === 'user'
                          ? 'bg-slate-800 text-white'
                          : 'bg-purple-600 text-white'
                      }`}
                    >
                      {msg.sender === 'user' ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>
                    <div
                      className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-purple-50 text-slate-900 border border-purple-200'
                          : 'bg-slate-50 text-slate-800 border border-slate-200'
                      }`}
                    >
                      {msg.sender === 'ai' ? (
                        <FormattedMemoryContent text={msg.text} />
                      ) : (
                        <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                      )}

                      <div className="mt-1.5 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{msg.timestamp}</span>
                        {msg.sender === 'ai' && (
                          <button
                            type="button"
                            onClick={() => toggleSpeak(msg.text, msg.id)}
                            className="text-purple-700 hover:underline flex items-center gap-1 font-medium"
                          >
                            {speakingId === msg.id ? (
                              <>
                                <VolumeX className="w-3 h-3 text-amber-700 animate-pulse" />
                                <span>Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3 text-purple-600" />
                                <span>Listen</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isDoubtThinking && (
                  <div className="flex items-center gap-2 text-xs text-purple-700 italic p-2">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-purple-600" />
                    <span>Analyzing grounded context & resolving doubt with Groq AI...</span>
                  </div>
                )}

                {doubtError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                    {doubtError}
                  </div>
                )}

                {micError && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                    {micError}
                  </div>
                )}
              </div>

              {/* Quick Doubt Prompt Pills */}
              <div className="px-3 py-2 border-t border-slate-200 bg-white flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <button
                  type="button"
                  onClick={() => handleSendDoubt(undefined, 'Explain this concept with a practical real-world example')}
                  disabled={isDoubtThinking}
                  className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 shrink-0 transition-colors disabled:opacity-50"
                >
                  💡 Practical Example
                </button>
                <button
                  type="button"
                  onClick={() => handleSendDoubt(undefined, 'Simplify this explanation in 2 plain sentences')}
                  disabled={isDoubtThinking}
                  className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 shrink-0 transition-colors disabled:opacity-50"
                >
                  ⚡ Simplify It
                </button>
                <button
                  type="button"
                  onClick={() => handleSendDoubt(undefined, 'Give me an intuitive analogy to easily memorize this')}
                  disabled={isDoubtThinking}
                  className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 shrink-0 transition-colors disabled:opacity-50"
                >
                  🧠 Intuitive Analogy
                </button>
                <button
                  type="button"
                  onClick={() => handleSendDoubt(undefined, 'Generate a multiple-choice practice question based on this note')}
                  disabled={isDoubtThinking}
                  className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 shrink-0 transition-colors disabled:opacity-50"
                >
                  📝 Practice Quiz
                </button>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendDoubt} className="p-3 border-t border-slate-200 bg-slate-50 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isListening) {
                      stopListening();
                    } else {
                      startListening((text) => setDoubtInput(text));
                    }
                  }}
                  disabled={isDoubtThinking}
                  className={`px-2.5 py-1.5 rounded-md border flex items-center gap-1 text-xs transition-colors shrink-0 ${
                    isListening
                      ? 'bg-red-500 text-white border-red-600 animate-pulse'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                  title={isListening ? 'Stop listening' : 'Voice dictation'}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice'}</span>
                </button>

                <input
                  type="text"
                  value={doubtInput}
                  onChange={(e) => setDoubtInput(e.target.value)}
                  placeholder={`Ask a doubt about ${doubtModalCard.concept}...`}
                  disabled={isDoubtThinking}
                  className="input-clean text-xs flex-1 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!doubtInput.trim() || isDoubtThinking}
                  className="btn-primary text-xs px-4 gap-1.5 disabled:opacity-50 bg-purple-600 hover:bg-purple-700"
                >
                  {isDoubtThinking ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Ask</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
