export type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export interface Intention {
  name: string;
  type: 'attack' | 'favor' | 'stall' | 'flustered';
  value: number;
  patienceThreshold: number; // Patience spent until this action executes
}

export type DrawCardsFunction = (state: GameState, count: number) => GameState;

// ==================== TARGETING SYSTEM ====================
export type TargetType = 'none' | 'hand_card';

export interface TargetRequirement {
  type: TargetType;
  filter?: (card: Card, state: GameState) => boolean;
  optional?: boolean;
  prompt?: string;
}

export interface TargetedEffectContext {
  selectedCards?: Card[];
}

// ==================== TIMED EFFECTS SYSTEM ====================
export type EffectTrigger = 'turn_start' | 'turn_end' | 'on_damage' | 'passive';

export interface ActiveEffect {
  id: string;
  name: string;
  description: string;
  element: Element;
  trigger: EffectTrigger;
  remainingTurns: number;        // -1 = permanent until triggers exhausted
  remainingTriggers?: number;    // for "next N attacks" style
  apply: (state: GameState) => GameState;
  isPositive: boolean;
}

// ==================== BOARD EFFECTS SYSTEM ====================
export type BoardEffectType = 'element_cost_mod' | 'negate_next_attack' | 'reflect_attack' | 'rule_mod';

export interface BoardEffect {
  id: string;
  name: string;
  effectType: BoardEffectType;
  element?: Element;
  value?: number;
  turnsRemaining?: number;  // undefined = until triggered
  isHidden?: boolean;
}

export interface IntentionModifier {
  id: string;
  name: string;
  remainingTriggers: number;
  modify: (intention: Intention) => Intention;
}

// ==================== EVENT SYSTEM ====================
export type GameEventType = 'judge_decree' | 'opponent_action';

export interface GameEvent {
  id: string;
  type: GameEventType;
  name: string;
  description: string;
  actionType?: 'attack' | 'favor' | 'stall';
  value?: number;
  statChanges?: { playerFace?: number; playerFavor?: number; };
}

// ==================== CARD INTERFACE ====================
export interface Card {
  id: string;
  name: string;
  element: Element;
  patienceCost: number;
  faceCost: number;
  description: string;
  effect: (state: GameState, drawCards?: DrawCardsFunction) => GameState;
  isBad?: boolean; // Bad cards are removed from game when played
  removeAfterPlay?: boolean; // Fire cards that burn out after use
  // Targeting system
  targetedEffect?: (state: GameState, targets: TargetedEffectContext, drawCards?: DrawCardsFunction) => GameState;
  targetRequirement?: TargetRequirement;
}

export type Screen = 'menu' | 'deck' | 'how-to-play' | 'settings' | 'battle' | 'battle-summary';

// Session state for multi-battle campaigns
export interface SessionState {
  totalBattles: number;
  currentBattle: number;
  battlesWon: number;
  playerFaceCarryOver: number; // Face carried from previous battle
  isSessionOver: boolean;
  sessionWon: boolean | null;
}

export type TurnPhase = 'player_action' | 'targeting' | 'resolving' | 'opponent_turn' | 'drawing';

export interface CombatLogEntry {
  id: string;
  timestamp: number;
  turn: number;
  actor: 'player' | 'opponent' | 'system' | 'judge';
  action: string;
  details: Record<string, unknown>;
  stateDelta?: {
    playerFace?: number;
    playerFavor?: number;
    playerPoise?: number;
    opponentFace?: number;
    opponentFavor?: number;
    patience?: number;
  };
}

export interface StateHistoryEntry {
  label: string;
  state: GameState;
  timestamp: number;
}

// Judge effects that modify the game rules
export interface JudgeEffects {
  endTurnPatienceCost: number;      // Base cost to end turn (default 1)
  elementCostModifier: Partial<Record<Element, number>>; // +/- patience cost per element
  favorGainModifier: number;         // Multiplier for favor gains (1.0 = normal)
  damageModifier: number;            // Multiplier for damage dealt (1.0 = normal)
  activeDecrees: Array<{ name: string; description: string; turnApplied: number }>;
}

export interface GameState {
  player: {
    face: number;
    maxFace: number;
    favor: number;
    poise: number;
    hand: Card[];
    deck: Card[];
    discard: Card[];
    removedFromGame: Card[];             // Bad cards removed from the game
    canSeeNextIntention: boolean;        // Revealed by metal cards
  };
  opponent: {
    name: string;
    face: number;
    maxFace: number;
    favor: number;
    patienceSpent: number;               // Track patience spent for intention triggers
    currentIntention: Intention | null;  // Visible intention with patience threshold
    nextIntention: Intention | null;     // Hidden next intention
  };
  judge: {
    effects: JudgeEffects;
    nextEffect: string | null;           // Description of next judge action
    patienceThreshold: number;           // Patience spent until next judge action
    patienceSpent: number;               // Track patience spent for judge triggers
  };
  patience: number;
  lastElement: Element | null;
  history: Element[];
  isGameOver: boolean;
  winner: 'player' | 'opponent' | null;
  turnNumber?: number;
  turnPhase?: TurnPhase;
  // Targeting system
  pendingCard?: Card;
  targetingContext?: {
    requirement: TargetRequirement;
    selectedTargets: Card[];
  };
  // Active effects system (wood cards)
  activeEffects: ActiveEffect[];
  // Board effects system (metal cards)
  boardEffects: BoardEffect[];
  intentionModifiers: IntentionModifier[];
  // Event system
  pendingEvents: GameEvent[];
}
