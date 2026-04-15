import React, { useState } from 'react';
import { X, BookPlus } from 'lucide-react';
import type { Book } from '../types';

interface ManualAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (book: Book) => void;
}

export const ManualAddModal: React.FC<ManualAddModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    thumbnail: '',
    description: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const newBook: Book = {
      id: `manual-${Date.now()}`,
      title: formData.title,
      authors: [formData.author || '未知作者'],
      thumbnail: formData.thumbnail || undefined,
      description: formData.description || undefined,
      publishedDate: new Date().getFullYear().toString()
    };

    onAdd(newBook);
    onClose();
    // Reset form
    setFormData({ title: '', author: '', thumbnail: '', description: '' });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 relative overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
            <BookPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">手动导入书籍</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">书名 *</label>
            <input
              type="text"
              required
              placeholder="书名"
              className="w-full bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50/50 transition-all"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">作者</label>
            <input
              type="text"
              placeholder="作者名称"
              className="w-full bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50/50 transition-all"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">封面图片链接 (可选)</label>
            <input
              type="text"
              placeholder="https://..."
              className="w-full bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50/50 transition-all"
              value={formData.thumbnail}
              onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">简略介绍</label>
            <textarea
              placeholder="随便写点什么..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50/50 transition-all resize-none"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
          >
            确认导入
          </button>
        </form>
      </div>
    </div>
  );
};
