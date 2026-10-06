import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface FloatingEmojisProps {
  count?: number;
}

const EMOJI_LIST = ['🐼', '🧸', '🌟', '⭐', '🌸', '🎈', '☁️', '🎀', '✨', '💖', '🍀', '🧁'];

export const FloatingEmojis: React.FC<FloatingEmojisProps> = ({ count = 20 }) => {
  const items = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: EMOJI_LIST[i % EMOJI_LIST.length],
      left: `${(i * 5.2 + 2) % 96}%`,
      size: 18 + ((i * 4) % 18),
      delay: (i * 0.3) % 6,
      duration: 6 + ((i * 0.9) % 5),
      xOffset: (i % 2 === 0 ? 1 : -1) * (20 + (i * 6) % 40),
    }));
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {items.map((item) => (
        <motion.div
          key={item.id}
          className="absolute select-none drop-shadow-md"
          style={{
            left: item.left,
            bottom: '-50px',
            fontSize: item.size,
          }}
          initial={{ y: 0, opacity: 0, scale: 0.4, x: 0 }}
          animate={{
            y: '-120vh',
            opacity: [0, 0.9, 0.95, 0],
            scale: [0.4, 1.3, 1.1, 0.9],
            x: [0, item.xOffset, -item.xOffset, item.xOffset / 2],
            rotate: [0, 35, -35, 15],
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
