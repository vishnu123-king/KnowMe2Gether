import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface FloatingEmojisProps {
  count?: number;
}

const EMOJI_LIST = ['🐼', '🧸', '❤️', '⭐', '🌸', '🎈', '☁️', '🎀', '✨'];

export const FloatingEmojis: React.FC<FloatingEmojisProps> = ({ count = 16 }) => {
  const items = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: EMOJI_LIST[i % EMOJI_LIST.length],
      left: `${(i * 6.5 + 3) % 95}%`,
      size: 16 + ((i * 3) % 16),
      delay: (i * 0.4) % 5,
      duration: 7 + ((i * 1.1) % 6),
      xOffset: (i % 2 === 0 ? 1 : -1) * (15 + (i * 5) % 30),
    }));
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {items.map((item) => (
        <motion.div
          key={item.id}
          className="absolute select-none drop-shadow-sm"
          style={{
            left: item.left,
            bottom: '-40px',
            fontSize: item.size,
          }}
          initial={{ y: 0, opacity: 0, scale: 0.5, x: 0 }}
          animate={{
            y: '-115vh',
            opacity: [0, 0.85, 0.9, 0],
            scale: [0.5, 1.2, 1, 0.8],
            x: [0, item.xOffset, -item.xOffset, 0],
            rotate: [0, 20, -20, 10],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {item.emoji}
        </motion.div>
      ))}
    </div>
  );
};
