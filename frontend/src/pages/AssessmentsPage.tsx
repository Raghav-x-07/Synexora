import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import API from '../lib/api';
import { Award, Plus, CheckCircle2, PlayCircle, RefreshCw, Trash2, Loader2 } from 'lucide-react';

interface AssessmentRecord {
  _id: string;
  title: string;
  course: string;
  date: string;
  score: string;
  status: 'completed' | 'upcoming';
}

const sampleQuiz = [
  {
    q: "In an ACID database transaction, what does the 'I' stand for?",
    options: ["Integrity", "Isolation", "Iteration", "Idempotence"],
    correct: 1,
  },
  {
    q: "What is the worst-case time complexity of quicksort with standard Lomuto partitioning?",
    options: ["O(n log n)", "O(n)", "O(n^2)", "O(log n)"],
    correct: 2,
  },
  {
    q: "Which layer of the OSI model handles TCP and UDP protocols?",
    options: ["Network Layer", "Transport Layer", "Data Link Layer", "Session Layer"],
    correct: 1,
  },
];

export const AssessmentsPage: React.FC = () => {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('CS 301');
  const [newScore, setNewScore] = useState('90%');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleStartQuiz = () => {
    setIsTakingQuiz(true);
    setCurrentQIndex(0);
    setSelectedAnswers([]);
    setQuizScore(null);
  };

  const handleSelectOption = (index: number) => {
    const updated = [...selectedAnswers];
    updated[currentQIndex] = index;
    setSelectedAnswers(updated);
  };

  const handleNextQuestion = async () => {
    if (currentQIndex < sampleQuiz.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      let correctCount = 0;
      selectedAnswers.forEach((ans, idx) => {
        if (ans === sampleQuiz[idx].correct) correctCount++;
      });
      const percent = Math.round((correctCount / sampleQuiz.length) * 100);
      setQuizScore(percent);

      try {
        const res = await API.post('/assessments', {
          title: 'Diagnostic Quiz (Computer Systems)',
          course: 'CS & Algorithms',
          score: `${percent}%`,
          status: 'completed',
        });
        if (res.data.success && res.data.assessment) {
          setAssessments([res.data.assessment, ...assessments]);
        }
      } catch (err) {
        console.error('Save quiz score error:', err);
      }
    }
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await API.post('/assessments', {
        title: newTitle,
        course: newCourse,
        score: newScore || 'Pending',
        status: newScore.includes('%') ? 'completed' : 'upcoming',
      });

      if (res.data.success && res.data.assessment) {
        setAssessments([res.data.assessment, ...assessments]);
        setNewTitle('');
        setIsAdding(false);
      }
    } catch (err) {
      console.error('Add manual assessment error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await API.delete(`/assessments/${id}`);
      if (res.data.success) {
        setAssessments(assessments.filter((a) => a._id !== id));
      }
    } catch (err) {
      console.error('Delete assessment error:', err);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              <span>Assessments & Diagnostic Tests</span>
            </h1>
            <p className="text-xs text-slate-500">Track quiz results and evaluate subject comprehension in MongoDB</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleStartQuiz} className="btn-primary gap-1.5 text-xs">
              <PlayCircle className="w-4 h-4" />
              <span>Take Diagnostic Quiz</span>
            </button>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="btn-secondary gap-1.5 text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Log Score</span>
            </button>
          </div>
        </div>

        {/* Diagnostic Quiz Box */}
        {isTakingQuiz && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                Diagnostic Assessment (Question {currentQIndex + 1} of {sampleQuiz.length})
              </h3>
              <button
                onClick={() => setIsTakingQuiz(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Exit Quiz
              </button>
            </div>

            {quizScore === null ? (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-slate-900">
                  {sampleQuiz[currentQIndex].q}
                </p>

                <div className="space-y-2">
                  {sampleQuiz[currentQIndex].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-3 rounded-md border text-xs font-medium transition-colors ${
                        selectedAnswers[currentQIndex] === idx
                          ? 'bg-green-50 border-green-500 text-green-800'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}. {opt}
                    </button>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextQuestion}
                    disabled={selectedAnswers[currentQIndex] === undefined}
                    className="btn-primary text-xs disabled:opacity-50"
                  >
                    {currentQIndex === sampleQuiz.length - 1 ? 'Finish & Save to Database' : 'Next Question'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
                <h4 className="text-lg font-bold text-slate-900">Quiz Completed</h4>
                <p className="text-sm text-slate-600">Your Diagnostic Score: <strong className="text-green-700 font-black text-xl">{quizScore}%</strong> (Saved to database)</p>
                <button
                  onClick={handleStartQuiz}
                  className="btn-secondary text-xs gap-1.5 inline-flex mt-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retake
                </button>
              </div>
            )}
          </div>
        )}

        {/* Manual Log Score Form */}
        {isAdding && (
          <form onSubmit={handleAddManual} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Log Assessment Score</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Assessment Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Midterm Test 1"
                  required
                  className="input-clean text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Course</label>
                <input
                  type="text"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  placeholder="e.g. CS 301"
                  className="input-clean text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Score / Percentage</label>
                <input
                  type="text"
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                  placeholder="e.g. 95%"
                  className="input-clean text-xs"
                />
              </div>
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
                {isSubmitting ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </form>
        )}

        {/* Assessment Records Table */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <tr>
                  <th className="px-4 py-3">Assessment Name</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                        <span>Loading assessments from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : assessments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">
                      No assessment records saved yet. Take a quiz or click "Log Score" to add one.
                    </td>
                  </tr>
                ) : (
                  assessments.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{item.title}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{item.course}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{item.date}</td>
                      <td className="px-4 py-3 font-semibold text-xs text-slate-900">{item.score}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                            item.status === 'completed'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
