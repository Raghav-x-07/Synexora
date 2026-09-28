import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import { AppLayout } from '../components/AppLayout';
import API from '../lib/api';
import {
  FileText,
  Upload,
  Trash2,
  Search,
  Loader2,
  Bot,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCode,
  File,
  X,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Brain,
  Check,
  Youtube,
  Globe,
  Link as LinkIcon,
  ExternalLink,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Headphones,
  Play,
  FileDown,
  Lightbulb,
  Target,
  Copy,
} from 'lucide-react';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { DocumentAudioModal } from '../components/DocumentAudioModal';

interface DocItem {
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

interface RagMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: string[];
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
        <code key={index} className="font-mono text-[10px] bg-slate-200/80 text-emerald-800 px-1 py-0.5 rounded font-semibold">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

// Formatted RAG Content with Concept Definition, Solution Steps, and Takeaways
const FormattedRagContent: React.FC<{ text: string }> = ({ text }) => {
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

  if (!blocks.some((b) => b.type === 'definition-card' || b.type === 'solution-card' || b.type === 'takeaway-card')) {
    return (
      <div className="space-y-1.5 text-slate-800 text-[11px] leading-relaxed">
        {lines.map((l, idx) => {
          const t = l.trim();
          if (!t) return <div key={idx} className="h-0.5" />;
          if (t.startsWith('- ') || t.startsWith('* ') || t.startsWith('• ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="flex-1">{renderInlineMarkdown(t.replace(/^[-*•]\s*/, ''))}</div>
              </div>
            );
          }
          return <p key={idx}>{renderInlineMarkdown(t)}</p>;
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2 text-[11px] text-slate-800">
      {blocks.map((block, idx) => {
        if (block.type === 'definition-card') {
          return (
            <div
              key={idx}
              className="bg-emerald-50/80 border-l-3 border-emerald-500 rounded-r-md p-2 shadow-2xs space-y-0.5"
            >
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-900 uppercase tracking-wide">
                <BookOpen className="w-3 h-3 text-emerald-600" />
                <span>Concept Definition</span>
              </div>
              <div className="text-slate-800 leading-relaxed space-y-0.5">
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
              className="bg-white border border-slate-200 rounded-md p-2 shadow-xs space-y-1"
            >
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-0.5">
                <Lightbulb className="w-3 h-3 text-amber-500" />
                <span>Step-by-Step Solution & Explanation</span>
              </div>
              <div className="space-y-1 text-slate-700 leading-relaxed">
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
                        className="bg-slate-50 border border-slate-200/80 rounded p-1.5 flex items-start gap-1.5"
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
                        <pre className="p-2 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded overflow-x-auto">
                          <code>{code}</code>
                        </pre>
                        <button
                          onClick={() => handleCopy(code)}
                          className="absolute top-1 right-1 p-1 rounded bg-slate-800 text-slate-300 hover:text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
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
              className="bg-indigo-50/80 border-l-3 border-indigo-500 rounded-r-md p-2 shadow-2xs space-y-0.5"
            >
              <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-900 uppercase tracking-wide">
                <Target className="w-3 h-3 text-indigo-600" />
                <span>Key Takeaway & Example</span>
              </div>
              <div className="text-slate-800 leading-relaxed space-y-0.5">
                {block.content.map((line, lIdx) => (
                  <p key={lIdx}>{renderInlineMarkdown(line)}</p>
                ))}
              </div>
            </div>
          );
        }

        if (block.type === 'header') {
          return (
            <h4 key={idx} className="font-bold text-slate-900 text-xs mt-1 border-b border-slate-200 pb-0.5">
              {block.content.join(' ')}
            </h4>
          );
        }

        return (
          <div key={idx} className="space-y-0.5">
            {block.content.map((l, lIdx) => (
              <p key={lIdx}>{renderInlineMarkdown(l)}</p>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export const DocumentsPage: React.FC = () => {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Ingestion Mode: 'file', 'link', or 'text'
  const [ingestMode, setIngestMode] = useState<'file' | 'link' | 'text'>('file');

  // File Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('Computer Science');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Link / YouTube Ingestion state
  const [linkUrl, setLinkUrl] = useState('');
  const [linkCategory, setLinkCategory] = useState('Computer Science');
  const [isIndexingLink, setIsIndexingLink] = useState(false);
  const [linkMessage, setLinkMessage] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Raw Text Ingestion & Instant Audio state
  const [rawTextTitle, setRawTextTitle] = useState('');
  const [rawTextContent, setRawTextContent] = useState('');
  const [rawTextCategory, setRawTextCategory] = useState('Computer Science');
  const [isSavingRawText, setIsSavingRawText] = useState(false);
  const [rawTextMessage, setRawTextMessage] = useState<string | null>(null);
  const [rawTextError, setRawTextError] = useState<string | null>(null);

  // Document Audio Reader Modal state
  const [activeAudioDoc, setActiveAudioDoc] = useState<DocItem | null>(null);

  // RAG Chat Modal / Drawer state
  const [activeRagDoc, setActiveRagDoc] = useState<DocItem | null>(null);
  const [ragMessages, setRagMessages] = useState<RagMessage[]>([]);
  const [ragInput, setRagInput] = useState('');
  const [isQueryingRag, setIsQueryingRag] = useState(false);
  const [showSources, setShowSources] = useState<Record<string, boolean>>({});

  // Store to Memory state for RAG answers
  const [savingRagMemoryId, setSavingRagMemoryId] = useState<string | null>(null);
  const [savedRagMemoryMap, setSavedRagMemoryMap] = useState<Record<string, boolean>>({});
  const [ragMemoryNotification, setRagMemoryNotification] = useState<string | null>(null);

  // Voice input and audio output
  const {
    isListening,
    micError,
    startListening,
    stopListening,
    speakingId,
    toggleSpeak,
  } = useVoiceAssistant();

  const fetchDocs = async () => {
    try {
      setIsLoading(true);
      const res = await API.get('/documents');
      if (res.data.success && res.data.documents) {
        setDocs(res.data.documents);
      }
    } catch (err) {
      console.error('Fetch docs error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadMessage(null);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('category', uploadCategory);

    try {
      const res = await API.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setUploadMessage(res.data.message || 'Document uploaded and indexed successfully!');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchDocs();
        setTimeout(() => setUploadMessage(null), 4000);
      }
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Failed to upload and parse document.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Link / YouTube Indexing
  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) {
      setLinkError('Please enter a YouTube video URL or web link.');
      return;
    }

    setIsIndexingLink(true);
    setLinkMessage(null);
    setLinkError(null);

    try {
      const res = await API.post('/documents/link', {
        url: linkUrl.trim(),
        category: linkCategory,
      });

      if (res.data.success) {
        setLinkMessage(res.data.message || 'Link & transcript indexed successfully!');
        setLinkUrl('');
        fetchDocs();
        setTimeout(() => setLinkMessage(null), 4000);
      }
    } catch (err: any) {
      setLinkError(err.response?.data?.message || 'Failed to fetch transcript and index link.');
    } finally {
      setIsIndexingLink(false);
    }
  };

  // Handle Raw Text / Note Submission
  const handleRawTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawTextContent.trim()) {
      setRawTextError('Please enter some text or study notes.');
      return;
    }

    setIsSavingRawText(true);
    setRawTextMessage(null);
    setRawTextError(null);

    try {
      const res = await API.post('/documents/text', {
        title: rawTextTitle,
        text: rawTextContent,
        category: rawTextCategory,
      });

      if (res.data.success && res.data.document) {
        setRawTextMessage(res.data.message || 'Text note created and indexed successfully!');
        setRawTextTitle('');
        setRawTextContent('');
        await fetchDocs();
        // Automatically open the audio player for this note
        setActiveAudioDoc(res.data.document);
        setTimeout(() => setRawTextMessage(null), 4000);
      }
    } catch (err: any) {
      setRawTextError(err.response?.data?.message || 'Failed to save text document.');
    } finally {
      setIsSavingRawText(false);
    }
  };

  // Instant In-Memory Text Playback (without needing to save to DB first)
  const handleInstantTextPlayback = () => {
    if (!rawTextContent.trim()) {
      setRawTextError('Please enter some text or study notes to listen.');
      return;
    }
    setRawTextError(null);
    const title = rawTextTitle.trim() || `Pasted Text (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
    const splitParagraphs = rawTextContent
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 0)
      .map((text, idx) => ({ chunkIndex: idx, text: text.trim() }));

    const directDoc: DocItem = {
      _id: 'direct-text-' + Date.now(),
      name: title,
      category: rawTextCategory,
      size: `${(rawTextContent.length / 1024).toFixed(1)} KB`,
      fileType: 'txt',
      uploadDate: new Date().toISOString().split('T')[0],
      extractedText: rawTextContent,
      chunks: splitParagraphs.length > 0 ? splitParagraphs : [{ chunkIndex: 0, text: rawTextContent }],
    };

    setActiveAudioDoc(directDoc);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await API.delete(`/documents/${id}`);
      if (res.data.success) {
        setDocs(docs.filter((d) => d._id !== id));
        if (activeRagDoc?._id === id) {
          setActiveRagDoc(null);
        }
      }
    } catch (err) {
      console.error('Delete doc error:', err);
    }
  };

  // Download indexed document / transcript / study note as PDF
  const handleDownloadDocPdf = (docItem: DocItem) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxContentWidth = pageWidth - margin * 2;

    doc.setFillColor(16, 185, 129); // Synexora Emerald
    doc.rect(0, 0, pageWidth, 18, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SYNEXORA — STUDY DOCUMENT & MEDIA NOTES', margin, 12);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Type: ${docItem.fileType.toUpperCase()}  |  Category: ${docItem.category}  |  Date: ${new Date(
        docItem.uploadDate || Date.now()
      ).toLocaleDateString()}`,
      margin,
      24
    );

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, 27, pageWidth - margin, 27);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    const splitTitle = doc.splitTextToSize(docItem.name, maxContentWidth);
    doc.text(splitTitle, margin, 36);

    let currentY = 36 + splitTitle.length * 6 + 4;

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('INDEXED CONTENT & KNOWLEDGE BASE:', margin, currentY);
    currentY += 6;

    const fullContent =
      docItem.extractedText ||
      (docItem.chunks && docItem.chunks.map((c) => c.text).join('\n\n')) ||
      'No extracted text available.';

    const splitContent = doc.splitTextToSize(fullContent, maxContentWidth);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8.5);

    for (let i = 0; i < splitContent.length; i++) {
      if (currentY + 4.5 > pageHeight - 16) {
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(8);
        doc.text(`Page ${doc.getNumberOfPages()} — Synexora Knowledge Base`, margin, pageHeight - 9);

        doc.addPage();
        currentY = 20;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(8.5);
      }
      doc.text(splitContent[i], margin, currentY);
      currentY += 4.5;
    }

    const safeName = docItem.name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
    doc.save(`Synexora_Material_${safeName}.pdf`);
  };

  // Open RAG Assistant for a selected document or YouTube video
  const openRagAssistant = (doc: DocItem) => {
    setActiveRagDoc(doc);
    const isYt = doc.fileType === 'youtube';
    setRagMessages([
      {
        id: '1',
        sender: 'ai',
        text: isYt
          ? `YouTube video transcript for "${doc.name}" is loaded into the RAG context. Ask me to summarize the video, explain specific concepts discussed, or extract key formulas!`
          : `Document "${doc.name}" is loaded into the RAG context. Ask me anything about its contents, definitions, or summaries!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Ask RAG Question
  const handleAskRag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragInput.trim() || !activeRagDoc || isQueryingRag) return;

    const question = ragInput.trim();
    const userMsg: RagMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setRagMessages((prev) => [...prev, userMsg]);
    setRagInput('');
    setIsQueryingRag(true);

    try {
      const res = await API.post(`/documents/${activeRagDoc._id}/query`, {
        question,
      });

      if (res.data.success) {
        const aiMsg: RagMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: res.data.answer,
          sources: res.data.retrievedExcerpts || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setRagMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to query document with RAG.';
      setRagMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `[RAG Error: ${errMsg}]`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsQueryingRag(false);
    }
  };

  // Store RAG Answer to Memory
  const handleStoreRagToMemory = async (msgIndex: number, aiMsg: RagMessage) => {
    const fileName = activeRagDoc?.name || 'Document';
    let userQuestion = 'Key Summary & Analysis';

    for (let i = msgIndex - 1; i >= 0; i--) {
      if (ragMessages[i].sender === 'user') {
        userQuestion = ragMessages[i].text.slice(0, 120);
        break;
      }
    }

    // Concept title formatted with File Name & Topic
    const conceptTitle = `${fileName} — ${userQuestion}`;

    setSavingRagMemoryId(aiMsg.id);
    try {
      const res = await API.post('/memory', {
        concept: conceptTitle,
        definition: aiMsg.text,
        course: activeRagDoc?.category || fileName,
        source: 'rag',
      });

      if (res.data.success) {
        setSavedRagMemoryMap((prev) => ({ ...prev, [aiMsg.id]: true }));
        setRagMemoryNotification(`Stored "${conceptTitle.slice(0, 45)}..." in Knowledge Memory!`);
        setTimeout(() => setRagMemoryNotification(null), 3500);
      }
    } catch (err: any) {
      console.error('Store RAG to memory error:', err);
    } finally {
      setSavingRagMemoryId(null);
    }
  };

  const toggleSourceView = (id: string) => {
    setShowSources((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isYouTubeUrl = (url: string) => {
    return /(?:youtube\.com|youtu\.be)/i.test(url);
  };

  const filteredDocs = docs.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (fileType: string) => {
    if (fileType === 'youtube') return <Youtube className="w-5 h-5 text-red-600" />;
    if (fileType === 'link') return <Globe className="w-5 h-5 text-blue-600" />;
    if (fileType === 'pdf') return <FileText className="w-5 h-5 text-red-600" />;
    if (fileType === 'docx' || fileType === 'doc') return <BookOpen className="w-5 h-5 text-blue-600" />;
    if (fileType === 'md' || fileType === 'txt') return <FileCode className="w-5 h-5 text-emerald-600" />;
    return <File className="w-5 h-5 text-slate-600" />;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-[#E8E1D2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF8E8] border border-[#E8E1D2] text-[11px] font-semibold text-[#111111] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#F4C542]" />
              <span>Grounded Knowledge Base</span>
            </div>
            <h1 className="text-2xl font-black text-[#111111] tracking-tight">
              Documents & YouTube RAG Intelligence Hub
            </h1>
            <p className="text-xs text-[#777777] mt-1">
              Upload PDFs, study notes, or index YouTube video lectures to chat with AI grounded directly in the content.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-bold bg-[#FFF8E8] text-[#111111] px-3 py-1 rounded-full border border-[#E8E1D2] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F4C542]" />
              <span>RAG Engine Ready</span>
            </span>
          </div>
        </div>

        {/* Ingestion Hub Card with 3 Tabs */}
        <div className="bg-[#FFF8E8]/70 border border-[#E8E1D2] rounded-3xl p-6 shadow-sm">
          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E8E1D2] flex-wrap">
            <button
              type="button"
              onClick={() => setIngestMode('file')}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                ingestMode === 'file'
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'bg-white text-[#555555] border border-[#E8E1D2] hover:bg-[#FFFDF7] hover:text-[#111111]'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-[#F4C542]" />
              <span>Upload Document Files</span>
            </button>

            <button
              type="button"
              onClick={() => setIngestMode('link')}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                ingestMode === 'link'
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'bg-white text-[#555555] border border-[#E8E1D2] hover:bg-[#FFFDF7] hover:text-[#111111]'
              }`}
            >
              <Youtube className="w-3.5 h-3.5 text-red-500" />
              <span>Index YouTube Link / Web</span>
            </button>

            <button
              type="button"
              onClick={() => setIngestMode('text')}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                ingestMode === 'text'
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'bg-white text-[#555555] border border-[#E8E1D2] hover:bg-[#FFFDF7] hover:text-[#111111]'
              }`}
            >
              <Headphones className="w-3.5 h-3.5 text-[#F4C542]" />
              <span>Paste Text & Listen Audio</span>
            </button>
          </div>

          {/* Tab 1: File Upload Form */}
          {ingestMode === 'file' && (
            <div>
              <h2 className="text-sm font-bold text-[#111111] mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#111111]" /> Upload Course PDF, Word or Notes (RAG & Audio Reader)
              </h2>

              {uploadMessage && (
                <div className="mb-4 p-3 rounded-2xl bg-white border border-[#E8E1D2] text-[#111111] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F4C542] shrink-0" />
                  <span>{uploadMessage}</span>
                </div>
              )}

              {uploadError && (
                <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-7">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt,.md,.csv,.json"
                      onChange={handleFileChange}
                      className="block w-full text-xs text-[#555555] file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#111111] file:text-[#F4C542] hover:file:bg-[#222222] cursor-pointer"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="input-clean text-xs"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="AI & Machine Learning">AI & Machine Learning</option>
                      <option value="Biomedical">Biomedical</option>
                      <option value="Economics">Economics</option>
                      <option value="General Studies">General Studies</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={!selectedFile || isUploading}
                      className="w-full btn-primary text-xs py-2 gap-1.5 disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Parsing...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload & Index</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-[#777777]">
                  Supported formats: <strong>.pdf</strong>, <strong>.docx</strong>, <strong>.txt</strong>, <strong>.md</strong>. You can listen to full audio or query with RAG.
                </p>
              </form>
            </div>
          )}

          {/* Tab 2: YouTube / Web Link Form */}
          {ingestMode === 'link' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-600" /> Index YouTube Lecture or Web Link (RAG & Audio Reader)
                </h2>
                {isYouTubeUrl(linkUrl) && (
                  <span className="text-[10px] font-bold bg-[#FFF8E8] text-red-700 px-2.5 py-1 rounded-full border border-[#E8E1D2] flex items-center gap-1">
                    <Youtube className="w-3 h-3 text-red-600" />
                    <span>YouTube Video Detected</span>
                  </span>
                )}
              </div>

              {linkMessage && (
                <div className="mb-4 p-3 rounded-2xl bg-white border border-[#E8E1D2] text-[#111111] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F4C542] shrink-0" />
                  <span>{linkMessage}</span>
                </div>
              )}

              {linkError && (
                <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{linkError}</span>
                </div>
              )}

              <form onSubmit={handleLinkSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-7">
                    <div className="relative">
                      <LinkIcon className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999]" />
                      <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... or article URL"
                        required
                        className="input-clean text-xs pl-10"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <select
                      value={linkCategory}
                      onChange={(e) => setLinkCategory(e.target.value)}
                      className="input-clean text-xs"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="AI & Machine Learning">AI & Machine Learning</option>
                      <option value="Biomedical">Biomedical</option>
                      <option value="Economics">Economics</option>
                      <option value="General Studies">General Studies</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={!linkUrl.trim() || isIndexingLink}
                      className="w-full btn-primary text-xs py-2 gap-1.5 disabled:opacity-50"
                    >
                      {isIndexingLink ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Extracting...</span>
                        </>
                      ) : (
                        <>
                          <Youtube className="w-3.5 h-3.5" />
                          <span>Fetch & Index</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-[#777777]">
                  Synexora automatically extracts the <strong>video transcript</strong>, enabling audiobook listening and grounded Q&A.
                </p>
              </form>
            </div>
          )}

          {/* Tab 3: Raw Text / Direct Note & Audio Form */}
          {ingestMode === 'text' && (
            <div>
              <h2 className="text-sm font-bold text-[#111111] mb-3 flex items-center gap-2">
                <Headphones className="w-4 h-4 text-[#111111]" /> Paste Any Study Text & Listen Immediately
              </h2>

              {rawTextMessage && (
                <div className="mb-4 p-3 rounded-2xl bg-white border border-[#E8E1D2] text-[#111111] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F4C542] shrink-0" />
                  <span>{rawTextMessage}</span>
                </div>
              )}

              {rawTextError && (
                <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{rawTextError}</span>
                </div>
              )}

              <form onSubmit={handleRawTextSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={rawTextTitle}
                      onChange={(e) => setRawTextTitle(e.target.value)}
                      placeholder="Title (e.g. Chapter 4 Summary, Operating System Deadlocks)..."
                      className="input-clean text-xs w-full"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <select
                      value={rawTextCategory}
                      onChange={(e) => setRawTextCategory(e.target.value)}
                      className="input-clean text-xs w-full"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="AI & Machine Learning">AI & Machine Learning</option>
                      <option value="Biomedical">Biomedical</option>
                      <option value="Economics">Economics</option>
                      <option value="General Studies">General Studies</option>
                    </select>
                  </div>
                </div>

                <div>
                  <textarea
                    rows={4}
                    value={rawTextContent}
                    onChange={(e) => setRawTextContent(e.target.value)}
                    placeholder="Paste or type any article, study notes, lecture script, or textbook passage here to listen as audio..."
                    required
                    className="input-clean text-xs w-full resize-y"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-[11px] text-[#777777]">
                    Saves your text note with paragraph chunking, audio narration, and RAG grounding.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleInstantTextPlayback}
                      disabled={!rawTextContent.trim() || isSavingRawText}
                      className="btn-secondary text-xs py-2 px-3 gap-1.5"
                      title="Listen to this text immediately without saving"
                    >
                      <Play className="w-3.5 h-3.5 fill-[#111111] text-[#111111]" />
                      <span>Instant Playback</span>
                    </button>

                    <button
                      type="submit"
                      disabled={!rawTextContent.trim() || isSavingRawText}
                      className="btn-primary text-xs py-2 px-4 gap-1.5 disabled:opacity-50"
                    >
                      {isSavingRawText ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Indexing & Reading...</span>
                        </>
                      ) : (
                        <>
                          <Headphones className="w-3.5 h-3.5" />
                          <span>Save & Listen</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Main Document Grid & RAG Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Documents Table List */}
          <div className={activeRagDoc ? 'lg:col-span-6 space-y-4' : 'lg:col-span-12 space-y-4'}>
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter uploaded documents and YouTube videos..."
                  className="input-clean pl-10 text-xs"
                />
              </div>
              <span className="text-xs text-[#777777] font-semibold">{docs.length} materials indexed</span>
            </div>

            <div className="bg-white border border-[#E8E1D2] rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF8E8] border-b border-[#E8E1D2] font-bold text-[#111111] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Material / Lecture</th>
                    <th className="px-4 py-3.5 hidden sm:table-cell">Category</th>
                    <th className="px-4 py-3.5 hidden md:table-cell">Type / Size</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE0]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-[#777777]">
                        <Loader2 className="w-5 h-5 animate-spin text-[#111111] mx-auto mb-2" />
                        <span>Loading indexed materials...</span>
                      </td>
                    </tr>
                  ) : filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-[#777777]">
                        No materials indexed yet. Upload a document, paste a YouTube link, or type study notes above to listen and query.
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc) => (
                      <tr
                        key={doc._id}
                        className={`hover:bg-[#FFFDF7] transition-colors ${
                          activeRagDoc?._id === doc._id ? 'bg-[#FFF8E8]/70' : ''
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {getFileIcon(doc.fileType)}
                            <div className="truncate max-w-[220px]">
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-[#111111] truncate">{doc.name}</p>
                                {doc.url && (
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#999999] hover:text-[#111111] shrink-0"
                                    title="Open link in new tab"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                              <p className="text-[10px] text-[#777777] sm:hidden">
                                {doc.category} • {doc.size}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <span className="bg-[#FFF8E8] border border-[#E8E1D2] text-[#111111] px-2.5 py-1 rounded-full font-semibold text-[10px]">
                            {doc.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-[#555555] hidden md:table-cell">
                          {doc.fileType === 'youtube' ? (
                            <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                              YouTube
                            </span>
                          ) : (
                            doc.size
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Listen Audio Button */}
                            <button
                              onClick={() => setActiveAudioDoc(doc)}
                              className="btn-secondary text-xs py-1 px-3 gap-1.5"
                              title="Listen to this document as audio"
                            >
                              <Headphones className="w-3.5 h-3.5 text-[#111111]" />
                              <span>Listen Audio</span>
                            </button>

                            <button
                              onClick={() => openRagAssistant(doc)}
                              className="btn-primary text-xs py-1 px-3 gap-1.5"
                              title="Ask AI questions grounded in this material"
                            >
                              <Bot className="w-3.5 h-3.5" />
                              <span>Ask RAG</span>
                            </button>
                            {/* Download PDF Button */}
                            <button
                              onClick={() => handleDownloadDocPdf(doc)}
                              className="p-1.5 text-[#777777] hover:text-[#111111] hover:bg-[#FFF8E8] rounded-full transition-colors"
                              title="Download study notes / transcript as PDF"
                            >
                              <FileDown className="w-3.5 h-3.5 text-[#111111]" />
                            </button>

                            <button
                              onClick={() => handleDelete(doc._id)}
                              className="p-1.5 text-[#999999] hover:text-red-600 hover:bg-red-50 rounded-full"
                              title="Delete material"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RAG Interactive Q&A Panel */}
          {activeRagDoc && (
            <div className="lg:col-span-6 bg-white border border-[#E8E1D2] rounded-3xl flex flex-col h-[600px] shadow-sm overflow-hidden">
              {/* Panel Header */}
              <div className="p-4 border-b border-[#E8E1D2] flex items-center justify-between bg-[#FFF8E8]">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-2xl bg-[#111111] text-[#F4C542] flex items-center justify-center shrink-0">
                    {activeRagDoc.fileType === 'youtube' ? <Youtube className="w-4 h-4 text-red-400" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className="truncate">
                    <h3 className="text-xs font-bold text-[#111111] truncate">{activeRagDoc.name}</h3>
                    <p className="text-[10px] text-[#777777]">
                      {activeRagDoc.fileType === 'youtube'
                        ? 'YouTube Video Transcript Grounded Chat'
                        : 'Retrieval-Augmented Generation Grounded Chat'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveAudioDoc(activeRagDoc)}
                    className="btn-secondary text-[11px] py-1 px-2.5 gap-1"
                    title="Listen to this whole document as audio"
                  >
                    <Headphones className="w-3 h-3 text-[#111111]" />
                    <span className="hidden sm:inline">Listen Document</span>
                  </button>

                  <button
                    onClick={() => setActiveRagDoc(null)}
                    className="p-1.5 rounded-full text-[#777777] hover:text-[#111111] hover:bg-[#E8E1D2]/50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {ragMemoryNotification && (
                <div className="m-3 mb-0 p-3 rounded-2xl bg-[#FFF8E8] border border-[#E8E1D2] text-[#111111] text-xs flex items-center gap-2 animate-fade-in font-medium">
                  <Brain className="w-4 h-4 text-[#F4C542] shrink-0" />
                  <span>{ragMemoryNotification}</span>
                </div>
              )}

              {/* RAG Conversation History */}
              <div className="p-4 overflow-y-auto flex-1 space-y-4 bg-[#FFFDF7]">
                {ragMessages.map((msg, idx) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        msg.sender === 'user'
                          ? 'bg-[#111111] text-[#F4C542]'
                          : 'bg-[#F4C542] text-[#111111]'
                      }`}
                    >
                      {msg.sender === 'user' ? 'U' : 'AI'}
                    </div>

                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#111111] text-white'
                          : 'bg-white text-[#333333] border border-[#E8E1D2]'
                      }`}
                    >
                      {msg.sender === 'ai' ? (
                        <FormattedRagContent text={msg.text} />
                      ) : (
                        <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                      )}

                      {/* Expandable Document Excerpt Sources */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-[#E8E1D2]">
                          <button
                            type="button"
                            onClick={() => toggleSourceView(msg.id)}
                            className="text-[10px] font-semibold text-[#111111] hover:underline flex items-center gap-1"
                          >
                            <span>{msg.sources.length} Context Excerpts Used</span>
                            {showSources[msg.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          {showSources[msg.id] && (
                            <div className="mt-1 space-y-1.5">
                              {msg.sources.map((src: string, i: number) => (
                                <div key={i} className="p-2.5 bg-[#FFFDF7] rounded-xl border border-[#E8E1D2] text-[10px] text-[#444444] font-mono">
                                  <span className="font-bold text-[#111111] block mb-0.5">Excerpt {i + 1}:</span>
                                  {src.slice(0, 180)}...
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-2.5 pt-2 border-t border-[#E8E1D2]/60 flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[9px] text-[#777777]">{msg.timestamp}</span>

                        <div className="flex items-center gap-1.5 ml-auto">
                          {/* Audio narration button for AI responses */}
                          {msg.sender === 'ai' && (
                            <button
                              type="button"
                              onClick={() => toggleSpeak(msg.text, msg.id)}
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 transition-colors ${
                                speakingId === msg.id
                                  ? 'bg-red-50 text-red-700 border-red-300'
                                  : 'bg-[#FFF8E8] text-[#111111] border-[#E8E1D2] hover:bg-[#E8E1D2]'
                              }`}
                              title={speakingId === msg.id ? 'Stop audio' : 'Listen to answer'}
                            >
                              {speakingId === msg.id ? (
                                <>
                                  <VolumeX className="w-3 h-3 text-red-600 animate-pulse" />
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

                          {/* Store to Memory button on RAG responses */}
                          {msg.sender === 'ai' && msg.id !== '1' && (
                            <button
                              type="button"
                              onClick={() => handleStoreRagToMemory(idx, msg)}
                              disabled={savingRagMemoryId === msg.id || savedRagMemoryMap[msg.id]}
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 transition-colors ${
                                savedRagMemoryMap[msg.id]
                                  ? 'bg-[#111111] text-[#F4C542] border-[#111111] cursor-default'
                                  : 'bg-[#FFF8E8] text-[#111111] border-[#E8E1D2] hover:bg-[#F4C542]'
                              }`}
                            >
                              {savingRagMemoryId === msg.id ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin text-[#111111]" />
                                  <span>Saving...</span>
                                </>
                              ) : savedRagMemoryMap[msg.id] ? (
                                <>
                                  <Check className="w-3 h-3 text-[#F4C542]" />
                                  <span>Stored</span>
                                </>
                              ) : (
                                <>
                                  <Brain className="w-3 h-3 text-[#111111]" />
                                  <span>Store to Memory</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isQueryingRag && (
                  <div className="flex items-center gap-2 text-xs text-[#111111] italic p-2 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-[#F4C542] animate-spin" />
                    <span>Searching transcript chunks and reasoning...</span>
                  </div>
                )}
              </div>

              {micError && (
                <div className="mx-3 text-[11px] text-red-600 bg-red-50 border border-red-200 p-2 rounded-2xl">
                  {micError}
                </div>
              )}

              {/* Sample Suggestions */}
              <div className="px-3 py-2 border-t border-[#E8E1D2] bg-[#FFF8E8] flex items-center gap-2 overflow-x-auto text-[11px]">
                <button
                  type="button"
                  onClick={() =>
                    setRagInput(
                      activeRagDoc.fileType === 'youtube'
                        ? 'Summarize the key points in this video'
                        : 'Summarize the key points in this document'
                    )
                  }
                  className="px-3 py-1 rounded-full bg-white border border-[#E8E1D2] text-[#444444] hover:bg-[#F4C542] hover:text-[#111111] shrink-0 font-medium transition-colors"
                >
                  {activeRagDoc.fileType === 'youtube' ? 'Summarize Video' : 'Summarize Document'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRagInput(
                      activeRagDoc.fileType === 'youtube'
                        ? 'What core formulas, algorithms, or theories are explained?'
                        : 'What are the main formulas or algorithms described?'
                    )
                  }
                  className="px-3 py-1 rounded-full bg-white border border-[#E8E1D2] text-[#444444] hover:bg-[#F4C542] hover:text-[#111111] shrink-0 font-medium transition-colors"
                >
                  Key Formulas & Topics
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRagInput(
                      activeRagDoc.fileType === 'youtube'
                        ? 'Generate 3 practice questions based on this video lecture'
                        : 'Generate 3 practice questions based on this text'
                    )
                  }
                  className="px-3 py-1 rounded-full bg-white border border-[#E8E1D2] text-[#444444] hover:bg-[#F4C542] hover:text-[#111111] shrink-0 font-medium transition-colors"
                >
                  Practice Questions
                </button>
              </div>

              {/* RAG Query Input */}
              <form onSubmit={handleAskRag} className="p-3 border-t border-[#E8E1D2] bg-[#FFFDF7] flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isListening) {
                      stopListening();
                    } else {
                      startListening((text) => setRagInput(text));
                    }
                  }}
                  disabled={isQueryingRag}
                  className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-xs transition-colors shrink-0 ${
                    isListening
                      ? 'bg-red-500 text-white border-red-600 animate-pulse'
                      : 'bg-[#FFF8E8] text-[#111111] border-[#E8E1D2] hover:bg-[#E8E1D2]'
                  }`}
                  title={isListening ? 'Stop listening' : 'Voice input dictation'}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice'}</span>
                </button>

                <input
                  type="text"
                  value={ragInput}
                  onChange={(e) => setRagInput(e.target.value)}
                  placeholder={`Ask anything about ${activeRagDoc.name}...`}
                  disabled={isQueryingRag}
                  className="input-clean text-xs flex-1 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!ragInput.trim() || isQueryingRag}
                  className="btn-primary text-xs px-4 gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Document Audiobook & Audio Reader Modal */}
      {activeAudioDoc && (
        <DocumentAudioModal
          doc={activeAudioDoc}
          onClose={() => setActiveAudioDoc(null)}
        />
      )}
    </AppLayout>
  );
};
