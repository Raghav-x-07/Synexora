import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Film,
  FileText,
  GitFork,
  HelpCircle,
  X,
  Send,
  Loader2,
  Copy,
  Check,
  Download,
  GraduationCap,
  Volume2,
  VolumeX,
  Lightbulb,
} from 'lucide-react';
import API, { resolveMediaUrl } from '../lib/api';

export type AIAssistantMode = 'materials' | 'video' | 'document' | 'flowchart' | 'doubt';

interface ClassworkRef {
  _id: string;
  title: string;
  description?: string;
  topic?: string;
  attachments?: Array<{ title: string; url: string }>;
}

interface ClassroomAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroomId?: string;
  classroomTitle: string;
  classroomSubject: string;
  classworkList?: ClassworkRef[];
  initialMode?: AIAssistantMode;
  initialTopic?: string;
  initialDescription?: string;
  initialClassworkId?: string;
}

export const ClassroomAIAssistantModal: React.FC<ClassroomAIAssistantModalProps> = ({
  isOpen,
  onClose,
  classroomTitle,
  classroomSubject,
  classworkList = [],
  initialMode = 'materials',
  initialTopic = '',
  initialDescription = '',
  initialClassworkId = '',
}) => {
  const [activeMode, setActiveMode] = useState<AIAssistantMode>(initialMode);
  const [topic, setTopic] = useState(initialTopic);
  const [userQuestion, setUserQuestion] = useState('');
  const [selectedClassworkId, setSelectedClassworkId] = useState(initialClassworkId);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [materialsFocus, setMaterialsFocus] = useState<'full' | 'cheatsheet' | 'exam'>('full');

  // Loading & Generation States
  const [isLoading, setIsLoading] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Results State
  const [materialsResult, setMaterialsResult] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<{
    videoUrl?: string;
    explanation?: string;
    lesson?: any;
    duration?: number;
  } | null>(null);
  const [docQaResult, setDocQaResult] = useState<string | null>(null);
  const [flowchartResult, setFlowchartResult] = useState<{
    flowchartTitle?: string;
    flowchartSummary?: string;
    steps?: Array<{ step: number; title: string; description: string; type: string; badge?: string }>;
  } | null>(null);
  const [doubtResult, setDoubtResult] = useState<string | null>(null);

  // UI helpers
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Sync initial props when opened
  useEffect(() => {
    if (isOpen) {
      if (initialMode) setActiveMode(initialMode);
      if (initialTopic) setTopic(initialTopic);
      if (initialClassworkId) setSelectedClassworkId(initialClassworkId);
      if (initialDescription && !userQuestion) {
        setUserQuestion(initialDescription);
      }
    }
  }, [isOpen, initialMode, initialTopic, initialClassworkId, initialDescription]);

  // Suggested Topics based on classroom subject
  const getSubjectSuggestions = () => {
    const sub = (classroomSubject || '').toLowerCase();
    if (sub.includes('computer') || sub.includes('software') || sub.includes('cloud') || sub.includes('distributed')) {
      return ['Raft Consensus Algorithm', 'CAP Theorem', 'MapReduce Processing', 'Database Sharding & Partitioning', 'Two-Phase Commit Protocol', 'Microservices vs Monolith'];
    }
    if (sub.includes('data') || sub.includes('ai') || sub.includes('machine learning')) {
      return ['Gradient Descent Optimization', 'Transformer Attention Mechanism', 'Backpropagation Mechanics', 'K-Means Clustering Flow', 'Overfitting vs Regularization'];
    }
    if (sub.includes('math') || sub.includes('calculus') || sub.includes('linear')) {
      return ['Eigenvalues & Eigenvectors', 'Taylor Series Approximations', 'Matrix Decomposition (SVD)', 'Gradient Vectors & Jacobians'];
    }
    if (sub.includes('physics') || sub.includes('mechanics')) {
      return ['Newton\'s Laws of Motion', 'Thermodynamic Cycles & Entropy', 'Quantum Superposition', 'Electromagnetic Induction'];
    }
    if (sub.includes('biology') || sub.includes('bio')) {
      return ['CRISPR-Cas9 Gene Editing', 'Cellular Respiration ATP Cycle', 'DNA Replication Mechanism', 'Photosynthesis Light Reactions'];
    }
    return [
      `Core Principles of ${classroomSubject}`,
      `Exam Review & Key Formulas for ${classroomSubject}`,
      `Practical Problem Walkthrough in ${classroomSubject}`,
      `Fundamental Definitions in ${classroomSubject}`,
    ];
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/[*#`_>-]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // 1. GENERATE STUDY MATERIALS
  const handleGenerateMaterials = async (overrideTopic?: string) => {
    const targetTopic = (overrideTopic || topic).trim();
    if (!targetTopic) {
      setErrorMsg('Please enter or select a topic to generate study materials.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);
      setGenerationStep('Synthesizing structured curriculum notes...');

      const res = await API.post('/classrooms/ai-helper', {
        action: 'materials',
        title: `${targetTopic} (${materialsFocus === 'cheatsheet' ? 'Quick Revision Cheat Sheet' : materialsFocus === 'exam' ? 'Exam Focus Review' : 'Comprehensive Study Guide'})`,
        description: `Subject: ${classroomSubject}. Level: ${difficulty}.`,
        subject: classroomSubject,
      });

      if (res.data.success && res.data.result) {
        setMaterialsResult(res.data.result);
      } else {
        throw new Error(res.data.message || 'Could not generate materials.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to generate study materials.');
    } finally {
      setIsLoading(false);
      setGenerationStep('');
    }
  };

  // 2. GENERATE AI CONCEPT VIDEO
  const handleGenerateVideo = async (overrideTopic?: string) => {
    const targetTopic = (overrideTopic || topic).trim();
    if (!targetTopic) {
      setErrorMsg('Please enter a concept topic to generate video lesson.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);
      setGenerationStep('Designing scene storyboards & animation scripts...');

      const res = await API.post('/concept-video/generate', {
        topic: `${targetTopic} in ${classroomSubject}`,
        difficulty,
      });

      if (res.data.success) {
        setVideoResult({
          videoUrl: res.data.videoUrl,
          explanation: res.data.explanation,
          lesson: res.data.lesson,
          duration: res.data.duration_seconds,
        });
      } else {
        throw new Error(res.data.message || 'Could not generate video lesson.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to generate video lesson.');
    } finally {
      setIsLoading(false);
      setGenerationStep('');
    }
  };

  // 3. ASK ON DOCUMENTS / CLASSWORK
  const handleDocumentQA = async () => {
    const activeCw = classworkList.find((c) => c._id === selectedClassworkId);
    const targetDocContent = activeCw ? `Assignment: ${activeCw.title}\nInstructions: ${activeCw.description || ''}\nTopic: ${activeCw.topic || ''}` : topic;

    if (!targetDocContent.trim() && !userQuestion.trim()) {
      setErrorMsg('Please select a classroom material or enter notes/questions.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);
      setGenerationStep('Analyzing coursework documents and resolving question...');

      const res = await API.post('/classrooms/ai-helper', {
        action: 'document-qa',
        title: activeCw?.title || topic || 'Classroom Material',
        description: targetDocContent,
        documentContent: targetDocContent,
        question: userQuestion.trim() || 'Provide a comprehensive breakdown, key requirements, and approach for this material.',
        subject: classroomSubject,
      });

      if (res.data.success && res.data.result) {
        setDocQaResult(res.data.result);
      } else {
        throw new Error(res.data.message || 'Could not process document question.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to analyze classroom document.');
    } finally {
      setIsLoading(false);
      setGenerationStep('');
    }
  };

  // 4. GENERATE PROCESS FLOWCHART
  const handleGenerateFlowchart = async (overrideTopic?: string) => {
    const targetTopic = (overrideTopic || topic).trim();
    if (!targetTopic) {
      setErrorMsg('Please enter a concept topic to generate flowchart.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);
      setGenerationStep('Synthesizing state transitions & decision nodes...');

      const res = await API.post('/ai/visualize', {
        topic: `${targetTopic} (${classroomSubject})`,
        context: `Course: ${classroomSubject}`,
      });

      if (res.data.success) {
        setFlowchartResult({
          flowchartTitle: res.data.flowchartTitle,
          flowchartSummary: res.data.flowchartSummary,
          steps: res.data.steps,
        });
      } else {
        throw new Error(res.data.message || 'Could not generate flowchart.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to generate concept flowchart.');
    } finally {
      setIsLoading(false);
      setGenerationStep('');
    }
  };

  // 5. SOLVE DOUBT
  const handleSolveDoubt = async () => {
    const targetQuestion = userQuestion.trim() || topic.trim();
    if (!targetQuestion) {
      setErrorMsg('Please type your doubt or question.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);
      setGenerationStep('Consulting Synexora Academic Intelligence...');

      const res = await API.post('/classrooms/ai-helper', {
        action: 'doubt',
        title: topic || 'Classroom Doubt',
        question: targetQuestion,
        subject: classroomSubject,
      });

      if (res.data.success && res.data.result) {
        setDoubtResult(res.data.result);
      } else {
        throw new Error(res.data.message || 'Could not answer doubt.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to solve doubt.');
    } finally {
      setIsLoading(false);
      setGenerationStep('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#111111]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-white border border-[#E8E1D2] rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* ============================================================== */}
        {/* MODAL HEADER                                                  */}
        {/* ============================================================== */}
        <div className="p-5 sm:px-6 bg-gradient-to-r from-[#FFF8E8] via-[#FFFDF8] to-[#FFF8E8] border-b border-[#E8E1D2] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold shadow-xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#111111] text-[#F4C542]">
                  Classroom AI Learning Studio
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#555555] border border-[#E8E1D2]">
                  {classroomSubject}
                </span>
              </div>
              <h3 className="text-base font-black text-[#111111] tracking-tight mt-0.5">
                {classroomTitle}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              if (isSpeaking && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
              }
              onClose();
            }}
            className="p-2 text-[#777777] hover:text-[#111111] hover:bg-[#FFF8E8] rounded-2xl transition-colors border border-transparent hover:border-[#E8E1D2]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* LEARNING MODE SELECTOR TABS                                    */}
        {/* ============================================================== */}
        <div className="p-3 sm:px-6 bg-[#FFF8E8]/40 border-b border-[#E8E1D2] flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => setActiveMode('materials')}
            className={`px-3.5 py-2 rounded-2xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeMode === 'materials'
                ? 'bg-[#111111] text-[#F4C542] shadow-xs'
                : 'bg-white text-[#555555] hover:text-[#111111] border border-[#E8E1D2]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Study Materials & Notes</span>
          </button>

          <button
            onClick={() => setActiveMode('video')}
            className={`px-3.5 py-2 rounded-2xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeMode === 'video'
                ? 'bg-[#111111] text-[#F4C542] shadow-xs'
                : 'bg-white text-[#555555] hover:text-[#111111] border border-[#E8E1D2]'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>AI Concept Video</span>
          </button>

          <button
            onClick={() => setActiveMode('document')}
            className={`px-3.5 py-2 rounded-2xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeMode === 'document'
                ? 'bg-[#111111] text-[#F4C542] shadow-xs'
                : 'bg-white text-[#555555] hover:text-[#111111] border border-[#E8E1D2]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Coursework & Documents</span>
          </button>

          <button
            onClick={() => setActiveMode('flowchart')}
            className={`px-3.5 py-2 rounded-2xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeMode === 'flowchart'
                ? 'bg-[#111111] text-[#F4C542] shadow-xs'
                : 'bg-white text-[#555555] hover:text-[#111111] border border-[#E8E1D2]'
            }`}
          >
            <GitFork className="w-4 h-4" />
            <span>Process Flowchart</span>
          </button>

          <button
            onClick={() => setActiveMode('doubt')}
            className={`px-3.5 py-2 rounded-2xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeMode === 'doubt'
                ? 'bg-[#111111] text-[#F4C542] shadow-xs'
                : 'bg-white text-[#555555] hover:text-[#111111] border border-[#E8E1D2]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Ask Doubt / Q&A</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* BODY & INTERACTIVE PANELS                                      */}
        {/* ============================================================== */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Syllabus Topics Recommendations */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#777777] flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-[#F4C542]" />
              <span>Recommended Topics for {classroomSubject}:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {getSubjectSuggestions().map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTopic(sug);
                    if (activeMode === 'materials') handleGenerateMaterials(sug);
                    else if (activeMode === 'video') handleGenerateVideo(sug);
                    else if (activeMode === 'flowchart') handleGenerateFlowchart(sug);
                  }}
                  className="text-[11px] font-semibold px-3 py-1 rounded-full bg-[#FFF8E8] border border-[#E8E1D2] text-[#111111] hover:bg-[#111111] hover:text-[#F4C542] transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* ============================================================== */}
          {/* TAB 1: STUDY MATERIALS & NOTES                                 */}
          {/* ============================================================== */}
          {activeMode === 'materials' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[#111111] block mb-1">
                    Concept or Topic to Learn
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Byzantine Agreement, Raft Protocol, Virtual Memory..."
                    className="input-clean text-xs font-medium w-full"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#111111] block mb-1">Study Focus</label>
                  <select
                    value={materialsFocus}
                    onChange={(e: any) => setMaterialsFocus(e.target.value)}
                    className="input-clean text-xs font-semibold w-full bg-white"
                  >
                    <option value="full">Comprehensive Guide</option>
                    <option value="cheatsheet">Fast Revision Cheat Sheet</option>
                    <option value="exam">Exam High-Yield Review</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#555555]">
                  <span>Difficulty:</span>
                  {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize transition-all ${
                        difficulty === lvl
                          ? 'bg-[#111111] text-[#F4C542]'
                          : 'bg-[#FFF8E8] text-[#555555] border border-[#E8E1D2]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleGenerateMaterials()}
                  disabled={isLoading || !topic.trim()}
                  className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{isLoading ? 'Synthesizing...' : 'Generate Study Materials'}</span>
                </button>
              </div>

              {/* Generated Materials Output Box */}
              {materialsResult && (
                <div className="mt-4 p-5 rounded-3xl bg-[#FFFDF8] border border-[#E8E1D2] shadow-sm space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D2]">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#111111]" />
                      <h4 className="text-sm font-extrabold text-[#111111]">
                        AI Study Material: {topic}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSpeak(materialsResult)}
                        className="p-1.5 rounded-xl border border-[#E8E1D2] bg-white text-[#111111] hover:bg-[#FFF8E8] text-xs font-semibold flex items-center gap-1"
                        title="Read aloud"
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-600" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                      </button>

                      <button
                        onClick={() => handleCopy(materialsResult)}
                        className="p-1.5 rounded-xl border border-[#E8E1D2] bg-white text-[#111111] hover:bg-[#FFF8E8] text-xs font-semibold flex items-center gap-1"
                        title="Copy note"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-[#222222] leading-relaxed whitespace-pre-wrap font-normal max-h-[450px] overflow-y-auto pr-2">
                    {materialsResult}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: AI CONCEPT VIDEO                                        */}
          {/* ============================================================== */}
          {activeMode === 'video' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[#111111] block mb-1">
                    Concept Video Topic
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. MapReduce Architecture, Binary Search Tree, DNA Replication..."
                    className="input-clean text-xs font-medium w-full"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#111111] block mb-1">Level</label>
                  <select
                    value={difficulty}
                    onChange={(e: any) => setDifficulty(e.target.value)}
                    className="input-clean text-xs font-semibold w-full bg-white"
                  >
                    <option value="beginner">Beginner Intuition</option>
                    <option value="intermediate">Intermediate Technical</option>
                    <option value="advanced">Advanced In-Depth</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => handleGenerateVideo()}
                  disabled={isLoading || !topic.trim()}
                  className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Film className="w-3.5 h-3.5" />}
                  <span>{isLoading ? 'Rendering Video Lesson...' : 'Generate Concept Video'}</span>
                </button>
              </div>

              {/* Video Player Box */}
              {videoResult?.videoUrl && (
                <div className="mt-4 rounded-3xl bg-[#111111] border border-[#E8E1D2] overflow-hidden shadow-lg space-y-0 animate-fade-in">
                  <div className="p-3 bg-[#1A1A1A] border-b border-white/10 flex items-center justify-between text-xs text-white">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-[#F4C542]" />
                      <span className="font-bold">AI Concept Video: {topic}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={resolveMediaUrl(videoResult.videoUrl)}
                        download={`${topic.toLowerCase().replace(/\s+/g, '-')}-lesson.mp4`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5 text-[#F4C542]" />
                        <span>Save MP4</span>
                      </a>
                    </div>
                  </div>

                  <div className="relative bg-black flex items-center justify-center">
                    <video
                      src={resolveMediaUrl(videoResult.videoUrl)}
                      controls
                      autoPlay
                      playsInline
                      className="w-full max-h-[420px] object-contain bg-black"
                    >
                      Your browser does not support video playback.
                    </video>
                  </div>

                  {videoResult.explanation && (
                    <div className="p-4 bg-[#1A1A1A] border-t border-white/10 text-xs text-slate-200 leading-relaxed">
                      <strong className="text-[#F4C542] block mb-1">Lesson Synopsis:</strong>
                      {videoResult.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: COURSEWORK & DOCUMENTS DOUBTS                           */}
          {/* ============================================================== */}
          {activeMode === 'document' && (
            <div className="space-y-4">
              {classworkList.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-[#111111] block mb-1">
                    Select Classroom Material / Assignment
                  </label>
                  <select
                    value={selectedClassworkId}
                    onChange={(e) => setSelectedClassworkId(e.target.value)}
                    className="input-clean text-xs font-semibold w-full bg-white"
                  >
                    <option value="">-- Custom Text / General Coursework --</option>
                    {classworkList.map((cw) => (
                      <option key={cw._id} value={cw._id}>
                        {cw.title} ({cw.topic || 'General'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-[#111111] block mb-1">
                  What would you like AI to explain or solve for this coursework?
                </label>
                <textarea
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder="e.g. Explain how to implement this assignment step-by-step, give me starter hints, or explain the core formulas..."
                  rows={3}
                  className="input-clean text-xs font-medium w-full resize-none"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleDocumentQA}
                  disabled={isLoading}
                  className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isLoading ? 'Analyzing Coursework...' : 'Ask AI to Explain Coursework'}</span>
                </button>
              </div>

              {docQaResult && (
                <div className="mt-4 p-5 rounded-3xl bg-[#FFFDF8] border border-[#E8E1D2] shadow-sm space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D2]">
                    <span className="text-xs font-bold text-[#111111] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#F4C542]" />
                      <span>AI Coursework Breakdown:</span>
                    </span>
                    <button
                      onClick={() => handleCopy(docQaResult)}
                      className="text-xs text-[#555555] hover:text-[#111111] font-semibold flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="text-xs text-[#222222] leading-relaxed whitespace-pre-wrap font-normal max-h-[380px] overflow-y-auto">
                    {docQaResult}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: PROCESS FLOWCHART                                       */}
          {/* ============================================================== */}
          {activeMode === 'flowchart' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#111111] block mb-1">
                  Process / Workflow Topic
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. TCP 3-Way Handshake, OAuth2 Flow, Compilation Pipeline..."
                    className="input-clean text-xs font-medium flex-1"
                  />
                  <button
                    onClick={() => handleGenerateFlowchart()}
                    disabled={isLoading || !topic.trim()}
                    className="btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GitFork className="w-3.5 h-3.5" />}
                    <span>{isLoading ? 'Mapping...' : 'Generate Flowchart'}</span>
                  </button>
                </div>
              </div>

              {flowchartResult && (
                <div className="mt-4 p-5 rounded-3xl bg-white border border-[#E8E1D2] shadow-sm space-y-4 animate-fade-in">
                  <div>
                    <h4 className="text-sm font-black text-[#111111]">
                      {flowchartResult.flowchartTitle}
                    </h4>
                    {flowchartResult.flowchartSummary && (
                      <p className="text-xs text-[#555555] mt-1 leading-relaxed">
                        {flowchartResult.flowchartSummary}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {flowchartResult.steps?.map((step, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-3.5 rounded-2xl bg-[#FFF8E8] border border-[#E8E1D2] flex items-start gap-3"
                      >
                        <div className="w-7 h-7 rounded-xl bg-[#111111] text-[#F4C542] font-mono font-black text-xs flex items-center justify-center shrink-0">
                          {step.step || sIdx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-white text-[#111111] border border-[#E8E1D2] uppercase tracking-wider">
                              {step.badge || step.type || 'STEP'}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-[#111111]">{step.title}</h5>
                          <p className="text-[11px] text-[#444444] mt-0.5 leading-snug">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: ASK DOUBT / TUTOR Q&A                                   */}
          {/* ============================================================== */}
          {activeMode === 'doubt' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#111111] block mb-1">
                  Ask Any Doubt or Question for {classroomSubject}
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="e.g. Why does Raft use randomized election timeouts instead of fixed timer? Explain with an example..."
                    rows={3}
                    className="input-clean text-xs font-medium flex-1 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSolveDoubt}
                  disabled={isLoading || !userQuestion.trim()}
                  className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isLoading ? 'Solving Doubt...' : 'Ask AI Doubt Solver'}</span>
                </button>
              </div>

              {doubtResult && (
                <div className="mt-4 p-5 rounded-3xl bg-[#FFFDF8] border border-[#E8E1D2] shadow-sm space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D2]">
                    <span className="text-xs font-bold text-[#111111] flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-[#111111]" />
                      <span>Synexora AI Tutor Answer:</span>
                    </span>
                    <button
                      onClick={() => handleCopy(doubtResult)}
                      className="text-xs text-[#555555] hover:text-[#111111] font-semibold flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="text-xs text-[#222222] leading-relaxed whitespace-pre-wrap font-normal max-h-[380px] overflow-y-auto">
                    {doubtResult}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="p-8 text-center text-[#777777] bg-[#FFF8E8] rounded-3xl border border-[#E8E1D2] flex flex-col items-center justify-center gap-2.5 animate-pulse">
              <Loader2 className="w-7 h-7 animate-spin text-[#111111]" />
              <p className="text-xs font-bold text-[#111111]">{generationStep || 'Processing AI Request...'}</p>
              <p className="text-[10px] text-[#777777]">Grounding intelligence in {classroomSubject} curriculum</p>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* FOOTER                                                         */}
        {/* ============================================================== */}
        <div className="p-4 sm:px-6 bg-[#FFF8E8] border-t border-[#E8E1D2] flex items-center justify-between text-xs shrink-0">
          <span className="text-[11px] text-[#777777] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#F4C542]" />
            <span>AI responses are tailored to your classroom syllabus & coursework</span>
          </span>

          <button
            type="button"
            onClick={() => {
              if (isSpeaking && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
              }
              onClose();
            }}
            className="btn-secondary text-xs py-1.5 px-4 font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
