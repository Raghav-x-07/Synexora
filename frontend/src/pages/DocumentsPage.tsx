import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { FileText, Plus, Trash2, Download, Search } from 'lucide-react';

interface DocItem {
  id: string;
  name: string;
  category: string;
  size: string;
  uploadDate: string;
}

export const DocumentsPage: React.FC = () => {
  const [docs, setDocs] = useState<DocItem[]>([
    { id: '1', name: 'CS301_Distributed_Systems_Syllabus.pdf', category: 'Computer Science', size: '1.2 MB', uploadDate: '2026-09-10' },
    { id: '2', name: 'Neural_Networks_Cheatsheet.pdf', category: 'AI & Machine Learning', size: '850 KB', uploadDate: '2026-09-08' },
    { id: '3', name: 'Linear_Algebra_Eigenvalues_Notes.docx', category: 'Mathematics', size: '420 KB', uploadDate: '2026-09-05' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [docName, setDocName] = useState('');
  const [category, setCategory] = useState('Computer Science');

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    const newDoc: DocItem = {
      id: Date.now().toString(),
      name: docName.endsWith('.pdf') || docName.endsWith('.docx') ? docName : `${docName}.pdf`,
      category,
      size: '500 KB',
      uploadDate: new Date().toISOString().split('T')[0],
    };

    setDocs([newDoc, ...docs]);
    setDocName('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    setDocs(docs.filter(d => d.id !== id));
  };

  const filteredDocs = docs.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              <span>Course Documents</span>
            </h1>
            <p className="text-xs text-slate-500">
              Manage study guides, lecture PDFs, and research papers
            </p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="btn-primary gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{isAdding ? 'Close Form' : 'Add Document'}</span>
          </button>
        </div>

        {/* Add Document Form */}
        {isAdding && (
          <form onSubmit={handleAddDoc} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Add New Document Entry</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Document Title</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Operating_Systems_Lecture1.pdf"
                  required
                  className="input-clean"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Subject / Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Computer Science"
                  required
                  className="input-clean"
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
                Save Document
              </button>
            </div>
          </form>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by name or subject..."
            className="input-clean pl-9"
          />
        </div>

        {/* Documents Table */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <tr>
                  <th className="px-4 py-3">Document Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Date Added</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">
                      No documents found. Click "Add Document" to store a new file.
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-600 shrink-0" />
                        <span className="truncate max-w-xs">{doc.name}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{doc.size}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{doc.uploadDate}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => alert(`Downloading ${doc.name}...`)}
                            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>
    </AppLayout>
  );
};
