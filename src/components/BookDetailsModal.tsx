import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Star, Skull, Quote, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import type { Book, AbandonedBook } from '../types';

interface BookDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  onWriteRecord: (book: Book) => void;
}

export const BookDetailsModal: React.FC<BookDetailsModalProps> = ({ isOpen, onClose, book, onWriteRecord }) => {
  const [otherRecords, setOtherRecords] = useState<AbandonedBook[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && book) {
      const fetchRelated = async () => {
        setLoading(true);
        const { data } = await supabase
          .from('books')
          .select('*')
          .eq('title', book.title)
          .eq('is_public', true)
          .order('abandoned_at', { ascending: false });
        
        if (data) {
          setOtherRecords(data.map(b => ({
            ...b,
            abandonedAt: b.abandoned_at,
            username: b.user_display_name,
            score: b.score
          })));
        }
        setLoading(false);
      };
      fetchRelated();
    }
  }, [isOpen, book]);

  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[110] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="glass-card max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl relative border-4 border-slate-900 flex flex-col max-h-[90vh] overflow-hidden"
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 p-4 text-slate-400 hover:text-slate-900 active:scale-75 transition-all btn-bouncy"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="p-8 sm:p-10 border-b-4 border-slate-50 overflow-y-auto shrink-0">
          <div className="flex flex-row gap-8 items-start mb-8">
            <div className="shrink-0">
              <img 
                src={book.thumbnail || 'https://via.placeholder.com/150'} 
                alt="Cover" 
                className="w-24 h-36 sm:w-32 sm:h-48 object-cover rounded-2xl border-4 border-slate-900 shadow-lg" 
              />
            </div>
            <div className="flex-1 min-w-0 pt-2">
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-2 leading-tight">{book.title}</h2>
              <p className="text-slate-400 font-bold text-lg mb-6">{book.authors?.join(', ') || '未知作者'}</p>
              
              <button 
                onClick={() => onWriteRecord(book)}
                className="cute-gradient-yellow px-8 py-4 rounded-2xl border-4 border-slate-900 font-black text-slate-900 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-3"
              >
                <Plus className="w-6 h-6 stroke-[3px]" /> 我也要记一笔
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 sm:p-10 bg-slate-50/50">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-brand-blue" /> 书友评价 ({otherRecords.length})
          </h3>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : otherRecords.length === 0 ? (
            <div className="py-20 text-center opacity-30">
              <p className="font-black tracking-widest">目前还没有书友发表见解</p>
            </div>
          ) : (
            <div className="space-y-6">
              {otherRecords.map((record, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[2rem] border-4 border-slate-900 shadow-sm relative group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full cute-gradient-yellow border-2 border-slate-900 flex items-center justify-center font-black text-xs overflow-hidden shrink-0">
                      {record.user_avatar?.startsWith('http') || record.user_avatar?.startsWith('data:image') ? (
                        <img src={record.user_avatar} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{record.user_avatar || '👻'}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900 text-sm">{record.username || '匿名书友'}</h4>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          record.score > 0 ? (
                            <Star key={i} className={`w-3 h-3 ${i < record.score ? 'text-brand-yellow fill-brand-yellow' : 'text-slate-100 fill-slate-100'}`} />
                          ) : (
                            <Skull key={i} className={`w-3 h-3 ${i < Math.abs(record.score) ? 'text-brand-orange fill-brand-orange' : 'text-slate-100 fill-slate-100'}`} />
                          )
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 bg-slate-50 px-2 py-1 rounded-md uppercase">
                      {new Date(record.abandonedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="p-4 bg-bg-cream rounded-2xl border-2 border-slate-900 border-dashed relative">
                    <Quote className="absolute -top-2 -left-2 w-5 h-5 text-brand-yellow/20" />
                    <p className="text-sm text-slate-700 italic font-bold">"{record.reason || '没有留下碎碎念。'}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
