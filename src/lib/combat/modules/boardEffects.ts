import { GameState, BoardEffect, Intention, BOARD_EFFECT_TYPE, INTENTION_TYPE } from '../../../types/game';
import { combatLogger } from '../../debug/combatLogger';

export function addBoardEffect(state: GameState, effect: Omit<BoardEffect, 'id'>): GameState {
  const newEffect: BoardEffect = {
    ...effect,
    id: `be_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  return {
    ...state,
    boardEffects: [...state.boardEffects, newEffect],
  };
}

export function removeBoardEffect(state: GameState, effectId: string): GameState {
  return {
    ...state,
    boardEffects: state.boardEffects.filter((e) => e.id !== effectId),
  };
}

export function checkTrapEffects(
  state: GameState,
  intention: Intention
): { state: GameState; intention: Intention | null } {
  let nextState = { ...state };
  let modifiedIntention: Intention | null = intention;

  const negateEffect = nextState.boardEffects.find(
    (e) => e.effectType === BOARD_EFFECT_TYPE.NEGATE_NEXT_ATTACK
  );
  if (negateEffect && intention.type === INTENTION_TYPE.ATTACK) {
    nextState = removeBoardEffect(nextState, negateEffect.id);
    combatLogger.log('system', `${negateEffect.name} negated the attack!`, { effect: negateEffect.name });
    modifiedIntention = null;
  }

  return { state: nextState, intention: modifiedIntention };
}
