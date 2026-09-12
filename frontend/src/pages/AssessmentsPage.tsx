import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { Award, Plus, CheckCircle2, PlayCircle, RefreshCw } from 'lucide-react';

interface AssessmentRecord {
  id: string;
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
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([
    { id: '1', title: 'Algorithms Quiz 1', course: 'CS 301', date: '2026-09-08', score: '92%', status: 'completed' },
    { id: '2', title: 'Calculus Mid-Term Evaluation', course: 'MATH 201', date: '2026-09-02', score: '88%', status: 'completed' },
    { id: '3', title: 'Deep Learning Diagnostic Quiz', course: 'AI 402', date: '2026-09-17', score: 'Pending', status: 'upcoming' },
  ]);

  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('CS 301');
  const [newScore, setNewScore] = useState('90%');

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

  const handleNextQuestion = () => {
    if (currentQIndex < sampleQuiz.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      // Calculate score
      let correctCount = 0;
      selectedAnswers.forEach((ans, idx) => {
        if (ans === sampleQuiz[idx].correct) correctCount++;
      });
      const percent = Math.round((correctCount / sampleQuiz.length) * 100);
      setQuizScore(percent);

      // Save to assessments list
      const record: AssessmentRecord = {
        id: Date.now().toString(),
        title: 'Quick Diagnostic Quiz',
        course: 'General CS & Engineering',
        date: new Date().toISOString().split('T')[0],
        score: `${percent}%`,
        status: 'completed',
      };
      setAssessments([record, ...assessments]);
    }
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRecord: AssessmentRecord = {
      id: Date.now().toString(),
      title: newTitle,
      course: newCourse,
      date: new Date().toISOString().split('T')[0],
      score: newScore || 'Pending',
      status: newScore.includes('%') ? 'completed' : 'upcoming',
    };

    setAssessments([newRecord, ...assessments]);
    setNewTitle('');
    setIsAdding(false);
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
            <p className="text-xs text-slate-500">Track quiz results and evaluate subject comprehension</p>
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
                    {currentQIndex === sampleQuiz.length - 1 ? 'Finish & Score' : 'Next Question'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
                <h4 className="text-lg font-bold text-slate-900">Quiz Completed</h4>
                <p className="text-sm text-slate-600">Your Diagnostic Score: <strong className="text-green-700 font-black text-xl">{quizScore}%</strong></p>
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
              <button type="submit" className="btn-primary text-xs">
                Save Record
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
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assessments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{item.title}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{item.course}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.date}</td>
                    <td className="px-4 py-3 font-semibold text-xs text-slate-900">{item.score}</td>
                    <td className="px-4 py-3 text-right">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
