import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '../components/AppLayout';
import API from '../lib/api';
import {
  FileText,
  Upload,
  Trash2,
  Search,
  Loader2,
  Bot,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCode,
  File,
  X,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Brain,
  Check,
} from 'lucide-react';

interface DocItem {
  _id: string;
  name: string;
  category: string;
  size: string;
  fileType: string;
  uploadDate: string;
}

interface RagMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: string[];
  timestamp: string;
}

export const DocumentsPage: React.FC = () => {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('Computer Science');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // RAG Chat Modal / Drawer state
  const [activeRagDoc, setActiveRagDoc] = useState<DocItem | null>(null);
  const [ragMessages, setRagMessages] = useState<RagMessage[]>([]);
  const [ragInput, setRagInput] = useState('');
  const [isQueryingRag, setIsQueryingRag] = useState(false);
  const [showSources, setShowSources] = useState<Record<string, boolean>>({});

  // Store to Memory state for RAG answers
  const [savingRagMemoryId, setSavingRagMemoryId] = useState<string | null>(null);
  const [savedRagMemoryMap, setSavedRagMemoryMap] = useState<Record<string, boolean>>({});
  const [ragMemoryNotification, setRagMemoryNotification] = useState<string | null>(null);

  const fetchDocs = async () => {
    try {
      setIsLoading(true);
      const res = await API.get('/documents');
      if (res.data.success && res.data.documents) {
        setDocs(res.data.documents);
      }
    } catch (err) {
      console.error('Fetch docs error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadMessage(null);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('category', uploadCategory);

    try {
      const res = await API.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setUploadMessage(res.data.message || 'Document uploaded and indexed successfully!');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchDocs();
        setTimeout(() => setUploadMessage(null), 4000);
      }
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Failed to upload and parse document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await API.delete(`/documents/${id}`);
      if (res.data.success) {
        setDocs(docs.filter((d) => d._id !== id));
        if (activeRagDoc?._id === id) {
          setActiveRagDoc(null);
        }
      }
    } catch (err) {
      console.error('Delete doc error:', err);
    }
  };

  // Open RAG Assistant for a selected document
  const openRagAssistant = (doc: DocItem) => {
    setActiveRagDoc(doc);
    setRagMessages([
      {
        id: '1',
        sender: 'ai',
        text: `Document "${doc.name}" is loaded into the RAG context. Ask me anything about its contents, definitions, or summaries!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Ask RAG Question
  const handleAskRag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragInput.trim() || !activeRagDoc || isQueryingRag) return;

    const question = ragInput.trim();
    const userMsg: RagMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setRagMessages((prev) => [...prev, userMsg]);
    setRagInput('');
    setIsQueryingRag(true);

    try {
      const res = await API.post(`/documents/${activeRagDoc._id}/query`, {
        question,
      });

      if (res.data.success) {
        const aiMsg: RagMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: res.data.answer,
          sources: res.data.retrievedExcerpts || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setRagMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to query document with RAG.';
      setRagMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `[RAG Error: ${errMsg}]`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsQueryingRag(false);
    }
  };

  // Store RAG Answer to Memory
  const handleStoreRagToMemory = async (msgIndex: number, aiMsg: RagMessage) => {
    const fileName = activeRagDoc?.name || 'Document';
    let userQuestion = 'Key Summary & Analysis';

    for (let i = msgIndex - 1; i >= 0; i--) {
      if (ragMessages[i].sender === 'user') {
        userQuestion = ragMessages[i].text.slice(0, 120);
        break;
      }
    }

    // Concept title formatted with File Name & Topic
    const conceptTitle = `${fileName} — ${userQuestion}`;

    setSavingRagMemoryId(aiMsg.id);
    try {
      const res = await API.post('/memory', {
        concept: conceptTitle,
        definition: aiMsg.text,
        course: activeRagDoc?.category || fileName,
        source: 'rag',
      });

      if (res.data.success) {
        setSavedRagMemoryMap((prev) => ({ ...prev, [aiMsg.id]: true }));
        setRagMemoryNotification(`Stored "${conceptTitle.slice(0, 45)}..." in Knowledge Memory!`);
        setTimeout(() => setRagMemoryNotification(null), 3500);
      }
    } catch (err: any) {
      console.error('Store RAG to memory error:', err);
    } finally {
      setSavingRagMemoryId(null);
    }
  };

  const toggleSourceView = (id: string) => {
    setShowSources((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredDocs = docs.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (ext: string) => {
    if (ext === 'pdf') return <FileText className="w-5 h-5 text-red-600" />;
    if (ext === 'docx' || ext === 'doc') return <BookOpen className="w-5 h-5 text-blue-600" />;
    if (ext === 'md' || ext === 'txt') return <FileCode className="w-5 h-5 text-emerald-600" />;
    return <File className="w-5 h-5 text-slate-600" />;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              <span>Documents & RAG Knowledge Hub</span>
            </h1>
            <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
              RAG Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Upload course PDFs, notes, or syllabi and ask AI questions grounded directly in your files.
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Upload className="w-4 h-4 text-green-600" /> Upload New Document for RAG Indexing
          </h2>

          {uploadMessage && (
            <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>{uploadMessage}</span>
            </div>
          )}

          {uploadError && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-7">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md,.csv,.json"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 cursor-pointer"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="input-clean text-xs"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Biomedical">Biomedical</option>
                  <option value="Economics">Economics</option>
                  <option value="General Studies">General Studies</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="w-full btn-primary text-xs py-2 gap-1.5 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Parsing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload & Index</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Supported formats: <strong>.pdf</strong>, <strong>.docx</strong>, <strong>.txt</strong>, <strong>.md</strong>. Max size: 25MB.
            </p>
          </form>
        </div>

        {/* Main Document Grid & RAG Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Documents Table List */}
          <div className={activeRagDoc ? 'lg:col-span-6 space-y-4' : 'lg:col-span-12 space-y-4'}>
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter uploaded documents..."
                  className="input-clean pl-9 text-xs"
                />
              </div>
              <span className="text-xs text-slate-500">{docs.length} documents stored</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase">
                  <tr>
                    <th className="px-4 py-3">Document</th>
                    <th className="px-3 py-3 hidden sm:table-cell">Category</th>
                    <th className="px-3 py-3 hidden md:table-cell">Size</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin text-green-600 mx-auto mb-2" />
                        <span>Loading documents...</span>
                      </td>
                    </tr>
                  ) : filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">
                        No documents found. Upload a file above to start querying with RAG.
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc) => (
                      <tr
                        key={doc._id}
                        className={`hover:bg-slate-50 transition-colors ${
                          activeRagDoc?._id === doc._id ? 'bg-green-50/50' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {getFileIcon(doc.fileType)}
                            <div className="truncate max-w-[200px]">
                              <p className="font-semibold text-slate-900 truncate">{doc.name}</p>
                              <p className="text-[10px] text-slate-400 sm:hidden">{doc.category} • {doc.size}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 hidden sm:table-cell">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium text-[11px]">
                            {doc.category}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-slate-500 hidden md:table-cell">{doc.size}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openRagAssistant(doc)}
                              className="btn-primary text-xs py-1 px-2.5 gap-1 shadow-sm"
                              title="Ask AI questions about this document"
                            >
                              <Bot className="w-3.5 h-3.5" />
                              <span>Ask RAG</span>
                            </button>
                            <button
                              onClick={() => handleDelete(doc._id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Delete document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RAG Interactive Q&A Panel */}
          {activeRagDoc && (
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg flex flex-col h-[600px]">
              {/* Panel Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-lg">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-7 h-7 rounded bg-green-600 flex items-center justify-center text-white shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h3 className="text-xs font-bold text-slate-900 truncate">{activeRagDoc.name}</h3>
                    <p className="text-[10px] text-slate-500">Retrieval-Augmented Generation Grounded Chat</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveRagDoc(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {ragMemoryNotification && (
                <div className="m-3 mb-0 p-2.5 rounded-md bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2 animate-fade-in">
                  <Brain className="w-4 h-4 text-green-600 shrink-0" />
                  <span>{ragMemoryNotification}</span>
                </div>
              )}

              {/* RAG Conversation History */}
              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {ragMessages.map((msg, idx) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0 ${
                        msg.sender === 'user' ? 'bg-slate-800 text-white' : 'bg-green-600 text-white'
                      }`}
                    >
                      {msg.sender === 'user' ? 'U' : 'AI'}
                    </div>

                    <div
                      className={`max-w-md p-3 rounded-lg text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-green-50 text-slate-900 border border-green-200'
                          : 'bg-slate-50 text-slate-800 border border-slate-200'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* Expandable Document Excerpt Sources */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <button
                            type="button"
                            onClick={() => toggleSourceView(msg.id)}
                            className="text-[10px] font-semibold text-green-700 hover:underline flex items-center gap-1"
                          >
                            <span>{msg.sources.length} Context Excerpts Used</span>
                            {showSources[msg.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          {showSources[msg.id] && (
                            <div className="mt-1 space-y-1.5">
                              {msg.sources.map((src, i) => (
                                <div key={i} className="p-2 bg-white rounded border border-slate-200 text-[10px] text-slate-600 font-mono">
                                  <span className="font-bold text-slate-800 block mb-0.5">Excerpt {i + 1}:</span>
                                  {src.slice(0, 180)}...
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-[9px] text-slate-400">{msg.timestamp}</span>

                        {/* Store to Memory button on RAG responses */}
                        {msg.sender === 'ai' && msg.id !== '1' && (
                          <button
                            type="button"
                            onClick={() => handleStoreRagToMemory(idx, msg)}
                            disabled={savingRagMemoryId === msg.id || savedRagMemoryMap[msg.id]}
                            className={`text-[11px] font-medium px-2 py-0.5 rounded border flex items-center gap-1 transition-colors ${
                              savedRagMemoryMap[msg.id]
                                ? 'bg-green-100 text-green-800 border-green-300 cursor-default'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-green-50 hover:border-green-400 hover:text-green-700'
                            }`}
                          >
                            {savingRagMemoryId === msg.id ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-green-600" />
                                <span>Saving...</span>
                              </>
                            ) : savedRagMemoryMap[msg.id] ? (
                              <>
                                <Check className="w-3 h-3 text-green-600" />
                                <span>Stored in Memory</span>
                              </>
                            ) : (
                              <>
                                <Brain className="w-3 h-3 text-green-600" />
                                <span>Store to Memory</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isQueryingRag && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2">
                    <Sparkles className="w-3.5 h-3.5 text-green-600 animate-spin" />
                    <span>Searching document chunks and reasoning with Groq...</span>
                  </div>
                )}
              </div>

              {/* Sample Suggestions */}
              <div className="px-3 py-1.5 border-t border-slate-100 bg-slate-50 flex items-center gap-2 overflow-x-auto text-[11px]">
                <button
                  type="button"
                  onClick={() => setRagInput('Summarize the key points in this document')}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 shrink-0"
                >
                  Summarize Document
                </button>
                <button
                  type="button"
                  onClick={() => setRagInput('What are the main formulas or algorithms described?')}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 shrink-0"
                >
                  Key Formulas
                </button>
                <button
                  type="button"
                  onClick={() => setRagInput('Generate 3 practice questions based on this text')}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 shrink-0"
                >
                  Generate Practice Questions
                </button>
              </div>

              {/* RAG Query Input */}
              <form onSubmit={handleAskRag} className="p-3 border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  value={ragInput}
                  onChange={(e) => setRagInput(e.target.value)}
                  placeholder={`Ask anything about ${activeRagDoc.name}...`}
                  disabled={isQueryingRag}
                  className="input-clean text-xs flex-1 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!ragInput.trim() || isQueryingRag}
                  className="btn-primary text-xs px-3 gap-1 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
