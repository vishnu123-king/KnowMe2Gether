import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { OwnerTestDetail, OwnerAnswerReviewData } from '../types';
import {
  fetchOwnerTestDetail,
  fetchOwnerAnswers,
  rotateResponderLink
} from '../services/api';
import { AnimatedTeddy } from '../components/AnimatedTeddy';
import { triggerLoveConfetti } from '../animations/Confetti';
import { formatPublicShareUrl } from '../utils/shareUrl';
import {
  ArrowLeft,
  Copy,
  Check,
  Share2,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Heart,
  MessageSquareHeart
} from 'lucide-react';

interface OwnerTestDetailPageProps {
  testId: string;
  onNavigate: (path: string) => void;
}

export const OwnerTestDetailPage: React.FC<OwnerTestDetailPageProps> = ({
  testId,
  onNavigate,
}) => {
  const [test, setTest] = useState<OwnerTestDetail | null>(null);
  const [answerReview, setAnswerReview] = useState<OwnerAnswerReviewData | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  // View state: 'overview' | 'review'
  const [viewMode, setViewMode] = useState<'overview' | 'review'>('overview');

  const loadData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const detail = await fetchOwnerTestDetail(testId);
      setTest(detail);

      if (detail.status === 'completed') {
        const ans = await fetchOwnerAnswers(testId).catch(() => null);
        if (ans) setAnswerReview(ans);
      }
      setErrorMsg('');
    } catch (err: any) {
      if (isInitial) setErrorMsg(err.message || 'Failed to load test details.');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    loadData(true);

    // If still waiting, poll every 10 seconds for completion!
    const interval = setInterval(() => {
      loadData(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [loadData]);

  const handleCopy = async () => {
    if (!test) return;
    const publicUrl = formatPublicShareUrl(test.shareUrl, test.responderToken);
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert(`Link: ${publicUrl}`);
    }
  };

  const handleShare = async () => {
    if (!test) return;
    const publicUrl = formatPublicShareUrl(test.shareUrl, test.responderToken);
    if (navigator.share) {
      try {
        await navigator.share({
          title: test.title,
          text: `Hey ${test.friendName}! Take my friendship quiz to see how well you know me! ❤️`,
          url: publicUrl,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleRotate = async () => {
    if (!test) return;
    try {
      setIsRotating(true);
      const res = await rotateResponderLink(test.id);
      setTest((prev) =>
        prev
          ? {
              ...prev,
              shareUrl: res.shareUrl,
              responderToken: res.responderToken,
            }
          : null
      );
    } catch (err: any) {
      alert(err.message || 'Failed to rotate link.');
    } finally {
      setIsRotating(false);
    }
  };

  const handleOpenAnswers = () => {
    setViewMode('review');
    triggerLoveConfetti();
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <AnimatedTeddy pose="thinking" size={120} />
        <p className="text-sm font-bold text-slate-500 animate-pulse">
          Loading test details...
        </p>
      </div>
    );
  }

  if (errorMsg || !test) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AnimatedTeddy pose="waiting" size={130} />
        <div className="bg-white rounded-3xl border-2 border-rose-100 p-6 shadow-md space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Cannot View Test</h2>
          <p className="text-xs text-slate-600">{errorMsg || 'Test not found.'}</p>
          <button
            onClick={() => onNavigate('/dashboard')}
            className="px-5 py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = test.status === 'completed';

  // If in answers review mode
  if (viewMode === 'review' && answerReview) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewMode('overview')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Test Overview</span>
          </button>
        </div>

        {/* Header Banner */}
        <div className="bg-white rounded-3xl border-2 border-rose-100 p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold mb-1">
              <MessageSquareHeart className="w-3.5 h-3.5" />
              <span>Answers Received</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800">
              {test.friendName}'s Submitted Answers
            </h1>
            <p className="text-xs text-slate-500">
              Answers for quiz <strong className="text-slate-700">“{test.title}”</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center px-4 py-2.5 rounded-2xl bg-rose-50 border border-rose-200">
              <div className="text-xl font-black text-rose-700">{answerReview.summary.total}</div>
              <div className="text-[10px] font-bold text-rose-600 uppercase">Questions</div>
            </div>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>Answers Comparison</span>
            <span className="text-xs font-medium text-slate-400">
              ({answerReview.answers.length} total)
            </span>
          </h2>

          <div className="space-y-4">
            {answerReview.answers.map((item, idx) => (
              <motion.div
                key={item.questionId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl border-2 border-rose-100/80 p-5 shadow-xs hover:shadow-md transition-all"
              >
                {/* Header: Question order */}
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                  <span className="text-xs font-black text-rose-600 uppercase tracking-wider">
                    Question {idx + 1}
                  </span>

                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-500">
                    {item.questionType}
                  </span>
                </div>

                {/* Question Text */}
                <h3 className="font-extrabold text-base text-slate-800 mb-4 leading-snug">
                  {item.questionText}
                </h3>

                {/* Answers Comparison Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Expected Answer */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Expected Answer
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {item.expectedAnswer}
                    </span>
                    {item.acceptedAnswers && item.acceptedAnswers.length > 0 && (
                      <span className="block text-[11px] text-slate-400 mt-1">
                        Also accepted: {item.acceptedAnswers.join(', ')}
                      </span>
                    )}
                  </div>

                  {/* Responder Answer */}
                  <div className="p-3.5 rounded-xl border bg-rose-50/50 border-rose-200 text-rose-900">
                    <span className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-rose-700">
                      {test.friendName}'s Answer
                    </span>
                    <span className="text-sm font-extrabold">
                      {item.responderAnswer || '(No answer provided)'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default: Overview Mode
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Top back button */}
      <button
        type="button"
        onClick={() => onNavigate('/dashboard')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Dashboard</span>
      </button>

      {/* Main Info Card */}
      <div className="bg-white rounded-3xl border-2 border-rose-100 p-6 sm:p-8 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-50 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Friendship Quiz</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {test.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Created by <strong className="text-slate-700">{test.ownerName}</strong> for{' '}
              <strong className="text-rose-600">{test.friendName}</strong>
            </p>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black self-start sm:self-center ${
              isCompleted
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Completed</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Waiting for response</span>
              </>
            )}
          </span>
        </div>

        {/* Shareable Link Box */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Shareable Responder Link
          </label>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-2">
            <span className="font-mono text-xs sm:text-sm text-slate-700 truncate w-full flex-1 px-2 select-all">
              {formatPublicShareUrl(test.shareUrl, test.responderToken)}
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopy}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied! ❤️</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                disabled={isRotating}
                onClick={handleRotate}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer"
                title="Generate new link (revokes current link)"
              >
                <RefreshCw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            If you rotate this link, any previously shared links will stop working immediately.
          </p>
        </div>

        {/* Completion or Waiting Status Banner */}
        {isCompleted ? (
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-2 border-emerald-200 rounded-3xl p-6 sm:p-8 text-center space-y-4">
            <div className="flex justify-center">
              <AnimatedTeddy pose="celebrating" size={130} />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                {test.friendName} has completed the test! 🎉
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Their answers are submitted and ready for you to view.
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleOpenAnswers}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <MessageSquareHeart className="w-4 h-4" />
                <span>View {test.friendName}'s Answers</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-amber-50/60 via-orange-50/30 to-white border-2 border-amber-200/80 rounded-3xl p-6 sm:p-8 text-center space-y-4">
            <div className="flex justify-center">
              <AnimatedTeddy pose="waiting" size={130} />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                Waiting for {test.friendName}... 🧸
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                Once {test.friendName} opens the link and completes the questions, this screen will update automatically.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-100/70 px-4 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Listening for live submission...</span>
            </div>
          </div>
        )}

        {/* Questions list preview for owner */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm flex items-center justify-between">
            <span>Configured Questions ({test.questions.length})</span>
          </h3>

          <div className="space-y-2">
            {test.questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-slate-700">{q.text}</span>
                </div>

                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500 shrink-0">
                  {q.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
