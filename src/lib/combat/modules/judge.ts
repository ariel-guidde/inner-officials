import { GameState, GAME_EVENT_TYPE } from '../../../types/game';
import { JudgeAction } from '../../../data/judges';
import { combatLogger } from '../../debug/combatLogger';
import { emitGameEvent } from './events';

export function pickRandomJudgeAction(judgeActions: JudgeAction[]): JudgeAction {
  const index = Math.floor(Math.random() * judgeActions.length);
  return judgeActions[index];
}

export function applyJudgeAction(state: GameState, judgeAction: JudgeAction, judgeActions: JudgeAction[]): GameState {
  const newEffects = judgeAction.apply(state.judge.effects);
  const newAction = pickRandomJudgeAction(judgeActions);
  combatLogger.log('judge', `${judgeAction.name}`, { description: judgeAction.description });

  const newDecree = {
    name: judgeAction.name,
    description: judgeAction.description,
    turnApplied: state.turnNumber || 1,
  };

  const nextState = {
    ...state,
    judge: {
      ...state.judge,
      effects: {
        ...newEffects,
        activeDecrees: [...(state.judge.effects.activeDecrees || []), newDecree],
      },
      nextEffect: newAction.name,
      patienceThreshold: newAction.patienceThreshold,
      patienceSpent: 0, // Reset tracking
    },
  };

  return emitGameEvent(nextState, {
    type: GAME_EVENT_TYPE.JUDGE_DECREE,
    name: judgeAction.name,
    description: judgeAction.description,
  });
}

export function checkJudgeTrigger(state: GameState, patienceSpent: number, judgeActions: JudgeAction[]): GameState {
  let nextState = { ...state };

  const newJudgePatienceSpent = (nextState.judge?.patienceSpent || 0) + patienceSpent;
  if (nextState.judge) {
    nextState.judge = { ...nextState.judge, patienceSpent: newJudgePatienceSpent };

    if (nextState.judge.nextEffect && newJudgePatienceSpent >= nextState.judge.patienceThreshold) {
      const judgeAction = judgeActions.find((a) => a.name === nextState.judge.nextEffect);
      if (judgeAction) {
        nextState = applyJudgeAction(nextState, judgeAction, judgeActions);
      }
    }
  }

  return nextState;
}
