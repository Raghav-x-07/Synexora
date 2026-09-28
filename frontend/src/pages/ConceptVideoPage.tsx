import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { ShareToClassroomModal } from '../components/ShareToClassroomModal';
import API, { resolveMediaUrl } from '../lib/api';
import {
  Film,
  Play,
  Sparkles,
  Loader2,
  CheckCircle2,
  Layers,
  Brain,
  RotateCcw,
  Volume2,
  Download,
  AlertCircle,
  Clock,
  BookOpen,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';

interface Scene {
  scene: number;
  title: string;
  explanation: string;
  narration?: string;
  visual?: string;
  visual_type?: string;
  visual_elements?: string[];
  highlight_box?: string;
}

interface Lesson {
  topic: string;
  difficulty: string;
  title: string;
  summary: string;
  duration_seconds_estimate?: number;
  scenes: Scene[];
  key_takeaways?: string[];
}

interface VideoResult {
  topic: string;
  difficulty: string;
  videoUrl: string;
  explanation: string;
  lesson: Lesson;
  duration_seconds: number;
  scenes_count: number;
  generation_time_seconds: number;
  source: string;
}

export const ConceptVideoPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isInstitutionTeacher, isInstitutionAdmin } = useAuth();
  const canShare = isInstitutionTeacher || isInstitutionAdmin;

  const [topic, setTopic] = useState<string>(searchParams.get('topic') || '');
  const [difficulty, setDifficulty] = useState<string>(searchParams.get('difficulty') || 'beginner');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStage, setGenerationStage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VideoResult | null>(null);
  const [activeSceneTab, setActiveSceneTab] = useState<number>(1);
  const [memoryNotification, setMemoryNotification] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Progressive stage timer during generation
  useEffect(() => {
    let stageTimer: ReturnType<typeof setTimeout>;
    if (isGenerating) {
      setGenerationStage('Generating structured explanation...');
      stageTimer = setTimeout(() => {
        setGenerationStage('Creating educational visual scenes...');
        stageTimer = setTimeout(() => {
          setGenerationStage('Synthesizing voice narration...');
          stageTimer = setTimeout(() => {
            setGenerationStage('Assembling and rendering MP4 video...');
          }, 3500);
        }, 3500);
      }, 3000);
    }
    return () => clearTimeout(stageTimer);
  }, [isGenerating]);

  // Auto-trigger generation if topic was provided in URL query
  useEffect(() => {
    const initialTopic = searchParams.get('topic');
    if (initialTopic && !result && !isGenerating) {
      handleGenerate(initialTopic, difficulty);
    }
  }, []);

  const handleGenerate = async (targetTopic?: string, targetDifficulty?: string) => {
    const activeTopic = (targetTopic || topic).trim();
    const activeDiff = targetDifficulty || difficulty;

    if (!activeTopic) {
      setError('Please enter a topic to generate an educational video.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setResult(null);

    try {
      const res = await API.post('/concept-video/generate', {
        topic: activeTopic,
        difficulty: activeDiff,
      });

      if (res.data && res.data.success) {
        setResult(res.data);
        setActiveSceneTab(1);
      } else {
        setError(res.data?.message || 'Failed to generate concept video.');
      }
    } catch (err: any) {
      console.error('Video generation error:', err);
      setError(err.response?.data?.message || err.message || 'Video generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStoreToMemory = async () => {
    if (!result) return;
    try {
      const res = await API.post('/memory', {
        concept: `${result.topic} (AI Video Lesson)`,
        definition: `### 🎬 ${result.lesson.title || result.topic}\n**Summary:** ${result.explanation}\n\n### 📽️ Scene Breakdown:\n` +
          result.lesson.scenes.map((s) => `- **Scene ${s.scene}: ${s.title}**\n  ${s.explanation}`).join('\n') +
          (result.lesson.key_takeaways ? `\n\n### 🎯 Key Takeaways:\n` + result.lesson.key_takeaways.map((k) => `- ${k}`).join('\n') : ''),
        course: 'General Studies',
        source: 'learning-ai',
        videoUrl: result.videoUrl,
      });

      if (res.data.success) {
        setMemoryNotification(`Saved "${result.topic}" video lesson to Memory Hub!`);
        setTimeout(() => setMemoryNotification(null), 3500);
      }
    } catch (err) {
      console.error('Save memory error:', err);
    }
  };

  const sampleTopics = [
    'Binary Search',
    'Stack',
    'Recursion',
    'Photosynthesis',
    'Operating System',
    'Database Normalization',
  ];

  // Resolve video URL for backend static serving
  const getVideoSrc = (rawUrl: string) => resolveMediaUrl(rawUrl);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl p-6 sm:p-7 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-[#111111] flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold">
                  <Film className="w-5 h-5" />
                </div>
                <span>AI Concept Video Studio</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#777777] mt-1">
                Enter any topic and generate an animated pedagogical explanation video with visual scenes and voice narration.
              </p>
            </div>

            <button
              onClick={() => navigate('/learning-ai')}
              className="btn-secondary text-xs flex items-center gap-1.5 self-start sm:self-auto font-bold py-2.5 px-4"
            >
              <span>Back to Tutor Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick topic suggestion chips */}
          <div className="mt-4 pt-4 border-t border-[#E8E1D2] flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-[#777777] uppercase tracking-wider">Popular Topics:</span>
            {sampleTopics.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setTopic(item);
                  if (!isGenerating) {
                    handleGenerate(item, difficulty);
                  }
                }}
                className="text-xs bg-[#FFF8E8] hover:bg-[#F7F1E3] hover:border-[#D6CCA8] border border-[#E8E1D2] text-[#111111] px-3 py-1 rounded-full transition-colors font-semibold"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Input & Options Card */}
        <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-[#777777] uppercase tracking-wide">
                What do you want to learn?
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isGenerating) {
                      handleGenerate();
                    }
                  }}
                  placeholder="Example: Binary Search, Photosynthesis, Neural Networks..."
                  disabled={isGenerating}
                  className="input-clean font-medium text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#777777] uppercase tracking-wide">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={isGenerating}
                className="input-clean text-xs font-medium"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-[#777777] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F4C542]" />
              <span>Generates 4–6 pedagogical visual scenes with synced narration</span>
            </div>

            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !topic.trim()}
              className="btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
                  <span>Generating Video...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-[#111111] text-[#111111]" />
                  <span>Generate Video</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading Progressive State */}
        {isGenerating && (
          <div className="bg-[#FFFFFF] text-[#111111] border border-[#E8E1D2] rounded-3xl p-8 shadow-sm text-center space-y-4 animate-in fade-in duration-200">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#FFF8E8] border-t-[#F4C542] animate-spin" />
              <Film className="w-7 h-7 text-[#111111] animate-pulse" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-[#111111]">{generationStage || 'Generating your video...'}</h3>
              <p className="text-xs text-[#777777] mt-1">
                Creating tailored visual slide animations and synthesized voice explanation for <span className="text-[#111111] font-bold">"{topic}"</span>
              </p>
            </div>

            <div className="max-w-md mx-auto bg-[#F7F1E3] rounded-full h-2 overflow-hidden border border-[#E8E1D2]">
              <div className="bg-[#F4C542] h-full w-3/4 animate-pulse rounded-full" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isGenerating && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 shadow-xs">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-red-800">Video Generation Notice</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Memory Notification */}
        {memoryNotification && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <Brain className="w-4 h-4 text-emerald-600" />
            <span>{memoryNotification}</span>
          </div>
        )}

        {/* Video Result View */}
        {result && !isGenerating && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Video Player Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              {/* Player Top Bar */}
              <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-white tracking-wide">{result.lesson.title || result.topic}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {result.difficulty.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>~{result.duration_seconds}s</span>
                  </span>
                </div>
              </div>

              {/* HTML5 Native Responsive Video Player */}
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={getVideoSrc(result.videoUrl)}
                  controls
                  playsInline
                  autoPlay
                  className="w-full h-full object-contain"
                >
                  Your browser does not support HTML5 video.
                </video>
              </div>

              {/* Action Bar below Video */}
              <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <a
                    href={getVideoSrc(result.videoUrl)}
                    download={`${result.topic.toLowerCase().replace(/\s+/g, '-')}-concept-video.mp4`}
                    className="btn-secondary text-xs py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-white border-slate-700 flex items-center gap-1.5"
                    title="Download MP4 Video"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download MP4</span>
                  </a>

                  <button
                    onClick={handleStoreToMemory}
                    className="btn-secondary text-xs py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-white border-slate-700 flex items-center gap-1.5"
                    title="Store lesson to Knowledge Memory"
                  >
                    <Brain className="w-3.5 h-3.5 text-purple-400" />
                    <span>Store to Memory</span>
                  </button>

                  {canShare && (
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F4C542] hover:bg-[#E5B532] text-[#111111] flex items-center gap-1.5 transition-colors shadow-xs"
                      title="Post this AI video to your classroom stream or classwork"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-[#111111]" />
                      <span>Post to Classroom</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    setResult(null);
                    setTopic('');
                  }}
                  className="btn-secondary text-xs py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Generate Another Video</span>
                </button>
              </div>
            </div>

            {/* Video Details & Pedagogical Breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Lesson Summary</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 mt-2 leading-relaxed bg-emerald-50/60 border border-emerald-200/70 p-3.5 rounded-lg">
                  {result.explanation}
                </p>
              </div>

              {/* Scene Breakdown Tabs */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Scene-by-Scene Educational Breakdown ({result.lesson.scenes?.length || 0} Scenes)</span>
                </h3>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {result.lesson.scenes.map((sc) => (
                    <button
                      key={sc.scene}
                      onClick={() => setActiveSceneTab(sc.scene)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-semibold shrink-0 transition-colors ${
                        activeSceneTab === sc.scene
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Scene {sc.scene}: {sc.title.slice(0, 18)}...
                    </button>
                  ))}
                </div>

                {/* Active Scene Content */}
                {(() => {
                  const current = result.lesson.scenes.find((s) => s.scene === activeSceneTab) || result.lesson.scenes[0];
                  if (!current) return null;
                  return (
                    <div className="mt-3 p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          Scene {current.scene}: {current.title}
                        </h4>
                        <span className="text-[10px] font-mono font-bold bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded">
                          Visual: {current.visual_type || 'Diagram'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {current.explanation}
                      </p>

                      {current.narration && (
                        <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-lg text-xs text-purple-900 flex items-start gap-2">
                          <Volume2 className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold">Spoken Script: </span>
                            <span>"{current.narration}"</span>
                          </div>
                        </div>
                      )}

                      {current.visual_elements && current.visual_elements.length > 0 && (
                        <div>
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                            Visual Elements Displayed on Screen:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {current.visual_elements.map((elem, eIdx) => (
                              <div
                                key={eIdx}
                                className="bg-white border border-slate-200 rounded-md p-2 text-xs text-slate-700 flex items-center gap-2"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>{elem}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {current.highlight_box && (
                        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 font-semibold flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                            Key Rule
                          </span>
                          <span>{current.highlight_box}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Key Takeaways */}
              {result.lesson.key_takeaways && (
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Key Lesson Takeaways
                  </h3>
                  <div className="space-y-1.5">
                    {result.lesson.key_takeaways.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Share to Classroom Modal for Teachers */}
        {result && canShare && (
          <ShareToClassroomModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            contentType="video"
            contentData={{
              title: result.lesson.title || result.topic,
              topic: result.topic,
              summary: result.explanation,
              videoUrl: result.videoUrl,
            }}
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
