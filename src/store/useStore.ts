import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AbandonedBook } from '../types';
import { supabase } from '../lib/supabase';

interface UnreadState {
  abandonedBooks: AbandonedBook[];
  isSyncing: boolean;
  addAbandonedBook: (book: AbandonedBook) => Promise<void>;
  removeAbandonedBook: (id: string) => Promise<void>;
  setAbandonedBooks: (books: AbandonedBook[]) => void;
  syncFromLocalStorage: () => Promise<void>;
}

export const useStore = create<UnreadState>()(
  persist(
    (set, get) => ({
      abandonedBooks: [],
      isSyncing: false,
      
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
              score: book.score
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
