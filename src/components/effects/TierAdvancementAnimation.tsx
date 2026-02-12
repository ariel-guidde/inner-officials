/**
 * @fileoverview Tier Advancement Celebration Animation System
 *
 * Massive full-screen celebration displayed when player advances to a new standing tier.
 * This is the most dramatic animation in the game, featuring:
 * - Firework bursts from 4 corners (15 particles each = 60 total)
 * - Rising stars across screen (20 stars)
 * - Central crown icon with expanding rings
 * - Tier number badge
 * - Floating celebration icons (12 icons orbiting)
 * - Confetti shower (50 pieces falling)
 * - Tier-specific color themes
 *
 * Duration: 3.5 seconds
 * Z-index: 105
 *
 * Tier colors:
 * - Tier 0: Gray
 * - Tier 1: Blue
 * - Tier 2: Purple
 * - Tier 3: Gold
 * - Tier 4: Pink
 *
 * @module components/effects/TierAdvancementAnimation
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Crown, TrendingUp, Star, Sparkles } from 'lucide-react';
import { SPRING_PRESETS, TANG_COLORS } from '../../lib/animations/constants';

/**
 * Props for the TierAdvancementAnimation component.
 */
interface TierAdvancementAnimationProps {
  isActive: boolean;
  tierNumber: number;
  tierName: string;
  onComplete?: () => void;
}

/**
 * Tier advancement celebration animation component.
 *
 * Orchestrates a massive multi-layered celebration effect including:
 * 1. Firework bursts from corners (staggered)
 * 2. Rising stars across screen
 * 3. Central crown with expanding rings
 * 4. Tier number badge
 * 5. "TIER ADVANCED!" banner (pulsing)
 * 6. Tier name and subtitle
 * 7. Floating celebration icons
 * 8. Confetti shower
 *
 * Animation timing:
 * - 0.0s: Fireworks start, stars start rising
 * - 0.3s: Crown appears
 * - 0.5s: Tier badge appears
 * - 0.6s: Text labels appear
 * - 0.8s: Floating icons start
 * - Random: Confetti falls throughout
 * - 3.5s: Auto-complete
 *
 * @param props - Tier information and completion callback
 */
export default function TierAdvancementAnimation({
  isActive,
  tierNumber,
  tierName,
  onComplete,
}: TierAdvancementAnimationProps) {
  if (!isActive) return null;

  // Auto-complete after animation
  setTimeout(() => onComplete?.(), 3500);

  // Get tier colors based on tier number
  const getTierColor = (tier: number) => {
    switch (tier) {
      case 0:
        return { primary: '#9ca3af', secondary: '#6b7280' }; // gray
      case 1:
        return { primary: '#3b82f6', secondary: '#1d4ed8' }; // blue
      case 2:
        return { primary: '#8b5cf6', secondary: '#6d28d9' }; // purple
      case 3:
        return { primary: TANG_COLORS.imperialGold, secondary: TANG_COLORS.bronze }; // gold
      case 4:
        return { primary: '#ec4899', secondary: '#be185d' }; // pink
      default:
        return { primary: TANG_COLORS.imperialGold, secondary: TANG_COLORS.bronze };
    }
  };

  const colors = getTierColor(tierNumber);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[105] pointer-events-none flex items-center justify-center"
        style={{
          background: `radial-gradient(circle at center, ${colors.primary}30 0%, transparent 70%)`,
        }}
      >
        {/* Firework bursts from corners */}
        <FireworkBursts color={colors.primary} />

        {/* Rising stars */}
        <RisingStars count={20} color={colors.primary} />

        {/* Central celebration */}
        <div className="relative">
          {/* Expanding golden rings */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={`ring-${i}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 4 + i * 0.5, opacity: 0 }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                ease: 'easeOut',
              }}
              className="absolute rounded-full border-4"
              style={{
                borderColor: colors.primary,
                width: '150px',
                height: '150px',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}

          {/* Crown icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180, y: 100 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            transition={{ delay: 0.3, ...SPRING_PRESETS.dramatic }}
            className="relative z-10"
          >
            <div
              className="w-40 h-40 rounded-full flex items-center justify-center border-8"
              style={{
                background: `radial-gradient(circle, ${colors.primary}, ${colors.secondary})`,
                borderColor: TANG_COLORS.imperialGold,
                boxShadow: `0 0 80px ${colors.primary}, 0 0 120px ${colors.primary}, inset 0 0 60px ${colors.secondary}`,
              }}
            >
              <Crown className="w-20 h-20 text-white" strokeWidth={2} />
            </div>
          </motion.div>

          {/* Tier number badge */}
          <motion.div
            initial={{ scale: 0, y: -50 }}
            animate={{ scale: 1, y: -80 }}
            transition={{ delay: 0.5, ...SPRING_PRESETS.bouncy }}
            className="absolute left-1/2 -translate-x-1/2"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center border-4 text-3xl font-bold"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                borderColor: TANG_COLORS.imperialGold,
                color: 'white',
                boxShadow: `0 0 30px ${colors.primary}`,
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              {tierNumber}
            </div>
          </motion.div>
        </div>

        {/* Text labels */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ delay: 0.6, ...SPRING_PRESETS.bouncy }}
          className="absolute bottom-32 text-center"
        >
          {/* "TIER UP!" label */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="text-sm font-bold tracking-widest px-6 py-2 rounded-full border-2 inline-block mb-4"
            style={{
              color: colors.primary,
              borderColor: colors.primary,
              background: `${colors.secondary}cc`,
              textShadow: `0 0 20px ${colors.primary}`,
              boxShadow: `0 0 40px ${colors.primary}`,
            }}
          >
            TIER ADVANCED!
          </motion.div>

          {/* Tier name */}
          <h2
            className="text-4xl font-bold mb-2"
            style={{
              color: colors.primary,
              textShadow: `0 0 30px ${colors.primary}, 0 4px 8px rgba(0,0,0,0.5)`,
            }}
          >
            {tierName}
          </h2>

          {/* Subtitle */}
          <p
            className="text-lg"
            style={{
              color: TANG_COLORS.imperialGold,
              textShadow: `0 0 15px ${TANG_COLORS.imperialGold}`,
            }}
          >
            Your standing has risen
          </p>
        </motion.div>

        {/* Floating icons around celebration */}
        <FloatingIcons color={colors.primary} />

        {/* Confetti shower */}
        <ConfettiShower colors={[colors.primary, colors.secondary, TANG_COLORS.imperialGold]} />
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Generates firework particle bursts from four screen corners.
 *
 * Creates 4 firework bursts (one per corner) with 15 particles each.
 * Particles burst radially in a circle pattern. Each corner's burst
 * is staggered by 0.2s for dramatic effect.
 *
 * Positions:
 * - Top-left: 15%, 20%
 * - Top-right: 85%, 20%
 * - Bottom-left: 15%, 80%
 * - Bottom-right: 85%, 80%
 *
 * @param props - Color configuration
 */
function FireworkBursts({ color }: { color: string }) {
  const positions = [
    { x: '15%', y: '20%' },
    { x: '85%', y: '20%' },
    { x: '15%', y: '80%' },
    { x: '85%', y: '80%' },
  ];

  return (
    <>
      {positions.map((pos, cornerIdx) => (
        <div key={cornerIdx} className="absolute" style={{ left: pos.x, top: pos.y }}>
          {Array.from({ length: 15 }).map((_, i) => {
            const angle = (i / 15) * Math.PI * 2;
            const distance = 80 + Math.random() * 60;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            return (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x,
                  y,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{
                  duration: 1.5,
                  delay: cornerIdx * 0.2 + Math.random() * 0.3,
                  ease: 'easeOut',
                }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 10px ${color}`,
                }}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

/**
 * Generates stars that rise from bottom to top of screen.
 *
 * Creates specified number of stars that:
 * - Start at random X positions across screen width
 * - Rise from below screen to above screen
 * - Fade in, stay visible, then fade out
 * - Rotate 360° during ascent
 * - Each has random timing (2.5-3.5s duration, 0-1.5s delay)
 *
 * @param props - Count and color configuration
 */
function RisingStars({ count, color }: { count: number; color: string }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const startX = Math.random() * window.innerWidth;

        return (
          <motion.div
            key={i}
            initial={{ x: startX, y: window.innerHeight + 50, opacity: 0, rotate: 0 }}
            animate={{
              y: -50,
              opacity: [0, 1, 1, 0],
              rotate: 360,
            }}
            transition={{
              duration: 2.5 + Math.random(),
              delay: Math.random() * 1.5,
              ease: 'linear',
            }}
            className="absolute"
          >
            <Star className="w-6 h-6" style={{ color, fill: color }} />
          </motion.div>
        );
      })}
    </>
  );
}

/**
 * Generates celebration icons that orbit outward from center.
 *
 * Creates 12 icons cycling through Crown, TrendingUp, and Sparkles that:
 * - Start at center
 * - Move outward in circular pattern (radius 300-400px)
 * - Scale from 0 to 1.5 to 1 to 0 (pulsing growth)
 * - Rotate 360° during animation
 * - Fade in and out
 * - 2s duration with 0.8-1.3s random delays
 *
 * @param props - Color configuration
 */
function FloatingIcons({ color }: { color: string }) {
  const icons = [TrendingUp, Sparkles, Crown];

  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => {
        const Icon = icons[i % icons.length];
        const angle = (i / 12) * Math.PI * 2;
        const radius = 300 + Math.random() * 100;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0, rotate: 0 }}
            animate={{
              x,
              y,
              opacity: [0, 1, 1, 0],
              scale: [0, 1.5, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              delay: 0.8 + Math.random() * 0.5,
              ease: 'easeOut',
            }}
            className="absolute left-1/2 top-1/2"
          >
            <Icon className="w-8 h-8" style={{ color }} />
          </motion.div>
        );
      })}
    </>
  );
}

/**
 * Generates falling confetti pieces across the screen.
 *
 * Creates 50 confetti pieces with:
 * - Random starting X positions across screen width
 * - Fall from top to bottom
 * - Horizontal drift (-100px to +100px)
 * - Random rotation (-360° to +360°)
 * - Random size (4-12px width, 2x height for rectangle shape)
 * - Random color from provided palette
 * - 3-5s duration with 0-1s delay
 * - Fade out near bottom
 *
 * @param props - Array of colors to randomly select from
 */
function ConfettiShower({ colors }: { colors: string[] }) {
  return (
    <>
      {Array.from({ length: 50 }).map((_, i) => {
        const startX = Math.random() * window.innerWidth;
        const endX = startX + (Math.random() - 0.5) * 200;
        const rotation = Math.random() * 720 - 360;
        const size = 4 + Math.random() * 8;
        const color = colors[Math.floor(Math.random() * colors.length)];

        return (
          <motion.div
            key={i}
            initial={{
              x: startX,
              y: -50,
              opacity: 1,
              rotate: 0,
            }}
            animate={{
              x: endX,
              y: window.innerHeight + 50,
              opacity: [1, 1, 0.5, 0],
              rotate: rotation,
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 1,
              ease: 'easeIn',
            }}
            className="absolute rounded-sm"
            style={{
              width: size,
              height: size * 2,
              backgroundColor: color,
              boxShadow: `0 0 4px ${color}`,
            }}
          />
        );
      })}
    </>
  );
}

/**
 * Props for the TierAdvancementAnimationContainer.
 */
interface TierAdvancementAnimationContainerProps {
  animation: {
    id: string;
    tierNumber: number;
    tierName: string;
  } | null;
  onAnimationComplete: (id: string) => void;
}

/**
 * Container component for managing tier advancement animation.
 *
 * Unlike other animation containers, tier advancement uses a single animation
 * state (not an array) since only one tier advancement can happen at a time.
 * The animation property is nullable - when null, nothing renders.
 *
 * @param props - Animation state and completion handler
 *
 * @example
 * ```tsx
 * <TierAdvancementAnimationContainer
 *   animation={battleEffects.tierAdvancementAnimation}
 *   onAnimationComplete={battleEffects.removeTierAdvancementAnimation}
 * />
 * ```
 */
export function TierAdvancementAnimationContainer({
  animation,
  onAnimationComplete,
}: TierAdvancementAnimationContainerProps) {
  if (!animation) return null;

  return (
    <TierAdvancementAnimation
      isActive={true}
      tierNumber={animation.tierNumber}
      tierName={animation.tierName}
      onComplete={() => onAnimationComplete(animation.id)}
    />
  );
}
