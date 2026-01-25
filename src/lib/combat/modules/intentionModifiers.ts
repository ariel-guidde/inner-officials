import { GameState, Intention, IntentionModifier } from '../../../types/game';

/**
 * Add an intention modifier to the game state
 */
export function addIntentionModifier(state: GameState, modifier: Omit<IntentionModifier, 'id'>): GameState {
  const newModifier: IntentionModifier = {
    ...modifier,
    id: `im_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  return {
    ...state,
    intentionModifiers: [...state.intentionModifiers, newModifier],
  };
}

/**
 * Apply intention modifiers and consume triggers
 */
export function applyIntentionModifiers(
  state: GameState,
  intention: Intention
): { state: GameState; intention: Intention } {
  let nextState = { ...state };
  let modifiedIntention = { ...intention };
  const remainingModifiers: IntentionModifier[] = [];

  for (const modifier of nextState.intentionModifiers) {
    modifiedIntention = modifier.modify(modifiedIntention);
    const remaining = modifier.remainingTriggers - 1;
    if (remaining > 0) {
      remainingModifiers.push({ ...modifier, remainingTriggers: remaining });
    }
  }

  nextState.intentionModifiers = remainingModifiers;
  return { state: nextState, intention: modifiedIntention };
}
