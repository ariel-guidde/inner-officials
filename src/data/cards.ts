import { Card, GameState, ELEMENT, TARGET_TYPE, CARD_DESTINATION, SELECTION_MODE, STATUS_TRIGGER } from '../types/game';
import { addStanding } from '../lib/combat/modules/standing';
import { addStatus, addRevealStatus } from '../lib/combat/modules/statuses';
import { updateOpponent, syncLegacyOpponent } from '../lib/combat/modules/opponent';

/** Adjust face of a targeted opponent (or first opponent if no target) */
const adjustTargetFace = (s: GameState, val: number, targetOpponentId?: string): GameState => {
  const targetId = targetOpponentId ?? s.opponents[0]?.id;
  if (!targetId) return s;
  let next = updateOpponent(s, targetId, (o) => ({
    ...o,
    face: Math.max(0, o.face + val),
  }));
  next = syncLegacyOpponent(next);
  return next;
};

// Add standing to player (replaces adjustFavor)
const gainStanding = (s: GameState, val: number) => addStanding(s, 'player', val);

const adjustPoise = (s: GameState, val: number) => ({
  ...s,
  player: { ...s.player, poise: s.player.poise + val }
});

export const DEBATE_DECK: Card[] = [
  // ==================== WATER (Card & Deck Manipulation) ====================
  // Water is about flow, adaptation, and controlling the pace of the debate
  { id: 'wa1', name: 'Flowing Ink', element: ELEMENT.WATER, patienceCost: 1, faceCost: 0,
    description: ['Draw ', { value: 1 }, ' card.'],
    effect: (s, drawCards) => drawCards ? drawCards(s, 1) : s },
  { id: 'wa2', name: 'Turbulent Flow', element: ELEMENT.WATER, patienceCost: 2, faceCost: 0,
    description: ['Discard a card, then draw ', { value: 3 }, ' cards.'],
    effect: (s) => s,
    targetRequirement: {
      type: TARGET_TYPE.HAND_CARD,
      destination: CARD_DESTINATION.DISCARD,
      selectionMode: SELECTION_MODE.CHOOSE,
      filter: (c, _state) => c.id !== 'wa2',
      isPlayRequirement: true,
      prompt: 'Choose a card to discard',
    },
    targetedEffect: (s, _targets, drawCards) => {
      return drawCards ? drawCards(s, 3) : s;
    },
  },

  // ==================== WOOD (Timed Effects) ====================
  // Wood grows slowly - effects that build over time
  { id: 'w1', name: 'Growing Roots', element: ELEMENT.WOOD, patienceCost: 2, faceCost: 0,
    description: ['Gain ', { value: 5 }, ' Standing at end of turn for ', { value: 3, noDouble: true }, ' turns.'],
    effect: (s) => addStatus(s, {
      name: 'Growing Roots',
      description: 'Gain 5 Standing at end of turn',
      owner: 'player',
      trigger: STATUS_TRIGGER.TURN_END,
      turnsRemaining: 3,
      modifiers: [],
      apply: (state) => addStanding(state, 'player', 5),
      isPositive: true,
      tags: ['wood'],
    }) },
  { id: 'w2', name: 'Thick Bark', element: ELEMENT.WOOD, patienceCost: 3, faceCost: 0,
    description: ['Gain ', { value: 5 }, ' Composure at the end of turn for ', { value: 3, noDouble: true }, ' turns.'],
    effect: (s) => addStatus(s, {
      name: 'Thick Bark',
      description: 'Gain 5 Composure at the end of turn',
      owner: 'player',
      trigger: STATUS_TRIGGER.TURN_END,
      turnsRemaining: 3,
      modifiers: [],
      apply: (state) => ({ ...state, player: { ...state.player, poise: state.player.poise + 5 } }),
      isPositive: true,
      tags: ['wood'],
    }) },
  { id: 'w3', name: 'Regeneration', element: ELEMENT.WOOD, patienceCost: 2, faceCost: 0,
    description: ['Heal ', { value: 3 }, ' Face at start of turn for ', { value: 4, noDouble: true }, ' turns.'],
    effect: (s) => addStatus(s, {
      name: 'Regeneration',
      description: 'Heal 3 Face at start of turn',
      owner: 'player',
      trigger: STATUS_TRIGGER.TURN_START,
      turnsRemaining: 4,
      modifiers: [],
      apply: (state) => ({ ...state, player: { ...state.player, face: Math.min(state.player.maxFace, state.player.face + 3) } }),
      isPositive: true,
      tags: ['wood'],
    }) },

  // ==================== FIRE (High Cost, Card Burning, Remove from Play) ====================
  // Fire burns bright but consumes - powerful effects that cost face and can discard cards
  { id: 'f1', name: 'Purifying Flames', element: ELEMENT.FIRE, patienceCost: 1, faceCost: 0,
    description: ['Burn a card. Gain Standing equal to its Patience cost x', { value: 5 }, '.'],
    effect: (s) => s,
    targetRequirement: {
      type: TARGET_TYPE.HAND_CARD,
      destination: CARD_DESTINATION.BURN,
      selectionMode: SELECTION_MODE.CHOOSE,
      filter: (c, _state) => c.id !== 'f1',
      isPlayRequirement: true,
      prompt: 'Choose a card to burn for Standing',
    },
    targetedEffect: (s, targets, _drawCards) => {
      if (!targets.selectedCards || targets.selectedCards.length === 0) return s;
      const targetCard = targets.selectedCards[0];
      const standingGain = targetCard.patienceCost * 5;
      return gainStanding(s, standingGain);
    },
  },
  { id: 'f2', name: 'Volcanic Fury', element: ELEMENT.FIRE, patienceCost: 1, faceCost: 10,
    description: ['Deal ', { value: 20 }, ' Shame.'],
    effect: (s) => s,
    targetRequirement: { type: TARGET_TYPE.OPPONENT },
    targetedEffect: (s, targets) => adjustTargetFace(s, -20, targets.targetOpponentId) },
  { id: 'f3', name: 'Cleansing Fire', element: ELEMENT.FIRE, patienceCost: 1, faceCost: 0,
    description: ['Burn a card from hand. Gain ', { value: 5 }, ' Composure.'],
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
    description: ['Burn a random card from hand. Deal ', { value: 30 }, ' Shame.'],
    effect: (s) => s,
    targetRequirement: { type: TARGET_TYPE.OPPONENT },
    targetedEffect: (s, targets, _drawCards) => {
      // Random burn is handled separately since it has both hand and opponent targeting
      const handCards = s.player.hand.filter(c => c.id !== 'f4');
      if (handCards.length > 0) {
        const randomIndex = Math.floor(Math.random() * handCards.length);
        const burnCard = handCards[randomIndex];
        s = {
          ...s,
          player: {
            ...s.player,
            hand: s.player.hand.filter(c => c.id !== burnCard.id),
            removedFromGame: [...s.player.removedFromGame, burnCard],
          },
        };
      }
      return adjustTargetFace(s, -30, targets.targetOpponentId);
    },
  },

  // ==================== METAL (Reveal, Board Effects, Intention Modifiers) ====================
  // Metal is sharp and precise - defensive effects and information control
  { id: 'm1', name: 'Mirror Polish', element: ELEMENT.METAL, patienceCost: 1, faceCost: 0,
    description: ['Reveal ', { value: 1 }, ' opponent intention.'],
    effect: (s) => s,
    targetRequirement: { type: TARGET_TYPE.OPPONENT },
    targetedEffect: (s, targets) => targets.targetOpponentId ? addRevealStatus(s, targets.targetOpponentId, 1) : s },
  { id: 'm2', name: 'Silver Tongue', element: ELEMENT.METAL, patienceCost: 1, faceCost: 3,
    description: ['Gain ', { value: 8 }, ' Standing, reveal ', { value: 1 }, ' intention.'],
    effect: (s) => gainStanding(s, 8),
    targetRequirement: { type: TARGET_TYPE.OPPONENT },
    targetedEffect: (s, targets) => targets.targetOpponentId ? addRevealStatus(s, targets.targetOpponentId, 1) : s },
  { id: 'm5', name: 'Gilded Edge', element: ELEMENT.METAL, patienceCost: 1, faceCost: 4,
    description: ['Gain ', { value: 10 }, ' Standing.'],
    effect: (s) => gainStanding(s, 10) },
  { id: 'm6', name: 'Keen Observation', element: ELEMENT.METAL, patienceCost: 1, faceCost: 4,
    description: ['Gain ', { value: 5 }, ' Standing and deal ', { value: 10 }, ' Shame.'],
    effect: (s) => gainStanding(s, 5),
    targetRequirement: { type: TARGET_TYPE.OPPONENT },
    targetedEffect: (s, targets) => adjustTargetFace(s, -10, targets.targetOpponentId) },

  // ==================== EARTH (Composure Specialist) ====================
  // Earth is stable and grounded - the best source of composure
  { id: 'e1', name: 'Mountain Stance', element: ELEMENT.EARTH, patienceCost: 1, faceCost: 0,
    description: ['Gain ', { value: 3 }, ' Composure.'],
    effect: (s) => adjustPoise(s, 3) },
  { id: 'e2', name: 'Steady Ground', element: ELEMENT.EARTH, patienceCost: 2, faceCost: 0,
    description: ['Gain ', { value: 8 }, ' Composure.'],
    effect: (s) => adjustPoise(s, 8) },
];
