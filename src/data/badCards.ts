import { Card, GameState, Element } from '../types/game';

// Bad cards that can be generated when drawing while face is low
// These cards cost patience/face but have no benefit
// They are removed from the game when played

const ELEMENTS: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];

const BAD_CARD_TEMPLATES: Omit<Card, 'id' | 'element'>[] = [
  {
    name: 'Nervous Stammer',
    patienceCost: 2,
    faceCost: 0,
    description: 'You falter. No effect.',
    effect: (s: GameState) => s,
    isBad: true,
  },
  {
    name: 'Sweaty Palms',
    patienceCost: 1,
    faceCost: 5,
    description: 'Lose composure. No effect.',
    effect: (s: GameState) => s,
    isBad: true,
  },
  {
    name: 'Blank Mind',
    patienceCost: 3,
    faceCost: 0,
    description: 'Your mind goes blank. No effect.',
    effect: (s: GameState) => s,
    isBad: true,
  },
  {
    name: 'Trembling Voice',
    patienceCost: 2,
    faceCost: 3,
    description: 'Your voice wavers. No effect.',
    effect: (s: GameState) => s,
    isBad: true,
  },
  {
    name: 'Awkward Silence',
    patienceCost: 1,
    faceCost: 0,
    description: 'An uncomfortable pause. No effect.',
    effect: (s: GameState) => s,
    isBad: true,
  },
  {
    name: 'Misspoken Word',
    patienceCost: 2,
    faceCost: 5,
    description: 'You say the wrong thing. No effect.',
    effect: (s: GameState) => s,
    isBad: true,
  },
  {
    name: 'Lost Train of Thought',
    patienceCost: 2,
    faceCost: 0,
    description: 'Where was I? No effect.',
    effect: (s: GameState) => s,
    isBad: true,
  },
  {
    name: 'Visible Panic',
    patienceCost: 1,
    faceCost: 8,
    description: 'Your fear shows. No effect.',
    effect: (s: GameState) => s,
    isBad: true,
  },
];

let badCardCounter = 0;

export function generateBadCard(): Card {
  const template = BAD_CARD_TEMPLATES[Math.floor(Math.random() * BAD_CARD_TEMPLATES.length)];
  const element = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
  badCardCounter++;

  return {
    ...template,
    id: `bad_${badCardCounter}_${Date.now()}`,
    element,
  };
}

// Returns true if a bad card should be generated based on face percentage
// Up to 75% chance at 0 face
export function shouldGenerateBadCard(currentFace: number, maxFace: number): boolean {
  const facePercent = currentFace / maxFace;
  const missingPercent = 1 - facePercent;
  // Cap at 75% chance
  const badCardChance = Math.min(0.75, missingPercent);
  return Math.random() < badCardChance;
}
