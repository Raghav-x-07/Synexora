import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import API from '../lib/api';
import { Brain, Plus, Trash2, Search, Eye, EyeOff, Loader2 } from 'lucide-react';

interface MemoryCard {
  _id: string;
  concept: string;
  definition: string;
  course: string;
}

export const MemoryPage: React.FC = () => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newConcept, setNewConcept] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [newCourse, setNewCourse] = useState('CS 301');
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCards = async () => {
    try {
      setIsLoading(true);
      const res = await API.get('/memory');
      if (res.data.success && res.data.cards) {
        setCards(res.data.cards);
      }
    } catch (err) {
      console.error('Fetch memory cards error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConcept.trim() || !newDefinition.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await API.post('/memory', {
        concept: newConcept,
        definition: newDefinition,
        course: newCourse || 'General',
      });

      if (res.data.success && res.data.card) {
        setCards([res.data.card, ...cards]);
        setNewConcept('');
        setNewDefinition('');
        setIsAdding(false);
      }
    } catch (err) {
      console.error('Add card error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await API.delete(`/memory/${id}`);
      if (res.data.success) {
        setCards(cards.filter((c) => c._id !== id));
      }
    } catch (err) {
      console.error('Delete concept error:', err);
    }
  };

  const filteredCards = cards.filter(
    (c) =>
      c.concept.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-green-600" />
              <span>Knowledge Memory & Recall</span>
            </h1>
            <p className="text-xs text-slate-500">Core concepts, formulas, and definitions saved to MongoDB</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="btn-primary gap-1.5 self-start sm:self-auto text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{isAdding ? 'Close Form' : 'Add Concept'}</span>
          </button>
        </div>

        {/* Add Form */}
        {isAdding && (
          <form onSubmit={handleAddCard} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Store New Recall Concept</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Concept / Term</label>
                <input
                  type="text"
                  value={newConcept}
                  onChange={(e) => setNewConcept(e.target.value)}
                  placeholder="e.g. Backpropagation"
                  required
                  className="input-clean text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Course / Subject</label>
                <input
                  type="text"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  placeholder="e.g. AI 402"
                  className="input-clean text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Definition / Formula</label>
              <textarea
                value={newDefinition}
                onChange={(e) => setNewDefinition(e.target.value)}
                placeholder="Write the definition or formula..."
                required
                className="input-clean text-xs min-h-[80px]"
              />
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
                {isSubmitting ? 'Saving...' : 'Save Concept'}
              </button>
            </div>
          </form>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concepts or definitions..."
            className="input-clean pl-9 text-xs"
          />
        </div>

        {/* Concepts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <div className="md:col-span-2 p-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-green-600" />
              <span>Loading memory cards from database...</span>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="md:col-span-2 p-8 text-center text-slate-400 text-sm border border-slate-200 rounded-lg">
              No concepts stored in database. Use "Add Concept" to create your first flashcard.
            </div>
          ) : (
            filteredCards.map((card) => {
              const isRevealed = !!revealedIds[card._id];
              return (
                <div
                  key={card._id}
                  className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
                        {card.course}
                      </span>
                      <button
                        onClick={() => handleDelete(card._id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                        title="Delete concept"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-3">{card.concept}</h3>

                    <div className="bg-slate-50 border border-slate-100 rounded p-3 min-h-[60px] text-xs text-slate-700">
                      {isRevealed ? (
                        <p className="leading-relaxed">{card.definition}</p>
                      ) : (
                        <p className="text-slate-400 italic">Definition hidden for self-testing</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => toggleReveal(card._id)}
                      className="btn-secondary text-xs py-1 px-2.5 gap-1.5"
                    >
                      {isRevealed ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Reveal Definition</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
};
