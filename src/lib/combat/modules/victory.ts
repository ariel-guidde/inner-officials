import { GameState, COMBAT_LOG_ACTOR } from '../../../types/game';

export function checkVictory(state: GameState): GameState {
  if (state.player.face <= 0) {
    return { ...state, isGameOver: true, winner: COMBAT_LOG_ACTOR.OPPONENT };
  }
  if (state.player.favor >= 100) {
    return { ...state, isGameOver: true, winner: COMBAT_LOG_ACTOR.PLAYER };
  }
  if (state.opponent.favor >= 100) {
    return { ...state, isGameOver: true, winner: COMBAT_LOG_ACTOR.OPPONENT };
  }
  if (state.patience <= 0) {
    if (state.player.favor > state.opponent.favor) {
      return { ...state, isGameOver: true, winner: COMBAT_LOG_ACTOR.PLAYER };
    }
    return { ...state, isGameOver: true, winner: COMBAT_LOG_ACTOR.OPPONENT };
  }
  return state;
}
