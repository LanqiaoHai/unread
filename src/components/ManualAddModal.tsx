import React, { useState, useRef } from 'react';
import { X, BookPlus, Upload } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('图片太大了，请上传小于 2MB 的图片（为了节省数据库空间）');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, thumbnail: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-bg-main w-full max-w-md rounded-[3rem] border-4 border-slate-900 shadow-[10px_10px_0_0_rgba(0,0,0,0.1)] p-10 relative overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all btn-bouncy"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 bg-brand-yellow rounded-2xl text-slate-900 border-2 border-slate-900 shadow-md">
            <BookPlus className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">手动录入书籍</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Custom File Upload Section */}
          <div className="space-y-3">
             <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">图书封面</label>
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="w-full aspect-[3/4] max-h-48 bg-white border-4 border-slate-900 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-brand-yellow/5 transition-all group overflow-hidden"
             >
               {formData.thumbnail ? (
                 <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
               ) : (
                 <>
                   <Upload className="w-10 h-10 text-slate-200 group-hover:text-brand-orange mb-3 transition-colors" />
                   <span className="text-sm font-bold text-slate-300">点击上传本地封面图</span>
                 </>
               )}
             </div>
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleFileChange} 
               accept="image/*" 
               className="hidden" 
             />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">书名 *</label>
            <input
              type="text"
              required
              placeholder="这本书叫什么？"
              className="w-full bg-white border-4 border-slate-900 px-6 py-4 rounded-2xl outline-none focus:ring-8 focus:ring-brand-blue/20 transition-all font-bold"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">作者</label>
            <input
              type="text"
              placeholder="作者名称"
              className="w-full bg-white border-4 border-slate-900 px-6 py-4 rounded-2xl outline-none focus:ring-8 focus:ring-brand-blue/20 transition-all font-bold"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-orange text-white font-black py-5 rounded-3xl shadow-lg hover:brightness-110 active:scale-95 transition-all mt-6 text-xl tracking-widest"
          >
            确认加入书柜
          </button>
        </form>
      </div>
    </div>
  );
};

