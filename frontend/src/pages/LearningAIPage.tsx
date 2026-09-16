import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
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
  Image as ImageIcon,
  Download,
  Maximize2,
  RefreshCw,
  X,
  BookOpen,
  Lightbulb,
  Target,
  Copy,
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface TopicVisual {
  topic: string;
  caption: string;
  visualPrompt: string;
  imageUrl: string;
  seed: number;
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
    <div className="space-y-3 text-xs sm:text-sm text-slate-800">
      {blocks.map((block, idx) => {
        if (block.type === 'definition-card') {
          return (
            <div
              key={idx}
              className="bg-emerald-50/80 border-l-4 border-emerald-500 rounded-r-lg p-3.5 shadow-2xs space-y-1.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wide">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
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
              className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs space-y-2.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Step-by-Step Solution & Explanation</span>
              </div>
              <div className="space-y-2 text-slate-700 leading-relaxed">
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
                        className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-start gap-2.5"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <div className="flex-1">{renderInlineMarkdown(line.replace(/^[-*•]\s*/, ''))}</div>
                      </div>
                    );
                  }

                  if (line.startsWith('```')) {
                    const code = line.replace(/```[a-z]*/g, '').trim();
                    return (
                      <div key={lIdx} className="relative group my-2">
                        <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg overflow-x-auto">
                          <code>{code}</code>
                        </pre>
                        <button
                          onClick={() => handleCopy(code)}
                          className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
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
              className="bg-indigo-50/80 border-l-4 border-indigo-500 rounded-r-lg p-3.5 shadow-2xs space-y-1.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 uppercase tracking-wide">
                <Target className="w-3.5 h-3.5 text-indigo-600" />
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
  const { user } = useAuth();
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

  // Visualization states
  const [visualsMap, setVisualsMap] = useState<Record<string, TopicVisual>>({});
  const [visualizingId, setVisualizingId] = useState<string | null>(null);
  const [selectedZoomVisual, setSelectedZoomVisual] = useState<TopicVisual | null>(null);
  const [isQuickVisualizeModalOpen, setIsQuickVisualizeModalOpen] = useState(false);
  const [quickTopicInput, setQuickTopicInput] = useState('');
  const [isQuickVisualizing, setIsQuickVisualizing] = useState(false);
  const [activeVisualFilter, setActiveVisualFilter] = useState<'scientific-infographic' | '3d-render' | 'diagram'>('scientific-infographic');

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
    const topic = getTopicForMessage(msgIndex, aiMsg);
    setVisualizingId(aiMsg.id);
    setErrorMessage(null);

    try {
      const res = await API.post('/ai/visualize', {
        topic,
        context: aiMsg.text.slice(0, 300),
        style: activeVisualFilter,
      });

      if (res.data.success && res.data.imageUrl) {
        setVisualsMap((prev) => ({
          ...prev,
          [aiMsg.id]: {
            topic: res.data.topic || topic,
            caption: res.data.caption || `Visual concept illustration for ${topic}`,
            visualPrompt: res.data.visualPrompt,
            imageUrl: res.data.imageUrl,
            seed: res.data.seed,
          },
        }));
      } else {
        throw new Error(res.data.message || 'Failed to generate visual.');
      }
    } catch (err: any) {
      console.error('Visualize error:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to generate visual illustration.');
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
        style: activeVisualFilter,
      });

      if (res.data.success && res.data.imageUrl) {
        const visualObj: TopicVisual = {
          topic: res.data.topic || topic,
          caption: res.data.caption || `Visual concept illustration for ${topic}`,
          visualPrompt: res.data.visualPrompt,
          imageUrl: res.data.imageUrl,
          seed: res.data.seed,
        };

        const aiVisualMsg: Message = {
          id: Date.now().toString(),
          sender: 'ai',
          text: `### 📖 Concept Definition\nVisualization of **${topic}**.\n\n### 💡 Step-by-Step Solution & Explanation\n${res.data.caption || 'Concept rendered in 8K high-definition diagram.'}\n\n### 🎯 Key Takeaway & Example\nUse visual models to reinforce intuition for complex concepts.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiVisualMsg]);
        setVisualsMap((prev) => ({ ...prev, [aiVisualMsg.id]: visualObj }));
        setIsQuickVisualizeModalOpen(false);
        setQuickTopicInput('');
      } else {
        throw new Error(res.data.message || 'Failed to generate visualization.');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to generate topic visualization.');
    } finally {
      setIsQuickVisualizing(false);
    }
  };

  const handleDownloadImage = async (imageUrl: string, topicName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${topicName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_visualization.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(imageUrl, '_blank');
    }
  };

  const handleStoreToMemory = async (msgIndex: number, aiMsg: Message) => {
    const topic = getTopicForMessage(msgIndex, aiMsg);
    setSavingMemoryId(aiMsg.id);
    try {
      const res = await API.post('/memory', {
        concept: topic,
        definition: aiMsg.text,
        course: user?.major || 'General Studies',
        source: 'learning-ai',
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

  const handleClear = () => {
    setMessages([
      {
        id: '1',
        sender: 'ai',
        text: `Conversation cleared.\n\n### 📖 Concept Definition\nReady for your next question or concept doubt.\n\n### 💡 Step-by-Step Solution & Explanation\nType any academic doubt, formula, or problem below to receive an aligned, structured breakdown.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setVisualsMap({});
    setErrorMessage(null);
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
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Bot className="w-5 h-5 text-green-600" />
              <span>Learning AI Tutor</span>
              <span className="text-[10px] font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
                Groq Structured + Visual AI
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Interactive aligned concept definitions, step-by-step solutions, voice playback & AI topic visualizations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQuickVisualizeModalOpen(true)}
              className="btn-secondary text-xs flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
              title="Visualize Any Concept"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Visualize Concept</span>
            </button>

            <button
              onClick={handleClear}
              className="btn-secondary text-xs flex items-center gap-1.5"
              title="Clear Chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {memoryNotification && (
          <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2 animate-fade-in">
            <Brain className="w-4 h-4 text-green-600 shrink-0" />
            <span>{memoryNotification}</span>
          </div>
        )}

        {/* Chat Box */}
        <div className="bg-white border border-slate-200 rounded-lg h-[590px] flex flex-col justify-between">
          {/* Messages list */}
          <div className="p-4 overflow-y-auto space-y-4 flex-1">
            {messages.map((msg, idx) => {
              const visual = visualsMap[msg.id];
              const isVisualizing = visualizingId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    msg.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded flex items-center justify-center text-xs font-semibold shrink-0 ${
                      msg.sender === 'user'
                        ? 'bg-slate-800 text-white'
                        : 'bg-green-600 text-white'
                    }`}
                  >
                    {msg.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div
                    className={`max-w-2xl w-full p-3.5 rounded-lg text-sm ${
                      msg.sender === 'user'
                        ? 'bg-green-50 text-slate-900 border border-green-200 max-w-lg ml-auto'
                        : 'bg-slate-50/70 text-slate-800 border border-slate-200'
                    }`}
                  >
                    {msg.sender === 'ai' ? (
                      <FormattedAIMessage text={msg.text} />
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed font-medium">{msg.text}</p>
                    )}

                    {/* Inline AI Concept Visualization Card */}
                    {visual && (
                      <div className="mt-3 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs animate-in fade-in duration-200">
                        <div className="relative group overflow-hidden bg-slate-900">
                          <img
                            src={visual.imageUrl}
                            alt={visual.topic}
                            className="w-full h-48 sm:h-56 object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                            onClick={() => setSelectedZoomVisual(visual)}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedZoomVisual(visual)}
                              className="p-2 rounded-full bg-white/90 text-slate-800 hover:bg-white shadow-md transition-transform hover:scale-110"
                              title="Enlarge Image"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadImage(visual.imageUrl, visual.topic)}
                              className="p-2 rounded-full bg-white/90 text-slate-800 hover:bg-white shadow-md transition-transform hover:scale-110"
                              title="Download PNG"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50/80 border-t border-slate-100 text-xs">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5 truncate">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{visual.topic}</span>
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 shrink-0">
                              Flux AI 8K
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-normal">{visual.caption}</p>

                          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                            <button
                              type="button"
                              onClick={() => handleVisualizeMessage(idx, msg)}
                              className="text-slate-600 hover:text-emerald-700 flex items-center gap-1 font-medium transition-colors"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Regenerate Visual</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDownloadImage(visual.imageUrl, visual.topic)}
                              className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-medium"
                            >
                              <Download className="w-3 h-3" />
                              <span>Save PNG</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Visual Loading State */}
                    {isVisualizing && (
                      <div className="mt-3 p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold">Synthesizing AI Conceptual Illustration...</p>
                          <p className="text-[11px] text-emerald-700">Groq is generating educational visual prompt & 8K diagram.</p>
                        </div>
                      </div>
                    )}

                    {/* Actions Bar */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-xs flex-wrap gap-2">
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Audio Narration button for AI responses */}
                        {msg.sender === 'ai' && (
                          <button
                            type="button"
                            onClick={() => toggleSpeak(msg.text, msg.id)}
                            className={`text-[11px] font-medium px-2 py-0.5 rounded border flex items-center gap-1 transition-colors ${
                              speakingId === msg.id
                                ? 'bg-purple-100 text-purple-800 border-purple-300 animate-pulse'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-purple-50 hover:text-purple-700'
                            }`}
                            title={speakingId === msg.id ? 'Stop listening' : 'Listen to audio response'}
                          >
                            {speakingId === msg.id ? (
                              <>
                                <VolumeX className="w-3 h-3 text-purple-600" />
                                <span>Stop Audio</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3 text-purple-600" />
                                <span>Listen</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* Visualize Topic Button for AI responses */}
                        {msg.sender === 'ai' && (
                          <button
                            type="button"
                            onClick={() => handleVisualizeMessage(idx, msg)}
                            disabled={isVisualizing}
                            className={`text-[11px] font-medium px-2 py-0.5 rounded border flex items-center gap-1 transition-colors ${
                              visual
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-700'
                            }`}
                            title="Generate an AI visual illustration for this topic"
                          >
                            {isVisualizing ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                                <span>Visualizing...</span>
                              </>
                            ) : (
                              <>
                                <ImageIcon className="w-3 h-3 text-emerald-600" />
                                <span>{visual ? 'Re-Visualize' : 'Visualize'}</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* Store to Memory button for AI responses */}
                        {msg.sender === 'ai' && msg.id !== '1' && (
                          <button
                            type="button"
                            onClick={() => handleStoreToMemory(idx, msg)}
                            disabled={savingMemoryId === msg.id || savedMemoryMap[msg.id]}
                            className={`text-[11px] font-medium px-2 py-0.5 rounded border flex items-center gap-1 transition-colors ${
                              savedMemoryMap[msg.id]
                                ? 'bg-green-100 text-green-800 border-green-300 cursor-default'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-green-50 hover:border-green-400 hover:text-green-700'
                            }`}
                          >
                            {savingMemoryId === msg.id ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-green-600" />
                                <span>Saving...</span>
                              </>
                            ) : savedMemoryMap[msg.id] ? (
                              <>
                                <Check className="w-3 h-3 text-green-600" />
                                <span>Stored in Memory</span>
                              </>
                            ) : (
                              <>
                                <Brain className="w-3 h-3 text-green-600" />
                                <span>Store to Memory</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2">
                <Sparkles className="w-3.5 h-3.5 text-green-600 animate-spin" />
                <span>Groq AI is thinking...</span>
              </div>
            )}
          </div>

          {micError && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>{micError}</span>
            </div>
          )}

          {/* Prompt input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (isListening) {
                  stopListening();
                } else {
                  startListening((text) => setInputText(text));
                }
              }}
              className={`p-2 rounded-md border transition-all flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-red-50 text-red-600 border-red-300 animate-pulse ring-2 ring-red-400/40'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
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
              className="btn-primary px-4 gap-1.5 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* MODAL: ZOOM & ENLARGE VISUAL */}
        {selectedZoomVisual && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{selectedZoomVisual.topic}</h3>
                    <p className="text-[10px] text-slate-500">High-Definition 1024x1024 AI Concept Illustration</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedZoomVisual(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center bg-slate-950">
                <img
                  src={selectedZoomVisual.imageUrl}
                  alt={selectedZoomVisual.topic}
                  className="rounded-lg max-h-[55vh] object-contain shadow-lg"
                />
              </div>

              <div className="p-4 bg-white border-t border-slate-200 space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100">
                  <p className="font-semibold text-slate-900 mb-0.5">Educational Concept Breakdown:</p>
                  <p className="leading-relaxed">{selectedZoomVisual.caption}</p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Seed: {selectedZoomVisual.seed} • Model: Flux-8K
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadImage(selectedZoomVisual.imageUrl, selectedZoomVisual.topic)}
                      className="btn-primary py-2 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Illustration</span>
                    </button>
                    <button
                      onClick={() => setSelectedZoomVisual(null)}
                      className="btn-secondary py-2 px-3.5 text-xs font-semibold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: QUICK VISUALIZE CONCEPT */}
        {isQuickVisualizeModalOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Visualize Any Study Topic</h3>
                    <p className="text-[10px] text-slate-500">Generate 8K conceptual diagrams & visual art</p>
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
                  <label className="font-bold text-slate-700 block mb-1">Concept or Topic to Visualize</label>
                  <input
                    type="text"
                    required
                    value={quickTopicInput}
                    onChange={(e) => setQuickTopicInput(e.target.value)}
                    placeholder="e.g. Mitosis Phases, CPU Architecture, Photosynthesis..."
                    className="input-clean"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Visual Art Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'scientific-infographic', label: 'Infographic' },
                      { id: '3d-render', label: '3D Model' },
                      { id: 'diagram', label: 'Flow Diagram' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setActiveVisualFilter(st.id as any)}
                        className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-colors ${
                          activeVisualFilter === st.id
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-500 font-bold'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-600 block mb-1.5 text-[11px]">Suggested Academic Concepts:</span>
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
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Visualization</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
