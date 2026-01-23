import { useCallback, useMemo } from 'react';
import { GameState, Card, StateHistoryEntry, Intention, TargetedEffectContext, TURN_PHASE, COMBAT_LOG_ACTOR, CARD_DESTINATION } from '../types/game';
import { DEBATE_DECK } from '../data/cards';
import { OPPONENTS, JUDGE_ACTIONS } from '../data/opponents';
import { processTurn, processEndTurn, processStartTurn, DEFAULT_JUDGE_EFFECTS } from '../lib/engine';
import { useDeck } from './useDeck';
import { useGameState } from './useGameState';
import { useTurnFlow } from './useTurnFlow';
import { useTargeting } from './useTargeting';
import { useEventQueue } from './useEventQueue';
import { getCardById } from '../lib/saveService';

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
  deckCardIds?: string[]; // Card IDs from saved deck
}

function createInitialState(config: BattleConfig = {}): GameState {
  const { playerStartingFace = DEFAULT_MAX_FACE, opponentIndex = 0, deckCardIds } = config;

  // Build deck from saved card IDs or use default
  // Each card instance gets a unique ID to handle multiple copies
  let instanceCounter = 0;
  const createCardInstance = (card: Card): Card => {
    instanceCounter++;
    return {
      ...card,
      id: `${card.id}_${instanceCounter}_${Date.now()}`,
    };
  };

  let deckCards: Card[];
  if (deckCardIds && deckCardIds.length > 0) {
    // Map card IDs to actual Card objects with unique instance IDs
    deckCards = deckCardIds
      .map(id => {
        const card = getCardById(id);
        return card ? createCardInstance(card) : undefined;
      })
      .filter((card): card is Card => card !== undefined);
    
    // Fallback to default if mapping failed
    if (deckCards.length === 0) {
      deckCards = [...DEBATE_DECK].slice(0, MAX_DECK_SIZE).map(createCardInstance);
    }
  } else {
    // Default: use first MAX_DECK_SIZE cards with unique instance IDs
    deckCards = [...DEBATE_DECK].slice(0, MAX_DECK_SIZE).map(createCardInstance);
  }

  // Shuffle the deck
  const shuffledDeck = [...deckCards].sort(() => Math.random() - 0.5);

  // Select opponent based on index (cycle through available opponents)
  const opponentTemplate = OPPONENTS[opponentIndex % OPPONENTS.length];

  const initialDeck = shuffledDeck.slice(INITIAL_HAND_SIZE);
  const initialHand = shuffledDeck.slice(0, INITIAL_HAND_SIZE);

  // Pick initial intentions
  const currentIntention = pickRandomIntention(opponentTemplate.intentions);
  const nextIntention = pickRandomIntention(opponentTemplate.intentions);

  // Pick initial judge action and apply it immediately
  const initialJudgeAction = JUDGE_ACTIONS[Math.floor(Math.random() * JUDGE_ACTIONS.length)];
  const initialEffects = initialJudgeAction.apply(DEFAULT_JUDGE_EFFECTS);
  const initialDecree = {
    name: initialJudgeAction.name,
    description: initialJudgeAction.description,
    turnApplied: 0, // Applied at start
  };

  // Pick next judge action for after the initial one
  const nextJudgeAction = JUDGE_ACTIONS[Math.floor(Math.random() * JUDGE_ACTIONS.length)];

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
      effects: { ...initialEffects, activeDecrees: [initialDecree] },
      nextEffect: nextJudgeAction.name,
      patienceThreshold: nextJudgeAction.patienceThreshold,
      patienceSpent: 0,
    },
    patience: 40,
    lastElement: null,
    history: [],
    harmonyStreak: 0,
    isGameOver: false,
    winner: null,
    turnNumber: 1,
    turnPhase: TURN_PHASE.PLAYER_ACTION,
    // New systems
    activeEffects: [],
    boardEffects: [],
    intentionModifiers: [],
    pendingEvents: [],
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
  const targeting = useTargeting();
  const eventQueue = useEventQueue();
  const { state, updateState, getHistory, resetState } = useGameState(() => createInitialState(config));

  const executeCard = useCallback(
    (card: Card, targetContext?: TargetedEffectContext) => {
      updateState((prevState) => {
        if (prevState.isGameOver) return prevState;
        if (prevState.patience < 0) return prevState;

        let nextState = turnFlow.setPhase(prevState, TURN_PHASE.RESOLVING);

        // Handle random selection if needed (before main effect)
        if (card.targetRequirement?.selectionMode === 'random' && !targetContext) {
          const req = card.targetRequirement;
          // Get valid targets
          let candidates = nextState.player.hand.filter(c => c.id !== card.id);
          if (req.filter) {
            candidates = candidates.filter(c => req.filter!(c, nextState));
          }
          
          if (candidates.length > 0) {
            const randomIndex = Math.floor(Math.random() * candidates.length);
            const selectedCard = candidates[randomIndex];
            
            // Apply destination (burn or discard)
            if (req.destination === CARD_DESTINATION.BURN) {
              nextState = deck.burnCard(nextState, selectedCard.id);
            } else if (req.destination === CARD_DESTINATION.DISCARD) {
              nextState = deck.discardCard(nextState, selectedCard.id);
            }
            
            // Create target context for the effect
            targetContext = { selectedCards: [selectedCard] };
          }
        }

        // Handle targeted effects with selected cards
        if (card.targetRequirement && targetContext?.selectedCards) {
          const req = card.targetRequirement;
          
          // Apply destination for selected cards (burn or discard)
          if (req.destination === CARD_DESTINATION.BURN) {
            targetContext.selectedCards.forEach(targetCard => {
              nextState = deck.burnCard(nextState, targetCard.id);
            });
          } else if (req.destination === CARD_DESTINATION.DISCARD) {
            targetContext.selectedCards.forEach(targetCard => {
              nextState = deck.discardCard(nextState, targetCard.id);
            });
          }
        }

        nextState = processTurn(nextState, card, deck.drawCards);

        if (card.targetedEffect && targetContext) {
          nextState = card.targetedEffect(nextState, targetContext, deck.drawCards);
        }

        // Remove played card from hand
        nextState = deck.removeFromHand(nextState, card.id);

        // Process any pending events
        nextState = eventQueue.processEvents(nextState);

        // Return to player_action phase
        nextState = turnFlow.setPhase(nextState, TURN_PHASE.PLAYER_ACTION);

        return nextState;
      }, `Play Card: ${card.name}`);
    },
    [updateState, deck, turnFlow, eventQueue]
  );

  const playCard = useCallback(
    (card: Card) => {
      // Check if card requires targeting (only for 'choose' mode, not 'random')
      if (
        card.targetRequirement && 
        card.targetRequirement.type !== 'none' &&
        card.targetRequirement.selectionMode !== 'random'
      ) {
        // Start targeting mode
        const needsTargeting = targeting.startTargeting(card, state);
        if (needsTargeting) {
          // Update state to targeting phase
          updateState((prevState) => turnFlow.setPhase(prevState, TURN_PHASE.TARGETING), 'Enter Targeting');
          return;
        }
        // If optional targeting with no valid targets, proceed without targets
      }

      // Execute card directly (no targeting needed, or random selection handled in executeCard)
      executeCard(card);
    },
    [state, targeting, updateState, turnFlow, executeCard]
  );

  // Confirm targeting and execute the pending card
  const confirmTargeting = useCallback(() => {
    const targetContext = targeting.confirmTargets();
    if (targetContext && targeting.pendingCard) {
      executeCard(targeting.pendingCard, targetContext);
    }
  }, [targeting, executeCard]);

  // Cancel targeting and return to player action
  const cancelTargeting = useCallback(() => {
    targeting.cancelTargeting();
    updateState((prevState) => turnFlow.setPhase(prevState, TURN_PHASE.PLAYER_ACTION), 'Cancel Targeting');
  }, [targeting, updateState, turnFlow]);

  const endTurn = useCallback(() => {
    updateState((prevState) => {
      if (prevState.isGameOver) return prevState;

      // 1. Set phase to opponent turn
      let nextState = turnFlow.setPhase(prevState, TURN_PHASE.OPPONENT_TURN);

      // 2. Move all cards from hand to discard
      nextState = deck.discardHand(nextState);

      // 3. Process end of turn (patience cost, cooldowns, actions, turn_end effects)
      nextState = processEndTurn(nextState);

      // 4. Process any pending events from end of turn
      nextState = eventQueue.processEvents(nextState);

      // 5. Check if game ended
      if (nextState.isGameOver) {
        return nextState;
      }

      // 6. Set phase to drawing
      nextState = turnFlow.setPhase(nextState, TURN_PHASE.DRAWING);

      // 7. Draw new hand
      nextState = deck.drawCards(
        { ...nextState, player: { ...nextState.player, hand: [] } },
        INITIAL_HAND_SIZE
      );

      // 8. Increment turn and return to player_action
      nextState = turnFlow.incrementTurn(nextState);
      nextState = turnFlow.setPhase(nextState, 'player_action');

      // 9. Process start of turn effects (healing, poise gain, etc.)
      nextState = processStartTurn(nextState);

      return nextState;
    }, 'End Turn');
  }, [updateState, deck, turnFlow, eventQueue]);

  const startNewBattle = useCallback((newConfig: BattleConfig) => {
    resetState(createInitialState(newConfig));
  }, [resetState]);

  const getBattleResult = useCallback(() => {
    if (!state.isGameOver) return null;
    return {
      won: state.winner === COMBAT_LOG_ACTOR.PLAYER,
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

  return {
    state,
    playCard,
    endTurn,
    startNewBattle,
    getBattleResult,
    debug,
    // Targeting
    targeting: {
      isTargeting: targeting.isTargeting,
      pendingCard: targeting.pendingCard,
      requirement: targeting.requirement,
      selectedTargets: targeting.selectedTargets,
      validTargets: targeting.validTargets,
      selectTarget: targeting.selectTarget,
      deselectTarget: targeting.deselectTarget,
      confirmTargets: confirmTargeting,
      cancelTargeting,
      canConfirm: targeting.canConfirm,
    },
    // Event queue
    events: {
      currentEvent: eventQueue.currentEvent,
      isBlocking: eventQueue.isBlocking,
    },
  };
}
