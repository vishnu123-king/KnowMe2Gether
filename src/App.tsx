import React, { useState, useEffect } from 'react';
import { CuteBackground } from './animations/CuteBackground';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { CreateTestPage } from './pages/CreateTestPage';
import { ResponderTestPage } from './pages/ResponderTestPage';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';
import { OwnerTestDetailPage } from './pages/OwnerTestDetailPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('friendship_test_admin_token');
    } catch {
      return null;
    }
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
    // 1. Admin Console: /admin
    if (currentPath.startsWith('/admin')) {
      if (!adminToken) {
        return (
          <AdminLoginPage
            onLoginSuccess={(token) => {
              setAdminToken(token);
              try {
                localStorage.setItem('friendship_test_admin_token', token);
              } catch {}
              navigate('/admin');
            }}
            onNavigate={navigate}
          />
        );
      }
      return (
        <AdminDashboardPage
          adminToken={adminToken}
          onLogout={() => {
            setAdminToken(null);
            try {
              localStorage.removeItem('friendship_test_admin_token');
            } catch {}
            navigate('/admin');
          }}
          onNavigate={navigate}
        />
      );
    }

    // 2. Responder Test Page: /test/:token
    if (currentPath.startsWith('/test/')) {
      const token = currentPath.replace('/test/', '').split('?')[0].split('#')[0];
      return <ResponderTestPage token={token} onNavigateHome={() => navigate('/')} />;
    }

    // 3. Owner Test Detail Page: /dashboard/tests/:id
    if (currentPath.startsWith('/dashboard/tests/')) {
      const testId = currentPath.replace('/dashboard/tests/', '').split('?')[0].split('#')[0];
      return <OwnerTestDetailPage testId={testId} onNavigate={navigate} />;
    }

    // 4. Owner Dashboard: /dashboard
    if (currentPath === '/dashboard') {
      return <OwnerDashboardPage onNavigate={navigate} />;
    }

    // 5. Create Test: /create
    if (currentPath === '/create') {
      return <CreateTestPage onNavigate={navigate} />;
    }

    // 6. Default: Home Page
    return <HomePage onNavigate={navigate} />;
  };

  const isSpecialView = currentPath.startsWith('/test/') || currentPath.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col relative text-slate-800 antialiased selection:bg-rose-200 selection:text-rose-900">
      {/* Background with floating emojis & gradient */}
      <CuteBackground />

      {/* Navbar (Show except for special views to maximize focus) */}
      {!isSpecialView && (
        <Navbar currentPath={currentPath} onNavigate={navigate} />
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {renderContent()}
      </main>

      {/* Soft Footer with secret admin link */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-rose-100/50 relative z-10 flex flex-col sm:flex-row items-center justify-center gap-2">
        <p className="flex items-center justify-center gap-1">
          Made with <span className="text-amber-500 animate-pulse">🐼✨</span> for Best Friends Everywhere
        </p>
        <span className="hidden sm:inline">•</span>
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="text-slate-400 hover:text-slate-700 font-bold text-[11px] underline cursor-pointer"
        >
          Admin Console 🔒
        </button>
      </footer>
    </div>
  );
}
