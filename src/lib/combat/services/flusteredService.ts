import { GameState, Intention } from '../../../types/game';
import { FLUSTERED_EFFECTS } from '../../../data/opponents';
import { CombatLog, combatLogger } from '../../debug/combatLogger';
import { updateOpponent } from '../modules/opponent';

export function pickRandomFlustered(): Intention {
  const index = Math.floor(Math.random() * FLUSTERED_EFFECTS.length);
  return { ...FLUSTERED_EFFECTS[index] };
}

/**
 * Apply flustered mechanic to all opponents whose face has reached 0.
 * Resets their face to half max and replaces their current intention.
 */
export function applyFlusteredMechanic(state: GameState, log: CombatLog = combatLogger): GameState {
  let nextState = state;

  for (const opp of nextState.opponents) {
    if (opp.face > 0) continue;

    const flustered = pickRandomFlustered();
    nextState = updateOpponent(nextState, opp.id, (o) => ({
      ...o,
      face: Math.floor(o.maxFace / 2),
      intentionQueue: o.nextIntention
        ? [o.currentIntention!, ...o.intentionQueue]
        : o.intentionQueue,
      nextIntention: o.currentIntention,
      currentIntention: flustered,
    }));
    log.logSystemEvent('Opponent Flustered', { opponent: opp.name, effect: flustered.name });
  }

  return nextState;
}
