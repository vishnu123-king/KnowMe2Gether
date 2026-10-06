import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OwnerTestSummary } from '../types';
import { fetchOwnerTests, deleteOwnerTest, rotateResponderLink } from '../services/api';
import { AnimatedTeddy } from '../components/AnimatedTeddy';
import { formatPublicShareUrl } from '../utils/shareUrl';
import {
  PlusCircle,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  ExternalLink,
  Clock,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

interface OwnerDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const OwnerDashboardPage: React.FC<OwnerDashboardPageProps> = ({ onNavigate }) => {
  const [tests, setTests] = useState<OwnerTestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [rotatingId, setRotatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const loadTests = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const data = await fetchOwnerTests();
      setTests(data);
      setErrorMsg('');
    } catch (err: any) {
      if (isInitial) setErrorMsg(err.message || 'Failed to load your tests.');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTests(true);

    // Lightweight polling every 12 seconds while dashboard is open (Section 33 Option B)
    const interval = setInterval(() => {
      loadTests(false);
    }, 12000);

    return () => clearInterval(interval);
  }, [loadTests]);

  const handleCopyLink = async (test: OwnerTestSummary) => {
    const publicUrl = formatPublicShareUrl(test.shareUrl, test.responderToken);
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedId(test.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
      alert(`Link: ${publicUrl}`);
    }
  };

  const handleRotate = async (testId: string) => {
    try {
      setRotatingId(testId);
      const res = await rotateResponderLink(testId);
      setTests((prev) =>
        prev.map((t) =>
          t.id === testId
            ? { ...t, shareUrl: res.shareUrl, responderToken: res.responderToken }
            : t
        )
      );
    } catch (err: any) {
      alert(err.message || 'Failed to rotate link.');
    } finally {
      setRotatingId(null);
    }
  };

  const handleDelete = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test? All answers and results will be permanently removed.')) {
      return;
    }
    try {
      setDeletingId(testId);
      await deleteOwnerTest(testId);
      setTests((prev) => prev.filter((t) => t.id !== testId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete test.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Owner Dashboard
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold">
              {tests.length} {tests.length === 1 ? 'Quiz' : 'Quizzes'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your friendship tests and check when your friends submit their answers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('/create')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Test</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <AnimatedTeddy pose="thinking" size={110} />
          <p className="text-xs font-bold text-slate-500 animate-pulse">
            Loading your dashboard...
          </p>
        </div>
      ) : tests.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border-2 border-rose-100 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm space-y-5"
        >
          <div className="flex justify-center">
            <AnimatedTeddy pose="waiting" size={140} />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-800">
              No tests created yet!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Create your very first friendship test, generate a private link, and send it to your friend!
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate('/create')}
              className="px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Create My First Test →
            </button>
          </div>
        </motion.div>
      ) : (
        /* Tests Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {tests.map((test) => {
              const isCompleted = test.status === 'completed';
              return (
                <motion.div
                  key={test.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl border-2 border-rose-100/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Top Bar: Title & Status */}
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                          {test.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Created for: <strong className="text-rose-600 font-bold">{test.friendName}</strong>
                        </p>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Completed 🎉</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                            <span>Waiting for friend</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                      <span>{test.questionCount} Questions</span>
                      <span>•</span>
                      <span>
                        {new Date(test.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Share Link Strip */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-slate-600 truncate flex-1 px-1">
                      {formatPublicShareUrl(test.shareUrl, test.responderToken)}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(test)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        copiedId === test.id
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white hover:bg-rose-50 text-slate-700 border border-slate-200'
                      }`}
                      title="Copy share link"
                    >
                      {copiedId === test.id ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </button>
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={rotatingId === test.id}
                        onClick={() => handleRotate(test.id)}
                        title="Rotate link (generate new random link and invalidate old)"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${rotatingId === test.id ? 'animate-spin' : ''}`}
                        />
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === test.id}
                        onClick={() => handleDelete(test.id)}
                        title="Delete test"
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onNavigate(`/dashboard/tests/${test.id}`)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer ${
                        isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
                          : 'bg-slate-800 hover:bg-slate-900 text-white'
                      }`}
                    >
                      <span>{isCompleted ? 'View Answers' : 'View Test Details'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
