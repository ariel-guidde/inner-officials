// ==================== ELEMENT TYPE ====================
export const ELEMENT = {
  WOOD: 'wood',
  FIRE: 'fire',
  EARTH: 'earth',
  METAL: 'metal',
  WATER: 'water',
} as const;

export type Element = typeof ELEMENT[keyof typeof ELEMENT];

// ==================== STANDING/TIER SYSTEM ====================
export interface TierDefinition {
  tierNumber: number;      // 0, 1, 2, 3...
  favorRequired: number;   // Favor needed to complete this tier
  tierName?: string;       // "Skeptical", "Interested", "Convinced", etc.
}

export interface Standing {
  currentTier: number;           // Current tier level (0 = base)
  favorInCurrentTier: number;    // Progress within current tier
}

export interface CombatResult {
  playerTier: number;
  opponentTier: number;
  maxTier: number;
}

// ==================== CORE ARGUMENTS SYSTEM ====================
export type CoreArgumentTrigger =
  | 'on_card_play'
  | 'on_turn_start'
  | 'on_turn_end'
  | 'on_standing_gain'
  | 'on_tier_advance'
  | 'on_damage_dealt';

export interface CoreArgumentPassiveModifiers {
  standingGainBonus?: number;          // +X standing on gain
  standingGainMultiplier?: number;     // x% standing gains
  opponentStandingDamageBonus?: number; // +X when damaging opponent standing
  patienceCostReduction?: number;      // -X patience costs
  elementCostReduction?: Partial<Record<Element, number>>;
  drawBonus?: number;                  // +X cards per turn
  startingPoise?: number;              // Start turns with X poise
}

export interface CoreArgument {
  id: string;
  name: string;
  description: string;
  element?: Element;

  // Passive modifiers always active
  passiveModifiers?: CoreArgumentPassiveModifiers;

  // Triggered effects
  trigger?: CoreArgumentTrigger;
  // Effect function is defined in the module, not here to avoid circular deps
}

// ==================== INTENTION TYPE ====================
export const INTENTION_TYPE = {
  ATTACK: 'attack',
  STANDING_GAIN: 'standing_gain',      // Opponent gains standing with judge
  STANDING_DAMAGE: 'standing_damage',  // Damages PLAYER's standing
  STALL: 'stall',
  FLUSTERED: 'flustered',
} as const;

export type IntentionType = typeof INTENTION_TYPE[keyof typeof INTENTION_TYPE];

export interface Intention {
  name: string;
  type: IntentionType;
  value: number;
}

export type DrawCardsFunction = (state: GameState, count: number) => GameState;

// ==================== TARGETING SYSTEM ====================
export const TARGET_TYPE = {
  NONE: 'none',
  HAND_CARD: 'hand_card',
  OPPONENT: 'opponent',
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
  targetOpponentId?: string;
}

// ==================== UNIFIED STATUS SYSTEM ====================
export const STATUS_TRIGGER = {
  TURN_START: 'turn_start',
  TURN_END: 'turn_end',
  ON_DAMAGE_RECEIVED: 'on_damage_received',
  ON_INTENTION_EXECUTE: 'on_intention_execute',
  PASSIVE: 'passive',
} as const;

export type StatusTrigger = typeof STATUS_TRIGGER[keyof typeof STATUS_TRIGGER];

export const MODIFIER_STAT = {
  STANDING_GAIN: 'standing_gain',
  PATIENCE_COST: 'patience_cost',
  DAMAGE_RECEIVED: 'damage_received',
  ELEMENT_COST: 'element_cost',
  FAVOR_GAIN_MULTIPLIER: 'favor_gain_multiplier',
  DAMAGE_MODIFIER: 'damage_modifier',
  END_TURN_COST: 'end_turn_cost',
  POISE: 'poise',
  FACE_HEALING: 'face_healing',
} as const;

export type ModifierStat = typeof MODIFIER_STAT[keyof typeof MODIFIER_STAT];

export const MODIFIER_OP = {
  ADD: 'add',
  MULTIPLY: 'multiply',
  SET: 'set',
} as const;

export type ModifierOp = typeof MODIFIER_OP[keyof typeof MODIFIER_OP];

export interface StatusModifier {
  stat: ModifierStat;
  op: ModifierOp;
  value: number;
  element?: Element;
}

export interface Status {
  id: string;
  templateId?: string;            // References StatusTemplate.id when created from template
  name: string;
  description: string;
  owner: 'player' | 'opponent';
  trigger: StatusTrigger;
  turnsRemaining: number;        // -1 = permanent
  triggersRemaining?: number;
  modifiers: StatusModifier[];
  apply?: (state: GameState) => GameState;
  isPositive: boolean;
  tags?: string[];               // 'revealed', 'negate_attack', 'core_argument', 'judge_decree'
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
  statChanges?: { playerFace?: number; playerStanding?: number; opponentStanding?: number; };
}

// ==================== STRUCTURED DESCRIPTION ====================
export interface DescValue {
  value: number;
  noDouble?: boolean; // true for durations that don't double in chaos
}

export type DescriptionPart = string | DescValue;

// ==================== CARD INTERFACE ====================
export interface Card {
  id: string;
  name: string;
  element: Element;
  patienceCost: number;
  faceCost: number;
  description: DescriptionPart[];
  // Legacy closure-based effects (removed after full migration)
  effect: (state: GameState, drawCards?: DrawCardsFunction) => GameState;
  targetedEffect?: (state: GameState, targets: TargetedEffectContext, drawCards?: DrawCardsFunction) => GameState;
  // Data-driven effects (new)
  effects?: import('./effects').EffectDef[];
  targetedEffects?: import('./effects').EffectDef[];
  //
  isBad?: boolean; // Bad cards are removed from game when played
  removeAfterPlay?: boolean; // Fire cards that burn out after use
  targetRequirement?: TargetRequirement;
}

// ==================== SCREEN TYPE ====================
export const SCREEN = {
  MENU: 'menu',
  DECK: 'deck',
  HOW_TO_PLAY: 'how-to-play',
  SETTINGS: 'settings',
  PRE_BATTLE: 'pre-battle',
  BATTLE: 'battle',
  BATTLE_SUMMARY: 'battle-summary',
  CAMPAIGN_MENU: 'campaign-menu',
  CAMPAIGN: 'campaign',
  AVATAR_BUILDER: 'avatar-builder',
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

// ==================== OPPONENT INTERFACE ====================
export interface Opponent {
  id: string;
  name: string;
  face: number;
  maxFace: number;
  standing: Standing;
  currentIntention: Intention | null;
  nextIntention: Intention | null;
  intentionQueue: Intention[];
  coreArgument?: CoreArgument;
  templateName: string;
  statuses: Status[];
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
    playerStanding?: number;     // Standing change
    playerTier?: number;         // Tier change
    playerPoise?: number;
    opponentFace?: number;
    opponentStanding?: number;   // Standing change
    opponentTier?: number;       // Tier change
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
    standing: Standing;                  // Player's standing with judge (tier system)
    poise: number;
    hand: Card[];
    deck: Card[];
    discard: Card[];
    removedFromGame: Card[];
    coreArgument?: CoreArgument;
  };
  judge: {
    name: string;                        // Name of the selected judge
    effects: JudgeEffects;
    tierStructure: TierDefinition[];     // Tier configuration for this judge
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
  // Unified status system
  statuses: Status[];
  // Multi-opponent support
  opponents: Opponent[];
  // Event system
  pendingEvents: GameEvent[];
  // ID generation
  nextId: number;
  // Battle theme (selected at battle start from judge)
  battleTheme?: {
    background: string;    // CSS class
    musicTracks: string[]; // Playlist
  };
}
