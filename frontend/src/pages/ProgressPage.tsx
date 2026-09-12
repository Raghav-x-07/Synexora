import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { BarChart3, Plus, Clock, BookOpen, CheckCircle2 } from 'lucide-react';

interface StudyLog {
  id: string;
  subject: string;
  durationMinutes: number;
  date: string;
  topic: string;
}

export const ProgressPage: React.FC = () => {
  const [logs, setLogs] = useState<StudyLog[]>([
    { id: '1', subject: 'CS 301 Distributed Systems', durationMinutes: 120, date: '2026-09-11', topic: 'Raft consensus protocols and cluster setup' },
    { id: '2', subject: 'MATH 201 Calculus', durationMinutes: 90, date: '2026-09-10', topic: 'Integration techniques & problem set #3' },
    { id: '3', subject: 'AI 402 Deep Learning', durationMinutes: 60, date: '2026-09-09', topic: 'Multi-head attention mechanisms review' },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [subject, setSubject] = useState('CS 301 Distributed Systems');
  const [duration, setDuration] = useState('60');
  const [topic, setTopic] = useState('');

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const newLog: StudyLog = {
      id: Date.now().toString(),
      subject,
      durationMinutes: parseInt(duration, 10) || 60,
      date: new Date().toISOString().split('T')[0],
      topic,
    };

    setLogs([newLog, ...logs]);
    setTopic('');
    setIsAdding(false);
  };

  const totalMinutes = logs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <span>Study Progress & Logs</span>
            </h1>
            <p className="text-xs text-slate-500">Track focused study time and daily academic discipline</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="btn-primary gap-1.5 self-start sm:self-auto text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{isAdding ? 'Close Form' : 'Log Study Session'}</span>
          </button>
        </div>

        {/* 3 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Total Hours Logged</span>
              <Clock className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalHours} hrs</p>
            <p className="text-xs text-slate-500 mt-1">Across all logged sessions</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Logged Sessions</span>
              <BookOpen className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{logs.length}</p>
            <p className="text-xs text-slate-500 mt-1">Total study blocks</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Avg Session Length</span>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {logs.length > 0 ? Math.round(totalMinutes / logs.length) : 0} min
            </p>
            <p className="text-xs text-slate-500 mt-1">Mean duration</p>
          </div>
        </div>

        {/* Add Session Form */}
        {isAdding && (
          <form onSubmit={handleAddLog} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Log Focused Study Block</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. CS 301"
                  required
                  className="input-clean text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="60"
                  required
                  className="input-clean text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Topic / Summary</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Reviewed Chapter 3 formulas"
                  required
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
                Save Study Log
              </button>
            </div>
          </form>
        )}

        {/* Study History List */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-800">Study History</h2>
          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{log.subject}</span>
                    <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                      {log.durationMinutes} minutes
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{log.topic}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{log.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
