import { GameState, ActiveEffect, EffectTrigger } from '../types/game';

// ==================== ACTIVE EFFECTS MANAGEMENT ====================

// Add an active effect to the game state
export const addActiveEffect = (state: GameState, effect: Omit<ActiveEffect, 'id'>): GameState => {
  const newEffect: ActiveEffect = {
    ...effect,
    id: `eff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  return {
    ...state,
    activeEffects: [...state.activeEffects, newEffect],
  };
};

// Remove an active effect by ID
export const removeActiveEffect = (state: GameState, effectId: string): GameState => {
  return {
    ...state,
    activeEffects: state.activeEffects.filter(e => e.id !== effectId),
  };
};

// Process all effects matching a specific trigger
export const processEffects = (state: GameState, trigger: EffectTrigger): GameState => {
  let nextState = { ...state };
  const matchingEffects = nextState.activeEffects.filter(e => e.trigger === trigger);

  for (const effect of matchingEffects) {
    // Apply the effect
    nextState = effect.apply(nextState);

    // Handle remaining triggers (for effects like "next 3 attacks")
    if (effect.remainingTriggers !== undefined) {
      const remaining = effect.remainingTriggers - 1;
      if (remaining <= 0) {
        // Remove the effect
        nextState = {
          ...nextState,
          activeEffects: nextState.activeEffects.filter(e => e.id !== effect.id),
        };
      } else {
        // Update remaining triggers
        nextState = {
          ...nextState,
          activeEffects: nextState.activeEffects.map(e =>
            e.id === effect.id ? { ...e, remainingTriggers: remaining } : e
          ),
        };
      }
    }
  }

  return nextState;
};

// Tick effect counters at end of turn - decrements turn counters and removes expired effects
export const tickEffects = (state: GameState): GameState => {
  const updatedEffects: ActiveEffect[] = [];

  for (const effect of state.activeEffects) {
    if (effect.remainingTurns === -1) {
      // Permanent until triggers exhausted - keep it
      updatedEffects.push(effect);
    } else if (effect.remainingTurns > 1) {
      // Decrement turns and keep
      updatedEffects.push({ ...effect, remainingTurns: effect.remainingTurns - 1 });
    }
    // If remainingTurns === 1, this is the last turn - don't include (effect expires)
    // If remainingTurns === 0, should already be removed
  }

  return {
    ...state,
    activeEffects: updatedEffects,
  };
};

// Get aggregated passive modifiers from active effects
export interface PassiveModifiers {
  damageReduction: number;
  favorGainBonus: number;
  patienceCostReduction: number;
}

export const getPassiveModifiers = (state: GameState): PassiveModifiers => {
  const modifiers: PassiveModifiers = {
    damageReduction: 0,
    favorGainBonus: 0,
    patienceCostReduction: 0,
  };

  for (const effect of state.activeEffects) {
    if (effect.trigger === 'passive') {
      // Effects can store modifier data in their apply function closure
      // This is a simplified approach - real implementation might use metadata
    }
  }

  return modifiers;
};

// ==================== EFFECT FACTORIES ====================
// These create effect apply functions for common effect patterns

// Factory for favor gain at end of turn
export const createFavorGainEffect = (amount: number) => (state: GameState): GameState => ({
  ...state,
  player: {
    ...state.player,
    favor: Math.min(100, state.player.favor + amount),
  },
});

// Factory for damage reduction (reduces incoming damage)
export const createDamageReductionEffect = (amount: number) => (state: GameState): GameState => {
  // This effect is meant to be processed during on_damage trigger
  // The actual reduction happens by modifying poise temporarily or tracking reduction
  return {
    ...state,
    player: {
      ...state.player,
      poise: state.player.poise + amount, // Add temporary poise as damage reduction
    },
  };
};

// Factory for healing at turn start
export const createHealingEffect = (amount: number) => (state: GameState): GameState => ({
  ...state,
  player: {
    ...state.player,
    face: Math.min(state.player.maxFace, state.player.face + amount),
  },
});

// Factory for poise gain at turn start
export const createPoiseGainEffect = (amount: number) => (state: GameState): GameState => ({
  ...state,
  player: {
    ...state.player,
    poise: state.player.poise + amount,
  },
});

// ==================== PRESET EFFECTS FOR CARDS ====================

// Wood card effect: Gain favor at end of turn for N turns
export const growingRootsEffect = (state: GameState): GameState => {
  return addActiveEffect(state, {
    name: 'Growing Roots',
    description: 'Gain 5 Favor at end of turn',
    element: 'wood',
    trigger: 'turn_end',
    remainingTurns: 3,
    apply: createFavorGainEffect(5),
    isPositive: true,
  });
};

// Wood card effect: Reduce next N attacks by amount
export const thickBarkEffect = (state: GameState): GameState => {
  return addActiveEffect(state, {
    name: 'Thick Bark',
    description: 'Next 3 attacks deal 5 less damage',
    element: 'wood',
    trigger: 'on_damage',
    remainingTurns: -1, // Permanent until triggers exhausted
    remainingTriggers: 3,
    apply: createDamageReductionEffect(5),
    isPositive: true,
  });
};

// Wood card effect: Heal over time
export const regenerationEffect = (state: GameState): GameState => {
  return addActiveEffect(state, {
    name: 'Regeneration',
    description: 'Heal 3 Face at start of turn',
    element: 'wood',
    trigger: 'turn_start',
    remainingTurns: 4,
    apply: createHealingEffect(3),
    isPositive: true,
  });
};

// Wood card effect: Sustained composure
export const innerPeaceEffect = (state: GameState): GameState => {
  return addActiveEffect(state, {
    name: 'Inner Peace',
    description: 'Gain 8 Composure at start of turn',
    element: 'wood',
    trigger: 'turn_start',
    remainingTurns: 3,
    apply: createPoiseGainEffect(8),
    isPositive: true,
  });
};

// Wood card effect: Steady favor growth
export const deepRootsEffect = (state: GameState): GameState => {
  return addActiveEffect(state, {
    name: 'Deep Roots',
    description: 'Gain 8 Favor at end of turn',
    element: 'wood',
    trigger: 'turn_end',
    remainingTurns: 2,
    apply: createFavorGainEffect(8),
    isPositive: true,
  });
};
