import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../lib/api';
import {
  X,
  GraduationCap,
  Send,
  Loader2,
  Film,
  GitFork,
  Bot,
  BookOpen,
} from 'lucide-react';

export interface ShareContentData {
  title: string;
  topic: string;
  summary?: string;
  videoUrl?: string;
  flowchartData?: any;
  textContent?: string;
}

interface ShareToClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'video' | 'flowchart' | 'chat';
  contentData: ShareContentData;
  onSuccess?: (message: string) => void;
}

interface ClassroomOption {
  _id: string;
  title: string;
  section?: string;
  subject?: string;
  code: string;
}

export const ShareToClassroomModal: React.FC<ShareToClassroomModalProps> = ({
  isOpen,
  onClose,
  contentType,
  contentData,
  onSuccess,
}) => {
  const { isInstitutionTeacher, isInstitutionAdmin } = useAuth();
  const canShare = isInstitutionTeacher || isInstitutionAdmin;

  const [classrooms, setClassrooms] = useState<ClassroomOption[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [postType, setPostType] = useState<'announcement' | 'material'>('announcement');
  const [customNote, setCustomNote] = useState<string>('');
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && canShare) {
      fetchTeacherClassrooms();
    }
  }, [isOpen]);

  const fetchTeacherClassrooms = async () => {
    try {
      setIsLoadingClasses(true);
      setErrorMsg(null);
      const res = await API.get('/classrooms');
      if (res.data.success && Array.isArray(res.data.classrooms)) {
        setClassrooms(res.data.classrooms);
        if (res.data.classrooms.length > 0) {
          setSelectedClassroomId(res.data.classrooms[0]._id);
        }
      }
    } catch (err: any) {
      console.error('Fetch teacher classrooms error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to load your classrooms.');
    } finally {
      setIsLoadingClasses(false);
    }
  };

  if (!isOpen || !canShare) return null;

  const handlePostToClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassroomId) {
      setErrorMsg('Please select a target classroom.');
      return;
    }

    setIsPosting(true);
    setErrorMsg(null);

    const targetClass = classrooms.find((c) => c._id === selectedClassroomId);
    const classTitle = targetClass ? targetClass.title : 'classroom';

    try {
      if (postType === 'announcement') {
        // Build rich announcement content
        let formattedContent = '';
        const attachments: Array<{ title: string; url: string; type: 'link' | 'youtube' | 'file' }> = [];

        if (contentType === 'video') {
          formattedContent = `🎬 **AI Concept Video Lesson: ${contentData.title || contentData.topic}**\n\n${
            customNote.trim() ? `> 💬 **Instructor Note:** ${customNote.trim()}\n\n` : ''
          }**Topic:** ${contentData.topic}\n**Lesson Overview:** ${
            contentData.summary || 'Interactive AI video breakdown.'
          }`;

          if (contentData.videoUrl) {
            attachments.push({
              title: `Video: ${contentData.title || contentData.topic}`,
              url: contentData.videoUrl,
              type: 'file',
            });
          }
        } else if (contentType === 'flowchart') {
          const stepsSummary = Array.isArray(contentData.flowchartData?.steps)
            ? contentData.flowchartData.steps
                .slice(0, 5)
                .map((s: any) => `• Step ${s.step} [${s.type?.toUpperCase()}]: ${s.title}`)
                .join('\n')
            : '';

          formattedContent = `📊 **AI Process Flowchart: ${contentData.title || contentData.topic}**\n\n${
            customNote.trim() ? `> 💬 **Instructor Note:** ${customNote.trim()}\n\n` : ''
          }**Overview:** ${
            contentData.summary || contentData.flowchartData?.flowchartSummary || 'Concept process sequence.'
          }\n\n**Key Steps Preview:**\n${stepsSummary}`;

          attachments.push({
            title: `Interactive Flowchart: ${contentData.topic}`,
            url: `/learning-ai?topic=${encodeURIComponent(contentData.topic)}`,
            type: 'link',
          });
        } else {
          // AI Chat / Concept explanation
          formattedContent = `💡 **AI Learning Guide: ${contentData.title || contentData.topic}**\n\n${
            customNote.trim() ? `> 💬 **Instructor Note:** ${customNote.trim()}\n\n` : ''
          }**Topic:** ${contentData.topic}\n**Lesson Overview:** ${
            contentData.summary || 'AI-generated conceptual deep dive and lesson study notes.'
          }${contentData.textContent ? `\n\n${contentData.textContent}` : ''}`;

          attachments.push({
            title: `AI Tutor Topic: ${contentData.topic}`,
            url: `/learning-ai?topic=${encodeURIComponent(contentData.topic)}`,
            type: 'link',
          });
        }

        const res = await API.post(`/classrooms/${selectedClassroomId}/announcements`, {
          content: formattedContent,
          attachments,
        });

        if (res.data.success) {
          onSuccess?.(`Successfully posted to "${classTitle}" stream!`);
          onClose();
        }
      } else {
        // Post as Classwork Material
        const attachments: Array<{ title: string; url: string; type: 'link' | 'youtube' | 'file' }> = [];

        if (contentType === 'video' && contentData.videoUrl) {
          attachments.push({
            title: `Video: ${contentData.title || contentData.topic}`,
            url: contentData.videoUrl,
            type: 'file',
          });
        } else {
          attachments.push({
            title: `Resource: ${contentData.title || contentData.topic}`,
            url: `/learning-ai?topic=${encodeURIComponent(contentData.topic)}`,
            type: 'link',
          });
        }

        const materialDescription = `${
          customNote.trim() ? `> 💬 **Instructor Note:** ${customNote.trim()}\n\n` : ''
        }**Topic:** ${contentData.topic}\n**Lesson Overview:** ${
          contentData.summary || 'AI-generated study material.'
        }${
          contentType === 'flowchart' && Array.isArray(contentData.flowchartData?.steps)
            ? `\n\n**Key Steps Preview:**\n${contentData.flowchartData.steps
                .slice(0, 5)
                .map((s: any) => `• Step ${s.step} [${s.type?.toUpperCase()}]: ${s.title}`)
                .join('\n')}`
            : ''
        }${contentData.textContent ? `\n\n${contentData.textContent}` : ''}`;

        const res = await API.post(`/classrooms/${selectedClassroomId}/classwork`, {
          title: `[AI Resource] ${contentData.title || contentData.topic}`,
          description: materialDescription,
          type: 'material',
          topic: 'AI Generated Study Materials',
          attachments,
        });

        if (res.data.success) {
          onSuccess?.(`Successfully added study material to "${classTitle}"!`);
          onClose();
        }
      }
    } catch (err: any) {
      console.error('Post to classroom error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to post to classroom.');
    } finally {
      setIsPosting(false);
    }
  };

  const getTypeIcon = () => {
    if (contentType === 'video') return <Film className="w-4 h-4 text-[#F4C542]" />;
    if (contentType === 'flowchart') return <GitFork className="w-4 h-4 text-[#F4C542]" />;
    return <Bot className="w-4 h-4 text-[#F4C542]" />;
  };

  const getTypeName = () => {
    if (contentType === 'video') return 'AI Concept Video';
    if (contentType === 'flowchart') return 'AI Process Flowchart';
    return 'AI Lesson & Concept Breakdown';
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111111]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-4 animate-fade-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E8E1D2] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#111111] tracking-tight">
                Share to Classroom
              </h3>
              <p className="text-xs text-[#777777]">
                Post this {getTypeName()} directly to your students' class feed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#777777] hover:text-[#111111] rounded-full hover:bg-[#FFF8E8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-fade-in">
            {errorMsg}
          </div>
        )}

        {/* Content Item Summary Badge */}
        <div className="p-3.5 rounded-2xl bg-[#FFF8E8] border border-[#E8E1D2] flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold shrink-0">
            {getTypeIcon()}
          </div>
          <div className="overflow-hidden flex-1">
            <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider block">
              {getTypeName()}
            </span>
            <p className="text-xs font-extrabold text-[#111111] truncate">
              {contentData.title || contentData.topic}
            </p>
          </div>
        </div>

        {isLoadingClasses ? (
          <div className="py-8 text-center text-xs text-[#777777] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
            <span>Loading your classrooms...</span>
          </div>
        ) : classrooms.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#777777] space-y-2">
            <p>You haven't created any classrooms yet.</p>
            <p className="text-[11px] text-[#999999]">
              Create a classroom from the <strong>Classroom</strong> tab first to post announcements and assignments.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePostToClassroom} className="space-y-3.5">
            {/* Target Classroom Selection */}
            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1">
                Select Destination Classroom
              </label>
              <select
                value={selectedClassroomId}
                onChange={(e) => setSelectedClassroomId(e.target.value)}
                className="input-clean text-xs font-semibold w-full bg-white"
                required
              >
                {classrooms.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title} {c.section ? `(${c.section})` : ''} • Code: {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Post Destination Type Tabs */}
            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1">
                Post Format & Destination
              </label>
              <div className="grid grid-cols-2 gap-2 bg-[#FFF8E8] border border-[#E8E1D2] p-1.5 rounded-2xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPostType('announcement')}
                  className={`py-2 px-2.5 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 ${
                    postType === 'announcement'
                      ? 'bg-[#111111] text-white shadow-xs font-bold'
                      : 'text-[#777777] hover:text-[#111111]'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Stream Announcement</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPostType('material')}
                  className={`py-2 px-2.5 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 ${
                    postType === 'material'
                      ? 'bg-[#111111] text-white shadow-xs font-bold'
                      : 'text-[#777777] hover:text-[#111111]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Classwork Material</span>
                </button>
              </div>
            </div>

            {/* Custom Teacher Note */}
            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1">
                Instructor Note for Students (Optional)
              </label>
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="e.g. Please watch this concept video before tomorrow's lecture."
                rows={3}
                className="input-clean text-xs font-medium w-full resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-[#E8E1D2]">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary text-xs py-2 px-4 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPosting || classrooms.length === 0}
                className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                {isPosting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish to Classroom</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
