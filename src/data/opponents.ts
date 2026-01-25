import { Intention, INTENTION_TYPE } from '../types/game';

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
      { name: "Seductive Wit", type: INTENTION_TYPE.FAVOR_GAIN, value: 20, patienceThreshold: 6 },
      { name: "Whispered Rumors", type: INTENTION_TYPE.FAVOR_STEAL, value: 10, patienceThreshold: 4 },
      { name: "Hidden Dagger", type: INTENTION_TYPE.ATTACK, value: 15, patienceThreshold: 8 },
      { name: "Crocodile Tears", type: INTENTION_TYPE.STALL, value: 4, patienceThreshold: 5 },
    ]
  },
  {
    name: "The Scholar",
    maxFace: 30,
    intentions: [
      { name: "Cutting Logic", type: INTENTION_TYPE.ATTACK, value: 12, patienceThreshold: 5 },
      { name: "Citation of Precedent", type: INTENTION_TYPE.FAVOR_GAIN, value: 15, patienceThreshold: 6 },
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
      { name: "Imperial Authority", type: INTENTION_TYPE.FAVOR_STEAL, value: 15, patienceThreshold: 7 },
      { name: "Strategic Patience", type: INTENTION_TYPE.STALL, value: 8, patienceThreshold: 12 },
    ]
  },
  {
    name: "The Eunuch",
    maxFace: 25,
    intentions: [
      { name: "Palace Gossip", type: INTENTION_TYPE.FAVOR_STEAL, value: 25, patienceThreshold: 8 },
      { name: "Subtle Poison", type: INTENTION_TYPE.ATTACK, value: 10, patienceThreshold: 5 },
      { name: "Bureaucratic Obstruction", type: INTENTION_TYPE.STALL, value: 5, patienceThreshold: 4 },
      { name: "Whisper Campaign", type: INTENTION_TYPE.FAVOR_STEAL, value: 15, patienceThreshold: 6 },
    ]
  },
  {
    name: "The Empress",
    maxFace: 60,
    intentions: [
      { name: "Imperial Decree", type: INTENTION_TYPE.FAVOR_GAIN, value: 30, patienceThreshold: 12 },
      { name: "Royal Displeasure", type: INTENTION_TYPE.ATTACK, value: 20, patienceThreshold: 9 },
      { name: "Endless Ceremony", type: INTENTION_TYPE.STALL, value: 10, patienceThreshold: 10 },
      { name: "Cold Dismissal", type: INTENTION_TYPE.ATTACK, value: 12, patienceThreshold: 6 },
    ]
  },
];