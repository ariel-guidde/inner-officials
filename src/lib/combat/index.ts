export { DEFAULT_JUDGE_EFFECTS, HARMONY_THRESHOLD } from './constants';
export { CombatEngine, processTurn, processEndTurn, processStartTurn } from './CombatEngine';
export { emitGameEvent } from './modules/events';
export {
  deductFaceCost,
  calculateEffectiveCosts,
  calculateChaosModifiers,
  type EffectiveCosts,
  type ChaosModifiers,
} from './modules/costs';

export { checkBalanced, checkChaos, checkDissonant, getElementStep, calculateFlowType, ELEMENT_CYCLE, type FlowType, type FlowResult } from './modules/harmony';
export { checkVictory, getDetailedCombatResult, calculateCombatRewards, type CombatReward } from './modules/victory';

export {
  executeOpponentAction,
  advanceOpponentIntention,
  applyFlusteredMechanic,
  pickRandomIntention,
  pickRandomFlustered,
  executeAllOpponentActions,
  getOpponent,
  updateOpponent,
  syncLegacyOpponent,
  syncFromLegacyOpponent,
} from './modules/opponent';

export { pickRandomJudgeAction, applyJudgeAction, checkJudgeTrigger } from './modules/judge';

// Standing/tier system
export {
  createInitialStanding,
  addStanding,
  removeStanding,
  getTierProgress,
  getCombatResult,
  getMaxTier,
  getTierDefinition,
  getCurrentTierRequirement,
  getTotalFavor,
  applyStandingGainModifier,
  type TierProgress,
} from './modules/standing';

export { isCardPlayable } from './playability';

// Unified status system
export {
  addStatus,
  removeStatus,
  removeStatusByTag,
  hasStatus,
  getStatuses,
  getStatusesByTrigger,
  processStatusTrigger,
  tickStatuses,
  getModifierTotal,
  getModifierMultiplier,
  getModifierAdditive,
  addRevealStatus,
  consumeOpponentRevealTrigger,
  isOpponentRevealed,
} from './modules/statuses';
