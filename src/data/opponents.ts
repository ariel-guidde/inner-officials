import { Intention, INTENTION_TYPE, ELEMENT } from '../types/game';

export interface OpponentTemplate {
  name: string;
  maxFace: number;
  intentions: Intention[];
}

// Flustered effects - pushed to top of intention queue when opponent's face is broken
export const FLUSTERED_EFFECTS: Intention[] = [
  { name: "Stammering", type: INTENTION_TYPE.FLUSTERED, value: 0, patienceThreshold: 3 },
  { name: "Losing Composure", type: INTENTION_TYPE.FLUSTERED, value: 0, patienceThreshold: 4 },
  { name: "Red-Faced", type: INTENTION_TYPE.FLUSTERED, value: 0, patienceThreshold: 2 },
  { name: "Caught Off-Guard", type: INTENTION_TYPE.FLUSTERED, value: 0, patienceThreshold: 5 },
  { name: "Tongue-Tied", type: INTENTION_TYPE.FLUSTERED, value: 0, patienceThreshold: 3 },
];

export const OPPONENTS: OpponentTemplate[] = [
  {
    name: "The Concubine",
    maxFace: 35,
    intentions: [
      { name: "Seductive Wit", type: INTENTION_TYPE.FAVOR, value: 20, patienceThreshold: 6 },
      { name: "Whispered Rumors", type: INTENTION_TYPE.FAVOR, value: 12, patienceThreshold: 4 },
      { name: "Hidden Dagger", type: INTENTION_TYPE.ATTACK, value: 15, patienceThreshold: 8 },
      { name: "Crocodile Tears", type: INTENTION_TYPE.STALL, value: 4, patienceThreshold: 5 },
    ]
  },
  {
    name: "The Scholar",
    maxFace: 30,
    intentions: [
      { name: "Cutting Logic", type: INTENTION_TYPE.ATTACK, value: 12, patienceThreshold: 5 },
      { name: "Citation of Precedent", type: INTENTION_TYPE.FAVOR, value: 15, patienceThreshold: 6 },
      { name: "Pedantic Delay", type: INTENTION_TYPE.STALL, value: 6, patienceThreshold: 7 },
      { name: "Scholarly Rebuke", type: INTENTION_TYPE.ATTACK, value: 8, patienceThreshold: 4 },
    ]
  },
  {
    name: "The General",
    maxFace: 50,
    intentions: [
      { name: "Heavy Rebuke", type: INTENTION_TYPE.ATTACK, value: 25, patienceThreshold: 10 },
      { name: "Military Discipline", type: INTENTION_TYPE.ATTACK, value: 15, patienceThreshold: 6 },
      { name: "Imperial Authority", type: INTENTION_TYPE.FAVOR, value: 18, patienceThreshold: 7 },
      { name: "Strategic Patience", type: INTENTION_TYPE.STALL, value: 8, patienceThreshold: 12 },
    ]
  },
  {
    name: "The Eunuch",
    maxFace: 25,
    intentions: [
      { name: "Palace Gossip", type: INTENTION_TYPE.FAVOR, value: 25, patienceThreshold: 8 },
      { name: "Subtle Poison", type: INTENTION_TYPE.ATTACK, value: 10, patienceThreshold: 5 },
      { name: "Bureaucratic Obstruction", type: INTENTION_TYPE.STALL, value: 5, patienceThreshold: 4 },
      { name: "Whisper Campaign", type: INTENTION_TYPE.FAVOR, value: 15, patienceThreshold: 6 },
    ]
  },
  {
    name: "The Empress",
    maxFace: 60,
    intentions: [
      { name: "Imperial Decree", type: INTENTION_TYPE.FAVOR, value: 30, patienceThreshold: 12 },
      { name: "Royal Displeasure", type: INTENTION_TYPE.ATTACK, value: 20, patienceThreshold: 9 },
      { name: "Endless Ceremony", type: INTENTION_TYPE.STALL, value: 10, patienceThreshold: 10 },
      { name: "Cold Dismissal", type: INTENTION_TYPE.ATTACK, value: 12, patienceThreshold: 6 },
    ]
  },
];

// Judge effects that can be applied to the game
export interface JudgeAction {
  name: string;
  description: string;
  patienceThreshold: number; // Patience spent until this effect triggers
  apply: (effects: import('../types/game').JudgeEffects) => import('../types/game').JudgeEffects;
}

export const JUDGE_ACTIONS: JudgeAction[] = [
  {
    name: "Growing Impatience",
    description: "End turn costs +1 patience",
    patienceThreshold: 12,
    apply: (effects) => ({ ...effects, endTurnPatienceCost: effects.endTurnPatienceCost + 1 }),
  },
  {
    name: "Favor the Bold",
    description: "Favor gains increased by 50%",
    patienceThreshold: 10,
    apply: (effects) => ({ ...effects, favorGainModifier: effects.favorGainModifier * 1.5 }),
  },
  {
    name: "Harsh Judgment",
    description: "All damage increased by 50%",
    patienceThreshold: 15,
    apply: (effects) => ({ ...effects, damageModifier: effects.damageModifier * 1.5 }),
  },
  {
    name: "Element Tax: Fire",
    description: "Fire cards cost +2 patience",
    patienceThreshold: 10,
    apply: (effects) => ({
      ...effects,
      elementCostModifier: { ...effects.elementCostModifier, [ELEMENT.FIRE]: (effects.elementCostModifier[ELEMENT.FIRE] ?? 0) + 2 }
    }),
  },
  {
    name: "Element Tax: Water",
    description: "Water cards cost +2 patience",
    patienceThreshold: 10,
    apply: (effects) => ({
      ...effects,
      elementCostModifier: { ...effects.elementCostModifier, [ELEMENT.WATER]: (effects.elementCostModifier[ELEMENT.WATER] ?? 0) + 2 }
    }),
  },
];
