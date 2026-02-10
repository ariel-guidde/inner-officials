import { describe, it, expect } from 'vitest';
import {
  addStatus,
  removeStatus,
  addStatusFromTemplate,
  processStatusTrigger,
  tickStatuses,
  getModifierTotal,
  getModifierAdditive,
  getModifierMultiplier,
} from '../modules/statuses';
import { createTestState } from './testUtils';
import { STATUS_TRIGGER, MODIFIER_STAT, MODIFIER_OP } from '../../../types/game';

describe('statuses', () => {
  describe('addStatus', () => {
    it('adds a status with a generated id', () => {
      const state = createTestState();
      const result = addStatus(state, {
        name: 'Test Status',
        description: 'A test',
        owner: 'player',
        trigger: STATUS_TRIGGER.PASSIVE,
        turnsRemaining: -1,
        modifiers: [],
        isPositive: true,
      });
      expect(result.statuses.length).toBe(1);
      expect(result.statuses[0].id).toBe('status_1');
      expect(result.statuses[0].name).toBe('Test Status');
    });

    it('increments nextId', () => {
      const state = createTestState();
      const result = addStatus(state, {
        name: 'A',
        description: '',
        owner: 'player',
        trigger: STATUS_TRIGGER.PASSIVE,
        turnsRemaining: -1,
        modifiers: [],
        isPositive: true,
      });
      expect(result.nextId).toBe(2);
    });
  });

  describe('removeStatus', () => {
    it('removes a status by id', () => {
      let state = createTestState();
      state = addStatus(state, {
        name: 'To Remove',
        description: '',
        owner: 'player',
        trigger: STATUS_TRIGGER.PASSIVE,
        turnsRemaining: -1,
        modifiers: [],
        isPositive: true,
      });
      expect(state.statuses.length).toBe(1);
      const id = state.statuses[0].id;
      const result = removeStatus(state, id);
      expect(result.statuses.length).toBe(0);
    });
  });

  describe('addStatusFromTemplate', () => {
    it('creates a status from the growing_roots template', () => {
      const state = createTestState();
      const result = addStatusFromTemplate(state, 'growing_roots');
      expect(result.statuses.length).toBe(1);
      const s = result.statuses[0];
      expect(s.templateId).toBe('growing_roots');
      expect(s.name).toBe('Growing Roots');
      expect(s.turnsRemaining).toBe(3);
      expect(s.owner).toBe('player');
      expect(s.trigger).toBe(STATUS_TRIGGER.TURN_END);
    });

    it('allows overriding duration', () => {
      const state = createTestState();
      const result = addStatusFromTemplate(state, 'growing_roots', { duration: 10 });
      expect(result.statuses[0].turnsRemaining).toBe(10);
    });

    it('allows overriding owner', () => {
      const state = createTestState();
      const result = addStatusFromTemplate(state, 'growing_roots', { owner: 'opponent' });
      expect(result.statuses[0].owner).toBe('opponent');
    });

    it('returns state unchanged for unknown template', () => {
      const state = createTestState();
      const result = addStatusFromTemplate(state, 'nonexistent');
      expect(result.statuses.length).toBe(0);
    });
  });

  describe('processStatusTrigger', () => {
    it('fires triggered effects from template', () => {
      let state = createTestState();
      // growing_roots: gain 5 standing at turn_end
      state = addStatusFromTemplate(state, 'growing_roots');
      const result = processStatusTrigger(state, STATUS_TRIGGER.TURN_END);
      expect(result.player.standing.favorInCurrentTier).toBe(5);
    });

    it('decrements triggersRemaining and removes when exhausted', () => {
      let state = createTestState();
      state = addStatus(state, {
        templateId: 'growing_roots',
        name: 'Limited',
        description: '',
        owner: 'player',
        trigger: STATUS_TRIGGER.TURN_END,
        turnsRemaining: -1,
        triggersRemaining: 1,
        modifiers: [],
        isPositive: true,
      });
      expect(state.statuses.length).toBe(1);
      const result = processStatusTrigger(state, STATUS_TRIGGER.TURN_END);
      // Status should be removed after its single trigger
      expect(result.statuses.length).toBe(0);
    });

    it('decrements but keeps status with remaining triggers', () => {
      let state = createTestState();
      state = addStatus(state, {
        templateId: 'growing_roots',
        name: 'Multi Trigger',
        description: '',
        owner: 'player',
        trigger: STATUS_TRIGGER.TURN_END,
        turnsRemaining: -1,
        triggersRemaining: 3,
        modifiers: [],
        isPositive: true,
      });
      const result = processStatusTrigger(state, STATUS_TRIGGER.TURN_END);
      expect(result.statuses.length).toBe(1);
      expect(result.statuses[0].triggersRemaining).toBe(2);
    });
  });

  describe('tickStatuses', () => {
    it('decrements turnsRemaining', () => {
      let state = createTestState();
      state = addStatusFromTemplate(state, 'growing_roots'); // 3 turns
      const result = tickStatuses(state);
      expect(result.statuses[0].turnsRemaining).toBe(2);
    });

    it('removes statuses at turnsRemaining=1 (last turn)', () => {
      let state = createTestState();
      state = addStatusFromTemplate(state, 'growing_roots', { duration: 1 });
      expect(state.statuses.length).toBe(1);
      const result = tickStatuses(state);
      expect(result.statuses.length).toBe(0);
    });

    it('keeps permanent statuses (turnsRemaining=-1)', () => {
      let state = createTestState();
      state = addStatus(state, {
        name: 'Permanent',
        description: '',
        owner: 'player',
        trigger: STATUS_TRIGGER.PASSIVE,
        turnsRemaining: -1,
        modifiers: [],
        isPositive: true,
      });
      const result = tickStatuses(state);
      expect(result.statuses.length).toBe(1);
      expect(result.statuses[0].turnsRemaining).toBe(-1);
    });
  });

  describe('modifier aggregation', () => {
    it('sums ADD modifiers', () => {
      let state = createTestState();
      state = addStatus(state, {
        name: 'A',
        description: '',
        owner: 'player',
        trigger: STATUS_TRIGGER.PASSIVE,
        turnsRemaining: -1,
        modifiers: [{ stat: MODIFIER_STAT.STANDING_GAIN, op: MODIFIER_OP.ADD, value: 3 }],
        isPositive: true,
      });
      state = addStatus(state, {
        name: 'B',
        description: '',
        owner: 'player',
        trigger: STATUS_TRIGGER.PASSIVE,
        turnsRemaining: -1,
        modifiers: [{ stat: MODIFIER_STAT.STANDING_GAIN, op: MODIFIER_OP.ADD, value: 5 }],
        isPositive: true,
      });
      expect(getModifierAdditive(state, MODIFIER_STAT.STANDING_GAIN, 'player')).toBe(8);
    });

    it('applies MULTIPLY via getModifierMultiplier', () => {
      let state = createTestState();
      state = addStatus(state, {
        name: 'Mult',
        description: '',
        owner: 'player',
        trigger: STATUS_TRIGGER.PASSIVE,
        turnsRemaining: -1,
        modifiers: [{ stat: MODIFIER_STAT.FAVOR_GAIN_MULTIPLIER, op: MODIFIER_OP.MULTIPLY, value: 1.5 }],
        isPositive: true,
      });
      expect(getModifierMultiplier(state, MODIFIER_STAT.FAVOR_GAIN_MULTIPLIER, 'player')).toBe(1.5);
    });

    it('SET overrides ADD and MULTIPLY in getModifierTotal', () => {
      let state = createTestState();
      state = addStatus(state, {
        name: 'Add',
        description: '',
        owner: 'player',
        trigger: STATUS_TRIGGER.PASSIVE,
        turnsRemaining: -1,
        modifiers: [{ stat: MODIFIER_STAT.STANDING_GAIN, op: MODIFIER_OP.ADD, value: 100 }],
        isPositive: true,
      });
      state = addStatus(state, {
        name: 'Set',
        description: '',
        owner: 'player',
        trigger: STATUS_TRIGGER.PASSIVE,
        turnsRemaining: -1,
        modifiers: [{ stat: MODIFIER_STAT.STANDING_GAIN, op: MODIFIER_OP.SET, value: 42 }],
        isPositive: true,
      });
      expect(getModifierTotal(state, MODIFIER_STAT.STANDING_GAIN, 'player')).toBe(42);
    });

    it('processes ADD then MULTIPLY when no SET', () => {
      let state = createTestState();
      state = addStatus(state, {
        name: 'Add',
        description: '',
        owner: 'player',
        trigger: STATUS_TRIGGER.PASSIVE,
        turnsRemaining: -1,
        modifiers: [{ stat: MODIFIER_STAT.STANDING_GAIN, op: MODIFIER_OP.ADD, value: 10 }],
        isPositive: true,
      });
      state = addStatus(state, {
        name: 'Mult',
        description: '',
        owner: 'player',
        trigger: STATUS_TRIGGER.PASSIVE,
        turnsRemaining: -1,
        modifiers: [{ stat: MODIFIER_STAT.STANDING_GAIN, op: MODIFIER_OP.MULTIPLY, value: 2 }],
        isPositive: true,
      });
      // 10 (add) * 2 (multiply) = 20
      expect(getModifierTotal(state, MODIFIER_STAT.STANDING_GAIN, 'player')).toBe(20);
    });

    it('filters by owner', () => {
      let state = createTestState();
      state = addStatus(state, {
        name: 'Player',
        description: '',
        owner: 'player',
        trigger: STATUS_TRIGGER.PASSIVE,
        turnsRemaining: -1,
        modifiers: [{ stat: MODIFIER_STAT.STANDING_GAIN, op: MODIFIER_OP.ADD, value: 5 }],
        isPositive: true,
      });
      state = addStatus(state, {
        name: 'Opponent',
        description: '',
        owner: 'opponent',
        trigger: STATUS_TRIGGER.PASSIVE,
        turnsRemaining: -1,
        modifiers: [{ stat: MODIFIER_STAT.STANDING_GAIN, op: MODIFIER_OP.ADD, value: 10 }],
        isPositive: true,
      });
      expect(getModifierAdditive(state, MODIFIER_STAT.STANDING_GAIN, 'player')).toBe(5);
      expect(getModifierAdditive(state, MODIFIER_STAT.STANDING_GAIN, 'opponent')).toBe(10);
    });
  });
});
