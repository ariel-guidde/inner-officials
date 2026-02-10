import { GameState, Card, ELEMENT, Opponent, Status, TURN_PHASE } from '../../../types/game';
import { DEFAULT_JUDGE_EFFECTS } from '../constants';
import { JUDGES } from '../../../data/judges';
import { OPPONENTS } from '../../../data/opponents';
import { DEBATE_DECK } from '../../../data/cards';
import { drawCards as deckDrawCards } from '../services/deckService';

const noop = (s: GameState) => s;

/** Minimal card for testing */
export function createCard(overrides: Partial<Card> = {}): Card {
  return {
    id: overrides.id ?? 'test_card',
    name: overrides.name ?? 'Test Card',
    element: overrides.element ?? ELEMENT.WOOD,
    patienceCost: overrides.patienceCost ?? 2,
    faceCost: overrides.faceCost ?? 0,
    description: overrides.description ?? ['Test card'],
    effect: overrides.effect ?? noop,
    effects: overrides.effects,
    targetedEffects: overrides.targetedEffects,
    targetRequirement: overrides.targetRequirement,
    isBad: overrides.isBad,
    removeAfterPlay: overrides.removeAfterPlay,
  };
}

export interface TestStateOptions {
  playerFace?: number;
  maxFace?: number;
  patience?: number;
  poise?: number;
  opponentCount?: number;
  opponentFace?: number;
  handSize?: number;
  deckSize?: number;
  statuses?: Status[];
  lastElement?: typeof ELEMENT[keyof typeof ELEMENT] | null;
}

/** Create a minimal but valid GameState for testing */
export function createTestState(opts: TestStateOptions = {}): GameState {
  const {
    playerFace = 60,
    maxFace = 60,
    patience = 40,
    poise = 0,
    opponentCount = 1,
    opponentFace,
    handSize = 5,
    deckSize = 10,
    statuses = [],
    lastElement = null,
  } = opts;

  const judge = JUDGES[0]; // The Emperor
  const tierStructure = judge.tierStructure;

  // Build hand and deck from real cards
  const allCards = DEBATE_DECK.map((c, i) => ({ ...c, id: `${c.id}_test_${i}` }));
  const hand = allCards.slice(0, handSize);
  const deck = allCards.slice(handSize, handSize + deckSize);

  // Build opponents
  const opponents: Opponent[] = [];
  for (let i = 0; i < opponentCount; i++) {
    const template = OPPONENTS[i % OPPONENTS.length];
    const face = opponentFace ?? template.maxFace;
    opponents.push({
      id: `opp_${i}`,
      name: template.name,
      face,
      maxFace: template.maxFace,
      standing: { currentTier: 0, favorInCurrentTier: 0 },
      currentIntention: template.intentions[0],
      nextIntention: template.intentions[1],
      intentionQueue: [],
      coreArgument: template.coreArgument,
      templateName: template.name,
      statuses: [],
    });
  }

  return {
    player: {
      face: playerFace,
      maxFace,
      standing: { currentTier: 0, favorInCurrentTier: 0 },
      poise,
      hand,
      deck,
      discard: [],
      removedFromGame: [],
    },
    judge: {
      name: judge.name,
      effects: { ...DEFAULT_JUDGE_EFFECTS },
      tierStructure,
      nextEffect: null,
      patienceThreshold: 15,
      patienceSpent: 0,
    },
    patience,
    lastElement,
    history: [],
    harmonyStreak: 0,
    isGameOver: false,
    winner: null,
    turnNumber: 1,
    turnPhase: TURN_PHASE.PLAYER_ACTION,
    statuses,
    opponents,
    pendingEvents: [],
    nextId: 1,
  };
}

/** Create a drawCards function for testing (uses real deckService) */
export function createDrawCards() {
  return (state: GameState, count: number): GameState => {
    return deckDrawCards(state, count);
  };
}
