import { describe, it, expect } from 'vitest';
import { resolveEffects } from '../engine/effectResolver';
import { createTestState, createDrawCards } from './testUtils';

describe('effectResolver', () => {
  describe('gain_standing', () => {
    it('adds standing to player by default', () => {
      const state = createTestState();
      const result = resolveEffects(state, [{ type: 'gain_standing', value: 10 }], {});
      expect(result.player.standing.favorInCurrentTier).toBe(10);
    });

    it('adds standing to opponent when targeted', () => {
      const state = createTestState();
      const result = resolveEffects(state, [{ type: 'gain_standing', value: 5, target: 'opponent' }], {});
      expect(result.opponents[0].standing.favorInCurrentTier).toBe(5);
    });
  });

  describe('deal_shame', () => {
    it('reduces opponent face', () => {
      const state = createTestState();
      const result = resolveEffects(state, [{ type: 'deal_shame', value: 10 }], {});
      expect(result.opponents[0].face).toBe(state.opponents[0].face - 10);
    });

    it('targets specific opponent via context', () => {
      const state = createTestState({ opponentCount: 2 });
      const result = resolveEffects(
        state,
        [{ type: 'deal_shame', value: 15 }],
        { targetOpponentId: 'opp_1' }
      );
      // First opponent unchanged
      expect(result.opponents[0].face).toBe(state.opponents[0].face);
      // Second opponent damaged
      expect(result.opponents[1].face).toBe(state.opponents[1].face - 15);
    });

    it('clamps opponent face at 0', () => {
      const state = createTestState();
      const result = resolveEffects(state, [{ type: 'deal_shame', value: 999 }], {});
      expect(result.opponents[0].face).toBe(0);
    });
  });

  describe('draw_cards', () => {
    it('draws cards from deck to hand', () => {
      const state = createTestState();
      const drawCards = createDrawCards();
      const handBefore = state.player.hand.length;
      const result = resolveEffects(state, [{ type: 'draw_cards', count: 2 }], {}, drawCards);
      expect(result.player.hand.length).toBe(handBefore + 2);
    });

    it('does nothing without drawCards function', () => {
      const state = createTestState();
      const result = resolveEffects(state, [{ type: 'draw_cards', count: 2 }], {});
      expect(result.player.hand.length).toBe(state.player.hand.length);
    });
  });

  describe('gain_poise', () => {
    it('increases player poise', () => {
      const state = createTestState();
      const result = resolveEffects(state, [{ type: 'gain_poise', value: 5 }], {});
      expect(result.player.poise).toBe(5);
    });
  });

  describe('heal_face', () => {
    it('restores player face', () => {
      const state = createTestState({ playerFace: 30 });
      const result = resolveEffects(state, [{ type: 'heal_face', value: 10 }], {});
      expect(result.player.face).toBe(40);
    });

    it('caps healing at max face', () => {
      const state = createTestState({ playerFace: 55 });
      const result = resolveEffects(state, [{ type: 'heal_face', value: 20 }], {});
      expect(result.player.face).toBe(state.player.maxFace);
    });
  });

  describe('drain_patience', () => {
    it('reduces patience', () => {
      const state = createTestState();
      const result = resolveEffects(state, [{ type: 'drain_patience', value: 5 }], {});
      expect(result.patience).toBe(state.patience - 5);
    });
  });

  describe('add_status', () => {
    it('adds a status from template', () => {
      const state = createTestState();
      const result = resolveEffects(state, [{ type: 'add_status', templateId: 'growing_roots' }], {});
      expect(result.statuses.length).toBe(state.statuses.length + 1);
      const newStatus = result.statuses[result.statuses.length - 1];
      expect(newStatus.templateId).toBe('growing_roots');
      expect(newStatus.name).toBe('Growing Roots');
      expect(newStatus.turnsRemaining).toBe(3);
    });

    it('respects custom duration', () => {
      const state = createTestState();
      const result = resolveEffects(state, [{ type: 'add_status', templateId: 'growing_roots', duration: 5 }], {});
      const newStatus = result.statuses[result.statuses.length - 1];
      expect(newStatus.turnsRemaining).toBe(5);
    });

    it('can target opponent', () => {
      const state = createTestState();
      const result = resolveEffects(state, [{ type: 'add_status', templateId: 'growing_roots', target: 'opponent' }], {});
      const newStatus = result.statuses[result.statuses.length - 1];
      expect(newStatus.owner).toBe('opponent');
    });
  });

  describe('remove_status', () => {
    it('removes statuses by tag', () => {
      let state = createTestState();
      // Add a status with a tag
      state = resolveEffects(state, [{ type: 'add_status', templateId: 'growing_roots' }], {});
      expect(state.statuses.some(s => s.tags?.includes('wood'))).toBe(true);

      const result = resolveEffects(state, [{ type: 'remove_status', tag: 'wood' }], {});
      expect(result.statuses.some(s => s.tags?.includes('wood'))).toBe(false);
    });

    it('respects owner filter', () => {
      let state = createTestState();
      state = resolveEffects(state, [{ type: 'add_status', templateId: 'growing_roots', target: 'player' }], {});
      const countBefore = state.statuses.length;
      // Try to remove opponent's wood statuses — should not remove the player's
      const result = resolveEffects(state, [{ type: 'remove_status', tag: 'wood', owner: 'opponent' }], {});
      expect(result.statuses.length).toBe(countBefore);
    });
  });

  describe('reveal_intention', () => {
    it('adds reveal status to target opponent', () => {
      const state = createTestState();
      const result = resolveEffects(
        state,
        [{ type: 'reveal_intention', count: 1, target: 'selected_opponent' }],
        { targetOpponentId: 'opp_0' }
      );
      const opp = result.opponents[0];
      expect(opp.statuses.some(s => s.tags?.includes('revealed'))).toBe(true);
    });

    it('does nothing without target opponent id', () => {
      const state = createTestState();
      const result = resolveEffects(
        state,
        [{ type: 'reveal_intention', count: 1, target: 'selected_opponent' }],
        {}
      );
      expect(result.opponents[0].statuses.length).toBe(0);
    });
  });

  describe('computed effects', () => {
    it('resolves target_patience_cost', () => {
      const state = createTestState();
      const targetCard = { ...state.player.hand[0], patienceCost: 3 };
      const result = resolveEffects(
        state,
        [{
          type: 'computed',
          compute: { type: 'target_patience_cost', multiplier: 5 },
          effectTemplate: { type: 'gain_standing', value: 0 },
        }],
        { selectedCards: [targetCard] }
      );
      // 3 * 5 = 15 standing
      expect(result.player.standing.favorInCurrentTier).toBe(15);
    });
  });

  describe('multiple effects', () => {
    it('resolves a chain of effects in order', () => {
      const state = createTestState({ playerFace: 50 });
      const result = resolveEffects(
        state,
        [
          { type: 'gain_standing', value: 5 },
          { type: 'gain_poise', value: 3 },
          { type: 'heal_face', value: 2 },
        ],
        {}
      );
      expect(result.player.standing.favorInCurrentTier).toBe(5);
      expect(result.player.poise).toBe(3);
      expect(result.player.face).toBe(52);
    });
  });
});
