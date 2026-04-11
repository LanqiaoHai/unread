import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BookOpen, Search, Ghost } from 'lucide-react';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f4f7f6] text-[#2c3e50] font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 z-50 sm:top-0 sm:bottom-auto sm:border-t-0 sm:border-b">
        <div className="max-w-3xl mx-auto px-6 py-3 flex justify-around sm:justify-between items-center">
          <NavLink 
            to="/" 
            className="flex items-center gap-2 text-xl font-bold tracking-tight px-3 py-1 rounded-lg transition-all"
          >
            <Ghost className="w-6 h-6 text-slate-400" />
            <span className="hidden sm:inline">弃读 Unread</span>
          </NavLink>
          
          <div className="flex gap-8 sm:gap-6">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 py-1 rounded-lg transition-all ${
                  isActive ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium">书库</span>
            </NavLink>
            <NavLink 
              to="/search" 
              className={({ isActive }) => 
                `flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 py-1 rounded-lg transition-all ${
                  isActive ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <Search className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium">弃读</span>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 pt-10 pb-24 sm:pt-24 sm:pb-12">
        <Outlet />
      </main>

      {/* Subtle Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-20"></div>
    </div>
  );
};
