import React from 'react';
import { motion } from 'motion/react';

export type PandaPose = 'waving' | 'thinking' | 'celebrating' | 'happy' | 'munching';

interface AnimatedPandaProps {
  pose?: PandaPose;
  className?: string;
  size?: number;
}

export const AnimatedPanda: React.FC<AnimatedPandaProps> = ({
  pose = 'happy',
  className = '',
  size = 140,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <motion.svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <defs>
          <linearGradient id="pandaBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>
          <linearGradient id="pandaEar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Ambient Shadow */}
        <ellipse cx="100" cy="188" rx="60" ry="8" fill="#cbd5e1" opacity="0.6" />

        {/* Ears */}
        {/* Left Ear */}
        <motion.g
          animate={pose === 'celebrating' ? { rotate: [-8, 8, -8], transformOrigin: '55px 45px' } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <circle cx="55" cy="46" r="22" fill="url(#pandaEar)" />
        </motion.g>

        {/* Right Ear */}
        <motion.g
          animate={pose === 'celebrating' ? { rotate: [8, -8, 8], transformOrigin: '145px 45px' } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <circle cx="145" cy="46" r="22" fill="url(#pandaEar)" />
        </motion.g>

        {/* Body */}
        <ellipse cx="100" cy="148" rx="48" ry="42" fill="url(#pandaBody)" stroke="#334155" strokeWidth="2.5" />

        {/* Panda Tummy Patch */}
        <ellipse cx="100" cy="152" rx="32" ry="26" fill="#ffffff" />

        {/* Heart on tummy */}
        <path
          d="M100 146 C98 141, 93 141, 93 147 C93 151, 100 156, 100 156 C100 156, 107 151, 107 147 C107 141, 102 141, 100 146 Z"
          fill="#f43f5e"
          opacity="0.85"
        />

        {/* Arms / Paws */}
        <ellipse cx="62" cy="138" rx="14" ry="18" fill="url(#pandaEar)" />
        <ellipse cx="138" cy="138" rx="14" ry="18" fill="url(#pandaEar)" />

        {/* Feet */}
        <ellipse cx="68" cy="178" rx="18" ry="11" fill="url(#pandaEar)" />
        <ellipse cx="132" cy="178" rx="18" ry="11" fill="url(#pandaEar)" />

        {/* Head */}
        <circle cx="100" cy="92" r="48" fill="url(#pandaBody)" stroke="#334155" strokeWidth="2.5" />

        {/* Eye Patches */}
        {/* Left Eye Patch */}
        <ellipse cx="78" cy="86" rx="16" ry="13" fill="#1e293b" transform="rotate(-15 78 86)" />
        {/* Right Eye Patch */}
        <ellipse cx="122" cy="86" rx="16" ry="13" fill="#1e293b" transform="rotate(15 122 86)" />

        {/* Eyes inside patches */}
        <circle cx="81" cy="85" r="5" fill="#ffffff" />
        <circle cx="82" cy="84" r="2.2" fill="#0f172a" />

        <circle cx="119" cy="85" r="5" fill="#ffffff" />
        <circle cx="118" cy="84" r="2.2" fill="#0f172a" />

        {/* Cute Nose */}
        <ellipse cx="100" cy="102" rx="7" ry="5" fill="#1e293b" />
        <ellipse cx="98" cy="100" rx="2" ry="1" fill="#ffffff" opacity="0.6" />

        {/* Mouth */}
        <path
          d="M93 108 Q100 115 107 108"
          fill="none"
          stroke="#1e293b"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Rosy Cheeks */}
        <ellipse cx="66" cy="98" rx="8" ry="5" fill="#f43f5e" opacity="0.45" />
        <ellipse cx="134" cy="98" rx="8" ry="5" fill="#f43f5e" opacity="0.45" />

        {/* Poses / Bamboo / Waving */}
        {pose === 'waving' && (
          <motion.g
            animate={{ rotate: [-15, 20, -15] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            style={{ transformOrigin: '142px 125px' }}
          >
            <ellipse cx="152" cy="100" rx="12" ry="15" fill="url(#pandaEar)" />
          </motion.g>
        )}

        {pose === 'celebrating' && (
          <>
            <motion.g
              animate={{ rotate: [10, -10, 10] }}
              transition={{ repeat: Infinity, duration: 0.7 }}
              style={{ transformOrigin: '58px 125px' }}
            >
              <ellipse cx="44" cy="92" rx="12" ry="15" fill="url(#pandaEar)" />
            </motion.g>

            <motion.g
              animate={{ rotate: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 0.7 }}
              style={{ transformOrigin: '142px 125px' }}
            >
              <ellipse cx="156" cy="92" rx="12" ry="15" fill="url(#pandaEar)" />
            </motion.g>
          </>
        )}

        {pose === 'munching' && (
          /* Bamboo stem in mouth */
          <g>
            <rect x="88" y="104" width="24" height="6" rx="3" fill="#22c55e" transform="rotate(-15 100 107)" />
            <ellipse cx="112" cy="100" rx="6" ry="8" fill="#15803d" />
          </g>
        )}
      </motion.svg>
    </div>
  );
};
