import { motion } from 'framer-motion';
import { TANG_COLORS } from '../../lib/animations/constants';

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(135deg,
          ${TANG_COLORS.imperialRed} 0%,
          ${TANG_COLORS.vermillion} 25%,
          ${TANG_COLORS.bronze} 50%,
          ${TANG_COLORS.imperialGold} 75%,
          ${TANG_COLORS.imperialRed} 100%
        )`,
        backgroundSize: '400% 400%',
      }}
    >
      {/* Animated gradient background */}
      <motion.div
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg,
            ${TANG_COLORS.imperialRed} 0%,
            ${TANG_COLORS.vermillion} 25%,
            ${TANG_COLORS.bronze} 50%,
            ${TANG_COLORS.imperialGold} 75%,
            ${TANG_COLORS.imperialRed} 100%
          )`,
          backgroundSize: '400% 400%',
        }}
      />

      {/* Imperial pattern overlay */}
      <div className="absolute inset-0 opacity-20">
        {/* Cloud scrolls */}
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={`cloud-${i}`}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              rotate: Math.random() * 360,
            }}
            animate={{
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
              ],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
              ],
              rotate: [Math.random() * 360, Math.random() * 360 + 360],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute w-12 h-12 border-2 border-white/40 rounded-full"
          />
        ))}
      </div>

      {/* Lotus flower pattern in center */}
      <div className="relative z-10">
        {/* Rotating lotus petals */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="relative w-40 h-40"
        >
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * 360;
            return (
              <motion.div
                key={`petal-${i}`}
                className="absolute inset-0"
                style={{
                  transform: `rotate(${angle}deg)`,
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-20 rounded-full"
                  style={{
                    background: `radial-gradient(ellipse at center,
                      ${TANG_COLORS.lotusWhite},
                      ${TANG_COLORS.plumBlossom}
                    )`,
                    boxShadow: `0 0 20px ${TANG_COLORS.plumBlossom}`,
                  }}
                />
              </motion.div>
            );
          })}

          {/* Center circle */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className="w-16 h-16 rounded-full"
              style={{
                background: `radial-gradient(circle,
                  ${TANG_COLORS.imperialGold},
                  ${TANG_COLORS.bronze}
                )`,
                boxShadow: `0 0 40px ${TANG_COLORS.imperialGold}`,
              }}
            />
          </motion.div>
        </motion.div>

        {/* Loading text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <motion.h2
            animate={{
              opacity: [1, 0.6, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="text-3xl font-bold text-white tracking-wider"
            style={{
              textShadow: `0 0 20px ${TANG_COLORS.imperialGold}, 0 4px 8px rgba(0,0,0,0.5)`,
            }}
          >
            Inner Officials
          </motion.h2>
          <motion.p
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
            className="mt-2 text-amber-100 text-sm tracking-widest"
          >
            Preparing the Court...
          </motion.p>
        </motion.div>

        {/* Decorative corners */}
        {[
          { top: -120, left: -120, rotation: 0 },
          { top: -120, right: -120, rotation: 90 },
          { bottom: -120, left: -120, rotation: 270 },
          { bottom: -120, right: -120, rotation: 180 },
        ].map((pos, i) => (
          <motion.div
            key={`corner-${i}`}
            initial={{ scale: 0, rotate: pos.rotation - 45 }}
            animate={{ scale: 1, rotate: pos.rotation }}
            transition={{
              delay: 0.2 + i * 0.1,
              duration: 0.6,
              type: 'spring',
              stiffness: 200,
            }}
            className="absolute w-16 h-16 border-4 border-amber-300"
            style={{
              ...pos,
              borderRadius: '0 0 0 100%',
              boxShadow: `0 0 20px ${TANG_COLORS.imperialGold}`,
            }}
          />
        ))}
      </div>

      {/* Sparkle particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          animate={{
            y: [0, -100],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeOut',
          }}
          className="absolute w-2 h-2 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: 0,
            boxShadow: '0 0 8px white',
          }}
        />
      ))}
    </motion.div>
  );
}
