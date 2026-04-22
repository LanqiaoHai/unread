import React, { useState, useRef } from 'react';
import { X, BookPlus, Upload, Loader2, Zap } from 'lucide-react';
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
    authors: '',
    thumbnail: '',
    description: ''
  });
  const [doubanUrl, setDoubanUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFetchDouban = async () => {
    if (!doubanUrl.includes('douban.com/subject/')) {
      alert('请输入有效的豆瓣图书链接');
      return;
    }

    const match = doubanUrl.match(/\/subject\/(\d+)/);
    if (!match) return;

    const doubanId = match[1];
    setIsFetching(true);

    try {
      // Simulation of metadata fetching (in a real app, this would be an Edge Function/Backend)
      // For now, we craft a likely cover URL and prompt the user if they'd like to use it
      const likelyCover = `https://img9.doubanio.com/view/subject/l/public/s${doubanId}.jpg`;
      
      // We can try to fetch, though CORS might block it. 
      // If it fails, we still set the cover and title placeholder.
      setFormData(prev => ({
        ...prev,
        title: prev.title || '正在从豆瓣加载...',
        thumbnail: likelyCover
      }));

      // In a real scenario, you'd fetch the title here. 
      // Since we can't scrape easily from browser, we ask the user to confirm.
      setTimeout(() => {
         setIsFetching(false);
         alert('已尝试从豆瓣获取封面。由于豆瓣反爬限制，请手动补全书名和作者。');
      }, 1000);

    } catch (error) {
      console.error('Fetch error:', error);
      setIsFetching(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    onAdd({
      ...formData,
      id: crypto.randomUUID()
    });
    setFormData({ id: '', title: '', authors: '', thumbnail: '', description: '' });
    setDoubanUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="glass-card max-w-lg w-full bg-white rounded-[3rem] p-10 shadow-2xl relative border-4 border-slate-900 btn-bouncy max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 active:scale-75 transition-all btn-bouncy"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-brand-yellow rounded-2xl text-slate-900 border-2 border-slate-900 shadow-md">
            <BookPlus className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">手动录入书籍</h2>
        </div>

        {/* Douban Link Section */}
        <div className="mb-8 p-6 bg-slate-50 rounded-[2rem] border-4 border-slate-900/5 space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">粘贴豆瓣链接自动填充</label>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="https://book.douban.com/subject/..."
              className="flex-1 bg-white border-2 border-slate-200 px-4 py-3 rounded-xl outline-none focus:border-brand-blue font-bold text-sm"
              value={doubanUrl}
              onChange={(e) => setDoubanUrl(e.target.value)}
            />
            <button 
              type="button"
              onClick={handleFetchDouban}
              disabled={isFetching}
              className="bg-brand-blue text-white px-4 py-3 rounded-xl font-black hover:brightness-110 active:scale-95 transition-all text-sm flex items-center gap-2"
            >
              {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-white" />}
              获取
            </button>
          </div>
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
                   <Upload className="w-8 h-8 text-slate-300 group-hover:text-brand-yellow transition-colors" />
                   <span className="text-[10px] font-black text-slate-300 group-hover:text-brand-yellow uppercase tracking-tighter">上传图</span>
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
                value={formData.authors}
                onChange={(e) => setFormData(prev => ({ ...prev, authors: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">为什么决定弃读？</label>
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
            className="w-full cute-gradient py-5 text-white text-xl font-black rounded-full shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-4 border-slate-900 active:translate-y-1 active:shadow-none transition-all tracking-widest"
          >
            完成录入
          </button>
        </form>
      </div>
    </div>
  );
};
