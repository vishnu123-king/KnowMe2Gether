import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface FloatingHeartsProps {
  count?: number;
}

export const FloatingHearts: React.FC<FloatingHeartsProps> = ({ count = 12 }) => {
  const hearts = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${(i * 9 + 4) % 94}%`,
      size: 14 + ((i * 7) % 18),
      delay: (i * 0.7) % 4,
      duration: 6 + ((i * 1.3) % 5),
      color: ['#f43f5e', '#fb7185', '#fda4af', '#f472b6', '#ec4899', '#fbb6ce'][i % 6],
    }));
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          className="absolute"
          style={{
            left: h.left,
            bottom: '-20px',
            color: h.color,
            width: h.size,
            height: h.size,
          }}
          initial={{ y: 0, opacity: 0, scale: 0.6 }}
          animate={{
            y: '-110vh',
            opacity: [0, 0.75, 0.8, 0],
            scale: [0.6, 1.1, 0.9, 1],
            rotate: [0, (h.id % 2 === 0 ? 25 : -25), 0],
          }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-full h-full drop-shadow-sm"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};
