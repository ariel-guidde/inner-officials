/**
 * @fileoverview Opponent Intention Animation System
 *
 * Full-screen dramatic animations that display when opponents execute their intentions.
 * Each intention type (Attack, Standing Gain/Damage, Stall, Flustered) has a unique
 * visual theme with corresponding icons, colors, and particle effects.
 *
 * Features:
 * - Type-specific color themes and icons
 * - Expanding ring effects from center
 * - Radial particle bursts
 * - Non-blocking overlay (pointer-events-none)
 * - 2 second duration with auto-completion
 *
 * @module components/effects/IntentionAnimation
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Swords, TrendingUp, TrendingDown, Hourglass, Zap } from 'lucide-react';
import { INTENTION_TYPE, IntentionType } from '../../types/game';
import { SPRING_PRESETS, TANG_COLORS } from '../../lib/animations/constants';

/**
 * Props for the IntentionAnimation component.
 */
interface IntentionAnimationProps {
  isActive: boolean;
  intentionName: string;
  intentionType: IntentionType;
  value: number;
  opponentName: string;
  onComplete?: () => void;
}

/**
 * Maps intention type to visual theme configuration.
 *
 * @param type - The intention type to get theme for
 * @returns Theme object with colors, icon component, and label
 *
 * @example
 * ```tsx
 * const theme = getIntentionTheme(INTENTION_TYPE.ATTACK);
 * // Returns: { primary: '#dc2626', icon: Swords, label: 'ATTACK', ... }
 * ```
 */
function getIntentionTheme(type: IntentionType) {
  switch (type) {
    case INTENTION_TYPE.ATTACK:
      return {
        primary: '#dc2626', // red-600
        secondary: '#991b1b', // red-800
        glow: '#ef4444', // red-500
        icon: Swords,
        label: 'ATTACK',
      };
    case INTENTION_TYPE.STANDING_GAIN:
      return {
        primary: '#9333ea', // purple-600
        secondary: '#6b21a8', // purple-800
        glow: '#a855f7', // purple-500
        icon: TrendingUp,
        label: 'RISING',
      };
    case INTENTION_TYPE.STANDING_DAMAGE:
      return {
        primary: '#d97706', // amber-600
        secondary: '#92400e', // amber-800
        glow: '#f59e0b', // amber-500
        icon: TrendingDown,
        label: 'FALLING',
      };
    case INTENTION_TYPE.STALL:
      return {
        primary: '#ca8a04', // yellow-600
        secondary: '#713f12', // yellow-900
        glow: '#eab308', // yellow-500
        icon: Hourglass,
        label: 'STALLING',
      };
    case INTENTION_TYPE.FLUSTERED:
      return {
        primary: '#2563eb', // blue-600
        secondary: '#1e3a8a', // blue-900
        glow: '#3b82f6', // blue-500
        icon: Zap,
        label: 'FLUSTERED',
      };
    default:
      return {
        primary: '#6b7280', // gray-500
        secondary: '#374151', // gray-700
        glow: '#9ca3af', // gray-400
        icon: Swords,
        label: 'ACTION',
      };
  }
}

/**
 * Full-screen intention animation component.
 *
 * Displays a dramatic, type-specific animation when an opponent executes their intention.
 * The animation includes:
 * - Central icon with expanding rings
 * - Type label at top
 * - Intention name and opponent name at bottom
 * - Value display (for quantitative intentions)
 * - Radial particle burst
 *
 * Duration: 2 seconds
 * Positioning: Fixed overlay, non-blocking (pointer-events-none)
 *
 * @param props - Animation configuration
 */
export default function IntentionAnimation({
  isActive,
  intentionName,
  intentionType,
  value,
  opponentName,
  onComplete,
}: IntentionAnimationProps) {
  const theme = getIntentionTheme(intentionType);
  const Icon = theme.icon;

  if (!isActive) return null;

  // Auto-complete after animation duration
  setTimeout(() => onComplete?.(), 2000);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
        style={{
          background: `radial-gradient(circle at center, ${theme.primary}40 0%, transparent 70%)`,
        }}
      >
        {/* Intention Type Label (Top) */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, ...SPRING_PRESETS.bouncy }}
          className="absolute top-32 text-center"
        >
          <div
            className="text-sm font-bold tracking-widest px-6 py-2 rounded-full border-2"
            style={{
              color: theme.glow,
              borderColor: theme.primary,
              background: `${theme.secondary}cc`,
              textShadow: `0 0 20px ${theme.glow}`,
              boxShadow: `0 0 30px ${theme.glow}`,
            }}
          >
            {theme.label}
          </div>
        </motion.div>

        {/* Central Icon Burst */}
        <motion.div className="relative">
          {/* Expanding rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`ring-${i}`}
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 3 + i, opacity: 0 }}
              transition={{
                duration: 1.5,
                delay: i * 0.15,
                ease: 'easeOut',
              }}
              className="absolute inset-0 rounded-full border-4"
              style={{
                borderColor: theme.primary,
                width: '120px',
                height: '120px',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}

          {/* Central icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, ...SPRING_PRESETS.dramatic }}
            className="relative w-32 h-32 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle, ${theme.primary}, ${theme.secondary})`,
              boxShadow: `0 0 60px ${theme.glow}, inset 0 0 40px ${theme.secondary}`,
            }}
          >
            <Icon className="w-16 h-16 text-white" strokeWidth={2.5} />
          </motion.div>

          {/* Value display (if applicable) */}
          {value > 0 && intentionType !== INTENTION_TYPE.FLUSTERED && (
            <motion.div
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.4, ...SPRING_PRESETS.bouncy }}
              className="absolute -bottom-16 left-1/2 -translate-x-1/2"
            >
              <div
                className="text-5xl font-bold px-4 py-2"
                style={{
                  color: theme.glow,
                  textShadow: `0 0 30px ${theme.glow}, 0 0 60px ${theme.primary}`,
                }}
              >
                {value}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Intention Name (Bottom) */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, ...SPRING_PRESETS.bouncy }}
          className="absolute bottom-48 text-center max-w-md"
        >
          <div
            className="text-xl font-bold mb-2"
            style={{
              color: theme.glow,
              textShadow: `0 0 20px ${theme.glow}`,
            }}
          >
            "{intentionName}"
          </div>
          <div
            className="text-sm opacity-80"
            style={{
              color: TANG_COLORS.lotusWhite,
              textShadow: `0 2px 4px ${theme.secondary}`,
            }}
          >
            {opponentName}'s intention
          </div>
        </motion.div>

        {/* Particle effects based on type */}
        <ParticleEffects type={intentionType} theme={theme} />
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Generates type-specific particle burst effects.
 *
 * Creates radial particle animations emanating from the center.
 * Particle count and behavior varies by intention type:
 * - Attack: 30 particles, explosive (scale to 0)
 * - Flustered: 20 particles
 * - Others: 15 particles, gentle fade (scale to 0.5)
 *
 * @param props - Type and theme configuration
 */
function ParticleEffects({ type, theme }: { type: IntentionType; theme: ReturnType<typeof getIntentionTheme> }) {
  const particleCount = type === INTENTION_TYPE.ATTACK ? 30 : type === INTENTION_TYPE.FLUSTERED ? 20 : 15;

  return (
    <>
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = 200 + Math.random() * 200;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;

        return (
          <motion.div
            key={`particle-${i}`}
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              x: endX,
              y: endY,
              opacity: 0,
              scale: type === INTENTION_TYPE.ATTACK ? 0 : 0.5,
            }}
            transition={{
              duration: 1 + Math.random() * 0.5,
              delay: 0.3 + Math.random() * 0.3,
              ease: 'easeOut',
            }}
            className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full"
            style={{
              backgroundColor: theme.glow,
              boxShadow: `0 0 10px ${theme.glow}`,
            }}
          />
        );
      })}
    </>
  );
}

/**
 * Props for the IntentionAnimationContainer.
 */
interface IntentionAnimationContainerProps {
  animations: Array<{
    id: string;
    intentionName: string;
    intentionType: IntentionType;
    value: number;
    opponentName: string;
  }>;
  onAnimationComplete: (id: string) => void;
}

/**
 * Container component for managing intention animation queue.
 *
 * Ensures only one intention animation plays at a time by showing
 * the most recent animation in the queue. When animation completes,
 * it calls the cleanup callback to remove it from state.
 *
 * @param props - Animation queue and completion handler
 *
 * @example
 * ```tsx
 * <IntentionAnimationContainer
 *   animations={battleEffects.intentionAnimations}
 *   onAnimationComplete={battleEffects.removeIntentionAnimation}
 * />
 * ```
 */
export function IntentionAnimationContainer({ animations, onAnimationComplete }: IntentionAnimationContainerProps) {
  // Show only the most recent animation
  const currentAnimation = animations[animations.length - 1];

  if (!currentAnimation) return null;

  return (
    <IntentionAnimation
      isActive={true}
      intentionName={currentAnimation.intentionName}
      intentionType={currentAnimation.intentionType}
      value={currentAnimation.value}
      opponentName={currentAnimation.opponentName}
      onComplete={() => onAnimationComplete(currentAnimation.id)}
    />
  );
}
