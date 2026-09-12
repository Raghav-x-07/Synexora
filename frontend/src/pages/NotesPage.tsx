import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { StickyNote, Plus, Trash2, Save, Search } from 'lucide-react';

interface NoteItem {
  id: string;
  title: string;
  content: string;
  tag: string;
  updatedAt: string;
}

export const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: '1',
      title: 'Distributed Consensus & Raft Notes',
      content: 'Raft divides time into terms of arbitrary length. Terms are numbered with consecutive integers. Each term begins with an election, in which one or more candidates attempt to become leader.',
      tag: 'CS 301',
      updatedAt: '2026-09-11',
    },
    {
      id: '2',
      title: 'Attention Is All You Need Summary',
      content: 'The Transformer model replaces recurrent layers most commonly used in encoder-decoder architectures with multi-head self-attention mechanisms.',
      tag: 'AI 402',
      updatedAt: '2026-09-09',
    },
  ]);

  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  const [editTitle, setEditTitle] = useState(activeNote?.title || '');
  const [editContent, setEditContent] = useState(activeNote?.content || '');
  const [editTag, setEditTag] = useState(activeNote?.tag || '');

  // Sync editor fields when activeNote changes
  React.useEffect(() => {
    if (activeNote) {
      setEditTitle(activeNote.title);
      setEditContent(activeNote.content);
      setEditTag(activeNote.tag);
    }
  }, [selectedNoteId]);

  const handleCreateNote = () => {
    const newNote: NoteItem = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      tag: 'General',
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
  };

  const handleSaveNote = () => {
    if (!activeNote) return;
    setNotes(
      notes.map((n) =>
        n.id === activeNote.id
          ? {
              ...n,
              title: editTitle || 'Untitled Note',
              content: editContent,
              tag: editTag || 'General',
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : n
      )
    );
  };

  const handleDeleteNote = (id: string) => {
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    if (selectedNoteId === id && remaining.length > 0) {
      setSelectedNoteId(remaining[0].id);
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-green-600" />
              <span>Study Notes</span>
            </h1>
            <p className="text-xs text-slate-500">Capture lecture summaries and study outlines</p>
          </div>
          <button onClick={handleCreateNote} className="btn-primary gap-1.5 text-xs">
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>

        {/* Master-Detail Note View */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[500px]">
          {/* Notes List Column */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter notes..."
                  className="input-clean text-xs pl-8 py-1.5"
                />
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[420px]">
                {filteredNotes.length === 0 ? (
                  <p className="text-xs text-slate-400 p-3 text-center">No notes found.</p>
                ) : (
                  filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNoteId(note.id)}
                      className={`p-2.5 rounded-md cursor-pointer transition-colors border ${
                        note.id === selectedNoteId
                          ? 'bg-green-50/70 border-green-300'
                          : 'border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {note.title}
                        </span>
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {note.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                        {note.content || 'Empty note...'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              {notes.length} notes stored
            </div>
          </div>

          {/* Note Editor Column */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
            {activeNote ? (
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Note Title"
                    className="text-lg font-bold text-slate-900 border-b border-transparent focus:border-green-500 outline-none flex-1 py-1"
                  />
                  <input
                    type="text"
                    value={editTag}
                    onChange={(e) => setEditTag(e.target.value)}
                    placeholder="Tag / Subject"
                    className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 outline-none w-28 text-center"
                  />
                </div>

                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Write your study notes here..."
                  className="w-full flex-1 min-h-[340px] p-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-green-500 font-sans resize-none leading-relaxed"
                />

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-400">Last edited: {activeNote.updatedAt}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteNote(activeNote.id)}
                      className="btn-secondary text-xs text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                    <button onClick={handleSaveNote} className="btn-primary text-xs gap-1.5">
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                <p>No note selected.</p>
                <button onClick={handleCreateNote} className="btn-primary text-xs mt-3">
                  Create First Note
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
