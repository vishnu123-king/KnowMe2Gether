import React from 'react';
import { Heart, PlusCircle, LayoutDashboard, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-rose-100 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2 group cursor-pointer text-left focus:outline-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-800 tracking-tight flex items-center gap-1">
              Friendship Test <span className="text-rose-500">❤️</span>
            </span>
            <span className="text-[11px] font-medium text-rose-400 block -mt-1">
              Know your friends
            </span>
          </div>
        </button>

        {/* Navigation items */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onNavigate('/')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentPath === '/'
                ? 'bg-rose-100 text-rose-700'
                : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onNavigate('/create')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer ${
              currentPath === '/create'
                ? 'bg-rose-500 text-white shadow-rose-200'
                : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>

          <button
            onClick={() => onNavigate('/dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentPath.startsWith('/dashboard')
                ? 'bg-amber-100 text-amber-800'
                : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
