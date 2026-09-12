import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '../components/AppLayout';
import API from '../lib/api';
import {
  Brain,
  Plus,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Loader2,
  Bot,
  FileText,
  Layers,
} from 'lucide-react';

type MemorySource = 'all' | 'rag' | 'learning-ai' | 'manual';

interface MemoryCard {
  _id: string;
  concept: string;
  definition: string;
  course: string;
  source?: 'learning-ai' | 'rag' | 'manual';
  createdAt?: string;
}

export const MemoryPage: React.FC = () => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MemorySource>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newConcept, setNewConcept] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [newCourse, setNewCourse] = useState('General');
  const [newSource, setNewSource] = useState<'manual' | 'learning-ai' | 'rag'>('manual');
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

  // Helper to accurately resolve card source (including backward compatibility)
  const getCardSource = (card: MemoryCard): 'rag' | 'learning-ai' | 'manual' => {
    if (card.source) return card.source;
    if (
      card.concept.includes(' — ') ||
      card.concept.match(/\.(pdf|docx|txt|md|csv)/i)
    ) {
      return 'rag';
    }
    return 'manual';
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConcept.trim() || !newDefinition.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await API.post('/memory', {
        concept: newConcept,
        definition: newDefinition,
        course: newCourse || 'General',
        source: newSource,
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

  // Section Counts
  const counts = useMemo(() => {
    let rag = 0;
    let learningAi = 0;
    let manual = 0;

    cards.forEach((c) => {
      const src = getCardSource(c);
      if (src === 'rag') rag++;
      else if (src === 'learning-ai') learningAi++;
      else manual++;
    });

    return { all: cards.length, rag, 'learning-ai': learningAi, manual };
  }, [cards]);

  const filteredCards = cards.filter((c) => {
    const src = getCardSource(c);
    if (activeTab !== 'all' && src !== activeTab) {
      return false;
    }

    const q = searchQuery.toLowerCase();
    return (
      c.concept.toLowerCase().includes(q) ||
      c.course.toLowerCase().includes(q) ||
      c.definition.toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-green-600" />
              <span>Knowledge Memory & Recall Hub</span>
            </h1>
            <p className="text-xs text-slate-500">
              Categorized memory vault storing concepts from Ask RAG, Learning AI Tutor, and custom flashcards.
            </p>
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
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Concept / Topic Title</label>
                <input
                  type="text"
                  value={newConcept}
                  onChange={(e) => setNewConcept(e.target.value)}
                  placeholder="e.g. Backpropagation Algorithm"
                  required
                  className="input-clean text-xs"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Course / Tag</label>
                <input
                  type="text"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  placeholder="e.g. CS 301"
                  className="input-clean text-xs"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Memory Section</label>
                <select
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value as any)}
                  className="input-clean text-xs"
                >
                  <option value="manual">Manual Flashcard</option>
                  <option value="learning-ai">Learning AI Tutor</option>
                  <option value="rag">Ask RAG Document</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Explanation / Definition / Notes</label>
              <textarea
                value={newDefinition}
                onChange={(e) => setNewDefinition(e.target.value)}
                placeholder="Write the definition, formula, or summary..."
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
                {isSubmitting ? 'Saving...' : 'Save to Memory'}
              </button>
            </div>
          </form>
        )}

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Memory</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rag')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'rag'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-purple-50 hover:text-purple-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ask RAG Memory</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'rag' ? 'bg-purple-700 text-white' : 'bg-purple-50 text-purple-700 border border-purple-200'
            }`}>
              {counts.rag}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('learning-ai')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'learning-ai'
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-green-50 hover:text-green-700'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Learning AI Memory</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'learning-ai' ? 'bg-green-700 text-white' : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {counts['learning-ai']}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'manual'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Manual Flashcards</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'manual' ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {counts.manual}
            </span>
          </button>
        </div>

        {/* Section Context Info Banner */}
        {activeTab === 'rag' && (
          <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-lg text-xs text-purple-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                Showing answers and summaries saved directly from your uploaded documents via <strong>Ask RAG</strong>.
              </span>
            </div>
            <span className="text-[11px] font-semibold text-purple-700">{counts.rag} saved entries</span>
          </div>
        )}

        {activeTab === 'learning-ai' && (
          <div className="p-3 bg-green-50/60 border border-green-200 rounded-lg text-xs text-green-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-green-600 shrink-0" />
              <span>
                Showing conceptual breakdowns and study explanations stored from the <strong>Learning AI Tutor</strong>.
              </span>
            </div>
            <span className="text-[11px] font-semibold text-green-700">{counts['learning-ai']} saved entries</span>
          </div>
        )}

        {activeTab === 'manual' && (
          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Showing custom flashcard definitions and formulas created manually.
              </span>
            </div>
            <span className="text-[11px] font-semibold text-blue-700">{counts.manual} saved entries</span>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'rag'
                ? 'Search Ask RAG document memory...'
                : activeTab === 'learning-ai'
                ? 'Search Learning AI tutor memory...'
                : 'Search concepts, courses, or definitions...'
            }
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
            <div className="md:col-span-2 p-12 text-center text-slate-400 text-sm border border-slate-200 rounded-lg bg-slate-50/50">
              <Brain className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600 mb-1">
                {activeTab === 'rag'
                  ? 'No Ask RAG memory items found.'
                  : activeTab === 'learning-ai'
                  ? 'No Learning AI memory items found.'
                  : 'No memory concepts found.'}
              </p>
              <p className="text-xs text-slate-400">
                {activeTab === 'rag'
                  ? 'Open the Documents page, ask questions on your uploaded files, and click "Store to Memory".'
                  : activeTab === 'learning-ai'
                  ? 'Open the Learning AI page, chat with the AI tutor, and click "Store to Memory" on any response.'
                  : 'Use "Add Concept" above or store explanations directly from Learning AI or Documents page.'}
              </p>
            </div>
          ) : (
            filteredCards.map((card) => {
              const isRevealed = !!revealedIds[card._id];
              const src = getCardSource(card);

              return (
                <div
                  key={card._id}
                  className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-sm"
                >
                  <div>
                    {/* Card Top Metadata & Source Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Source Badge */}
                        {src === 'rag' ? (
                          <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>Ask RAG</span>
                          </span>
                        ) : src === 'learning-ai' ? (
                          <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200 flex items-center gap-1">
                            <Bot className="w-3 h-3" />
                            <span>Learning AI</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                            <Brain className="w-3 h-3" />
                            <span>Manual Flashcard</span>
                          </span>
                        )}

                        <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          {card.course}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDelete(card._id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete concept"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Concept Title */}
                    <h3 className="text-sm font-bold text-slate-900 mb-3 leading-snug">
                      {card.concept}
                    </h3>

                    {/* Definition / Explanation Body */}
                    <div className="bg-slate-50 border border-slate-100 rounded-md p-3 min-h-[60px] text-xs text-slate-700">
                      {isRevealed ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{card.definition}</p>
                      ) : (
                        <p className="text-slate-400 italic flex items-center gap-1.5">
                          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                          <span>Definition hidden for active recall practice</span>
                        </p>
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

                    {card.createdAt && (
                      <span className="text-[10px] text-slate-400">
                        {new Date(card.createdAt).toLocaleDateString()}
                      </span>
                    )}
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

