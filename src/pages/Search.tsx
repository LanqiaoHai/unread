import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Loader2, BookPlus, AlertCircle } from 'lucide-react';
import type { Book } from '../types';

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`
      );
      if (!response.ok) throw new Error('网络请求失败');
      const data = await response.json();
      
      const books: Book[] = (data.items || []).map((item: any) => ({
        id: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors || ['未知作者'],
        thumbnail: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
        description: item.volumeInfo.description,
        publishedDate: item.volumeInfo.publishedDate,
      }));
      
      setResults(books);
      if (books.length === 0) setError('未找到相关书籍');
    } catch (err) {
      setError('搜索出错了，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const onSelectBook = (book: Book) => {
    // Navigate to snapshot form with book data in state
    navigate('/snapshot', { state: { book } });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12">
        <h1 className="text-4xl font-serif font-medium tracking-tight mb-2">弃读档案</h1>
        <p className="text-slate-400 font-light">决定放下那一刻，也是一种释放。</p>
      </header>

      <form onSubmit={handleSearch} className="mb-8 group relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索书名、作者..."
          className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50/50 transition-all pl-14 shadow-sm group-hover:shadow-md"
        />
        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-400 transition-colors" />
        {loading && (
          <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
        )}
      </form>

      {error && (
        <div className="flex items-center gap-2 text-slate-400 justify-center py-10 animate-in fade-in zoom-in-95">
          <AlertCircle className="w-5 h-5" />
          <p className="font-light">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {results.map((book) => (
          <button
            key={book.id}
            onClick={() => onSelectBook(book)}
            className="w-full flex items-center gap-6 p-4 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl transition-all text-left shadow-sm hover:shadow-md group active:scale-[0.99]"
          >
            {book.thumbnail ? (
              <img
                src={book.thumbnail}
                alt={book.title}
                className="w-16 h-24 object-cover rounded-lg shadow-sm"
              />
            ) : (
              <div className="w-16 h-24 bg-slate-50 flex items-center justify-center rounded-lg border border-slate-100 text-slate-200">
                <BookPlus className="w-8 h-8" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-800 truncate mb-1 group-hover:text-blue-600 transition-colors">
                {book.title}
              </h3>
              <p className="text-sm text-slate-400 font-light">
                {book.authors.join(', ')}
              </p>
              {book.publishedDate && (
                <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-2">
                  {book.publishedDate}
                </p>
              )}
            </div>
            
            <div className="p-2 text-slate-200 group-hover:text-blue-400 transition-colors">
              <BookPlus className="w-5 h-5" />
            </div>
          </button>
        ))}
      </div>
      
      {results.length === 0 && !loading && !error && (
        <div className="py-20 text-center flex flex-col items-center opacity-30">
          <BookPlus className="w-12 h-12 mb-4 text-slate-300" />
          <p className="font-light">开始你的弃读记录</p>
        </div>
      )}
    </div>
  );
};
