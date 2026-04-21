import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Library, Compass, Plus, Book as BookIcon } from 'lucide-react';

export const Layout: React.FC = () => {
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

          {/* Brand Logo - Cartoon Book */}
          <div className="p-4 text-brand-yellow drop-shadow-md hidden sm:block">
            <BookIcon className="w-8 h-8 fill-current" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 pt-12 pb-32 md:pt-32 md:pb-12">
        <Outlet />
      </main>
    </div>
  );
};


