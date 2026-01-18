import { Card, GameState } from '../types/game';

// Helper functions for card effects
const adjustFace = (s: GameState, val: number) => ({
  ...s,
  player: { ...s.player, face: Math.min(s.player.maxFace, Math.max(0, s.player.face + val)) }
});

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

const revealNextIntention = (s: GameState) => ({
  ...s,
  player: { ...s.player, canSeeNextIntention: true }
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

  // ==================== WOOD (Long-term / Gradual Effects) ====================
  // Wood grows slowly but surely - favor generation and steady progress
  { id: 'w1', name: 'Seeds of Doubt', element: 'wood', patienceCost: 1, faceCost: 0,
    description: 'Gain 6 Favor.',
    effect: (s) => adjustFavor(s, 6) },
  { id: 'w2', name: 'Bamboo Patience', element: 'wood', patienceCost: 2, faceCost: 0,
    description: 'Gain 12 Favor.',
    effect: (s) => adjustFavor(s, 12) },
  { id: 'w3', name: 'Rooted Argument', element: 'wood', patienceCost: 2, faceCost: 0,
    description: 'Gain 10 Favor and 10 Composure.',
    effect: (s) => adjustPoise(adjustFavor(s, 10), 10) },
  { id: 'w4', name: 'Spring Blossom', element: 'wood', patienceCost: 3, faceCost: 0,
    description: 'Gain 18 Favor.',
    effect: (s) => adjustFavor(s, 18) },
  { id: 'w5', name: 'Ancient Oak', element: 'wood', patienceCost: 4, faceCost: 0,
    description: 'Gain 25 Favor.',
    effect: (s) => adjustFavor(s, 25) },
  { id: 'w6', name: 'Willow Grace', element: 'wood', patienceCost: 2, faceCost: 0,
    description: 'Heal 3 Face, gain 8 Favor.',
    effect: (s) => adjustFavor(adjustFace(s, 3), 8) },
  { id: 'w7', name: 'Forest Canopy', element: 'wood', patienceCost: 3, faceCost: 0,
    description: 'Gain 15 Favor and 15 Composure.',
    effect: (s) => adjustPoise(adjustFavor(s, 15), 15) },
  { id: 'w8', name: 'Evergreen', element: 'wood', patienceCost: 5, faceCost: 0,
    description: 'Gain 35 Favor.',
    effect: (s) => adjustFavor(s, 35) },

  // ==================== FIRE (High Cost, High Reward, Remove from Play) ====================
  // Fire burns bright but consumes - powerful effects that cost face
  { id: 'f1', name: 'Blazing Wit', element: 'fire', patienceCost: 1, faceCost: 12,
    description: 'Gain 25 Favor. Removed after use.',
    effect: (s) => adjustFavor(s, 25), removeAfterPlay: true },
  { id: 'f2', name: 'Searing Insult', element: 'fire', patienceCost: 1, faceCost: 15,
    description: 'Deal 30 Shame.',
    effect: (s) => adjustOpponentFace(s, -30) },
  { id: 'f3', name: 'Dragons Heart', element: 'fire', patienceCost: 2, faceCost: 20,
    description: 'Gain 45 Favor. Removed after use.',
    effect: (s) => adjustFavor(s, 45), removeAfterPlay: true },
  { id: 'f4', name: 'Volcanic Fury', element: 'fire', patienceCost: 2, faceCost: 18,
    description: 'Deal 40 Shame.',
    effect: (s) => adjustOpponentFace(s, -40) },
  { id: 'f5', name: 'Scorched Earth', element: 'fire', patienceCost: 1, faceCost: 10,
    description: 'Deal 20 Shame.',
    effect: (s) => adjustOpponentFace(s, -20) },
  { id: 'f6', name: 'Phoenix Ascent', element: 'fire', patienceCost: 3, faceCost: 25,
    description: 'Gain 60 Favor. Removed after use.',
    effect: (s) => adjustFavor(s, 60), removeAfterPlay: true },
  { id: 'f7', name: 'Burning Conviction', element: 'fire', patienceCost: 1, faceCost: 8,
    description: 'Gain 15 Favor.',
    effect: (s) => adjustFavor(s, 15) },
  { id: 'f8', name: 'Inferno', element: 'fire', patienceCost: 2, faceCost: 22,
    description: 'Deal 50 Shame. Removed after use.',
    effect: (s) => adjustOpponentFace(s, -50), removeAfterPlay: true },

  // ==================== METAL (Reveal, Precision, Low Cost) ====================
  // Metal is sharp and precise - small efficient effects and information
  { id: 'm1', name: 'Mirror Polish', element: 'metal', patienceCost: 1, faceCost: 0,
    description: 'Reveal opponents next intention.',
    effect: revealNextIntention },
  { id: 'm2', name: 'Silver Tongue', element: 'metal', patienceCost: 1, faceCost: 3,
    description: 'Gain 8 Favor, reveal next intention.',
    effect: (s) => revealNextIntention(adjustFavor(s, 8)) },
  { id: 'm3', name: 'Surgical Strike', element: 'metal', patienceCost: 1, faceCost: 5,
    description: 'Deal 12 Shame.',
    effect: (s) => adjustOpponentFace(s, -12) },
  { id: 'm4', name: 'Cold Logic', element: 'metal', patienceCost: 2, faceCost: 6,
    description: 'Deal 15 Shame, reveal next intention.',
    effect: (s) => revealNextIntention(adjustOpponentFace(s, -15)) },
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
    effect: (s) => revealNextIntention(adjustPoise(s, 15)) },

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
