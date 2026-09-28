import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import API from '../lib/api';
import { StickyNote, Plus, Trash2, Save, Search, Loader2 } from 'lucide-react';

interface NoteItem {
  _id: string;
  title: string;
  content: string;
  tag: string;
  updatedAt: string;
}

export const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNoteId, setSelectedNoteId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const activeNote = notes.find((n) => n._id === selectedNoteId) || notes[0];

  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTag, setEditTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const res = await API.get('/notes');
      if (res.data.success && res.data.notes) {
        setNotes(res.data.notes);
        if (res.data.notes.length > 0 && !selectedNoteId) {
          setSelectedNoteId(res.data.notes[0]._id);
        }
      }
    } catch (err: any) {
      console.error('Fetch notes error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (activeNote) {
      setEditTitle(activeNote.title || '');
      setEditContent(activeNote.content || '');
      setEditTag(activeNote.tag || 'General');
    }
  }, [selectedNoteId, activeNote]);

  const handleCreateNote = async () => {
    try {
      const res = await API.post('/notes', {
        title: 'Untitled Note',
        content: '',
        tag: 'General',
      });
      if (res.data.success && res.data.note) {
        setNotes([res.data.note, ...notes]);
        setSelectedNoteId(res.data.note._id);
      }
    } catch (err) {
      console.error('Create note error:', err);
    }
  };

  const handleSaveNote = async () => {
    if (!activeNote) return;
    setIsSaving(true);
    try {
      const res = await API.put(`/notes/${activeNote._id}`, {
        title: editTitle || 'Untitled Note',
        content: editContent,
        tag: editTag || 'General',
      });
      if (res.data.success && res.data.note) {
        setNotes(notes.map((n) => (n._id === activeNote._id ? res.data.note : n)));
      }
    } catch (err) {
      console.error('Save note error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await API.delete(`/notes/${id}`);
      if (res.data.success) {
        const remaining = notes.filter((n) => n._id !== id);
        setNotes(remaining);
        if (selectedNoteId === id && remaining.length > 0) {
          setSelectedNoteId(remaining[0]._id);
        }
      }
    } catch (err) {
      console.error('Delete note error:', err);
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Top Header */}
        <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold">
                <StickyNote className="w-4 h-4" />
              </div>
              <span>Smart Study Notes</span>
            </h1>
            <p className="text-xs text-[#777777] mt-1">Capture lecture summaries and structured outlines saved to your workspace.</p>
          </div>
          <button onClick={handleCreateNote} className="btn-primary gap-1.5 text-xs font-bold shadow-sm">
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>

        {/* Master-Detail Note View */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 min-h-[550px]">
          {/* Notes List Column */}
          <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl p-4 flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777777]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes..."
                  className="input-clean pl-9 py-2 text-xs font-medium"
                />
              </div>

              <div className="space-y-2 overflow-y-auto max-h-[460px]">
                {isLoading ? (
                  <div className="p-6 text-center text-[#777777] text-xs flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
                    <span>Loading notes...</span>
                  </div>
                ) : filteredNotes.length === 0 ? (
                  <div className="p-6 text-center text-[#777777] text-xs">
                    No notes found. Create your first note above!
                  </div>
                ) : (
                  filteredNotes.map((n) => {
                    const isSelected = activeNote?._id === n._id;
                    return (
                      <div
                        key={n._id}
                        onClick={() => setSelectedNoteId(n._id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FFF8E8] border-[#F4C542] text-[#111111] shadow-xs'
                            : 'bg-[#FFFDF7] border-[#E8E1D2] text-[#3F3F3F] hover:bg-[#FFF8E8]/40 hover:border-[#D6CCA8]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-xs truncate">{n.title || 'Untitled Note'}</h4>
                          <span className="text-[10px] font-bold bg-[#FFFFFF] border border-[#E8E1D2] text-[#777777] px-2 py-0.5 rounded-full">
                            {n.tag || 'General'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#777777] truncate">
                          {n.content || 'Empty note...'}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E1D2] text-[11px] text-[#777777] font-medium text-center">
              {notes.length} total notebook documents
            </div>
          </div>

          {/* Active Note Editor Column */}
          <div className="md:col-span-2 bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl p-6 flex flex-col justify-between shadow-xs">
            {activeNote ? (
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-3 border-b border-[#E8E1D2] pb-3 flex-wrap">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Note Title..."
                    className="text-lg font-extrabold text-[#111111] outline-none bg-transparent flex-1"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editTag}
                      onChange={(e) => setEditTag(e.target.value)}
                      placeholder="Tag / Course"
                      className="input-clean text-xs font-bold py-1.5 px-3 w-32"
                    />
                    <button
                      onClick={handleSaveNote}
                      disabled={isSaving}
                      className="btn-primary py-1.5 px-4 text-xs font-bold flex items-center gap-1.5"
                    >
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#111111]" /> : <Save className="w-3.5 h-3.5" />}
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => handleDeleteNote(activeNote._id)}
                      className="p-2 text-[#777777] hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Start taking notes, outlines, key formulas, or code snippets..."
                  className="w-full flex-1 min-h-[360px] text-xs sm:text-sm text-[#111111] outline-none resize-none bg-transparent leading-relaxed font-normal"
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#777777] text-xs">
                Select or create a note to begin editing.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
