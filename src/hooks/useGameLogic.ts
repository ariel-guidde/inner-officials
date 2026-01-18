import { useCallback, useMemo } from 'react';
import { GameState, Card, StateHistoryEntry, Intention } from '../types/game';
import { DEBATE_DECK } from '../data/cards';
import { OPPONENTS, JUDGE_ACTIONS } from '../data/opponents';
import { processTurn, processEndTurn, DEFAULT_JUDGE_EFFECTS } from '../lib/engine';
import { useDeck } from './useDeck';
import { useGameState } from './useGameState';
import { useTurnFlow } from './useTurnFlow';

const INITIAL_HAND_SIZE = 5;
const MAX_DECK_SIZE = 20;
const DEFAULT_MAX_FACE = 60;

function pickRandomIntention(intentions: Intention[]): Intention {
  const index = Math.floor(Math.random() * intentions.length);
  return { ...intentions[index] };
}

export interface BattleConfig {
  playerStartingFace?: number;
  opponentIndex?: number;
}

function createInitialState(config: BattleConfig = {}): GameState {
  const { playerStartingFace = DEFAULT_MAX_FACE, opponentIndex = 0 } = config;

  // Limit deck to MAX_DECK_SIZE cards
  const limitedDeck = [...DEBATE_DECK].slice(0, MAX_DECK_SIZE);
  const shuffledDeck = limitedDeck.sort(() => Math.random() - 0.5);

  // Select opponent based on index (cycle through available opponents)
  const opponentTemplate = OPPONENTS[opponentIndex % OPPONENTS.length];

  const initialDeck = shuffledDeck.slice(INITIAL_HAND_SIZE);
  const initialHand = shuffledDeck.slice(0, INITIAL_HAND_SIZE);

  // Pick initial intentions
  const currentIntention = pickRandomIntention(opponentTemplate.intentions);
  const nextIntention = pickRandomIntention(opponentTemplate.intentions);

  // Pick initial judge action
  const initialJudgeAction = JUDGE_ACTIONS[Math.floor(Math.random() * JUDGE_ACTIONS.length)];

  return {
    player: {
      face: playerStartingFace,
      maxFace: DEFAULT_MAX_FACE,
      favor: 0,
      poise: 0,
      hand: initialHand,
      deck: initialDeck,
      discard: [],
      removedFromGame: [],
      canSeeNextIntention: false,
    },
    opponent: {
      name: opponentTemplate.name,
      face: opponentTemplate.maxFace,
      maxFace: opponentTemplate.maxFace,
      favor: 0,
      patienceSpent: 0,
      currentIntention: currentIntention,
      nextIntention: nextIntention,
    },
    judge: {
      effects: { ...DEFAULT_JUDGE_EFFECTS },
      nextEffect: initialJudgeAction.name,
      patienceThreshold: initialJudgeAction.patienceThreshold,
      patienceSpent: 0,
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

export function useGameLogic(config: BattleConfig = {}) {
  const deck = useDeck();
  const turnFlow = useTurnFlow();
  const { state, updateState, getHistory, resetState } = useGameState(() => createInitialState(config));

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

      // 3. Process end of turn (patience cost, cooldowns, actions)
      nextState = processEndTurn(nextState);

      // 4. Check if game ended
      if (nextState.isGameOver) {
        return nextState;
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

  const startNewBattle = useCallback((newConfig: BattleConfig) => {
    resetState(createInitialState(newConfig));
  }, [resetState]);

  const getBattleResult = useCallback(() => {
    if (!state.isGameOver) return null;
    return {
      won: state.winner === 'player',
      finalFace: state.player.face,
      opponentName: state.opponent.name,
      favorGained: state.player.favor,
    };
  }, [state.isGameOver, state.winner, state.player.face, state.opponent.name, state.player.favor]);

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

  return { state, playCard, endTurn, startNewBattle, getBattleResult, debug };
}
