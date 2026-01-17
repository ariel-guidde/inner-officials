import { useCallback, useMemo } from 'react';
import { GameState, Card, Intention, StateHistoryEntry } from '../types/game';
import { DEBATE_DECK } from '../data/cards';
import { OPPONENTS } from '../data/opponents';
import { processTurn, resolveAIAction } from '../lib/engine';
import { useDeck } from './useDeck';
import { useGameState } from './useGameState';
import { useTurnFlow } from './useTurnFlow';

const INITIAL_HAND_SIZE = 5;

function createInitialState(): GameState {
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
    turnNumber: 1,
    turnPhase: 'player_action',
  };
}

export interface DebugInterface {
  getHistory: () => StateHistoryEntry[];
  getCurrentTurn: () => number;
  getCurrentPhase: () => string;
  getDeckInfo: () => { deck: number; hand: number; discard: number };
}

export function useGameLogic() {
  const deck = useDeck();
  const turnFlow = useTurnFlow();
  const { state, updateState, getHistory } = useGameState(createInitialState());

  const playCard = useCallback(
    (card: Card) => {
      updateState((prevState) => {
        if (prevState.isGameOver) return prevState;
        if (prevState.patience < 0) return prevState;

        // Set phase to resolving
        let nextState = turnFlow.setPhase(prevState, 'resolving');

        // Process the Player's Move (costs and effects)
        nextState = processTurn(nextState, card, deck.drawCards);

        // Remove played card from hand
        nextState = deck.removeFromHand(nextState, card.id);

        // Return to player_action phase
        nextState = turnFlow.setPhase(nextState, 'player_action');

        return nextState;
      }, `Play Card: ${card.name}`);
    },
    [updateState, deck, turnFlow]
  );

  const endTurn = useCallback(() => {
    updateState((prevState) => {
      if (prevState.isGameOver) return prevState;

      // 1. Set phase to opponent turn
      let nextState = turnFlow.setPhase(prevState, 'opponent_turn');

      // 2. Move all cards from hand to discard
      nextState = deck.discardHand(nextState);

      // 3. Resolve AI's Turn
      nextState = resolveAIAction(nextState);

      // 4. Update next AI Intention (Randomly pick from opponent pool)
      if (!nextState.isGameOver && nextState.opponent.isShocked === 0) {
        const template = OPPONENTS.find((o) => o.name === nextState.opponent.name);
        if (template) {
          const nextIntention: Intention =
            template.intentions[Math.floor(Math.random() * template.intentions.length)];
          nextState = {
            ...nextState,
            opponent: {
              ...nextState.opponent,
              currentIntention: nextIntention,
            },
          };
        }
      }

      // 5. Set phase to drawing
      nextState = turnFlow.setPhase(nextState, 'drawing');

      // 6. Draw new hand
      nextState = deck.drawCards(
        { ...nextState, player: { ...nextState.player, hand: [] } },
        INITIAL_HAND_SIZE
      );

      // 7. Increment turn and return to player_action
      nextState = turnFlow.incrementTurn(nextState);
      nextState = turnFlow.setPhase(nextState, 'player_action');

      return nextState;
    }, 'End Turn');
  }, [updateState, deck, turnFlow]);

  const debug: DebugInterface = useMemo(
    () => ({
      getHistory,
      getCurrentTurn: () => turnFlow.getCurrentTurn(state),
      getCurrentPhase: () => turnFlow.getCurrentPhase(state),
      getDeckInfo: () => ({
        deck: state.player.deck.length,
        hand: state.player.hand.length,
        discard: state.player.discard.length,
      }),
    }),
    [getHistory, turnFlow, state]
  );

  return { state, playCard, endTurn, debug };
}
