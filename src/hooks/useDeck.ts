import { useCallback } from 'react';
import { Card, GameState } from '../types/game';
import * as deckService from '../lib/combat/services/deckService';

export interface DeckOperations {
  drawCards: (state: GameState, count: number) => GameState;
  discardHand: (state: GameState) => GameState;
  removeFromHand: (state: GameState, cardId: string) => GameState;
  removeFromPlay: (state: GameState, cardId: string) => GameState;
  discardCard: (state: GameState, cardId: string) => GameState; // Explicit discard to discard pile
  burnCard: (state: GameState, cardId: string) => GameState; // Burn = remove from play
  burnRandomCard: (state: GameState, filter?: (card: Card) => boolean) => GameState; // Random burn
  shuffleDeck: (deck: Card[]) => Card[];
}

export function useDeck(): DeckOperations {
  const shuffleDeck = useCallback((deck: Card[]): Card[] => {
    return deckService.shuffleDeck(deck);
  }, []);

  const drawCards = useCallback((state: GameState, count: number): GameState => {
    return deckService.drawCards(state, count);
  }, []);

  const discardHand = useCallback((state: GameState): GameState => {
    return deckService.discardHand(state);
  }, []);

  const removeFromHand = useCallback((state: GameState, cardId: string): GameState => {
    return deckService.removeFromHand(state, cardId);
  }, []);

  const removeFromPlay = useCallback((state: GameState, cardId: string): GameState => {
    return deckService.removeFromPlay(state, cardId);
  }, []);

  const discardCard = useCallback((state: GameState, cardId: string): GameState => {
    return deckService.discardCard(state, cardId);
  }, []);

  const burnCard = useCallback((state: GameState, cardId: string): GameState => {
    return deckService.burnCard(state, cardId);
  }, []);

  const burnRandomCard = useCallback((state: GameState, filter?: (card: Card) => boolean): GameState => {
    return deckService.burnRandomCard(state, filter);
  }, []);

  return {
    drawCards,
    discardHand,
    removeFromHand,
    removeFromPlay,
    discardCard,
    burnCard,
    burnRandomCard,
    shuffleDeck,
  };
}
