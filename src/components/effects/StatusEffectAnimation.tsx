/**
 * @fileoverview Status Effect Animation System
 *
 * Floating icon animations displayed when status effects (buffs/debuffs) are applied.
 * The system intelligently detects status type from name and selects appropriate:
 * - Icon (element icons, shield, heart, trending arrows, etc.)
 * - Color theme (element colors or semantic colors)
 * - Particle count
 *
 * Features:
 * - Auto-positioning based on target (player bottom, opponent top)
 * - Pulsing glow ring around icon
 * - Status name badge below icon
 * - Radial particle burst (10-15 particles)
 * - Floating upward motion
 *
 * Duration: 1.5 seconds
 * Z-index: 95
 *
 * @module components/effects/StatusEffectAnimation
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, TrendingUp, TrendingDown, Heart, Flame, Droplet, Leaf, Mountain, Gem, Plus, Minus, Clock } from 'lucide-react';
import { SPRING_PRESETS, ELEMENT_THEMES } from '../../lib/animations/constants';
import { ELEMENT } from '../../types/game';

/**
 * Props for the StatusEffectAnimation component.
 */
interface StatusEffectAnimationProps {
  statusName: string;
  targetId: string; // 'player' or opponent id
  isPositive: boolean;
  onComplete?: () => void;
}

/**
 * Determines visual theme for status based on name content.
 *
 * Detection uses keyword matching in status name:
 * - Element keywords (fire, water, wood, earth, metal)
 * - Defense keywords (shield, armor, protect, defense)
 * - Healing keywords (heal, regen, restore)
 * - Standing keywords (standing, favor, bonus)
 * - Time keywords (slow, haste, duration)
 * - Power keywords (power, damage, strength)
 *
 * Falls back to generic positive/negative theme if no matches.
 *
 * @param statusName - Name of the status effect
 * @param isPositive - Whether status is a buff (true) or debuff (false)
 * @returns Theme configuration with icon, colors, and particle count
 */
function getStatusTheme(statusName: string, isPositive: boolean) {
  const lowerName = statusName.toLowerCase();

  // Element-based statuses
  if (lowerName.includes('fire') || lowerName.includes('flame') || lowerName.includes('burn')) {
    return {
      icon: Flame,
      color: ELEMENT_THEMES[ELEMENT.FIRE].primaryColor,
      glow: ELEMENT_THEMES[ELEMENT.FIRE].glowColor,
      particles: 15,
    };
  }
  if (lowerName.includes('water') || lowerName.includes('flow') || lowerName.includes('frost')) {
    return {
      icon: Droplet,
      color: ELEMENT_THEMES[ELEMENT.WATER].primaryColor,
      glow: ELEMENT_THEMES[ELEMENT.WATER].glowColor,
      particles: 12,
    };
  }
  if (lowerName.includes('wood') || lowerName.includes('growth') || lowerName.includes('nature')) {
    return {
      icon: Leaf,
      color: ELEMENT_THEMES[ELEMENT.WOOD].primaryColor,
      glow: ELEMENT_THEMES[ELEMENT.WOOD].glowColor,
      particles: 12,
    };
  }
  if (lowerName.includes('earth') || lowerName.includes('stone') || lowerName.includes('solid')) {
    return {
      icon: Mountain,
      color: ELEMENT_THEMES[ELEMENT.EARTH].primaryColor,
      glow: ELEMENT_THEMES[ELEMENT.EARTH].glowColor,
      particles: 10,
    };
  }
  if (lowerName.includes('metal') || lowerName.includes('sharp') || lowerName.includes('steel')) {
    return {
      icon: Gem,
      color: ELEMENT_THEMES[ELEMENT.METAL].primaryColor,
      glow: ELEMENT_THEMES[ELEMENT.METAL].glowColor,
      particles: 15,
    };
  }

  // Defense/shield statuses
  if (lowerName.includes('shield') || lowerName.includes('armor') || lowerName.includes('protect') || lowerName.includes('defense')) {
    return {
      icon: Shield,
      color: '#3b82f6', // blue-500
      glow: '#60a5fa', // blue-400
      particles: 12,
    };
  }

  // Healing statuses
  if (lowerName.includes('heal') || lowerName.includes('regen') || lowerName.includes('restore')) {
    return {
      icon: Heart,
      color: '#ec4899', // pink-500
      glow: '#f472b6', // pink-400
      particles: 15,
    };
  }

  // Standing/buff statuses
  if (lowerName.includes('standing') || lowerName.includes('favor') || lowerName.includes('bonus')) {
    return {
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? '#8b5cf6' : '#f59e0b', // purple-500 or amber-500
      glow: isPositive ? '#a78bfa' : '#fbbf24', // purple-400 or amber-400
      particles: 12,
    };
  }

  // Time/duration statuses
  if (lowerName.includes('slow') || lowerName.includes('haste') || lowerName.includes('duration')) {
    return {
      icon: Clock,
      color: '#eab308', // yellow-500
      glow: '#facc15', // yellow-400
      particles: 10,
    };
  }

  // Power/damage statuses
  if (lowerName.includes('power') || lowerName.includes('damage') || lowerName.includes('strength')) {
    return {
      icon: Zap,
      color: '#ef4444', // red-500
      glow: '#f87171', // red-400
      particles: 15,
    };
  }

  // Default based on positive/negative
  return {
    icon: isPositive ? Plus : Minus,
    color: isPositive ? '#22c55e' : '#ef4444', // green-500 or red-500
    glow: isPositive ? '#4ade80' : '#f87171', // green-400 or red-400
    particles: 10,
  };
}

/**
 * Calculates screen position for status animation based on target.
 *
 * @param targetId - Target identifier ('player' or opponent id)
 * @returns Screen coordinates {x, y} for animation placement
 *
 * Positions:
 * - Player: Center-bottom (above player panel at y=height-250)
 * - Opponent: Center-top (below opponent panel at y=200)
 */
function getTargetPosition(targetId: string) {
  if (targetId === 'player') {
    return {
      x: window.innerWidth / 2,
      y: window.innerHeight - 250, // Above player panel
    };
  } else {
    return {
      x: window.innerWidth / 2,
      y: 200, // Below opponent panel
    };
  }
}

/**
 * Status effect floating icon animation component.
 *
 * Displays a status icon that floats upward from target position with:
 * - Pulsing glow ring (1.3x scale cycle, infinite)
 * - Central icon with themed background
 * - Status name badge below
 * - Radial particle burst
 *
 * Animation sequence:
 * 1. Icon appears, rotates from -180° to 0°, scales from 0 to 1, moves from y+50 to y-60
 * 2. Glow ring pulses continuously
 * 3. Status name badge fades in (0.2s delay)
 * 4. Particles burst radially outward
 * 5. Entire effect exits upward to y-120
 *
 * @param props - Status information and completion callback
 */
export default function StatusEffectAnimation({
  statusName,
  targetId,
  isPositive,
  onComplete,
}: StatusEffectAnimationProps) {
  const theme = getStatusTheme(statusName, isPositive);
  const position = getTargetPosition(targetId);
  const Icon = theme.icon;

  // Auto-complete after animation
  setTimeout(() => onComplete?.(), 1500);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed pointer-events-none z-[95]"
      style={{ left: position.x, top: position.y }}
    >
      {/* Central icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180, y: 50 }}
        animate={{ scale: 1, rotate: 0, y: -60 }}
        exit={{ scale: 0, opacity: 0, y: -120 }}
        transition={{ ...SPRING_PRESETS.bouncy }}
        className="relative"
      >
        {/* Glow ring */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full -m-4"
          style={{
            background: `radial-gradient(circle, ${theme.glow}60, transparent)`,
            filter: 'blur(8px)',
          }}
        />

        {/* Icon background */}
        <div
          className="relative w-16 h-16 rounded-full flex items-center justify-center border-4"
          style={{
            background: `radial-gradient(circle, ${theme.color}, ${theme.color}cc)`,
            borderColor: theme.glow,
            boxShadow: `0 0 30px ${theme.glow}, inset 0 0 20px ${theme.color}`,
          }}
        >
          <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>

        {/* Status name */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-center"
        >
          <div
            className="text-sm font-bold px-3 py-1 rounded-full"
            style={{
              color: 'white',
              background: `${theme.color}dd`,
              textShadow: `0 0 10px ${theme.glow}`,
              boxShadow: `0 0 15px ${theme.glow}`,
            }}
          >
            {statusName}
          </div>
        </motion.div>
      </motion.div>

      {/* Particles */}
      {Array.from({ length: theme.particles }).map((_, i) => {
        const angle = (i / theme.particles) * Math.PI * 2;
        const distance = 60 + Math.random() * 40;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance - 60; // Offset for floating up

        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: endX,
              y: endY,
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: 1 + Math.random() * 0.5,
              delay: 0.2 + Math.random() * 0.3,
              ease: 'easeOut',
            }}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: theme.glow,
              boxShadow: `0 0 8px ${theme.glow}`,
            }}
          />
        );
      })}
    </motion.div>
  );
}

/**
 * Props for the StatusEffectAnimationContainer.
 */
interface StatusEffectAnimationContainerProps {
  animations: Array<{
    id: string;
    statusName: string;
    targetId: string;
    isPositive: boolean;
  }>;
  onAnimationComplete: (id: string) => void;
}

/**
 * Container component for managing multiple status effect animations.
 *
 * Unlike intention/decree containers, this renders ALL animations simultaneously
 * since multiple status effects can be applied at once. Each animation has its
 * own position based on target, so they won't overlap.
 *
 * @param props - Animation array and completion handler
 *
 * @example
 * ```tsx
 * <StatusEffectAnimationContainer
 *   animations={battleEffects.statusEffectAnimations}
 *   onAnimationComplete={battleEffects.removeStatusEffectAnimation}
 * />
 * ```
 */
export function StatusEffectAnimationContainer({
  animations,
  onAnimationComplete,
}: StatusEffectAnimationContainerProps) {
  return (
    <AnimatePresence>
      {animations.map((animation) => (
        <StatusEffectAnimation
          key={animation.id}
          statusName={animation.statusName}
          targetId={animation.targetId}
          isPositive={animation.isPositive}
          onComplete={() => onAnimationComplete(animation.id)}
        />
      ))}
    </AnimatePresence>
  );
}
