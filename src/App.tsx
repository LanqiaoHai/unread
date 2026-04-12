import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Snapshot } from './pages/Snapshot';
import { supabase } from './lib/supabase';
import { useStore, startSupabaseSync } from './store/useStore';
import './App.css';

const App: React.FC = () => {
  const syncFromLocalStorage = useStore((state) => state.syncFromLocalStorage);

  useEffect(() => {
    // 1. Initial Anonymous Sign In
    const login = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        try {
          await supabase.auth.signInAnonymously();
        } catch (error) {
          console.error("Supabase Anonymous Login Failed", error);
        }
      }
    };
    login();

    // 2. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        console.log("Logged in as:", session.user.id);
        
        // Start Supabase real-time sync
        const unsubscribeSupabase = startSupabaseSync(session.user.id);
        
        // Try to sync existing local data
        syncFromLocalStorage();

        // Note: In Supabase, we might need a different way to handle cleanup if needed,
        // but for now we follow the same pattern.
        return () => {
          unsubscribeSupabase();
        };
      }
    });

    return () => subscription.unsubscribe();
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
