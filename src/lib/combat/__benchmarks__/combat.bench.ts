import { describe, bench } from 'vitest';
import { processTurn, processEndTurn, processStartTurn } from '../CombatEngine';
import { resolveEffects } from '../engine/effectResolver';
import { GameState, TURN_PHASE } from '../../../types/game';
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

function createBenchState(opponentCount = 1): GameState {
  const judge = JUDGES[0];
  const allCards = DEBATE_DECK.map((c, i) => ({ ...c, id: `${c.id}_bench_${i}` }));

  const opponents = [];
  for (let i = 0; i < opponentCount; i++) {
    const t = OPPONENTS[i % OPPONENTS.length];
    opponents.push({
      id: `opp_${i}`,
      name: t.name,
      face: t.maxFace,
      maxFace: t.maxFace,
      standing: { currentTier: 0, favorInCurrentTier: 0 },
      currentIntention: t.intentions[0],
      nextIntention: t.intentions[1],
      intentionQueue: [],
      coreArgument: t.coreArgument,
      templateName: t.name,
      statuses: [] as GameState['opponents'][0]['statuses'],
    });
  }

  return {
    player: {
      face: 60,
      maxFace: 60,
      standing: { currentTier: 0, favorInCurrentTier: 0 },
      poise: 0,
      hand: allCards.slice(0, 5),
      deck: allCards.slice(5),
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
    patience: 40,
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

describe('Combat Engine Throughput', () => {
  const state1 = createBenchState(1);
  const state2 = createBenchState(2);
  const card = state1.player.hand[0];

  bench('processTurn with single card', () => {
    processTurn(state1, card, drawCards, silentLog);
  });

  bench('processEndTurn with 1 opponent', () => {
    processEndTurn(state1, silentLog);
  });

  bench('processEndTurn with 2 opponents', () => {
    processEndTurn(state2, silentLog);
  });

  bench('full turn cycle (processTurn + processEndTurn + processStartTurn)', () => {
    let s = processTurn(state1, card, drawCards, silentLog);
    s = processEndTurn(s, silentLog);
    processStartTurn(s);
  });
});

describe('Effect Resolver', () => {
  const state = createBenchState();

  bench('single effect: gain_standing', () => {
    resolveEffects(state, [{ type: 'gain_standing', value: 10 }], {});
  });

  bench('multi-effect chain (5 effects)', () => {
    resolveEffects(state, [
      { type: 'gain_standing', value: 5 },
      { type: 'gain_poise', value: 3 },
      { type: 'heal_face', value: 2 },
      { type: 'drain_patience', value: 1 },
      { type: 'gain_standing', value: 8 },
    ], {});
  });

  bench('computed effect: target_patience_cost', () => {
    const card = state.player.hand[0];
    resolveEffects(state, [{
      type: 'computed',
      compute: { type: 'target_patience_cost', multiplier: 5 },
      effectTemplate: { type: 'gain_standing', value: 0 },
    }], { selectedCards: [card] });
  });

  bench('add_status with template lookup', () => {
    resolveEffects(state, [{ type: 'add_status', templateId: 'growing_roots' }], {});
  });
});

describe('Full Game Simulation', () => {
  bench('auto-play one complete game', () => {
    let state = createBenchState();

    let turns = 0;
    while (!state.isGameOver && turns < 100) {
      // Play a random playable card from hand
      const playableCards = state.player.hand.filter(c => c.patienceCost <= state.patience);
      if (playableCards.length > 0) {
        const card = playableCards[Math.floor(Math.random() * playableCards.length)];
        state = processTurn(state, card, drawCards, silentLog);
        // Remove played card from hand
        state = {
          ...state,
          player: {
            ...state.player,
            hand: state.player.hand.filter(c => c.id !== card.id),
            discard: [...state.player.discard, card],
          },
        };
      }

      if (state.isGameOver) break;

      // End turn
      state = processEndTurn(state, silentLog);
      if (state.isGameOver) break;

      // Draw new hand
      state = {
        ...state,
        player: { ...state.player, discard: [...state.player.discard, ...state.player.hand], hand: [] },
      };
      state = drawCards(state, 5);

      // Start turn
      state = processStartTurn(state);
      state = { ...state, turnNumber: (state.turnNumber ?? 1) + 1 };
      turns++;
    }
  });
});
