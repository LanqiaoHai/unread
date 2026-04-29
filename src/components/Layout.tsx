import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Library, Compass, Plus, BookUser } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { SettingsPanel } from './SettingsPanel';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export const Layout: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  return (
    <div className="min-h-screen bg-bg-cream text-slate-800 selection:bg-brand-yellow/30">
      {/* Navigation (Always Top on Desktop, Bottom on Mobile) */}
      <nav className="fixed bottom-6 sm:bottom-auto sm:top-6 left-1/2 -translate-x-1/2 w-[94%] sm:w-[90%] max-w-lg glass-card p-1 sm:p-3 z-50 border-slate-900 shadow-xl">
        <div className="flex justify-between items-center px-1 sm:px-4">
          {/* Login Entry / Settings - Now First */}
          <button 
            onClick={() => setShowSettings(true)}
            className="p-4 text-brand-yellow drop-shadow-md hover:scale-110 transition-transform btn-bouncy"
            title="登录/状态"
          >
            <BookUser className="w-8 h-8" />
          </button>

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
              `p-3 sm:p-4 rounded-3xl bg-brand-orange text-white shadow-lg transition-all btn-bouncy ${isActive ? 'rotate-12 scale-110' : ''}`
            }
            title="新增记录"
          >
            <Plus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3px]" />
          </NavLink>
        </div>
      </nav>

      {/* Main Content */}
      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-10 sm:pt-40 pb-32 sm:pb-12">
        <Outlet />
      </main>

      {showSettings && (
        user && !user.is_anonymous 
          ? <SettingsPanel user={user} onClose={() => setShowSettings(false)} /> 
          : <AuthModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};


