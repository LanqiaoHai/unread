import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Star, Skull, Trash2, Calendar, BookOpen, Settings, CheckCircle2, Loader2, Download, CheckSquare, Square, X, Archive, DownloadCloud } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import JSZipLib from 'jszip';
import type { User } from '@supabase/supabase-js';

// Compatible JSZip reference
const JSZip = (JSZipLib as any).default || JSZipLib;

// --- Components ---

const ImagePreviewModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => {
  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="relative max-w-lg w-full bg-white rounded-[2rem] overflow-hidden shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="p-10">
          <img src={imageUrl} alt="Export Preview" className="w-full h-auto rounded-xl shadow-lg border border-slate-100" />
          <div className="mt-8 text-center">
            <p className="text-slate-500 font-light text-sm mb-4">长按图片选择“发送到此设备”或“保存图片”</p>
            <button 
              onClick={() => saveAs(imageUrl, 'Unread-Card.png')}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 mx-auto"
            >
              <Download className="w-4 h-4" /> 确认下载
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SettingsPanel: React.FC<{ user: User | null; onClose: () => void }> = ({ user, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  const isAnonymous = user?.is_anonymous ?? true;

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isAnonymous) return;
    
    setLoading(true);
    setFormError('');
    try {
      const { error: updateError } = await supabase.auth.updateUser({ email, password });
      if (updateError) throw updateError;
      setSuccess(true);
    } catch (err: any) {
      setFormError(`绑定失败: ${err.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-xl relative mt-[-10vh]">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">关闭</button>
        <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2"><Settings className="w-6 h-6" /> 设置</h2>
        <p className="text-sm text-slate-500 mb-8">绑定邮箱以在不同设备间同步你的弃读档案。</p>

        {!isAnonymous || success ? (
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex flex-col items-center text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
            <h3 className="font-bold text-emerald-800 mb-1">账号已就位</h3>
            <p className="text-sm text-emerald-600 font-mono text-[10px] mt-2">{user?.email}</p>
          </div>
        ) : (
          <form onSubmit={handleLinkAccount} className="space-y-4">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl outline-none" placeholder="邮箱" />
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl outline-none" placeholder="密码" />
            {formError && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{formError}</p>}
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg">
              {loading ? "处理中..." : "开启云同步"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// --- Main Page ---

export const Home: React.FC = () => {
  const { abandonedBooks, removeAbandonedBook } = useStore();
  const [activeTab, setActiveTab] = useState<'later' | 'avoid'>('later');
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Batch Export States
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const displayedBooks = abandonedBooks.filter((b) => 
    activeTab === 'later' ? b.score > 0 : b.score < 0
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const renderRating = (score: number) => {
    const absScore = Math.abs(score);
    const Icon = score > 0 ? Star : Skull;
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Icon key={i} className={`w-3.5 h-3.5 ${i < absScore ? (score > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-500 fill-slate-500') : 'text-slate-100 fill-slate-100'}`} />
        ))}
      </div>
    );
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const captureCard = async (id: string): Promise<string | null> => {
    const node = document.getElementById(`book-card-${id}`);
    if (!node) return null;
    try {
      return await toPng(node, {
        backgroundColor: '#ffffff',
        style: { borderRadius: '24px' },
        pixelRatio: 2,
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleExportSingle = async (id: string) => {
    const dataUrl = await captureCard(id);
    if (dataUrl) setPreviewImageUrl(dataUrl);
  };

  const handleBatchExport = async () => {
    if (selectedIds.size === 0) return;
    setIsExporting(true);
    const zip = new JSZip();
    
    try {
      for (const id of selectedIds) {
        const dataUrl = await captureCard(id);
        if (dataUrl) {
          const base64Data = dataUrl.replace(/^data:image\/(png|jpg);base64,/, "");
          const book = abandonedBooks.find(b => b.id === id);
          const name = book ? `Unread-${book.title}.png` : `Card-${id}.png`;
          zip.file(name, base64Data, { base64: true });
        }
      }
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `Unread-Batch-${Date.now()}.zip`);
      setIsSelectionMode(false);
      setSelectedIds(new Set());
    } catch (err) {
      console.error("Batch Export Failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <header className="mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-serif font-medium tracking-tight mb-2 text-slate-800">我的书库</h1>
          <p className="text-slate-400 font-light italic">"{displayedBooks.length} 份被妥善安置的灵魂"</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedIds(new Set()); }}
            className={`p-3 rounded-2xl transition-all ${isSelectionMode ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800 hover:bg-white'}`}
            title="批量管理"
          >
            <Archive className="w-5 h-5" />
          </button>
          <button onClick={() => setShowSettings(true)} className="p-3 text-slate-400 hover:text-slate-800 hover:bg-white rounded-full transition-all">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-8 mb-8 border-b border-slate-100">
        {['later', 'avoid'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-4 px-2 text-sm font-bold tracking-widest uppercase transition-all relative ${
              activeTab === tab ? 'text-blue-600' : 'text-slate-300 hover:text-slate-500'
            }`}
          >
            {tab === 'later' ? '有空再读' : '避雷清单'}
            {activeTab === tab && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
        ))}
      </div>

      {displayedBooks.length === 0 ? (
        <div className="py-24 text-center opacity-20">
          <BookOpen className="w-16 h-16 mx-auto mb-4" />
          <p className="font-light tracking-[0.2em]">这里空无一物</p>
        </div>
      ) : (
        <div className="grid gap-6 pb-32">
          {displayedBooks.map((book) => (
            <div
              key={book.id + book.abandonedAt}
              id={`book-card-${book.id}`}
              onClick={() => isSelectionMode && toggleSelection(book.id)}
              className={`group bg-white p-6 rounded-[2.5rem] border transition-all duration-500 relative cursor-pointer ${
                isSelectionMode && selectedIds.has(book.id) 
                  ? 'border-blue-500 shadow-xl bg-blue-50/20 scale-[0.98]' 
                  : 'border-slate-50 shadow-sm hover:shadow-xl hover:border-slate-100'
              }`}
            >
              {/* Selection Overlay */}
              {isSelectionMode && (
                <div className="absolute top-6 right-6 z-10">
                  {selectedIds.has(book.id) ? <CheckSquare className="w-6 h-6 text-blue-600" /> : <Square className="w-6 h-6 text-slate-200" />}
                </div>
              )}

              <div className="flex gap-6">
                <div className="shrink-0 relative">
                  {book.thumbnail ? (
                    <img src={book.thumbnail} alt={book.title} className="w-24 h-36 object-cover rounded-2xl shadow-md group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-24 h-36 bg-slate-50 flex items-center justify-center rounded-2xl border border-slate-100"><BookOpen className="w-10 h-10 text-slate-200" /></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col">
                  {!isSelectionMode && (
                    <div className="flex justify-end mb-2 -mr-2">
                       <button onClick={(e) => { e.stopPropagation(); handleExportSingle(book.id); }} className="p-2 text-slate-200 hover:text-blue-500"><Download className="w-4 h-4" /></button>
                       <button onClick={(e) => { e.stopPropagation(); removeAbandonedBook(book.id); }} className="p-2 text-slate-200 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold truncate mb-1 text-slate-800">{book.title}</h3>
                  <p className="text-sm text-slate-400 mb-2 font-light">{book.authors?.join(', ') || '未知作者'}</p>
                  
                  {renderRating(book.score)}
                  
                  <div className="mt-auto pt-4 flex items-center gap-3 text-[10px] text-slate-300 font-bold tracking-tighter uppercase">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(book.abandonedAt)}</span>
                    <span className="opacity-30">/</span>
                    <span>进度 {book.progress || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-5 bg-slate-50/50 rounded-[1.5rem] border border-slate-50">
                <p className="text-xs text-slate-500 leading-relaxed font-light italic">"{book.reason || '无声的告别。'}"</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Batch Actions Bar */}
      {isSelectionMode && (
        <motion.div 
          initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 px-8 py-5 rounded-full shadow-2xl flex items-center gap-6 z-[100] min-w-[320px]"
        >
          <div className="text-white">
            <span className="text-xs text-slate-400 uppercase tracking-widest block">已选择</span>
            <span className="text-xl font-bold">{selectedIds.size} 项记录</span>
          </div>
          <div className="h-8 w-px bg-slate-700 mx-2" />
          <div className="flex gap-3">
            <button 
              disabled={selectedIds.size === 0 || isExporting}
              onClick={handleBatchExport}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white h-12 px-6 rounded-full font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-5 h-5" />}
              打包导出
            </button>
            <button onClick={() => setIsSelectionMode(false)} className="w-12 h-12 flex items-center justify-center bg-slate-800 text-white rounded-full hover:bg-slate-700 transition-all"><X className="w-5 h-5" /></button>
          </div>
        </motion.div>
      )}

      {showSettings && <SettingsPanel user={user} onClose={() => setShowSettings(false)} />}
      {previewImageUrl && <ImagePreviewModal imageUrl={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />}
    </div>
  );
};
