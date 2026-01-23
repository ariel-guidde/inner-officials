import { Card, GameState } from '../types/game';
import { addActiveEffect, createFavorGainEffect, createDamageReductionEffect, createHealingEffect, createPoiseGainEffect } from '../lib/effects';
import { addBoardEffect, addIntentionModifier, addRevealEffect } from '../lib/engine';

// Helper functions for card effects
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

// Shuffle discard back into deck
const shuffleDiscardIntoDeck = (s: GameState) => ({
  ...s,
  player: {
    ...s.player,
    deck: [...s.player.deck, ...s.player.discard].sort(() => Math.random() - 0.5),
    discard: [],
  }
});

// Helper to remove a card from hand by id
const removeCardFromHand = (s: GameState, cardId: string): GameState => ({
  ...s,
  player: {
    ...s.player,
    hand: s.player.hand.filter(c => c.id !== cardId),
    discard: [...s.player.discard, ...s.player.hand.filter(c => c.id === cardId)],
  }
});

export const DEBATE_DECK: Card[] = [
  // ==================== WATER (Card & Deck Manipulation) ====================
  // Water is about flow, adaptation, and controlling the pace of the debate
  { id: 'wa1', name: 'Flowing Ink', element: 'water', patienceCost: 2, faceCost: 0,
    description: 'Draw 2 cards.',
    effect: (s, drawCards) => drawCards ? drawCards(s, 2) : s },
  { id: 'wa2', name: 'Tidal Surge', element: 'water', patienceCost: 3, faceCost: 0,
    description: 'Draw 3 cards.',
    effect: (s, drawCards) => drawCards ? drawCards(s, 3) : s },
  { id: 'wa3', name: 'Deep Current', element: 'water', patienceCost: 2, faceCost: 0,
    description: 'Shuffle discard into deck.',
    effect: shuffleDiscardIntoDeck },
  { id: 'wa4', name: 'Ripple Effect', element: 'water', patienceCost: 1, faceCost: 0,
    description: 'Draw 1 card, gain 5 Favor.',
    effect: (s, drawCards) => drawCards ? adjustFavor(drawCards(s, 1), 5) : adjustFavor(s, 5) },
  { id: 'wa5', name: 'Mist Veil', element: 'water', patienceCost: 2, faceCost: 0,
    description: 'Draw 1 card, gain 15 Composure.',
    effect: (s, drawCards) => drawCards ? adjustPoise(drawCards(s, 1), 15) : adjustPoise(s, 15) },
  { id: 'wa6', name: 'Ebb and Flow', element: 'water', patienceCost: 1, faceCost: 0,
    description: 'Draw 1 card.',
    effect: (s, drawCards) => drawCards ? drawCards(s, 1) : s },
  { id: 'wa7', name: 'Whirlpool', element: 'water', patienceCost: 4, faceCost: 0,
    description: 'Draw 4 cards, shuffle discard into deck.',
    effect: (s, drawCards) => drawCards ? drawCards(shuffleDiscardIntoDeck(s), 4) : shuffleDiscardIntoDeck(s) },
  { id: 'wa8', name: 'Still Waters', element: 'water', patienceCost: 1, faceCost: 0,
    description: 'Gain 8 Favor.',
    effect: (s) => adjustFavor(s, 8) },
  // New water card with discard requirement
  { id: 'wa9', name: 'Turbulent Flow', element: 'water', patienceCost: 2, faceCost: 0,
    description: 'Discard a card, then draw 3 cards.',
    effect: (s) => s,
    targetRequirement: {
      type: 'hand_card',
      destination: 'discard',
      selectionMode: 'choose',
      filter: (c, _state) => c.id !== 'wa9',
      isPlayRequirement: true,
      prompt: 'Choose a card to discard',
    },
    targetedEffect: (s, targets, drawCards) => {
      // Card will be discarded by game logic, then draw
      return drawCards ? drawCards(s, 3) : s;
    },
  },
  // New fire card with random burn
  { id: 'f9', name: 'Wildfire', element: 'fire', patienceCost: 2, faceCost: 10,
    description: 'Burn a random card from hand. Deal 30 Shame.',
    effect: (s) => adjustOpponentFace(s, -30),
    targetRequirement: {
      type: 'hand_card',
      destination: 'burn',
      selectionMode: 'random',
      filter: (c, _state) => c.id !== 'f9',
      isPlayRequirement: true,
    },
  },

  // ==================== WOOD (Timed Effects) ====================
  // Wood grows slowly - effects that build over time
  { id: 'w1', name: 'Seeds of Doubt', element: 'wood', patienceCost: 1, faceCost: 0,
    description: 'Gain 6 Favor.',
    effect: (s) => adjustFavor(s, 6) },
  { id: 'w2', name: 'Growing Roots', element: 'wood', patienceCost: 2, faceCost: 0,
    description: 'Gain 5 Favor at end of turn for 3 turns.',
    effect: (s) => addActiveEffect(s, {
      name: 'Growing Roots',
      description: 'Gain 5 Favor at end of turn',
      element: 'wood',
      trigger: 'turn_end',
      remainingTurns: 3,
      apply: createFavorGainEffect(5),
      isPositive: true,
    }) },
  { id: 'w3', name: 'Rooted Argument', element: 'wood', patienceCost: 2, faceCost: 0,
    description: 'Gain 10 Favor and 10 Composure.',
    effect: (s) => adjustPoise(adjustFavor(s, 10), 10) },
  { id: 'w4', name: 'Thick Bark', element: 'wood', patienceCost: 3, faceCost: 0,
    description: 'Next 3 attacks deal 5 less damage.',
    effect: (s) => addActiveEffect(s, {
      name: 'Thick Bark',
      description: 'Next 3 attacks deal 5 less damage',
      element: 'wood',
      trigger: 'on_damage',
      remainingTurns: -1,
      remainingTriggers: 3,
      apply: createDamageReductionEffect(5),
      isPositive: true,
    }) },
  { id: 'w5', name: 'Ancient Oak', element: 'wood', patienceCost: 4, faceCost: 0,
    description: 'Gain 8 Favor at end of turn for 4 turns.',
    effect: (s) => addActiveEffect(s, {
      name: 'Ancient Oak',
      description: 'Gain 8 Favor at end of turn',
      element: 'wood',
      trigger: 'turn_end',
      remainingTurns: 4,
      apply: createFavorGainEffect(8),
      isPositive: true,
    }) },
  { id: 'w6', name: 'Regeneration', element: 'wood', patienceCost: 2, faceCost: 0,
    description: 'Heal 3 Face at start of turn for 4 turns.',
    effect: (s) => addActiveEffect(s, {
      name: 'Regeneration',
      description: 'Heal 3 Face at start of turn',
      element: 'wood',
      trigger: 'turn_start',
      remainingTurns: 4,
      apply: createHealingEffect(3),
      isPositive: true,
    }) },
  { id: 'w7', name: 'Inner Peace', element: 'wood', patienceCost: 3, faceCost: 0,
    description: 'Gain 10 Composure at start of turn for 3 turns.',
    effect: (s) => addActiveEffect(s, {
      name: 'Inner Peace',
      description: 'Gain 10 Composure at start of turn',
      element: 'wood',
      trigger: 'turn_start',
      remainingTurns: 3,
      apply: createPoiseGainEffect(10),
      isPositive: true,
    }) },
  { id: 'w8', name: 'Evergreen', element: 'wood', patienceCost: 5, faceCost: 0,
    description: 'Gain 35 Favor.',
    effect: (s) => adjustFavor(s, 35) },

  // ==================== FIRE (High Cost, Card Burning, Remove from Play) ====================
  // Fire burns bright but consumes - powerful effects that cost face and can discard cards
  { id: 'f1', name: 'Blazing Wit', element: 'fire', patienceCost: 1, faceCost: 12,
    description: 'Gain 25 Favor. Removed after use.',
    effect: (s) => adjustFavor(s, 25), removeAfterPlay: true },
  { id: 'f2', name: 'Purifying Flames', element: 'fire', patienceCost: 1, faceCost: 5,
    description: 'Burn a card. Gain Favor equal to its patience cost x5.',
    effect: (s) => s, // Base effect does nothing, targeted effect handles it
    targetRequirement: {
      type: 'hand_card',
      destination: 'burn',
      selectionMode: 'choose',
      filter: (c, _state) => c.id !== 'f2', // Can't target self
      isPlayRequirement: true, // Must have a card to burn
      prompt: 'Choose a card to burn for Favor',
    },
    targetedEffect: (s, targets, drawCards) => {
      if (!targets.selectedCards || targets.selectedCards.length === 0) return s;
      const targetCard = targets.selectedCards[0];
      const favorGain = targetCard.patienceCost * 5;
      // Card will be burned by the game logic based on destination
      return adjustFavor(s, favorGain);
    },
  },
  { id: 'f3', name: 'Dragons Heart', element: 'fire', patienceCost: 2, faceCost: 20,
    description: 'Gain 45 Favor. Removed after use.',
    effect: (s) => adjustFavor(s, 45), removeAfterPlay: true },
  { id: 'f4', name: 'Volcanic Fury', element: 'fire', patienceCost: 2, faceCost: 18,
    description: 'Deal 40 Shame.',
    effect: (s) => adjustOpponentFace(s, -40) },
  { id: 'f5', name: 'Cleansing Fire', element: 'fire', patienceCost: 2, faceCost: 8,
    description: 'Burn a Bad card from hand. Gain 20 Favor.',
    effect: (s) => s,
    targetRequirement: {
      type: 'hand_card',
      destination: 'burn',
      selectionMode: 'choose',
      filter: (c) => c.isBad === true,
      optional: true,
      prompt: 'Choose a Bad card to burn',
    },
    targetedEffect: (s, targets) => {
      // Card will be burned by game logic, just gain favor if target selected
      if (targets.selectedCards && targets.selectedCards.length > 0) {
        return adjustFavor(s, 20);
      }
      return s;
    },
  },
  { id: 'f6', name: 'Phoenix Ascent', element: 'fire', patienceCost: 3, faceCost: 25,
    description: 'Gain 60 Favor. Removed after use.',
    effect: (s) => adjustFavor(s, 60), removeAfterPlay: true },
  { id: 'f7', name: 'Burning Conviction', element: 'fire', patienceCost: 1, faceCost: 8,
    description: 'Gain 15 Favor.',
    effect: (s) => adjustFavor(s, 15) },
  { id: 'f8', name: 'Inferno', element: 'fire', patienceCost: 2, faceCost: 22,
    description: 'Deal 50 Shame. Removed after use.',
    effect: (s) => adjustOpponentFace(s, -50), removeAfterPlay: true },

  // ==================== METAL (Reveal, Board Effects, Intention Modifiers) ====================
  // Metal is sharp and precise - defensive effects and information control
  { id: 'm1', name: 'Mirror Polish', element: 'metal', patienceCost: 1, faceCost: 0,
    description: 'Reveal opponents next intention.',
    effect: (s) => addRevealEffect(s, 1) },
  { id: 'm2', name: 'Silver Tongue', element: 'metal', patienceCost: 1, faceCost: 3,
    description: 'Gain 8 Favor, reveal next intention.',
    effect: (s) => addRevealEffect(adjustFavor(s, 8), 1) },
  { id: 'm3', name: 'Iron Curtain', element: 'metal', patienceCost: 3, faceCost: 5,
    description: 'Next opponent attack deals no damage.',
    effect: (s) => addBoardEffect(s, {
      name: 'Iron Curtain',
      effectType: 'negate_next_attack',
    }) },
  { id: 'm4', name: 'Deflecting Blade', element: 'metal', patienceCost: 2, faceCost: 5,
    description: 'Next attack deals half damage. Reveal next intention.',
    effect: (s) => {
      let nextState = addIntentionModifier(s, {
        name: 'Deflecting Blade',
        remainingTriggers: 1,
        modify: (intention) => ({
          ...intention,
          value: intention.type === 'attack' ? Math.floor(intention.value / 2) : intention.value,
        }),
      });
      return addRevealEffect(nextState, 1);
    } },
  { id: 'm5', name: 'Gilded Edge', element: 'metal', patienceCost: 1, faceCost: 4,
    description: 'Gain 10 Favor.',
    effect: (s) => adjustFavor(s, 10) },
  { id: 'm6', name: 'Keen Observation', element: 'metal', patienceCost: 1, faceCost: 2,
    description: 'Gain 5 Favor and 10 Composure.',
    effect: (s) => adjustPoise(adjustFavor(s, 5), 10) },
  { id: 'm7', name: 'Calculated Response', element: 'metal', patienceCost: 2, faceCost: 5,
    description: 'Gain 12 Favor, gain 12 Composure.',
    effect: (s) => adjustPoise(adjustFavor(s, 12), 12) },
  { id: 'm8', name: 'Steel Resolve', element: 'metal', patienceCost: 1, faceCost: 0,
    description: 'Gain 15 Composure, reveal next intention.',
    effect: (s) => addRevealEffect(adjustPoise(s, 15), 1) },

  // ==================== EARTH (Composure Specialist) ====================
  // Earth is stable and grounded - the best source of composure
  { id: 'e1', name: 'Mountain Stance', element: 'earth', patienceCost: 1, faceCost: 0,
    description: 'Gain 20 Composure.',
    effect: (s) => adjustPoise(s, 20) },
  { id: 'e2', name: 'Steady Ground', element: 'earth', patienceCost: 2, faceCost: 0,
    description: 'Gain 35 Composure.',
    effect: (s) => adjustPoise(s, 35) },
  { id: 'e3', name: 'Stone Wall', element: 'earth', patienceCost: 3, faceCost: 0,
    description: 'Gain 50 Composure.',
    effect: (s) => adjustPoise(s, 50) },
  { id: 'e4', name: 'Earthquake', element: 'earth', patienceCost: 4, faceCost: 0,
    description: 'Gain 70 Composure.',
    effect: (s) => adjustPoise(s, 70) },
  { id: 'e5', name: 'Grounded Mind', element: 'earth', patienceCost: 1, faceCost: 0,
    description: 'Gain 15 Composure and 5 Favor.',
    effect: (s) => adjustFavor(adjustPoise(s, 15), 5) },
  { id: 'e6', name: 'Jade Composure', element: 'earth', patienceCost: 2, faceCost: 0,
    description: 'Gain 25 Composure and 8 Favor.',
    effect: (s) => adjustFavor(adjustPoise(s, 25), 8) },
  { id: 'e7', name: 'Terracotta Guard', element: 'earth', patienceCost: 3, faceCost: 0,
    description: 'Gain 45 Composure and 10 Favor.',
    effect: (s) => adjustFavor(adjustPoise(s, 45), 10) },
  { id: 'e8', name: 'Unshakeable', element: 'earth', patienceCost: 5, faceCost: 0,
    description: 'Gain 90 Composure.',
    effect: (s) => adjustPoise(s, 90) },
];
