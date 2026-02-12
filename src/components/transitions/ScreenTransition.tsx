import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { SPRING_PRESETS, TANG_COLORS } from '../../lib/animations/constants';
import LoadingScreen from './LoadingScreen';

interface ScreenTransitionProps {
  children: ReactNode;
  transitionKey: string; // Unique key for each screen to trigger transitions
  transitionType?: 'fade' | 'slide' | 'scroll' | 'zoom';
  direction?: 'left' | 'right' | 'up' | 'down';
}

export default function ScreenTransition({
  children,
  transitionKey,
  transitionType = 'slide',
  direction = 'right',
}: ScreenTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const getVariants = () => {
    switch (transitionType) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };

      case 'slide': {
        const slideDistance = 100;
        const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
        const initialValue = direction === 'right' || direction === 'down' ? slideDistance : -slideDistance;
        const exitValue = direction === 'right' || direction === 'down' ? -slideDistance : slideDistance;

        return {
          initial: { opacity: 0, [axis]: initialValue },
          animate: { opacity: 1, [axis]: 0 },
          exit: { opacity: 0, [axis]: exitValue },
        };
      }

      case 'scroll': {
        // Tang Dynasty scroll unfurling effect
        return {
          initial: {
            opacity: 0,
            scaleY: 0,
            originY: direction === 'down' ? 0 : 1,
          },
          animate: {
            opacity: 1,
            scaleY: 1,
          },
          exit: {
            opacity: 0,
            scaleY: 0,
          },
        };
      }

      case 'zoom':
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.2 },
        };

      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };

  const variants = getVariants();

  return (
    <>
      <AnimatePresence mode="wait" onExitComplete={() => setIsTransitioning(false)}>
        <motion.div
          key={transitionKey}
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={SPRING_PRESETS.smooth}
          onAnimationStart={() => setIsTransitioning(true)}
          onAnimationComplete={() => setIsTransitioning(false)}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Loading screen during transitions */}
      <AnimatePresence>
        {isTransitioning && <LoadingScreen />}
      </AnimatePresence>
    </>
  );
}

/**
 * Tang Dynasty-style scroll wipe transition
 * Can be used between major screen changes for dramatic effect
 */
interface ScrollWipeProps {
  isActive: boolean;
  direction?: 'horizontal' | 'vertical';
  onComplete?: () => void;
}

export function ScrollWipe({ isActive, direction = 'horizontal', onComplete }: ScrollWipeProps) {
  if (!isActive) return null;

  return (
    <motion.div
      initial={{
        [direction === 'horizontal' ? 'x' : 'y']: direction === 'horizontal' ? '-100%' : '-100%',
      }}
      animate={{
        [direction === 'horizontal' ? 'x' : 'y']: '100%',
      }}
      transition={{
        duration: 0.8,
        ease: [0.45, 0, 0.55, 1], // Custom ease for smooth wipe
      }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 z-[100] pointer-events-none"
      style={{
        background: `linear-gradient(${
          direction === 'horizontal' ? '90deg' : '180deg'
        },
          transparent 0%,
          ${TANG_COLORS.imperialRed} 20%,
          ${TANG_COLORS.imperialGold} 50%,
          ${TANG_COLORS.imperialRed} 80%,
          transparent 100%
        )`,
        boxShadow: `0 0 40px ${TANG_COLORS.imperialGold}`,
      }}
    />
  );
}

/**
 * Particle burst for dramatic transitions
 */
interface TransitionBurstProps {
  x: number;
  y: number;
  color?: string;
  particleCount?: number;
}

export function TransitionBurst({ x, y, color = TANG_COLORS.imperialGold, particleCount = 20 }: TransitionBurstProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = 100 + Math.random() * 100;
        const size = 4 + Math.random() * 8;

        return (
          <motion.div
            key={i}
            initial={{
              x,
              y,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              x: x + Math.cos(angle) * distance,
              y: y + Math.sin(angle) * distance,
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: 0.8 + Math.random() * 0.4,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: '50%',
              boxShadow: `0 0 10px ${color}`,
            }}
          />
        );
      })}
    </div>
  );
}
