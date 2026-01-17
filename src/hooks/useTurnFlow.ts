import { useCallback } from 'react';
import { GameState, TurnPhase } from '../types/game';

export interface TurnFlowManager {
  setPhase: (state: GameState, phase: TurnPhase) => GameState;
  incrementTurn: (state: GameState) => GameState;
  getCurrentPhase: (state: GameState) => TurnPhase;
  getCurrentTurn: (state: GameState) => number;
}

export function useTurnFlow(): TurnFlowManager {
  const setPhase = useCallback((state: GameState, phase: TurnPhase): GameState => {
    return {
      ...state,
      turnPhase: phase,
    };
  }, []);

  const incrementTurn = useCallback((state: GameState): GameState => {
    return {
      ...state,
      turnNumber: (state.turnNumber ?? 1) + 1,
    };
  }, []);

  const getCurrentPhase = useCallback((state: GameState): TurnPhase => {
    return state.turnPhase ?? 'player_action';
  }, []);

  const getCurrentTurn = useCallback((state: GameState): number => {
    return state.turnNumber ?? 1;
  }, []);

  return {
    setPhase,
    incrementTurn,
    getCurrentPhase,
    getCurrentTurn,
  };
}
