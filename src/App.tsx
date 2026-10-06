import React, { useState, useEffect } from 'react';
import { CuteBackground } from './animations/CuteBackground';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { CreateTestPage } from './pages/CreateTestPage';
import { ResponderTestPage } from './pages/ResponderTestPage';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';
import { OwnerTestDetailPage } from './pages/OwnerTestDetailPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }
  };

  // Determine which page to render based on path
  const renderContent = () => {
    // 1. Responder Test Page: /test/:token
    if (currentPath.startsWith('/test/')) {
      const token = currentPath.replace('/test/', '').split('?')[0].split('#')[0];
      return <ResponderTestPage token={token} onNavigateHome={() => navigate('/')} />;
    }

    // 2. Owner Test Detail Page: /dashboard/tests/:id
    if (currentPath.startsWith('/dashboard/tests/')) {
      const testId = currentPath.replace('/dashboard/tests/', '').split('?')[0].split('#')[0];
      return <OwnerTestDetailPage testId={testId} onNavigate={navigate} />;
    }

    // 3. Owner Dashboard: /dashboard
    if (currentPath === '/dashboard') {
      return <OwnerDashboardPage onNavigate={navigate} />;
    }

    // 4. Create Test: /create
    if (currentPath === '/create') {
      return <CreateTestPage onNavigate={navigate} />;
    }

    // 5. Default: Home Page
    return <HomePage onNavigate={navigate} />;
  };

  const isResponderView = currentPath.startsWith('/test/');

  return (
    <div className="min-h-screen flex flex-col relative text-slate-800 antialiased selection:bg-rose-200 selection:text-rose-900">
      {/* Background with floating hearts, sparkles & gradient */}
      <CuteBackground />

      {/* Navbar (Show except for responder test view to maximize focus & privacy) */}
      {!isResponderView && (
        <Navbar currentPath={currentPath} onNavigate={navigate} />
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {renderContent()}
      </main>

      {/* Soft Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-rose-100/50 relative z-10">
        <p className="flex items-center justify-center gap-1">
          Made with <span className="text-rose-500 animate-pulse">❤️</span> for Best Friends Everywhere
        </p>
      </footer>
    </div>
  );
}
