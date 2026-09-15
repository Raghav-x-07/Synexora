import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import API from '../lib/api';
import {
  GraduationCap,
  Plus,
  Users,
  Copy,
  Check,
  BookOpen,
  FileText,
  MessageSquare,
  Send,
  Trash2,
  ExternalLink,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  FolderOpen,
  ArrowLeft,
  Loader2,
  Search,
  Filter,
  Paperclip,
} from 'lucide-react';

interface Attachment {
  title: string;
  url: string;
  type?: 'link' | 'file' | 'youtube' | 'drive';
}

interface Comment {
  _id?: string;
  authorId?: string;
  authorName: string;
  authorEmail?: string;
  text: string;
  createdAt: string;
}

interface Announcement {
  _id: string;
  authorId?: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  attachments?: Attachment[];
  comments: Comment[];
  createdAt: string;
}

interface Classwork {
  _id: string;
  title: string;
  description?: string;
  type: 'assignment' | 'material' | 'quiz' | 'question';
  topic: string;
  points: number;
  dueDate?: string;
  attachments?: Attachment[];
  createdAt: string;
}

interface Member {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Classroom {
  _id: string;
  title: string;
  section?: string;
  subject: string;
  room?: string;
  code: string;
  bannerTheme: 'emerald' | 'indigo' | 'rose' | 'amber' | 'cyan' | 'purple' | 'slate';
  creator: Member;
  teachers: Member[];
  students: Member[];
  announcements: Announcement[];
  classwork: Classwork[];
  updatedAt?: string;
}

interface Submission {
  _id: string;
  classroomId: string;
  classworkId: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  submissionType: 'text' | 'link' | 'file';
  content: string;
  status: 'submitted' | 'graded' | 'returned' | 'late';
  grade?: number;
  feedback?: string;
  submittedAt: string;
}

// Banner Theme Gradients
const THEME_STYLES: Record<string, { bg: string; text: string; light: string; badge: string; border: string }> = {
  emerald: {
    bg: 'from-emerald-700 via-teal-800 to-slate-900',
    text: 'text-emerald-700',
    light: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    badge: 'bg-emerald-600',
    border: 'border-emerald-500',
  },
  indigo: {
    bg: 'from-indigo-700 via-blue-800 to-slate-900',
    text: 'text-indigo-700',
    light: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    badge: 'bg-indigo-600',
    border: 'border-indigo-500',
  },
  rose: {
    bg: 'from-rose-700 via-pink-800 to-slate-900',
    text: 'text-rose-700',
    light: 'bg-rose-50 text-rose-800 border-rose-200',
    badge: 'bg-rose-600',
    border: 'border-rose-500',
  },
  amber: {
    bg: 'from-amber-600 via-orange-700 to-slate-900',
    text: 'text-amber-700',
    light: 'bg-amber-50 text-amber-800 border-amber-200',
    badge: 'bg-amber-600',
    border: 'border-amber-500',
  },
  cyan: {
    bg: 'from-cyan-700 via-teal-800 to-slate-900',
    text: 'text-cyan-700',
    light: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    badge: 'bg-cyan-600',
    border: 'border-cyan-500',
  },
  purple: {
    bg: 'from-purple-700 via-violet-800 to-slate-900',
    text: 'text-purple-700',
    light: 'bg-purple-50 text-purple-800 border-purple-200',
    badge: 'bg-purple-600',
    border: 'border-purple-500',
  },
  slate: {
    bg: 'from-slate-700 via-slate-800 to-slate-950',
    text: 'text-slate-700',
    light: 'bg-slate-50 text-slate-800 border-slate-200',
    badge: 'bg-slate-600',
    border: 'border-slate-500',
  },
};

export const ClassroomPage: React.FC = () => {
  const { user } = useAuth();
  const { id: paramClassId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClass, setSelectedClass] = useState<Classroom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stream' | 'classwork' | 'people' | 'submissions'>('stream');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isClassworkModalOpen, setIsClassworkModalOpen] = useState(false);

  // Create Classroom Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSection, setNewSection] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newTheme, setNewTheme] = useState<'emerald' | 'indigo' | 'rose' | 'amber' | 'cyan' | 'purple'>('emerald');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Join Classroom Form State
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);

  // Announcement Composer State
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementAttachmentTitle, setAnnouncementAttachmentTitle] = useState('');
  const [announcementAttachmentUrl, setAnnouncementAttachmentUrl] = useState('');
  const [showAttachmentInput, setShowAttachmentInput] = useState(false);
  const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);

  // Class Comment State per Announcement
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [isPostingComment, setIsPostingComment] = useState<Record<string, boolean>>({});

  // Classwork Filter & Creation State
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [cwTitle, setCwTitle] = useState('');
  const [cwDescription, setCwDescription] = useState('');
  const [cwType, setCwType] = useState<'assignment' | 'material' | 'quiz'>('assignment');
  const [cwTopic, setCwTopic] = useState('General');
  const [cwPoints, setCwPoints] = useState(100);
  const [cwDueDate, setCwDueDate] = useState('');
  const [cwAttachmentTitle, setCwAttachmentTitle] = useState('');
  const [cwAttachmentUrl, setCwAttachmentUrl] = useState('');
  const [isCreatingCw, setIsCreatingCw] = useState(false);
  const [cwAiGuide, setCwAiGuide] = useState<string | null>(null);
  const [isGeneratingCwAi, setIsGeneratingCwAi] = useState(false);

  // Work Submission & Turn In State
  const [activeSubmissionCw, setActiveSubmissionCw] = useState<Classwork | null>(null);
  const [submissionsList, setSubmissionsList] = useState<Submission[]>([]);
  const [isTeacherOfActiveCw, setIsTeacherOfActiveCw] = useState(false);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [mySubmissionContent, setMySubmissionContent] = useState('');
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  // Grade state (Teacher)
  const [gradingScores, setGradingScores] = useState<Record<string, number>>({});
  const [gradingFeedbacks, setGradingFeedbacks] = useState<Record<string, string>>({});
  const [isSavingGrade, setIsSavingGrade] = useState<Record<string, boolean>>({});

  // Copy code notification
  const [copiedCode, setCopiedCode] = useState(false);

  // People Search
  const [peopleSearch, setPeopleSearch] = useState('');

  // Fetch all classrooms
  const fetchClassrooms = async () => {
    try {
      setIsLoading(true);
      const res = await API.get('/classrooms');
      if (res.data.success && res.data.classrooms) {
        setClassrooms(res.data.classrooms);
        // If paramClassId is present, select it
        if (paramClassId) {
          const found = res.data.classrooms.find((c: Classroom) => c._id === paramClassId);
          if (found) setSelectedClass(found);
        }
      }
    } catch (err) {
      console.error('Fetch classrooms error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, [paramClassId]);

  // Handle single classroom select
  const handleSelectClassroom = (classroom: Classroom) => {
    setSelectedClass(classroom);
    setActiveTab('stream');
    navigate(`/classroom/${classroom._id}`);
  };

  const handleBackToAllClasses = () => {
    setSelectedClass(null);
    navigate('/classroom');
  };

  // Copy Class Code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Create Classroom Submit
  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setCreateError('Class name is required.');
      return;
    }

    try {
      setIsSubmittingCreate(true);
      setCreateError(null);
      const res = await API.post('/classrooms', {
        title: newTitle.trim(),
        section: newSection.trim(),
        subject: newSubject.trim() || 'General',
        room: newRoom.trim(),
        bannerTheme: newTheme,
      });

      if (res.data.success && res.data.classroom) {
        setClassrooms([res.data.classroom, ...classrooms]);
        setSelectedClass(res.data.classroom);
        setIsCreateModalOpen(false);
        setNewTitle('');
        setNewSection('');
        setNewSubject('');
        setNewRoom('');
        navigate(`/classroom/${res.data.classroom._id}`);
      }
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create classroom.');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Join Classroom Submit
  const handleJoinClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setJoinError('Class code is required.');
      return;
    }

    try {
      setIsSubmittingJoin(true);
      setJoinError(null);
      const res = await API.post('/classrooms/join', {
        code: joinCode.trim(),
      });

      if (res.data.success && res.data.classroom) {
        setClassrooms([res.data.classroom, ...classrooms]);
        setSelectedClass(res.data.classroom);
        setIsJoinModalOpen(false);
        setJoinCode('');
        navigate(`/classroom/${res.data.classroom._id}`);
      }
    } catch (err: any) {
      setJoinError(err.response?.data?.message || 'Failed to join classroom.');
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  // Post Announcement
  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim() || !selectedClass) return;

    try {
      setIsPostingAnnouncement(true);
      const attachments: Attachment[] = [];
      if (announcementAttachmentTitle.trim() && announcementAttachmentUrl.trim()) {
        attachments.push({
          title: announcementAttachmentTitle.trim(),
          url: announcementAttachmentUrl.trim(),
          type: 'link',
        });
      }

      const res = await API.post(`/classrooms/${selectedClass._id}/announcements`, {
        content: announcementText.trim(),
        attachments,
      });

      if (res.data.success && res.data.announcement) {
        const updatedAnnouncements = [res.data.announcement, ...selectedClass.announcements];
        const updatedClass = { ...selectedClass, announcements: updatedAnnouncements };
        setSelectedClass(updatedClass);
        setClassrooms(classrooms.map((c) => (c._id === selectedClass._id ? updatedClass : c)));

        setAnnouncementText('');
        setAnnouncementAttachmentTitle('');
        setAnnouncementAttachmentUrl('');
        setShowAttachmentInput(false);
      }
    } catch (err) {
      console.error('Post announcement error:', err);
    } finally {
      setIsPostingAnnouncement(false);
    }
  };

  // Add Comment to Announcement
  const handleAddComment = async (announcementId: string) => {
    const text = commentInputs[announcementId];
    if (!text || !text.trim() || !selectedClass) return;

    try {
      setIsPostingComment({ ...isPostingComment, [announcementId]: true });
      const res = await API.post(
        `/classrooms/${selectedClass._id}/announcements/${announcementId}/comments`,
        { text: text.trim() }
      );

      if (res.data.success && res.data.comment) {
        const updatedAnnouncements = selectedClass.announcements.map((a) => {
          if (a._id === announcementId) {
            return {
              ...a,
              comments: [...(a.comments || []), res.data.comment],
            };
          }
          return a;
        });

        const updatedClass = { ...selectedClass, announcements: updatedAnnouncements };
        setSelectedClass(updatedClass);
        setClassrooms(classrooms.map((c) => (c._id === selectedClass._id ? updatedClass : c)));
        setCommentInputs({ ...commentInputs, [announcementId]: '' });
      }
    } catch (err) {
      console.error('Add comment error:', err);
    } finally {
      setIsPostingComment({ ...isPostingComment, [announcementId]: false });
    }
  };

  // Create Classwork Item
  const handleCreateClasswork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cwTitle.trim() || !selectedClass) return;

    try {
      setIsCreatingCw(true);
      const attachments: Attachment[] = [];
      if (cwAttachmentTitle.trim() && cwAttachmentUrl.trim()) {
        attachments.push({
          title: cwAttachmentTitle.trim(),
          url: cwAttachmentUrl.trim(),
          type: 'link',
        });
      }

      const res = await API.post(`/classrooms/${selectedClass._id}/classwork`, {
        title: cwTitle.trim(),
        description: cwDescription.trim(),
        type: cwType,
        topic: cwTopic.trim() || 'General',
        points: cwPoints,
        dueDate: cwDueDate || null,
        attachments,
      });

      if (res.data.success && res.data.classwork) {
        const updatedCw = [res.data.classwork, ...(selectedClass.classwork || [])];
        const updatedClass = { ...selectedClass, classwork: updatedCw };
        setSelectedClass(updatedClass);
        setClassrooms(classrooms.map((c) => (c._id === selectedClass._id ? updatedClass : c)));

        setIsClassworkModalOpen(false);
        setCwTitle('');
        setCwDescription('');
        setCwTopic('General');
        setCwPoints(100);
        setCwDueDate('');
        setCwAttachmentTitle('');
        setCwAttachmentUrl('');
        setCwAiGuide(null);
      }
    } catch (err) {
      console.error('Create classwork error:', err);
    } finally {
      setIsCreatingCw(false);
    }
  };

  // Generate AI Rubric / Guidelines for Classwork
  const handleGenerateAiGuide = async () => {
    if (!cwTitle.trim() || !selectedClass) return;
    try {
      setIsGeneratingCwAi(true);
      const res = await API.post('/classrooms/ai-helper', {
        action: 'rubric',
        title: cwTitle.trim(),
        description: cwDescription.trim(),
        subject: selectedClass.subject || 'General',
      });
      if (res.data.success && res.data.result) {
        setCwAiGuide(res.data.result);
      }
    } catch (err) {
      console.error('AI Guide error:', err);
    } finally {
      setIsGeneratingCwAi(false);
    }
  };

  // Open Submissions / Turn In Drawer
  const handleOpenSubmissions = async (cw: Classwork) => {
    if (!selectedClass) return;
    setActiveSubmissionCw(cw);
    setSubmitMessage(null);
    setMySubmissionContent('');

    try {
      setIsLoadingSubmissions(true);
      const res = await API.get(`/classrooms/${selectedClass._id}/submissions/${cw._id}`);
      if (res.data.success) {
        setSubmissionsList(res.data.submissions || []);
        setIsTeacherOfActiveCw(res.data.isTeacher);

        // Pre-fill user submission if found
        if (!res.data.isTeacher && res.data.submissions && res.data.submissions.length > 0) {
          setMySubmissionContent(res.data.submissions[0].content);
        }
      }
    } catch (err) {
      console.error('Get submissions error:', err);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  // Submit Work (Turn In)
  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mySubmissionContent.trim() || !selectedClass || !activeSubmissionCw) return;

    try {
      setIsSubmittingWork(true);
      setSubmitMessage(null);
      const res = await API.post(
        `/classrooms/${selectedClass._id}/submissions/${activeSubmissionCw._id}`,
        {
          content: mySubmissionContent.trim(),
          submissionType: 'link',
        }
      );

      if (res.data.success && res.data.submission) {
        setSubmissionsList([res.data.submission]);
        setSubmitMessage('Assignment successfully turned in!');
      }
    } catch (err: any) {
      setSubmitMessage(err.response?.data?.message || 'Failed to submit work.');
    } finally {
      setIsSubmittingWork(false);
    }
  };

  // Unsubmit Work
  const handleUnsubmitWork = async (submissionId: string) => {
    if (!selectedClass) return;
    try {
      const res = await API.delete(`/classrooms/${selectedClass._id}/submissions/${submissionId}`);
      if (res.data.success) {
        setSubmissionsList([]);
        setMySubmissionContent('');
        setSubmitMessage('Assignment unsubmitted.');
      }
    } catch (err) {
      console.error('Unsubmit error:', err);
    }
  };

  // Teacher: Grade Submission
  const handleGradeSubmission = async (submissionId: string) => {
    if (!selectedClass) return;
    const gradeVal = gradingScores[submissionId];
    const feedbackVal = gradingFeedbacks[submissionId] || '';

    try {
      setIsSavingGrade({ ...isSavingGrade, [submissionId]: true });
      const res = await API.put(`/classrooms/${selectedClass._id}/submissions/${submissionId}/grade`, {
        grade: gradeVal,
        feedback: feedbackVal,
      });

      if (res.data.success && res.data.submission) {
        setSubmissionsList(
          submissionsList.map((s) => (s._id === submissionId ? res.data.submission : s))
        );
      }
    } catch (err) {
      console.error('Grade submission error:', err);
    } finally {
      setIsSavingGrade({ ...isSavingGrade, [submissionId]: false });
    }
  };

  // Delete / Leave Classroom
  const handleDeleteOrLeaveClass = async (classroomId: string, isCreator: boolean) => {
    const confirmMsg = isCreator
      ? 'Are you sure you want to delete this classroom? All announcements and submissions will be permanently deleted.'
      : 'Are you sure you want to leave this classroom?';

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await API.delete(`/classrooms/${classroomId}`);
      if (res.data.success) {
        setClassrooms(classrooms.filter((c) => c._id !== classroomId));
        if (selectedClass?._id === classroomId) {
          setSelectedClass(null);
          navigate('/classroom');
        }
      }
    } catch (err) {
      console.error('Delete/Leave error:', err);
    }
  };

  // Topic filter items
  const topics = ['all', ...Array.from(new Set(selectedClass?.classwork?.map((cw) => cw.topic) || []))];
  const filteredClasswork =
    selectedTopic === 'all'
      ? selectedClass?.classwork || []
      : (selectedClass?.classwork || []).filter((cw) => cw.topic === selectedTopic);

  // Check if current user is teacher/creator of selected class
  const isTeacher =
    selectedClass &&
    user &&
    (selectedClass.creator?._id === user._id ||
      selectedClass.teachers?.some((t) => t._id === user._id));

  const currentTheme = selectedClass ? THEME_STYLES[selectedClass.bannerTheme] || THEME_STYLES.emerald : THEME_STYLES.emerald;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-16">
        {/* ============================================================== */}
        {/* TOP BAR / DIRECTORY OR CLASSROOM HEADER                         */}
        {/* ============================================================== */}
        {!selectedClass ? (
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Classroom</h1>
                <p className="text-xs text-slate-500 font-medium">
                  Collaborative courses, stream discussions, assignments, and AI-assisted evaluations.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsJoinModalOpen(true)}
                className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Join Class with Code</span>
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create Class</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <button
              onClick={handleBackToAllClasses}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Classes</span>
            </button>

            {/* Google Classroom Style Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('stream')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'stream'
                    ? 'bg-white text-emerald-800 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Stream
              </button>
              <button
                onClick={() => setActiveTab('classwork')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'classwork'
                    ? 'bg-white text-emerald-800 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Classwork
              </button>
              <button
                onClick={() => setActiveTab('people')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'people'
                    ? 'bg-white text-emerald-800 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                People ({1 + (selectedClass.students?.length || 0)})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyCode(selectedClass.code)}
                className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 font-semibold shadow-xs"
                title="Copy class invite code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{selectedClass.code}</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 1: CLASSROOMS DIRECTORY (HOME GRID)                       */}
        {/* ============================================================== */}
        {!selectedClass && (
          <div>
            {isLoading ? (
              <div className="p-16 text-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
                <p className="text-sm font-medium">Loading your classrooms...</p>
              </div>
            ) : classrooms.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center max-w-lg mx-auto mt-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No Classes Joined Yet</h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  Create a new class to teach or ask your teacher for a 6-character Class Code to join an existing class.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setIsJoinModalOpen(true)}
                    className="btn-secondary text-xs py-2 px-4 font-semibold"
                  >
                    Join with Code
                  </button>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn-primary text-xs py-2 px-4 font-semibold bg-emerald-600 hover:bg-emerald-700"
                  >
                    Create New Class
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {classrooms.map((c) => {
                  const theme = THEME_STYLES[c.bannerTheme] || THEME_STYLES.emerald;
                  const isCreator = c.creator?._id === user?._id;

                  return (
                    <div
                      key={c._id}
                      onClick={() => handleSelectClassroom(c)}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5"
                    >
                      {/* Class Banner */}
                      <div className={`p-5 bg-gradient-to-br ${theme.bg} text-white relative`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 backdrop-blur-xs">
                            {c.subject || 'General'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteOrLeaveClass(c._id, isCreator);
                            }}
                            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                            title={isCreator ? 'Delete Classroom' : 'Leave Classroom'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h3 className="text-lg font-black text-white leading-tight group-hover:underline">
                          {c.title}
                        </h3>
                        {c.section && <p className="text-xs text-white/80 mt-0.5">{c.section}</p>}

                        <p className="text-[11px] text-white/70 mt-3 flex items-center gap-1.5">
                          <span>Instructor: {c.creator?.name || 'Academic Faculty'}</span>
                        </p>
                      </div>

                      {/* Class Card Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-600">
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                              <span>{c.classwork?.length || 0} Assignments</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span>{(c.students?.length || 0) + 1} Members</span>
                            </span>
                          </div>

                          {c.announcements && c.announcements.length > 0 && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                              "{c.announcements[0].content}"
                            </p>
                          )}
                        </div>

                        {/* Card Footer */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            Code: {c.code}
                          </span>
                          <span className="font-semibold text-emerald-700 flex items-center gap-1 text-[11px] group-hover:translate-x-0.5 transition-transform">
                            Open Class →
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: INSIDE CLASSROOM (STREAM / CLASSWORK / PEOPLE)          */}
        {/* ============================================================== */}
        {selectedClass && (
          <div className="space-y-6">
            {/* Class Hero Banner */}
            <div
              className={`p-6 sm:p-8 rounded-2xl bg-gradient-to-r ${currentTheme.bg} text-white shadow-lg relative overflow-hidden`}
            >
              <div className="max-w-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-white/20 backdrop-blur-xs mb-2 inline-block">
                  {selectedClass.subject} • {selectedClass.section || 'General Section'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
                  {selectedClass.title}
                </h2>
                {selectedClass.room && <p className="text-xs text-white/80 mb-2">Room / Lab: {selectedClass.room}</p>}
                <p className="text-xs text-white/90 flex items-center gap-2 mt-2">
                  <span>Instructor: <strong>{selectedClass.creator?.name || 'Faculty'}</strong> ({selectedClass.creator?.email})</span>
                </p>
              </div>

              {/* Class Code Card overlay */}
              <div className="mt-5 sm:mt-0 sm:absolute sm:right-6 sm:bottom-6 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl text-xs flex items-center gap-3 shadow-md">
                <div>
                  <span className="text-[10px] text-white/70 block uppercase font-bold">Class Code</span>
                  <span className="text-sm font-mono font-black text-white">{selectedClass.code}</span>
                </div>
                <button
                  onClick={() => handleCopyCode(selectedClass.code)}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                  title="Copy Code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* TAB 1: STREAM (Announcements & Discussions) */}
            {activeTab === 'stream' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Sidebar: Upcoming Work */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Upcoming Due</span>
                    </h4>
                    {selectedClass.classwork && selectedClass.classwork.length > 0 ? (
                      <div className="space-y-2.5">
                        {selectedClass.classwork.slice(0, 4).map((cw) => (
                          <div
                            key={cw._id}
                            onClick={() => {
                              setActiveTab('classwork');
                            }}
                            className="p-2.5 bg-slate-50 hover:bg-emerald-50/50 rounded-lg border border-slate-100 transition-colors cursor-pointer text-xs"
                          >
                            <p className="font-semibold text-slate-800 line-clamp-1">{cw.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-between">
                              <span>Due: {cw.dueDate ? new Date(cw.dueDate).toLocaleDateString() : 'No date'}</span>
                              <span className="font-bold text-emerald-700">{cw.points} pts</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Woohoo, no work due soon!</p>
                    )}
                  </div>
                </div>

                {/* Main Column: Announcement Composer & Feed */}
                <div className="lg:col-span-3 space-y-5">
                  {/* Announcement Composer */}
                  <form
                    onSubmit={handlePostAnnouncement}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <textarea
                        value={announcementText}
                        onChange={(e) => setAnnouncementText(e.target.value)}
                        placeholder="Announce something to your class..."
                        rows={2}
                        className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      />
                    </div>

                    {showAttachmentInput && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                        <input
                          type="text"
                          value={announcementAttachmentTitle}
                          onChange={(e) => setAnnouncementAttachmentTitle(e.target.value)}
                          placeholder="Attachment label / title (e.g. Lecture Slides)"
                          className="px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <input
                          type="url"
                          value={announcementAttachmentUrl}
                          onChange={(e) => setAnnouncementAttachmentUrl(e.target.value)}
                          placeholder="Link URL (Google Drive, GitHub, Web link)"
                          className="px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <button
                        type="button"
                        onClick={() => setShowAttachmentInput(!showAttachmentInput)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors flex items-center gap-1 font-medium"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{showAttachmentInput ? 'Remove Link' : 'Add Link / Resource'}</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isPostingAnnouncement || !announcementText.trim()}
                        className="btn-primary text-xs py-1.5 px-4 font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        {isPostingAnnouncement ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>Post Announcement</span>
                      </button>
                    </div>
                  </form>

                  {/* Announcement Feed */}
                  <div className="space-y-4">
                    {selectedClass.announcements && selectedClass.announcements.length > 0 ? (
                      selectedClass.announcements.map((ann) => (
                        <div
                          key={ann._id}
                          className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3"
                        >
                          {/* Post Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                                {ann.authorName?.charAt(0).toUpperCase() || 'A'}
                              </div>
                              <div>
                                <span className="font-bold text-xs text-slate-900 block leading-tight">
                                  {ann.authorName}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(ann.createdAt).toLocaleDateString([], {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Post Content */}
                          <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                            {ann.content}
                          </p>

                          {/* Attachments */}
                          {ann.attachments && ann.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {ann.attachments.map((att, idx) => (
                                <a
                                  key={idx}
                                  href={att.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 text-xs font-semibold text-slate-700 transition-colors"
                                >
                                  <LinkIcon className="w-3 h-3 text-emerald-600" />
                                  <span>{att.title || 'Attached Resource'}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400" />
                                </a>
                              ))}
                            </div>
                          )}

                          {/* Class Comments Thread */}
                          <div className="pt-3 border-t border-slate-100 space-y-2">
                            {ann.comments && ann.comments.length > 0 && (
                              <div className="space-y-2 mb-3">
                                {ann.comments.map((cm, cIdx) => (
                                  <div key={cIdx} className="flex items-start gap-2 text-xs bg-slate-50 p-2.5 rounded-lg">
                                    <div className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 font-bold text-[10px] flex items-center justify-center shrink-0">
                                      {cm.authorName?.charAt(0).toUpperCase() || 'S'}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <strong className="text-slate-900 text-[11px]">{cm.authorName}</strong>
                                        <span className="text-[10px] text-slate-400">
                                          {new Date(cm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                      <p className="text-slate-700 mt-0.5">{cm.text}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Comment input */}
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={commentInputs[ann._id] || ''}
                                onChange={(e) => setCommentInputs({ ...commentInputs, [ann._id]: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddComment(ann._id);
                                }}
                                placeholder="Add a class comment or doubt..."
                                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddComment(ann._id)}
                                disabled={isPostingComment[ann._id] || !commentInputs[ann._id]?.trim()}
                                className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg disabled:opacity-40 transition-colors"
                                title="Send Comment"
                              >
                                {isPostingComment[ann._id] ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                                ) : (
                                  <Send className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                        <MessageSquare className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs">No announcements yet. Be the first to post!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CLASSWORK (Assignments & Materials) */}
            {activeTab === 'classwork' && (
              <div className="space-y-5">
                {/* Header & Topic Filters */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5" />
                      <span>Topics:</span>
                    </span>
                    {topics.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTopic(t)}
                        className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${
                          selectedTopic === t
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {t === 'all' ? 'All Topics' : t}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsClassworkModalOpen(true)}
                    className="btn-primary text-xs py-2 px-4 font-semibold bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Assignment / Material</span>
                  </button>
                </div>

                {/* Classwork List */}
                <div className="space-y-3">
                  {filteredClasswork.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                      <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700">No classwork assigned yet</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Click "+ Create Assignment" to post coursework, lab assignments, or learning resources.
                      </p>
                    </div>
                  ) : (
                    filteredClasswork.map((cw) => (
                      <div
                        key={cw._id}
                        className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-emerald-300 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900">{cw.title}</h4>
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                  {cw.type}
                                </span>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  {cw.topic}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1">{cw.description}</p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-slate-900 block">{cw.points} points</span>
                            <span className="text-[10px] text-slate-400 block">
                              Due: {cw.dueDate ? new Date(cw.dueDate).toLocaleDateString() : 'No Due Date'}
                            </span>
                          </div>
                        </div>

                        {/* Attachments */}
                        {cw.attachments && cw.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {cw.attachments.map((att, aIdx) => (
                              <a
                                key={aIdx}
                                href={att.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-emerald-50"
                              >
                                <LinkIcon className="w-3 h-3 text-emerald-600" />
                                <span>{att.title}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Action Footer */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-400">
                            Posted on {new Date(cw.createdAt).toLocaleDateString()}
                          </span>

                          <button
                            onClick={() => handleOpenSubmissions(cw)}
                            className="btn-primary text-xs py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 font-semibold flex items-center gap-1.5"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>{isTeacher ? 'View All Submissions' : 'Turn In / View Work'}</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: PEOPLE (Teachers & Classmates) */}
            {activeTab === 'people' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                {/* Search members */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={peopleSearch}
                    onChange={(e) => setPeopleSearch(e.target.value)}
                    placeholder="Search teachers and classmates..."
                    className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Teachers Section */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="pb-3 border-b border-emerald-500 flex items-center justify-between mb-4">
                    <h3 className="text-base font-black text-emerald-800">Teachers & Instructors</h3>
                    <span className="text-xs font-semibold text-slate-400">1 Faculty Lead</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {selectedClass.creator?.name?.charAt(0).toUpperCase() || 'T'}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900 flex items-center gap-2">
                          <span>{selectedClass.creator?.name || 'Classroom Instructor'}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Host / Creator
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-500">{selectedClass.creator?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Classmates Section */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="pb-3 border-b border-slate-200 flex items-center justify-between mb-4">
                    <h3 className="text-base font-black text-slate-900">Classmates & Enrolled Students</h3>
                    <span className="text-xs font-semibold text-slate-400">
                      {selectedClass.students?.length || 0} students
                    </span>
                  </div>

                  {selectedClass.students && selectedClass.students.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {selectedClass.students
                        .filter(
                          (s) =>
                            s.name?.toLowerCase().includes(peopleSearch.toLowerCase()) ||
                            s.email?.toLowerCase().includes(peopleSearch.toLowerCase())
                        )
                        .map((st) => (
                          <div
                            key={st._id}
                            className="flex items-center justify-between py-3 px-2 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                                {st.name?.charAt(0).toUpperCase() || 'S'}
                              </div>
                              <div>
                                <p className="font-semibold text-xs text-slate-900">{st.name}</p>
                                <p className="text-[11px] text-slate-400">{st.email}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              Student
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400">
                      <p className="text-xs">No students have joined yet.</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Share class code <strong>{selectedClass.code}</strong> with your students to invite them.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 1: CREATE CLASSROOM                                      */}
        {/* ============================================================== */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
              <h3 className="text-lg font-black text-slate-900 mb-1">Create Class</h3>
              <p className="text-xs text-slate-500 mb-4">
                Set up a new classroom space with a unique student enrollment code.
              </p>

              {createError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs mb-4">
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreateClassroom} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Class Name (Required)</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Distributed Systems & Cloud Computing"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Section</label>
                    <input
                      type="text"
                      value={newSection}
                      onChange={(e) => setNewSection(e.target.value)}
                      placeholder="e.g. Section A / CS-401"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Subject</label>
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Room / Lab</label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    placeholder="e.g. Hall 402 / Virtual Lab"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Theme Color</label>
                  <div className="flex items-center gap-2">
                    {(['emerald', 'indigo', 'rose', 'amber', 'cyan', 'purple'] as const).map((th) => (
                      <button
                        key={th}
                        type="button"
                        onClick={() => setNewTheme(th)}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          newTheme === th ? 'scale-110 border-slate-900 shadow-sm' : 'border-transparent opacity-80'
                        } ${
                          th === 'emerald'
                            ? 'bg-emerald-600'
                            : th === 'indigo'
                            ? 'bg-indigo-600'
                            : th === 'rose'
                            ? 'bg-rose-600'
                            : th === 'amber'
                            ? 'bg-amber-500'
                            : th === 'cyan'
                            ? 'bg-cyan-600'
                            : 'bg-purple-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="btn-secondary text-xs py-2 px-4 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCreate}
                    className="btn-primary text-xs py-2 px-5 font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isSubmittingCreate ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 2: JOIN CLASSROOM WITH CODE                              */}
        {/* ============================================================== */}
        {isJoinModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
              <h3 className="text-lg font-black text-slate-900 mb-1">Join Class</h3>
              <p className="text-xs text-slate-500 mb-4">
                Ask your teacher for the class code, then enter it below.
              </p>

              {joinError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs mb-4">
                  {joinError}
                </div>
              )}

              <form onSubmit={handleJoinClassroom} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Class Code</label>
                  <input
                    type="text"
                    required
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SX-9A4B"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg font-mono font-bold text-center tracking-widest text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Use a 6-character code with no spaces</p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsJoinModalOpen(false)}
                    className="btn-secondary text-xs py-2 px-4 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingJoin || !joinCode.trim()}
                    className="btn-primary text-xs py-2 px-5 font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isSubmittingJoin ? 'Joining...' : 'Join Class'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 3: CREATE CLASSWORK (ASSIGNMENT / MATERIAL / QUIZ)       */}
        {/* ============================================================== */}
        {isClassworkModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">Create Classwork Item</h3>
                <button
                  onClick={() => setIsClassworkModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateClasswork} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Title (Required)</label>
                  <input
                    type="text"
                    required
                    value={cwTitle}
                    onChange={(e) => setCwTitle(e.target.value)}
                    placeholder="e.g. Lab 4: Consensus Algorithms & Raft Implementation"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Type</label>
                    <select
                      value={cwType}
                      onChange={(e: any) => setCwType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    >
                      <option value="assignment">Assignment</option>
                      <option value="material">Study Material / Lecture Notes</option>
                      <option value="quiz">Quiz / Assessment</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Topic / Unit</label>
                    <input
                      type="text"
                      value={cwTopic}
                      onChange={(e) => setCwTopic(e.target.value)}
                      placeholder="e.g. Unit 2: Consensus"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Points</label>
                    <input
                      type="number"
                      min={0}
                      value={cwPoints}
                      onChange={(e) => setCwPoints(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Due Date</label>
                    <input
                      type="date"
                      value={cwDueDate}
                      onChange={(e) => setCwDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 block">Instructions & Description</label>
                    <button
                      type="button"
                      onClick={handleGenerateAiGuide}
                      disabled={isGeneratingCwAi || !cwTitle.trim()}
                      className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1 disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{isGeneratingCwAi ? 'Generating Rubric...' : '✨ Generate AI Rubric'}</span>
                    </button>
                  </div>
                  <textarea
                    value={cwDescription}
                    onChange={(e) => setCwDescription(e.target.value)}
                    placeholder="Provide full problem statement, grading rubric, or submission guidelines..."
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                  />
                </div>

                {cwAiGuide && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-emerald-900 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>AI Generated Rubric & Expectations:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCwDescription((prev) => (prev ? prev + '\n\n' + cwAiGuide : cwAiGuide));
                          setCwAiGuide(null);
                        }}
                        className="text-[10px] font-bold text-emerald-700 hover:underline"
                      >
                        Append to Instructions
                      </button>
                    </div>
                    <p className="text-[11px] text-emerald-800 whitespace-pre-wrap leading-relaxed">
                      {cwAiGuide}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Attachment Title</label>
                    <input
                      type="text"
                      value={cwAttachmentTitle}
                      onChange={(e) => setCwAttachmentTitle(e.target.value)}
                      placeholder="e.g. Starter Code / Starter Repo"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Attachment Link URL</label>
                    <input
                      type="url"
                      value={cwAttachmentUrl}
                      onChange={(e) => setCwAttachmentUrl(e.target.value)}
                      placeholder="e.g. https://github.com/..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsClassworkModalOpen(false)}
                    className="btn-secondary text-xs py-2 px-4 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingCw || !cwTitle.trim()}
                    className="btn-primary text-xs py-2 px-5 font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isCreatingCw ? 'Publishing...' : 'Assign Classwork'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* DRAWER / MODAL 4: SUBMISSIONS & WORK TURN-IN                   */}
        {/* ============================================================== */}
        {activeSubmissionCw && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">{activeSubmissionCw.title}</h3>
                  <span className="text-xs text-slate-500">
                    Due: {activeSubmissionCw.dueDate ? new Date(activeSubmissionCw.dueDate).toLocaleDateString() : 'No date'} • {activeSubmissionCw.points} points
                  </span>
                </div>
                <button
                  onClick={() => setActiveSubmissionCw(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>

              {/* Instructions summary */}
              {activeSubmissionCw.description && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  <strong className="text-slate-900 block mb-1">Instructions:</strong>
                  {activeSubmissionCw.description}
                </div>
              )}

              {/* STUDENT VIEW: TURN IN WORK */}
              {!isTeacherOfActiveCw && (
                <div className="space-y-4 pt-2">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Your Work</span>
                  </h4>

                  {submitMessage && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
                      {submitMessage}
                    </div>
                  )}

                  {submissionsList.length > 0 && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Current Submission Status:</span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded uppercase text-[10px] ${
                            submissionsList[0].status === 'graded'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {submissionsList[0].status}
                        </span>
                      </div>
                      <p className="text-slate-700 bg-white p-2.5 rounded border border-slate-200 font-mono">
                        {submissionsList[0].content}
                      </p>

                      {submissionsList[0].grade !== null && submissionsList[0].grade !== undefined && (
                        <div className="p-3 bg-emerald-100/60 border border-emerald-300 rounded-lg mt-2">
                          <span className="font-bold text-emerald-900 block text-xs">
                            Score: {submissionsList[0].grade} / {activeSubmissionCw.points} points
                          </span>
                          {submissionsList[0].feedback && (
                            <p className="text-emerald-800 text-[11px] mt-0.5">
                              Feedback: {submissionsList[0].feedback}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleUnsubmitWork(submissionsList[0]._id)}
                          className="text-xs text-red-600 font-semibold hover:underline"
                        >
                          Unsubmit Work
                        </button>
                      </div>
                    </div>
                  )}

                  {submissionsList.length === 0 && (
                    <form onSubmit={handleSubmitWork} className="space-y-3 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Submission Link or Solution Response
                        </label>
                        <textarea
                          required
                          value={mySubmissionContent}
                          onChange={(e) => setMySubmissionContent(e.target.value)}
                          placeholder="Paste your GitHub repository link, Google Drive document link, or written answer..."
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingWork || !mySubmissionContent.trim()}
                        className="btn-primary w-full text-xs py-2.5 font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        {isSubmittingWork ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        <span>Turn In Assignment</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* TEACHER VIEW: REVIEW & GRADE SUBMISSIONS */}
              {isTeacherOfActiveCw && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">
                      Student Submissions ({submissionsList.length})
                    </h4>
                    <span className="text-xs text-slate-500">Max Points: {activeSubmissionCw.points}</span>
                  </div>

                  {isLoadingSubmissions ? (
                    <div className="p-8 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
                      <span className="text-xs">Loading submissions...</span>
                    </div>
                  ) : submissionsList.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-xs">No students have turned in work yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {submissionsList.map((sub) => (
                        <div
                          key={sub._id}
                          className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-900 block">{sub.studentName}</span>
                              <span className="text-[10px] text-slate-400">
                                Submitted on {new Date(sub.submittedAt).toLocaleString()}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                sub.status === 'graded'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : sub.status === 'late'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </div>

                          <div className="p-2.5 bg-white rounded border border-slate-200 font-mono text-slate-800 break-all">
                            {sub.content}
                          </div>

                          {/* Grade & Feedback form */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                            <div>
                              <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">
                                Grade (Out of {activeSubmissionCw.points})
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={activeSubmissionCw.points}
                                defaultValue={sub.grade ?? ''}
                                onChange={(e) =>
                                  setGradingScores({
                                    ...gradingScores,
                                    [sub._id]: parseFloat(e.target.value) || 0,
                                  })
                                }
                                placeholder="Marks"
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">
                                Teacher Feedback
                              </label>
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  defaultValue={sub.feedback || ''}
                                  onChange={(e) =>
                                    setGradingFeedbacks({
                                      ...gradingFeedbacks,
                                      [sub._id]: e.target.value,
                                    })
                                  }
                                  placeholder="Great work, clear analysis..."
                                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleGradeSubmission(sub._id)}
                                  disabled={isSavingGrade[sub._id]}
                                  className="btn-primary text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 font-semibold shrink-0"
                                >
                                  {isSavingGrade[sub._id] ? 'Saving...' : 'Save Grade'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
