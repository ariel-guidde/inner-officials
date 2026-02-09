import { useCallback, useMemo } from 'react';
import { GameState, Card, StateHistoryEntry, Intention, TargetedEffectContext, TURN_PHASE, COMBAT_LOG_ACTOR, CARD_DESTINATION, TARGET_TYPE, CoreArgument, Status } from '../types/game';
import { DEBATE_DECK } from '../data/cards';
import { OPPONENTS } from '../data/opponents';
import { JUDGES } from '../data/judges';
import { processTurn, processEndTurn, processStartTurn, DEFAULT_JUDGE_EFFECTS, createInitialStanding, checkChaos } from '../lib/combat';
import { createCoreArgumentStatuses } from '../lib/combat/modules/coreArgumentStatuses';
import { pickRandomJudgeAction } from '../lib/combat/modules/judge';
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
  opponentIndices?: number[]; // Multiple opponents
  deckCardIds?: string[]; // Card IDs from saved deck
  // Campaign bonuses
  startingStanding?: number;    // Starting standing favor (replaces startingFavor)
  startingPatience?: number;
  opponentStartingShame?: number;
  // Core argument
  playerCoreArgument?: CoreArgument;
}

function createInitialState(config: BattleConfig = {}): GameState {
  const {
    playerStartingFace = DEFAULT_MAX_FACE,
    opponentIndex = 0,
    opponentIndices,
    deckCardIds,
    startingStanding = 0,
    startingPatience = 0,
    opponentStartingShame = 0,
    playerCoreArgument,
  } = config;

  // Resolve opponent indices: prefer opponentIndices, fall back to [opponentIndex]
  const resolvedIndices = opponentIndices ?? [opponentIndex];

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

  const initialDeck = shuffledDeck.slice(INITIAL_HAND_SIZE);
  const initialHand = shuffledDeck.slice(0, INITIAL_HAND_SIZE);

  // Build opponents from indices
  const opponents = resolvedIndices.map((idx, i) => {
    const template = OPPONENTS[idx % OPPONENTS.length];
    const currentIntention = pickRandomIntention(template.intentions);
    const nextIntention = pickRandomIntention(template.intentions);
    return {
      id: `opp_${i}`,
      name: template.name,
      face: Math.max(1, template.maxFace - opponentStartingShame),
      maxFace: template.maxFace,
      standing: createInitialStanding(),
      currentIntention,
      nextIntention,
      coreArgument: template.coreArgument,
      templateName: template.name,
      statuses: [] as Status[],
    };
  });

  // Primary opponent for legacy field
  const primary = opponents[0];

  // Randomly select a judge
  const judgeTemplate = JUDGES[Math.floor(Math.random() * JUDGES.length)];

  // Pick initial judge action and apply it immediately
  const initialJudgeAction = pickRandomJudgeAction(judgeTemplate.judgeActions);
  const initialEffects = initialJudgeAction.apply(DEFAULT_JUDGE_EFFECTS);
  const initialDecree = {
    name: initialJudgeAction.name,
    description: initialJudgeAction.description,
    turnApplied: 0, // Applied at start
  };

  // Pick next judge action for after the initial one
  const nextJudgeAction = pickRandomJudgeAction(judgeTemplate.judgeActions);

  // Initialize player standing with any starting bonus
  const playerStanding = createInitialStanding();
  if (startingStanding > 0) {
    playerStanding.favorInCurrentTier = startingStanding;
  }

  // Build core argument statuses
  const initialStatuses: Status[] = [];
  if (playerCoreArgument) {
    initialStatuses.push(...createCoreArgumentStatuses(playerCoreArgument, 'player'));
  }
  // Add statuses for all opponents' core arguments
  for (const opp of opponents) {
    if (opp.coreArgument) {
      initialStatuses.push(...createCoreArgumentStatuses(opp.coreArgument, 'opponent'));
    }
  }

  return {
    player: {
      face: playerStartingFace,
      maxFace: DEFAULT_MAX_FACE,
      standing: playerStanding,
      poise: 0,
      hand: initialHand,
      deck: initialDeck,
      discard: [],
      removedFromGame: [],
      coreArgument: playerCoreArgument,
    },
    opponent: {
      name: primary.name,
      face: primary.face,
      maxFace: primary.maxFace,
      standing: createInitialStanding(),
      currentIntention: primary.currentIntention,
      nextIntention: primary.nextIntention,
      coreArgument: primary.coreArgument,
    },
    judge: {
      name: judgeTemplate.name,
      effects: { ...initialEffects, activeDecrees: [initialDecree] },
      tierStructure: judgeTemplate.tierStructure,
      nextEffect: nextJudgeAction.name,
      patienceThreshold: nextJudgeAction.patienceThreshold,
      patienceSpent: 0,
    },
    patience: 40 + startingPatience,
    lastElement: null,
    history: [],
    harmonyStreak: 0,
    isGameOver: false,
    winner: null,
    turnNumber: 1,
    turnPhase: TURN_PHASE.PLAYER_ACTION,
    // Unified status system
    statuses: initialStatuses,
    // Multi-opponent support
    opponents,
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

        // Execute targeted effect (twice if chaos for double-execution)
        if (card.targetedEffect && targetContext) {
          const isChaos = checkChaos(prevState.lastElement, card.element);
          const execCount = isChaos ? 2 : 1;
          for (let i = 0; i < execCount; i++) {
            nextState = card.targetedEffect(nextState, targetContext, deck.drawCards);
          }
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
      // Check for opponent targeting
      if (card.targetRequirement?.type === TARGET_TYPE.OPPONENT) {
        // Single opponent: auto-target
        if (state.opponents.length <= 1) {
          const autoTargetId = state.opponents[0]?.id;
          executeCard(card, { targetOpponentId: autoTargetId });
          return;
        }
        // Multi-opponent: enter opponent targeting mode
        const needsTargeting = targeting.startOpponentTargeting(card, state);
        if (needsTargeting) {
          updateState((prevState) => turnFlow.setPhase(prevState, TURN_PHASE.TARGETING), 'Enter Opponent Targeting');
          return;
        }
        // Fallback auto-target first
        executeCard(card, { targetOpponentId: state.opponents[0]?.id });
        return;
      }

      // Check if card requires hand card targeting (only for 'choose' mode, not 'random')
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

  // Select opponent target and immediately execute
  const confirmOpponentTarget = useCallback((opponentId: string) => {
    const pendingCard = targeting.pendingCard;
    const context = targeting.selectOpponentAndConfirm(opponentId);
    if (context && pendingCard) {
      executeCard(pendingCard, context);
    }
  }, [targeting, executeCard]);

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
    const maxOpponentTier = state.opponents.length > 0
      ? Math.max(...state.opponents.map(o => o.standing.currentTier))
      : state.opponent.standing.currentTier;
    const opponentNames = state.opponents.map(o => o.name).join(' & ');
    return {
      won: state.winner === COMBAT_LOG_ACTOR.PLAYER,
      finalFace: state.player.face,
      opponentName: opponentNames || state.opponent.name,
      playerTier: state.player.standing.currentTier,
      opponentTier: maxOpponentTier,
      maxTier: state.judge.tierStructure.length > 0
        ? Math.max(...state.judge.tierStructure.map(t => t.tierNumber))
        : 0,
    };
  }, [state.isGameOver, state.winner, state.player.face, state.opponent.name, state.opponents, state.player.standing.currentTier, state.opponent.standing.currentTier, state.judge.tierStructure]);

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
      // Opponent targeting
      isOpponentTargeting: targeting.isOpponentTargeting,
      selectableOpponentIds: targeting.selectableOpponentIds,
      targetOpponentId: targeting.targetOpponentId,
      selectOpponent: targeting.selectOpponent,
      confirmOpponentTarget,
    },
    // Event queue
    events: {
      currentEvent: eventQueue.currentEvent,
      isBlocking: eventQueue.isBlocking,
    },
  };
}
