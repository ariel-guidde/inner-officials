export { DEFAULT_JUDGE_EFFECTS, HARMONY_THRESHOLD } from './constants';
export { CombatEngine, processTurn, processEndTurn, processStartTurn } from './CombatEngine';
export { addBoardEffect, removeBoardEffect, checkTrapEffects } from './modules/boardEffects';
export { addIntentionModifier, applyIntentionModifiers } from './modules/intentionModifiers';
export { emitGameEvent, addRevealEffect, consumeRevealTrigger } from './modules/events';
export {
  deductFaceCost,
  calculateEffectiveCosts,
  calculateChaosModifiers,
  type EffectiveCosts,
  type ChaosModifiers,
} from './modules/costs';

export { checkBalanced, checkChaos, calculateFlowType, ELEMENT_CYCLE, type FlowType, type FlowResult } from './modules/harmony';
export { checkVictory } from './modules/victory';

export {
  executeOpponentAction,
  advanceOpponentIntention,
  applyFlusteredMechanic,
  pickRandomIntention,
  pickRandomFlustered,
} from './modules/opponent';

export { pickRandomJudgeAction, applyJudgeAction, checkJudgeTrigger } from './modules/judge';

export * from './effects';

export { isCardPlayable } from './playability';
