import { describe, it, expect } from 'vitest';
import { processTurn, processEndTurn, processStartTurn } from '../CombatEngine';
import { createTestState, createCard, createDrawCards } from './testUtils';
import { addStatusFromTemplate } from '../modules/statuses';
import { ELEMENT, COMBAT_LOG_ACTOR, INTENTION_TYPE } from '../../../types/game';
import { CombatLog } from '../../debug/combatLogger';

/** Silent logger that does nothing — prevents console noise in tests */
const silentLog: CombatLog = {
  setTurn: () => {},
  log: () => {},
  logCardPlayed: () => {},
  logAIAction: () => {},
  logSystemEvent: () => {},
};

describe('CombatEngine', () => {
  describe('processTurn', () => {
    it('applies data-driven effects from card', () => {
      const state = createTestState();
      const card = createCard({
        element: ELEMENT.WOOD,
        patienceCost: 2,
        faceCost: 0,
        effects: [{ type: 'gain_standing', value: 10 }],
      });
      const drawCards = createDrawCards();
      const result = processTurn(state, card, drawCards, silentLog);
      // Standing should have increased
      expect(result.player.standing.favorInCurrentTier).toBeGreaterThan(0);
      // Patience should have decreased
      expect(result.patience).toBeLessThan(state.patience);
    });

    it('deducts patience cost', () => {
      const state = createTestState({ patience: 40 });
      const card = createCard({ patienceCost: 3, faceCost: 0, effects: [] });
      const drawCards = createDrawCards();
      const result = processTurn(state, card, drawCards, silentLog);
      expect(result.patience).toBe(37);
    });

    it('deducts face cost', () => {
      const state = createTestState({ playerFace: 60 });
      const card = createCard({ patienceCost: 1, faceCost: 5, effects: [] });
      const drawCards = createDrawCards();
      const result = processTurn(state, card, drawCards, silentLog);
      expect(result.player.face).toBe(55);
    });

    it('applies 1.5x multiplier in chaos flow', () => {
      // Wood → Earth = chaos (+2 in cycle)
      const state = createTestState({ lastElement: ELEMENT.WOOD });
      const card = createCard({
        element: ELEMENT.EARTH,
        patienceCost: 1,
        faceCost: 0,
        effects: [{ type: 'gain_poise', value: 5 }],
      });
      const drawCards = createDrawCards();
      const result = processTurn(state, card, drawCards, silentLog);
      // Effect value: floor(5 * 1.5) = 7 poise
      expect(result.player.poise).toBe(7);
    });

    it('does not double effects in balanced flow', () => {
      // Wood → Fire = balanced
      const state = createTestState({ lastElement: ELEMENT.WOOD });
      const card = createCard({
        element: ELEMENT.FIRE,
        patienceCost: 1,
        faceCost: 0,
        effects: [{ type: 'gain_poise', value: 5 }],
      });
      const drawCards = createDrawCards();
      const result = processTurn(state, card, drawCards, silentLog);
      expect(result.player.poise).toBe(5);
    });

    it('updates lastElement', () => {
      const state = createTestState({ lastElement: null });
      const card = createCard({ element: ELEMENT.METAL, effects: [] });
      const drawCards = createDrawCards();
      const result = processTurn(state, card, drawCards, silentLog);
      expect(result.lastElement).toBe(ELEMENT.METAL);
    });

    it('applies flustered mechanic when opponent face reaches 0', () => {
      const state = createTestState({ opponentFace: 5 });
      const card = createCard({
        patienceCost: 1,
        faceCost: 0,
        effects: [{ type: 'deal_shame', value: 10 }],
      });
      const drawCards = createDrawCards();
      const result = processTurn(state, card, drawCards, silentLog);
      // Opponent should be flustered: face reset to half max
      expect(result.opponents[0].face).toBe(Math.floor(result.opponents[0].maxFace / 2));
      expect(result.opponents[0].currentIntention?.type).toBe(INTENTION_TYPE.FLUSTERED);
    });
  });

  describe('processEndTurn', () => {
    it('deducts end turn patience cost', () => {
      const state = createTestState({ patience: 40 });
      const result = processEndTurn(state, silentLog);
      // Default end turn cost is 1
      expect(result.patience).toBe(39);
    });

    it('executes opponent actions', () => {
      const state = createTestState({ patience: 40 });
      // Set opponent to attack
      state.opponents[0].currentIntention = { name: 'Test Attack', type: INTENTION_TYPE.ATTACK, value: 10 };
      const result = processEndTurn(state, silentLog);
      // Player should have taken damage (10 - poise)
      expect(result.player.face).toBeLessThan(state.player.face);
    });

    it('ticks status durations', () => {
      let state = createTestState();
      state = addStatusFromTemplate(state, 'growing_roots'); // 3 turns
      const result = processEndTurn(state, silentLog);
      // Status should have been ticked and triggered
      const statusAfter = result.statuses.find(s => s.templateId === 'growing_roots');
      expect(statusAfter).toBeDefined();
      expect(statusAfter!.turnsRemaining).toBe(2);
    });

    it('resets poise at end of turn', () => {
      const state = createTestState({ poise: 15 });
      const result = processEndTurn(state, silentLog);
      expect(result.player.poise).toBe(0);
    });

    it('handles multiple opponents', () => {
      const state = createTestState({ opponentCount: 2, patience: 40 });
      state.opponents[0].currentIntention = { name: 'A1', type: INTENTION_TYPE.STALL, value: 2 };
      state.opponents[1].currentIntention = { name: 'A2', type: INTENTION_TYPE.STALL, value: 3 };
      const result = processEndTurn(state, silentLog);
      // Patience reduced by end turn cost (1) + stall from both opponents (2 + 3) = 6
      expect(result.patience).toBe(40 - 1 - 2 - 3);
    });
  });

  describe('processStartTurn', () => {
    it('fires turn_start status triggers', () => {
      let state = createTestState();
      // regeneration: heal 3 face at turn start
      state = addStatusFromTemplate(state, 'regeneration');
      state = { ...state, player: { ...state.player, face: 50 } };
      const result = processStartTurn(state);
      expect(result.player.face).toBe(53);
    });
  });

  describe('victory conditions', () => {
    it('player loses when face reaches 0', () => {
      const state = createTestState({ playerFace: 5 });
      const card = createCard({ patienceCost: 0, faceCost: 10, effects: [] });
      const drawCards = createDrawCards();
      const result = processTurn(state, card, drawCards, silentLog);
      expect(result.isGameOver).toBe(true);
      expect(result.winner).toBe(COMBAT_LOG_ACTOR.OPPONENT);
    });

    it('player wins at patience=0 when tier is higher', () => {
      const state = createTestState({ patience: 1 });
      // Give player tier 2
      state.player.standing = { currentTier: 2, favorInCurrentTier: 0 };
      // Opponent at tier 0
      state.opponents[0].standing = { currentTier: 0, favorInCurrentTier: 0 };
      // Play a card that costs 1 patience — patience will reach 0
      const card = createCard({ patienceCost: 1, faceCost: 0, effects: [] });
      const drawCards = createDrawCards();
      const result = processTurn(state, card, drawCards, silentLog);
      expect(result.isGameOver).toBe(true);
      expect(result.winner).toBe(COMBAT_LOG_ACTOR.PLAYER);
    });

    it('opponent wins on tie at patience=0', () => {
      const state = createTestState({ patience: 1 });
      state.player.standing = { currentTier: 1, favorInCurrentTier: 0 };
      state.opponents[0].standing = { currentTier: 1, favorInCurrentTier: 0 };
      const card = createCard({ patienceCost: 1, faceCost: 0, effects: [] });
      const drawCards = createDrawCards();
      const result = processTurn(state, card, drawCards, silentLog);
      expect(result.isGameOver).toBe(true);
      expect(result.winner).toBe(COMBAT_LOG_ACTOR.OPPONENT);
    });

    it('opponent wins at patience=0 when opponent tier is higher', () => {
      const state = createTestState({ patience: 1 });
      state.player.standing = { currentTier: 0, favorInCurrentTier: 0 };
      state.opponents[0].standing = { currentTier: 2, favorInCurrentTier: 0 };
      const card = createCard({ patienceCost: 1, faceCost: 0, effects: [] });
      const drawCards = createDrawCards();
      const result = processTurn(state, card, drawCards, silentLog);
      expect(result.isGameOver).toBe(true);
      expect(result.winner).toBe(COMBAT_LOG_ACTOR.OPPONENT);
    });
  });
});
