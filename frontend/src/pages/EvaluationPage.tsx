import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { AppLayout } from '../components/AppLayout';
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
  FileDown,
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
      const definitionText = `Question: ${q.q}\nCorrect Answer: ${q.options[q.correct]}\n\nExplanation: ${q.explanation}`;

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
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-700/50 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Topic-Driven Knowledge Evaluation
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white mb-2">
            What concept or topic would you like to evaluate today?
          </h2>
          <p className="text-xs text-slate-300 mb-5 max-w-2xl">
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
                <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                  Topic / Concept / Chapter
                </label>
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="e.g. Binary Search Trees, ACID Transactions, Gradient Descent, Thermodynamics..."
                  required
                  disabled={isGenerating}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-600 text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                  Course Domain
                </label>
                <select
                  value={courseInput}
                  onChange={(e) => setCourseInput(e.target.value)}
                  disabled={isGenerating}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-600 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
                <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  disabled={isGenerating}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-600 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                  Questions
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  disabled={isGenerating}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-600 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={8}>8 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>
            </div>

            {/* Quick Topic Suggestion Pills */}
            <div className="flex items-center gap-2 overflow-x-auto text-[11px] pt-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold shrink-0">Popular:</span>
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
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-400/40 text-slate-200 hover:text-emerald-300 shrink-0 transition-all text-[11px]"
                >
                  {pill}
                </button>
              ))}
            </div>

            {generatorError && (
              <div className="p-3 bg-red-500/20 border border-red-400/40 rounded-xl text-red-200 text-xs flex items-center gap-2">
                <X className="w-4 h-4 text-red-400 shrink-0" />
                <span>{generatorError}</span>
              </div>
            )}

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={isGenerating || !topicInput.trim()}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
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
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            {/* Quiz Top Status Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {activeQuizCourse}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-600 capitalize">
                    {difficulty} Difficulty
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">{activeQuizTopic}</h3>
              </div>

              {!isSubmitted ? (
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700">
                    Question {currentQIndex + 1} of {quizQuestions.length}
                  </span>
                  <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${((currentQIndex + 1) / quizQuestions.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
                  <Award className="w-6 h-6 text-emerald-600" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                      Evaluation Score
                    </span>
                    <span className="text-xl font-black text-emerald-900">{quizScore}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* In-Progress Question Card */}
            {!isSubmitted && currentQ && (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                    <span className="text-emerald-600 mr-2">Q{currentQIndex + 1}.</span>
                    {currentQ.q}
                  </h4>
                  <button
                    type="button"
                    onClick={() => toggleSpeak(currentQ.q, `q-${currentQIndex}`)}
                    className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 shrink-0 ${
                      speakingId === `q-${currentQIndex}`
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                    title="Listen to question"
                  >
                    {speakingId === `q-${currentQIndex}` ? (
                      <VolumeX className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-slate-600" />
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
                        className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-400'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Question Navigation Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
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
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          dotIdx === currentQIndex
                            ? 'bg-emerald-600 w-5'
                            : selectedAnswers[dotIdx] !== undefined
                            ? 'bg-emerald-300'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  {currentQIndex < quizQuestions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentQIndex(currentQIndex + 1)}
                      className="btn-primary text-xs py-2 px-5 bg-emerald-600 hover:bg-emerald-700"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      className="btn-primary text-xs py-2 px-6 bg-emerald-600 hover:bg-emerald-700 font-bold"
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
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{savedSuccessMsg}</span>
                  </div>
                )}

                {/* Diagnostics Summary Header */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Questions</span>
                    <span className="text-xl font-bold text-slate-900">{quizQuestions.length}</span>
                  </div>
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <span className="text-[10px] font-bold uppercase text-emerald-600 block">Correct Answers</span>
                    <span className="text-xl font-bold text-emerald-700">
                      {quizQuestions.filter((q, i) => selectedAnswers[i] === q.correct).length}
                    </span>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                    <span className="text-[10px] font-bold uppercase text-red-600 block">Needs Review</span>
                    <span className="text-xl font-bold text-red-700">
                      {quizQuestions.filter((q, i) => selectedAnswers[i] !== q.correct).length}
                    </span>
                  </div>
                </div>

                {/* Review All Questions with Step-by-Step Educational Solutions */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Detailed Question-by-Question Diagnostic Review</span>
                  </h4>

                  {quizQuestions.map((q, idx) => {
                    const isCorrect = selectedAnswers[idx] === q.correct;
                    const isSaved = savedConceptMap[idx];
                    const isSaving = savingConceptIdx === idx;

                    return (
                      <div
                        key={idx}
                        className={`p-5 rounded-xl border text-xs leading-relaxed transition-all ${
                          isCorrect
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-red-50/40 border-red-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-red-600 text-white'
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <span
                              className={`font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded ${
                                isCorrect
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                            {q.keyConcept && (
                              <span className="text-[10px] font-semibold text-slate-500">
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
                              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                                isSaved
                                  ? 'bg-green-100 text-green-800 border border-green-300'
                                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-emerald-50 hover:text-emerald-700'
                              }`}
                            >
                              {isSaving ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                                  <span>Saving to Memory...</span>
                                </>
                              ) : isSaved ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Saved to Memory</span>
                                </>
                              ) : (
                                <>
                                  <Brain className="w-3 h-3 text-emerald-600" />
                                  <span>Save to Memory Flashcards</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        <p className="font-bold text-slate-900 text-xs sm:text-sm mb-3">{q.q}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                          {q.options.map((opt, optIdx) => {
                            const isOptCorrect = optIdx === q.correct;
                            const isOptSelected = selectedAnswers[idx] === optIdx;

                            return (
                              <div
                                key={optIdx}
                                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                                  isOptCorrect
                                    ? 'bg-emerald-100 border-emerald-300 text-emerald-950 font-bold'
                                    : isOptSelected
                                    ? 'bg-red-100 border-red-300 text-red-950'
                                    : 'bg-white border-slate-200 text-slate-600'
                                }`}
                              >
                                <span>
                                  <strong className="mr-1.5">{String.fromCharCode(65 + optIdx)}.</strong>
                                  {opt}
                                </span>
                                {isOptCorrect && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                                {!isOptCorrect && isOptSelected && <X className="w-3.5 h-3.5 text-red-700 shrink-0" />}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 text-xs">
                          <strong className="text-slate-900 block mb-0.5">Explanation:</strong>
                          <p>{q.explanation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Retake / New Topic / Download PDF Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsTakingQuiz(false);
                        setQuizQuestions([]);
                      }}
                      className="btn-secondary text-xs py-2 px-4"
                    >
                      Evaluate Another Topic
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadActiveQuizPdf}
                      className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100 border-emerald-300 font-semibold shadow-xs"
                      title="Download full quiz questions, answers, and solutions as a PDF"
                    >
                      <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Download Quiz PDF Report</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGenerateQuiz(activeQuizTopic)}
                    className="btn-primary text-xs py-2 px-5 bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5"
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
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Evaluation & Assessment History</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Track your quiz scores across courses to measure diagnostic knowledge retention.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">{assessments.length} logged evaluations</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase">
              <tr>
                <th className="px-5 py-3">Evaluation Topic / Title</th>
                <th className="px-3 py-3 hidden sm:table-cell">Course</th>
                <th className="px-3 py-3">Score</th>
                <th className="px-3 py-3 hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600 mx-auto mb-2" />
                    <span>Loading evaluation history...</span>
                  </td>
                </tr>
              ) : assessments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No evaluations recorded yet. Generate your first topic quiz above!
                  </td>
                </tr>
              ) : (
                assessments.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{a.title}</p>
                      <p className="text-[10px] text-slate-400 sm:hidden">{a.course} • {a.date}</p>
                    </td>
                    <td className="px-3 py-3.5 hidden sm:table-cell">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium text-[11px]">
                        {a.course}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          a.score.includes('%') && parseInt(a.score, 10) >= 75
                            ? 'bg-emerald-100 text-emerald-800'
                            : a.score.includes('%') && parseInt(a.score, 10) >= 50
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {a.score}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-slate-500 hidden md:table-cell">{a.date}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDownloadRecordPdf(a)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
                          title="Download Evaluation Report as PDF"
                        >
                          <FileDown className="w-4 h-4 text-emerald-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteAssessment(a._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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
