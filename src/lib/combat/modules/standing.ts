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
  const maxTier = getMaxTier(tierStructure);

  let standing = target === 'player' ? { ...state.player.standing } : { ...state.opponent.standing };
  let remainingAmount = amount;

  while (remainingAmount > 0) {
    // If already at max tier, just accumulate (no more advancement)
    if (standing.currentTier >= maxTier) {
      standing.favorInCurrentTier += remainingAmount;
      break;
    }

    const currentTierReq = getCurrentTierRequirement(tierStructure, standing.currentTier);
    const neededForAdvance = currentTierReq - standing.favorInCurrentTier;

    if (remainingAmount >= neededForAdvance) {
      // Advance to next tier
      standing.currentTier += 1;
      standing.favorInCurrentTier = 0;
      remainingAmount -= neededForAdvance;
    } else {
      // Add to current tier
      standing.favorInCurrentTier += remainingAmount;
      remainingAmount = 0;
    }
  }

  if (target === 'player') {
    return {
      ...state,
      player: { ...state.player, standing },
    };
  } else {
    return {
      ...state,
      opponent: { ...state.opponent, standing },
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
  let standing = target === 'player' ? { ...state.player.standing } : { ...state.opponent.standing };
  let remainingAmount = amount;

  while (remainingAmount > 0) {
    if (standing.favorInCurrentTier >= remainingAmount) {
      // Can remove from current tier
      standing.favorInCurrentTier -= remainingAmount;
      remainingAmount = 0;
    } else if (standing.currentTier > 0) {
      // Need to drop a tier
      remainingAmount -= standing.favorInCurrentTier;
      standing.currentTier -= 1;
      const prevTierReq = getCurrentTierRequirement(tierStructure, standing.currentTier);
      standing.favorInCurrentTier = prevTierReq; // Start at top of previous tier
    } else {
      // At tier 0 with 0 favor, can't go lower
      standing.favorInCurrentTier = 0;
      break;
    }
  }

  if (target === 'player') {
    return {
      ...state,
      player: { ...state.player, standing },
    };
  } else {
    return {
      ...state,
      opponent: { ...state.opponent, standing },
    };
  }
}

/**
 * Get the final combat result based on both standings
 */
export function getCombatResult(state: GameState): CombatResult {
  const maxTier = getMaxTier(state.judge.tierStructure);

  return {
    playerTier: state.player.standing.currentTier,
    opponentTier: state.opponent.standing.currentTier,
    maxTier,
  };
}

/**
 * Helper to apply standing gain modifier from judge effects
 */
export function applyStandingGainModifier(amount: number, modifier: number): number {
  return Math.floor(amount * modifier);
}
