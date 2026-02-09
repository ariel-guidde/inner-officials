import { GameState, Intention, INTENTION_TYPE, IntentionType, GAME_EVENT_TYPE, Opponent, STATUS_TRIGGER, MODIFIER_STAT } from '../../../types/game';
import { DEFAULT_JUDGE_EFFECTS } from '../constants';
import { FLUSTERED_EFFECTS, OPPONENTS } from '../../../data/opponents';
import { combatLogger } from '../../debug/combatLogger';
import { emitGameEvent } from './events';
import { addStanding, removeStanding } from './standing';
import { consumeOpponentRevealTrigger, processStatusTrigger, getModifierMultiplier, getModifierAdditive } from './statuses';
import { processCoreArgumentTrigger } from './coreArguments';

export function pickRandomIntention(intentions: Intention[]): Intention {
  const index = Math.floor(Math.random() * intentions.length);
  return { ...intentions[index] };
}

export function pickRandomFlustered(): Intention {
  const index = Math.floor(Math.random() * FLUSTERED_EFFECTS.length);
  return { ...FLUSTERED_EFFECTS[index] };
}

// ==================== MULTI-OPPONENT HELPERS ====================

/** Get an opponent by ID, or the first opponent if no ID specified */
export function getOpponent(state: GameState, opponentId?: string): Opponent | undefined {
  if (opponentId) {
    return state.opponents.find(o => o.id === opponentId);
  }
  return state.opponents[0];
}

/** Immutably update one opponent in the opponents array */
export function updateOpponent(
  state: GameState,
  opponentId: string,
  updater: (opp: Opponent) => Opponent
): GameState {
  return {
    ...state,
    opponents: state.opponents.map(o =>
      o.id === opponentId ? updater(o) : o
    ),
  };
}

/** Sync the legacy `state.opponent` from the first entry in `opponents[]` */
export function syncLegacyOpponent(state: GameState): GameState {
  const primary = state.opponents[0];
  if (!primary) return state;
  return {
    ...state,
    opponent: {
      name: primary.name,
      face: primary.face,
      maxFace: primary.maxFace,
      standing: primary.standing,
      currentIntention: primary.currentIntention,
      nextIntention: primary.nextIntention,
      coreArgument: primary.coreArgument,
    },
  };
}

/** Sync changes from legacy `state.opponent` back to `opponents[0]` */
export function syncFromLegacyOpponent(state: GameState): GameState {
  const primary = state.opponents[0];
  if (!primary) return state;
  return {
    ...state,
    opponents: state.opponents.map((o, i) =>
      i === 0
        ? {
            ...o,
            face: state.opponent.face,
            maxFace: state.opponent.maxFace,
            standing: state.opponent.standing,
            currentIntention: state.opponent.currentIntention,
            nextIntention: state.opponent.nextIntention,
            coreArgument: state.opponent.coreArgument,
          }
        : o
    ),
  };
}

// ==================== FLUSTERED ====================

export function applyFlusteredMechanic(state: GameState): GameState {
  let nextState = state;

  for (const opp of nextState.opponents) {
    if (opp.face > 0) continue;

    const flustered = pickRandomFlustered();
    nextState = updateOpponent(nextState, opp.id, (o) => ({
      ...o,
      face: Math.floor(o.maxFace / 2),
      nextIntention: o.currentIntention,
      currentIntention: flustered,
    }));
    combatLogger.logSystemEvent('Opponent Flustered', { opponent: opp.name, effect: flustered.name });
  }

  // Sync to legacy
  nextState = syncLegacyOpponent(nextState);
  return nextState;
}

// ==================== INTENTION DESCRIPTION ====================

function getIntentionDescription(intention: Intention): string {
  switch (intention.type) {
    case INTENTION_TYPE.ATTACK:
      return `Deals ${intention.value} damage`;
    case INTENTION_TYPE.STANDING_GAIN:
      return `Gains ${intention.value} standing`;
    case INTENTION_TYPE.STANDING_DAMAGE:
      return `Damages your standing by ${intention.value}`;
    case INTENTION_TYPE.STALL:
      return `Drains ${intention.value} patience`;
    case INTENTION_TYPE.FLUSTERED:
      return 'Opponent is flustered!';
    default:
      return '';
  }
}

// ==================== EXECUTE SINGLE OPPONENT ACTION ====================

export function executeOpponentAction(state: GameState, intention: Intention, opponentId?: string): GameState {
  const beforeState = state;
  let nextState = { ...state };
  const judgeEffects = state.judge?.effects ?? DEFAULT_JUDGE_EFFECTS;

  let modifiedIntention: Intention | null = { ...intention };

  // Check for negate_attack statuses
  if (modifiedIntention.type === INTENTION_TYPE.ATTACK) {
    const negateIndex = nextState.statuses.findIndex(
      s => s.tags?.includes('negate_attack') && s.owner === 'player'
    );
    if (negateIndex >= 0) {
      const negateStatus = nextState.statuses[negateIndex];
      combatLogger.log('system', `${negateStatus.name} negated the attack!`, { effect: negateStatus.name });
      nextState = {
        ...nextState,
        statuses: nextState.statuses.filter((_, i) => i !== negateIndex),
      };
      modifiedIntention = null;
    }
  }

  if (!modifiedIntention) {
    nextState = emitGameEvent(nextState, {
      type: GAME_EVENT_TYPE.OPPONENT_ACTION,
      name: intention.name,
      description: 'Attack was negated!',
      actionType: intention.type as IntentionType,
      value: 0,
      statChanges: {},
    });
    return nextState;
  }

  let statChanges: { playerFace?: number; playerStanding?: number; opponentStanding?: number } = {};

  if (modifiedIntention.type === INTENTION_TYPE.ATTACK) {
    const baseDamage = Math.floor(modifiedIntention.value * judgeEffects.damageModifier);

    // Process on_damage_received statuses
    nextState = processStatusTrigger(nextState, STATUS_TRIGGER.ON_DAMAGE_RECEIVED, 'player');

    const finalDamage = baseDamage;
    const damage = Math.max(0, finalDamage - nextState.player.poise);
    const previousFace = nextState.player.face;
    nextState.player = {
      ...nextState.player,
      poise: Math.max(0, nextState.player.poise - finalDamage),
      face: nextState.player.face - damage,
    };
    statChanges.playerFace = nextState.player.face - previousFace;

    // Fire on_damage_dealt trigger for opponent core arguments
    if (damage > 0) {
      nextState = processCoreArgumentTrigger(nextState, 'on_damage_dealt');
    }
  } else if (modifiedIntention.type === INTENTION_TYPE.STANDING_GAIN) {
    const baseGain = Math.floor(modifiedIntention.value * judgeEffects.favorGainModifier);
    // Apply opponent core argument modifiers for standing gain
    const oppMultiplier = getModifierMultiplier(nextState, MODIFIER_STAT.FAVOR_GAIN_MULTIPLIER, 'opponent');
    const oppBonus = getModifierAdditive(nextState, MODIFIER_STAT.STANDING_GAIN, 'opponent');
    const standingGain = Math.floor(baseGain * oppMultiplier) + oppBonus;
    nextState = addStanding(nextState, 'opponent', standingGain);
    statChanges.opponentStanding = standingGain;
  } else if (modifiedIntention.type === INTENTION_TYPE.STANDING_DAMAGE) {
    // Apply opponent core argument modifiers for standing damage
    const oppDamageBonus = getModifierAdditive(nextState, MODIFIER_STAT.DAMAGE_MODIFIER, 'opponent');
    const standingDamage = modifiedIntention.value + oppDamageBonus;
    nextState = removeStanding(nextState, 'player', standingDamage);
    statChanges.playerStanding = -standingDamage;
  } else if (modifiedIntention.type === INTENTION_TYPE.STALL) {
    nextState.patience -= modifiedIntention.value;
  } else if (modifiedIntention.type === INTENTION_TYPE.FLUSTERED) {
    combatLogger.logSystemEvent('Opponent Flustered', { effect: modifiedIntention.name });
  }

  const oppName = opponentId
    ? nextState.opponents.find(o => o.id === opponentId)?.name ?? 'Opponent'
    : 'Opponent';

  nextState = emitGameEvent(nextState, {
    type: GAME_EVENT_TYPE.OPPONENT_ACTION,
    name: `${oppName}: ${modifiedIntention.name}`,
    description: getIntentionDescription(modifiedIntention),
    actionType: modifiedIntention.type as IntentionType,
    value: modifiedIntention.value,
    statChanges,
  });

  combatLogger.logAIAction(
    modifiedIntention.name,
    modifiedIntention.type,
    modifiedIntention.value,
    beforeState,
    nextState
  );

  return nextState;
}

// ==================== ADVANCE INTENTION ====================

export function advanceOpponentIntention(state: GameState, opponentId?: string): GameState {
  const targetId = opponentId ?? state.opponents[0]?.id;
  if (!targetId) return state;

  const opp = state.opponents.find(o => o.id === targetId);
  if (!opp) return state;

  const template = OPPONENTS.find((t) => t.name === opp.templateName);
  if (!template) return state;

  let nextState = updateOpponent(state, targetId, (o) => ({
    ...o,
    currentIntention: o.nextIntention || pickRandomIntention(template.intentions),
    nextIntention: pickRandomIntention(template.intentions),
  }));

  // Consume reveal trigger when intention changes
  nextState = consumeOpponentRevealTrigger(nextState, targetId);

  // Sync to legacy opponent
  nextState = syncLegacyOpponent(nextState);
  return nextState;
}

// ==================== EXECUTE ALL OPPONENTS ====================

/**
 * Execute all opponent actions in sequence at turn end.
 * Each opponent acts with their current intention, then advances to the next.
 */
export function executeAllOpponentActions(state: GameState): GameState {
  let nextState = state;

  for (const opp of nextState.opponents) {
    if (!opp.currentIntention) continue;

    // Execute the current intention
    nextState = executeOpponentAction(nextState, opp.currentIntention, opp.id);

    // Advance to next intention
    nextState = advanceOpponentIntention(nextState, opp.id);
  }

  return nextState;
}
