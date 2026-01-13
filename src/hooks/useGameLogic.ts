import { useState, useCallback } from 'react';
import { GameState, Card, Intention } from '../types/game';
import { DEBATE_DECK } from '../data/cards';
import { OPPONENTS } from '../data/opponents';
import { processTurn, resolveAIAction } from '../lib/engine';

const INITIAL_HAND_SIZE = 5;

function drawHand(deck: Card[], discard: Card[], handSize: number): { newHand: Card[]; newDeck: Card[]; newDiscard: Card[] } {
  let currentDeck = [...deck];
  let currentDiscard = [...discard];
  const newHand: Card[] = [];

  while (newHand.length < handSize) {
    if (currentDeck.length === 0) {
      // Shuffle discard into deck if deck is empty
      if (currentDiscard.length === 0) break; // No cards left
      currentDeck = [...currentDiscard].sort(() => Math.random() - 0.5);
      currentDiscard = [];
    }
    const drawnCard = currentDeck.pop();
    if (drawnCard) {
      newHand.push(drawnCard);
    }
  }

  return {
    newHand,
    newDeck: currentDeck,
    newDiscard: currentDiscard,
  };
}

function drawCards(state: GameState, count: number): GameState {
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
}

export function useGameLogic() {
  // Initialize with a random opponent and a shuffled deck
  const [state, setState] = useState<GameState>(() => {
    const shuffledDeck = [...DEBATE_DECK].sort(() => Math.random() - 0.5);
    const opponentTemplate = OPPONENTS[0]; // Start with the Concubine

    const initialDeck = shuffledDeck.slice(INITIAL_HAND_SIZE);
    const initialHand = shuffledDeck.slice(0, INITIAL_HAND_SIZE);

    return {
      player: {
        face: 60,
        maxFace: 60,
        favor: 0,
        poise: 0,
        hand: initialHand,
        deck: initialDeck,
        discard: [],
      },
      opponent: {
        name: opponentTemplate.name,
        face: opponentTemplate.maxFace,
        maxFace: opponentTemplate.maxFace,
        favor: 0,
        isShocked: 0,
        currentIntention: opponentTemplate.intentions[0],
      },
      patience: 40,
      lastElement: null,
      history: [],
      isGameOver: false,
      winner: null,
    };
  });

  const playCard = useCallback((card: Card) => {
    setState((prevState) => {
      if (prevState.isGameOver) return prevState;
      if (prevState.patience < 0) return prevState; // Can't play if no patience

      // 1. Process the Player's Move (costs and effects)
      let nextState = processTurn(prevState, card, drawCards);

      // 2. Remove played card from hand (don't discard yet, that happens on end turn)
      const newHand = nextState.player.hand.filter((c) => c.id !== card.id);

      return {
        ...nextState,
        player: { ...nextState.player, hand: newHand },
      };
    });
  }, []);

  const endTurn = useCallback(() => {
    setState((prevState) => {
      if (prevState.isGameOver) return prevState;

      let nextState = { ...prevState };

      // 1. Move all cards from hand to discard
      nextState.player.discard.push(...nextState.player.hand);
      nextState.player.hand = [];

      // 2. Resolve AI's Turn
      nextState = resolveAIAction(nextState);

      // 3. Update next AI Intention (Randomly pick from opponent pool)
      if (!nextState.isGameOver && nextState.opponent.isShocked === 0) {
        const template = OPPONENTS.find(o => o.name === nextState.opponent.name);
        if (template) {
          const nextIntention: Intention = template.intentions[Math.floor(Math.random() * template.intentions.length)];
          nextState.opponent.currentIntention = nextIntention;
        }
      }

      // 4. Draw new hand
      const { newHand, newDeck, newDiscard } = drawHand(
        nextState.player.deck,
        nextState.player.discard,
        INITIAL_HAND_SIZE
      );

      return {
        ...nextState,
        player: {
          ...nextState.player,
          hand: newHand,
          deck: newDeck,
          discard: newDiscard,
        },
      };
    });
  }, []);

  return { state, playCard, endTurn };
}