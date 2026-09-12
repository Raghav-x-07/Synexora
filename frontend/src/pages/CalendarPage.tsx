import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import API from '../lib/api';
import { Calendar as CalendarIcon, Plus, Trash2, Clock, Tag, Loader2 } from 'lucide-react';

interface EventItem {
  _id: string;
  title: string;
  date: string;
  time: string;
  type: 'exam' | 'assignment' | 'lecture' | 'study';
  course: string;
}

export const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newType, setNewType] = useState<'exam' | 'assignment' | 'lecture' | 'study'>('study');
  const [newCourse, setNewCourse] = useState('CS 301');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const res = await API.get('/events');
      if (res.data.success && res.data.events) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error('Fetch events error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    setIsSubmitting(true);
    try {
      const res = await API.post('/events', {
        title: newTitle,
        date: newDate,
        time: newTime || 'All Day',
        type: newType,
        course: newCourse || 'General',
      });

      if (res.data.success && res.data.event) {
        setEvents([...events, res.data.event].sort((a, b) => a.date.localeCompare(b.date)));
        setNewTitle('');
        setNewDate('');
        setNewTime('');
        setIsAdding(false);
      }
    } catch (err) {
      console.error('Add event error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await API.delete(`/events/${id}`);
      if (res.data.success) {
        setEvents(events.filter((e) => e._id !== id));
      }
    } catch (err) {
      console.error('Delete event error:', err);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'exam':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'assignment':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'lecture':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-green-600" />
              <span>Academic Schedule & Calendar</span>
            </h1>
            <p className="text-xs text-slate-500">Track exam dates, assignment deadlines, and lecture slots stored in MongoDB</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="btn-primary gap-1.5 self-start sm:self-auto text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{isAdding ? 'Close Form' : 'Add Event'}</span>
          </button>
        </div>

        {/* Add Event Form */}
        {isAdding && (
          <form onSubmit={handleAddEvent} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Schedule New Academic Event</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Event Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Midterm Examination"
                  required
                  className="input-clean text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                  className="input-clean text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Time</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="e.g. 10:00 AM"
                  className="input-clean text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="input-clean text-xs"
                >
                  <option value="exam">Exam</option>
                  <option value="assignment">Assignment Due</option>
                  <option value="lecture">Lecture / Class</option>
                  <option value="study">Study Block</option>
                </select>
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
                {isSubmitting ? 'Saving...' : 'Save Event'}
              </button>
            </div>
          </form>
        )}

        {/* Schedule List */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-800">Upcoming Events ({events.length})</h2>
          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                <span>Loading calendar events from database...</span>
              </div>
            ) : events.length === 0 ? (
              <p className="p-8 text-center text-slate-400 text-sm">No events scheduled. Use the form above to add an event.</p>
            ) : (
              events.map((event) => (
                <div
                  key={event._id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {new Date(event.date).toLocaleDateString([], { month: 'short' })}
                      </span>
                      <span className="text-xs font-black text-slate-900 leading-none">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{event.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {event.time}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5 text-slate-400" /> {event.course}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${getTypeBadge(event.type)}`}>
                      {event.type}
                    </span>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete event"
                    >
                      <Trash2 className="w-4 h-4" />
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
