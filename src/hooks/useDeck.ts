import { useCallback } from 'react';
import { Card, GameState } from '../types/game';

export interface DeckOperations {
  drawCards: (state: GameState, count: number) => GameState;
  discardHand: (state: GameState) => GameState;
  removeFromHand: (state: GameState, cardId: string) => GameState;
  shuffleDeck: (deck: Card[]) => Card[];
}

export function useDeck(): DeckOperations {
  const shuffleDeck = useCallback((deck: Card[]): Card[] => {
    return [...deck].sort(() => Math.random() - 0.5);
  }, []);

  const drawCards = useCallback((state: GameState, count: number): GameState => {
    let currentDeck = [...state.player.deck];
    let currentDiscard = [...state.player.discard];
    const drawnCards: Card[] = [];

    for (let i = 0; i < count; i++) {
      if (currentDeck.length === 0) {
        // Shuffle discard into deck if deck is empty
        if (currentDiscard.length === 0) break; // No cards left
        currentDeck = [...currentDiscard].sort(() => Math.random() - 0.5);
        currentDiscard = [];
      }
      const drawnCard = currentDeck.pop();
      if (drawnCard) {
        drawnCards.push(drawnCard);
      }
    }

    return {
      ...state,
      player: {
        ...state.player,
        hand: [...state.player.hand, ...drawnCards],
        deck: currentDeck,
        discard: currentDiscard,
      },
    };
  }, []);

  const discardHand = useCallback((state: GameState): GameState => {
    return {
      ...state,
      player: {
        ...state.player,
        discard: [...state.player.discard, ...state.player.hand],
        hand: [],
      },
    };
  }, []);

  const removeFromHand = useCallback((state: GameState, cardId: string): GameState => {
    return {
      ...state,
      player: {
        ...state.player,
        hand: state.player.hand.filter((c) => c.id !== cardId),
      },
    };
  }, []);

  return {
    drawCards,
    discardHand,
    removeFromHand,
    shuffleDeck,
  };
}
