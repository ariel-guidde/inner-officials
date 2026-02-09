import { CoreArgument, ELEMENT } from '../types/game';

/**
 * Core Arguments are special non-playable cards that define deck strategy.
 * One core argument is selected before each combat.
 * Player sees opponent/judge before selecting.
 */
export const CORE_ARGUMENTS: CoreArgument[] = [
  // Fire-aligned core arguments
  {
    id: 'ca_righteous_fury',
    name: 'Righteous Fury',
    description: '+3 standing when you deal face damage',
    element: ELEMENT.FIRE,
    trigger: 'on_damage_dealt',
    passiveModifiers: {
      standingGainBonus: 3,
    },
  },
  {
    id: 'ca_burning_conviction',
    name: 'Burning Conviction',
    description: 'Fire cards cost -1 patience. Start with 2 poise each turn.',
    element: ELEMENT.FIRE,
    passiveModifiers: {
      elementCostReduction: { [ELEMENT.FIRE]: 1 },
      startingPoise: 2,
    },
  },

  // Wood-aligned core arguments
  {
    id: 'ca_scholarly_patience',
    name: 'Scholarly Patience',
    description: 'Wood cards cost -1 patience. Start with 3 poise each turn.',
    element: ELEMENT.WOOD,
    passiveModifiers: {
      elementCostReduction: { [ELEMENT.WOOD]: 1 },
      startingPoise: 3,
    },
  },
  {
    id: 'ca_deep_roots',
    name: 'Deep Roots',
    description: '+2 standing at the start of each turn.',
    element: ELEMENT.WOOD,
    trigger: 'on_turn_start',
    passiveModifiers: {
      standingGainBonus: 2,
    },
  },

  // Water-aligned core arguments
  {
    id: 'ca_silver_tongue',
    name: 'Silver Tongue',
    description: 'Draw +1 card per turn. Water cards cost -1 patience.',
    element: ELEMENT.WATER,
    passiveModifiers: {
      drawBonus: 1,
      elementCostReduction: { [ELEMENT.WATER]: 1 },
    },
  },
  {
    id: 'ca_adaptive_flow',
    name: 'Adaptive Flow',
    description: '+4 standing whenever you advance a tier.',
    element: ELEMENT.WATER,
    trigger: 'on_tier_advance',
    passiveModifiers: {
      standingGainBonus: 4,
    },
  },

  // Earth-aligned core arguments
  {
    id: 'ca_stoic_defense',
    name: 'Stoic Defense',
    description: 'When opponent gains standing, gain 2 poise.',
    element: ELEMENT.EARTH,
    trigger: 'on_standing_gain',
    passiveModifiers: {
      startingPoise: 2,
    },
  },
  {
    id: 'ca_immovable_mountain',
    name: 'Immovable Mountain',
    description: 'Earth cards cost -1 patience. Start with 5 poise each turn.',
    element: ELEMENT.EARTH,
    passiveModifiers: {
      elementCostReduction: { [ELEMENT.EARTH]: 1 },
      startingPoise: 5,
    },
  },

  // Metal-aligned core arguments
  {
    id: 'ca_sharp_wit',
    name: 'Sharp Wit',
    description: 'Metal cards cost -1 patience. +2 when damaging opponent standing.',
    element: ELEMENT.METAL,
    passiveModifiers: {
      elementCostReduction: { [ELEMENT.METAL]: 1 },
      opponentStandingDamageBonus: 2,
    },
  },
  {
    id: 'ca_iron_will',
    name: 'Iron Will',
    description: 'All patience costs reduced by 1 (minimum 1).',
    element: ELEMENT.METAL,
    passiveModifiers: {
      patienceCostReduction: 1,
    },
  },

  // Neutral core arguments
  {
    id: 'ca_imperial_mandate',
    name: 'Imperial Mandate',
    description: '50% more standing from all sources.',
    passiveModifiers: {
      standingGainMultiplier: 1.5,
    },
  },
  {
    id: 'ca_balanced_approach',
    name: 'Balanced Approach',
    description: '+2 standing at end of turn. Draw +1 card per turn.',
    trigger: 'on_turn_end',
    passiveModifiers: {
      standingGainBonus: 2,
      drawBonus: 1,
    },
  },
];

/**
 * Get a core argument by ID
 */
export function getCoreArgumentById(id: string): CoreArgument | undefined {
  return CORE_ARGUMENTS.find(ca => ca.id === id);
}

/**
 * Get core arguments filtered by element
 */
export function getCoreArgumentsByElement(element: typeof ELEMENT[keyof typeof ELEMENT]): CoreArgument[] {
  return CORE_ARGUMENTS.filter(ca => ca.element === element);
}
