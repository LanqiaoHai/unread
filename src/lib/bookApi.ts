import type { Book } from '../types';

/**
 * Searches for books using multiple sources to ensure stability in China.
 */
export async function searchBooks(query: string): Promise<Book[]> {
  const sources = [
    searchDoubanMirror,
    searchGoogleBooks,
    searchOpenLibrary
  ];

  for (const source of sources) {
    try {
      const results = await source(query);
      if (results && results.length > 0) return results;
    } catch (e) {
      console.warn(`Source failed: ${source.name}`, e);
    }
  }

  return [];
}

async function searchDoubanMirror(query: string): Promise<Book[]> {
  // Using a known relatively stable mirror or proxy
  // Note: These mirrors are unofficial and might fail. 
  const mirrorUrl = `https://douban.basecase.site/book/search?q=${encodeURIComponent(query)}`;
  
  const response = await fetch(mirrorUrl);
  if (!response.ok) throw new Error('Douban mirror failed');
  const data = await response.json();
  
  // Format: Douban Mirror often returns different structures. 
  // This is a common one:
  return (data.books || data.items || []).map((item: any) => ({
    id: item.id || Math.random().toString(),
    title: item.title,
    authors: item.authors || item.author || ['未知作者'],
    thumbnail: item.image || item.cover_url || item.thumbnail,
    description: item.summary || item.description,
    publishedDate: item.pubdate || item.publishedDate,
  }));
}

async function searchGoogleBooks(query: string): Promise<Book[]> {
  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`);
  if (!response.ok) throw new Error('Google Books failed');
  const data = await response.json();
  
  return (data.items || []).map((item: any) => {
    const info = item.volumeInfo;
    return {
      id: item.id,
      title: info.title,
      authors: info.authors || ['未知作者'],
      thumbnail: info.imageLinks?.thumbnail?.replace('http:', 'https:'),
      description: info.description,
      publishedDate: info.publishedDate,
    };
  });
}

async function searchOpenLibrary(query: string): Promise<Book[]> {
  const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`);
  if (!response.ok) throw new Error('OpenLibrary failed');
  const data = await response.json();
  
  return (data.docs || []).map((item: any) => ({
    id: item.key,
    title: item.title,
    authors: item.author_name || ['未知作者'],
    thumbnail: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg` : undefined,
    description: '',
    publishedDate: item.first_publish_year?.toString(),
  }));
}
