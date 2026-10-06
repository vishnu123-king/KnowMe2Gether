import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface FloatingStarsProps {
  count?: number;
}

export const FloatingStars: React.FC<FloatingStarsProps> = ({ count = 8 }) => {
  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      top: `${(i * 12 + 8) % 85}%`,
      left: `${(i * 14 + 5) % 92}%`,
      size: 10 + ((i * 5) % 14),
      delay: (i * 0.5) % 3,
      duration: 3 + ((i * 0.8) % 3),
      color: ['#fbbf24', '#f59e0b', '#fde047', '#f472b6'][i % 4],
    }));
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute"
          style={{
            top: s.top,
            left: s.left,
            color: s.color,
            width: s.size,
            height: s.size,
          }}
          animate={{
            scale: [0.7, 1.25, 0.7],
            opacity: [0.3, 0.9, 0.3],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-sm">
            <path d="M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};
