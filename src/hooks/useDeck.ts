import { useCallback } from 'react';
import { Card, GameState } from '../types/game';
import { generateBadCard, shouldGenerateBadCard } from '../data/badCards';

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
      // Check if we should generate a bad card based on face percentage
      if (shouldGenerateBadCard(state.player.face, state.player.maxFace)) {
        const badCard = generateBadCard();
        drawnCards.push(badCard);
        continue; // Skip drawing from deck, we generated a bad card
      }

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
    // Bad cards can be discarded normally - they clutter because they keep coming back
    // They are only removed from game when PLAYED
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
    const card = state.player.hand.find(c => c.id === cardId);
    const newHand = state.player.hand.filter((c) => c.id !== cardId);

    // If it's a bad card or fire card that removes after play, remove from game entirely
    if (card?.isBad || card?.removeAfterPlay) {
      return {
        ...state,
        player: {
          ...state.player,
          hand: newHand,
          removedFromGame: [...state.player.removedFromGame, card],
        },
      };
    }

    // Normal cards go to discard
    return {
      ...state,
      player: {
        ...state.player,
        hand: newHand,
        discard: [...state.player.discard, ...(card ? [card] : [])],
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
