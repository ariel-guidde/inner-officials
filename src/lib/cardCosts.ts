import { Card, GameState, Element, ELEMENT } from '../types/game';
import { DEFAULT_JUDGE_EFFECTS } from './engine';

const HARMONY_THRESHOLD = 5;

// Check if card follows harmony cycle
const checkBalanced = (last: Element | null, current: Element): boolean => {
  const cycle: Element[] = [ELEMENT.WOOD, ELEMENT.FIRE, ELEMENT.EARTH, ELEMENT.METAL, ELEMENT.WATER];
  if (!last) return false; // First move is NOT in harmony
  return cycle[(cycle.indexOf(last) + 1) % 5] === current;
};

// Check if card is chaos (skips one element)
const checkChaos = (last: Element | null, current: Element): boolean => {
  const cycle: Element[] = [ELEMENT.WOOD, ELEMENT.FIRE, ELEMENT.EARTH, ELEMENT.METAL, ELEMENT.WATER];
  if (!last) return false;
  return cycle[(cycle.indexOf(last) + 2) % 5] === current;
};

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
  favorGain: number;
  damage: number;
  patienceIncrease: number;
  faceIncrease: number;
}

/**
 * Calculate effective costs for a card based on current game state
 */
export function calculateEffectiveCosts(card: Card, state: GameState): EffectiveCosts {
  const judgeEffects = state.judge?.effects ?? DEFAULT_JUDGE_EFFECTS;
  const elementModifier = judgeEffects.elementCostModifier[card.element] ?? 0;
  
  const originalPatienceCost = card.patienceCost;
  const originalFaceCost = card.faceCost;
  
  let effectivePatienceCost = card.patienceCost + elementModifier;
  let effectiveFaceCost = card.faceCost;
  let isReduced = false;
  let isIncreased = false;
  let modifier = '';

  // Check harmony/chaos
  const isBalanced = checkBalanced(state.lastElement, card.element);
  const isChaos = checkChaos(state.lastElement, card.element);
  const isInHarmony = (state.harmonyStreak ?? 0) >= HARMONY_THRESHOLD;

  if (isBalanced && isInHarmony) {
    effectivePatienceCost = Math.max(0, effectivePatienceCost - 1);
    isReduced = true;
    modifier = 'Harmony';
  } else if (isChaos) {
    effectivePatienceCost = effectivePatienceCost + 2;
    effectiveFaceCost = effectiveFaceCost + 5;
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

  const judgeEffects = state.judge?.effects ?? DEFAULT_JUDGE_EFFECTS;
  const favorGain = Math.floor(10 * judgeEffects.favorGainModifier);
  const damage = Math.floor(8 * judgeEffects.damageModifier);

  return {
    favorGain,
    damage,
    patienceIncrease: 2,
    faceIncrease: 5,
  };
}
