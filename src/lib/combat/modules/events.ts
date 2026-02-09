import { GameState, GameEvent } from '../../../types/game';

export function emitGameEvent(state: GameState, event: Omit<GameEvent, 'id'>): GameState {
  const newEvent: GameEvent = {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  return {
    ...state,
    pendingEvents: [...state.pendingEvents, newEvent],
  };
}
