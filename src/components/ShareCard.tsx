import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Copy,
  Check,
  Share2,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Heart,
  ShieldCheck
} from 'lucide-react';
import { AnimatedTeddy } from './AnimatedTeddy';
import { formatPublicShareUrl } from '../utils/shareUrl';

interface ShareCardProps {
  shareUrl: string;
  responderName: string;
  testTitle: string;
  responderToken?: string;
  onRotateLink?: () => Promise<void>;
  onGoToDashboard: () => void;
  isRotating?: boolean;
}

export const ShareCard: React.FC<ShareCardProps> = ({
  shareUrl,
  responderName,
  testTitle,
  responderToken,
  onRotateLink,
  onGoToDashboard,
  isRotating = false,
}) => {
  const [copied, setCopied] = useState(false);
  const publicShareLink = formatPublicShareUrl(shareUrl, responderToken);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicShareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: testTitle || 'Friendship Test',
          text: `Hey! Take my friendship quiz to see how well you know me! ❤️`,
          url: publicShareLink,
        });
      } catch {
        // User cancelled or failed; fallback to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-white rounded-3xl border-2 border-rose-100 p-6 sm:p-8 shadow-xl max-w-xl mx-auto text-center relative overflow-hidden"
    >
      {/* Decorative top ribbon */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-rose-100/50 rounded-full blur-xl pointer-events-none" />

      {/* Cute celebrating teddy */}
      <div className="flex justify-center mb-2">
        <AnimatedTeddy pose="celebrating" size={150} />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold mb-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Ready to Share</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
        Your Test Is Ready! 🎉
      </h2>

      <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
        Send this special link to <strong className="text-rose-600 font-bold">{responderName}</strong>.
        Once they submit their answers, you will be able to privately view their responses!
      </p>

      {/* Share link container */}
      <div className="mt-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-2">
        <div className="flex-1 font-mono text-xs sm:text-sm text-slate-700 truncate w-full text-left px-2 select-all bg-white py-2 rounded-xl border border-slate-100">
          {publicShareLink}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer ${
            copied
              ? 'bg-emerald-500 text-white shadow-emerald-200'
              : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Link copied! ✨</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>

      {/* Action buttons */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Link</span>
        </button>

        <a
          href={publicShareLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open Test</span>
        </a>
      </div>

      {/* Privacy note */}
      <div className="mt-6 flex items-start gap-2.5 bg-rose-50/60 border border-rose-100 rounded-xl p-3 text-left">
        <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-600 leading-relaxed">
          <strong className="text-rose-700 font-bold">Privacy Guaranteed:</strong> Your friend will never see the correct answers or your dashboard upon submitting. Only you can view their answers on your dashboard.
        </p>
      </div>

      {/* Bottom management */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        {onRotateLink ? (
          <button
            type="button"
            disabled={isRotating}
            onClick={onRotateLink}
            className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            <span>Generate New Link (Revoke Previous)</span>
          </button>
        ) : <div />}

        <button
          type="button"
          onClick={onGoToDashboard}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
        >
          Go to Dashboard →
        </button>
      </div>
    </motion.div>
  );
};
