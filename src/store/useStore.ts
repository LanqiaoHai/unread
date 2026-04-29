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
  toggleFavorite: (bookId: string) => Promise<void>;
  fetchUserStats: () => Promise<void>;
  fetchBookComments: (bookId: string) => Promise<any[]>;
  addComment: (bookId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
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
            const { error } = await supabase.from('books').upsert({
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
              user_display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || '匿名书友',
              user_avatar: user.user_metadata?.avatar_emoji || '👻'
            });
            if (error) throw error;
            
            // Auto-populate internal book catalog (safely wrapped)
            try {
              const { data: existingCat } = await supabase.from('book_catalog').select('id').eq('title', book.title).maybeSingle();
              if (!existingCat) {
                await supabase.from('book_catalog').insert({
                  title: book.title,
                  authors: book.authors,
                  thumbnail: book.thumbnail
                });
              }
            } catch (catErr) {
              console.warn("Failed to populate book_catalog, but continuing:", catErr);
            }

            get().fetchUserStats();
            get().fetchPublicBooks();
          } catch (error) {
            console.error("Error upserting book to Supabase:", error);
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
            const isAdmin = user.user_metadata?.is_admin === true;
            let query = supabase.from('books').delete().eq('id', id);
            
            if (!isAdmin) {
              query = query.eq('uid', user.id);
            }

            const { error } = await query;
            if (error) throw error;
            
            // Immediately update local state for responsiveness
            set((state) => ({
              abandonedBooks: state.abandonedBooks.filter((b) => b.id !== id),
              publicBooks: state.publicBooks.filter((b) => b.id !== id),
            }));
            get().fetchUserStats();
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

        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (data) {
          // Fetch current user's likes and favorites to determine status
          let userLikedIds: string[] = [];
          let userFavoritedIds: string[] = [];
          if (userId) {
            const { data: myLikes } = await supabase
              .from('likes')
              .select('book_id')
              .eq('user_id', userId);
            if (myLikes) userLikedIds = myLikes.map(l => l.book_id);

            const { data: myFavs } = await supabase
              .from('favorites')
              .select('book_id')
              .eq('user_id', userId);
            if (myFavs) userFavoritedIds = myFavs.map(f => f.book_id);
          }

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
            commentsCount: b.comments?.[0]?.count || 0,
            isLiked: userLikedIds.includes(b.id),
            isFavorited: userFavoritedIds.includes(b.id)
          }));
          set({ publicBooks: mapped });
        }
      },

      fetchBookComments: async (bookId: string) => {
        const { data } = await supabase
          .from('comments')
          .select('*')
          .eq('book_id', bookId)
          .order('created_at', { ascending: true });
        return data || [];
      },

      addComment: async (bookId: string, content: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { error } = await supabase.from('comments').insert({
          book_id: bookId,
          user_id: session.user.id,
          user_display_name: session.user.user_metadata?.display_name || '匿名书友',
          content: content
        });

        if (error) throw error;
        
        // Ensure public books are refreshed immediately
        await get().fetchPublicBooks(); 
        await get().fetchUserStats();
      },

      deleteComment: async (commentId: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const isAdmin = session.user.user_metadata?.is_admin === true;
        let query = supabase.from('comments').delete().eq('id', commentId);

        if (!isAdmin) {
          query = query.eq('user_id', session.user.id);
        }

        const { error } = await query;
        if (error) throw error;
        
        await get().fetchPublicBooks();
        await get().fetchUserStats();
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

      toggleFavorite: async (bookId) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: existing } = await supabase
          .from('favorites')
          .select('*')
          .eq('book_id', bookId)
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (existing) {
          await supabase.from('favorites').delete().eq('id', existing.id);
        } else {
          await supabase.from('favorites').insert({ book_id: bookId, user_id: session.user.id });
        }
        
        get().fetchPublicBooks();
        get().fetchUserStats();
      },

      fetchUserStats: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        try {
          // Changed logic: Dashboard now shows stats based on the user's *actions*
          // likes: how many likes received on their books (keeping this as is for now, or did user want this changed? User only mentioned comments and favorites. We will keep likes as 'received likes' for now, but rename comments/favorites)
          const { data: myBooks } = await supabase.from('books').select('id').eq('uid', session.user.id).eq('is_public', true);
          let receivedLikes = 0;
          if (myBooks && myBooks.length > 0) {
            const bookIds = myBooks.map(b => b.id);
            const { count } = await supabase.from('likes').select('*', { count: 'exact', head: true }).in('book_id', bookIds);
            receivedLikes = count || 0;
          }

          // Count comments user has posted
          const { count: myComments } = await supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id);
          
          // Count favorites user has made
          const { count: myFavs } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id);

          set({ stats: { likes: receivedLikes, favs: myFavs || 0, comments: myComments || 0 } });
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
