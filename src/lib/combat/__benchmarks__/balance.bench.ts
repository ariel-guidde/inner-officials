import { describe, bench } from 'vitest';
import { processTurn, processEndTurn, processStartTurn } from '../CombatEngine';
import { GameState, TURN_PHASE, Element, ELEMENT, COMBAT_LOG_ACTOR } from '../../../types/game';
import { DEBATE_DECK } from '../../../data/cards';
import { OPPONENTS } from '../../../data/opponents';
import { JUDGES } from '../../../data/judges';
import { DEFAULT_JUDGE_EFFECTS } from '../constants';
import { drawCards as deckDrawCards } from '../services/deckService';
import { CombatLog } from '../../debug/combatLogger';

const silentLog: CombatLog = {
  setTurn: () => {},
  log: () => {},
  logCardPlayed: () => {},
  logAIAction: () => {},
  logSystemEvent: () => {},
};

function drawCards(state: GameState, count: number): GameState {
  return deckDrawCards(state, count);
}

function createBalanceState(opts: {
  opponentIndices?: number[];
  elementFilter?: Element;
  patience?: number;
} = {}): GameState {
  const { opponentIndices = [0], elementFilter, patience = 40 } = opts;
  const judge = JUDGES[0];

  let cards = DEBATE_DECK.map((c, i) => ({ ...c, id: `${c.id}_bal_${i}` }));
  if (elementFilter) {
    cards = cards.filter(c => c.element === elementFilter);
    // Pad to at least 15 cards by duplicating
    let dupeIdx = 0;
    while (cards.length < 15) {
      cards.push({ ...cards[dupeIdx % cards.length], id: `${cards[dupeIdx % cards.length].id}_dup_${dupeIdx}` });
      dupeIdx++;
    }
  }

  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  const hand = shuffled.slice(0, 5);
  const deck = shuffled.slice(5);

  const opponents = opponentIndices.map((idx, i) => {
    const t = OPPONENTS[idx % OPPONENTS.length];
    return {
      id: `opp_${i}`,
      name: t.name,
      face: t.maxFace,
      maxFace: t.maxFace,
      standing: { currentTier: 0, favorInCurrentTier: 0 },
      currentIntention: t.intentions[0],
      nextIntention: t.intentions[1],
      intentionQueue: [] as GameState['opponents'][0]['intentionQueue'],
      coreArgument: t.coreArgument,
      templateName: t.name,
      statuses: [] as GameState['opponents'][0]['statuses'],
    };
  });

  return {
    player: {
      face: 60,
      maxFace: 60,
      standing: { currentTier: 0, favorInCurrentTier: 0 },
      poise: 0,
      hand,
      deck,
      discard: [],
      removedFromGame: [],
    },
    judge: {
      name: judge.name,
      effects: { ...DEFAULT_JUDGE_EFFECTS },
      tierStructure: judge.tierStructure,
      nextEffect: null,
      patienceThreshold: 15,
      patienceSpent: 0,
    },
    patience,
    lastElement: null,
    history: [],
    harmonyStreak: 0,
    isGameOver: false,
    winner: null,
    turnNumber: 1,
    turnPhase: TURN_PHASE.PLAYER_ACTION,
    statuses: [],
    opponents,
    pendingEvents: [],
    nextId: 1,
  };
}

function simulateGame(state: GameState): { winner: string | null; turns: number; playerTier: number; oppTier: number } {
  let s = state;
  let turns = 0;

  while (!s.isGameOver && turns < 100) {
    // Play up to 3 random playable cards per turn
    let cardsPlayed = 0;
    while (cardsPlayed < 3 && !s.isGameOver) {
      const playable = s.player.hand.filter(c => c.patienceCost <= s.patience && s.player.face > (c.faceCost ?? 0));
      if (playable.length === 0) break;
      const card = playable[Math.floor(Math.random() * playable.length)];
      s = processTurn(s, card, drawCards, silentLog);
      s = {
        ...s,
        player: {
          ...s.player,
          hand: s.player.hand.filter(c => c.id !== card.id),
          discard: [...s.player.discard, card],
        },
      };
      cardsPlayed++;
    }

    if (s.isGameOver) break;

    s = processEndTurn(s, silentLog);
    if (s.isGameOver) break;

    // Draw new hand
    s = {
      ...s,
      player: { ...s.player, discard: [...s.player.discard, ...s.player.hand], hand: [] },
    };
    s = drawCards(s, 5);
    s = processStartTurn(s);
    s = { ...s, turnNumber: (s.turnNumber ?? 1) + 1 };
    turns++;
  }

  const maxOppTier = s.opponents.length > 0
    ? Math.max(...s.opponents.map(o => o.standing.currentTier))
    : 0;

  return {
    winner: s.winner,
    turns,
    playerTier: s.player.standing.currentTier,
    oppTier: maxOppTier,
  };
}

function runSimulations(count: number, stateFactory: () => GameState) {
  let wins = 0;
  let totalTurns = 0;
  let totalTierDiff = 0;

  for (let i = 0; i < count; i++) {
    const result = simulateGame(stateFactory());
    if (result.winner === COMBAT_LOG_ACTOR.PLAYER) wins++;
    totalTurns += result.turns;
    totalTierDiff += result.playerTier - result.oppTier;
  }

  return {
    winRate: (wins / count * 100).toFixed(1),
    avgTurns: (totalTurns / count).toFixed(1),
    avgTierDiff: (totalTierDiff / count).toFixed(2),
  };
}

const GAME_COUNT = 100;

describe('Balance: Default deck vs each opponent', () => {
  bench('simulate matchups', () => {
    const results: Record<string, ReturnType<typeof runSimulations>> = {};
    for (let i = 0; i < OPPONENTS.length; i++) {
      results[OPPONENTS[i].name] = runSimulations(GAME_COUNT, () => createBalanceState({ opponentIndices: [i] }));
    }
    console.log('\n=== Default Deck vs Each Opponent ===');
    console.table(results);
  }, { iterations: 1 });
});

describe('Balance: Mono-element decks vs The Concubine', () => {
  bench('simulate element matchups', () => {
    const elements: Element[] = [ELEMENT.WOOD, ELEMENT.FIRE, ELEMENT.EARTH, ELEMENT.METAL, ELEMENT.WATER];
    const results: Record<string, ReturnType<typeof runSimulations>> = {};
    for (const el of elements) {
      results[el] = runSimulations(GAME_COUNT, () => createBalanceState({ elementFilter: el }));
    }
    console.log('\n=== Mono-Element Decks vs The Concubine ===');
    console.table(results);
  }, { iterations: 1 });
});

describe('Balance: Multi-opponent (2 opponents)', () => {
  bench('simulate 2-opponent games', () => {
    const results = runSimulations(GAME_COUNT, () => createBalanceState({ opponentIndices: [0, 1] }));
    console.log('\n=== 2-Opponent Games ===');
    console.table({ '2 opponents': results });
  }, { iterations: 1 });
});

describe('Balance: Low patience (25)', () => {
  bench('simulate low patience games', () => {
    const results = runSimulations(GAME_COUNT, () => createBalanceState({ patience: 25 }));
    console.log('\n=== Low Patience (25) Games ===');
    console.table({ 'patience 25': results });
  }, { iterations: 1 });
});
