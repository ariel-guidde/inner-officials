import { Card } from './game';

export type EffectDef =
  | { type: 'deal_shame'; value: number; target?: 'selected_opponent' }
  | { type: 'gain_standing'; value: number; target?: 'player' | 'opponent' }
  | { type: 'gain_poise'; value: number }
  | { type: 'heal_face'; value: number }
  | { type: 'drain_patience'; value: number }
  | { type: 'draw_cards'; count: number }
  | { type: 'burn_card'; source: 'selected' | 'random'; filter?: CardFilter }
  | { type: 'discard_card'; source: 'selected' | 'random' }
  | { type: 'add_status'; templateId: string; duration?: number; target?: 'player' | 'opponent' }
  | { type: 'remove_status'; tag: string; owner?: 'player' | 'opponent' }
  | { type: 'reveal_intention'; count: number; target: 'selected_opponent' }
  | { type: 'computed'; compute: ComputedValueDef; effectTemplate: EffectDef };

export type ComputedValueDef =
  | { type: 'target_patience_cost'; multiplier: number };

export type CardFilter = { excludeCardId?: string };

export interface EffectContext {
  selectedCards?: Card[];
  targetOpponentId?: string;
  sourceCardId?: string;
}
