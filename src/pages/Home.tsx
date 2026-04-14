import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Star, Skull, Trash2, Calendar, BookOpen, Settings, Mail, CheckCircle2, Loader2, AlertCircle, Download, Share } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import type { User } from '@supabase/supabase-js';

export const SettingsPanel: React.FC<{ user: User | null; onClose: () => void }> = ({ user, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Check if user already linked an email (not anonymous)
  const isAnonymous = user?.is_anonymous ?? true;

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isAnonymous) return;
    
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.updateUser({
        email,
        password,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      console.error("Link Error:", err);
      if (err.message?.includes('already registered')) {
        setError('该邮箱已被注册，请尝试其他邮箱。');
      } else {
        setError(`绑定失败: ${err.message || '未知错误'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-xl relative mt-[-10vh]">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
        >
          关闭
        </button>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Settings className="w-6 h-6" /> 设置
        </h2>
        <p className="text-sm text-slate-500 mb-8">
          你的数据目前保存在云端并与当前设备临时绑定。绑定邮箱以永久保存。
        </p>

        {!user ? (
          <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-center gap-4 text-amber-700">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <div>
              <p className="font-bold">正在连接云端...</p>
              <p className="text-xs opacity-80">如果长时间卡在此处，请检查 Firebase 配置是否正确。</p>
            </div>
          </div>
        ) : !isAnonymous || success ? (
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex flex-col items-center text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
            <h3 className="font-bold text-emerald-800 mb-1">账号已绑定</h3>
            <p className="text-sm text-emerald-600">你的阅读数据已安全同步到云端。</p>
            {user?.email && <p className="text-xs text-emerald-500 mt-2 font-mono">{user.email}</p>}
          </div>
        ) : (
          <form onSubmit={handleLinkAccount} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                邮箱地址
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50/50 transition-all pl-12"
                  placeholder="your@email.com"
                />
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                设置独立密码
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50/50 transition-all"
                placeholder="至少 6 位字符"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm mt-2 p-3 bg-red-50 rounded-xl">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "绑定账号"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export const Home: React.FC = () => {
  const { abandonedBooks, removeAbandonedBook } = useStore();
  const [activeTab, setActiveTab] = useState<'later' | 'avoid'>('later');
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Listen to current user changes for the settings panel
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    
    // Initial user state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const laterBooks = abandonedBooks.filter((b) => b.score > 0);
  const avoidBooks = abandonedBooks.filter((b) => b.score < 0);

  const displayedBooks = activeTab === 'later' ? laterBooks : avoidBooks;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderRating = (score: number) => {
    const absScore = Math.abs(score);
    const Icon = score > 0 ? Star : Skull;
    const color = score > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-400 fill-slate-400';

    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Icon
            key={i}
            className={`w-4 h-4 ${i < absScore ? color : 'text-slate-100 fill-slate-100'}`}
          />
        ))}
      </div>
    );
  };

  const handleExport = async (bookId: string, bookTitle: string) => {
    const node = document.getElementById(`book-card-${bookId}`);
    if (!node) return;

    try {
      const dataUrl = await toPng(node, {
        backgroundColor: '#ffffff',
        style: {
          borderRadius: '24px',
        },
        pixelRatio: 2,
      });
      saveAs(dataUrl, `Unread-${bookTitle}.png`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <header className="mb-12 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-serif font-medium tracking-tight mb-2">我的书库</h1>
          <p className="text-slate-400 font-light">体面地告别，是为了更纯粹地阅读。</p>
        </div>
        <button 
          onClick={() => setShowSettings(true)}
          className="p-3 text-slate-400 hover:text-slate-800 hover:bg-white rounded-full transition-all"
        >
          <Settings className="w-6 h-6" />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-slate-100">
        <button
          onClick={() => setActiveTab('later')}
          className={`pb-3 px-2 text-sm font-medium transition-all relative ${
            activeTab === 'later' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          有空再读
          {activeTab === 'later' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 animate-in fade-in zoom-in-y-0" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('avoid')}
          className={`pb-3 px-2 text-sm font-medium transition-all relative ${
            activeTab === 'avoid' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          避雷清单
          {activeTab === 'avoid' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800 animate-in fade-in zoom-in-y-0" />
          )}
        </button>
      </div>

      {displayedBooks.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center opacity-40">
          <BookOpen className="w-12 h-12 mb-4 text-slate-300" />
          <p className="font-light">暂无记录</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {displayedBooks.map((book) => (
            <div
              key={book.id + book.abandonedAt}
              id={`book-card-${book.id}`}
              className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex gap-6">
                {book.thumbnail ? (
                  <img
                    src={book.thumbnail}
                    alt={book.title}
                    className="w-20 h-28 object-cover rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-20 h-28 bg-slate-50 flex items-center justify-center rounded-lg border border-slate-100">
                    <BookOpen className="w-8 h-8 text-slate-200" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold truncate leading-tight">{book.title}</h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleExport(book.id, book.title)}
                        className="p-2 text-slate-200 hover:text-blue-500 transition-colors"
                        title="导出图片"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeAbandonedBook(book.id)}
                        className="p-2 text-slate-200 hover:text-red-400 transition-colors"
                        title="删除记录"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-400 mb-3 font-light">
                    {book.authors?.join(', ') || '未知作者'}
                  </p>
                  
                  {renderRating(book.score)}
                  
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>弃读于 {formatDate(book.abandonedAt)}</span>
                      <span className="mx-1 opacity-20">|</span>
                      <span>进度: {book.progress || '未记录'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-50 relative">
                <div className="absolute -top-3 left-6 px-2 bg-white text-[10px] uppercase tracking-widest text-slate-300 font-bold">弃读瞬间</div>
                <p className="text-sm text-slate-600 leading-relaxed font-light italic">
                  "{book.reason || '未留下只言片语。'}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSettings && <SettingsPanel user={user} onClose={() => setShowSettings(false)} />}
    </div>
  );
};
