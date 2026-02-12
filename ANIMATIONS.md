# Animation System Documentation

## Overview

Inner Officials uses a **data-driven, event-based animation system** that provides responsive visual feedback for all game actions. The system is built on **Framer Motion** and follows game industry patterns for animation management.

## Architecture

```
src/
├── lib/
│   └── animations/
│       ├── AnimationManager.ts      # Central animation orchestration
│       ├── constants.ts              # Animation presets, themes, variants
│       └── utils.ts                  # Helper functions for animation math
│
├── components/
│   └── effects/                      # Animation Components (View Layer)
│       ├── ElementParticles.tsx      # Particle system for elements
│       ├── IntentionAnimation.tsx    # Opponent action animations
│       ├── JudgeDecreeAnimation.tsx  # Judge decree animations
│       ├── StatusEffectAnimation.tsx # Status buff/debuff indicators
│       └── TierAdvancementAnimation.tsx # Tier-up celebrations
│
└── hooks/
    └── useBattleEffects.ts           # Animation state management hook
```

## Design Principles

### 1. **Separation of Concerns**
- **Data Layer**: Animation state (`useBattleEffects`)
- **Logic Layer**: Trigger detection (in game components)
- **View Layer**: Animation components (pure presentation)

### 2. **Event-Driven Triggers**
Animations respond to game events automatically:
```typescript
// Game state changes → Hook detects change → Triggers animation
useEffect(() => {
  if (opponentActed) {
    battleEffects.triggerIntentionAnimation(...)
  }
}, [gameState])
```

### 3. **Non-Blocking by Default**
All animations use `pointer-events-none` to avoid disrupting gameplay:
```typescript
<motion.div className="fixed inset-0 z-[100] pointer-events-none">
  {/* Animation content */}
</motion.div>
```

### 4. **Performance Optimized**
- Animations auto-cleanup after completion
- Single instance rendering (no spam)
- GPU-accelerated transforms (translate, scale, rotate)

## Animation Types

### 🎴 Card Play Particles
**Trigger**: When player plays a card
**Duration**: 1.2s
**Visual**: 30 element-themed particles burst from hand

```typescript
battleEffects.triggerCardEffect(card, x, y)
```

### ⚔️ Opponent Intentions
**Trigger**: When opponent executes action
**Duration**: 2s
**Visual**: Full-screen type-specific animation

Types:
- **Attack** (Red): Sword icon, explosive particles
- **Standing Gain** (Purple): Rising arrow, upward motion
- **Standing Damage** (Amber): Falling arrow, downward cascade
- **Stall** (Yellow): Hourglass, time-stop effect
- **Flustered** (Blue): Lightning, chaotic scatter

```typescript
battleEffects.triggerIntentionAnimation(name, type, value, opponentName)
```

### 📜 Judge Decrees
**Trigger**: When judge issues decree
**Duration**: 3s
**Visual**: Imperial scroll unfurling with Tang Dynasty aesthetics

```typescript
battleEffects.triggerJudgeDecree(name, description)
```

### 💫 Status Effects
**Trigger**: When status applied to player/opponent
**Duration**: 1.5s
**Visual**: Icon floats up with particles

```typescript
battleEffects.triggerStatusEffect(name, targetId, isPositive)
```

### 👑 Tier Advancement
**Trigger**: When player advances standing tier
**Duration**: 3.5s
**Visual**: Massive celebration with fireworks, confetti

```typescript
battleEffects.triggerTierAdvancement(tierNumber, tierName)
```

## Animation Constants

### Spring Presets
Located in `lib/animations/constants.ts`:

```typescript
SPRING_PRESETS = {
  bouncy: { stiffness: 600, damping: 20 },    // Card play, UI
  dramatic: { stiffness: 500, damping: 15 },  // Tier-ups, decrees
  smooth: { stiffness: 200, damping: 30 },    // Transitions
  snappy: { stiffness: 400, damping: 25 },    // Quick feedback
}
```

### Element Themes
Each element has unique colors and particle shapes:

| Element | Color | Particle Shape | Use Case |
|---------|-------|----------------|----------|
| Wood 🍃 | Green | Leaf | Nature, growth cards |
| Fire 🔥 | Red/Orange | Flame | Aggressive cards |
| Earth 🪨 | Brown/Yellow | Stone | Defensive cards |
| Metal ⚔️ | Silver/Gold | Spark | Sharp, precise cards |
| Water 💧 | Blue | Droplet | Flowing, adaptive cards |

### Harmony Themes
Visual effects based on element flow state:

```typescript
HARMONY_THEMES = {
  balanced: { color: '#22c55e', intensity: 0.9 },  // Green glow
  neutral: { color: '#60a5fa', intensity: 0.5 },   // Blue subtle
  dissonant: { color: '#ef4444', intensity: 1.2 }, // Red warning
  chaos: { color: '#dc2626', intensity: 1.5 },     // Red explosion
}
```

## Integration Guide

### Adding New Animations

#### 1. Create Animation Component
```tsx
// src/components/effects/MyAnimation.tsx
export default function MyAnimation({
  isActive,
  data,
  onComplete,
}: MyAnimationProps) {
  if (!isActive) return null;

  setTimeout(() => onComplete?.(), DURATION);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] pointer-events-none"
    >
      {/* Animation content */}
    </motion.div>
  );
}
```

#### 2. Add to Animation Hook
```typescript
// src/hooks/useBattleEffects.ts
export interface MyAnimation {
  id: string;
  data: any;
}

// Add state
const [myAnimations, setMyAnimations] = useState<MyAnimation[]>([]);

// Add trigger
const triggerMyAnimation = useCallback((data: any) => {
  setMyAnimations(prev => [...prev, { id: `my-${Date.now()}`, data }]);
}, []);

// Add cleanup
const removeMyAnimation = useCallback((id: string) => {
  setMyAnimations(prev => prev.filter(a => a.id !== id));
}, []);
```

#### 3. Integrate in BattleArena
```tsx
// Watch for trigger condition
useEffect(() => {
  if (conditionMet) {
    battleEffects.triggerMyAnimation(data);
  }
}, [dependency]);

// Render container
<MyAnimationContainer
  animations={battleEffects.myAnimations}
  onAnimationComplete={battleEffects.removeMyAnimation}
/>
```

### Performance Considerations

#### DO ✅
- Use `transform` and `opacity` for animations (GPU accelerated)
- Set `pointer-events-none` on overlays
- Auto-cleanup after completion
- Limit particle counts (10-30 per effect)
- Use `will-change` sparingly

#### DON'T ❌
- Animate `width`, `height`, `top`, `left` (causes reflow)
- Create animations in tight loops
- Keep animations mounted when hidden
- Spam animation triggers
- Use expensive filters without GPU acceleration

### Animation Timing

Follow the **Rule of 60 FPS**:
- Quick feedback: 150-300ms (user action response)
- Standard animations: 500-800ms (transitions)
- Dramatic moments: 1500-3500ms (tier-ups, decrees)

```typescript
// Good timing examples
const DURATION_QUICK = 0.2;      // Button press
const DURATION_NORMAL = 0.6;     // Card play
const DURATION_DRAMATIC = 2.0;   // Victory screen
```

## Debugging

### Animation Inspector
Enable animation debugging in dev tools:
```typescript
// In browser console
localStorage.setItem('debug-animations', 'true');
```

### Common Issues

**Animations not triggering?**
- Check useEffect dependencies
- Verify battleEffects hook is initialized
- Ensure animation state is updating

**Performance issues?**
- Check particle counts (reduce if >30)
- Verify `pointer-events-none` is set
- Use React DevTools Profiler

**Animations stuttering?**
- Avoid animating layout properties
- Use `transform` and `opacity` only
- Check for expensive re-renders in parent

## Tang Dynasty Aesthetic

All animations follow traditional Chinese design:

### Colors
```typescript
TANG_COLORS = {
  imperialRed: '#c8102e',    // Primary accent
  imperialGold: '#ffd700',   // Wealth, importance
  jadeGreen: '#00a86b',      // Harmony, balance
  lotusWhite: '#fffef0',     // Purity, clarity
  vermillion: '#e34234',     // Energy, passion
  bronze: '#cd7f32',         // Aged, wisdom
}
```

### Patterns
- Lotus flowers: Growth, enlightenment
- Cloud scrolls: Heavenly connection
- Imperial seals: Authority, decrees
- Flowing ribbons: Harmony, movement
- Corner brackets: Traditional framing

### Motion Style
- **Elegant curves** over straight lines
- **Spring physics** for organic feel
- **Expanding rings** for emphasis
- **Floating particles** for energy
- **Seal stamps** for authority

## Best Practices

### Code Style
```typescript
// Use descriptive animation names
triggerVictoryCelebration() // ✅ Clear
triggerAnim1()              // ❌ Vague

// Group related animations
const victoryEffects = {
  fireworks: true,
  confetti: true,
  fanfare: true,
}

// Comment complex easing
transition={{
  duration: 2,
  ease: [0.43, 0.13, 0.23, 0.96], // Custom cubic-bezier for bouncy feel
}}
```

### File Organization
```
effects/
├── core/              # Core animation primitives
│   ├── Particles.tsx
│   └── Glow.tsx
├── combat/            # Battle animations
│   ├── IntentionAnimation.tsx
│   └── StatusEffectAnimation.tsx
└── ui/                # UI feedback
    ├── ButtonRipple.tsx
    └── ScreenTransition.tsx
```

## References

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Game UI Animation Principles](https://www.gamasutra.com/view/feature/184342/game_ui_discoveries_what_players_.php)
- [Tang Dynasty Design](https://en.wikipedia.org/wiki/Tang_dynasty_art)
- [Juice It or Lose It](https://www.youtube.com/watch?v=Fy0aCDmgnxg) (Game feel talk)

## Version History

- **v1.0** (Current): Complete animation system with all battle events
  - Element particles
  - Intention animations
  - Judge decrees
  - Status effects
  - Tier advancements
  - Non-blocking implementation
