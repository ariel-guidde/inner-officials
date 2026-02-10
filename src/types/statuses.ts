import { StatusTrigger, StatusModifier, GameState } from './game';
import { EffectDef } from './effects';

export interface StatusTemplate {
  id: string;                     // 'growing_roots', 'thick_bark', etc.
  name: string;
  description: string;
  trigger: StatusTrigger;
  defaultDuration: number;        // -1 for permanent
  defaultTriggerCount?: number;
  modifiers: StatusModifier[];
  triggeredEffects?: EffectDef[];  // Data-driven triggered effects
  apply?: (state: GameState) => GameState;  // Legacy bridge
  isPositive: boolean;
  tags: string[];
}

export interface StatusInstance {
  id: string;                     // Unique runtime ID
  templateId: string;             // References StatusTemplate.id
  owner: 'player' | 'opponent';
  opponentId?: string;
  turnsRemaining: number;
  triggersRemaining?: number;
}
