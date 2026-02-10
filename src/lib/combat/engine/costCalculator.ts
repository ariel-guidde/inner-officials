import { GameState, Card, MODIFIER_STAT } from '../../../types/game';
import { DEFAULT_JUDGE_EFFECTS } from '../constants';
import { checkBalanced, checkChaos, checkDissonant } from '../modules/harmony';
import { getModifierAdditive } from '../modules/statuses';

export interface EffectiveCosts {
  effectivePatienceCost: number;
  effectiveFaceCost: number;
  isReduced: boolean;
  isIncreased: boolean;
  modifier: string;
  originalPatienceCost: number;
  originalFaceCost: number;
}

export interface ChaosModifiers {
  patienceIncrease: number;
  faceIncrease: number;
  doublesEffect: boolean;
}

/**
 * Deduct face cost using poise (composure) first, then face
 */
export function deductFaceCost(state: GameState, cost: number): GameState {
  const poiseUsed = Math.min(state.player.poise, cost);
  const faceCost = cost - poiseUsed;
  return {
    ...state,
    player: {
      ...state.player,
      poise: state.player.poise - poiseUsed,
      face: state.player.face - faceCost,
    },
  };
}

/**
 * 4-tier harmony cost model:
 * - Balanced (+1 in cycle): -1 patience
 * - Neutral (same element or first card): no change
 * - Dissonant (+3 or +4 in cycle): +1 patience, +1 face
 * - Chaos (+2 in cycle): +2 patience, +2 face, effect fires twice
 */
export function calculateEffectiveCosts(card: Card, state: GameState): EffectiveCosts {
  const judgeEffects = state.judge?.effects ?? DEFAULT_JUDGE_EFFECTS;
  const elementModifier = judgeEffects.elementCostModifier[card.element] ?? 0;

  const originalPatienceCost = card.patienceCost;
  const originalFaceCost = card.faceCost;

  // Apply status-based cost reductions (from core arguments, etc.)
  const elementCostReduction = getModifierAdditive(state, MODIFIER_STAT.ELEMENT_COST, 'player', card.element);
  const patienceCostReduction = getModifierAdditive(state, MODIFIER_STAT.PATIENCE_COST, 'player');

  let effectivePatienceCost = card.patienceCost + elementModifier + elementCostReduction + patienceCostReduction;
  let effectiveFaceCost = card.faceCost;
  let isReduced = false;
  let isIncreased = false;
  let modifier = '';

  // Track if status modifiers reduced the cost
  if (elementCostReduction < 0 || patienceCostReduction < 0) {
    isReduced = true;
  }

  const isBalanced = checkBalanced(state.lastElement, card.element);
  const isChaos = checkChaos(state.lastElement, card.element);
  const isDissonant = checkDissonant(state.lastElement, card.element);

  if (isBalanced) {
    // Balanced: -1 patience (always, not just in harmony)
    effectivePatienceCost = Math.max(0, effectivePatienceCost - 1);
    isReduced = true;
    modifier = 'Balanced';
  } else if (isDissonant) {
    // Dissonant: +1 patience, +1 face
    effectivePatienceCost += 1;
    effectiveFaceCost += 1;
    isIncreased = true;
    modifier = 'Dissonant';
  } else if (isChaos) {
    // Chaos: +2 patience, +2 face, but effect doubles
    effectivePatienceCost += 2;
    effectiveFaceCost += 2;
    isIncreased = true;
    modifier = 'Chaos';
  }
  // Neutral: no change

  // Check for judge tax
  if (elementModifier > 0) {
    isIncreased = true;
    modifier = modifier ? `${modifier} + Tax` : 'Tax';
  } else if (elementModifier < 0) {
    isReduced = true;
    modifier = modifier ? `${modifier} + Discount` : 'Discount';
  }

  return {
    effectivePatienceCost,
    effectiveFaceCost,
    isReduced,
    isIncreased,
    modifier,
    originalPatienceCost,
    originalFaceCost,
  };
}

/**
 * Calculate chaos modifiers for a card play
 */
export function calculateChaosModifiers(card: Card, state: GameState): ChaosModifiers | null {
  const isChaos = checkChaos(state.lastElement, card.element);
  if (!isChaos) return null;

  return {
    patienceIncrease: 2,
    faceIncrease: 2,
    doublesEffect: true,
  };
}
