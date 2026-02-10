import { GameState, CoreArgument, CoreArgumentTrigger, Element } from '../../../types/game';
import { addStanding } from './standing';

/**
 * Apply passive modifiers from a core argument to element cost calculation
 */
export function getElementCostReduction(coreArgument: CoreArgument | undefined, element: Element): number {
  if (!coreArgument?.passiveModifiers?.elementCostReduction) {
    return 0;
  }
  return coreArgument.passiveModifiers.elementCostReduction[element] ?? 0;
}

/**
 * Get patience cost reduction from core argument
 */
export function getPatienceCostReduction(coreArgument: CoreArgument | undefined): number {
  if (!coreArgument?.passiveModifiers?.patienceCostReduction) {
    return 0;
  }
  return coreArgument.passiveModifiers.patienceCostReduction;
}

/**
 * Get draw bonus from core argument
 */
export function getDrawBonus(coreArgument: CoreArgument | undefined): number {
  if (!coreArgument?.passiveModifiers?.drawBonus) {
    return 0;
  }
  return coreArgument.passiveModifiers.drawBonus;
}

/**
 * Get starting poise from core argument
 */
export function getStartingPoise(coreArgument: CoreArgument | undefined): number {
  if (!coreArgument?.passiveModifiers?.startingPoise) {
    return 0;
  }
  return coreArgument.passiveModifiers.startingPoise;
}

/**
 * Get standing gain bonus from core argument
 */
export function getStandingGainBonus(coreArgument: CoreArgument | undefined): number {
  if (!coreArgument?.passiveModifiers?.standingGainBonus) {
    return 0;
  }
  return coreArgument.passiveModifiers.standingGainBonus;
}

/**
 * Get standing gain multiplier from core argument
 */
export function getStandingGainMultiplier(coreArgument: CoreArgument | undefined): number {
  if (!coreArgument?.passiveModifiers?.standingGainMultiplier) {
    return 1;
  }
  return coreArgument.passiveModifiers.standingGainMultiplier;
}

/**
 * Get opponent standing damage bonus from core argument
 */
export function getOpponentStandingDamageBonus(coreArgument: CoreArgument | undefined): number {
  if (!coreArgument?.passiveModifiers?.opponentStandingDamageBonus) {
    return 0;
  }
  return coreArgument.passiveModifiers.opponentStandingDamageBonus;
}

/**
 * Process triggered core argument effect
 */
export function processCoreArgumentTrigger(
  state: GameState,
  trigger: CoreArgumentTrigger,
  context?: { target: 'player' | 'opponent' }
): GameState {
  let nextState = state;

  // Process player's core argument
  const playerArg = state.player.coreArgument;
  if (playerArg?.trigger === trigger) {
    nextState = applyCoreArgumentEffect(nextState, playerArg, 'player', context);
  }

  // Process all opponents' core arguments
  for (const opp of state.opponents) {
    if (opp.coreArgument?.trigger === trigger) {
      nextState = applyCoreArgumentEffect(nextState, opp.coreArgument, 'opponent', context);
    }
  }

  return nextState;
}

/**
 * Apply a specific core argument effect
 */
function applyCoreArgumentEffect(
  state: GameState,
  coreArgument: CoreArgument,
  owner: 'player' | 'opponent',
  context?: { target: 'player' | 'opponent' }
): GameState {
  let nextState = state;

  switch (coreArgument.trigger) {
    case 'on_turn_start':
    case 'on_turn_end': {
      // Apply standing gain bonus if applicable
      const bonus = getStandingGainBonus(coreArgument);
      if (bonus > 0) {
        nextState = addStanding(nextState, owner, bonus);
      }
      break;
    }

    case 'on_damage_dealt': {
      // When damage is dealt, apply standing bonus
      const bonus = getStandingGainBonus(coreArgument);
      if (bonus > 0) {
        nextState = addStanding(nextState, owner, bonus);
      }
      break;
    }

    case 'on_standing_gain': {
      // When opponent gains standing, the Stoic Defense style gives poise
      if (owner === 'player' && context?.target === 'opponent') {
        const poise = coreArgument.passiveModifiers?.startingPoise ?? 0;
        if (poise > 0) {
          nextState = {
            ...nextState,
            player: {
              ...nextState.player,
              poise: nextState.player.poise + poise,
            },
          };
        }
      }
      break;
    }

    case 'on_tier_advance': {
      // When advancing a tier, apply standing bonus
      const bonus = getStandingGainBonus(coreArgument);
      if (bonus > 0) {
        nextState = addStanding(nextState, owner, bonus);
      }
      break;
    }

    case 'on_card_play': {
      // Effects that trigger on every card play
      break;
    }
  }

  return nextState;
}

/**
 * Apply starting poise from core argument at turn start
 */
export function applyTurnStartPoise(state: GameState): GameState {
  const playerPoise = getStartingPoise(state.player.coreArgument);

  if (playerPoise > 0) {
    return {
      ...state,
      player: {
        ...state.player,
        poise: state.player.poise + playerPoise,
      },
    };
  }

  return state;
}

/**
 * Calculate modified standing gain based on core argument multipliers
 */
export function calculateModifiedStandingGain(
  baseAmount: number,
  coreArgument: CoreArgument | undefined
): number {
  const multiplier = getStandingGainMultiplier(coreArgument);
  const bonus = getStandingGainBonus(coreArgument);

  return Math.floor(baseAmount * multiplier) + bonus;
}
