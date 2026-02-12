import { motion, AnimatePresence } from 'framer-motion';
import { Element, ELEMENT } from '../../../types/game';
import ElementIcon from '../ElementIcon';
import { SPRING_PRESETS, HARMONY_THEMES } from '../../../lib/animations/constants';
import { useEffect, useState } from 'react';

interface WuxingIndicatorProps {
  lastElement: Element | null;
  harmonyStreak: number;
}

const ELEMENT_ORDER: Element[] = [ELEMENT.WOOD, ELEMENT.FIRE, ELEMENT.EARTH, ELEMENT.METAL, ELEMENT.WATER];
const HARMONY_THRESHOLD = 5;

export default function WuxingIndicator({ lastElement, harmonyStreak }: WuxingIndicatorProps) {
  const [previousElement, setPreviousElement] = useState<Element | null>(null);
  const [showChaosExplosion, setShowChaosExplosion] = useState(false);
  const [showHarmonyFlow, setShowHarmonyFlow] = useState(false);

  // Detect element changes
  useEffect(() => {
    if (lastElement && lastElement !== previousElement) {
      const harmonyState = getHarmonyState(previousElement, lastElement);

      if (harmonyState === 'chaos') {
        setShowChaosExplosion(true);
        setTimeout(() => setShowChaosExplosion(false), 800);
      } else if (harmonyState === 'balanced') {
        setShowHarmonyFlow(true);
        setTimeout(() => setShowHarmonyFlow(false), 1000);
      }

      setPreviousElement(lastElement);
    }
  }, [lastElement, previousElement]);

  const getHarmonyState = (prev: Element | null, current: Element): 'balanced' | 'neutral' | 'dissonant' | 'chaos' => {
    if (!prev) return 'neutral';

    const prevIndex = ELEMENT_ORDER.indexOf(prev);
    const currentIndex = ELEMENT_ORDER.indexOf(current);
    const diff = (currentIndex - prevIndex + 5) % 5;

    if (diff === 1) return 'balanced'; // Next in cycle
    if (diff === 2) return 'chaos'; // Opposite
    return 'dissonant'; // Other positions
  };

  const getNextElement = (element: Element): Element => {
    const currentIndex = ELEMENT_ORDER.indexOf(element);
    return ELEMENT_ORDER[(currentIndex + 1) % 5];
  };

  const getChaosElement = (element: Element): Element => {
    const currentIndex = ELEMENT_ORDER.indexOf(element);
    return ELEMENT_ORDER[(currentIndex + 2) % 5];
  };

  const getDissonantElements = (element: Element): Element[] => {
    const currentIndex = ELEMENT_ORDER.indexOf(element);
    return [
      ELEMENT_ORDER[(currentIndex + 3) % 5],
      ELEMENT_ORDER[(currentIndex + 4) % 5],
    ];
  };

  const nextElement = lastElement ? getNextElement(lastElement) : null;
  const chaosElement = lastElement ? getChaosElement(lastElement) : null;
  const dissonantElements = lastElement ? getDissonantElements(lastElement) : [];
  const currentHarmonyState = getHarmonyState(previousElement, lastElement || ELEMENT.WOOD);
  const theme = HARMONY_THEMES[currentHarmonyState];

  // Calculate rotation angle to put last element at top
  const getRotationAngle = () => {
    if (!lastElement) return 0;
    const index = ELEMENT_ORDER.indexOf(lastElement);
    // Each element is 72 degrees apart, offset by -90 to start at top
    return -(index * 72);
  };

  const getNodeStyle = (element: Element) => {
    if (!lastElement) return { ring: 'ring-stone-600', bg: 'bg-stone-800', type: 'none' as const };
    if (lastElement === element) return { ring: 'ring-blue-500 ring-3', bg: 'bg-blue-900/70', type: 'current' as const };
    if (nextElement === element) return { ring: 'ring-green-500 ring-2', bg: 'bg-green-900/40', type: 'harmony' as const };
    if (chaosElement === element) return { ring: 'ring-red-500 ring-2', bg: 'bg-red-900/40', type: 'chaos' as const };
    if (dissonantElements.includes(element)) return { ring: 'ring-yellow-500 ring-1', bg: 'bg-yellow-900/20', type: 'dissonant' as const };
    return { ring: 'ring-stone-600', bg: 'bg-stone-800', type: 'none' as const };
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={SPRING_PRESETS.dramatic}
      className="bg-stone-900/90 border-2 border-stone-700 rounded-xl p-4 backdrop-blur-md shadow-2xl"
      style={{
        boxShadow: `0 0 30px ${theme.glowColor}`,
      }}
    >
      <div className="text-xs uppercase tracking-wider text-stone-400 mb-3 font-bold">
        Wuxing Flow
      </div>

      {/* Compass container */}
      <div className="relative w-36 h-36 mx-auto mb-4">
        {/* Chaos explosion effect */}
        <AnimatePresence>
          {showChaosExplosion && (
            <>
              {/* Screen shake effect */}
              <motion.div
                initial={{ x: 0 }}
                animate={{ x: [-5, 5, -5, 5, -3, 3, 0] }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              />

              {/* Explosion particles */}
              {Array.from({ length: 20 }).map((_, i) => {
                const angle = (i / 20) * Math.PI * 2;
                const distance = 80;
                return (
                  <motion.div
                    key={`explosion-${i}`}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      x: Math.cos(angle) * distance,
                      y: Math.sin(angle) * distance,
                      opacity: 0,
                      scale: 0,
                    }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute left-1/2 top-1/2 w-3 h-3 bg-red-500 rounded-full"
                    style={{ boxShadow: '0 0 10px #ef4444' }}
                  />
                );
              })}
            </>
          )}
        </AnimatePresence>

        {/* Harmony flow effect */}
        <AnimatePresence>
          {showHarmonyFlow && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 0.8, 0], scale: [0.8, 1.5, 2] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border-4 border-green-400"
              style={{ boxShadow: '0 0 40px #22c55e' }}
            />
          )}
        </AnimatePresence>

        {/* Rotating compass */}
        <motion.div
          animate={{ rotate: getRotationAngle() }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
            mass: 0.8,
          }}
          className="absolute inset-0"
        >
          {/* Connection lines - animated pentagon */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            {/* Static pentagon */}
            <polygon
              points="50,8 92,38 77,88 23,88 8,38"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-stone-700"
            />

            {/* Animated flow line */}
            {lastElement && (
              <motion.path
                d="M50,8 L92,38 L77,88 L23,88 L8,38 Z"
                fill="none"
                stroke={theme.primaryColor}
                strokeWidth="3"
                strokeDasharray="200"
                strokeDashoffset="200"
                animate={{ strokeDashoffset: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  filter: `drop-shadow(0 0 8px ${theme.glowColor})`,
                }}
              />
            )}

            {/* Flow direction dots */}
            {lastElement && nextElement && (
              <>
                {ELEMENT_ORDER.map((_, index) => {
                  const angle = (index * 72 - 90) * (Math.PI / 180);
                  const nextAngle = ((index + 1) * 72 - 90) * (Math.PI / 180);
                  const radius = 42;
                  const midX = 50 + radius * Math.cos((angle + nextAngle) / 2);
                  const midY = 50 + radius * Math.sin((angle + nextAngle) / 2);

                  return (
                    <motion.circle
                      key={`flow-${index}`}
                      cx={midX}
                      cy={midY}
                      r="2"
                      fill={theme.primaryColor}
                      animate={{
                        opacity: [0.3, 1, 0.3],
                        r: [1.5, 3, 1.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: index * 0.2,
                      }}
                      style={{
                        filter: `drop-shadow(0 0 4px ${theme.glowColor})`,
                      }}
                    />
                  );
                })}
              </>
            )}
          </svg>

          {/* Element nodes */}
          {ELEMENT_ORDER.map((element, index) => {
            const angle = (index * 72 - 90) * (Math.PI / 180);
            const radius = 42;
            const x = 50 + radius * Math.cos(angle);
            const y = 50 + radius * Math.sin(angle);
            const style = getNodeStyle(element);

            return (
              <div
                key={element}
                className="absolute"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Harmony flowing aura */}
                {style.type === 'harmony' && (
                  <>
                    <motion.div
                      animate={{
                        scale: [1, 1.6, 1],
                        opacity: [0.6, 0.9, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="absolute inset-0 w-12 h-12 -translate-x-2 -translate-y-2 rounded-full bg-green-500/30 blur-md"
                    />
                    <motion.div
                      animate={{
                        scale: [1.2, 1.8, 1.2],
                        opacity: [0.4, 0.7, 0.4],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.3,
                      }}
                      className="absolute inset-0 w-12 h-12 -translate-x-2 -translate-y-2 rounded-full bg-green-400/20 blur-lg"
                    />
                  </>
                )}

                {/* Chaos aggressive background */}
                {style.type === 'chaos' && (
                  <>
                    {/* Pulsing red danger aura */}
                    <motion.div
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="absolute inset-0 w-12 h-12 -translate-x-2 -translate-y-2 rounded-full bg-red-600/40 blur-md"
                    />
                    {/* Jagged burst effect */}
                    {Array.from({ length: 8 }).map((_, i) => {
                      const burstAngle = (i / 8) * 360;
                      return (
                        <motion.div
                          key={`burst-${i}`}
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                          className="absolute w-1 h-4 bg-orange-500 rounded-full"
                          style={{
                            left: '50%',
                            top: '50%',
                            transformOrigin: 'center',
                            transform: `translate(-50%, -50%) rotate(${burstAngle}deg) translateY(-12px)`,
                          }}
                        />
                      );
                    })}
                  </>
                )}

                {/* The element node itself */}
                <motion.div
                  className={`relative w-8 h-8 rounded-full ${style.bg} ${style.ring} ring-1 flex items-center justify-center`}
                  animate={
                    style.type === 'current'
                      ? {
                          scale: [1, 1.15, 1],
                        }
                      : {}
                  }
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <motion.div
                    animate={{ rotate: -getRotationAngle() }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 20,
                      mass: 0.8,
                    }}
                  >
                    <ElementIcon element={element} size="sm" />
                  </motion.div>
                </motion.div>
              </div>
            );
          })}
        </motion.div>

        {/* Center - harmony countdown */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-12 h-12 rounded-full bg-stone-800 border-2 border-stone-600 flex flex-col items-center justify-center shadow-xl"
            animate={
              harmonyStreak >= HARMONY_THRESHOLD
                ? {
                    scale: [1, 1.3, 1],
                    borderColor: ['#22c55e', '#86efac', '#22c55e'],
                    boxShadow: [
                      '0 0 10px rgba(34, 197, 94, 0.5)',
                      '0 0 30px rgba(34, 197, 94, 1)',
                      '0 0 10px rgba(34, 197, 94, 0.5)',
                    ],
                  }
                : {}
            }
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {harmonyStreak >= HARMONY_THRESHOLD ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={SPRING_PRESETS.bouncy}
                  className="text-[9px] text-green-400 font-bold"
                >
                  HARMONY
                </motion.div>
                {lastElement && <ElementIcon element={lastElement} size="xs" />}
              </>
            ) : (
              <>
                <motion.div
                  key={harmonyStreak}
                  initial={{ scale: 1.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={SPRING_PRESETS.bouncy}
                  className="text-sm font-bold text-stone-200"
                >
                  {Math.max(0, HARMONY_THRESHOLD - harmonyStreak)}
                </motion.div>
                <div className="text-[7px] text-stone-500">left</div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Legend */}
      {lastElement && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 text-[11px] bg-stone-950/50 rounded-lg p-2 border border-stone-700"
        >
          {/* Current element */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-900/70 ring-2 ring-blue-500 flex items-center justify-center">
              <ElementIcon element={lastElement} size="xs" />
            </div>
            <span className="text-blue-300 font-semibold">Last Played</span>
          </div>

          {/* Harmony/Balanced */}
          <div className="flex items-center gap-2 relative">
            {/* Flowing aura effect */}
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 w-5 h-5 rounded-full bg-green-500/30 blur-sm"
              />
              <div className="relative w-5 h-5 rounded-full bg-green-900/50 ring-2 ring-green-500 flex items-center justify-center">
                <ElementIcon element={nextElement!} size="xs" />
              </div>
            </div>
            <span className="text-green-300 font-semibold">Harmony: -1 Patience</span>
          </div>

          {/* Chaos */}
          <div className="flex items-center gap-2 relative">
            {/* Aggressive burst effect */}
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="absolute inset-0 w-5 h-5 rounded-full bg-red-600/40 blur-sm"
              />
              <div className="relative w-5 h-5 rounded-full bg-red-900/50 ring-2 ring-red-500 flex items-center justify-center">
                <ElementIcon element={chaosElement!} size="xs" />
              </div>
            </div>
            <span className="text-red-300 font-semibold">Chaos: 2x Effect, +2 Cost</span>
          </div>

          {/* Dissonant */}
          {dissonantElements.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-yellow-900/30 ring-1 ring-yellow-500 flex items-center justify-center">
                <ElementIcon element={dissonantElements[0]} size="xs" />
              </div>
              <span className="text-yellow-300 font-medium">Dissonant: +1 Cost</span>
            </div>
          )}
        </motion.div>
      )}

      {!lastElement && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-xs text-stone-400 text-center font-medium"
        >
          Play a card to begin
        </motion.div>
      )}
    </motion.div>
  );
}
