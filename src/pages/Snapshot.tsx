import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Star, Skull, Save, ArrowLeft, BookOpen, Clock } from 'lucide-react';
import type { Book, AbandonedBook } from '../types';
import { ActionAnimation } from '../components/ActionAnimation';

export const Snapshot: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addAbandonedBook } = useStore();
  
  const [book, setBook] = useState<Book | null>(null);
  const [progress, setProgress] = useState('');
  const [reason, setReason] = useState('');
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (location.state?.book) {
      setBook(location.state.book);
    } else {
      // If access directly, go back to search
      navigate('/search');
    }
  }, [location.state, navigate]);

  const [showAnimation, setShowAnimation] = useState(false);

  if (!book) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (score === null) return;

    const abandonedBook: AbandonedBook = {
      ...book,
      abandonedAt: Date.now(),
      progress,
      reason,
      score,
    };

    addAbandonedBook(abandonedBook);
    setShowAnimation(true);
  };

  const handleAnimationComplete = () => {
    navigate('/');
  };

  const RatingButtons = () => {
    // 1 to 5 for "Read Later" (Stars)
    // -1 to -5 for "Avoid" (Skulls)
    return (
      <div className="space-y-8">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Star className="w-3 h-3" /> 值得重读 (1 至 5 星)
          </label>
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setScore(val)}
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${
                  score === val 
                    ? 'bg-amber-50 border-amber-200 text-amber-500 scale-110 shadow-sm' 
                    : 'bg-white border-slate-100 text-slate-300 hover:border-slate-200'
                }`}
              >
                <Star className={`w-6 h-6 ${score === val ? 'fill-amber-500' : ''}`} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Skull className="w-3 h-3" /> 避雷清单 (-1 至 -5 颅骨)
          </label>
          <div className="flex gap-4">
            {[-1, -2, -3, -4, -5].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setScore(val)}
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${
                  score === val 
                    ? 'bg-slate-100 border-slate-300 text-slate-600 scale-110 shadow-sm' 
                    : 'bg-white border-slate-100 text-slate-300 hover:border-slate-200'
                }`}
              >
                <Skull className={`w-6 h-6 ${score === val ? 'fill-slate-600' : ''}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-8 transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> 返回
      </button>

      <header className="mb-10 flex gap-6 items-start">
        {book.thumbnail ? (
          <img src={book.thumbnail} alt={book.title} className="w-24 h-36 object-cover rounded-xl shadow-md border border-slate-100" />
        ) : (
          <div className="w-24 h-36 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-200">
            <BookOpen className="w-10 h-10" />
          </div>
        )}
        <div className="pt-2">
          <h1 className="text-2xl font-bold text-slate-800 leading-tight mb-1">{book.title}</h1>
          <p className="text-slate-400 font-light">{book.authors.join(', ')}</p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <Clock className="w-3 h-3" /> 记录此刻
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10 pb-12">
        <div className="space-y-6">
          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1 transition-colors group-focus-within:text-blue-500">
              当前进度
            </label>
            <input
              type="text"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              placeholder="例如: P.150 或 30%"
              className="w-full bg-white border border-slate-200 px-5 py-3 rounded-xl outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50/50 transition-all shadow-sm"
            />
          </div>

          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1 transition-colors group-focus-within:text-blue-500">
              弃读原因 / 感受
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="为什么决定停下来？是暂不合适，还是书质不佳..."
              rows={4}
              className="w-full bg-white border border-slate-200 px-5 py-3 rounded-xl outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50/50 transition-all shadow-sm resize-none"
            />
          </div>
        </div>

        <RatingButtons />

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={score === null}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all ${
              score !== null 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-[0.98]' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-5 h-5" /> 存档并释放
          </button>
        </div>
      </form>

      {showAnimation && (
        <ActionAnimation 
          type={score! > 0 ? 'shelf' : 'fire'}
          bookCover={book.thumbnail}
          bookTitle={book.title}
          onComplete={handleAnimationComplete}
        />
      )}
    </div>
  );
};
