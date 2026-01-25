import { GameState, GameEvent, ELEMENT, EFFECT_TRIGGER } from '../../../types/game';
import { addActiveEffect } from '../../effects';

export function emitGameEvent(state: GameState, event: Omit<GameEvent, 'id'>): GameState {
  const newEvent: GameEvent = {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  return {
    ...state,
    pendingEvents: [...state.pendingEvents, newEvent],
  };
}

export function addRevealEffect(state: GameState, count: number = 1): GameState {
  const existingReveal = state.activeEffects.find((e) => e.name === 'Keen Insight');

  if (existingReveal) {
    return {
      ...state,
      activeEffects: state.activeEffects.map((e) =>
        e.name === 'Keen Insight'
          ? { ...e, remainingTriggers: (e.remainingTriggers ?? 0) + count }
          : e
      ),
      player: { ...state.player, canSeeNextIntention: true },
    };
  }

  const newState = addActiveEffect(state, {
    name: 'Keen Insight',
    description: `Reveal next ${count} intention(s)`,
    element: ELEMENT.METAL,
    trigger: EFFECT_TRIGGER.PASSIVE,
    remainingTurns: -1,
    remainingTriggers: count,
    apply: (s) => s, // Passive - actual reveal is in canSeeNextIntention
    isPositive: true,
  });

  // Set canSeeNextIntention to true
  return {
    ...newState,
    player: { ...newState.player, canSeeNextIntention: true },
  };
}

export function consumeRevealTrigger(state: GameState): GameState {
  const revealEffect = state.activeEffects.find((e) => e.name === 'Keen Insight');
  if (revealEffect && revealEffect.remainingTriggers !== undefined) {
    const remaining = revealEffect.remainingTriggers - 1;
    if (remaining <= 0) {
      return {
        ...state,
        activeEffects: state.activeEffects.filter((e) => e.name !== 'Keen Insight'),
        player: { ...state.player, canSeeNextIntention: false },
      };
    } else {
      return {
        ...state,
        activeEffects: state.activeEffects.map((e) =>
          e.name === 'Keen Insight' ? { ...e, remainingTriggers: remaining } : e
        ),
      };
    }
  }
  return state;
}
