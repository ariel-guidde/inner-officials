import { Card, GameState, ELEMENT, EFFECT_TRIGGER, TARGET_TYPE, CARD_DESTINATION, SELECTION_MODE } from '../types/game';
import { addActiveEffect, createFavorGainEffect, createHealingEffect, createPoiseGainEffect, addRevealEffect } from '../lib/combat';

const adjustOpponentFace = (s: GameState, val: number) => ({
  ...s,
  opponent: { ...s.opponent, face: Math.max(0, s.opponent.face + val) }
});

const adjustFavor = (s: GameState, val: number) => ({
  ...s,
  player: { ...s.player, favor: Math.min(100, s.player.favor + val) }
});

const adjustPoise = (s: GameState, val: number) => ({
  ...s,
  player: { ...s.player, poise: s.player.poise + val }
});

export const DEBATE_DECK: Card[] = [
  // ==================== WATER (Card & Deck Manipulation) ====================
  // Water is about flow, adaptation, and controlling the pace of the debate
  { id: 'wa1', name: 'Flowing Ink', element: ELEMENT.WATER, patienceCost: 1, faceCost: 0,
    description: 'Draw 1 card.',
    effect: (s, drawCards) => drawCards ? drawCards(s, 1) : s },
  { id: 'wa2', name: 'Turbulent Flow', element: ELEMENT.WATER, patienceCost: 2, faceCost: 0,
    description: 'Discard a card, then draw 3 cards.',
    effect: (s) => s,
    targetRequirement: {
      type: TARGET_TYPE.HAND_CARD,
      destination: CARD_DESTINATION.DISCARD,
      selectionMode: SELECTION_MODE.CHOOSE,
      filter: (c, _state) => c.id !== 'wa2',
      isPlayRequirement: true,
      prompt: 'Choose a card to discard',
    },
    targetedEffect: (s, targets, drawCards) => {
      return drawCards ? drawCards(s, 3) : s;
    },
  },

  // ==================== WOOD (Timed Effects) ====================
  // Wood grows slowly - effects that build over time
  { id: 'w1', name: 'Growing Roots', element: ELEMENT.WOOD, patienceCost: 2, faceCost: 0,
    description: 'Gain 5 Favor at end of turn for 3 turns.',
    effect: (s) => addActiveEffect(s, {
      name: 'Growing Roots',
      description: 'Gain 5 Favor at end of turn',
      element: ELEMENT.WOOD,
      trigger: EFFECT_TRIGGER.TURN_END,
      remainingTurns: 3,
      apply: createFavorGainEffect(5),
      isPositive: true,
    }) },
  { id: 'w2', name: 'Thick Bark', element: ELEMENT.WOOD, patienceCost: 3, faceCost: 0,
    description: 'Gain 5 Composure at the end of turn for 3 turns.',
    effect: (s) => addActiveEffect(s, {
      name: 'Thick Bark',
      description: 'Gain 5 Composure at the end of turn',
      element: ELEMENT.WOOD,
      trigger: EFFECT_TRIGGER.TURN_END,
      remainingTurns: 3,
      apply: createPoiseGainEffect(5),
      isPositive: true,
  }) },
  { id: 'w3', name: 'Regeneration', element: ELEMENT.WOOD, patienceCost: 2, faceCost: 0,
    description: 'Heal 3 Face at start of turn for 4 turns.',
    effect: (s) => addActiveEffect(s, {
      name: 'Regeneration',
      description: 'Heal 3 Face at start of turn',
      element: ELEMENT.WOOD,
      trigger: EFFECT_TRIGGER.TURN_START,
      remainingTurns: 4,
      apply: createHealingEffect(3),
      isPositive: true,
    }) },

  // ==================== FIRE (High Cost, Card Burning, Remove from Play) ====================
  // Fire burns bright but consumes - powerful effects that cost face and can discard cards
  { id: 'f1', name: 'Purifying Flames', element: ELEMENT.FIRE, patienceCost: 1, faceCost: 0,
    description: 'Burn a card. Gain Favor equal to its Patience cost x5.',
    effect: (s) => s,
    targetRequirement: {
      type: TARGET_TYPE.HAND_CARD,
      destination: CARD_DESTINATION.BURN,
      selectionMode: SELECTION_MODE.CHOOSE,
      filter: (c, _state) => c.id !== 'f1',
      isPlayRequirement: true,
      prompt: 'Choose a card to burn for Favor',
    },
    targetedEffect: (s, targets, drawCards) => {
      if (!targets.selectedCards || targets.selectedCards.length === 0) return s;
      const targetCard = targets.selectedCards[0];
      const favorGain = targetCard.patienceCost * 5;
      return adjustFavor(s, favorGain);
    },
  },
  { id: 'f2', name: 'Volcanic Fury', element: ELEMENT.FIRE, patienceCost: 1, faceCost: 10,
    description: 'Deal 20 Shame.',
    effect: (s) => adjustOpponentFace(s, -20) },
  { id: 'f3', name: 'Cleansing Fire', element: ELEMENT.FIRE, patienceCost: 1, faceCost: 0,
    description: 'Burn a card from hand. Gain 5 Composure.',
    effect: (s) => s,
    targetRequirement: {
      type: TARGET_TYPE.HAND_CARD,
      destination: CARD_DESTINATION.BURN,
      selectionMode: SELECTION_MODE.CHOOSE,
      filter: (c, _state) => c.id !== 'f5',
      isPlayRequirement: true,
      prompt: 'Choose a card to burn for Composure',
    },
    targetedEffect: (s, targets) => {
      if (targets.selectedCards && targets.selectedCards.length > 0) {
        return adjustPoise(s, 5);
      }
      return s;
    },
  },
  { id: 'f4', name: 'Wildfire', element: ELEMENT.FIRE, patienceCost: 1, faceCost: 5,
    description: 'Burn a random card from hand. Deal 30 Shame.',
    effect: (s) => adjustOpponentFace(s, -30),
    targetRequirement: {
      type: TARGET_TYPE.HAND_CARD,
      destination: CARD_DESTINATION.BURN,
      selectionMode: SELECTION_MODE.RANDOM,
      filter: (c, _state) => c.id !== 'f4',
      isPlayRequirement: true,
    },
  },

  // ==================== METAL (Reveal, Board Effects, Intention Modifiers) ====================
  // Metal is sharp and precise - defensive effects and information control
  { id: 'm1', name: 'Mirror Polish', element: ELEMENT.METAL, patienceCost: 1, faceCost: 0,
    description: 'Reveal opponents next intention.',
    effect: (s) => addRevealEffect(s, 1) },
  { id: 'm2', name: 'Silver Tongue', element: ELEMENT.METAL, patienceCost: 1, faceCost: 3,
    description: 'Gain 8 Favor, reveal next intention.',
    effect: (s) => addRevealEffect(adjustFavor(s, 8), 1) },
  { id: 'm5', name: 'Gilded Edge', element: ELEMENT.METAL, patienceCost: 1, faceCost: 4,
    description: 'Gain 10 Favor.',
    effect: (s) => adjustFavor(s, 10) },
  { id: 'm6', name: 'Keen Observation', element: ELEMENT.METAL, patienceCost: 1, faceCost: 4,
    description: 'Gain 5 Favor and deal 10 Shame.',
    effect: (s) => adjustFavor(adjustOpponentFace(s, -10), 5) },

  // ==================== EARTH (Composure Specialist) ====================
  // Earth is stable and grounded - the best source of composure
  { id: 'e1', name: 'Mountain Stance', element: ELEMENT.EARTH, patienceCost: 1, faceCost: 0,
    description: 'Gain 3 Composure.',
    effect: (s) => adjustPoise(s, 3) },
  { id: 'e2', name: 'Steady Ground', element: ELEMENT.EARTH, patienceCost: 2, faceCost: 0,
    description: 'Gain 8 Composure.',
    effect: (s) => adjustPoise(s, 8) },
];
