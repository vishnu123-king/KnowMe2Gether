import React from 'react';
import { PlusCircle, LayoutDashboard, Star, Home } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rose-100 shadow-xs safe-top">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Logo */}
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-1.5 sm:gap-2 group cursor-pointer text-left focus:outline-none shrink-0"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-violet-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm sm:text-lg text-slate-800 tracking-tight flex items-center gap-1">
              KnowMe2Gether <span className="text-amber-500">🌟</span>
            </span>
            <span className="text-[10px] font-medium text-purple-500 hidden sm:block -mt-1">
              Know your friends
            </span>
          </div>
        </button>

        {/* Navigation items */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onNavigate('/')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              currentPath === '/'
                ? 'bg-rose-100 text-rose-700'
                : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            <Home className="w-3.5 h-3.5 sm:hidden" />
            <span className="hidden sm:inline">Home</span>
          </button>

          <button
            onClick={() => onNavigate('/create')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer ${
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
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentPath.startsWith('/dashboard')
                ? 'bg-amber-100 text-amber-800'
                : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Dashboard</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
