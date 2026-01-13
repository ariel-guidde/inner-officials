import { Card, GameState } from '../types/game';

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

export const DEBATE_DECK: Card[] = [
  // --- WOOD (10) ---
  { id: 'w1', name: 'Opening Bow', element: 'wood', patienceCost: 1, faceCost: 0, description: 'Gain 10 Face.', effect: (s) => adjustFace(s, 10) },
  { id: 'w2', name: 'Roots of Logic', element: 'wood', patienceCost: 2, faceCost: 0, description: 'Draw 2 cards.', effect: (s, drawCards) => drawCards ? drawCards(s, 2) : s },
  { id: 'w3', name: 'Bamboo Bend', element: 'wood', patienceCost: 2, faceCost: 0, description: 'Gain 15 Poise.', effect: (s) => adjustPoise(s, 15) },
  { id: 'w4', name: 'Scholar’s Seed', element: 'wood', patienceCost: 1, faceCost: 0, description: 'Gain 8 Favor.', effect: (s) => adjustFavor(s, 8) },
  { id: 'w5', name: 'Twisting Vines', element: 'wood', patienceCost: 2, faceCost: 0, description: 'Reveal AI Intention.', effect: (s) => s },
  { id: 'w6', name: 'Spring Blossom', element: 'wood', patienceCost: 2, faceCost: 0, description: 'Gain 12 Favor.', effect: (s) => adjustFavor(s, 12) },
  { id: 'w7', name: 'Morning Mist', element: 'wood', patienceCost: 1, faceCost: 0, description: 'Gain 5 Face & 5 Poise.', effect: (s) => adjustPoise(adjustFace(s, 5), 5) },
  { id: 'w8', name: 'Shedding Leaves', element: 'wood', patienceCost: 1, faceCost: 0, description: 'Heal 15 Face.', effect: (s) => adjustFace(s, 15) },
  { id: 'w9', name: 'Willow Sway', element: 'wood', patienceCost: 2, faceCost: 0, description: 'Gain 20 Poise.', effect: (s) => adjustPoise(s, 20) },
  { id: 'w10', name: 'Imperial Grove', element: 'wood', patienceCost: 5, faceCost: 0, description: 'Gain 30 Favor.', effect: (s) => adjustFavor(s, 30) },

  // --- FIRE (10) ---
  { id: 'f1', name: 'Blazing Wit', element: 'fire', patienceCost: 2, faceCost: 10, description: 'Gain 20 Favor.', effect: (s) => adjustFavor(s, 20) },
  { id: 'f2', name: 'Searing Insult', element: 'fire', patienceCost: 1, faceCost: 15, description: 'Deal 25 Shame.', effect: (s) => adjustOpponentFace(s, -25) },
  { id: 'f3', name: 'Fan the Flames', element: 'fire', patienceCost: 1, faceCost: 5, description: 'Next card +50% power.', effect: (s) => s },
  { id: 'f4', name: 'Dragon’s Heart', element: 'fire', patienceCost: 3, faceCost: 20, description: 'Gain 40 Favor.', effect: (s) => adjustFavor(s, 40) },
  { id: 'f5', name: 'Flicker of Truth', element: 'fire', patienceCost: 1, faceCost: 8, description: 'Gain 12 Favor.', effect: (s) => adjustFavor(s, 12) },
  { id: 'f6', name: 'Scorched Earth', element: 'fire', patienceCost: 2, faceCost: 12, description: 'Both lose all Poise.', effect: (s) => ({ ...s, player: { ...s.player, poise: 0 } }) },
  { id: 'f7', name: 'Burning Bridges', element: 'fire', patienceCost: 2, faceCost: 15, description: 'Gain 25 Favor.', effect: (s) => adjustFavor(s, 25) },
  { id: 'f8', name: 'Warmth of Favor', element: 'fire', patienceCost: 1, faceCost: 5, description: 'Heal 10 Face.', effect: (s) => adjustFace(s, 10) },
  { id: 'f9', name: 'Cinnabar Spark', element: 'fire', patienceCost: 2, faceCost: 10, description: 'Deal 20 Shame.', effect: (s) => adjustOpponentFace(s, -20) },
  { id: 'f10', name: 'Phoenix Ascent', element: 'fire', patienceCost: 4, faceCost: 25, description: 'Gain 50 Favor.', effect: (s) => adjustFavor(s, 50) },

  // --- EARTH (10) ---
  { id: 'e1', name: 'Mountain Silence', element: 'earth', patienceCost: 3, faceCost: 0, description: 'Gain 30 Poise.', effect: (s) => adjustPoise(s, 30) },
  { id: 'e2', name: 'Stone Stance', element: 'earth', patienceCost: 2, faceCost: 0, description: 'Heal 15 Face.', effect: (s) => adjustFace(s, 15) },
  { id: 'e3', name: 'Jade Tablet', element: 'earth', patienceCost: 2, faceCost: 0, description: 'Gain 10 Favor.', effect: (s) => adjustFavor(s, 10) },
  { id: 'e4', name: 'Dust Settles', element: 'earth', patienceCost: 2, faceCost: 0, description: 'Gain 20 Poise.', effect: (s) => adjustPoise(s, 20) },
  { id: 'e5', name: 'Steady Step', element: 'earth', patienceCost: 1, faceCost: 0, description: 'Gain 10 Poise.', effect: (s) => adjustPoise(s, 10) },
  { id: 'e6', name: 'Terracotta Guard', element: 'earth', patienceCost: 4, faceCost: 0, description: 'Gain 45 Poise.', effect: (s) => adjustPoise(s, 45) },
  { id: 'e7', name: 'Weight of Tradition', element: 'earth', patienceCost: 3, faceCost: 0, description: 'Deal 15 Shame.', effect: (s) => adjustOpponentFace(s, -15) },
  { id: 'e8', name: 'Echoing Silence', element: 'earth', patienceCost: 2, faceCost: 0, description: 'Heal 10 Face.', effect: (s) => adjustFace(s, 10) },
  { id: 'e9', name: 'Solid Ground', element: 'earth', patienceCost: 2, faceCost: 0, description: 'Gain 15 Poise.', effect: (s) => adjustPoise(s, 15) },
  { id: 'e10', name: 'The Great Wall', element: 'earth', patienceCost: 5, faceCost: 0, description: 'Gain 60 Poise.', effect: (s) => adjustPoise(s, 60) },

  // --- METAL (10) ---
  { id: 'm1', name: 'Silver Needle', element: 'metal', patienceCost: 1, faceCost: 8, description: 'Deal 20 Shame.', effect: (s) => adjustOpponentFace(s, -20) },
  { id: 'm2', name: 'Iron Decree', element: 'metal', patienceCost: 3, faceCost: 12, description: 'Deal 35 Shame.', effect: (s) => adjustOpponentFace(s, -35) },
  { id: 'm3', name: 'Mirror Polish', element: 'metal', patienceCost: 2, faceCost: 10, description: 'Gain 20 Poise.', effect: (s) => adjustPoise(s, 20) },
  { id: 'm4', name: 'Gilded Retort', element: 'metal', patienceCost: 2, faceCost: 5, description: 'Gain 15 Favor.', effect: (s) => adjustFavor(s, 15) },
  { id: 'm5', name: 'Cold Logic', element: 'metal', patienceCost: 2, faceCost: 10, description: 'Deal 25 Shame.', effect: (s) => adjustOpponentFace(s, -25) },
  { id: 'm6', name: 'Razor Wit', element: 'metal', patienceCost: 1, faceCost: 10, description: 'Deal 15 Shame.', effect: (s) => adjustOpponentFace(s, -15) },
  { id: 'm7', name: 'Executioner', element: 'metal', patienceCost: 3, faceCost: 20, description: 'Deal 40 Shame.', effect: (s) => adjustOpponentFace(s, -40) },
  { id: 'm8', name: 'Sharp Fan', element: 'metal', patienceCost: 2, faceCost: 8, description: 'Gain 10 Favor & 10 Poise.', effect: (s) => adjustFavor(adjustPoise(s, 10), 10) },
  { id: 'm9', name: 'Resonant Gong', element: 'metal', patienceCost: 2, faceCost: 12, description: 'Deal 30 Shame.', effect: (s) => adjustOpponentFace(s, -30) },
  { id: 'm10', name: 'Pure Steel', element: 'metal', patienceCost: 1, faceCost: 15, description: 'Deal 35 Shame.', effect: (s) => adjustOpponentFace(s, -35) },

  // --- WATER (10) ---
  { id: 'wa1', name: 'Flowing Ink', element: 'water', patienceCost: 2, faceCost: 0, description: 'Draw 2 cards.', effect: (s, drawCards) => drawCards ? drawCards(s, 2) : s },
  { id: 'wa2', name: 'Still Pond', element: 'water', patienceCost: 1, faceCost: 0, description: 'Heal 20 Face.', effect: (s) => adjustFace(s, 20) },
  { id: 'wa3', name: 'Ice Sculpture', element: 'water', patienceCost: 2, faceCost: 0, description: 'Gain 20 Poise.', effect: (s) => adjustPoise(s, 20) },
  { id: 'wa4', name: 'Tidal Wave', element: 'water', patienceCost: 4, faceCost: 0, description: 'Gain 25 Favor.', effect: (s) => adjustFavor(s, 25) },
  { id: 'wa5', name: 'Mist Veil', element: 'water', patienceCost: 2, faceCost: 0, description: 'Gain 15 Poise.', effect: (s) => adjustPoise(s, 15) },
  { id: 'wa6', name: 'Deep Current', element: 'water', patienceCost: 3, faceCost: 0, description: 'Gain 20 Favor.', effect: (s) => adjustFavor(s, 20) },
  { id: 'wa7', name: 'Ebb and Flow', element: 'water', patienceCost: 2, faceCost: 0, description: 'Heal 15 Face.', effect: (s) => adjustFace(s, 15) },
  { id: 'wa8', name: 'Waterfall', element: 'water', patienceCost: 3, faceCost: 0, description: 'Deal 20 Shame.', effect: (s) => adjustOpponentFace(s, -20) },
  { id: 'wa9', name: 'Rain on Thorns', element: 'water', patienceCost: 1, faceCost: 0, description: 'Gain 10 Face.', effect: (s) => adjustFace(s, 10) },
  { id: 'wa10', name: 'Celestial Rain', element: 'water', patienceCost: 5, faceCost: 0, description: 'Gain 35 Favor.', effect: (s) => adjustFavor(s, 35) },
];