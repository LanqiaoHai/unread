import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Sparkles, Compass, Ghost, Quote, Star, Loader2, X, Send, Check, Zap, Bookmark } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import type { AbandonedBook } from '../types';
import { supabase } from '../lib/supabase';

export const Explore: React.FC = () => {
  const { publicBooks, fetchPublicBooks, toggleLike, toggleFavorite, addComment, fetchBookComments } = useStore();
  const [activeTab, setActiveTab] = useState<'community' | 'me'>('community');
  const [loading, setLoading] = useState(true);

  // Comment Drawer State
  const [showComments, setShowComments] = useState(false);
  const [activeBook, setActiveBook] = useState<AbandonedBook | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Track comments for visible cards to show on-card previews
  const [previews, setPreviews] = useState<Record<string, any[]>>({});
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Toast state for share
  const [showToast, setShowToast] = useState(false);

  // Red dot for 'Me' tab
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    // Basic logic: if total likes/comments on user's books increased since last visit
    if (activeTab === 'community' && publicBooks.length > 0 && currentUser) {
      const myBooks = publicBooks.filter(b => b.uid === currentUser);
      const currentInteractionSum = myBooks.reduce((acc, b) => acc + (b.likesCount || 0) + (b.commentsCount || 0), 0);
      const lastSum = parseInt(localStorage.getItem(`unread_last_interactions_${currentUser}`) || '0');
      
      if (currentInteractionSum > lastSum) {
        setHasUnread(true);
      }
    }
  }, [publicBooks, activeTab, currentUser]);

  const handleTabChange = (tab: 'community' | 'me') => {
    setActiveTab(tab);
    if (tab === 'me' && currentUser) {
      setHasUnread(false);
      const myBooks = publicBooks.filter(b => b.uid === currentUser);
      const currentInteractionSum = myBooks.reduce((acc, b) => acc + (b.likesCount || 0) + (b.commentsCount || 0), 0);
      localStorage.setItem(`unread_last_interactions_${currentUser}`, currentInteractionSum.toString());
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user?.id || null);
      await fetchPublicBooks();
      setLoading(false);
    };
    init();
  }, [fetchPublicBooks]);

  // Fetch previews for the books
  useEffect(() => {
    if (publicBooks.length > 0) {
      const fetchPreviews = async () => {
        const newPreviews: Record<string, any[]> = {};
        for (const book of publicBooks) {
          const data = await fetchBookComments(book.id);
          newPreviews[book.id] = data.slice(-2); // Get last 2
        }
        setPreviews(newPreviews);
      };
      fetchPreviews();
    }
  }, [publicBooks, fetchBookComments]);


  const handleOpenComments = async (book: AbandonedBook) => {
    setActiveBook(book);
    setShowComments(true);
    const data = await fetchBookComments(book.id);
    setComments(data);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !activeBook || isPosting) return;

    setIsPosting(true);
    try {
      await addComment(activeBook.id, newComment);
      setNewComment('');
      const updated = await fetchBookComments(activeBook.id);
      setComments(updated);
      // Update preview immediately
      setPreviews(prev => ({ ...prev, [activeBook.id]: updated.slice(-2) }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  const handleShare = async (book: AbandonedBook) => {
    const shareData = {
      title: `Unread - ${book.title}`,
      text: `最近在读《${book.title}》，我的真实想法是：${book.reason || '真的很值得一看'}`,
      url: window.location.origin
    };

    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) {}
    } else {
      navigator.clipboard.writeText(`${shareData.text} \n快来 Unread 看看大家都在读什么: ${shareData.url}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const filteredBooks = activeTab === 'community' 
    ? publicBooks 
    : publicBooks.filter(b => b.uid === currentUser || b.isFavorited);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-2xl mx-auto pb-40 px-4">
      <header className="mb-14 text-center">
        <h1 className="text-5xl font-black tracking-tighter mb-4 text-slate-900 uppercase">
          书友 <span className="text-brand-green underline decoration-brand-yellow decoration-8">广场</span>
        </h1>
        <p className="text-slate-400 font-bold text-lg">这里的每一本书籍，都有一个未完待续的故事。</p>
      </header>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-2 rounded-[2rem] mb-12 border-4 border-slate-900 shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] overflow-hidden">
        <button 
          onClick={() => handleTabChange('community')}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-black transition-all ${activeTab === 'community' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Compass className="w-6 h-6" /> 社区大家庭
        </button>
        <button 
          onClick={() => handleTabChange('me')}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-black transition-all relative ${activeTab === 'me' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Ghost className="w-6 h-6" /> 
          我的动态
          {hasUnread && (
            <span className="absolute top-3 right-8 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
      </div>

      {loading ? (
        <div className="py-40 text-center flex flex-col items-center">
          <Loader2 className="w-20 h-20 text-brand-yellow animate-spin" />
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="py-40 text-center flex flex-col items-center opacity-30">
          <Sparkles className="w-20 h-20 mb-6 text-slate-200" />
          <p className="text-xl font-black tracking-widest text-slate-900">{activeTab === 'me' ? '你还没有发布过动态哦' : '书库目前空空如也'}</p>
        </div>
      ) : (
        <div className="space-y-12">
          {filteredBooks.map((post) => (
            <div key={post.id} className="clay-card p-10 border-4 border-slate-900 bg-white group hover:translate-y-[-8px] transition-all duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-full cute-gradient-yellow border-4 border-slate-900 flex items-center justify-center font-black text-slate-900 shadow-md uppercase overflow-hidden shrink-0">
                  {post.user_avatar?.startsWith('http') ? (
                    <img src={post.user_avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-2xl">{post.user_avatar || '👻'}</div>
                  )}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-xl">{post.username || post.user_display_name || '匿名书友'}</h4>
                  <p className="text-xs font-bold text-slate-300 tracking-widest uppercase">
                    {new Date(post.abandonedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-8 mb-8 items-start">
                <img 
                  src={post.thumbnail || 'https://via.placeholder.com/150'} 
                  alt="Cover" 
                  className="w-full sm:w-32 aspect-[2/3] object-cover rounded-2xl border-4 border-slate-900 shadow-lg group-hover:rotate-2 transition-transform" 
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{post.title}</h3>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.abs(post.score || 0) ? (post.score > 0 ? 'text-brand-yellow fill-brand-yellow' : 'text-slate-400 fill-slate-400') : 'text-slate-100 fill-slate-100'}`} />
                    ))}
                  </div>
                  <div className="p-6 bg-bg-cream rounded-[2rem] border-4 border-slate-900 border-dashed relative">
                    <Quote className="absolute -top-3 -left-3 w-8 h-8 text-brand-yellow/30" />
                    <p className="text-base text-slate-700 italic font-bold leading-relaxed">
                      "{post.reason || '没有留下碎碎念。'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* On-Card Comment Preview */}
              {previews[post.id]?.length > 0 && (
                <div className="mb-0 mt-8 p-6 bg-slate-50 rounded-[2rem] border-4 border-slate-900/5 space-y-4">
                  {previews[post.id].map((c: any, idx: number) => (
                    <div key={idx} className="flex gap-3 items-start animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                      <span className="font-black text-brand-orange text-xs shrink-0 mt-1">{c.user_display_name}:</span>
                      <p className="text-sm text-slate-500 font-bold leading-tight">{c.content}</p>
                    </div>
                  ))}
                  {(post.commentsCount || 0) > 2 && (
                    <button 
                      onClick={() => handleOpenComments(post)} 
                      className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-brand-blue transition-colors flex items-center gap-1"
                    >
                      查看全部 {post.commentsCount} 条交流 <Zap className="w-3 h-3 text-brand-yellow" />
                    </button>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center pt-8 mt-8 border-t-4 border-slate-900/5">
                <div className="flex gap-6">
                  <button 
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-3 font-black text-sm transition-all btn-bouncy ${post.isLiked ? 'text-brand-orange' : 'text-slate-200 hover:text-brand-orange'}`}
                  >
                    <Heart className={`w-8 h-8 ${post.isLiked ? 'fill-brand-orange' : ''}`} />
                    <span className="text-xl">{post.likesCount}</span>
                  </button>
                  <button 
                    onClick={() => toggleFavorite(post.id)}
                    className={`flex items-center gap-3 font-black text-sm transition-all btn-bouncy ${post.isFavorited ? 'text-brand-blue' : 'text-slate-200 hover:text-brand-blue'}`}
                  >
                    <Bookmark className={`w-8 h-8 ${post.isFavorited ? 'fill-brand-blue' : ''}`} />
                  </button>
                  <button 
                    onClick={() => handleOpenComments(post)}
                    className="flex items-center gap-3 font-black text-sm text-slate-200 hover:text-slate-400 transition-all btn-bouncy"
                  >
                    <MessageCircle className="w-8 h-8" />
                    <span className="text-xl">{post.commentsCount}</span>
                  </button>
                </div>
                <button 
                  onClick={() => handleShare(post)}
                  className="p-4 bg-slate-50 hover:bg-brand-blue/10 text-slate-200 hover:text-brand-blue rounded-3xl transition-all btn-bouncy border-2 border-transparent hover:border-brand-blue/20"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-up Comment Drawer */}
      <AnimatePresence>
        {showComments && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComments(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white rounded-t-[3.5rem] border-t-8 border-slate-900 z-[101] flex flex-col h-[75vh] shadow-2xl overflow-hidden"
            >
              <div className="p-10 pb-6 flex justify-between items-center bg-white sticky top-0 z-10 border-b-4 border-slate-50">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter">书友交流</h3>
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-1">共 {comments.length} 条见解</p>
                </div>
                <button 
                  onClick={() => setShowComments(false)}
                  className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 pt-6 space-y-8 scroll-smooth">
                {comments.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl">📭</div>
                    <p className="text-slate-300 font-black tracking-widest">快来抢占沙发，分享你的共鸣...</p>
                  </div>
                ) : (
                  comments.map((c: any, idx: number) => (
                    <div key={idx} className="flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-lg border-2 border-slate-900/5 shrink-0 uppercase tracking-tighter">
                        {c.user_display_name?.[0] || '匿'}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-black text-slate-900 text-md">{c.user_display_name}</span>
                          <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">
                            {new Date(c.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-600 font-bold text-md leading-relaxed whitespace-pre-wrap">{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="p-10 bg-slate-50 border-t-8 border-slate-100 flex gap-4 items-center">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="友善交流，分享阅读共鸣..."
                    className="w-full bg-white border-4 border-slate-200 px-8 py-5 rounded-[2rem] outline-none focus:border-brand-yellow focus:ring-8 focus:ring-brand-yellow/10 font-bold text-slate-900 transition-all text-lg placeholder:text-slate-200"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isPosting || !newComment.trim()}
                  className="p-5 bg-brand-yellow text-slate-900 rounded-[1.5rem] border-4 border-slate-900 shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 btn-bouncy"
                >
                  {isPosting ? <Loader2 className="w-8 h-8 animate-spin" /> : <Send className="w-8 h-8" />}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Copy Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-10 py-5 rounded-full font-black flex items-center gap-4 shadow-2xl z-[200] border-4 border-white/10"
          >
            <div className="w-8 h-8 bg-brand-green/20 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-brand-green" />
            </div>
            已复制分享文案，快去分享给好友吧！
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
