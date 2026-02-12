import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Shield } from 'lucide-react';
import { SPRING_PRESETS, TANG_COLORS } from '../../../lib/animations/constants';

interface TurnTransitionProps {
  isVisible: boolean;
  isPlayerTurn: boolean;
  turnNumber?: number;
}

export default function TurnTransition({ isVisible, isPlayerTurn, turnNumber }: TurnTransitionProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Darkening overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-[90]"
          />

          {/* Main banner */}
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{
              ...SPRING_PRESETS.dramatic,
              duration: 0.6,
            }}
            className="fixed inset-0 z-[91] flex items-center justify-center pointer-events-none"
          >
            <div className="relative">
              {/* Tang Dynasty decorative background */}
              <motion.div
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  ...SPRING_PRESETS.bouncy,
                  delay: 0.2,
                }}
                className={`
                  relative px-20 py-12
                  ${isPlayerTurn ? 'bg-gradient-to-r from-green-950 to-emerald-900' : 'bg-gradient-to-r from-red-950 to-orange-900'}
                  border-4 rounded-2xl
                  ${isPlayerTurn ? 'border-amber-500' : 'border-red-500'}
                  shadow-2xl
                `}
                style={{
                  boxShadow: isPlayerTurn
                    ? `0 0 60px ${TANG_COLORS.jadeGreen}, inset 0 0 40px rgba(0, 168, 107, 0.2)`
                    : `0 0 60px ${TANG_COLORS.vermillion}, inset 0 0 40px rgba(227, 66, 52, 0.2)`,
                }}
              >
                {/* Cloud scroll corner decorations */}
                <div className="absolute -top-4 -left-4 w-16 h-16 border-t-4 border-l-4 border-amber-500 rounded-tl-2xl" />
                <div className="absolute -top-4 -right-4 w-16 h-16 border-t-4 border-r-4 border-amber-500 rounded-tr-2xl" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 border-b-4 border-l-4 border-amber-500 rounded-bl-2xl" />
                <div className="absolute -bottom-4 -right-4 w-16 h-16 border-b-4 border-r-4 border-amber-500 rounded-br-2xl" />

                {/* Content */}
                <div className="relative flex flex-col items-center gap-4">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      ...SPRING_PRESETS.bouncy,
                      delay: 0.3,
                    }}
                    className={`
                      w-20 h-20 rounded-full flex items-center justify-center
                      ${isPlayerTurn ? 'bg-green-500/30' : 'bg-red-500/30'}
                      border-4
                      ${isPlayerTurn ? 'border-green-400' : 'border-red-400'}
                    `}
                  >
                    {isPlayerTurn ? (
                      <Shield className="w-10 h-10 text-green-300" />
                    ) : (
                      <Swords className="w-10 h-10 text-red-300" />
                    )}
                  </motion.div>

                  {/* Turn text */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      ...SPRING_PRESETS.bouncy,
                      delay: 0.4,
                    }}
                    className="text-center"
                  >
                    <div
                      className={`
                        text-6xl font-bold mb-2
                        ${isPlayerTurn ? 'text-amber-100' : 'text-orange-100'}
                      `}
                      style={{
                        textShadow: isPlayerTurn
                          ? `0 0 20px ${TANG_COLORS.jadeGreen}, 0 4px 8px rgba(0, 0, 0, 0.5)`
                          : `0 0 20px ${TANG_COLORS.vermillion}, 0 4px 8px rgba(0, 0, 0, 0.5)`,
                      }}
                    >
                      {isPlayerTurn ? 'Your Turn' : "Opponent's Turn"}
                    </div>

                    {turnNumber !== undefined && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-xl text-stone-300"
                      >
                        Turn {turnNumber}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Subtitle */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      ...SPRING_PRESETS.smooth,
                      delay: 0.5,
                    }}
                    className={`
                      px-6 py-2 rounded-full border-2
                      ${isPlayerTurn ? 'bg-green-900/50 border-green-500/50 text-green-200' : 'bg-red-900/50 border-red-500/50 text-red-200'}
                      text-sm font-medium
                    `}
                  >
                    {isPlayerTurn ? 'Prepare your argument' : 'Opponent is speaking...'}
                  </motion.div>
                </div>
              </motion.div>

              {/* Floating particles */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const distance = 200 + Math.random() * 100;

                return (
                  <motion.div
                    key={i}
                    initial={{
                      x: 0,
                      y: 0,
                      opacity: 0,
                      scale: 0,
                    }}
                    animate={{
                      x: Math.cos(angle) * distance,
                      y: Math.sin(angle) * distance,
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                    }}
                    transition={{
                      duration: 1.2,
                      delay: 0.3 + i * 0.05,
                      ease: 'easeOut',
                    }}
                    className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: isPlayerTurn ? TANG_COLORS.jadeGreen : TANG_COLORS.vermillion,
                      boxShadow: `0 0 10px ${isPlayerTurn ? TANG_COLORS.jadeGreen : TANG_COLORS.vermillion}`,
                    }}
                  />
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
