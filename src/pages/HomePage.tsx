import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AnimatedTeddy } from '../components/AnimatedTeddy';
import { AnimatedPanda } from '../components/AnimatedPanda';
import { Heart, Sparkles, PlusCircle, ArrowRight, Play, ShieldCheck, HelpCircle } from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [showTakeTestModal, setShowTakeTestModal] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [takeTestError, setTakeTestError] = useState('');

  const handleTakeTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTakeTestError('');
    const trimmed = testInput.trim();
    if (!trimmed) {
      setTakeTestError('Please enter a test link or code.');
      return;
    }

    // Check if user entered full URL or just token
    let token = trimmed;
    try {
      if (trimmed.includes('/test/')) {
        const parts = trimmed.split('/test/');
        token = parts[1].split('?')[0].split('#')[0];
      } else if (trimmed.startsWith('http')) {
        const url = new URL(trimmed);
        const pathSegments = url.pathname.split('/').filter(Boolean);
        token = pathSegments[pathSegments.length - 1];
      }
    } catch {
      token = trimmed;
    }

    if (!token) {
      setTakeTestError('Invalid test link format.');
      return;
    }

    onNavigate(`/test/${token}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16 text-center space-y-8">
      {/* Teddy & Hero Badge */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-100/80 border border-rose-200/80 text-rose-700 text-xs sm:text-sm font-bold shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>The Ultimate Friendship Quiz</span>
        </motion.div>

        {/* Hero animated characters */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 14 }}
          className="relative py-2 flex items-center justify-center gap-4"
        >
          <AnimatedTeddy pose="waving" size={150} />
          <AnimatedPanda pose="waving" size={150} />
          {/* Subtle gentle glow behind */}
          <div className="absolute -inset-4 bg-gradient-to-r from-rose-200/40 via-pink-200/30 to-amber-200/40 rounded-full blur-2xl -z-10" />
        </motion.div>
      </div>

      {/* Main Headlines */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 max-w-2xl mx-auto"
      >
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Friendship Test <span className="text-rose-500 inline-block hover:scale-125 transition-transform cursor-default">❤️</span>
        </h1>

        <p className="text-lg sm:text-2xl font-bold text-rose-600 font-serif italic">
          “Think your friend knows you really well?”
        </p>

        <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
          Create your own questions, share the test, and discover how well they know you.
          Results and answers stay 100% private to you!
        </p>
      </motion.div>

      {/* Primary and Secondary CTA Buttons */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 max-w-md mx-auto"
      >
        <button
          type="button"
          onClick={() => onNavigate('/create')}
          className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2.5 py-4 px-8 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-base shadow-lg shadow-rose-200/60 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create a Test</span>
        </button>

        <button
          type="button"
          onClick={() => setShowTakeTestModal(true)}
          className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-4 px-7 rounded-2xl bg-white hover:bg-rose-50/80 border-2 border-rose-200 text-rose-700 font-bold text-base shadow-xs hover:shadow transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-rose-600" />
          <span>Take a Test</span>
        </button>
      </motion.div>

      {/* Three quick feature highlights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 text-left max-w-3xl mx-auto"
      >
        <div className="bg-white/80 backdrop-blur-sm border border-rose-100 rounded-2xl p-4.5 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3 font-bold text-lg">
            1
          </div>
          <h3 className="font-bold text-slate-800 text-sm mb-1">Custom Questions</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Craft your own questions with text, multiple-choice, or yes/no answers.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-rose-100 rounded-2xl p-4.5 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center mb-3 font-bold text-lg">
            2
          </div>
          <h3 className="font-bold text-slate-800 text-sm mb-1">Instant Share Link</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Send a unique, secure link to your friend without requiring any app install.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-rose-100 rounded-2xl p-4.5 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 font-bold text-lg">
            3
          </div>
          <h3 className="font-bold text-slate-800 text-sm mb-1">Private Answers</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your friend never sees the answers. Only you privately view their responses!
          </p>
        </div>
      </motion.div>

      {/* Take a Test Modal */}
      {showTakeTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl border-2 border-rose-100 p-6 max-w-md w-full shadow-2xl text-left space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                <span>Enter Test Link or Code</span>
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowTakeTestModal(false);
                  setTakeTestError('');
                }}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Paste the shareable link or code you received from your friend to begin answering their quiz.
            </p>

            <form onSubmit={handleTakeTestSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="e.g. Ab8xP91LmQ or https://.../test/Ab8xP91LmQ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 text-sm font-medium"
                  autoFocus
                />
                {takeTestError && (
                  <p className="text-xs text-rose-600 font-semibold mt-1.5">{takeTestError}</p>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowTakeTestModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Start Quiz →
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
