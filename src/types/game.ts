export type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export interface Intention {
  name: string;
  type: 'attack' | 'favor' | 'stall' | 'shocked';
  value: number;
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
}

export type Screen = 'menu' | 'deck' | 'how-to-play' | 'battle';

export interface GameState {
  player: {
    face: number;
    maxFace: number;
    favor: number;
    poise: number;
    hand: Card[];
    deck: Card[];
    discard: Card[];
  };
  opponent: {
    name: string;
    face: number;
    maxFace: number;
    favor: number;
    isShocked: number; 
    currentIntention: Intention | null;
  };
  patience: number;
  lastElement: Element | null;
  history: Element[];
  isGameOver: boolean;
  winner: 'player' | 'opponent' | null;
}