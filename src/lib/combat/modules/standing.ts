import { GameState, Standing, TierDefinition, CombatResult } from '../../../types/game';

/**
 * Creates an initial standing at tier 0
 */
export function createInitialStanding(): Standing {
  return {
    currentTier: 0,
    favorInCurrentTier: 0,
  };
}

/**
 * Get the max tier number from a tier structure
 */
export function getMaxTier(tierStructure: TierDefinition[]): number {
  return Math.max(...tierStructure.map(t => t.tierNumber));
}

/**
 * Get the tier definition for a specific tier
 */
export function getTierDefinition(tierStructure: TierDefinition[], tierNumber: number): TierDefinition | undefined {
  return tierStructure.find(t => t.tierNumber === tierNumber);
}

/**
 * Get the favor required to complete the current tier
 */
export function getCurrentTierRequirement(tierStructure: TierDefinition[], currentTier: number): number {
  const tier = getTierDefinition(tierStructure, currentTier);
  return tier?.favorRequired ?? 0;
}

/**
 * Calculate total favor accumulated across all tiers
 */
export function getTotalFavor(standing: Standing, tierStructure: TierDefinition[]): number {
  let total = standing.favorInCurrentTier;
  for (let i = 0; i < standing.currentTier; i++) {
    const tier = getTierDefinition(tierStructure, i);
    if (tier) {
      total += tier.favorRequired;
    }
  }
  return total;
}

/**
 * Get progress info for the current tier
 */
export interface TierProgress {
  currentTier: number;
  tierName: string;
  favorInTier: number;
  favorRequired: number;
  progressPercent: number;
  isMaxTier: boolean;
}

export function getTierProgress(standing: Standing, tierStructure: TierDefinition[]): TierProgress {
  const maxTier = getMaxTier(tierStructure);
  const currentTierDef = getTierDefinition(tierStructure, standing.currentTier);
  const isMaxTier = standing.currentTier >= maxTier;

  return {
    currentTier: standing.currentTier,
    tierName: currentTierDef?.tierName ?? `Tier ${standing.currentTier}`,
    favorInTier: standing.favorInCurrentTier,
    favorRequired: currentTierDef?.favorRequired ?? 0,
    progressPercent: currentTierDef && currentTierDef.favorRequired > 0
      ? Math.min(100, (standing.favorInCurrentTier / currentTierDef.favorRequired) * 100)
      : 100,
    isMaxTier,
  };
}

/**
 * Advance standing through tiers
 */
function advanceStanding(standing: Standing, amount: number, tierStructure: TierDefinition[]): Standing {
  if (amount <= 0) return standing;

  const maxTier = getMaxTier(tierStructure);
  const result = { ...standing };
  let remainingAmount = amount;

  while (remainingAmount > 0) {
    if (result.currentTier >= maxTier) {
      result.favorInCurrentTier += remainingAmount;
      break;
    }

    const currentTierReq = getCurrentTierRequirement(tierStructure, result.currentTier);
    const neededForAdvance = currentTierReq - result.favorInCurrentTier;

    if (remainingAmount >= neededForAdvance) {
      result.currentTier += 1;
      result.favorInCurrentTier = 0;
      remainingAmount -= neededForAdvance;
    } else {
      result.favorInCurrentTier += remainingAmount;
      remainingAmount = 0;
    }
  }

  return result;
}

/**
 * Reduce standing, potentially dropping tiers
 */
function reduceStanding(standing: Standing, amount: number, tierStructure: TierDefinition[]): Standing {
  if (amount <= 0) return standing;

  const result = { ...standing };
  let remainingAmount = amount;

  while (remainingAmount > 0) {
    if (result.favorInCurrentTier >= remainingAmount) {
      result.favorInCurrentTier -= remainingAmount;
      remainingAmount = 0;
    } else if (result.currentTier > 0) {
      remainingAmount -= result.favorInCurrentTier;
      result.currentTier -= 1;
      const prevTierReq = getCurrentTierRequirement(tierStructure, result.currentTier);
      result.favorInCurrentTier = prevTierReq;
    } else {
      result.favorInCurrentTier = 0;
      break;
    }
  }

  return result;
}

/**
 * Add standing to a target (player or opponent)
 * Auto-advances tiers when requirements are met
 */
export function addStanding(
  state: GameState,
  target: 'player' | 'opponent',
  amount: number
): GameState {
  if (amount <= 0) return state;

  const tierStructure = state.judge.tierStructure;

  if (target === 'player') {
    const standing = advanceStanding(state.player.standing, amount, tierStructure);
    return { ...state, player: { ...state.player, standing } };
  } else {
    // Apply to all opponents (shared standing pool)
    const primary = state.opponents[0];
    if (!primary) return state;
    const standing = advanceStanding(primary.standing, amount, tierStructure);
    return {
      ...state,
      opponents: state.opponents.map((o, i) =>
        i === 0 ? { ...o, standing } : o
      ),
    };
  }
}

/**
 * Remove standing from a target
 * Can drop tiers if favor goes negative
 */
export function removeStanding(
  state: GameState,
  target: 'player' | 'opponent',
  amount: number
): GameState {
  if (amount <= 0) return state;

  const tierStructure = state.judge.tierStructure;

  if (target === 'player') {
    const standing = reduceStanding(state.player.standing, amount, tierStructure);
    return { ...state, player: { ...state.player, standing } };
  } else {
    const primary = state.opponents[0];
    if (!primary) return state;
    const standing = reduceStanding(primary.standing, amount, tierStructure);
    return {
      ...state,
      opponents: state.opponents.map((o, i) =>
        i === 0 ? { ...o, standing } : o
      ),
    };
  }
}

/**
 * Get the final combat result based on both standings
 */
export function getCombatResult(state: GameState): CombatResult {
  const maxTier = getMaxTier(state.judge.tierStructure);
  const maxOpponentTier = state.opponents.length > 0
    ? Math.max(...state.opponents.map(o => o.standing.currentTier))
    : 0;

  return {
    playerTier: state.player.standing.currentTier,
    opponentTier: maxOpponentTier,
    maxTier,
  };
}

/**
 * Helper to apply standing gain modifier from judge effects
 */
export function applyStandingGainModifier(amount: number, modifier: number): number {
  return Math.floor(amount * modifier);
}
