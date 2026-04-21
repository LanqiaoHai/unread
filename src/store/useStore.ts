import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AbandonedBook } from '../types';
import { supabase } from '../lib/supabase';

interface UnreadState {
  abandonedBooks: AbandonedBook[];
  publicBooks: AbandonedBook[];
  isSyncing: boolean;
  stats: {
    likes: number;
    favs: number;
    comments: number;
  };
  addAbandonedBook: (book: AbandonedBook) => Promise<void>;
  removeAbandonedBook: (id: string) => Promise<void>;
  setAbandonedBooks: (books: AbandonedBook[]) => void;
  syncFromLocalStorage: () => Promise<void>;
  fetchPublicBooks: () => Promise<void>;
  toggleLike: (bookId: string) => Promise<void>;
  fetchUserStats: () => Promise<void>;
}

export const useStore = create<UnreadState>()(
  persist(
    (set, get) => ({
      abandonedBooks: [],
      publicBooks: [],
      isSyncing: false,
      stats: { likes: 0, favs: 0, comments: 0 },
      
      setAbandonedBooks: (books) => set({ abandonedBooks: books }),

      addAbandonedBook: async (book) => {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        
        if (user) {
          try {
            const { error } = await supabase.from('books').insert({
              id: book.id,
              uid: user.id,
              title: book.title,
              authors: book.authors,
              thumbnail: book.thumbnail,
              description: book.description,
              published_date: book.publishedDate,
              abandoned_at: book.abandonedAt,
              progress: book.progress,
              reason: book.reason,
              score: book.score,
              is_public: book.isPublic ?? false,
              user_display_name: user.email?.split('@')[0] || '匿名书友'
            });
            if (error) throw error;
          } catch (error) {
            console.error("Error adding book to Supabase:", error);
          }
        } else {
          set((state) => ({
            abandonedBooks: [book, ...state.abandonedBooks],
          }));
        }
      },

      removeAbandonedBook: async (id) => {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        if (user) {
          try {
            const { error } = await supabase
              .from('books')
              .delete()
              .eq('id', id)
              .eq('uid', user.id);
            if (error) throw error;
          } catch (error) {
            console.error("Error removing book from Supabase:", error);
          }
        } else {
          set((state) => ({
            abandonedBooks: state.abandonedBooks.filter((b) => b.id !== id),
          }));
        }
      },

      fetchPublicBooks: async () => {
        const { data } = await supabase
          .from('books')
          .select(`
            *,
            likes:likes(count),
            comments:comments(count)
          `)
          .eq('is_public', true)
          .order('abandoned_at', { ascending: false });

        if (data) {
          const mapped = data.map(b => ({
            ...b,
            id: b.id,
            title: b.title,
            authors: b.authors,
            thumbnail: b.thumbnail,
            abandonedAt: b.abandoned_at,
            score: b.score,
            reason: b.reason,
            isPublic: b.is_public,
            username: b.user_display_name,
            likesCount: b.likes?.[0]?.count || 0,
            commentsCount: b.comments?.[0]?.count || 0
          }));
          set({ publicBooks: mapped });
        }
      },

      toggleLike: async (bookId) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Check if already liked
        const { data: existing } = await supabase
          .from('likes')
          .select('*')
          .eq('book_id', bookId)
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (existing) {
          await supabase.from('likes').delete().eq('id', existing.id);
        } else {
          await supabase.from('likes').insert({ book_id: bookId, user_id: session.user.id });
        }
        
        get().fetchPublicBooks(); // Refresh
      },

      fetchUserStats: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        try {
          // Simplistic counts for now: get all likes on user's public books
          const { data: myBooks } = await supabase.from('books').select('id').eq('uid', session.user.id).eq('is_public', true);
          if (myBooks && myBooks.length > 0) {
            const bookIds = myBooks.map(b => b.id);
            const { count: likes } = await supabase.from('likes').select('*', { count: 'exact', head: true }).in('book_id', bookIds);
            const { count: comments } = await supabase.from('comments').select('*', { count: 'exact', head: true }).in('book_id', bookIds);
            set({ stats: { likes: likes || 0, favs: 0, comments: comments || 0 } });
          }
        } catch (e) { console.error(e); }
      },

      syncFromLocalStorage: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        const { abandonedBooks } = get();


        if (user && abandonedBooks.length > 0) {
          try {
            const booksToInsert = abandonedBooks.map(book => ({
              id: book.id,
              uid: user.id,
              title: book.title,
              authors: book.authors,
              thumbnail: book.thumbnail,
              description: book.description,
              published_date: book.publishedDate,
              abandoned_at: book.abandonedAt,
              progress: book.progress,
              reason: book.reason,
              score: book.score
            }));

            const { error } = await supabase.from('books').insert(booksToInsert);
            if (error) throw error;
            
            set({ abandonedBooks: [] }); // Clear local books after sync
          } catch (error) {
            console.error("Error syncing local books to Supabase:", error);
          }
        }
      }
    }),
    {
      name: 'unread-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ abandonedBooks: state.abandonedBooks }),
    }
  )
);

// Helper to start real-time sync
export const startSupabaseSync = (userId: string) => {
  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('uid', userId)
      .order('abandoned_at', { ascending: false });
    
    if (data) {
      const mappedBooks = data.map(repoBook => ({
        id: repoBook.id,
        title: repoBook.title,
        authors: repoBook.authors,
        thumbnail: repoBook.thumbnail,
        description: repoBook.description,
        publishedDate: repoBook.published_date,
        abandonedAt: repoBook.abandoned_at,
        progress: repoBook.progress,
        reason: repoBook.reason,
        score: repoBook.score
      })) as AbandonedBook[];
      
      useStore.getState().setAbandonedBooks(mappedBooks);
    }
    if (error) {
      console.error("Error fetching books from Supabase:", error);
    }
  };

  fetchBooks();

  // Real-time listener
  const channel = supabase
    .channel(`public:books:uid=eq.${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'books',
        filter: `uid=eq.${userId}`,
      },
      (payload) => {
        console.log('Change received!', payload);
        fetchBooks();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
