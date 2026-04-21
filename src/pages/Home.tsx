import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { ActionAnimation } from '../components/ActionAnimation';
import { Star, Skull, Trash2, Calendar, BookOpen, Settings, CheckCircle2, Loader2, Download, CheckSquare, Square, X, Archive, DownloadCloud, Zap, TrendingUp, Heart, Bookmark, MessageCircle, Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import JSZipLib from 'jszip';
import type { User } from '@supabase/supabase-js';

// Compatible JSZip reference
const JSZip = (JSZipLib as any).default || JSZipLib;

// --- Components ---

const DashboardCard: React.FC<{ label: string; value: number | string; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    className="clay-card p-6 rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden group border-slate-900/5 bg-white"
  >
    <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br ${color}`} />
    <div className="z-10 flex flex-col items-center text-center">
      <div className="mb-3 p-3 rounded-2xl bg-slate-50 text-slate-800 group-hover:scale-110 transition-transform border-2 border-slate-900/5">
        {icon}
      </div>
      <span className="text-3xl font-black tracking-tighter mb-1 text-slate-900">{value}</span>
      <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{label}</span>
    </div>
  </motion.div>
);


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
  const [nickname, setNickname] = useState(user?.user_metadata?.display_name || '');
  const [avatar, setAvatar] = useState(user?.user_metadata?.avatar_emoji || '👻');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const presets = ['👻', '🐱', '🐶', '🦊', '🐷', '🐸', '🌟', '🔥', '📚', '🚀', '👽', '👾'];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: nickname, avatar_emoji: avatar }
      });
      if (error) throw error;
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.is_anonymous) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
        <div className="glass-card max-w-md w-full rounded-[3rem] p-10 bg-white shadow-2xl relative text-center">
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900">
             <X className="w-6 h-6" />
          </button>
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter">登录以设置资料</h2>
          <p className="text-slate-400 font-bold">请点击右上角或底部导航栏的图标进行注册/登录。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="glass-card max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl relative border-4 border-slate-900">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3 tracking-tighter">
          <Settings className="w-8 h-8 text-brand-blue" /> 个人资料
        </h2>
        <p className="text-sm text-slate-400 font-bold mb-8">定制你的社区专属形象</p>

        {success ? (
          <div className="bg-brand-green/10 border-4 border-brand-green/20 p-8 rounded-[2rem] flex flex-col items-center text-center">
            <CheckCircle2 className="w-16 h-16 text-brand-green mb-4" />
            <h3 className="font-black text-slate-900 mb-1">保存成功</h3>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-slate-900 font-black mb-3">选择头像</label>
              <div className="grid grid-cols-6 gap-3">
                {presets.map(emoji => (
                  <button 
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`w-12 h-12 text-2xl flex items-center justify-center rounded-2xl transition-all btn-bouncy ${avatar === emoji ? 'bg-brand-yellow border-4 border-slate-900 shadow-[2px_2px_0_0_rgba(0,0,0,1)] scale-110' : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-900 font-black mb-3">我的昵称</label>
              <input 
                type="text" 
                required 
                maxLength={20}
                value={nickname} 
                onChange={(e) => setNickname(e.target.value)} 
                className="w-full bg-slate-50 border-4 border-slate-200 px-6 py-4 rounded-2xl outline-none focus:border-brand-yellow focus:bg-white transition-all text-slate-900 font-bold placeholder:text-slate-300" 
                placeholder="例如：不想看书的猫" 
              />
            </div>
            
            <button type="submit" disabled={loading} className="w-full cute-gradient-yellow text-slate-900 font-black py-4 rounded-full shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-4 border-slate-900 hover:translate-y-1 hover:shadow-none transition-all mt-4 tracking-widest text-xl">
              {loading ? "保存中..." : "保存设置"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};


// --- Main Page ---

export const Home: React.FC = () => {
  const { abandonedBooks, removeAbandonedBook, stats: storeStats, fetchUserStats } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [animationType, setAnimationType] = useState<'archive' | 'burn' | null>(location.state?.ritual || null);
  const [activeTab, setActiveTab] = useState<'later' | 'avoid'>('later');
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchUserStats();
    });
  }, [fetchUserStats]);


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
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Icon key={i} className={`w-5 h-5 ${i < absScore ? (score > 0 ? 'text-brand-yellow fill-brand-yellow' : 'text-slate-400 fill-slate-400') : 'text-slate-100 fill-slate-100'}`} />
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
      node.classList.add('export-mode');
      const oldTransform = node.style.transform;
      node.style.transform = 'none';

      const dataUrl = await toPng(node, {
        backgroundColor: '#FFFDF0',
        style: { borderRadius: '48px', transform: 'none' }, // Ensure strict override
        pixelRatio: 2,
        cacheBust: true,
      });

      node.style.transform = oldTransform;
      node.classList.remove('export-mode');
      return dataUrl;
    } catch (e) {
      console.error('Export failed', e);
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
          const base64Data = dataUrl.replace(/^data:image\/[a-z]+;base64,/, "");
          const book = abandonedBooks.find(b => b.id === id);
          const name = book ? `Unread-${book.title}.png` : `Card-${id}.png`;
          zip.file(name, base64Data, { base64: true });
        }
      }
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `我的书单-${Date.now()}.zip`);
      setIsSelectionMode(false);
      setSelectedIds(new Set());
    } catch (err) {
      console.error("Batch Export Failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  const stats = {
    total: abandonedBooks.length,
    later: abandonedBooks.filter(b => b.score > 0).length,
    avoid: abandonedBooks.filter(b => b.score < 0).length,
    likes: storeStats.likes,
    favs: storeStats.favs,
    comments: storeStats.comments
  };


  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-2xl mx-auto pb-40">
      <header className="mb-14 relative flex items-center justify-center">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 uppercase text-center">
          我的 <span className="text-brand-orange underline decoration-brand-yellow decoration-8">书架</span>
        </h1>
        
        <div className="absolute right-0 flex gap-3">
          <button 
            onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedIds(new Set()); }}
            className={`p-3 sm:p-4 glass-card border-slate-900 transition-all btn-bouncy ${isSelectionMode ? 'bg-brand-orange text-white' : 'bg-white text-slate-400 hover:text-slate-600'}`}
          >
            <Archive className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
          <button onClick={() => setShowSettings(true)} className="p-3 sm:p-4 glass-card border-slate-900 bg-white text-slate-400 hover:text-slate-600 transition-all btn-bouncy">
            <Settings className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>
      </header>

      {/* Stats Dashboard */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-14">
        <DashboardCard label="弃读书目" value={stats.total} icon={<Zap className="w-6 h-6 text-brand-yellow" />} color="from-brand-yellow/30" />
        <DashboardCard label="有空再读" value={stats.later} icon={<TrendingUp className="w-6 h-6 text-brand-blue" />} color="from-brand-blue/30" />
        <DashboardCard label="避雷清单" value={stats.avoid} icon={<Skull className="w-6 h-6 text-brand-orange" />} color="from-brand-orange/30" />
        <DashboardCard label="收到点赞" value={stats.likes} icon={<Heart className="w-5 h-5 text-red-400" />} color="from-red-100" />
        <DashboardCard label="被收藏" value={stats.favs} icon={<Bookmark className="w-5 h-5 text-brand-blue" />} color="from-blue-100" />
        <DashboardCard label="评论交流" value={stats.comments} icon={<MessageCircle className="w-5 h-5 text-brand-green" />} color="from-brand-green/20" />
      </section>

      {/* Tabs */}
      <div className="flex gap-10 mb-10 border-b-4 border-slate-900/5 px-2">
        {['later', 'avoid'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-5 px-1 text-lg font-black tracking-widest transition-all relative ${
              activeTab === tab ? 'text-slate-900' : 'text-slate-300 hover:text-slate-400'
            }`}
          >
            {tab === 'later' ? '以后再读' : '避雷日记'}
            {activeTab === tab && (
              <motion.div 
                layoutId="tab-underline" 
                className={`absolute bottom-[-4px] left-0 right-0 h-2 rounded-full ${tab === 'later' ? 'bg-brand-blue' : 'bg-brand-orange'}`} 
              />
            )}
          </button>
        ))}
      </div>

      {displayedBooks.length === 0 ? (
        <div className="py-32 text-center opacity-30 flex flex-col items-center">
          <BookOpen className="w-20 h-20 mb-6 text-slate-200" />
          <p className="text-xl font-black tracking-widest">这里空空如也，快去寻宝吧！</p>
        </div>
      ) : (
        <div className="grid gap-10">
          {displayedBooks.map((book) => (
            <div
              key={book.id + book.abandonedAt}
              id={`book-card-${book.id}`}
              onClick={() => isSelectionMode && toggleSelection(book.id)}
              className={`group glass-card p-10 border-slate-900 transition-all duration-500 relative cursor-pointer btn-bouncy ${
                isSelectionMode && selectedIds.has(book.id) 
                  ? 'bg-brand-yellow/20 scale-[0.98]' 
                  : 'bg-white hover:rotate-1'
              }`}
            >
              {isSelectionMode && (
                <div className="absolute top-8 right-8 z-10 scale-125">
                  {selectedIds.has(book.id) 
                    ? <CheckSquare className="w-8 h-8 text-brand-orange" /> 
                    : <Square className="w-8 h-8 text-slate-200" />
                  }
                </div>
              )}

              <div className="flex gap-10">
                <div className="shrink-0 relative">
                  {book.thumbnail ? (
                    <img 
                      src={book.thumbnail} 
                      alt={book.title} 
                      className="w-32 h-48 object-cover rounded-[2rem] border-4 border-slate-900 shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-32 h-48 bg-slate-50 flex items-center justify-center rounded-[2rem] border-4 border-slate-900 shadow-[8px_8px_0_0_rgba(0,0,0,0.1)]">
                      <BookOpen className="w-16 h-16 text-slate-200" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col">
                  {!isSelectionMode && (
                    <div className="flex justify-end gap-3 mb-2 -mt-4">
                       <button onClick={(e) => { e.stopPropagation(); navigate('/snapshot', { state: { book, isEdit: true, existingData: book } }); }} className="p-3 bg-brand-yellow/10 hover:bg-brand-yellow text-brand-yellow hover:text-slate-900 rounded-2xl transition-all"><Edit className="w-6 h-6" /></button>
                       <button onClick={(e) => { e.stopPropagation(); handleExportSingle(book.id); }} className="p-3 bg-brand-blue/10 hover:bg-brand-blue text-brand-blue hover:text-white rounded-2xl transition-all"><Download className="w-6 h-6" /></button>
                       <button onClick={(e) => { e.stopPropagation(); removeAbandonedBook(book.id); }} className="p-3 bg-brand-red/10 hover:bg-brand-red text-brand-red hover:text-white rounded-2xl transition-all"><Trash2 className="w-6 h-6" /></button>
                    </div>
                  )}
                  
                  <h3 className="text-3xl font-black truncate mb-2 text-slate-900 pr-10">{book.title}</h3>
                  <p className="text-base text-slate-400 mb-6 font-bold">{book.authors?.join(', ') || '未知作者'}</p>
                  
                  <div className="mb-6">
                    {renderRating(book.score)}
                  </div>
                  
                  <div className="mt-auto pt-6 flex flex-wrap items-center gap-4 text-xs font-black tracking-widest text-slate-300 uppercase italic">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(book.abandonedAt)}</span>
                    <span className="opacity-40">●</span>
                    <span className="text-brand-blue">进度: {book.progress || '未记录'}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 p-8 bg-bg-cream rounded-[2.5rem] border-4 border-slate-900 border-dashed relative">
                <div className="absolute -top-6 -left-2 bg-brand-yellow text-slate-900 text-[10px] font-black px-4 py-2 rounded-full border-2 border-slate-900 uppercase tracking-widest">WHY?</div>
                <p className="text-lg text-slate-800 leading-relaxed font-bold italic opacity-90">
                  "{book.reason || '一段无言的心路历程。'}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Batch Export Bar */}
      {isSelectionMode && (
        <motion.div 
          initial={{ y: 150, x: '-50%' }} animate={{ y: 0, x: '-50%' }} exit={{ y: 150, x: '-50%' }}
          className="fixed bottom-10 left-1/2 glass-card border-slate-900 border-4 px-12 py-8 rounded-full shadow-[0_20px_0_0_rgba(0,0,0,0.1)] flex items-center gap-10 z-[100] min-w-[450px]"
        >
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-widest block font-black mb-1">已选宝贝</span>
            <span className="text-4xl font-black text-brand-orange leading-none">{selectedIds.size}</span>
          </div>
          <div className="h-14 w-1 bg-slate-100 rounded-full mx-2" />
          <div className="flex gap-6">
            <button 
              disabled={selectedIds.size === 0 || isExporting}
              onClick={handleBatchExport}
              className="cute-gradient-yellow hover:brightness-110 disabled:opacity-30 text-slate-900 h-20 px-12 rounded-full font-black flex items-center gap-4 transition-all btn-bouncy shadow-lg tracking-widest"
            >
              {isExporting ? <Loader2 className="w-7 h-7 animate-spin" /> : <DownloadCloud className="w-7 h-7" />}
              打包下载
            </button>
            <button onClick={() => setIsSelectionMode(false)} className="w-20 h-20 flex items-center justify-center bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200 transition-all btn-bouncy"><X className="w-10 h-10" /></button>
          </div>
        </motion.div>
      )}

      {showSettings && <SettingsPanel user={user} onClose={() => setShowSettings(false)} />}
      {previewImageUrl && <ImagePreviewModal imageUrl={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />}
      <ActionAnimation type={animationType} onComplete={() => { setAnimationType(null); window.history.replaceState({}, document.title); }} />
    </div>
  );
};
