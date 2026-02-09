import { useState, useEffect, useCallback, useRef } from 'react';
import { GameEvent, GameState } from '../types/game';

// Event display duration in milliseconds
const EVENT_DISPLAY_DURATION = 2100; // 0.3s fade in + 1.5s display + 0.3s fade out
const EVENT_GAP_DURATION = 200; // Gap between events

export interface EventQueueState {
  currentEvent: GameEvent | null;
  isBlocking: boolean;
  queueLength: number;
}

export interface EventQueueActions {
  processEvents: (state: GameState) => GameState;
}

export function useEventQueue(): EventQueueState & EventQueueActions {
  const [eventQueue, setEventQueue] = useState<GameEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isShowingRef = useRef(false);

  // Process events from state and clear them from state
  const processEvents = useCallback((state: GameState): GameState => {
    if (state.pendingEvents.length === 0) {
      return state;
    }

    // Add events to queue
    setEventQueue(prev => [...prev, ...state.pendingEvents]);

    // Return state with cleared pending events
    return {
      ...state,
      pendingEvents: [],
    };
  }, []);

  // Display next event from queue
  const showNextEvent = useCallback(() => {
    if (isShowingRef.current) return;

    setEventQueue(prev => {
      if (prev.length === 0) {
        setCurrentEvent(null);
        setIsBlocking(false);
        isShowingRef.current = false;
        return prev;
      }

      const [next, ...rest] = prev;
      isShowingRef.current = true;
      setCurrentEvent(next);
      setIsBlocking(true);

      // Set timer to auto-dismiss
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setCurrentEvent(null);
        isShowingRef.current = false;
        // Small delay before showing next event
        timerRef.current = setTimeout(() => {
          // The rest of the queue is already set - useEffect will trigger showNextEvent
        }, EVENT_GAP_DURATION);
      }, EVENT_DISPLAY_DURATION);

      return rest;
    });
  }, []);

  // Start showing events when queue gets new items and nothing is currently showing
  useEffect(() => {
    if (eventQueue.length > 0 && !currentEvent && !isShowingRef.current) {
      showNextEvent();
    }
    if (eventQueue.length === 0 && !currentEvent) {
      setIsBlocking(false);
    }
  }, [eventQueue.length, currentEvent, showNextEvent]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    currentEvent,
    isBlocking,
    queueLength: eventQueue.length,
    processEvents,
  };
}
