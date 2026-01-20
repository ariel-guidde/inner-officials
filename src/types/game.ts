export type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export interface Intention {
  name: string;
  type: 'attack' | 'favor' | 'stall' | 'flustered';
  value: number;
  patienceThreshold: number; // Patience spent until this action executes
}

export type DrawCardsFunction = (state: GameState, count: number) => GameState;

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

export type TurnPhase = 'player_action' | 'resolving' | 'opponent_turn' | 'drawing';

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
}
