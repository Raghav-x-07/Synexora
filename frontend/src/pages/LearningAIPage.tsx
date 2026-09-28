import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { FlowchartVisualizerCard, TopicFlowchart } from '../components/FlowchartVisualizerCard';
import { ShareToClassroomModal, ShareContentData } from '../components/ShareToClassroomModal';
import API from '../lib/api';
import {
  Bot,
  Send,
  Trash2,
  Sparkles,
  User as UserIcon,
  AlertCircle,
  Brain,
  Check,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  GitFork,
  Film,
  X,
  BookOpen,
  Lightbulb,
  Target,
  Copy,
  GraduationCap,
} from 'lucide-react';

interface Message {
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

// Formatted AI Message with cleanly aligned Concept Definition, Solution Steps, and Takeaways
const FormattedAIMessage: React.FC<{ text: string }> = ({ text }) => {
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
      <div className="space-y-2 text-slate-800 text-xs sm:text-sm leading-relaxed">
        {lines.map((l, idx) => {
          const t = l.trim();
          if (!t) return <div key={idx} className="h-1" />;
          if (t.startsWith('- ') || t.startsWith('* ') || t.startsWith('• ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <div className="flex-1">{renderInlineMarkdown(t.replace(/^[-*•]\s*/, ''))}</div>
              </div>
            );
          }
          if (/^\d+\.\s/.test(t)) {
            const num = t.match(/^(\d+)\.\s/)?.[1];
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded shrink-0">
                  {num}
                </span>
                <div className="flex-1">{renderInlineMarkdown(t.replace(/^\d+\.\s*/, ''))}</div>
              </div>
            );
          }
          if (t.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-slate-900 text-sm mt-3 mb-1 border-b border-slate-200 pb-1 flex items-center gap-1.5">
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
    <div className="space-y-3 text-xs sm:text-sm text-[#111111]">
      {blocks.map((block, idx) => {
        if (block.type === 'definition-card') {
          return (
            <div
              key={idx}
              className="bg-[#FFF8E8] border-l-4 border-[#F4C542] rounded-r-2xl p-4 shadow-xs space-y-1.5 border border-[#E8E1D2]"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#111111] uppercase tracking-wide">
                <BookOpen className="w-3.5 h-3.5 text-[#F4C542]" />
                <span>Concept Definition</span>
              </div>
              <div className="text-[#3F3F3F] leading-relaxed space-y-1">
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
              className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-2xl p-4 shadow-xs space-y-2.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#111111] uppercase tracking-wide border-b border-[#E8E1D2] pb-2">
                <Lightbulb className="w-3.5 h-3.5 text-[#F4C542]" />
                <span>Step-by-Step Solution & Explanation</span>
              </div>
              <div className="space-y-2 text-[#3F3F3F] leading-relaxed">
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
                        className="bg-[#FFFDF7] border border-[#E8E1D2] rounded-xl p-3 flex items-start gap-2.5"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#F4C542] mt-1.5 shrink-0" />
                        <div className="flex-1">{renderInlineMarkdown(line.replace(/^[-*•]\s*/, ''))}</div>
                      </div>
                    );
                  }

                  if (line.startsWith('```')) {
                    const code = line.replace(/```[a-z]*/g, '').trim();
                    return (
                      <div key={lIdx} className="relative group my-2">
                        <pre className="p-3.5 bg-[#111111] text-[#F4C542] font-mono text-xs rounded-xl overflow-x-auto">
                          <code>{code}</code>
                        </pre>
                        <button
                          onClick={() => handleCopy(code)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#222222] text-[#FFFFFF] hover:text-[#F4C542] text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                          title="Copy Code"
                        >
                          {copiedCode === code ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
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
              className="bg-[#F7F1E3]/70 border-l-4 border-[#111111] rounded-r-2xl p-4 shadow-xs space-y-1.5 border border-[#E8E1D2]"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#111111] uppercase tracking-wide">
                <Target className="w-3.5 h-3.5 text-[#111111]" />
                <span>Key Takeaway & Example</span>
              </div>
              <div className="text-[#3F3F3F] leading-relaxed space-y-1">
                {block.content.map((line, lIdx) => (
                  <p key={lIdx}>{renderInlineMarkdown(line)}</p>
                ))}
              </div>
            </div>
          );
        }

        if (block.type === 'header') {
          return (
            <h4 key={idx} className="font-bold text-slate-900 text-sm mt-2 border-b border-slate-200 pb-1">
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

export const LearningAIPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isInstitutionTeacher, isInstitutionAdmin } = useAuth();
  const canShare = isInstitutionTeacher || isInstitutionAdmin;
  const {
    isListening,
    micError,
    startListening,
    stopListening,
    speakingId,
    toggleSpeak,
  } = useVoiceAssistant();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello! I am your Synexora AI learning assistant powered by Groq.\n\n### 📖 Concept Definition\nAsk any doubt, concept, or problem to receive a structured concept definition, step-by-step solution, and key takeaways.\n\n### 💡 Step-by-Step Solution & Explanation\n- **Step 1:** Ask questions via text or voice microphone.\n- **Step 2:** Click "Visualize" to generate 8K conceptual diagrams.\n- **Step 3:** Click "Store to Memory" to save concepts for active recall.\n\n### 🎯 Key Takeaway & Example\nStructured learning accelerates retention and conceptual clarity!`,
      timestamp: '10:00 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savingMemoryId, setSavingMemoryId] = useState<string | null>(null);
  const [savedMemoryMap, setSavedMemoryMap] = useState<Record<string, boolean>>({});
  const [memoryNotification, setMemoryNotification] = useState<string | null>(null);

  // Flowchart states
  const [flowchartsMap, setFlowchartsMap] = useState<Record<string, TopicFlowchart>>({});
  const [visualizingId, setVisualizingId] = useState<string | null>(null);
  const [selectedZoomFlowchart, setSelectedZoomFlowchart] = useState<TopicFlowchart | null>(null);
  const [isQuickVisualizeModalOpen, setIsQuickVisualizeModalOpen] = useState(false);
  const [quickTopicInput, setQuickTopicInput] = useState('');
  const [isQuickVisualizing, setIsQuickVisualizing] = useState(false);

  // Classroom Share State
  const [shareModalData, setShareModalData] = useState<{
    isOpen: boolean;
    contentType: 'video' | 'flowchart' | 'chat';
    contentData: ShareContentData;
  }>({
    isOpen: false,
    contentType: 'chat',
    contentData: { title: '', topic: '' },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userPrompt = inputText.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    setErrorMessage(null);

    try {
      const res = await API.post('/ai/chat', {
        prompt: userPrompt,
        history: messages,
        learningStyle: user?.preferences?.learningStyle || 'socratic',
        subject: user?.major,
      });

      if (res.data.success && res.data.reply) {
        const aiReply: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: res.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiReply]);
      } else {
        throw new Error(res.data.message || 'No reply received');
      }
    } catch (err: any) {
      console.error('AI chat error:', err);
      const errMsg = err.response?.data?.message || 'Failed to reach AI tutor. Please check backend connection.';
      setErrorMessage(errMsg);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `[Error: ${errMsg}]`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const getTopicForMessage = (msgIndex: number, aiMsg: Message): string => {
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') {
        return messages[i].text.slice(0, 100);
      }
    }
    const firstLine = aiMsg.text.split('\n')[0].replace(/[#*`_📖💡🎯]/g, '').slice(0, 80);
    return firstLine.trim() || 'Academic Concept';
  };

  const handleVisualizeMessage = async (msgIndex: number, aiMsg: Message) => {
    // If already generated, open the flowchart zoom modal
    if (flowchartsMap[aiMsg.id]) {
      setSelectedZoomFlowchart(flowchartsMap[aiMsg.id]);
      return;
    }

    const topic = getTopicForMessage(msgIndex, aiMsg);
    setVisualizingId(aiMsg.id);
    setErrorMessage(null);

    try {
      const res = await API.post('/ai/visualize', {
        topic,
        context: aiMsg.text.slice(0, 400),
      });

      if (res.data.success && res.data.steps) {
        const flowchartObj: TopicFlowchart = {
          topic: res.data.topic || topic,
          flowchartTitle: res.data.flowchartTitle || `${topic} Process Flowchart`,
          flowchartSummary: res.data.flowchartSummary || `Interactive workflow and logic sequence for ${topic}.`,
          category: res.data.category || 'general',
          steps: res.data.steps || [],
          connections: res.data.connections || [],
          keyTakeaways: res.data.keyTakeaways || [],
        };

        setFlowchartsMap((prev) => ({
          ...prev,
          [aiMsg.id]: flowchartObj,
        }));
      } else {
        throw new Error(res.data.message || 'Failed to generate flowchart.');
      }
    } catch (err: any) {
      console.error('Flowchart visualize error:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to generate concept flowchart.');
    } finally {
      setVisualizingId(null);
    }
  };

  const handleQuickVisualize = async (e?: React.FormEvent, customTopic?: string) => {
    if (e) e.preventDefault();
    const topic = (customTopic || quickTopicInput).trim();
    if (!topic || isQuickVisualizing) return;

    setIsQuickVisualizing(true);
    setErrorMessage(null);

    try {
      const res = await API.post('/ai/visualize', {
        topic,
      });

      if (res.data.success && res.data.steps) {
        const flowchartObj: TopicFlowchart = {
          topic: res.data.topic || topic,
          flowchartTitle: res.data.flowchartTitle || `${topic} Process Flowchart`,
          flowchartSummary: res.data.flowchartSummary || `Interactive workflow and logic sequence for ${topic}.`,
          category: res.data.category || 'general',
          steps: res.data.steps || [],
          connections: res.data.connections || [],
          keyTakeaways: res.data.keyTakeaways || [],
        };

        const aiVisualMsg: Message = {
          id: Date.now().toString(),
          sender: 'ai',
          text: `### 📖 Concept Definition\nInteractive Process Flowchart for **${topic}**.\n\n### 💡 Step-by-Step Solution & Explanation\n${res.data.flowchartSummary || 'Interactive step-by-step logic flowchart generated.'}\n\n### 🎯 Key Takeaway & Example\nExplore the interactive steps, decisions, and sequential transitions below!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiVisualMsg]);
        setFlowchartsMap((prev) => ({ ...prev, [aiVisualMsg.id]: flowchartObj }));
        setIsQuickVisualizeModalOpen(false);
        setQuickTopicInput('');
      } else {
        throw new Error(res.data.message || 'Failed to generate flowchart.');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to generate topic flowchart.');
    } finally {
      setIsQuickVisualizing(false);
    }
  };

  const handleStoreToMemory = async (msgIndex: number, aiMsg: Message) => {
    const topic = getTopicForMessage(msgIndex, aiMsg);
    const flowchart = flowchartsMap[aiMsg.id] || null;
    setSavingMemoryId(aiMsg.id);
    try {
      const res = await API.post('/memory', {
        concept: topic,
        definition: aiMsg.text,
        course: user?.major || 'General Studies',
        source: 'learning-ai',
        flowchart,
      });

      if (res.data.success) {
        setSavedMemoryMap((prev) => ({ ...prev, [aiMsg.id]: true }));
        setMemoryNotification(`Stored "${topic.slice(0, 40)}..." in Knowledge Memory!`);
        setTimeout(() => setMemoryNotification(null), 3500);
      }
    } catch (err: any) {
      console.error('Store to memory error:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to store concept in memory.');
    } finally {
      setSavingMemoryId(null);
    }
  };

  const handleStoreFlowchartDirect = async (flowchart: TopicFlowchart, msgId?: string) => {
    try {
      const res = await API.post('/memory', {
        concept: flowchart.flowchartTitle || flowchart.topic,
        definition: `### 📖 Concept Definition\n${flowchart.flowchartSummary}\n\n### 💡 Step-by-Step Flowchart Sequence\n` +
          flowchart.steps.map((s) => `- **Step ${s.step} [${s.type.toUpperCase()}]:** ${s.title} — ${s.description}${s.details ? ` (${s.details})` : ''}`).join('\n') +
          (flowchart.keyTakeaways ? `\n\n### 🎯 Key Takeaways\n` + flowchart.keyTakeaways.map((k) => `- ${k}`).join('\n') : ''),
        course: user?.major || 'General Studies',
        source: 'learning-ai',
        flowchart,
      });

      if (res.data.success) {
        if (msgId) {
          setSavedMemoryMap((prev) => ({ ...prev, [msgId]: true }));
        }
        setMemoryNotification(`Stored "${flowchart.topic}" flowchart in Knowledge Memory!`);
        setTimeout(() => setMemoryNotification(null), 3500);
      }
    } catch (err: any) {
      console.error('Store flowchart error:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to store flowchart in memory.');
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: '1',
        sender: 'ai',
        text: `Conversation cleared.\n\n### 📖 Concept Definition\nReady for your next question or concept doubt.\n\n### 💡 Step-by-Step Solution & Explanation\nType any academic doubt, formula, or problem below to receive an aligned, structured breakdown.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const suggestedTopics = [
    'Photosynthesis Light Cycle',
    'Binary Search Tree',
    'DNA Double Helix Structure',
    'Neural Network Architecture',
    'Solar System Orbital Mechanics',
    'Mitochondria ATP Synthesis',
  ];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] p-5 rounded-3xl border border-[#E8E1D2] shadow-sm">
          <div>
            <h1 className="text-xl font-extrabold text-[#111111] flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#111111] text-[#F4C542] flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <span>Synexora AI Learning Assistant</span>
              <span className="text-[10px] font-mono font-bold bg-[#FFF8E8] text-[#111111] px-2.5 py-0.5 rounded-full border border-[#E8E1D2]">
                Groq • Gemini
              </span>
            </h1>
            <p className="text-xs text-[#777777] mt-0.5">
              Interactive aligned concept definitions, step-by-step solutions, voice playback & AI concept flowcharts
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate('/concept-video')}
              className="btn-secondary text-xs flex items-center gap-1.5 font-bold"
              title="Generate AI Concept Video with Narration"
            >
              <Film className="w-3.5 h-3.5 text-[#111111]" />
              <span>AI Video</span>
            </button>

            <button
              onClick={() => setIsQuickVisualizeModalOpen(true)}
              className="btn-secondary text-xs flex items-center gap-1.5 font-bold"
              title="Generate Concept Flowchart"
            >
              <GitFork className="w-3.5 h-3.5 text-[#111111]" />
              <span>Concept Flowchart</span>
            </button>

            <button
              onClick={handleClear}
              className="btn-secondary text-xs flex items-center gap-1.5 font-bold"
              title="Clear Chat"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#777777]" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {memoryNotification && (
          <div className="p-3.5 rounded-2xl bg-[#FFF8E8] border border-[#F4C542] text-[#111111] text-xs flex items-center gap-2 animate-fade-in font-bold">
            <Brain className="w-4 h-4 text-[#111111] shrink-0" />
            <span>{memoryNotification}</span>
          </div>
        )}

        {/* Chat Box */}
        <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl h-[600px] flex flex-col justify-between shadow-sm overflow-hidden">
          {/* Messages list */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {messages.map((msg, idx) => {
              const flowchart = flowchartsMap[msg.id];
              const isVisualizing = visualizingId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    msg.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-[#111111] text-[#FFFFFF]'
                        : 'bg-[#111111] text-[#F4C542]'
                    }`}
                  >
                    {msg.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div
                    className={`max-w-2xl w-full p-4 rounded-3xl text-sm ${
                      msg.sender === 'user'
                        ? 'bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2] max-w-lg ml-auto'
                        : 'bg-[#FFFDF7] text-[#111111] border border-[#E8E1D2]'
                    }`}
                  >
                    {msg.sender === 'ai' ? (
                      <FormattedAIMessage text={msg.text} />
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed font-semibold">{msg.text}</p>
                    )}

                    {/* Inline Concept Flowchart */}
                    {flowchart && (
                      <FlowchartVisualizerCard
                        flowchart={flowchart}
                        onEnlarge={(fc) => setSelectedZoomFlowchart(fc)}
                        onStoreToMemory={(fc) => handleStoreFlowchartDirect(fc, msg.id)}
                        onPostToClassroom={
                          canShare
                            ? (fc) => {
                                setShareModalData({
                                  isOpen: true,
                                  contentType: 'flowchart',
                                  contentData: {
                                    title: fc.flowchartTitle,
                                    topic: fc.topic,
                                    summary: fc.flowchartSummary,
                                    flowchartData: fc,
                                  },
                                });
                              }
                            : undefined
                        }
                        isStoredInMemory={!!savedMemoryMap[msg.id]}
                      />
                    )}

                    {/* Flowchart Loading State */}
                    {isVisualizing && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-[#FFF8E8] border border-[#F4C542] text-[#111111] text-xs flex items-center gap-2.5">
                        <Loader2 className="w-4 h-4 animate-spin text-[#111111] shrink-0" />
                        <div>
                          <p className="font-bold">Generating Interactive Concept Flowchart...</p>
                          <p className="text-[11px] text-[#777777]">Structuring sequential steps, decisions, and outcomes...</p>
                        </div>
                      </div>
                    )}

                    {/* Actions Bar */}
                    <div className="mt-3 pt-2.5 border-t border-[#E8E1D2] flex items-center justify-between text-xs flex-wrap gap-2">
                      <span className="text-[10px] text-[#777777] font-medium">{msg.timestamp}</span>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Audio Narration button for AI responses */}
                        {msg.sender === 'ai' && (
                          <button
                            type="button"
                            onClick={() => toggleSpeak(msg.text, msg.id)}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 transition-colors ${
                              speakingId === msg.id
                                ? 'bg-[#FFF8E8] text-[#111111] border-[#F4C542] animate-pulse'
                                : 'bg-[#FFFFFF] text-[#3F3F3F] border-[#E8E1D2] hover:bg-[#FFF8E8] hover:text-[#111111]'
                            }`}
                            title={speakingId === msg.id ? 'Stop listening' : 'Listen to audio response'}
                          >
                            {speakingId === msg.id ? (
                              <>
                                <VolumeX className="w-3 h-3 text-[#111111]" />
                                <span>Stop Audio</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3 text-[#111111]" />
                                <span>Listen</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* Flowchart Button for AI responses */}
                        {msg.sender === 'ai' && (
                          <button
                            type="button"
                            onClick={() => handleVisualizeMessage(idx, msg)}
                            disabled={isVisualizing}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 transition-colors ${
                              flowchart
                                ? 'bg-[#FFF8E8] text-[#111111] border-[#F4C542]'
                                : 'bg-[#FFFFFF] text-[#3F3F3F] border-[#E8E1D2] hover:bg-[#FFF8E8] hover:text-[#111111]'
                            }`}
                            title="Generate a step-by-step logic flowchart for this concept"
                          >
                            {isVisualizing ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-[#111111]" />
                                <span>Generating...</span>
                              </>
                            ) : (
                              <>
                                <GitFork className="w-3 h-3 text-[#111111]" />
                                <span>{flowchart ? 'View Flowchart' : 'Flowchart'}</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* AI Video Button for AI responses */}
                        {msg.sender === 'ai' && (
                          <button
                            type="button"
                            onClick={() => {
                              const topic = getTopicForMessage(idx, msg);
                              navigate(`/concept-video?topic=${encodeURIComponent(topic)}`);
                            }}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 transition-colors bg-[#FFFFFF] text-[#3F3F3F] border-[#E8E1D2] hover:bg-[#FFF8E8] hover:text-[#111111]"
                            title="Generate an AI-powered concept video with voice narration for this topic"
                          >
                            <Film className="w-3 h-3 text-[#111111]" />
                            <span>AI Video</span>
                          </button>
                        )}

                        {/* Store to Memory button for AI responses */}
                        {msg.sender === 'ai' && msg.id !== '1' && (
                          <button
                            type="button"
                            onClick={() => handleStoreToMemory(idx, msg)}
                            disabled={savingMemoryId === msg.id || savedMemoryMap[msg.id]}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 transition-colors ${
                              savedMemoryMap[msg.id]
                                ? 'bg-[#FFF8E8] text-[#111111] border-[#F4C542] cursor-default'
                                : 'bg-[#FFFFFF] text-[#3F3F3F] border-[#E8E1D2] hover:bg-[#FFF8E8] hover:text-[#111111]'
                            }`}
                          >
                            {savingMemoryId === msg.id ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-[#111111]" />
                                <span>Saving...</span>
                              </>
                            ) : savedMemoryMap[msg.id] ? (
                              <>
                                <Check className="w-3 h-3 text-[#10B981]" />
                                <span>Stored in Memory</span>
                              </>
                            ) : (
                              <>
                                <Brain className="w-3 h-3 text-[#111111]" />
                                <span>Store to Memory</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* Post to Classroom button for Teachers */}
                        {canShare && msg.sender === 'ai' && msg.id !== '1' && (
                          <button
                            type="button"
                            onClick={() => {
                              const topic = getTopicForMessage(idx, msg);
                              setShareModalData({
                                isOpen: true,
                                contentType: 'chat',
                                contentData: {
                                  title: `AI Lesson: ${topic}`,
                                  topic,
                                  textContent: msg.text,
                                  summary: msg.text.slice(0, 250),
                                },
                              });
                            }}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 transition-colors bg-[#FFF8E8] text-[#111111] border-[#F4C542] hover:bg-[#F4C542] shadow-xs"
                            title="Post this AI explanation to your classroom stream or materials"
                          >
                            <GraduationCap className="w-3 h-3 text-[#111111]" />
                            <span>Post to Class</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-[#777777] italic p-2">
                <Sparkles className="w-3.5 h-3.5 text-[#F4C542] animate-spin" />
                <span>Synexora AI is reasoning...</span>
              </div>
            )}
          </div>

          {micError && (
            <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>{micError}</span>
            </div>
          )}

          {/* Prompt input */}
          <form onSubmit={handleSendMessage} className="p-3.5 border-t border-[#E8E1D2] flex gap-2 bg-[#FFFDF7]">
            <button
              type="button"
              onClick={() => {
                if (isListening) {
                  stopListening();
                } else {
                  startListening((text) => setInputText(text));
                }
              }}
              className={`p-2.5 rounded-full border transition-all flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-rose-50 text-rose-600 border-rose-300 animate-pulse ring-2 ring-rose-400/40'
                  : 'bg-[#FFFFFF] text-[#3F3F3F] border-[#E8E1D2] hover:bg-[#FFF8E8] hover:text-[#111111]'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Speak question with microphone'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? 'Listening to your voice...' : 'Ask any concept doubt, formula question, or study topic...'}
              disabled={isTyping}
              className="input-clean flex-1 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="btn-primary px-5 gap-1.5 disabled:opacity-50 text-xs font-bold"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* MODAL: FULLSCREEN FLOWCHART THEATER */}
        {selectedZoomFlowchart && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-5 animate-in fade-in duration-150">
            <div className="bg-slate-900 text-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[92vh]">
              {/* Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <GitFork className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h3 className="text-sm font-bold text-white truncate">
                      {selectedZoomFlowchart.flowchartTitle}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Category: {selectedZoomFlowchart.category?.toUpperCase() || 'CONCEPT FLOWCHART'} • Fullscreen View
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedZoomFlowchart(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1 p-4 bg-slate-950">
                <FlowchartVisualizerCard
                  flowchart={selectedZoomFlowchart}
                  onPostToClassroom={
                    canShare
                      ? (fc) => {
                          setShareModalData({
                            isOpen: true,
                            contentType: 'flowchart',
                            contentData: {
                              title: fc.flowchartTitle,
                              topic: fc.topic,
                              summary: fc.flowchartSummary,
                              flowchartData: fc,
                            },
                          });
                        }
                      : undefined
                  }
                />
              </div>

              {/* Footer */}
              <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
                <span className="text-[11px] text-slate-400 font-mono">
                  Engine: Synexora AI Process & Flowchart Modeler
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedZoomFlowchart(null)}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: QUICK FLOWCHART GENERATOR */}
        {isQuickVisualizeModalOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <GitFork className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Map Any Concept Flowchart</h3>
                    <p className="text-[10px] text-slate-500">Step-by-step logic, condition branches & execution paths</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsQuickVisualizeModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleQuickVisualize} className="space-y-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Concept or Algorithm to Map</label>
                  <input
                    type="text"
                    required
                    value={quickTopicInput}
                    onChange={(e) => setQuickTopicInput(e.target.value)}
                    placeholder="e.g. Binary Search, DNA Replication, Photosynthesis, OAuth2 Flow..."
                    className="input-clean"
                  />
                </div>

                <div>
                  <span className="font-bold text-slate-600 block mb-1.5 text-[11px]">Suggested Topics:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedTopics.map((top, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setQuickTopicInput(top)}
                        className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-[11px] text-slate-600 border border-slate-200/80 transition-colors"
                      >
                        {top}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsQuickVisualizeModalOpen(false)}
                    className="btn-secondary py-2 px-4 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isQuickVisualizing || !quickTopicInput.trim()}
                    className="btn-primary py-2 px-5 font-semibold bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5"
                  >
                    {isQuickVisualizing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <GitFork className="w-3.5 h-3.5" />
                        <span>Generate Flowchart</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Share to Classroom Modal for Teachers */}
        {canShare && (
          <ShareToClassroomModal
            isOpen={shareModalData.isOpen}
            onClose={() => setShareModalData((prev) => ({ ...prev, isOpen: false }))}
            contentType={shareModalData.contentType}
            contentData={shareModalData.contentData}
            onSuccess={(msg) => {
              setMemoryNotification(msg);
              setTimeout(() => setMemoryNotification(null), 4000);
            }}
          />
        )}
      </div>
    </AppLayout>
  );
};
