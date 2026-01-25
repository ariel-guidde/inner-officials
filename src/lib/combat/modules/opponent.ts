import { GameState, Intention, INTENTION_TYPE, IntentionType, EFFECT_TRIGGER, GAME_EVENT_TYPE } from '../../../types/game';
import { DEFAULT_JUDGE_EFFECTS } from '../constants';
import { FLUSTERED_EFFECTS, OPPONENTS } from '../../../data/opponents';
import { combatLogger } from '../../debug/combatLogger';
import { applyIntentionModifiers } from './intentionModifiers';
import { checkTrapEffects } from './boardEffects';
import { emitGameEvent } from './events';

export function pickRandomIntention(intentions: Intention[]): Intention {
  const index = Math.floor(Math.random() * intentions.length);
  return { ...intentions[index] };
}

export function pickRandomFlustered(): Intention {
  const index = Math.floor(Math.random() * FLUSTERED_EFFECTS.length);
  return { ...FLUSTERED_EFFECTS[index] };
}

export function applyFlusteredMechanic(state: GameState): GameState {
  if (state.opponent.face > 0) return state;

  const flustered = pickRandomFlustered();
  const nextState = {
    ...state,
    opponent: {
      ...state.opponent,
      face: Math.floor(state.opponent.maxFace / 2),
      nextIntention: state.opponent.currentIntention,
      currentIntention: flustered,
      patienceSpent: 0,
    },
  };
  combatLogger.logSystemEvent('Opponent Flustered', { effect: flustered.name });
  return nextState;
}

function getIntentionDescription(intention: Intention): string {
  switch (intention.type) {
    case INTENTION_TYPE.ATTACK:
      return `Deals ${intention.value} damage`;
    case INTENTION_TYPE.FAVOR_GAIN:
      return `Gains ${intention.value} favor`;
    case INTENTION_TYPE.FAVOR_STEAL:
      return `Steals ${intention.value} favor`;
    case INTENTION_TYPE.STALL:
      return `Drains ${intention.value} patience`;
    case INTENTION_TYPE.FLUSTERED:
      return 'Opponent is flustered!';
    default:
      return '';
  }
}

export function executeOpponentAction(state: GameState, intention: Intention): GameState {
  const beforeState = state;
  let nextState = { ...state };
  const judgeEffects = state.judge?.effects ?? DEFAULT_JUDGE_EFFECTS;

  const modifierResult = applyIntentionModifiers(nextState, intention);
  nextState = modifierResult.state;
  let modifiedIntention: Intention | null = modifierResult.intention;

  if (modifiedIntention) {
    const trapResult = checkTrapEffects(nextState, modifiedIntention);
    nextState = trapResult.state;
    modifiedIntention = trapResult.intention;
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

  let statChanges: { playerFace?: number; playerFavor?: number } = {};

  if (modifiedIntention.type === INTENTION_TYPE.ATTACK) {
    const baseDamage = Math.floor(modifiedIntention.value * judgeEffects.damageModifier);

    let finalDamage = baseDamage;
    const damageReductionEffects = nextState.activeEffects.filter(
      (e) => e.trigger === EFFECT_TRIGGER.ON_DAMAGE
    );
    for (const effect of damageReductionEffects) {
      nextState = effect.apply(nextState);
      if (effect.remainingTriggers !== undefined) {
        const remaining = effect.remainingTriggers - 1;
        if (remaining <= 0) {
          nextState = {
            ...nextState,
            activeEffects: nextState.activeEffects.filter((e) => e.id !== effect.id),
          };
        } else {
          nextState = {
            ...nextState,
            activeEffects: nextState.activeEffects.map((e) =>
              e.id === effect.id ? { ...e, remainingTriggers: remaining } : e
            ),
          };
        }
      }
    }

    const damage = Math.max(0, finalDamage - nextState.player.poise);
    const previousFace = nextState.player.face;
    nextState.player = {
      ...nextState.player,
      poise: Math.max(0, nextState.player.poise - finalDamage),
      face: nextState.player.face - damage,
    };
    statChanges.playerFace = nextState.player.face - previousFace;
  } else if (modifiedIntention.type === INTENTION_TYPE.FAVOR_GAIN) {
    const favorGain = Math.floor(modifiedIntention.value * judgeEffects.favorGainModifier);
    nextState.opponent = {
      ...nextState.opponent,
      favor: Math.min(100, nextState.opponent.favor + favorGain),
    };
  } else if (modifiedIntention.type === INTENTION_TYPE.FAVOR_STEAL) {
    const favorSteal = modifiedIntention.value;
    const previousFavor = nextState.player.favor;
    nextState.player = {
      ...nextState.player,
      favor: Math.max(0, nextState.player.favor - favorSteal),
    };
    nextState.opponent = {
      ...nextState.opponent,
      favor: Math.min(100, nextState.opponent.favor + favorSteal),
    };
    statChanges.playerFavor = nextState.player.favor - previousFavor;
  } else if (modifiedIntention.type === INTENTION_TYPE.STALL) {
    nextState.patience -= modifiedIntention.value;
  } else if (modifiedIntention.type === INTENTION_TYPE.FLUSTERED) {
    combatLogger.logSystemEvent('Opponent Flustered', { effect: modifiedIntention.name });
  }

  nextState = emitGameEvent(nextState, {
    type: GAME_EVENT_TYPE.OPPONENT_ACTION,
    name: modifiedIntention.name,
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

export function advanceOpponentIntention(state: GameState): GameState {
  const template = OPPONENTS.find((o) => o.name === state.opponent.name);
  if (!template) return state;

  return {
    ...state,
    opponent: {
      ...state.opponent,
      currentIntention: state.opponent.nextIntention || pickRandomIntention(template.intentions),
      nextIntention: pickRandomIntention(template.intentions),
      patienceSpent: 0, // Reset tracking
    },
  };
}
