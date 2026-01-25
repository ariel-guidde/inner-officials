// ==================== ELEMENT TYPE ====================
export const ELEMENT = {
  WOOD: 'wood',
  FIRE: 'fire',
  EARTH: 'earth',
  METAL: 'metal',
  WATER: 'water',
} as const;

export type Element = typeof ELEMENT[keyof typeof ELEMENT];

// ==================== INTENTION TYPE ====================
export const INTENTION_TYPE = {
  ATTACK: 'attack',
  FAVOR_GAIN: 'favor_gain',
  FAVOR_STEAL: 'favor_steal',
  STALL: 'stall',
  FLUSTERED: 'flustered',
} as const;

export type IntentionType = typeof INTENTION_TYPE[keyof typeof INTENTION_TYPE];

export interface Intention {
  name: string;
  type: IntentionType;
  value: number;
  patienceThreshold: number; // Patience spent until this action executes
}

export type DrawCardsFunction = (state: GameState, count: number) => GameState;

// ==================== TARGETING SYSTEM ====================
export const TARGET_TYPE = {
  NONE: 'none',
  HAND_CARD: 'hand_card',
} as const;

export type TargetType = typeof TARGET_TYPE[keyof typeof TARGET_TYPE];

export const CARD_DESTINATION = {
  DISCARD: 'discard',
  BURN: 'burn',
} as const;

export type CardDestination = typeof CARD_DESTINATION[keyof typeof CARD_DESTINATION]; // discard = goes to discard pile, burn = removed from play

export const SELECTION_MODE = {
  CHOOSE: 'choose',
  RANDOM: 'random',
} as const;

export type SelectionMode = typeof SELECTION_MODE[keyof typeof SELECTION_MODE];

export interface TargetRequirement {
  type: TargetType;
  destination?: CardDestination; // Where selected cards go
  selectionMode?: SelectionMode; // User choice vs random
  count?: number; // How many cards (default 1)
  filter?: (card: Card, state: GameState) => boolean;
  optional?: boolean;
  isPlayRequirement?: boolean; // If true, card is unplayable without valid targets
  prompt?: string;
}

export interface TargetedEffectContext {
  selectedCards?: Card[];
}

// ==================== TIMED EFFECTS SYSTEM ====================
export const EFFECT_TRIGGER = {
  TURN_START: 'turn_start',
  TURN_END: 'turn_end',
  ON_DAMAGE: 'on_damage',
  PASSIVE: 'passive',
} as const;

export type EffectTrigger = typeof EFFECT_TRIGGER[keyof typeof EFFECT_TRIGGER];

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
export const BOARD_EFFECT_TYPE = {
  ELEMENT_COST_MOD: 'element_cost_mod',
  NEGATE_NEXT_ATTACK: 'negate_next_attack',
  REFLECT_ATTACK: 'reflect_attack',
  RULE_MOD: 'rule_mod',
} as const;

export type BoardEffectType = typeof BOARD_EFFECT_TYPE[keyof typeof BOARD_EFFECT_TYPE];

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
export const GAME_EVENT_TYPE = {
  JUDGE_DECREE: 'judge_decree',
  OPPONENT_ACTION: 'opponent_action',
} as const;

export type GameEventType = typeof GAME_EVENT_TYPE[keyof typeof GAME_EVENT_TYPE];

export interface GameEvent {
  id: string;
  type: GameEventType;
  name: string;
  description: string;
  actionType?: IntentionType;
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

// ==================== SCREEN TYPE ====================
export const SCREEN = {
  MENU: 'menu',
  DECK: 'deck',
  HOW_TO_PLAY: 'how-to-play',
  SETTINGS: 'settings',
  BATTLE: 'battle',
  BATTLE_SUMMARY: 'battle-summary',
} as const;

export type Screen = typeof SCREEN[keyof typeof SCREEN];

// ==================== PLAYER SAVE SYSTEM ====================
export interface SavedDeck {
  id: string;
  name: string;
  cardIds: string[]; // Card IDs with duplicates for multiple copies
  createdAt: number;
  updatedAt: number;
}

export interface PlayerSaveData {
  version: 1;
  decks: SavedDeck[];
  activeDeckId: string | null;
}

// Session state for multi-battle campaigns
export interface SessionState {
  totalBattles: number;
  currentBattle: number;
  battlesWon: number;
  playerFaceCarryOver: number; // Face carried from previous battle
  isSessionOver: boolean;
  sessionWon: boolean | null;
}

// ==================== TURN PHASE ====================
export const TURN_PHASE = {
  PLAYER_ACTION: 'player_action',
  TARGETING: 'targeting',
  RESOLVING: 'resolving',
  OPPONENT_TURN: 'opponent_turn',
  DRAWING: 'drawing',
} as const;

export type TurnPhase = typeof TURN_PHASE[keyof typeof TURN_PHASE];

// ==================== COMBAT LOG ACTOR ====================
export const COMBAT_LOG_ACTOR = {
  PLAYER: 'player',
  OPPONENT: 'opponent',
  SYSTEM: 'system',
  JUDGE: 'judge',
} as const;

export type CombatLogActor = typeof COMBAT_LOG_ACTOR[keyof typeof COMBAT_LOG_ACTOR];

export interface CombatLogEntry {
  id: string;
  timestamp: number;
  turn: number;
  actor: CombatLogActor;
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
    removedFromGame: Card[];             
    canSeeNextIntention: boolean;        
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
    name: string;                        // Name of the selected judge
    effects: JudgeEffects;
    nextEffect: string | null;           // Description of next judge action
    patienceThreshold: number;           // Patience spent until next judge action
    patienceSpent: number;               // Track patience spent for judge triggers
  };
  patience: number;
  lastElement: Element | null;
  history: Element[];
  harmonyStreak: number; // Count of consecutive cards played in harmony cycle
  isGameOver: boolean;
  winner: CombatLogActor | null;
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
