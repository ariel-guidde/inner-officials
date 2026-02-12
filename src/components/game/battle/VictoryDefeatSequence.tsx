import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Sparkles } from 'lucide-react';
import { SPRING_PRESETS, TANG_COLORS } from '../../../lib/animations/constants';

interface VictoryDefeatSequenceProps {
  isVisible: boolean;
  isVictory: boolean;
  onComplete?: () => void;
}

export default function VictoryDefeatSequence({ isVisible, isVictory, onComplete }: VictoryDefeatSequenceProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Darkening overlay with different opacity for victory/defeat */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isVictory ? 0.6 : 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`fixed inset-0 z-[95] ${isVictory ? 'bg-black' : 'bg-stone-950'}`}
          />

          {/* Main sequence */}
          <div className="fixed inset-0 z-[96] flex items-center justify-center pointer-events-none">
            {isVictory ? <VictorySequence /> : <DefeatSequence />}
          </div>

          {/* Auto-complete after animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 3.5 }}
            onAnimationComplete={onComplete}
          />
        </>
      )}
    </AnimatePresence>
  );
}

function VictorySequence() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Golden particles burst */}
      {Array.from({ length: 40 }).map((_, i) => {
        const angle = (i / 40) * Math.PI * 2;
        const distance = 300 + Math.random() * 200;
        const size = 8 + Math.random() * 16;

        return (
          <motion.div
            key={`particle-${i}`}
            initial={{
              x: 0,
              y: 0,
              opacity: 0,
              scale: 0,
            }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              opacity: [0, 1, 0.8, 0],
              scale: [0, 1.5, 1, 0],
              rotate: [0, Math.random() * 360],
            }}
            transition={{
              duration: 2,
              delay: 0.5 + (i * 0.02),
              ease: 'easeOut',
            }}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: TANG_COLORS.imperialGold,
              boxShadow: `0 0 20px ${TANG_COLORS.imperialGold}`,
            }}
          />
        );
      })}

      {/* Upward scroll reveal */}
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{
          ...SPRING_PRESETS.dramatic,
          delay: 0.3,
        }}
        className="relative bg-gradient-to-b from-amber-950 via-yellow-900 to-amber-950 border-4 border-amber-500 rounded-3xl px-16 py-12"
        style={{
          transformOrigin: 'bottom',
          boxShadow: `0 0 80px ${TANG_COLORS.imperialGold}, inset 0 0 60px rgba(255, 215, 0, 0.2)`,
        }}
      >
        {/* Tang Dynasty corner decorations */}
        {[
          { top: '-8px', left: '-8px', tl: true },
          { top: '-8px', right: '-8px', tr: true },
          { bottom: '-8px', left: '-8px', bl: true },
          { bottom: '-8px', right: '-8px', br: true },
        ].map((pos, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              ...SPRING_PRESETS.bouncy,
              delay: 0.6 + i * 0.1,
            }}
            className={`
              absolute w-8 h-8 border-amber-500 border-4
              ${pos.tl ? 'border-r-0 border-b-0 rounded-tl-2xl' : ''}
              ${pos.tr ? 'border-l-0 border-b-0 rounded-tr-2xl' : ''}
              ${pos.bl ? 'border-r-0 border-t-0 rounded-bl-2xl' : ''}
              ${pos.br ? 'border-l-0 border-t-0 rounded-br-2xl' : ''}
            `}
            style={pos as React.CSSProperties}
          />
        ))}

        {/* Trophy icon with bounce */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{
            scale: 1,
            rotate: 0,
          }}
          transition={{
            ...SPRING_PRESETS.bouncy,
            delay: 0.8,
          }}
          className="flex justify-center mb-6"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-2xl"
            style={{
              boxShadow: `0 0 40px ${TANG_COLORS.imperialGold}`,
            }}
          >
            <Trophy className="w-14 h-14 text-white" />
          </motion.div>
        </motion.div>

        {/* Victory text with calligraphy-style animation */}
        <motion.h2
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            ...SPRING_PRESETS.dramatic,
            delay: 1,
          }}
          className="text-7xl font-bold text-center mb-4"
          style={{
            background: `linear-gradient(180deg, ${TANG_COLORS.lotusWhite}, ${TANG_COLORS.imperialGold})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 4px 20px rgba(255, 215, 0, 0.8)',
          }}
        >
          Victory
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 1.2,
            duration: 0.6,
          }}
          className="text-2xl text-center text-amber-200"
        >
          Your eloquence has won the day
        </motion.p>

        {/* Sparkles around text */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              rotate: [0, 180],
            }}
            transition={{
              duration: 1.5,
              delay: 1 + i * 0.15,
              repeat: Infinity,
              repeatDelay: 1,
            }}
            className="absolute"
            style={{
              left: `${20 + (i % 4) * 20}%`,
              top: `${30 + Math.floor(i / 4) * 40}%`,
            }}
          >
            <Sparkles className="w-6 h-6 text-amber-400" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function DefeatSequence() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Smoke/ash particles falling */}
      {Array.from({ length: 30 }).map((_, i) => {
        const x = Math.random() * window.innerWidth;
        const duration = 3 + Math.random() * 2;

        return (
          <motion.div
            key={`ash-${i}`}
            initial={{
              x,
              y: -50,
              opacity: 0,
            }}
            animate={{
              y: window.innerHeight + 50,
              opacity: [0, 0.6, 0.4, 0],
              x: x + (Math.random() - 0.5) * 100,
            }}
            transition={{
              duration,
              delay: i * 0.1,
              ease: 'linear',
            }}
            className="absolute w-2 h-2 bg-stone-400 rounded-full opacity-50"
          />
        );
      })}

      {/* Downward fade reveal */}
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{
          ...SPRING_PRESETS.smooth,
          delay: 0.3,
        }}
        className="relative bg-gradient-to-b from-stone-900 via-red-950 to-stone-900 border-4 border-red-800 rounded-3xl px-16 py-12"
        style={{
          transformOrigin: 'top',
          boxShadow: '0 0 60px rgba(127, 29, 29, 0.6), inset 0 0 40px rgba(127, 29, 29, 0.2)',
        }}
      >
        {/* X icon */}
        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            ...SPRING_PRESETS.smooth,
            delay: 0.6,
          }}
          className="flex justify-center mb-6"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-900 to-stone-800 flex items-center justify-center border-4 border-red-700 shadow-2xl">
            <X className="w-14 h-14 text-red-400" />
          </div>
        </motion.div>

        {/* Defeat text */}
        <motion.h2
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            ...SPRING_PRESETS.smooth,
            delay: 0.8,
          }}
          className="text-7xl font-bold text-center text-red-300 mb-4"
          style={{
            textShadow: '0 4px 20px rgba(239, 68, 68, 0.6)',
          }}
        >
          Defeat
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 1,
            duration: 0.6,
          }}
          className="text-2xl text-center text-stone-400"
        >
          Your words have failed to persuade
        </motion.p>
      </motion.div>
    </div>
  );
}
