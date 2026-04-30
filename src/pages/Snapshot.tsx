import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Loader2, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Book } from '../types';

export const Snapshot: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addAbandonedBook } = useStore();
  const book = location.state?.book as Book;

  const isEdit = location.state?.isEdit || false;
  const existingData = location.state?.existingData;

  const [step, setStep] = useState(1);
  // Correctly get score from navigation state (passed from Search or Manual entry)
  const score = location.state?.book?.score ?? existingData?.score ?? 0;
  const [reason, setReason] = useState(existingData?.reason || location.state?.book?.description || '');
  const [progress, setProgress] = useState(existingData?.progress || '');
  const [isPublic, setIsPublic] = useState(existingData?.isPublic ?? true);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    if (!book) {
      navigate('/search');
    }
  }, [book, navigate]);

  if (!book) {
    return <div className="p-10 text-center font-black">请先选择一本图书。</div>;
  }

  const handleFinish = () => {
    setIsFinishing(true);
    addAbandonedBook({
      ...book,
      abandonedAt: Date.now(),
      score,
      reason,
      progress,
      isPublic
    });
    
    // Quick delay for ritual feel
    setTimeout(() => {
      navigate('/', { state: { ritual: score > 0 ? 'archive' : 'burn' } });
    }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto pb-40">
      <header className="mb-14 text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">
          {isEdit ? '编辑记录' : '创建记录'}
        </h1>
        <div className="flex items-center justify-center gap-4 text-slate-400">
          <div className={`h-3 w-3 rounded-full ${step >= 1 ? 'bg-brand-yellow' : 'bg-slate-100'}`} />
          <div className={`h-3 w-3 rounded-full ${step >= 2 ? 'bg-brand-blue' : 'bg-slate-100'}`} />
          <div className={`h-3 w-3 rounded-full ${step >= 3 ? 'bg-brand-orange' : 'bg-slate-100'}`} />
        </div>
      </header>

      <div className="glass-card p-10 border-slate-900 bg-white relative overflow-hidden">
        {isFinishing && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-in fade-in duration-500">
            <Loader2 className="w-16 h-16 text-brand-orange animate-spin mb-6" />
            <p className="text-2xl font-black text-slate-900 tracking-widest animate-bounce">
              正在处理中...
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">为什么弃读？（这一句真心话会展示在广场上）</label>
                <textarea
                  autoFocus
                  placeholder="说点真心话..."
                  className="w-full bg-slate-50 border-4 border-slate-900 px-8 py-6 rounded-[2.5rem] outline-none min-h-[160px] text-lg font-bold placeholder:text-slate-200 focus:ring-8 focus:ring-brand-blue/20 transition-all"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <button onClick={() => navigate(-1)} className="flex-1 py-5 border-4 border-slate-900 rounded-3xl font-black text-slate-400 hover:text-slate-600 transition-all btn-bouncy">
                  上一步
                </button>
                <button onClick={() => setStep(2)} className="flex-[2] py-5 bg-brand-blue text-white rounded-3xl font-black shadow-lg shadow-brand-blue/20 transition-all btn-bouncy">
                  下一步
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">目前的阅读进度</label>
                  <input
                    type="text"
                    placeholder="例如：第一章、50%..."
                    className="w-full bg-slate-50 border-4 border-slate-900 px-8 py-6 rounded-full outline-none text-xl font-bold focus:ring-8 focus:ring-brand-orange/20 transition-all"
                    value={progress}
                    onChange={(e) => setProgress(e.target.value)}
                  />
                </div>
                
                {/* Community Toggle */}
                <div 
                  onClick={() => setIsPublic(!isPublic)}
                  className={`p-6 rounded-[2rem] border-4 border-slate-900 flex items-center justify-between cursor-pointer transition-all ${isPublic ? 'bg-brand-green/10' : 'bg-slate-50 opacity-50'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl border-2 border-slate-900 ${isPublic ? 'bg-brand-green text-white' : 'bg-white text-slate-300'}`}>
                      <Share2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900">分享到广场</h4>
                      <p className="text-xs font-bold text-slate-400">公开后其他书友可以看到你的评价</p>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full border-4 border-slate-900 flex items-center justify-center transition-all ${isPublic ? 'bg-brand-yellow' : 'bg-white'}`}>
                    {isPublic ? '✓' : ''}
                  </div>
                </div>

                <div className="p-8 bg-bg-cream rounded-[2.5rem] border-4 border-slate-900 border-dashed">
                  <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
                    "{reason || '没有留下任何评论。'}"
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 py-5 border-4 border-slate-900 rounded-3xl font-black text-slate-400 hover:text-slate-600 transition-all btn-bouncy">
                  重写
                </button>
                <button 
                  onClick={handleFinish}
                  className={`flex-[2] py-5 text-white rounded-3xl font-black shadow-lg transition-all btn-bouncy text-xl tracking-widest ${score > 0 ? 'bg-brand-yellow text-slate-900 shadow-brand-yellow/30' : 'bg-brand-orange text-white shadow-brand-orange/30'}`}
                >
                  {score > 0 ? '收纳进书柜' : '丢入焚烧堆'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
