import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export type FloatingNumberType =
  | 'damage' // Red, for face damage
  | 'heal' // Green, for face gain
  | 'standing' // Purple, for standing gain
  | 'standing-loss' // Orange, for standing loss
  | 'patience' // Yellow, for patience cost
  | 'shame' // Pink, for opponent shame;

interface FloatingNumberProps {
  value: number;
  type: FloatingNumberType;
  x: number; // X position on screen
  y: number; // Y position on screen
  delay?: number; // Delay before showing (ms)
  onComplete?: () => void;
}

const TYPE_STYLES: Record<FloatingNumberType, { color: string; prefix: string; fontSize: string; shadow: string }> = {
  damage: {
    color: 'text-red-400',
    prefix: '-',
    fontSize: 'text-2xl',
    shadow: '0 0 10px rgba(239, 68, 68, 0.8)',
  },
  heal: {
    color: 'text-green-400',
    prefix: '+',
    fontSize: 'text-2xl',
    shadow: '0 0 10px rgba(34, 197, 94, 0.8)',
  },
  standing: {
    color: 'text-purple-400',
    prefix: '+',
    fontSize: 'text-xl',
    shadow: '0 0 10px rgba(168, 85, 247, 0.8)',
  },
  'standing-loss': {
    color: 'text-orange-400',
    prefix: '-',
    fontSize: 'text-xl',
    shadow: '0 0 10px rgba(251, 146, 60, 0.8)',
  },
  patience: {
    color: 'text-yellow-400',
    prefix: '-',
    fontSize: 'text-lg',
    shadow: '0 0 10px rgba(234, 179, 8, 0.8)',
  },
  shame: {
    color: 'text-pink-400',
    prefix: '+',
    fontSize: 'text-xl',
    shadow: '0 0 10px rgba(244, 114, 182, 0.8)',
  },
};

export default function FloatingNumber({ value, type, x, y, delay = 0, onComplete }: FloatingNumberProps) {
  const [isVisible, setIsVisible] = useState(false);
  const style = TYPE_STYLES[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (isVisible) {
      const completeTimer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 1500);

      return () => clearTimeout(completeTimer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{
            opacity: 0,
            y: 0,
            scale: 0.5,
            x: -20, // Center the text
          }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [0, -10, -60, -80],
            scale: [0.5, 1.3, 1, 0.8],
            rotate: [0, -5, 5, 0],
          }}
          exit={{
            opacity: 0,
            scale: 0.3,
          }}
          transition={{
            duration: 1.5,
            times: [0, 0.2, 0.8, 1],
            ease: [0.34, 1.56, 0.64, 1], // Potionomics-style bounce
          }}
          style={{
            position: 'fixed',
            left: x,
            top: y,
            pointerEvents: 'none',
            zIndex: 1000,
            textShadow: style.shadow,
          }}
          className={`${style.color} ${style.fontSize} font-bold`}
        >
          {style.prefix}{Math.abs(value)}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Container component for managing multiple floating numbers
 */
interface FloatingNumbersContainerProps {
  numbers: Array<{
    id: string;
    value: number;
    type: FloatingNumberType;
    x: number;
    y: number;
    delay?: number;
  }>;
  onNumberComplete?: (id: string) => void;
}

export function FloatingNumbersContainer({ numbers, onNumberComplete }: FloatingNumbersContainerProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {numbers.map((num) => (
        <FloatingNumber
          key={num.id}
          value={num.value}
          type={num.type}
          x={num.x}
          y={num.y}
          delay={num.delay}
          onComplete={() => onNumberComplete?.(num.id)}
        />
      ))}
    </div>
  );
}
