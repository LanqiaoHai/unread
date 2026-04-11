import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AbandonedBook } from '../types';
import { db, auth } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  doc, 
  getDocs,
  writeBatch
} from 'firebase/firestore';

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
        const user = auth.currentUser;
        if (user) {
          try {
            await addDoc(collection(db, 'books'), {
              ...book,
              uid: user.uid,
              createdAt: Date.now()
            });
          } catch (error) {
            console.error("Error adding book to Firestore:", error);
          }
        } else {
          // Fallback to local state if not logged in (though we try to always be logged in)
          set((state) => ({
            abandonedBooks: [book, ...state.abandonedBooks],
          }));
        }
      },

      removeAbandonedBook: async (id) => {
        const user = auth.currentUser;
        if (user) {
          try {
            // In Firestore, we need the document ID. 
            // We'll have to find the document with the book's 'id' field.
            const q = query(collection(db, 'books'), where('id', '==', id), where('uid', '==', user.uid));
            const snapshot = await getDocs(q);
            const batch = writeBatch(db);
            snapshot.forEach((d) => batch.delete(d.ref));
            await batch.commit();
          } catch (error) {
            console.error("Error removing book from Firestore:", error);
          }
        } else {
          set((state) => ({
            abandonedBooks: state.abandonedBooks.filter((b) => b.id !== id),
          }));
        }
      },

      syncFromLocalStorage: async () => {
        const user = auth.currentUser;
        const { abandonedBooks } = get();
        if (user && abandonedBooks.length > 0) {
          try {
            const batch = writeBatch(db);
            abandonedBooks.forEach((book) => {
              const docRef = doc(collection(db, 'books'));
              batch.set(docRef, { ...book, uid: user.uid });
            });
            await batch.commit();
            set({ abandonedBooks: [] }); // Clear local books after sync
          } catch (error) {
            console.error("Error syncing local books to Firestore:", error);
          }
        }
      }
    }),
    {
      name: 'unread-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist local books if not logged in
      partialize: (state) => ({ abandonedBooks: state.abandonedBooks }),
    }
  )
);

// Helper to start real-time sync
export const startFirestoreSync = (uid: string) => {
  const q = query(collection(db, 'books'), where('uid', '==', uid));
  return onSnapshot(q, (snapshot) => {
    const books = snapshot.docs.map(d => {
      const data = d.data();
      return {
        ...data,
      } as AbandonedBook;
    });
    // Sort by abandonedAt desc
    books.sort((a, b) => b.abandonedAt - a.abandonedAt);
    useStore.getState().setAbandonedBooks(books);
  });
};
