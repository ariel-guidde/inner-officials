import { GameState, Element, ELEMENT } from '../../../types/game';

export const ELEMENT_CYCLE: Element[] = [ELEMENT.WOOD, ELEMENT.FIRE, ELEMENT.EARTH, ELEMENT.METAL, ELEMENT.WATER];

export type FlowType = 'balanced' | 'chaos' | 'neutral';

export interface FlowResult {
  flowType: FlowType;
  isBalanced: boolean;
  isChaos: boolean;
  newHarmonyStreak: number;
  isInHarmony: boolean;
}

export function checkBalanced(last: Element | null, current: Element): boolean {
  if (!last) return true;
  return ELEMENT_CYCLE[(ELEMENT_CYCLE.indexOf(last) + 1) % 5] === current;
}

export function checkChaos(last: Element | null, current: Element): boolean {
  if (!last) return false;
  return ELEMENT_CYCLE[(ELEMENT_CYCLE.indexOf(last) + 2) % 5] === current;
}

export function calculateFlowType(
  state: GameState,
  cardElement: Element,
  harmonyThreshold: number
): FlowResult {
  const isBalanced = checkBalanced(state.lastElement, cardElement);
  const isChaos = checkChaos(state.lastElement, cardElement);
  const flowType: FlowType = isBalanced ? 'balanced' : isChaos ? 'chaos' : 'neutral';

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
    newHarmonyStreak,
    isInHarmony,
  };
}
