import { Card, GameState, ELEMENT } from '../types/game';

// Bad cards that can be generated when drawing while face is low
// These cards cost patience/face but have no benefit
// They are removed from the game when played

const ELEMENTS = Object.values(ELEMENT);

const BAD_CARD_TEMPLATES: Omit<Card, 'id' | 'element'>[] = [
  {
    name: 'Nervous Stammer',
    patienceCost: 1,
    faceCost: 3,
    description: ['You falter. No effect.'],
    effect: (s: GameState) => s,
    isBad: true,
  },
  {
    name: 'Sweaty Palms',
    patienceCost: 0,
    faceCost: 3,
    description: ['Lose composure. No effect.'],
    effect: (s: GameState) => s,
    isBad: true,
  },
  {
    name: 'Trembling Voice',
    patienceCost: 1,
    faceCost: 3,
    description: ['Your voice wavers. No effect.'],
    effect: (s: GameState) => s,
    isBad: true,
  },
  {
    name: 'Awkward Silence',
    patienceCost: 4,
    faceCost: 0,
    description: ['An uncomfortable pause. No effect.'],
    effect: (s: GameState) => s,
    isBad: true,
  }
];

let badCardCounter = 0;

export function generateBadCard(): Card {
  const template = BAD_CARD_TEMPLATES[Math.floor(Math.random() * BAD_CARD_TEMPLATES.length)];
  const element = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
  badCardCounter++;

  return {
    ...template,
    id: `bad_${badCardCounter}`,
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
