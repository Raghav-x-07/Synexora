import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import API from '../lib/api';
import { Calendar as CalendarIcon, Plus, Trash2, Clock, Loader2 } from 'lucide-react';

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
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'assignment':
        return 'bg-[#FFF8E8] text-[#111111] border-[#F4C542]';
      case 'lecture':
        return 'bg-[#FFFDF7] text-[#111111] border-[#E8E1D2]';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <span>Academic Schedule & Timetable</span>
            </h1>
            <p className="text-xs text-[#777777] mt-1">Track exam dates, assignment deadlines, and lecture slots in your calendar.</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="btn-primary gap-1.5 self-start sm:self-auto text-xs font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{isAdding ? 'Close Form' : 'Add Event'}</span>
          </button>
        </div>

        {/* Add Event Form */}
        {isAdding && (
          <form onSubmit={handleAddEvent} className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl p-6 space-y-4 shadow-sm animate-fade-in">
            <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">Schedule New Academic Event</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#777777] mb-1">Event Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Midterm Examination"
                  required
                  className="input-clean text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#777777] mb-1">Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                  className="input-clean text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#777777] mb-1">Time</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="e.g. 10:00 AM - 12:00 PM"
                  className="input-clean text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#777777] mb-1">Event Category</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="input-clean text-xs font-medium"
                >
                  <option value="exam">Exam</option>
                  <option value="assignment">Assignment</option>
                  <option value="lecture">Lecture</option>
                  <option value="study">Deep Study Block</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#777777] mb-1">Course</label>
                <input
                  type="text"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  placeholder="e.g. CS 301"
                  className="input-clean text-xs font-medium"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="btn-secondary text-xs py-2 px-4 font-bold"
              >
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-primary text-xs py-2 px-5 font-bold disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Add to Schedule'}
              </button>
            </div>
          </form>
        )}

        {/* Schedule Events List */}
        <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl overflow-hidden shadow-xs">
          <div className="px-6 py-5 border-b border-[#E8E1D2] flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[#111111]">Upcoming Timeline</h2>
            <span className="text-xs text-[#777777] font-semibold">{events.length} scheduled events</span>
          </div>

          <div className="divide-y divide-[#E8E1D2]/60">
            {isLoading ? (
              <div className="p-8 text-center text-[#777777] text-sm flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
                <span>Loading calendar events from database...</span>
              </div>
            ) : events.length === 0 ? (
              <div className="p-8 text-center text-[#777777] text-sm">
                No events scheduled yet. Click "Add Event" above to create your first deadline.
              </div>
            ) : (
              events.map((evt) => (
                <div key={evt._id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-[#FFF8E8]/40 transition-colors gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFF8E8] border border-[#E8E1D2] flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-[10px] uppercase font-bold text-[#777777]">
                        {new Date(evt.date).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-sm font-extrabold text-[#111111]">
                        {new Date(evt.date).getDate() || '--'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-[#111111]">{evt.title}</span>
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getTypeBadge(evt.type)}`}>
                          {evt.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#777777] mt-1">
                        <span className="font-semibold">{evt.course}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{evt.time}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(evt._id)}
                    className="p-1.5 text-[#777777] hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
                    title="Delete event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
