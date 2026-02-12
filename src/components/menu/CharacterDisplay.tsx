import { motion, AnimatePresence } from 'framer-motion';
import { CharacterAppearance, ATTIRE_OPTIONS } from '../../types/character';
import { SPRING_PRESETS } from '../../lib/animations/constants';

interface CharacterDisplayProps {
  character: CharacterAppearance;
}

export default function CharacterDisplay({ character }: CharacterDisplayProps) {
  const attire = ATTIRE_OPTIONS.find(a => a.id === character.attireId);

  return (
    <div className="relative w-64 h-96">
      {/* Base character silhouette */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING_PRESETS.smooth}
          className="relative w-48 h-80"
        >
          {/* Character base (beige/neutral) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Head */}
            <motion.div
              animate={{
                y: [0, -2, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-16 h-16 rounded-full bg-gradient-to-b from-amber-200 to-amber-300 border-2 border-amber-400 mb-2 relative"
            >
              {/* Hair - topknot */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-stone-900 rounded-full" />
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-10 bg-stone-900 rounded-t-full" />

              {/* Face features */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex gap-3 mt-2">
                  <div className="w-1.5 h-1.5 bg-stone-900 rounded-full" />
                  <div className="w-1.5 h-1.5 bg-stone-900 rounded-full" />
                </div>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-2 h-1 bg-stone-900/30 rounded-full" />
            </motion.div>

            {/* Body with attire overlay */}
            <div className="relative flex flex-col items-center">
              {/* Base body shape */}
              <div className="w-24 h-40 bg-gradient-to-b from-amber-200/50 to-amber-300/50 rounded-t-3xl" />

              {/* Attire overlay with animation */}
              <AnimatePresence mode="wait">
                {attire && (
                  <motion.div
                    key={attire.id}
                    initial={{
                      opacity: 0,
                      scale: 0.8,
                      y: -20,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.8,
                      y: 20,
                    }}
                    transition={SPRING_PRESETS.dramatic}
                    className="absolute inset-0 rounded-t-3xl overflow-hidden"
                    style={{
                      background: `linear-gradient(180deg,
                        ${attire.primaryColor} 0%,
                        ${attire.secondaryColor} 70%,
                        ${attire.primaryColor} 100%
                      )`,
                      boxShadow: `0 0 30px ${attire.primaryColor}40,
                                  inset 0 2px 20px ${attire.accentColor}20`,
                    }}
                  >
                    {/* Decorative patterns */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="absolute inset-0"
                    >
                      {/* Collar/neckline */}
                      <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-8 rounded-b-full border-2"
                        style={{
                          borderColor: attire.accentColor,
                          background: `radial-gradient(ellipse at top,
                            ${attire.accentColor}40,
                            transparent
                          )`,
                        }}
                      />

                      {/* Side decorations */}
                      <div
                        className="absolute top-10 left-2 w-1 h-24 rounded-full"
                        style={{ background: attire.accentColor }}
                      />
                      <div
                        className="absolute top-10 right-2 w-1 h-24 rounded-full"
                        style={{ background: attire.accentColor }}
                      />

                      {/* Central ornament */}
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="absolute top-12 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full"
                        style={{
                          background: attire.accentColor,
                          boxShadow: `0 0 15px ${attire.accentColor}`,
                        }}
                      />

                      {/* Bottom hem decoration */}
                      <div className="absolute bottom-0 left-0 right-0 h-6 flex justify-around items-center px-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              delay: 0.4 + i * 0.05,
                              ...SPRING_PRESETS.bouncy,
                            }}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: attire.accentColor }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sleeves */}
              <div className="absolute top-8 -left-6 w-8 h-20 rounded-full"
                style={{
                  background: attire
                    ? `linear-gradient(135deg, ${attire.primaryColor}, ${attire.secondaryColor})`
                    : 'linear-gradient(135deg, #e8dcc8, #d4c4a8)',
                }}
              />
              <div className="absolute top-8 -right-6 w-8 h-20 rounded-full"
                style={{
                  background: attire
                    ? `linear-gradient(225deg, ${attire.primaryColor}, ${attire.secondaryColor})`
                    : 'linear-gradient(225deg, #e8dcc8, #d4c4a8)',
                }}
              />

              {/* Lower robe extension */}
              <div
                className="w-32 h-16 rounded-b-3xl -mt-1"
                style={{
                  background: attire
                    ? `linear-gradient(180deg, ${attire.secondaryColor}, ${attire.primaryColor})`
                    : 'linear-gradient(180deg, #d4c4a8, #e8dcc8)',
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Character name display */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute -bottom-8 left-0 right-0 text-center"
      >
        <div className="text-xl font-bold text-amber-100">{character.name}</div>
        {attire && (
          <div className="text-sm text-stone-400 mt-1">{attire.name}</div>
        )}
      </motion.div>
    </div>
  );
}
