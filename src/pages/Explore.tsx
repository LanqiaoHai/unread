import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Sparkles, Compass, Ghost, Quote, Star, Loader2, X, Send, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import type { AbandonedBook } from '../types';

export const Explore: React.FC = () => {
  const { publicBooks, fetchPublicBooks, toggleLike, addComment, fetchBookComments } = useStore();
  const [activeTab, setActiveTab] = useState<'community' | 'me'>('community');
  const [loading, setLoading] = useState(true);

  // Comment Drawer State
  const [showComments, setShowComments] = useState(false);
  const [activeBook, setActiveBook] = useState<AbandonedBook | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Toast state for share
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchPublicBooks().finally(() => setLoading(false));
  }, [fetchPublicBooks]);

  const handleLike = (id: string) => {
    toggleLike(id);
  };

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
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  const handleShare = async (book: AbandonedBook) => {
    const shareData = {
      title: `Unread - ${book.title}`,
      text: `正在看《${book.title}》，我的评价是：${book.reason || '很有趣'}`,
      url: window.location.origin
    };

    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) {}
    } else {
      navigator.clipboard.writeText(`${shareData.text} \n发现好书在 Unread: ${shareData.url}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };


  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-2xl mx-auto pb-40">
      <header className="mb-14 text-center">
        <h1 className="text-5xl font-black tracking-tighter mb-4 text-slate-900 uppercase">
          书友 <span className="text-brand-green underline decoration-brand-yellow decoration-8">广场</span>
        </h1>
        <p className="text-slate-400 font-bold text-lg">看看大家都放弃了哪些书。</p>
      </header>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-2 rounded-[2rem] mb-12 border-4 border-slate-900 shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]">
        <button 
          onClick={() => setActiveTab('community')}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-black transition-all ${activeTab === 'community' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Compass className="w-6 h-6" /> 社区
        </button>
        <button 
          onClick={() => setActiveTab('me')}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-black transition-all ${activeTab === 'me' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Ghost className="w-6 h-6" /> 动态
        </button>
      </div>

      {loading ? (
        <div className="py-40 text-center flex flex-col items-center">
          <Loader2 className="w-20 h-20 text-brand-yellow animate-spin" />
        </div>
      ) : activeTab === 'community' ? (
        <div className="space-y-12">
          {publicBooks.map((post) => (
            <div key={post.id} className="clay-card p-10 border-4 border-slate-900 bg-white group hover:translate-y-[-8px] transition-all duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-full cute-gradient-yellow border-4 border-slate-900 flex items-center justify-center font-black text-slate-900 shadow-md uppercase">
                  {post.username?.[0] || '?' }
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-xl">{post.username || '匿名书友'}</h4>
                  <p className="text-xs font-bold text-slate-300 tracking-widest uppercase">
                    {new Date(post.abandonedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-8 mb-8 items-start">
                <img 
                  src={post.thumbnail || 'https://via.placeholder.com/150'} 
                  alt="Cover" 
                  className="w-24 h-36 object-cover rounded-2xl border-4 border-slate-900 shadow-lg group-hover:rotate-2 transition-transform" 
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

              <div className="flex justify-between items-center pt-8 border-t-4 border-slate-900/5">
                <div className="flex gap-6">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-3 font-black text-sm transition-all btn-bouncy ${post.isLiked ? 'text-brand-orange' : 'text-slate-300 hover:text-red-500'}`}
                  >
                    <Heart className={`w-7 h-7 ${post.isLiked ? 'fill-brand-orange' : ''}`} />
                    {post.likesCount}
                  </button>
                  <button 
                    onClick={() => handleOpenComments(post)}
                    className="flex items-center gap-3 font-black text-sm text-slate-300 hover:text-slate-400 transition-all btn-bouncy"
                  >
                    <MessageCircle className="w-7 h-7" />
                    {post.commentsCount}
                  </button>
                </div>
                <button 
                  onClick={() => handleShare(post)}
                  className="p-4 bg-slate-50 hover:bg-brand-blue/10 text-slate-300 hover:text-brand-blue rounded-3xl transition-all btn-bouncy"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (

        <div className="py-40 text-center flex flex-col items-center opacity-20">
          <Sparkles className="w-20 h-20 mb-6 text-slate-200" />
          <p className="text-xl font-black tracking-widest text-slate-900">这里空空如也...</p>
          <p className="text-sm mt-4 text-slate-400 font-bold">你点赞和收藏的内容将出现在这里。</p>
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
              className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white rounded-t-[3rem] border-t-8 border-slate-900 z-[101] flex flex-col h-[70vh] shadow-2xl"
            >
              <div className="p-8 pb-4 flex justify-between items-center bg-white rounded-t-[3rem] sticky top-0 z-10">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">书友评论 ({comments.length})</h3>
                <button 
                  onClick={() => setShowComments(false)}
                  className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 pt-0 space-y-6">
                {comments.length === 0 ? (
                  <div className="py-20 text-center text-slate-300 font-bold">
                    快来抢个沙发吧！
                  </div>
                ) : (
                  comments.map((c: any, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs border-2 border-slate-900/5">
                        {c.user_display_name?.[0] || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-black text-slate-900 text-sm">{c.user_display_name}</span>
                          <span className="text-[10px] font-bold text-slate-200">
                            {new Date(c.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-600 font-bold text-sm leading-relaxed">{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="p-8 bg-slate-50 border-t-4 border-slate-100 flex gap-4 items-center">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="说点什么吧..."
                  className="flex-1 bg-white border-4 border-slate-200 px-6 py-4 rounded-2xl outline-none focus:border-brand-yellow font-bold text-slate-900"
                />
                <button 
                  type="submit"
                  disabled={isPosting || !newComment.trim()}
                  className="p-4 bg-brand-yellow text-slate-900 rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
                >
                  {isPosting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
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
            className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-full font-black flex items-center gap-3 shadow-xl z-[200]"
          >
            <Check className="w-5 h-5 text-brand-green" /> 已复制分享链接
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
