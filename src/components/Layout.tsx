import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Library, Compass, Plus, BookUser } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { supabase } from '../lib/supabase';

export const Layout: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange(() => {}); // Empty listener as we don't need the user object here
    supabase.auth.getUser(); // Trigger just to ensure session is checked
  }, []);

  return (
    <div className="min-h-screen bg-bg-cream text-slate-800 selection:bg-brand-yellow/30">
      {/* Navigation (Mobile Bottom / Desktop Top) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg glass-card p-3 z-50 border-slate-900 md:top-6 md:bottom-auto">
        <div className="flex justify-between items-center px-4">
          {/* Brand/Home Icon */}
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `p-4 rounded-3xl transition-all btn-bouncy ${isActive ? 'bg-brand-yellow text-slate-900 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`
            }
            title="我的书架"
          >
            <Library className="w-7 h-7" />
          </NavLink>

          {/* Explore - 逛逛 */}
          <NavLink 
            to="/explore" 
            className={({ isActive }) => 
              `p-4 rounded-3xl transition-all btn-bouncy ${isActive ? 'bg-brand-blue text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`
            }
            title="社区发现"
          >
            <Compass className="w-7 h-7" />
          </NavLink>

          {/* Release - 弃读/搜索 */}
          <NavLink 
            to="/search" 
            className={({ isActive }) => 
              `p-4 rounded-3xl bg-brand-orange text-white shadow-lg transition-all btn-bouncy ${isActive ? 'rotate-12 scale-110' : ''}`
            }
            title="新增记录"
          >
            <Plus className="w-7 h-7 stroke-[3px]" />
          </NavLink>

          {/* Login Entry - Cartoon Book with User */}
          <button 
            onClick={() => setShowSettings(true)}
            className="p-4 text-brand-yellow drop-shadow-md hidden sm:block hover:scale-110 transition-transform btn-bouncy"
            title="登录/同步"
          >
            <BookUser className="w-8 h-8" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 pt-12 pb-32 md:pt-32 md:pb-12">
        <Outlet />
      </main>

      {showSettings && <AuthModal onClose={() => setShowSettings(false)} />}
    </div>
  );
};


