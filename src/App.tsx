import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Snapshot } from './pages/Snapshot';
import { auth } from './firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { useStore, startFirestoreSync } from './store/useStore';
import './App.css';

const App: React.FC = () => {
  const syncFromLocalStorage = useStore((state) => state.syncFromLocalStorage);

  useEffect(() => {
    // 1. Initial Anonymous Sign In
    const login = async () => {
      if (!auth.currentUser) {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Firebase Anonymous Login Failed", error);
        }
      }
    };
    login();

    // 2. Auth State Listener
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Logged in as:", user.uid);
        // Start Firestore listener
        const unsubscribeFirestore = startFirestoreSync(user.uid);
        
        // Try to sync existing local data to Firestore if this is first login
        syncFromLocalStorage();

        return () => {
          unsubscribeFirestore();
        };
      }
    });

    return () => unsubscribeAuth();
  }, [syncFromLocalStorage]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="snapshot" element={<Snapshot />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
