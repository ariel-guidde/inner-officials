import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swords, TrendingDown, TrendingUp, Hourglass, Zap, LucideIcon } from 'lucide-react';
import { IntentionType, INTENTION_TYPE } from '../../types/game';

interface ProjectileAnimationProps {
  isActive: boolean;
  intentionType: IntentionType;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  onComplete: () => void;
}

// Icon mapping based on intention type (not element)
const PROJECTILE_ICONS: Record<IntentionType, LucideIcon> = {
  [INTENTION_TYPE.ATTACK]: Swords,
  [INTENTION_TYPE.STANDING_DAMAGE]: TrendingDown,
  [INTENTION_TYPE.STANDING_GAIN]: TrendingUp,
  [INTENTION_TYPE.STALL]: Hourglass,
  [INTENTION_TYPE.FLUSTERED]: Zap,
};

const PROJECTILE_COLORS: Record<IntentionType, string> = {
  [INTENTION_TYPE.ATTACK]: 'text-red-400',
  [INTENTION_TYPE.STANDING_DAMAGE]: 'text-amber-400',
  [INTENTION_TYPE.STANDING_GAIN]: 'text-purple-400',
  [INTENTION_TYPE.STALL]: 'text-yellow-400',
  [INTENTION_TYPE.FLUSTERED]: 'text-blue-400',
};

export default function ProjectileAnimation({
  isActive,
  intentionType,
  fromX,
  fromY,
  toX,
  toY,
  onComplete,
}: ProjectileAnimationProps) {
  const Icon = PROJECTILE_ICONS[intentionType];
  const colorClass = PROJECTILE_COLORS[intentionType];

  // Auto-complete after total duration
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1100); // 800ms flight + 300ms impact
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {/* Projectile */}
      <motion.div
        initial={{
          x: fromX,
          y: fromY,
          scale: 1,
          opacity: 1,
        }}
        animate={{
          x: toX,
          y: toY,
          scale: 1.2,
          opacity: [1, 1, 0.8],
          transition: {
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1], // Ease out
          },
        }}
        className="absolute -translate-x-1/2 -translate-y-1/2"
      >
        <Icon className={`w-12 h-12 ${colorClass} drop-shadow-lg`} />
      </motion.div>

      {/* Impact burst at target */}
      <motion.div
        initial={{
          x: toX,
          y: toY,
          scale: 0,
          opacity: 0,
        }}
        animate={{
          scale: [0, 1.5, 0],
          opacity: [0, 1, 0],
          transition: {
            delay: 0.8, // Start after flight
            duration: 0.3,
            times: [0, 0.5, 1],
            ease: 'easeOut',
          },
        }}
        className="absolute -translate-x-1/2 -translate-y-1/2"
      >
        <div className={`w-24 h-24 rounded-full border-4 ${colorClass.replace('text-', 'border-')} opacity-50`} />
      </motion.div>

      {/* Impact particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: toX,
            y: toY,
            scale: 0,
            opacity: 0,
          }}
          animate={{
            x: toX + Math.cos((i * Math.PI * 2) / 6) * 60,
            y: toY + Math.sin((i * Math.PI * 2) / 6) * 60,
            scale: [0, 1, 0],
            opacity: [0, 0.8, 0],
            transition: {
              delay: 0.8,
              duration: 0.3,
              ease: 'easeOut',
            },
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2"
        >
          <div className={`w-3 h-3 rounded-full ${colorClass.replace('text-', 'bg-')}`} />
        </motion.div>
      ))}
    </div>
  );
}
