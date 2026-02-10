import { describe, it, expect } from 'vitest';
import { calculateEffectiveCosts, deductFaceCost } from '../engine/costCalculator';
import { createTestState, createCard } from './testUtils';
import { ELEMENT, MODIFIER_STAT, MODIFIER_OP, STATUS_TRIGGER } from '../../../types/game';
import { addStatus } from '../modules/statuses';

describe('costCalculator', () => {
  describe('calculateEffectiveCosts', () => {
    it('passes through base costs with no modifiers (neutral flow)', () => {
      const state = createTestState({ lastElement: null });
      const card = createCard({ patienceCost: 3, faceCost: 2, element: ELEMENT.WOOD });
      const result = calculateEffectiveCosts(card, state);
      expect(result.effectivePatienceCost).toBe(3);
      expect(result.effectiveFaceCost).toBe(2);
      expect(result.modifier).toBe('');
    });

    it('balanced flow: -1 patience', () => {
      // Wood → Fire = balanced (+1 in cycle)
      const state = createTestState({ lastElement: ELEMENT.WOOD });
      const card = createCard({ patienceCost: 3, faceCost: 0, element: ELEMENT.FIRE });
      const result = calculateEffectiveCosts(card, state);
      expect(result.effectivePatienceCost).toBe(2);
      expect(result.effectiveFaceCost).toBe(0);
      expect(result.isReduced).toBe(true);
      expect(result.modifier).toBe('Balanced');
    });

    it('balanced flow: patience does not go below 0', () => {
      const state = createTestState({ lastElement: ELEMENT.WOOD });
      const card = createCard({ patienceCost: 0, faceCost: 0, element: ELEMENT.FIRE });
      const result = calculateEffectiveCosts(card, state);
      expect(result.effectivePatienceCost).toBe(0);
    });

    it('dissonant flow: +1 patience, +1 face', () => {
      // Wood → Metal = +3 in cycle = dissonant
      const state = createTestState({ lastElement: ELEMENT.WOOD });
      const card = createCard({ patienceCost: 2, faceCost: 1, element: ELEMENT.METAL });
      const result = calculateEffectiveCosts(card, state);
      expect(result.effectivePatienceCost).toBe(3);
      expect(result.effectiveFaceCost).toBe(2);
      expect(result.isIncreased).toBe(true);
      expect(result.modifier).toBe('Dissonant');
    });

    it('chaos flow: +2 patience, +2 face', () => {
      // Wood → Earth = +2 in cycle = chaos
      const state = createTestState({ lastElement: ELEMENT.WOOD });
      const card = createCard({ patienceCost: 2, faceCost: 1, element: ELEMENT.EARTH });
      const result = calculateEffectiveCosts(card, state);
      expect(result.effectivePatienceCost).toBe(4);
      expect(result.effectiveFaceCost).toBe(3);
      expect(result.isIncreased).toBe(true);
      expect(result.modifier).toBe('Chaos');
    });

    it('applies judge element cost modifier', () => {
      const state = createTestState({ lastElement: null });
      state.judge.effects.elementCostModifier = { [ELEMENT.FIRE]: 2 };
      const card = createCard({ patienceCost: 1, faceCost: 0, element: ELEMENT.FIRE });
      const result = calculateEffectiveCosts(card, state);
      expect(result.effectivePatienceCost).toBe(3); // 1 + 2
      expect(result.isIncreased).toBe(true);
      expect(result.modifier).toContain('Tax');
    });

    it('applies status-based element cost reduction', () => {
      let state = createTestState({ lastElement: null });
      state = addStatus(state, {
        name: 'Wood Discount',
        description: '',
        owner: 'player',
        trigger: STATUS_TRIGGER.PASSIVE,
        turnsRemaining: -1,
        modifiers: [{
          stat: MODIFIER_STAT.ELEMENT_COST,
          op: MODIFIER_OP.ADD,
          value: -2,
          element: ELEMENT.WOOD,
        }],
        isPositive: true,
      });
      const card = createCard({ patienceCost: 3, faceCost: 0, element: ELEMENT.WOOD });
      const result = calculateEffectiveCosts(card, state);
      expect(result.effectivePatienceCost).toBe(1); // 3 - 2
      expect(result.isReduced).toBe(true);
    });

    it('applies status-based patience cost reduction', () => {
      let state = createTestState({ lastElement: null });
      state = addStatus(state, {
        name: 'Patience Discount',
        description: '',
        owner: 'player',
        trigger: STATUS_TRIGGER.PASSIVE,
        turnsRemaining: -1,
        modifiers: [{
          stat: MODIFIER_STAT.PATIENCE_COST,
          op: MODIFIER_OP.ADD,
          value: -1,
        }],
        isPositive: true,
      });
      const card = createCard({ patienceCost: 3, faceCost: 0, element: ELEMENT.WOOD });
      const result = calculateEffectiveCosts(card, state);
      expect(result.effectivePatienceCost).toBe(2); // 3 - 1
    });
  });

  describe('deductFaceCost', () => {
    it('absorbs face cost with poise first', () => {
      const state = createTestState({ poise: 5 });
      const result = deductFaceCost(state, 3);
      expect(result.player.poise).toBe(2);
      expect(result.player.face).toBe(state.player.face); // No face damage
    });

    it('remaining cost after poise hits face', () => {
      const state = createTestState({ poise: 3 });
      const result = deductFaceCost(state, 5);
      expect(result.player.poise).toBe(0);
      expect(result.player.face).toBe(state.player.face - 2); // 5 - 3 poise = 2 face
    });

    it('full cost hits face when no poise', () => {
      const state = createTestState({ poise: 0 });
      const result = deductFaceCost(state, 5);
      expect(result.player.poise).toBe(0);
      expect(result.player.face).toBe(state.player.face - 5);
    });

    it('no cost means no change', () => {
      const state = createTestState({ poise: 5 });
      const result = deductFaceCost(state, 0);
      expect(result.player.poise).toBe(5);
      expect(result.player.face).toBe(state.player.face);
    });
  });
});
