import React from 'react';
import { motion } from 'motion/react';

export type TeddyPose = 'waving' | 'thinking' | 'celebrating' | 'waiting' | 'surprised' | 'happy';

interface AnimatedTeddyProps {
  pose?: TeddyPose;
  className?: string;
  size?: number;
}

export const AnimatedTeddy: React.FC<AnimatedTeddyProps> = ({
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
          {/* Fur Gradient */}
          <linearGradient id="furGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          {/* Inner Ear Gradient */}
          <linearGradient id="innerEarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fecdd3" />
            <stop offset="100%" stopColor="#fda4af" />
          </linearGradient>
          {/* Muzzle Gradient */}
          <linearGradient id="muzzleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
        </defs>

        {/* Ambient shadow underneath */}
        <ellipse cx="100" cy="188" rx="65" ry="8" fill="#e2e8f0" opacity="0.6" />

        {/* Ears */}
        {/* Left Ear */}
        <motion.g
          animate={
            pose === 'celebrating'
              ? { rotate: [-5, 5, -5], transformOrigin: '55px 50px' }
              : { rotate: [-2, 2, -2], transformOrigin: '55px 50px' }
          }
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <circle cx="55" cy="52" r="26" fill="url(#furGradient)" stroke="#92400e" strokeWidth="2.5" />
          <circle cx="55" cy="52" r="16" fill="url(#innerEarGrad)" opacity="0.9" />
        </motion.g>

        {/* Right Ear */}
        <motion.g
          animate={
            pose === 'celebrating'
              ? { rotate: [5, -5, 5], transformOrigin: '145px 50px' }
              : { rotate: [2, -2, 2], transformOrigin: '145px 50px' }
          }
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <circle cx="145" cy="52" r="26" fill="url(#furGradient)" stroke="#92400e" strokeWidth="2.5" />
          <circle cx="145" cy="52" r="16" fill="url(#innerEarGrad)" opacity="0.9" />
        </motion.g>

        {/* Body */}
        <ellipse
          cx="100"
          cy="148"
          rx="52"
          ry="44"
          fill="url(#furGradient)"
          stroke="#92400e"
          strokeWidth="2.5"
        />

        {/* Tummy patch */}
        <ellipse cx="100" cy="150" rx="34" ry="28" fill="url(#muzzleGrad)" opacity="0.95" />

        {/* Tummy little heart */}
        <path
          d="M100 144 C98 139, 92 139, 92 145 C92 149, 100 155, 100 155 C100 155, 108 149, 108 145 C108 139, 102 139, 100 144 Z"
          fill="#f43f5e"
          opacity="0.8"
        />

        {/* Feet / Legs */}
        <ellipse cx="64" cy="178" rx="20" ry="12" fill="url(#furGradient)" stroke="#92400e" strokeWidth="2" />
        <ellipse cx="64" cy="177" rx="12" ry="7" fill="#fecdd3" opacity="0.8" />

        <ellipse cx="136" cy="178" rx="20" ry="12" fill="url(#furGradient)" stroke="#92400e" strokeWidth="2" />
        <ellipse cx="136" cy="177" rx="12" ry="7" fill="#fecdd3" opacity="0.8" />

        {/* Head */}
        <circle
          cx="100"
          cy="92"
          r="50"
          fill="url(#furGradient)"
          stroke="#92400e"
          strokeWidth="2.5"
        />

        {/* Muzzle */}
        <ellipse cx="100" cy="106" rx="28" ry="20" fill="url(#muzzleGrad)" stroke="#d97706" strokeWidth="1" />

        {/* Nose */}
        <path
          d="M93 98 Q100 95 107 98 Q103 107 100 107 Q97 107 93 98 Z"
          fill="#451a03"
        />
        {/* Little shine on nose */}
        <ellipse cx="98" cy="98" rx="2" ry="1.2" fill="#ffffff" opacity="0.7" />

        {/* Mouth */}
        {pose === 'surprised' ? (
          <ellipse cx="100" cy="114" rx="5" ry="7" fill="#881337" />
        ) : pose === 'celebrating' ? (
          <path
            d="M93 109 Q100 120 107 109"
            fill="#be123c"
            stroke="#451a03"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M94 108 Q100 115 106 108"
            fill="none"
            stroke="#451a03"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        )}

        {/* Cheeks - Rosy blush */}
        <ellipse cx="72" cy="106" rx="9" ry="6" fill="#f43f5e" opacity="0.5" />
        <ellipse cx="128" cy="106" rx="9" ry="6" fill="#f43f5e" opacity="0.5" />

        {/* Eyes */}
        <motion.g
          animate={
            pose === 'thinking'
              ? { y: [-1, 0, -1] }
              : { scaleY: [1, 1, 0.1, 1, 1] }
          }
          transition={{
            repeat: Infinity,
            repeatDelay: 3.5,
            duration: 0.35,
          }}
          style={{ transformOrigin: '100px 84px' }}
        >
          {/* Left Eye */}
          <circle cx="82" cy="84" r="5.5" fill="#1e1b4b" />
          <circle cx="84" cy="82" r="2" fill="#ffffff" />

          {/* Right Eye */}
          <circle cx="118" cy="84" r="5.5" fill="#1e1b4b" />
          <circle cx="120" cy="82" r="2" fill="#ffffff" />
        </motion.g>

        {/* Eye Brows */}
        {pose === 'thinking' ? (
          <>
            <path d="M76 74 Q82 71 88 75" fill="none" stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M112 76 Q118 73 124 73" fill="none" stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M76 75 Q82 72 88 74" fill="none" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
            <path d="M112 74 Q118 72 124 75" fill="none" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {/* Paws and Pose Props */}
        {pose === 'waving' && (
          <>
            {/* Left Hand still resting */}
            <circle cx="56" cy="144" r="14" fill="url(#furGradient)" stroke="#92400e" strokeWidth="2" />
            <circle cx="56" cy="144" r="8" fill="#fecdd3" opacity="0.8" />

            {/* Right Hand Waving */}
            <motion.g
              animate={{ rotate: [-18, 22, -18] }}
              transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
              style={{ transformOrigin: '144px 130px' }}
            >
              <ellipse cx="152" cy="100" rx="13" ry="16" fill="url(#furGradient)" stroke="#92400e" strokeWidth="2" />
              <ellipse cx="152" cy="100" rx="7" ry="10" fill="#fecdd3" opacity="0.8" />
              {/* Little sparkle above hand */}
              <path
                d="M170 80 L172 85 L177 87 L172 89 L170 94 L168 89 L163 87 L168 85 Z"
                fill="#fbbf24"
              />
            </motion.g>
          </>
        )}

        {pose === 'thinking' && (
          <>
            {/* Left Hand on side */}
            <circle cx="56" cy="146" r="14" fill="url(#furGradient)" stroke="#92400e" strokeWidth="2" />
            {/* Right Hand on Chin */}
            <circle cx="120" cy="116" r="13" fill="url(#furGradient)" stroke="#92400e" strokeWidth="2" />
            <circle cx="120" cy="116" r="7" fill="#fecdd3" opacity="0.8" />

            {/* Thought question mark */}
            <motion.g
              animate={{ y: [-3, 3, -3], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <circle cx="160" cy="50" r="15" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.5" />
              <text
                x="160"
                y="55"
                textAnchor="middle"
                fontSize="16"
                fontWeight="bold"
                fill="#b45309"
              >
                ?
              </text>
            </motion.g>
          </>
        )}

        {pose === 'celebrating' && (
          <>
            {/* Party Hat */}
            <polygon points="100,24 84,60 116,60" fill="#ec4899" stroke="#be185d" strokeWidth="2" />
            <circle cx="100" cy="22" r="5" fill="#fde047" />
            <line x1="88" y1="50" x2="112" y2="50" stroke="#fde047" strokeWidth="3" />

            {/* Left Hand Raised */}
            <motion.g
              animate={{ rotate: [12, -12, 12] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              style={{ transformOrigin: '56px 130px' }}
            >
              <ellipse cx="44" cy="95" rx="14" ry="16" fill="url(#furGradient)" stroke="#92400e" strokeWidth="2" />
              <ellipse cx="44" cy="95" rx="8" ry="10" fill="#fecdd3" opacity="0.8" />
            </motion.g>

            {/* Right Hand Raised holding balloon string */}
            <motion.g
              animate={{ rotate: [-12, 12, -12] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              style={{ transformOrigin: '144px 130px' }}
            >
              <ellipse cx="156" cy="95" rx="14" ry="16" fill="url(#furGradient)" stroke="#92400e" strokeWidth="2" />
              <ellipse cx="156" cy="95" rx="8" ry="10" fill="#fecdd3" opacity="0.8" />
            </motion.g>

            {/* Heart Balloon */}
            <motion.g
              animate={{ y: [-4, 4, -4], rotate: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              style={{ transformOrigin: '165px 45px' }}
            >
              <path
                d="M165 42 C162 36, 153 36, 153 44 C153 50, 165 59, 165 59 C165 59, 177 50, 177 44 C177 36, 168 36, 165 42 Z"
                fill="#f43f5e"
              />
              <path d="M165 59 Q166 75 160 90" fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="2,2" />
            </motion.g>
          </>
        )}

        {pose === 'waiting' && (
          <>
            {/* Both hands holding a letter with heart stamp */}
            <rect
              x="80"
              y="134"
              width="40"
              height="28"
              rx="4"
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
            <path d="M80 134 L100 148 L120 134" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
            {/* Heart stamp on letter */}
            <path
              d="M100 148 C99 146, 96 146, 96 149 C96 151, 100 154, 100 154 C100 154, 104 151, 104 149 C104 146, 101 146, 100 148 Z"
              fill="#f43f5e"
            />

            {/* Left and right paws holding the letter */}
            <circle cx="78" cy="146" r="11" fill="url(#furGradient)" stroke="#92400e" strokeWidth="1.8" />
            <circle cx="122" cy="146" r="11" fill="url(#furGradient)" stroke="#92400e" strokeWidth="1.8" />
          </>
        )}

        {(pose === 'happy' || pose === 'surprised') && (
          <>
            {/* Paws gently placed on tummy */}
            <circle cx="68" cy="142" r="12" fill="url(#furGradient)" stroke="#92400e" strokeWidth="2" />
            <circle cx="68" cy="142" r="7" fill="#fecdd3" opacity="0.8" />

            <circle cx="132" cy="142" r="12" fill="url(#furGradient)" stroke="#92400e" strokeWidth="2" />
            <circle cx="132" cy="142" r="7" fill="#fecdd3" opacity="0.8" />
          </>
        )}
      </motion.svg>
    </div>
  );
};
