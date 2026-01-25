import { JudgeEffects } from '../../types/game';

export const HARMONY_THRESHOLD = 5;

export const DEFAULT_JUDGE_EFFECTS: JudgeEffects = {
  endTurnPatienceCost: 1,
  elementCostModifier: {},
  favorGainModifier: 1.0,
  damageModifier: 1.0,
  activeDecrees: [],
};
