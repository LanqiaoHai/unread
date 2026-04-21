import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Sparkles, Compass, Ghost, Quote, Star, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Explore: React.FC = () => {
  const { publicBooks, fetchPublicBooks, toggleLike } = useStore();
  const [activeTab, setActiveTab] = useState<'community' | 'me'>('community');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicBooks().finally(() => setLoading(false));
  }, [fetchPublicBooks]);

  const handleLike = (id: string) => {
    toggleLike(id);
  };


  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-2xl mx-auto pb-40">
      <header className="mb-14 text-center">
        <h1 className="text-5xl font-black tracking-tighter mb-4 text-slate-900 uppercase">
          书友 <span className="text-brand-green underline decoration-brand-yellow decoration-8">广场</span>
        </h1>
        <p className="text-slate-400 font-bold text-lg">看看大家都在“逃避”什么。</p>
      </header>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-2 rounded-[2rem] mb-12 border-4 border-slate-900 shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]">
        <button 
          onClick={() => setActiveTab('community')}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-black transition-all ${activeTab === 'community' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Compass className="w-6 h-6" /> 社区流
        </button>
        <button 
          onClick={() => setActiveTab('me')}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-black transition-all ${activeTab === 'me' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Ghost className="w-6 h-6" /> 我的动态
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
                    className="flex items-center gap-3 font-black text-sm transition-all btn-bouncy text-slate-300 hover:text-red-500"
                  >
                    <Heart className="w-7 h-7" />
                    {post.likesCount}
                  </button>
                  <button className="flex items-center gap-3 font-black text-sm text-slate-300 hover:text-slate-400 transition-all btn-bouncy">
                    <MessageCircle className="w-7 h-7" />
                    {post.commentsCount}
                  </button>
                </div>
                <button className="p-4 bg-slate-50 hover:bg-brand-blue/10 text-slate-300 hover:text-brand-blue rounded-3xl transition-all btn-bouncy">
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
    </div>
  );
};
