import { Transition } from 'framer-motion';
import { SPRING_PRESETS } from './constants';

/**
 * Creates a staggered delay for child animations
 */
export function getStaggerDelay(index: number, baseDelay = 0, staggerAmount = 0.05): number {
  return baseDelay + index * staggerAmount;
}

/**
 * Creates a transition with custom spring settings
 */
export function createSpring(
  preset: keyof typeof SPRING_PRESETS = 'bouncy',
  overrides?: Partial<Transition>
): Transition {
  return {
    ...SPRING_PRESETS[preset],
    ...overrides,
  };
}

/**
 * Generates random particle positions within a spread angle
 */
export function generateParticlePosition(
  spread: number,
  velocity: number
): { x: number; y: number } {
  const angleInRadians = ((Math.random() * spread - spread / 2) * Math.PI) / 180;
  const speed = velocity * (0.8 + Math.random() * 0.4); // 80-120% of base velocity

  return {
    x: Math.cos(angleInRadians) * speed,
    y: Math.sin(angleInRadians) * speed,
  };
}

/**
 * Gets random size between min and max
 */
export function getRandomSize(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Creates a pulsing animation config
 */
export function createPulse(speed: number = 2, intensity: number = 1.1): Transition {
  return {
    scale: [1, intensity, 1],
    transition: {
      duration: speed,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };
}

/**
 * Creates a shake animation for emphasis
 */
export function createShake(intensity: number = 10): Transition {
  return {
    x: [0, -intensity, intensity, -intensity, intensity, 0],
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  };
}

/**
 * Creates a glow effect keyframes for CSS
 */
export function createGlowKeyframes(color: string, intensity: number = 0.6): string {
  return `
    @keyframes glow {
      0%, 100% {
        box-shadow: 0 0 5px ${color}${Math.floor(intensity * 255).toString(16)};
      }
      50% {
        box-shadow: 0 0 20px ${color}${Math.floor(intensity * 255).toString(16)},
                    0 0 30px ${color}${Math.floor(intensity * 128).toString(16)};
      }
    }
  `;
}

/**
 * Interpolates between two colors based on progress (0-1)
 */
export function interpolateColor(
  color1: string,
  color2: string,
  progress: number
): string {
  // Simple hex color interpolation
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');

  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);

  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);

  const r = Math.round(r1 + (r2 - r1) * progress);
  const g = Math.round(g1 + (g2 - g1) * progress);
  const b = Math.round(b1 + (b2 - b1) * progress);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Clamps a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

/**
 * Easing functions for manual animations
 */
export const EASING = {
  easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeOut: (t: number) => t * (2 - t),
  easeIn: (t: number) => t * t,
  bounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
} as const;
