import { useState, useCallback, useRef } from 'react';
import { GameState, StateHistoryEntry } from '../types/game';

export interface GameStateManager {
  state: GameState;
  updateState: (fn: (state: GameState) => GameState, actionLabel: string) => void;
  setState: (state: GameState) => void;
  getHistory: () => StateHistoryEntry[];
  clearHistory: () => void;
  resetState: (newInitialState?: GameState) => void;
}

const MAX_HISTORY_SIZE = 100;

export function useGameState(initialStateOrFactory: GameState | (() => GameState)): GameStateManager {
  const getInitialState = useCallback(() => {
    return typeof initialStateOrFactory === 'function'
      ? initialStateOrFactory()
      : initialStateOrFactory;
  }, [initialStateOrFactory]);

  const [state, setStateInternal] = useState<GameState>(getInitialState);
  const historyRef = useRef<StateHistoryEntry[]>([
    {
      label: 'Initial State',
      state: getInitialState(),
      timestamp: Date.now(),
    },
  ]);

  const updateState = useCallback((fn: (state: GameState) => GameState, actionLabel: string) => {
    setStateInternal((prevState) => {
      const nextState = fn(prevState);

      // Add to history
      historyRef.current.push({
        label: actionLabel,
        state: nextState,
        timestamp: Date.now(),
      });

      // Trim history if too long
      if (historyRef.current.length > MAX_HISTORY_SIZE) {
        historyRef.current = historyRef.current.slice(-MAX_HISTORY_SIZE);
      }

      return nextState;
    });
  }, []);

  const setState = useCallback((newState: GameState) => {
    setStateInternal(newState);
  }, []);

  const getHistory = useCallback(() => {
    return [...historyRef.current];
  }, []);

  const clearHistory = useCallback(() => {
    historyRef.current = [
      {
        label: 'History Cleared',
        state,
        timestamp: Date.now(),
      },
    ];
  }, [state]);

  const resetState = useCallback((newInitialState?: GameState) => {
    const newState = newInitialState ?? getInitialState();
    setStateInternal(newState);
    historyRef.current = [
      {
        label: 'Battle Reset',
        state: newState,
        timestamp: Date.now(),
      },
    ];
  }, [getInitialState]);

  return {
    state,
    updateState,
    setState,
    getHistory,
    clearHistory,
    resetState,
  };
}
