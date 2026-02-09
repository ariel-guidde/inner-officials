import { GameState, Element, ELEMENT } from '../../../types/game';

export const ELEMENT_CYCLE: Element[] = [ELEMENT.WOOD, ELEMENT.FIRE, ELEMENT.EARTH, ELEMENT.METAL, ELEMENT.WATER];

export type FlowType = 'balanced' | 'dissonant' | 'chaos' | 'neutral';

export interface FlowResult {
  flowType: FlowType;
  isBalanced: boolean;
  isChaos: boolean;
  isDissonant: boolean;
  newHarmonyStreak: number;
  isInHarmony: boolean;
}

/**
 * Get the step distance in the wuxing cycle from `last` to `current`.
 * Returns 0 for same element, 1 for next (balanced), 2 for chaos, 3-4 for dissonant.
 */
export function getElementStep(last: Element, current: Element): number {
  const lastIdx = ELEMENT_CYCLE.indexOf(last);
  const curIdx = ELEMENT_CYCLE.indexOf(current);
  return (curIdx - lastIdx + 5) % 5;
}

/** Next in wuxing cycle (+1) */
export function checkBalanced(last: Element | null, current: Element): boolean {
  if (!last) return false;
  return getElementStep(last, current) === 1;
}

/** Skip one element (+2) = chaos */
export function checkChaos(last: Element | null, current: Element): boolean {
  if (!last) return false;
  return getElementStep(last, current) === 2;
}

/** +3 or +4 in cycle = dissonant */
export function checkDissonant(last: Element | null, current: Element): boolean {
  if (!last) return false;
  const step = getElementStep(last, current);
  return step === 3 || step === 4;
}

export function calculateFlowType(
  state: GameState,
  cardElement: Element,
  harmonyThreshold: number
): FlowResult {
  const isBalanced = checkBalanced(state.lastElement, cardElement);
  const isChaos = checkChaos(state.lastElement, cardElement);
  const isDissonant = checkDissonant(state.lastElement, cardElement);

  let flowType: FlowType;
  if (isBalanced) {
    flowType = 'balanced';
  } else if (isChaos) {
    flowType = 'chaos';
  } else if (isDissonant) {
    flowType = 'dissonant';
  } else {
    flowType = 'neutral'; // Same element or first card
  }

  let newHarmonyStreak = state.harmonyStreak ?? 0;
  if (isBalanced) {
    newHarmonyStreak = Math.min(harmonyThreshold, newHarmonyStreak + 1);
  } else if (isChaos) {
    newHarmonyStreak = 0;
  } else {
    newHarmonyStreak = Math.max(0, newHarmonyStreak - 1);
  }
  const isInHarmony = newHarmonyStreak >= harmonyThreshold;

  return {
    flowType,
    isBalanced,
    isChaos,
    isDissonant,
    newHarmonyStreak,
    isInHarmony,
  };
}
