import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Book as BookIcon, ChevronRight, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ManualAddModal } from '../components/ManualAddModal';
import type { Book } from '../types';

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('book_catalog')
        .select('*')
        .ilike('title', `%${query}%`)
        .limit(20);

      if (error) throw error;
      
      const mappedBooks: Book[] = (data || []).map(b => ({
        id: b.id,
        title: b.title,
        authors: Array.isArray(b.authors) ? b.authors : [],
        thumbnail: b.thumbnail,
        description: ''
      }));
      setResults(mappedBooks);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBook = (book: Book) => {
    navigate('/snapshot', { state: { book } });
  };

  const handleAddManual = (book: Book) => {
    navigate('/snapshot', { state: { book } });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-2xl mx-auto pb-40">
      <header className="mb-14 text-center">
        <h1 className="text-5xl font-black tracking-tighter mb-4 text-slate-900 uppercase">
          查找 <span className="text-brand-blue underline decoration-brand-yellow decoration-8">图书</span>
        </h1>
      </header>

      <form onSubmit={handleSearch} className="relative mb-14 group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入书名、作者或 ISBN..."
          className="w-full bg-white border-4 border-slate-900 px-8 py-6 rounded-full text-xl outline-none focus:ring-8 focus:ring-brand-yellow/30 transition-all font-bold placeholder:text-slate-200"
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-4 top-4 bottom-4 px-10 bg-brand-orange text-white rounded-full font-black flex items-center gap-3 transition-all active:scale-95 btn-bouncy disabled:opacity-50"
        >
          {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <SearchIcon className="w-6 h-6 stroke-[3px]" />}
          <span className="hidden sm:inline">搜索</span>
        </button>
      </form>



      <div className="grid gap-8">
        {results.map((book) => (
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={book.id}
            onClick={() => handleSelectBook(book)}
            className="glass-card group p-8 flex gap-8 items-center cursor-pointer border-slate-900 bg-white hover:bg-slate-50 btn-bouncy"
          >
            <div className="shrink-0 relative">
              {book.thumbnail ? (
                <img 
                  src={book.thumbnail} 
                  alt={book.title} 
                  className="w-24 h-36 object-cover rounded-2xl border-4 border-slate-900 shadow-md group-hover:scale-105 transition-transform duration-500" 
                />
              ) : (
                <div className="w-24 h-36 bg-slate-50 flex items-center justify-center rounded-2xl border-4 border-slate-900">
                  <BookIcon className="w-10 h-10 text-slate-200" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-black truncate text-slate-900 mb-2">{book.title}</h3>
              <p className="text-slate-400 font-bold mb-4">{book.authors?.join(', ') || '未知作者'}</p>
              <p className="text-xs text-brand-orange font-black tracking-widest uppercase italic">点击开始记录</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-brand-yellow transition-colors">
              <ChevronRight className="w-8 h-8 text-slate-400 group-hover:text-slate-900" />
            </div>
          </motion.div>
        ))}
      </div>

      {!loading && !query && (
        <div className="py-20 text-center opacity-30 flex flex-col items-center">
          <Sparkles className="w-20 h-20 mb-6 text-slate-200" />
          <p className="text-xl font-black tracking-widest">在这里，给不想读的书一个归宿。</p>
          <button 
            onClick={() => setIsManualModalOpen(true)}
            className="mt-8 px-10 py-4 border-4 border-slate-900 rounded-2xl font-black hover:bg-slate-900 hover:text-white transition-all btn-bouncy"
          >
            直接手动录入
          </button>
        </div>
      )}

      <ManualAddModal 
        isOpen={isManualModalOpen} 
        onClose={() => setIsManualModalOpen(false)} 
        onAdd={handleAddManual} 
      />
    </div>
  );
};
