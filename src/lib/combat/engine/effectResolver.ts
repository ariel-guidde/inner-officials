import { GameState, DrawCardsFunction } from '../../../types/game';
import { EffectDef, EffectContext, ComputedValueDef } from '../../../types/effects';
import { addStanding } from '../modules/standing';
import { addStatusFromTemplate, addRevealStatus } from '../modules/statuses';
import { updateOpponent } from '../modules/opponent';

/**
 * Resolve an array of effect definitions against the game state.
 * Each effect is a pure data object — no closures.
 */
export function resolveEffects(
  state: GameState,
  effects: EffectDef[],
  context: EffectContext,
  drawCards?: DrawCardsFunction,
  multiplier?: number
): GameState {
  let nextState = state;

  for (const effect of effects) {
    nextState = resolveEffect(nextState, effect, context, drawCards, multiplier);
  }

  return nextState;
}

function applyMultiplier(value: number, multiplier?: number): number {
  if (!multiplier || multiplier === 1) return value;
  return Math.floor(value * multiplier);
}

function resolveEffect(
  state: GameState,
  effect: EffectDef,
  context: EffectContext,
  drawCards?: DrawCardsFunction,
  multiplier?: number
): GameState {
  switch (effect.type) {
    case 'draw_cards':
      return drawCards ? drawCards(state, applyMultiplier(effect.count, multiplier)) : state;

    case 'gain_standing': {
      const target = effect.target ?? 'player';
      return addStanding(state, target, applyMultiplier(effect.value, multiplier));
    }

    case 'gain_poise':
      return {
        ...state,
        player: { ...state.player, poise: state.player.poise + applyMultiplier(effect.value, multiplier) },
      };

    case 'heal_face': {
      const healValue = applyMultiplier(effect.value, multiplier);
      return {
        ...state,
        player: {
          ...state.player,
          face: Math.min(state.player.maxFace, state.player.face + healValue),
        },
      };
    }

    case 'drain_patience':
      return { ...state, patience: state.patience - applyMultiplier(effect.value, multiplier) };

    case 'deal_shame': {
      const targetId = context.targetOpponentId ?? state.opponents[0]?.id;
      if (!targetId) return state;
      const shameValue = applyMultiplier(effect.value, multiplier);
      return updateOpponent(state, targetId, (o) => ({
        ...o,
        face: Math.max(0, o.face - shameValue),
      }));
    }

    case 'add_status':
      return addStatusFromTemplate(state, effect.templateId, {
        owner: effect.target ?? 'player',
        duration: effect.duration,
      });

    case 'remove_status':
      return {
        ...state,
        statuses: state.statuses.filter((s) => {
          if (effect.owner && s.owner !== effect.owner) return true;
          return !s.tags?.includes(effect.tag);
        }),
      };

    case 'reveal_intention': {
      const targetId = context.targetOpponentId;
      if (!targetId) return state;
      return addRevealStatus(state, targetId, effect.count);
    }

    case 'burn_card': {
      if (effect.source === 'selected') {
        // Already handled by targeting service before effects resolve
        return state;
      }
      // Random burn
      const handCards = state.player.hand.filter(c => {
        if (context.sourceCardId && c.id === context.sourceCardId) return false;
        if (effect.filter?.excludeCardId && c.id === effect.filter.excludeCardId) return false;
        return true;
      });
      if (handCards.length === 0) return state;
      const randomIndex = Math.floor(Math.random() * handCards.length);
      const burnCard = handCards[randomIndex];
      return {
        ...state,
        player: {
          ...state.player,
          hand: state.player.hand.filter(c => c.id !== burnCard.id),
          removedFromGame: [...state.player.removedFromGame, burnCard],
        },
      };
    }

    case 'discard_card': {
      if (effect.source === 'selected') {
        // Already handled by targeting service
        return state;
      }
      // Random discard
      const handCards = state.player.hand.filter(c =>
        context.sourceCardId ? c.id !== context.sourceCardId : true
      );
      if (handCards.length === 0) return state;
      const randomIndex = Math.floor(Math.random() * handCards.length);
      const discardCard = handCards[randomIndex];
      return {
        ...state,
        player: {
          ...state.player,
          hand: state.player.hand.filter(c => c.id !== discardCard.id),
          discard: [...state.player.discard, discardCard],
        },
      };
    }

    case 'computed': {
      const computedValue = applyMultiplier(computeValue(effect.compute, context), multiplier);
      // Clone the template and inject the computed value
      const resolvedEffect = injectComputedValue(effect.effectTemplate, computedValue);
      return resolveEffect(state, resolvedEffect, context, drawCards);
    }

    default:
      return state;
  }
}

function computeValue(
  compute: ComputedValueDef,
  context: EffectContext
): number {
  switch (compute.type) {
    case 'target_patience_cost': {
      const card = context.selectedCards?.[0];
      if (!card) return 0;
      return card.patienceCost * compute.multiplier;
    }
    default:
      return 0;
  }
}

function injectComputedValue(template: EffectDef, value: number): EffectDef {
  // Replace the value field of the template with the computed value
  if ('value' in template) {
    return { ...template, value } as EffectDef;
  }
  if ('count' in template) {
    return { ...template, count: value } as EffectDef;
  }
  return template;
}
