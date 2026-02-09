import { Intention, INTENTION_TYPE, CoreArgument, ELEMENT } from '../types/game';

export interface OpponentTemplate {
  name: string;
  maxFace: number;
  intentions: Intention[];
  coreArgument?: CoreArgument;
}

// Flustered effects - pushed to top of intention queue when opponent's face is broken
export const FLUSTERED_EFFECTS: Intention[] = [
  { name: "Stammering", type: INTENTION_TYPE.FLUSTERED, value: 0 },
  { name: "Losing Composure", type: INTENTION_TYPE.FLUSTERED, value: 0 },
  { name: "Red-Faced", type: INTENTION_TYPE.FLUSTERED, value: 0 },
  { name: "Caught Off-Guard", type: INTENTION_TYPE.FLUSTERED, value: 0 },
  { name: "Tongue-Tied", type: INTENTION_TYPE.FLUSTERED, value: 0 },
];

export const OPPONENTS: OpponentTemplate[] = [
  {
    name: "The Concubine",
    maxFace: 35,
    intentions: [
      { name: "Seductive Wit", type: INTENTION_TYPE.STANDING_GAIN, value: 20 },
      { name: "Whispered Rumors", type: INTENTION_TYPE.STANDING_DAMAGE, value: 10 },
      { name: "Hidden Dagger", type: INTENTION_TYPE.ATTACK, value: 15 },
      { name: "Crocodile Tears", type: INTENTION_TYPE.STALL, value: 4 },
    ],
    coreArgument: {
      id: 'ca_seduction',
      name: 'Art of Seduction',
      description: 'Gains +5 standing when dealing face damage',
      element: ELEMENT.WATER,
      trigger: 'on_damage_dealt',
      passiveModifiers: {
        standingGainBonus: 5,
      },
    },
  },
  {
    name: "The Scholar",
    maxFace: 30,
    intentions: [
      { name: "Cutting Logic", type: INTENTION_TYPE.ATTACK, value: 12 },
      { name: "Citation of Precedent", type: INTENTION_TYPE.STANDING_GAIN, value: 15 },
      { name: "Pedantic Delay", type: INTENTION_TYPE.STALL, value: 6 },
      { name: "Scholarly Rebuke", type: INTENTION_TYPE.ATTACK, value: 8 },
    ],
    coreArgument: {
      id: 'ca_scholarly',
      name: 'Scholarly Method',
      description: '30% more standing from all sources',
      element: ELEMENT.WOOD,
      passiveModifiers: {
        standingGainMultiplier: 1.3,
      },
    },
  },
  {
    name: "The General",
    maxFace: 50,
    intentions: [
      { name: "Heavy Rebuke", type: INTENTION_TYPE.ATTACK, value: 25 },
      { name: "Military Discipline", type: INTENTION_TYPE.ATTACK, value: 15 },
      { name: "Imperial Authority", type: INTENTION_TYPE.STANDING_DAMAGE, value: 15 },
      { name: "Strategic Patience", type: INTENTION_TYPE.STALL, value: 8 },
    ],
    coreArgument: {
      id: 'ca_military',
      name: 'Military Might',
      description: 'Gains +5 standing when dealing face damage',
      element: ELEMENT.FIRE,
      trigger: 'on_damage_dealt',
      passiveModifiers: {
        standingGainBonus: 5,
      },
    },
  },
  {
    name: "The Eunuch",
    maxFace: 25,
    intentions: [
      { name: "Palace Gossip", type: INTENTION_TYPE.STANDING_DAMAGE, value: 25 },
      { name: "Subtle Poison", type: INTENTION_TYPE.ATTACK, value: 10 },
      { name: "Bureaucratic Obstruction", type: INTENTION_TYPE.STALL, value: 5 },
      { name: "Whisper Campaign", type: INTENTION_TYPE.STANDING_DAMAGE, value: 15 },
    ],
    coreArgument: {
      id: 'ca_intrigue',
      name: 'Palace Intrigue',
      description: '+3 bonus when damaging player standing',
      passiveModifiers: {
        opponentStandingDamageBonus: 3,
      },
    },
  },
  {
    name: "The Empress",
    maxFace: 60,
    intentions: [
      { name: "Imperial Decree", type: INTENTION_TYPE.STANDING_GAIN, value: 30 },
      { name: "Royal Displeasure", type: INTENTION_TYPE.ATTACK, value: 20 },
      { name: "Endless Ceremony", type: INTENTION_TYPE.STALL, value: 10 },
      { name: "Cold Dismissal", type: INTENTION_TYPE.ATTACK, value: 12 },
    ],
    coreArgument: {
      id: 'ca_imperial',
      name: 'Imperial Mandate',
      description: '50% more standing from all sources',
      passiveModifiers: {
        standingGainMultiplier: 1.5,
      },
    },
  },
];
