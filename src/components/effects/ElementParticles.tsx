import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Element } from '../../types/game';
import { ELEMENT_THEMES } from '../../lib/animations/constants';
import { generateParticlePosition, getRandomSize } from '../../lib/animations/utils';

interface Particle {
  id: string;
  x: number;
  y: number;
  size: number;
  velocity: { x: number; y: number };
  rotation: number;
  lifetime: number;
}

interface ElementParticlesProps {
  element: Element;
  x: number; // Origin X position
  y: number; // Origin Y position
  count?: number;
  spread?: number; // Angle in degrees
  velocity?: number;
  duration?: number;
  onComplete?: () => void;
}

/**
 * Renders element-themed particles that burst from a point
 */
export default function ElementParticles({
  element,
  x,
  y,
  count = 20,
  spread = 120,
  velocity = 100,
  duration = 1.5,
  onComplete,
}: ElementParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const theme = ELEMENT_THEMES[element];

  useEffect(() => {
    // Generate particles
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => {
      const position = generateParticlePosition(spread, velocity);
      return {
        id: `particle-${element}-${Date.now()}-${i}`,
        x: 0,
        y: 0,
        size: getRandomSize(4, 12),
        velocity: position,
        rotation: Math.random() * 360,
        lifetime: duration,
      };
    });

    setParticles(newParticles);

    // Complete callback
    const timer = setTimeout(() => {
      onComplete?.();
    }, duration * 1000);

    return () => clearTimeout(timer);
  }, [element, count, spread, velocity, duration, onComplete]);

  const getParticleShape = () => {
    switch (theme.particleType) {
      case 'leaf':
        return 'rounded-bl-full rounded-tr-full';
      case 'flame':
        return 'rounded-t-full';
      case 'stone':
        return 'rounded-sm';
      case 'spark':
        return 'rotate-45';
      case 'droplet':
        return 'rounded-full';
      default:
        return 'rounded-full';
    }
  };

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: x,
        top: y,
      }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
            rotate: particle.rotation,
          }}
          animate={{
            x: particle.velocity.x,
            y: particle.velocity.y,
            opacity: 0,
            scale: 0,
            rotate: particle.rotation + (Math.random() > 0.5 ? 360 : -360),
          }}
          transition={{
            duration: particle.lifetime,
            ease: 'easeOut',
          }}
          className={`absolute ${getParticleShape()}`}
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: theme.primaryColor,
            boxShadow: `0 0 ${particle.size}px ${theme.glowColor}`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Container for managing multiple particle effects
 */
interface ParticleEffect {
  id: string;
  element: Element;
  x: number;
  y: number;
  count?: number;
  spread?: number;
  velocity?: number;
  duration?: number;
}

interface ElementParticlesContainerProps {
  effects: ParticleEffect[];
  onEffectComplete?: (id: string) => void;
}

export function ElementParticlesContainer({ effects, onEffectComplete }: ElementParticlesContainerProps) {
  return (
    <>
      {effects.map((effect) => (
        <ElementParticles
          key={effect.id}
          element={effect.element}
          x={effect.x}
          y={effect.y}
          count={effect.count}
          spread={effect.spread}
          velocity={effect.velocity}
          duration={effect.duration}
          onComplete={() => onEffectComplete?.(effect.id)}
        />
      ))}
    </>
  );
}

/**
 * Harmony state particle effect (for wuxing compass)
 */
interface HarmonyParticlesProps {
  isActive: boolean;
  element: Element;
  harmonyState: 'balanced' | 'neutral' | 'dissonant' | 'chaos';
}

export function HarmonyParticles({ isActive, element, harmonyState }: HarmonyParticlesProps) {
  if (!isActive) return null;

  const getParticleCount = () => {
    switch (harmonyState) {
      case 'balanced':
        return 15;
      case 'neutral':
        return 8;
      case 'dissonant':
        return 20;
      case 'chaos':
        return 35;
      default:
        return 10;
    }
  };

  const getVelocity = () => {
    switch (harmonyState) {
      case 'balanced':
        return 80;
      case 'neutral':
        return 50;
      case 'dissonant':
        return 100;
      case 'chaos':
        return 130;
      default:
        return 70;
    }
  };

  // Position at center of screen for wuxing compass
  return (
    <ElementParticles
      element={element}
      x={window.innerWidth / 2}
      y={window.innerHeight / 2 - 200} // Approximate wuxing compass position
      count={getParticleCount()}
      spread={360}
      velocity={getVelocity()}
      duration={1.5}
    />
  );
}
