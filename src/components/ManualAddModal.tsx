import React, { useState, useRef } from 'react';
import { X, BookPlus, Upload, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';
import type { Book } from '../types';

interface ManualAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (book: Book) => void;
}

export const ManualAddModal: React.FC<ManualAddModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState<Book>({
    id: '',
    title: '',
    authors: [],
    thumbnail: '',
    description: ''
  });
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageUrl = reader.result as string;
        setFormData(prev => ({ ...prev, thumbnail: imageUrl }));
        
        // Run OCR
        if (!formData.title) {
          setIsOcrRunning(true);
          try {
            const { data: { text } } = await Tesseract.recognize(
              imageUrl,
              'chi_sim+eng',
              { logger: m => console.log(m) }
            );
            
            // Basic cleanup of extracted text (take the first few meaningful lines)
            const cleaned = text.split('\n').map(t => t.trim()).filter(t => t.length > 1).join(' ');
            if (cleaned) {
              setFormData(prev => ({ ...prev, title: cleaned.substring(0, 50) })); // Truncate just in case
            }
          } catch (err) {
            console.error("OCR Failed:", err);
          } finally {
            setIsOcrRunning(false);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    onAdd({
      ...formData,
      id: crypto.randomUUID()
    });
    setFormData({ id: '', title: '', authors: [], thumbnail: '', description: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="glass-card max-w-lg w-full bg-white rounded-[3rem] p-10 shadow-2xl relative border-4 border-slate-900 btn-bouncy max-h-[90vh] overflow-y-auto">
        <button 
          type="button"
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 p-4 text-slate-400 hover:text-slate-900 active:scale-75 transition-all btn-bouncy"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-brand-yellow rounded-2xl text-slate-900 border-2 border-slate-900 shadow-md">
            <BookPlus className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">手动录入书籍</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Custom File Upload Section */}
          <div className="space-y-3">
             <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">图书封面</label>
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="group relative w-32 h-44 bg-slate-50 rounded-[2rem] border-4 border-dashed border-slate-200 hover:border-brand-yellow cursor-pointer overflow-hidden transition-all flex flex-col items-center justify-center gap-2"
             >
               {formData.thumbnail ? (
                 <>
                   <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                     <Upload className="text-white w-8 h-8" />
                   </div>
                 </>
               ) : (
                 <>
                   <span className="text-[10px] font-black text-slate-300 group-hover:text-brand-yellow uppercase tracking-tighter">
                     上传图
                   </span>
                 </>
               )}
               {isOcrRunning && (
                 <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 transition-all">
                    <Loader2 className="w-6 h-6 text-brand-yellow animate-spin" />
                    <span className="text-[10px] font-black text-brand-yellow tracking-widest uppercase">正在识别文字</span>
                 </div>
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

          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">书籍名称 *</label>
              <input
                required
                type="text"
                placeholder="书名"
                className="w-full bg-slate-50 border-4 border-slate-100 px-6 py-4 rounded-[1.5rem] outline-none focus:border-brand-yellow focus:bg-white transition-all font-bold text-slate-900"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">作者</label>
              <input
                type="text"
                placeholder="作者"
                className="w-full bg-slate-50 border-4 border-slate-100 px-6 py-4 rounded-[1.5rem] outline-none focus:border-brand-yellow focus:bg-white transition-all font-bold text-slate-900"
                value={formData.authors.join(', ')}
                onChange={(e) => setFormData(prev => ({ ...prev, authors: e.target.value.split(',').map(a => a.trim()).filter(Boolean) }))}
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">补充简介（可选）</label>
              <textarea
                placeholder="记录一下此刻的想法..."
                rows={3}
                className="w-full bg-slate-50 border-4 border-slate-100 px-6 py-4 rounded-[1.5rem] outline-none focus:border-brand-yellow focus:bg-white transition-all font-bold text-slate-900 resize-none"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full cute-gradient-yellow py-5 text-slate-900 text-xl font-black rounded-full shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-4 border-slate-900 active:translate-y-1 active:shadow-none transition-all tracking-widest"
          >
            完成录入
          </button>
        </form>
      </div>
    </div>
  );
};
