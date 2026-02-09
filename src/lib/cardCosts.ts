import { Card, GameState, MODIFIER_STAT } from '../types/game';
import { DEFAULT_JUDGE_EFFECTS } from './combat/constants';
import { checkBalanced, checkChaos, checkDissonant } from './combat/modules/harmony';
import { getModifierAdditive } from './combat/modules/statuses';

export interface EffectiveCosts {
  effectivePatienceCost: number;
  effectiveFaceCost: number;
  isReduced: boolean;
  isIncreased: boolean;
  modifier: string; // Description of what caused the change
  originalPatienceCost: number;
  originalFaceCost: number;
}

export interface ChaosModifiers {
  patienceIncrease: number;
  faceIncrease: number;
  doublesEffect: boolean;
}

/**
 * Calculate effective costs for a card based on current game state (UI preview)
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
    effectivePatienceCost = Math.max(0, effectivePatienceCost - 1);
    isReduced = true;
    modifier = 'Balanced';
  } else if (isDissonant) {
    effectivePatienceCost += 1;
    effectiveFaceCost += 1;
    isIncreased = true;
    modifier = 'Dissonant';
  } else if (isChaos) {
    effectivePatienceCost += 2;
    effectiveFaceCost += 2;
    isIncreased = true;
    modifier = 'Chaos';
  }

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
 * Calculate chaos bonus modifiers
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
