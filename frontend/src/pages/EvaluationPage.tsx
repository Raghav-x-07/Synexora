import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import API from '../lib/api';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import {
  Award,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Loader2,
  Sparkles,
  Brain,
  Check,
  X,
  BookOpen,
  Volume2,
  VolumeX,
  TrendingUp,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';

interface AssessmentRecord {
  _id: string;
  title: string;
  course: string;
  date: string;
  score: string;
  status: 'completed' | 'upcoming';
}

interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
  keyConcept?: string;
}

export const EvaluationPage: React.FC = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // AI Quiz Generator Form State
  const [topicInput, setTopicInput] = useState('');
  const [courseInput, setCourseInput] = useState('Computer Science');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatorError, setGeneratorError] = useState<string | null>(null);

  // Active Quiz State
  const [activeQuizTopic, setActiveQuizTopic] = useState<string>('');
  const [activeQuizCourse, setActiveQuizCourse] = useState<string>('');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Saving state
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Store weak concepts to memory state
  const [savingConceptIdx, setSavingConceptIdx] = useState<number | null>(null);
  const [savedConceptMap, setSavedConceptMap] = useState<Record<number, boolean>>({});

  // Voice Assistant
  const { speakingId, toggleSpeak } = useVoiceAssistant();

  const fetchAssessments = async () => {
    try {
      setIsLoading(true);
      const res = await API.get('/assessments');
      if (res.data.success && res.data.assessments) {
        setAssessments(res.data.assessments);
      }
    } catch (err) {
      console.error('Fetch assessments error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  // Handle Generate Quiz based on topic
  const handleGenerateQuiz = async (presetTopic?: string) => {
    const topicToUse = presetTopic || topicInput;
    if (!topicToUse || !topicToUse.trim()) {
      setGeneratorError('Please enter a topic to generate an evaluation quiz.');
      return;
    }

    setIsGenerating(true);
    setGeneratorError(null);
    setSavedSuccessMsg(null);
    setSavedConceptMap({});

    try {
      const res = await API.post('/ai/generate-quiz', {
        topic: topicToUse.trim(),
        difficulty,
        questionCount,
        course: courseInput,
      });

      if (res.data.success && res.data.questions && res.data.questions.length > 0) {
        setQuizQuestions(res.data.questions);
        setActiveQuizTopic(topicToUse.trim());
        setActiveQuizCourse(courseInput);
        setIsTakingQuiz(true);
        setCurrentQIndex(0);
        setSelectedAnswers({});
        setIsSubmitted(false);
        setQuizScore(null);
      } else {
        setGeneratorError('Could not generate quiz questions. Please try again with a different topic.');
      }
    } catch (err: any) {
      console.error('Generate quiz error:', err);
      setGeneratorError(err.response?.data?.message || 'Failed to generate quiz. Please check backend connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (qIdx: number, optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [qIdx]: optionIdx,
    });
  };

  const handleSubmitQuiz = async () => {
    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / quizQuestions.length) * 100);
    setQuizScore(percent);
    setIsSubmitted(true);

    // Save assessment record automatically to MongoDB
    try {
      const res = await API.post('/assessments', {
        title: `AI Evaluation: ${activeQuizTopic}`,
        course: activeQuizCourse || 'General',
        score: `${percent}%`,
        status: 'completed',
      });

      if (res.data.success && res.data.assessment) {
        setAssessments((prev) => [res.data.assessment, ...prev]);
        setSavedSuccessMsg('Evaluation result automatically saved to your progress records!');
      }
    } catch (err) {
      console.error('Save evaluation result error:', err);
    }
  };

  const handleSaveWeakConceptToMemory = async (q: QuizQuestion, idx: number) => {
    try {
      setSavingConceptIdx(idx);
      const conceptName = q.keyConcept || `${activeQuizTopic} (Question ${idx + 1})`;
      const definitionText = `### 📖 Concept Definition
${q.keyConcept || conceptName}: Core concept tested in academic evaluation for ${activeQuizTopic || 'topic'}.

### 💡 Step-by-Step Solution & Explanation
- **Question:** ${q.q}
- **Correct Answer:** ${q.options[q.correct]}
- **Detailed Explanation:** ${q.explanation}

### 🎯 Key Takeaway & Example
Ensure mastery of this concept for upcoming evaluations and coursework in ${activeQuizCourse || 'this subject'}.`;

      await API.post('/memory', {
        concept: conceptName,
        definition: definitionText,
        course: activeQuizCourse || 'General',
        source: 'learning-ai',
      });

      setSavedConceptMap((prev) => ({ ...prev, [idx]: true }));
    } catch (err) {
      console.error('Save weak concept error:', err);
    } finally {
      setSavingConceptIdx(null);
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    try {
      const res = await API.delete(`/assessments/${id}`);
      if (res.data.success) {
        setAssessments(assessments.filter((a) => a._id !== id));
      }
    } catch (err) {
      console.error('Delete assessment error:', err);
    }
  };

  // Download official evaluation scorecard / assessment record as PDF
  const handleDownloadRecordPdf = (record: AssessmentRecord) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxContentWidth = pageWidth - margin * 2;

    // Header bar
    doc.setFillColor(16, 185, 129); // Synexora Emerald Green
    doc.rect(0, 0, pageWidth, 18, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SYNEXORA — ACADEMIC EVALUATION REPORT', margin, 12);

    // Meta Header
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Official Academic Knowledge & Skill Diagnostic Report`, margin, 24);

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, 27, pageWidth - margin, 27);

    // Topic Title
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    const splitTitle = doc.splitTextToSize(record.title, maxContentWidth);
    doc.text(splitTitle, margin, 36);

    let currentY = 36 + splitTitle.length * 6 + 4;

    // Details Grid Card
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, currentY, maxContentWidth, 34, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, maxContentWidth, 34, 3, 3, 'D');

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('COURSE / FIELD:', margin + 6, currentY + 9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(record.course || 'General', margin + 45, currentY + 9);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('EVALUATION DATE:', margin + 6, currentY + 17);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(record.date || new Date().toLocaleDateString(), margin + 45, currentY + 17);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('STATUS:', margin + 6, currentY + 25);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(16, 185, 129);
    doc.text('Completed & Verified', margin + 45, currentY + 25);

    // Score Badge in Card
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(pageWidth - margin - 46, currentY + 5, 40, 24, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('EVALUATION SCORE', pageWidth - margin - 26, currentY + 11, { align: 'center' });
    doc.setFontSize(13);
    doc.text(record.score, pageWidth - margin - 26, currentY + 21, { align: 'center' });

    currentY += 42;

    // Performance Tier Analysis
    const numScore = parseInt(record.score, 10) || 0;
    let tierTitle = 'Proficient Knowledge Retention';
    let tierDesc = 'Demonstrated solid grasp of key terminology, core mechanisms, and application principles.';
    if (numScore >= 85) {
      tierTitle = 'Advanced Academic Mastery';
      tierDesc = 'Excellent command over foundational concepts, edge cases, and theoretical problem solving.';
    } else if (numScore < 60) {
      tierTitle = 'Concept Review Recommended';
      tierDesc = 'Identified key knowledge gaps. Reviewing weak concepts and retaking diagnostic quizzes is recommended.';
    }

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text('DIAGNOSTIC PERFORMANCE BREAKDOWN:', margin, currentY);
    currentY += 6;

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Performance Tier: ${tierTitle}`, margin, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const splitDesc = doc.splitTextToSize(tierDesc, maxContentWidth);
    doc.text(splitDesc, margin, currentY);
    currentY += splitDesc.length * 5 + 8;

    // Synexora AI Learning Advice
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, currentY, maxContentWidth, 26, 2, 2, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('SYNEXORA AI TUTOR RECOMMENDATION:', margin + 5, currentY + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const adviceText = `To reinforce retention, sync missed topics with Synexora Memory Recall flashcards and ask grounded RAG doubts in the Documents workspace.`;
    const splitAdvice = doc.splitTextToSize(adviceText, maxContentWidth - 10);
    doc.text(splitAdvice, margin + 5, currentY + 14);

    // Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text(`Generated by Synexora AI Adaptive Learning Platform — ${new Date().toLocaleDateString()}`, margin, pageHeight - 9);

    const safeTitle = record.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
    doc.save(`Synexora_Evaluation_${safeTitle}.pdf`);
  };

  // Download single evaluation record as CSV
  const handleDownloadRecordCsv = (record: AssessmentRecord) => {
    const escapeCsv = (str: string | number) => `"${String(str || '').replace(/"/g, '""')}"`;
    const numSc = parseInt(record.score, 10) || 0;
    const tier = numSc >= 85 ? 'Advanced Academic Mastery' : numSc >= 70 ? 'Proficient Concept Mastery' : numSc >= 50 ? 'Developing Competency' : 'Foundational Review Needed';

    const csvContent = [
      'SYNEXORA ACADEMIC EVALUATION RECORD',
      `Title,${escapeCsv(record.title)}`,
      `Course / Field,${escapeCsv(record.course)}`,
      `Score,${escapeCsv(record.score)}`,
      `Numeric Score,${numSc}`,
      `Date,${escapeCsv(record.date)}`,
      `Status,${escapeCsv(record.status)}`,
      `Performance Tier,${escapeCsv(tier)}`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = (record.title || 'evaluation').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
    link.download = `Synexora_Evaluation_${safeTitle}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download entire evaluation progress report as PDF
  const handleExportProgressPdf = () => {
    if (assessments.length === 0) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const maxContentWidth = pageWidth - margin * 2;

    const scoresArray = assessments
      .map((a) => parseInt(a.score, 10))
      .filter((n) => !isNaN(n));
    const avgScore =
      scoresArray.length > 0
        ? Math.round(scoresArray.reduce((acc, v) => acc + v, 0) / scoresArray.length)
        : 0;
    const maxScore = scoresArray.length > 0 ? Math.max(...scoresArray) : 0;
    const minScore = scoresArray.length > 0 ? Math.min(...scoresArray) : 0;

    // Header bar
    doc.setFillColor(16, 185, 129); // Emerald
    doc.rect(0, 0, pageWidth, 20, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('SYNEXORA — ACADEMIC EVALUATION PROGRESS REPORT', margin, 13);

    // Meta Header Info
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Comprehensive Diagnostic & Quiz Telemetry Summary', margin, 26);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, 29, pageWidth - margin, 29);

    // Student & Report Overview Card
    let currentY = 34;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, currentY, maxContentWidth, 26, 2.5, 2.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, maxContentWidth, 26, 2.5, 2.5, 'D');

    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('STUDENT LEARNER:', margin + 6, currentY + 8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(user?.name || 'Student Learner', margin + 40, currentY + 8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('INSTITUTIONAL EMAIL:', margin + 6, currentY + 16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(user?.email || 'N/A', margin + 40, currentY + 16);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('GENERATED ON:', margin + 105, currentY + 8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), margin + 133, currentY + 8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('EVALUATIONS:', margin + 105, currentY + 16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(16, 185, 129);
    doc.text(`${assessments.length} Completed Tests`, margin + 133, currentY + 16);

    currentY += 32;

    // 4 High-Yield Metric KPI Cards
    const boxW = (maxContentWidth - 9) / 4;
    const boxH = 22;

    // Box 1: Average Score
    doc.setFillColor(255, 253, 247);
    doc.roundedRect(margin, currentY, boxW, boxH, 2, 2, 'F');
    doc.setDrawColor(232, 225, 210);
    doc.roundedRect(margin, currentY, boxW, boxH, 2, 2, 'D');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('AVERAGE SCORE', margin + 5, currentY + 7);
    doc.setFontSize(13);
    doc.setTextColor(16, 185, 129);
    doc.text(`${avgScore}%`, margin + 5, currentY + 17);

    // Box 2: Highest Score
    doc.setFillColor(255, 253, 247);
    doc.roundedRect(margin + boxW + 3, currentY, boxW, boxH, 2, 2, 'F');
    doc.setDrawColor(232, 225, 210);
    doc.roundedRect(margin + boxW + 3, currentY, boxW, boxH, 2, 2, 'D');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('HIGHEST SCORE', margin + boxW + 8, currentY + 7);
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(`${maxScore}%`, margin + boxW + 8, currentY + 17);

    // Box 3: Lowest Score
    doc.setFillColor(255, 253, 247);
    doc.roundedRect(margin + (boxW + 3) * 2, currentY, boxW, boxH, 2, 2, 'F');
    doc.setDrawColor(232, 225, 210);
    doc.roundedRect(margin + (boxW + 3) * 2, currentY, boxW, boxH, 2, 2, 'D');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('LOWEST SCORE', margin + (boxW + 3) * 2 + 5, currentY + 7);
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(`${minScore}%`, margin + (boxW + 3) * 2 + 5, currentY + 17);

    // Box 4: Mastery Status
    doc.setFillColor(255, 253, 247);
    doc.roundedRect(margin + (boxW + 3) * 3, currentY, boxW, boxH, 2, 2, 'F');
    doc.setDrawColor(232, 225, 210);
    doc.roundedRect(margin + (boxW + 3) * 3, currentY, boxW, boxH, 2, 2, 'D');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('OVERALL MASTERY', margin + (boxW + 3) * 3 + 5, currentY + 7);
    doc.setFontSize(8.5);
    doc.setTextColor(16, 185, 129);
    const shortTier = avgScore >= 85 ? 'Exemplary' : avgScore >= 70 ? 'Proficient' : avgScore >= 50 ? 'Developing' : 'Review';
    doc.text(shortTier, margin + (boxW + 3) * 3 + 5, currentY + 16);

    currentY += 28;

    // Table Header function
    const renderTableHeader = (yPos: number) => {
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, yPos, maxContentWidth, 8, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin, yPos, maxContentWidth, 8, 'D');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 65, 85);
      doc.text('#', margin + 3, yPos + 5.5);
      doc.text('EVALUATION TOPIC', margin + 12, yPos + 5.5);
      doc.text('COURSE / FIELD', margin + 95, yPos + 5.5);
      doc.text('DATE', margin + 138, yPos + 5.5);
      doc.text('SCORE', margin + 165, yPos + 5.5);
      return yPos + 8;
    };

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text('EVALUATION RECORDS LOG:', margin, currentY);
    currentY += 6;

    currentY = renderTableHeader(currentY);

    // Render Table Rows
    assessments.forEach((item, idx) => {
      if (currentY > pageHeight - 25) {
        doc.addPage();
        currentY = 20;
        currentY = renderTableHeader(currentY);
      }

      const rowH = 7.5;
      const isEven = idx % 2 === 0;
      if (isEven) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, currentY, maxContentWidth, rowH, 'F');
      }

      doc.setDrawColor(241, 245, 249);
      doc.line(margin, currentY + rowH, margin + maxContentWidth, currentY + rowH);

      doc.setFontSize(7.8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(String(idx + 1), margin + 3, currentY + 5);

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      const cleanTitle = (item.title || 'Untitled Evaluation').slice(0, 48);
      doc.text(cleanTitle, margin + 12, currentY + 5);

      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.text((item.course || 'General').slice(0, 22), margin + 95, currentY + 5);

      doc.setTextColor(100, 116, 139);
      doc.text(item.date || '—', margin + 138, currentY + 5);

      const numSc = parseInt(item.score, 10) || 0;
      if (numSc >= 75) {
        doc.setTextColor(16, 185, 129);
      } else if (numSc >= 50) {
        doc.setTextColor(217, 119, 6);
      } else {
        doc.setTextColor(220, 38, 38);
      }
      doc.setFont('helvetica', 'bold');
      doc.text(item.score || '—', margin + 165, currentY + 5);

      currentY += rowH;
    });

    // Page numbers & footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(7.5);
      doc.text('Synexora AI Adaptive Learning Platform • Evaluation Progress Diagnostic Report', margin, pageHeight - 7);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 15, pageHeight - 7);
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    doc.save(`Synexora_Evaluation_Progress_Report_${dateStr}.pdf`);
  };

  // Download entire evaluation progress report as CSV
  const handleExportProgressCsv = () => {
    if (assessments.length === 0) return;

    const escapeCsv = (str: string | number) => `"${String(str || '').replace(/"/g, '""')}"`;

    const scoresArray = assessments
      .map((a) => parseInt(a.score, 10))
      .filter((n) => !isNaN(n));
    const avgScore =
      scoresArray.length > 0
        ? Math.round(scoresArray.reduce((acc, v) => acc + v, 0) / scoresArray.length)
        : 0;
    const maxScore = scoresArray.length > 0 ? Math.max(...scoresArray) : 0;

    const getMasteryTier = (score: number) => {
      if (score >= 85) return 'Advanced Academic Mastery';
      if (score >= 70) return 'Proficient Concept Mastery';
      if (score >= 50) return 'Developing Competency';
      return 'Foundational Review Needed';
    };

    const csvLines = [
      'SYNEXORA ACADEMIC EVALUATION PROGRESS REPORT',
      `Student Name,${escapeCsv(user?.name || 'Student Learner')}`,
      `Email,${escapeCsv(user?.email || 'N/A')}`,
      `Export Date,${escapeCsv(new Date().toLocaleDateString('en-US'))}`,
      `Total Evaluations,${assessments.length}`,
      `Average Score,${avgScore}%`,
      `Highest Score,${maxScore}%`,
      `Overall Mastery Tier,${escapeCsv(getMasteryTier(avgScore))}`,
      '',
      'Index,Evaluation Title,Course / Subject,Score,Numeric Score,Status,Date,Performance Tier',
    ];

    assessments.forEach((item, idx) => {
      const numSc = parseInt(item.score, 10) || 0;
      csvLines.push(
        [
          idx + 1,
          escapeCsv(item.title),
          escapeCsv(item.course || 'General'),
          escapeCsv(item.score),
          numSc,
          escapeCsv(item.status || 'completed'),
          escapeCsv(item.date),
          escapeCsv(getMasteryTier(numSc)),
        ].join(',')
      );
    });

    const csvContent = csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Synexora_Evaluation_Progress_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download active quiz question-by-question as CSV
  const handleDownloadActiveQuizCsv = () => {
    if (quizQuestions.length === 0) return;

    const escapeCsv = (str: string | number) => `"${String(str || '').replace(/"/g, '""')}"`;

    const csvLines = [
      'SYNEXORA AI QUIZ EVALUATION REPORT',
      `Topic,${escapeCsv(activeQuizTopic)}`,
      `Course Domain,${escapeCsv(activeQuizCourse)}`,
      `Score,${escapeCsv(`${quizScore !== null ? quizScore : 'N/A'}%`)}`,
      `Date,${escapeCsv(new Date().toLocaleDateString('en-US'))}`,
      '',
      'Question #,Question Text,Student Choice,Correct Answer,Is Correct,Key Concept,Explanation',
    ];

    quizQuestions.forEach((q, idx) => {
      const isSelected = selectedAnswers[idx] !== undefined;
      const isCorrect = selectedAnswers[idx] === q.correct;
      const studentChoice = isSelected ? q.options[selectedAnswers[idx]] : 'Unanswered';
      const correctChoice = q.options[q.correct];

      csvLines.push(
        [
          idx + 1,
          escapeCsv(q.q),
          escapeCsv(studentChoice),
          escapeCsv(correctChoice),
          isCorrect ? 'YES (Correct)' : 'NO (Incorrect)',
          escapeCsv(q.keyConcept || ''),
          escapeCsv(q.explanation || ''),
        ].join(',')
      );
    });

    const csvContent = csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTopic = activeQuizTopic.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
    link.download = `Synexora_Quiz_${safeTopic}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download full active quiz question-by-question evaluation report as PDF
  const handleDownloadActiveQuizPdf = () => {
    if (quizQuestions.length === 0) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxContentWidth = pageWidth - margin * 2;

    // Header bar
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageWidth, 18, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SYNEXORA — AI QUIZ EVALUATION & SOLUTIONS', margin, 12);

    // Meta Header
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Topic: ${activeQuizTopic}  |  Course: ${activeQuizCourse}  |  Score: ${quizScore !== null ? `${quizScore}%` : 'N/A'}  |  Date: ${new Date().toLocaleDateString()}`, margin, 24);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, 27, pageWidth - margin, 27);

    let currentY = 34;

    quizQuestions.forEach((q, idx) => {
      const isSelected = selectedAnswers[idx] !== undefined;
      const isCorrect = selectedAnswers[idx] === q.correct;
      const studentChoice = isSelected ? q.options[selectedAnswers[idx]] : 'Unanswered';

      // Check if we need a new page
      if (currentY > pageHeight - 65) {
        doc.addPage();
        currentY = 20;
      }

      // Question Title
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const splitQ = doc.splitTextToSize(`Q${idx + 1}. ${q.q}`, maxContentWidth);
      doc.text(splitQ, margin, currentY);
      currentY += splitQ.length * 4.8 + 2.5;

      // Status badge
      doc.setFontSize(8);
      if (isCorrect) {
        doc.setTextColor(16, 185, 129);
        doc.text(`Result: Correct (+1)`, margin, currentY);
      } else {
        doc.setTextColor(220, 38, 38);
        doc.text(`Result: Incorrect (Selected: "${studentChoice}")`, margin, currentY);
      }
      currentY += 4.5;

      // Options
      doc.setFontSize(8);
      q.options.forEach((opt, optIdx) => {
        const isOptCorrect = optIdx === q.correct;
        const isOptSelected = selectedAnswers[idx] === optIdx;

        let optPrefix = `${String.fromCharCode(65 + optIdx)}. ${opt}`;
        if (isOptCorrect && isOptSelected) {
          doc.setTextColor(16, 185, 129);
          optPrefix += '  [✓ Correct - Selected]';
        } else if (isOptCorrect) {
          doc.setTextColor(16, 185, 129);
          optPrefix += '  [✓ Correct Answer]';
        } else if (isOptSelected) {
          doc.setTextColor(220, 38, 38);
          optPrefix += '  [✗ Your Choice]';
        } else {
          doc.setTextColor(71, 85, 105);
        }

        doc.setFont('helvetica', isOptCorrect ? 'bold' : 'normal');
        const splitOpt = doc.splitTextToSize(optPrefix, maxContentWidth - 6);
        doc.text(splitOpt, margin + 3, currentY);
        currentY += splitOpt.length * 4;
      });

      currentY += 2;

      // Explanation Box
      doc.setFillColor(248, 250, 252);
      const splitExp = doc.splitTextToSize(`Explanation: ${q.explanation}`, maxContentWidth - 8);
      const boxHeight = splitExp.length * 4 + 6;

      if (currentY + boxHeight > pageHeight - 20) {
        doc.addPage();
        currentY = 20;
      }

      doc.roundedRect(margin, currentY, maxContentWidth, boxHeight, 1.5, 1.5, 'F');
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(7.8);
      doc.setFont('helvetica', 'normal');
      doc.text(splitExp, margin + 4, currentY + 4.5);

      currentY += boxHeight + 6;
    });

    // Footer on last page
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text(`Synexora AI Diagnostic Engine — Downloaded on ${new Date().toLocaleDateString()}`, margin, pageHeight - 9);

    const safeTopic = activeQuizTopic.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
    doc.save(`Synexora_Quiz_${safeTopic}.pdf`);
  };

  const currentQ = quizQuestions[currentQIndex];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="pb-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">AI Evaluation & Quiz Engine</h1>
                <p className="text-xs text-slate-500">
                  Generate adaptive diagnostic quizzes on any syllabus topic, test your mastery, and store weak concepts.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Groq AI Powered</span>
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* QUIZ GENERATOR HUB                                             */}
        {/* ============================================================== */}
        <div className="bg-[#FFFFFF] text-[#111111] rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E8E1D2] relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2]">
              Topic-Driven Knowledge Evaluation
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#111111] mb-2 tracking-tight">
            What concept or topic would you like to evaluate today?
          </h2>
          <p className="text-xs text-[#777777] mb-6 max-w-2xl leading-relaxed">
            Type any academic subject, algorithm, theory, or chapter. Our Groq AI engine will construct high-yield multiple-choice questions with step-by-step diagnostic feedback.
          </p>

          {/* Generator Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerateQuiz();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5">
                <label className="text-[10px] font-bold text-[#777777] uppercase block mb-1">
                  Topic / Concept / Chapter
                </label>
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="e.g. Binary Search Trees, ACID Transactions, Gradient Descent..."
                  required
                  disabled={isGenerating}
                  className="input-clean font-medium text-xs"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[10px] font-bold text-[#777777] uppercase block mb-1">
                  Course Domain
                </label>
                <select
                  value={courseInput}
                  onChange={(e) => setCourseInput(e.target.value)}
                  disabled={isGenerating}
                  className="input-clean text-xs font-medium"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="AI & Machine Learning">AI & ML</option>
                  <option value="Biomedical">Biomedical</option>
                  <option value="Economics">Economics</option>
                  <option value="General Studies">General Studies</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-[#777777] uppercase block mb-1">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  disabled={isGenerating}
                  className="input-clean text-xs font-medium"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-[#777777] uppercase block mb-1">
                  Questions
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  disabled={isGenerating}
                  className="input-clean text-xs font-medium"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={8}>8 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>
            </div>

            {/* Quick Topic Suggestion Pills */}
            <div className="flex items-center gap-2 overflow-x-auto text-[11px] pt-1 pb-1">
              <span className="text-[#777777] text-[10px] uppercase font-bold shrink-0">Popular:</span>
              {[
                'Binary Search Trees & AVL',
                'ACID Database Transactions',
                'OS Concurrency & Semaphores',
                'Neural Networks & Backprop',
                'TCP/IP & OSI Network Layers',
                'Dynamic Programming Memoization',
              ].map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => {
                    setTopicInput(pill);
                    handleGenerateQuiz(pill);
                  }}
                  disabled={isGenerating}
                  className="px-3 py-1 rounded-full bg-[#FFF8E8] hover:bg-[#F7F1E3] border border-[#E8E1D2] text-[#111111] font-medium shrink-0 transition-all text-[11px]"
                >
                  {pill}
                </button>
              ))}
            </div>

            {generatorError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
                <X className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{generatorError}</span>
              </div>
            )}

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={isGenerating || !topicInput.trim()}
                className="btn-primary px-6 py-3 text-xs font-bold gap-2 shadow-sm disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reasoning & Generating Quiz...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Evaluation Quiz</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ============================================================== */}
        {/* INTERACTIVE QUIZ & EVALUATION RESULTS INTERFACE                */}
        {/* ============================================================== */}
        {isTakingQuiz && quizQuestions.length > 0 && (
          <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            {/* Quiz Top Status Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D2] flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2]">
                    {activeQuizCourse}
                  </span>
                  <span className="text-xs text-[#777777]">•</span>
                  <span className="text-xs font-semibold text-[#777777] capitalize">
                    {difficulty} Difficulty
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-[#111111] mt-1">{activeQuizTopic}</h3>
              </div>

              {!isSubmitted ? (
                <div className="text-right">
                  <span className="text-xs font-bold text-[#111111]">
                    Question {currentQIndex + 1} of {quizQuestions.length}
                  </span>
                  <div className="w-32 bg-[#F7F1E3] h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-[#F4C542] h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${((currentQIndex + 1) / quizQuestions.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-[#FFF8E8] border border-[#F4C542] px-4 py-2 rounded-2xl">
                  <Award className="w-6 h-6 text-[#111111]" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#777777] block">
                      Evaluation Score
                    </span>
                    <span className="text-xl font-black text-[#111111]">{quizScore}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* In-Progress Question Card */}
            {!isSubmitted && currentQ && (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm sm:text-base font-bold text-[#111111] leading-relaxed">
                    <span className="text-[#F4C542] bg-[#111111] px-2 py-0.5 rounded-full text-xs mr-2 font-black">
                      Q{currentQIndex + 1}
                    </span>
                    {currentQ.q}
                  </h4>
                  <button
                    type="button"
                    onClick={() => toggleSpeak(currentQ.q, `q-${currentQIndex}`)}
                    className={`p-2 rounded-full border text-xs flex items-center gap-1 shrink-0 ${
                      speakingId === `q-${currentQIndex}`
                        ? 'bg-[#FFF8E8] text-[#111111] border-[#F4C542]'
                        : 'bg-[#FFFDF7] text-[#777777] border-[#E8E1D2] hover:bg-[#FFF8E8] hover:text-[#111111]'
                    }`}
                    title="Listen to question"
                  >
                    {speakingId === `q-${currentQIndex}` ? (
                      <VolumeX className="w-3.5 h-3.5 text-[#111111] animate-pulse" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-[#777777]" />
                    )}
                  </button>
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-2.5">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[currentQIndex] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(currentQIndex, optIdx)}
                        className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#FFF8E8] border-[#F4C542] text-[#111111] shadow-xs ring-2 ring-[#F4C542]/30'
                            : 'bg-[#FFFFFF] border-[#E8E1D2] text-[#3F3F3F] hover:bg-[#FFFDF7] hover:border-[#D6CCA8]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-[#111111] text-[#F4C542]'
                                : 'bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2]'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#111111] shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Question Navigation Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-[#E8E1D2]">
                  <button
                    type="button"
                    onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))}
                    disabled={currentQIndex === 0}
                    className="btn-secondary text-xs py-2 px-4 disabled:opacity-30"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1.5">
                    {quizQuestions.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => setCurrentQIndex(dotIdx)}
                        className={`h-2.5 rounded-full transition-all ${
                          dotIdx === currentQIndex
                            ? 'bg-[#111111] w-6'
                            : selectedAnswers[dotIdx] !== undefined
                            ? 'bg-[#F4C542] w-2.5'
                            : 'bg-[#E8E1D2] w-2.5'
                        }`}
                      />
                    ))}
                  </div>

                  {currentQIndex < quizQuestions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentQIndex(currentQIndex + 1)}
                      className="btn-primary text-xs py-2 px-5 font-bold"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      className="btn-primary text-xs py-2 px-6 font-extrabold"
                    >
                      Submit Evaluation
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* SUBMITTED EVALUATION SUMMARY & DETAILED DIAGNOSTICS             */}
            {/* ============================================================== */}
            {isSubmitted && (
              <div className="space-y-6 animate-fade-in">
                {savedSuccessMsg && (
                  <div className="p-3.5 bg-[#FFF8E8] border border-[#F4C542] rounded-2xl text-[#111111] text-xs flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span>{savedSuccessMsg}</span>
                  </div>
                )}

                {/* Diagnostics Summary Header */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-5 bg-[#FFFDF7] border border-[#E8E1D2] rounded-2xl text-center">
                    <span className="text-[10px] font-bold uppercase text-[#777777] block">Total Questions</span>
                    <span className="text-2xl font-extrabold text-[#111111]">{quizQuestions.length}</span>
                  </div>
                  <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center">
                    <span className="text-[10px] font-bold uppercase text-emerald-700 block">Correct Answers</span>
                    <span className="text-2xl font-extrabold text-emerald-800">
                      {quizQuestions.filter((q, i) => selectedAnswers[i] === q.correct).length}
                    </span>
                  </div>
                  <div className="p-5 bg-rose-50/70 border border-rose-200 rounded-2xl text-center">
                    <span className="text-[10px] font-bold uppercase text-rose-700 block">Needs Review</span>
                    <span className="text-2xl font-extrabold text-rose-800">
                      {quizQuestions.filter((q, i) => selectedAnswers[i] !== q.correct).length}
                    </span>
                  </div>
                </div>

                {/* Review All Questions with Step-by-Step Educational Solutions */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-sm font-extrabold text-[#111111] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#F4C542]" />
                    <span>Detailed Question-by-Question Diagnostic Review</span>
                  </h4>

                  {quizQuestions.map((q, idx) => {
                    const isCorrect = selectedAnswers[idx] === q.correct;
                    const isSaved = savedConceptMap[idx];
                    const isSaving = savingConceptIdx === idx;

                    return (
                      <div
                        key={idx}
                        className={`p-5 rounded-2xl border text-xs leading-relaxed transition-all ${
                          isCorrect
                            ? 'bg-[#FFFDF7] border-emerald-200'
                            : 'bg-rose-50/30 border-rose-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs ${
                                isCorrect
                                  ? 'bg-[#10B981] text-white'
                                  : 'bg-rose-600 text-white'
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <span
                              className={`font-bold uppercase tracking-wider text-[10px] px-2.5 py-0.5 rounded-full ${
                                isCorrect
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                            {q.keyConcept && (
                              <span className="text-[10px] font-semibold text-[#777777]">
                                Concept: {q.keyConcept}
                              </span>
                            )}
                          </div>

                          {/* Action to store weak concept to memory if missed */}
                          {!isCorrect && (
                            <button
                              type="button"
                              onClick={() => handleSaveWeakConceptToMemory(q, idx)}
                              disabled={isSaved || isSaving}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-colors ${
                                isSaved
                                  ? 'bg-[#FFF8E8] text-[#111111] border border-[#F4C542]'
                                  : 'bg-[#FFFFFF] text-[#3F3F3F] border border-[#E8E1D2] hover:bg-[#FFF8E8] hover:text-[#111111]'
                              }`}
                            >
                              {isSaving ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin text-[#111111]" />
                                  <span>Saving to Memory...</span>
                                </>
                              ) : isSaved ? (
                                <>
                                  <Check className="w-3 h-3 text-[#10B981]" />
                                  <span>Saved to Memory</span>
                                </>
                              ) : (
                                <>
                                  <Brain className="w-3 h-3 text-[#111111]" />
                                  <span>Save to Memory Flashcards</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        <p className="font-bold text-[#111111] text-xs sm:text-sm mb-3">{q.q}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                          {q.options.map((opt, optIdx) => {
                            const isOptCorrect = optIdx === q.correct;
                            const isOptSelected = selectedAnswers[idx] === optIdx;

                            return (
                              <div
                                key={optIdx}
                                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                                  isOptCorrect
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                    : isOptSelected
                                    ? 'bg-rose-50 border-rose-300 text-rose-950 font-semibold'
                                    : 'bg-[#FFFFFF] border-[#E8E1D2] text-[#3F3F3F]'
                                }`}
                              >
                                <span>
                                  <strong className="mr-1.5">{String.fromCharCode(65 + optIdx)}.</strong>
                                  {opt}
                                </span>
                                {isOptCorrect && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                                {!isOptCorrect && isOptSelected && <X className="w-3.5 h-3.5 text-rose-700 shrink-0" />}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        <div className="p-3.5 bg-[#FFF8E8]/50 rounded-xl border border-[#E8E1D2] text-[#3F3F3F] text-xs">
                          <strong className="text-[#111111] block mb-0.5">Explanation:</strong>
                          <p>{q.explanation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Retake / New Topic / Download PDF Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E8E1D2]">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsTakingQuiz(false);
                        setQuizQuestions([]);
                      }}
                      className="btn-secondary text-xs py-2.5 px-4 font-bold"
                    >
                      Evaluate Another Topic
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadActiveQuizPdf}
                      className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-1.5 font-bold"
                      title="Download full quiz questions, answers, and solutions as a PDF"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Download Quiz .PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadActiveQuizCsv}
                      className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-1.5 font-bold"
                      title="Download full quiz questions and answers as a CSV spreadsheet"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-blue-700" />
                      <span>Download Quiz .CSV</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGenerateQuiz(activeQuizTopic)}
                    className="btn-primary text-xs py-2.5 px-5 font-bold flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Generate New Questions on {activeQuizTopic}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* EVALUATION RECORDS HISTORY TABLE                               */}
        {/* ============================================================== */}
        <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl overflow-hidden shadow-xs">
          <div className="px-6 py-5 border-b border-[#E8E1D2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-[#111111] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#F4C542]" />
                <span>Evaluation & Assessment History</span>
              </h3>
              <p className="text-[11px] text-[#777777]">
                Track your quiz scores across courses to measure diagnostic knowledge retention.
              </p>
            </div>

            {/* Download Progress Report Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleExportProgressPdf}
                disabled={assessments.length === 0}
                className="btn-secondary text-xs py-1.5 px-3 font-bold flex items-center gap-1.5 disabled:opacity-40"
                title="Download comprehensive evaluation progress report as PDF"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                <span>Export Progress .PDF</span>
              </button>

              <button
                type="button"
                onClick={handleExportProgressCsv}
                disabled={assessments.length === 0}
                className="btn-secondary text-xs py-1.5 px-3 font-bold flex items-center gap-1.5 disabled:opacity-40"
                title="Download comprehensive evaluation progress report as CSV spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-700" />
                <span>Export Progress .CSV</span>
              </button>

              <span className="text-xs text-[#777777] font-semibold bg-[#FFF8E8] px-3 py-1 rounded-full border border-[#E8E1D2]">
                {assessments.length} records
              </span>
            </div>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF8E8] border-b border-[#E8E1D2] font-bold text-[#111111] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Evaluation Topic / Title</th>
                <th className="px-3 py-3.5 hidden sm:table-cell">Course</th>
                <th className="px-3 py-3.5">Score</th>
                <th className="px-3 py-3.5 hidden md:table-cell">Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D2]/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#777777]">
                    <Loader2 className="w-4 h-4 animate-spin text-[#111111] mx-auto mb-2" />
                    <span>Loading evaluation history...</span>
                  </td>
                </tr>
              ) : assessments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#777777]">
                    No evaluations recorded yet. Generate your first topic quiz above!
                  </td>
                </tr>
              ) : (
                assessments.map((a) => (
                  <tr key={a._id} className="hover:bg-[#FFF8E8]/40 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#111111]">{a.title}</p>
                      <p className="text-[10px] text-[#777777] sm:hidden">{a.course} • {a.date}</p>
                    </td>
                    <td className="px-3 py-4 hidden sm:table-cell">
                      <span className="bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2] px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                        {a.course}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                          a.score.includes('%') && parseInt(a.score, 10) >= 75
                            ? 'bg-emerald-100 text-emerald-800'
                            : a.score.includes('%') && parseInt(a.score, 10) >= 50
                            ? 'bg-[#FFF8E8] text-[#111111] border border-[#F4C542]'
                            : 'bg-[#F7F1E3] text-[#777777]'
                        }`}
                      >
                        {a.score}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-[#777777] hidden md:table-cell">{a.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDownloadRecordPdf(a)}
                          className="p-1.5 text-[#777777] hover:text-emerald-700 rounded-full hover:bg-emerald-50 transition-colors"
                          title="Download Evaluation Report as PDF"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadRecordCsv(a)}
                          className="p-1.5 text-[#777777] hover:text-blue-700 rounded-full hover:bg-blue-50 transition-colors"
                          title="Download Evaluation Report as CSV"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAssessment(a._id)}
                          className="p-1.5 text-[#777777] hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
                          title="Delete record"
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
    </AppLayout>
  );
};
