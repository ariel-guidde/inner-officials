import { Transition, Variants } from 'framer-motion';
import { Element, ELEMENT } from '../../types/game';

// ==================== SPRING PRESETS ====================
// Potionomics-style bouncy springs (FAST & DRAMATIC)
export const SPRING_PRESETS = {
  // Snappy and bouncy (Potionomics signature feel)
  bouncy: {
    type: 'spring',
    stiffness: 600,
    damping: 20,
    mass: 0.6,
  } as Transition,

  // Smooth and fluid (for elegant transitions)
  smooth: {
    type: 'spring',
    stiffness: 350,
    damping: 25,
    mass: 0.8,
  } as Transition,

  // Dramatic and powerful (for big moments)
  dramatic: {
    type: 'spring',
    stiffness: 500,
    damping: 15,
    mass: 0.8,
  } as Transition,

  // Gentle and soft (for subtle animations)
  gentle: {
    type: 'spring',
    stiffness: 250,
    damping: 28,
    mass: 0.8,
  } as Transition,

  // Quick and responsive (for UI feedback)
  quick: {
    type: 'spring',
    stiffness: 700,
    damping: 30,
    mass: 0.4,
  } as Transition,
} as const;

// ==================== HARMONY STATE THEMES ====================
export type HarmonyState = 'balanced' | 'neutral' | 'dissonant' | 'chaos';

export interface HarmonyTheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  bgGradient: string;
  particleColor: string;
  textColor: string;
  borderColor: string;
  pulseSpeed: number; // seconds
  intensity: number; // 0-1 for particle/effect density
}

export const HARMONY_THEMES: Record<HarmonyState, HarmonyTheme> = {
  balanced: {
    name: 'Balanced',
    primaryColor: '#22c55e', // green-500
    secondaryColor: '#86efac', // green-300
    glowColor: 'rgba(34, 197, 94, 0.9)',
    bgGradient: 'from-green-950/50 to-emerald-900/30',
    particleColor: '#4ade80',
    textColor: 'text-green-400',
    borderColor: 'border-green-500',
    pulseSpeed: 1.2,
    intensity: 0.9,
  },
  neutral: {
    name: 'Neutral',
    primaryColor: '#3b82f6', // blue-500
    secondaryColor: '#93c5fd', // blue-300
    glowColor: 'rgba(59, 130, 246, 0.6)',
    bgGradient: 'from-blue-950/30 to-slate-900/15',
    particleColor: '#60a5fa',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500',
    pulseSpeed: 2,
    intensity: 0.5,
  },
  dissonant: {
    name: 'Dissonant',
    primaryColor: '#eab308', // yellow-500
    secondaryColor: '#fde047', // yellow-300
    glowColor: 'rgba(234, 179, 8, 0.8)',
    bgGradient: 'from-yellow-950/50 to-orange-900/30',
    particleColor: '#facc15',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500',
    pulseSpeed: 0.8,
    intensity: 1.0,
  },
  chaos: {
    name: 'Chaos',
    primaryColor: '#ef4444', // red-500
    secondaryColor: '#fb923c', // orange-400
    glowColor: 'rgba(239, 68, 68, 1.0)',
    bgGradient: 'from-red-950/70 to-orange-900/50',
    particleColor: '#f97316',
    textColor: 'text-red-400',
    borderColor: 'border-red-500',
    pulseSpeed: 0.4,
    intensity: 1.5,
  },
};

// ==================== ELEMENT THEMES ====================
export interface ElementTheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  particleType: 'leaf' | 'flame' | 'stone' | 'spark' | 'droplet';
  textColor: string;
  borderColor: string;
  bgGradient: string;
}

export const ELEMENT_THEMES: Record<Element, ElementTheme> = {
  [ELEMENT.WOOD]: {
    name: 'Wood',
    primaryColor: '#22c55e',
    secondaryColor: '#86efac',
    glowColor: 'rgba(34, 197, 94, 0.6)',
    particleType: 'leaf',
    textColor: 'text-green-400',
    borderColor: 'border-green-600',
    bgGradient: 'from-green-950 to-emerald-900',
  },
  [ELEMENT.FIRE]: {
    name: 'Fire',
    primaryColor: '#ef4444',
    secondaryColor: '#fb923c',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    particleType: 'flame',
    textColor: 'text-red-400',
    borderColor: 'border-red-600',
    bgGradient: 'from-red-950 to-orange-900',
  },
  [ELEMENT.EARTH]: {
    name: 'Earth',
    primaryColor: '#eab308',
    secondaryColor: '#fde047',
    glowColor: 'rgba(234, 179, 8, 0.6)',
    particleType: 'stone',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-600',
    bgGradient: 'from-yellow-950 to-amber-900',
  },
  [ELEMENT.METAL]: {
    name: 'Metal',
    primaryColor: '#94a3b8',
    secondaryColor: '#cbd5e1',
    glowColor: 'rgba(148, 163, 184, 0.6)',
    particleType: 'spark',
    textColor: 'text-slate-300',
    borderColor: 'border-slate-400',
    bgGradient: 'from-slate-800 to-stone-900',
  },
  [ELEMENT.WATER]: {
    name: 'Water',
    primaryColor: '#3b82f6',
    secondaryColor: '#60a5fa',
    glowColor: 'rgba(59, 130, 246, 0.6)',
    particleType: 'droplet',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-600',
    bgGradient: 'from-blue-950 to-cyan-900',
  },
};

// ==================== TANG DYNASTY AESTHETICS ====================
export const TANG_COLORS = {
  // Primary palette
  imperialRed: '#c8102e',
  imperialGold: '#ffd700',
  jadeGreen: '#00a86b',
  royalBlue: '#002fa7',

  // Secondary palette
  vermillion: '#e34234',
  bronze: '#cd7f32',
  silk: '#f5e6d3',
  ink: '#1a1a1a',

  // Accent colors
  plumBlossom: '#ff6b9d',
  lotusWhite: '#faf0e6',
  bambooGreen: '#6a8d73',
  moonlightSilver: '#c0c0c0',
} as const;

export const TANG_PATTERNS = {
  cloudScroll: "url('data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 15 Q 20 10, 15 15 Q 10 20, 15 25 Q 20 30, 30 25' stroke='%23ffd700' stroke-width='0.5' fill='none' opacity='0.2'/%3E%3C/svg%3E')",
  lotus: "url('data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='15' fill='none' stroke='%23ffd700' stroke-width='0.5' opacity='0.15'/%3E%3C/svg%3E')",
} as const;

// ==================== ANIMATION VARIANTS ====================
export const FADE_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const SLIDE_UP_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -50 },
};

export const SLIDE_DOWN_VARIANTS: Variants = {
  hidden: { opacity: 0, y: -50 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 50 },
};

export const SCALE_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.5 },
};

export const BOUNCE_IN_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0.3, y: 100 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: SPRING_PRESETS.bouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.3,
    y: -100,
    transition: SPRING_PRESETS.quick,
  },
};

// ==================== NUMBER ANIMATIONS ====================
export const FLOATING_NUMBER_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 0, scale: 0.5 },
  visible: {
    opacity: [0, 1, 1, 0],
    y: [0, -10, -60, -80],
    scale: [0.5, 1.2, 1, 0.8],
    transition: {
      duration: 1.5,
      times: [0, 0.2, 0.8, 1],
      ease: [0.34, 1.56, 0.64, 1], // Custom bounce easing
    },
  },
};

// ==================== CARD ANIMATIONS ====================
export const CARD_PLAY_VARIANTS: Variants = {
  inHand: {
    scale: 1,
    rotateY: 0,
  },
  playing: {
    scale: 1.3,
    y: -200,
    rotateY: 360,
    transition: {
      ...SPRING_PRESETS.dramatic,
      rotateY: {
        duration: 0.6,
        ease: 'easeInOut',
      },
    },
  },
  played: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

// ==================== SCREEN TRANSITIONS ====================
export const SCREEN_TRANSITION_VARIANTS: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: {
    opacity: 1,
    x: 0,
    transition: SPRING_PRESETS.smooth,
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: SPRING_PRESETS.smooth,
  },
};

// ==================== PARTICLE CONFIGS ====================
export interface ParticleConfig {
  count: number;
  lifetime: number; // seconds
  size: { min: number; max: number };
  velocity: { min: number; max: number };
  spread: number; // degrees
}

export const PARTICLE_CONFIGS: Record<HarmonyState, ParticleConfig> = {
  balanced: {
    count: 15,
    lifetime: 2,
    size: { min: 4, max: 8 },
    velocity: { min: 50, max: 100 },
    spread: 60,
  },
  neutral: {
    count: 8,
    lifetime: 2.5,
    size: { min: 3, max: 6 },
    velocity: { min: 30, max: 60 },
    spread: 45,
  },
  dissonant: {
    count: 20,
    lifetime: 1.5,
    size: { min: 3, max: 10 },
    velocity: { min: 60, max: 120 },
    spread: 80,
  },
  chaos: {
    count: 35,
    lifetime: 1.8,
    size: { min: 6, max: 14 },
    velocity: { min: 80, max: 150 },
    spread: 120,
  },
};

// ==================== UTILITY FUNCTIONS ====================
export function getHarmonyState(
  lastElement: Element | null,
  currentElement: Element
): HarmonyState {
  if (!lastElement) return 'neutral';

  const ELEMENT_ORDER: Element[] = [
    ELEMENT.WOOD,
    ELEMENT.FIRE,
    ELEMENT.EARTH,
    ELEMENT.METAL,
    ELEMENT.WATER
  ];

  const lastIndex = ELEMENT_ORDER.indexOf(lastElement);
  const currentIndex = ELEMENT_ORDER.indexOf(currentElement);

  const diff = (currentIndex - lastIndex + 5) % 5;

  if (diff === 1) return 'balanced'; // Next in cycle
  if (diff === 2) return 'chaos'; // Opposite
  return 'dissonant'; // Other positions
}

export function getHarmonyTheme(
  lastElement: Element | null,
  currentElement: Element | null
): HarmonyTheme {
  if (!lastElement || !currentElement) {
    return HARMONY_THEMES.neutral;
  }

  const state = getHarmonyState(lastElement, currentElement);
  return HARMONY_THEMES[state];
}

// ==================== STAGGER CONFIGS ====================
export const STAGGER_CHILDREN = {
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const STAGGER_CHILDREN_FAST = {
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

export const STAGGER_CHILDREN_SLOW = {
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};
