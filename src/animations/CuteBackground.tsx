import React from 'react';
import { FloatingEmojis } from './FloatingEmojis';

export const CuteBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-gradient-to-b from-rose-50 via-pink-50/40 to-amber-50/30">
      {/* Soft blurred background ambient blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-rose-200/35 blur-3xl" />
      <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-pink-200/30 blur-3xl" />
      <div className="absolute -bottom-24 left-1/4 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl" />

      {/* Floating emojis and characters */}
      <FloatingEmojis count={16} />
    </div>
  );
};
