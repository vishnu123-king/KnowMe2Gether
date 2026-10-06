import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AnimatedTeddy } from '../components/AnimatedTeddy';
import { AnimatedPanda } from '../components/AnimatedPanda';
import { Lock, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: (token: string) => void;
  onNavigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigate,
}) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!password.trim()) {
      setErrorMsg('Please enter the admin password.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Incorrect password.');
      }

      onLoginSuccess(data.token);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20 space-y-8">
      <button
        type="button"
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-2xl space-y-6 text-center"
      >
        <div className="flex justify-center items-center gap-2">
          <AnimatedTeddy pose="thinking" size={90} />
          <AnimatedPanda pose="thinking" size={90} />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Secret Admin Console</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Admin Authentication
          </h1>
          <p className="text-xs text-slate-500">
            Enter admin password to access platform analytics and test monitoring.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Admin Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (default: admin123)"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:border-slate-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Access Admin Console 🔒</span>
            )}
          </button>
        </form>

        <p className="text-[11px] text-slate-400 italic">
          Hint: Default password is <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">admin123</code>
        </p>
      </motion.div>
    </div>
  );
};
