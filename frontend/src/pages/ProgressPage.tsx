import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import API from '../lib/api';
import { BarChart3, Plus, Clock, BookOpen, CheckCircle2, Trash2, Loader2 } from 'lucide-react';

interface StudyLog {
  _id: string;
  subject: string;
  durationMinutes: number;
  date: string;
  topic: string;
}

export const ProgressPage: React.FC = () => {
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [totalHours, setTotalHours] = useState('0.0');
  const [avgDuration, setAvgDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [subject, setSubject] = useState('CS 301 Distributed Systems');
  const [duration, setDuration] = useState('60');
  const [topic, setTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProgress = async () => {
    try {
      setIsLoading(true);
      const res = await API.get('/progress');
      if (res.data.success) {
        setLogs(res.data.logs || []);
        setTotalHours(res.data.totalHours || '0.0');
        setAvgDuration(res.data.avgSessionMinutes || 0);
      }
    } catch (err) {
      console.error('Fetch progress error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await API.post('/progress', {
        subject,
        durationMinutes: parseInt(duration, 10) || 60,
        topic,
      });

      if (res.data.success && res.data.log) {
        setTopic('');
        setIsAdding(false);
        fetchProgress();
      }
    } catch (err) {
      console.error('Add study log error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await API.delete(`/progress/${id}`);
      if (res.data.success) {
        fetchProgress();
      }
    } catch (err) {
      console.error('Delete log error:', err);
    }
  };

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
            <p className="text-xs text-slate-500">Track focused study time and daily academic discipline saved to MongoDB</p>
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
            <p className="text-xs text-slate-500 mt-1">Total study blocks in database</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Avg Session Length</span>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{avgDuration} min</p>
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
              <button type="submit" disabled={isSubmitting} className="btn-primary text-xs disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Save Study Log'}
              </button>
            </div>
          </form>
        )}

        {/* Study History List */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-800">Study History</h2>
          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                <span>Loading study history from database...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No study logs saved in database yet. Click "Log Study Session" above to start tracking.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{log.subject}</span>
                      <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        {log.durationMinutes} minutes
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{log.topic}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{log.date}</span>
                    <button
                      onClick={() => handleDelete(log._id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                      title="Delete log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
