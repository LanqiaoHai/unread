import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Loader2, BookPlus, AlertCircle, Edit3, ArrowRight } from 'lucide-react';
import type { Book } from '../types';
import { ManualAddModal } from '../components/ManualAddModal';

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    const mirrors = [
      `https://douban.861000.xyz/q/${encodeURIComponent(query)}`,
      `https://douban-api-proxy.vercel.app/api/book/search?q=${encodeURIComponent(query)}`
    ];

    let success = false;
    for (const url of mirrors) {
      if (success) break;
      try {
        const response = await fetch(url);
        if (!response.ok) continue;
        const data = await response.json();
        
        const items = data.books || data.items || [];
        if (items.length === 0) continue;

        const books: Book[] = items.map((item: any) => ({
          id: item.id || Math.random().toString(),
          title: item.title,
          authors: Array.isArray(item.author) ? item.author : (item.authors || ['未知作者']),
          // Improved proxy with bypass referer
          thumbnail: item.image 
            ? `https://images.weserv.nl/?url=${encodeURIComponent(item.image.replace('https:', 'http:'))}&default=https://placehold.co/200x300?text=No+Cover` 
            : undefined,
          description: item.summary,
          publishedDate: item.pubdate,
        }));
        
        setResults(books);
        success = true;
      } catch (err) {
        console.warn(`Mirror failed: ${url}`, err);
      }
    }

    if (!success) {
      setError('豆瓣镜像连接异常，为您展示模拟结果。如需精准记录，建议点击右上角手动导入。');
      // Fallback: Mock data for testing
      const mockBook: Book = {
        id: `mock-${Date.now()}`,
        title: query + ' (未找到结果)',
        authors: ['建议使用上方按钮手动录入'],
        thumbnail: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/subject/l/public/s27279654.jpg',
        description: '由于豆瓣反爬限制严重，该书籍信息同步失败。请点击右上角“手动导入”以继续记录。',
        publishedDate: '2025'
      };
      setResults([mockBook]);
    }
    setLoading(false);
  };

  const onSelectBook = (book: Book) => {
    navigate('/snapshot', { state: { book } });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif font-medium tracking-tight mb-2 text-slate-800">弃读档案</h1>
          <p className="text-slate-400 font-light">决定放下那一刻，也是一种释放。</p>
        </div>
        <button 
          onClick={() => setIsManualModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold transition-all active:scale-95 shrink-0"
        >
          <Edit3 className="w-4 h-4" /> 手动录入
        </button>
      </header>

      <form onSubmit={handleSearch} className="mb-10 group relative flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜书名、作者..."
            className="w-full bg-white border border-slate-200 pl-14 pr-6 py-5 rounded-3xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 transition-all shadow-sm group-hover:shadow-md text-lg"
          />
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 text-white disabled:text-slate-400 px-8 rounded-3xl font-bold transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 active:scale-95"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>搜索 <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      {error && (
        <div className="flex items-start gap-3 text-amber-700 bg-amber-50 border border-amber-100 py-4 px-6 rounded-2xl mb-8 animate-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-4 pb-20">
        {results.map((book) => (
          <button
            key={book.id}
            onClick={() => onSelectBook(book)}
            className="w-full flex items-center gap-6 p-5 bg-white hover:bg-white border border-slate-100 hover:border-blue-100 rounded-[2rem] transition-all text-left shadow-sm hover:shadow-xl group active:scale-[0.99]"
          >
            {book.thumbnail ? (
              <img
                src={book.thumbnail}
                alt={book.title}
                className="w-20 h-28 object-cover rounded-2xl shadow-sm group-hover:scale-105 transition-transform duration-500 shrink-0 bg-slate-50"
              />
            ) : (
              <div className="w-20 h-28 bg-slate-50 flex items-center justify-center rounded-2xl border border-slate-100 text-slate-200 shrink-0">
                <BookPlus className="w-10 h-10" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-slate-800 truncate mb-1 group-hover:text-blue-600 transition-colors">
                {book.title}
              </h3>
              <p className="text-slate-400 font-light mb-auto">
                {Array.isArray(book.authors) ? book.authors.join(', ') : book.authors}
              </p>
              {book.publishedDate && (
                <div className="inline-block mt-3 px-2 py-0.5 bg-slate-50 rounded text-[10px] text-slate-300 font-bold tracking-widest uppercase">
                  {book.publishedDate}
                </div>
              )}
            </div>
          </button>
        ))}
        
        {results.length === 0 && !loading && !error && (
          <div className="py-24 text-center flex flex-col items-center opacity-30">
            <BookPlus className="w-16 h-16 mb-4 text-slate-200" />
            <p className="text-lg font-light">准备好第一份灵魂释放了吗？</p>
          </div>
        )}
      </div>

      <ManualAddModal 
        isOpen={isManualModalOpen} 
        onClose={() => setIsManualModalOpen(false)}
        onAdd={(book) => onSelectBook(book)}
      />
    </div>
  );
};
