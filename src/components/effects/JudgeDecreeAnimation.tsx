/**
 * @fileoverview Judge Decree Animation System
 *
 * Imperial scroll animation displayed when judges issue decrees.
 * Features Tang Dynasty aesthetics with:
 * - Unfurling scroll effect (3D perspective)
 * - Imperial seal with corner decorations
 * - Element-specific themes for tax decrees
 * - Orbiting particles for element taxes (40 particles)
 * - Golden sparkles for general decrees (30 sparkles)
 * - Scroll rod decorations
 *
 * Duration: 3 seconds
 * Z-index: 110 (above most other effects)
 *
 * @module components/effects/JudgeDecreeAnimation
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Scale, AlertTriangle, Flame, Droplet, Leaf, Mountain, Gem } from 'lucide-react';
import { SPRING_PRESETS, TANG_COLORS, ELEMENT_THEMES } from '../../lib/animations/constants';
import { ELEMENT, Element } from '../../types/game';

/**
 * Props for the JudgeDecreeAnimation component.
 */
interface JudgeDecreeAnimationProps {
  isActive: boolean;
  decreeName: string;
  description: string;
  onComplete?: () => void;
}

/**
 * Determines visual theme for decree based on name and description.
 *
 * Detection order:
 * 1. Element tax decrees (Fire, Water, Wood, Earth, Metal)
 * 2. Patience-related decrees
 * 3. Default imperial decree
 *
 * @param decreeName - Name of the decree
 * @param description - Description text (used for additional detection)
 * @returns Theme configuration with icon, colors, and element (if applicable)
 */
function getDecreeTheme(decreeName: string, description: string) {
  const lowerName = decreeName.toLowerCase();
  const lowerDesc = description.toLowerCase();

  // Element tax decrees
  if (lowerName.includes('fire') || lowerDesc.includes('fire')) {
    return {
      icon: Flame,
      color: ELEMENT_THEMES[ELEMENT.FIRE].primaryColor,
      glow: ELEMENT_THEMES[ELEMENT.FIRE].glowColor,
      label: 'FIRE TAX',
      element: ELEMENT.FIRE,
    };
  }
  if (lowerName.includes('water') || lowerDesc.includes('water')) {
    return {
      icon: Droplet,
      color: ELEMENT_THEMES[ELEMENT.WATER].primaryColor,
      glow: ELEMENT_THEMES[ELEMENT.WATER].glowColor,
      label: 'WATER TAX',
      element: ELEMENT.WATER,
    };
  }
  if (lowerName.includes('wood') || lowerDesc.includes('wood')) {
    return {
      icon: Leaf,
      color: ELEMENT_THEMES[ELEMENT.WOOD].primaryColor,
      glow: ELEMENT_THEMES[ELEMENT.WOOD].glowColor,
      label: 'WOOD TAX',
      element: ELEMENT.WOOD,
    };
  }
  if (lowerName.includes('earth') || lowerDesc.includes('earth')) {
    return {
      icon: Mountain,
      color: ELEMENT_THEMES[ELEMENT.EARTH].primaryColor,
      glow: ELEMENT_THEMES[ELEMENT.EARTH].glowColor,
      label: 'EARTH TAX',
      element: ELEMENT.EARTH,
    };
  }
  if (lowerName.includes('metal') || lowerDesc.includes('metal')) {
    return {
      icon: Gem,
      color: ELEMENT_THEMES[ELEMENT.METAL].primaryColor,
      glow: ELEMENT_THEMES[ELEMENT.METAL].glowColor,
      label: 'METAL TAX',
      element: ELEMENT.METAL,
    };
  }

  // Patience-related decrees
  if (lowerDesc.includes('patience') || lowerName.includes('patience') || lowerName.includes('impatience')) {
    return {
      icon: AlertTriangle,
      color: '#d97706', // amber-600
      glow: '#f59e0b', // amber-500
      label: 'IMPERIAL DECREE',
      element: null,
    };
  }

  // Default imperial decree
  return {
    icon: Scale,
    color: TANG_COLORS.imperialGold,
    glow: TANG_COLORS.imperialGold,
    label: 'IMPERIAL DECREE',
    element: null,
  };
}

/**
 * Imperial scroll decree animation component.
 *
 * Displays a Tang Dynasty-style scroll that unfurls from the top with:
 * - Imperial seal stamp at top
 * - Scroll content (decree name and description)
 * - Element particles for tax decrees
 * - Golden sparkles for general decrees
 * - Hanging scroll rods (top and bottom)
 *
 * Animation sequence:
 * 1. Imperial seal drops and rotates into place (0.2s delay)
 * 2. Top scroll rod appears (0.5s delay)
 * 3. Scroll unfurls downward (0.4s delay, 0.6s duration)
 * 4. Decree label fades in (0.8s delay)
 * 5. Bottom scroll rod appears (0.9s delay)
 * 6. Decree name slides up (1s delay)
 * 7. Description fades in (1.2s delay)
 * 8. Decorative flourish expands (1.4s delay)
 * 9. Particles/sparkles emit throughout
 *
 * @param props - Decree information and completion callback
 */
export default function JudgeDecreeAnimation({
  isActive,
  decreeName,
  description,
  onComplete,
}: JudgeDecreeAnimationProps) {
  const theme = getDecreeTheme(decreeName, description);
  const Icon = theme.icon;

  if (!isActive) return null;

  // Auto-complete after animation duration
  setTimeout(() => onComplete?.(), 3000);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[110] pointer-events-none flex items-center justify-center"
        style={{
          background: `radial-gradient(circle at center, ${TANG_COLORS.vermillion}60 0%, ${TANG_COLORS.imperialRed}40 50%, transparent 80%)`,
        }}
      >
        {/* Imperial Seal (Top) */}
        <motion.div
          initial={{ scale: 0, rotate: -180, y: -200 }}
          animate={{ scale: 1, rotate: 0, y: -250 }}
          transition={{ delay: 0.2, ...SPRING_PRESETS.dramatic }}
          className="absolute"
        >
          <div
            className="relative w-32 h-32 rounded-lg flex items-center justify-center border-4"
            style={{
              background: `linear-gradient(135deg, ${TANG_COLORS.imperialRed}, ${TANG_COLORS.vermillion})`,
              borderColor: TANG_COLORS.imperialGold,
              boxShadow: `0 0 60px ${TANG_COLORS.imperialGold}, inset 0 0 40px ${TANG_COLORS.vermillion}`,
            }}
          >
            <Icon className="w-16 h-16" style={{ color: TANG_COLORS.imperialGold }} strokeWidth={2} />

            {/* Corner decorations */}
            {[0, 90, 180, 270].map((rotation) => (
              <div
                key={rotation}
                className="absolute w-8 h-8 border-t-4 border-l-4"
                style={{
                  borderColor: TANG_COLORS.imperialGold,
                  transform: `rotate(${rotation}deg)`,
                  top: rotation === 0 || rotation === 90 ? -4 : 'auto',
                  bottom: rotation === 180 || rotation === 270 ? -4 : 'auto',
                  left: rotation === 0 || rotation === 270 ? -4 : 'auto',
                  right: rotation === 90 || rotation === 180 ? -4 : 'auto',
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Scroll Unfurling */}
        <motion.div
          className="relative"
          style={{ perspective: '1000px' }}
        >
          {/* Scroll */}
          <motion.div
            initial={{ scaleY: 0, rotateX: -90 }}
            animate={{ scaleY: 1, rotateX: 0 }}
            transition={{ delay: 0.4, duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
            className="relative px-12 py-8 rounded-lg"
            style={{
              background: `linear-gradient(to bottom, ${TANG_COLORS.lotusWhite}, ${TANG_COLORS.bronze}20)`,
              border: `4px solid ${TANG_COLORS.imperialGold}`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 80px ${TANG_COLORS.imperialGold}`,
              transformOrigin: 'top',
              minWidth: '500px',
            }}
          >
            {/* Scroll texture overlay */}
            <div
              className="absolute inset-0 opacity-20 rounded-lg"
              style={{
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${TANG_COLORS.bronze} 2px, ${TANG_COLORS.bronze} 4px)`,
              }}
            />

            {/* Decree Label */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center mb-4"
            >
              <div
                className="text-xs font-bold tracking-widest px-4 py-1 rounded-full inline-block border-2"
                style={{
                  color: theme.color,
                  borderColor: theme.color,
                  background: `${theme.glow}20`,
                  textShadow: `0 0 10px ${theme.glow}`,
                }}
              >
                {theme.label}
              </div>
            </motion.div>

            {/* Decree Name */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, ...SPRING_PRESETS.bouncy }}
              className="text-3xl font-bold text-center mb-3"
              style={{
                color: TANG_COLORS.imperialRed,
                textShadow: `2px 2px 4px rgba(0,0,0,0.3)`,
              }}
            >
              {decreeName}
            </motion.h2>

            {/* Decree Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center text-lg"
              style={{
                color: TANG_COLORS.bronze,
              }}
            >
              {description}
            </motion.p>

            {/* Decorative bottom flourish */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="mt-6 h-1 mx-auto"
              style={{
                width: '60%',
                background: `linear-gradient(to right, transparent, ${TANG_COLORS.imperialGold}, transparent)`,
              }}
            />
          </motion.div>

          {/* Hanging scroll rods */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="absolute -top-4 left-0 right-0 h-3 rounded-full"
            style={{
              background: `linear-gradient(to bottom, ${TANG_COLORS.bronze}, ${TANG_COLORS.imperialGold})`,
              boxShadow: `0 4px 8px rgba(0,0,0,0.5)`,
            }}
          />
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.9, duration: 0.3 }}
            className="absolute -bottom-4 left-0 right-0 h-3 rounded-full"
            style={{
              background: `linear-gradient(to top, ${TANG_COLORS.bronze}, ${TANG_COLORS.imperialGold})`,
              boxShadow: `0 4px 8px rgba(0,0,0,0.5)`,
            }}
          />
        </motion.div>

        {/* Element particles (if element-specific) */}
        {theme.element && <ElementParticles element={theme.element} color={theme.color} glow={theme.glow} />}

        {/* Imperial sparkles */}
        <ImperialSparkles />
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Element-themed orbiting particles for tax decrees.
 *
 * Creates 40 particles that orbit outward in a circular pattern.
 * Particles use element-specific colors and have a pulsing scale animation.
 *
 * @param props - Element and color configuration
 */
function ElementParticles({ color, glow }: { element: Element; color: string; glow: string }) {
  return (
    <>
      {Array.from({ length: 40 }).map((_, i) => {
        const angle = (i / 40) * Math.PI * 2;
        const radius = 250 + Math.random() * 150;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <motion.div
            key={`elem-particle-${i}`}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x,
              y,
              opacity: [0, 1, 1, 0],
              scale: [0, 1.5, 1, 0],
            }}
            transition={{
              duration: 2,
              delay: 0.8 + Math.random() * 0.5,
              ease: 'easeOut',
            }}
            className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 12px ${glow}`,
            }}
          />
        );
      })}
    </>
  );
}

/**
 * Golden sparkle particles for non-element decrees.
 *
 * Creates 30 golden sparkles that emit in random directions from center.
 * Each sparkle has random size (2-6px), distance, and timing for natural effect.
 * Sparkles rotate 360° while fading.
 *
 * @returns JSX for sparkle particle effects
 */
function ImperialSparkles() {
  return (
    <>
      {Array.from({ length: 30 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 300 + Math.random() * 200;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const size = 2 + Math.random() * 4;

        return (
          <motion.div
            key={`sparkle-${i}`}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0, rotate: 0 }}
            animate={{
              x,
              y,
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              rotate: 360,
            }}
            transition={{
              duration: 1.5 + Math.random(),
              delay: 1 + Math.random() * 0.8,
              ease: 'easeOut',
            }}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: TANG_COLORS.imperialGold,
              boxShadow: `0 0 8px ${TANG_COLORS.imperialGold}`,
            }}
          />
        );
      })}
    </>
  );
}

/**
 * Props for the JudgeDecreeAnimationContainer.
 */
interface JudgeDecreeAnimationContainerProps {
  animations: Array<{
    id: string;
    decreeName: string;
    description: string;
  }>;
  onAnimationComplete: (id: string) => void;
}

/**
 * Container component for managing decree animation queue.
 *
 * Ensures only one decree animation plays at a time by showing
 * the most recent animation in the queue. Cleans up completed
 * animations from state.
 *
 * @param props - Animation queue and completion handler
 *
 * @example
 * ```tsx
 * <JudgeDecreeAnimationContainer
 *   animations={battleEffects.judgeDecreeAnimations}
 *   onAnimationComplete={battleEffects.removeJudgeDecreeAnimation}
 * />
 * ```
 */
export function JudgeDecreeAnimationContainer({
  animations,
  onAnimationComplete,
}: JudgeDecreeAnimationContainerProps) {
  // Show only the most recent animation
  const currentAnimation = animations[animations.length - 1];

  if (!currentAnimation) return null;

  return (
    <JudgeDecreeAnimation
      isActive={true}
      decreeName={currentAnimation.decreeName}
      description={currentAnimation.description}
      onComplete={() => onAnimationComplete(currentAnimation.id)}
    />
  );
}
