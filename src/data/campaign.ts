import { CampaignResources, DayAction, CalendarEvent, BattleBonuses } from '../types/campaign';

// ==================== STARTING VALUES ====================
export const STARTING_RESOURCES: CampaignResources = {
  money: 5,
  clothing: 2,
  jewelry: 1,
  rumors: 0,
};

export const STARTING_BONUSES: BattleBonuses = {
  startingFavor: 0,
  opponentShame: 0,
  extraCards: [],
  patienceBonus: 0,
};

// ==================== DAY ACTIONS ====================
// Actions now have time costs in hours and availability windows
export const DAY_ACTIONS: DayAction[] = [
  {
    id: 'visit-market',
    name: 'Visit the Market',
    description: 'Browse the bustling market for goods and gossip.',
    timeCost: 2,
    availableHours: { start: 7, end: 17 }, // Market open 7am-5pm
    outcomes: [
      {
        probability: 0.35,
        resourceChanges: { money: 2 },
        message: 'You haggled well with a merchant and came away with extra coin.',
      },
      {
        probability: 0.25,
        resourceChanges: { clothing: 1 },
        message: 'You found a beautiful silk ribbon at a fair price.',
      },
      {
        probability: 0.15,
        resourceChanges: { jewelry: 1 },
        message: 'A jeweler was closing his stall and sold you a hairpin cheaply.',
      },
      {
        probability: 0.15,
        resourceChanges: { rumors: 1 },
        message: 'You overheard merchants discussing palace affairs.',
      },
      {
        probability: 0.1,
        resourceChanges: { money: 1, jewelry: 1 },
        bonusReward: { startingFavor: 5 },
        message: 'A merchant gifted you a lucky charm - it may bring fortune at the banquet!',
      },
    ],
  },
  {
    id: 'gossip-servants',
    name: 'Gossip with Servants',
    description: 'Spend time listening to the whispers of palace servants.',
    timeCost: 2,
    availableHours: { start: 9, end: 21 }, // Servants available most of day
    outcomes: [
      {
        probability: 0.30,
        resourceChanges: { rumors: 2 },
        message: 'The servants were talkative today. You learned much.',
      },
      {
        probability: 0.30,
        resourceChanges: { rumors: 1 },
        message: 'You picked up a few interesting tidbits.',
      },
      {
        probability: 0.20,
        resourceChanges: {},
        message: 'The servants were tight-lipped today.',
      },
      {
        probability: 0.10,
        resourceChanges: { rumors: 2 },
        bonusReward: { opponentShame: 5 },
        message: 'You learned a scandalous secret about your rival!',
      },
      {
        probability: 0.10,
        resourceChanges: { rumors: 1 },
        eventTrigger: 'servant-warning',
        message: 'A trusted servant pulled you aside with urgent news...',
      },
    ],
  },
  {
    id: 'attend-court',
    name: 'Attend Morning Court',
    description: 'Show your face at the morning court assembly.',
    timeCost: 3,
    availableHours: { start: 5, end: 11 }, // Morning court only
    outcomes: [
      {
        probability: 0.20,
        resourceChanges: { clothing: -1, rumors: 2 },
        message: 'Your modest attire drew whispers, but you learned much from observing.',
      },
      {
        probability: 0.25,
        resourceChanges: { money: 2 },
        message: 'A noble was impressed by your wit and gifted you silver.',
      },
      {
        probability: 0.25,
        resourceChanges: { rumors: 1 },
        message: 'You observed the court dynamics carefully.',
      },
      {
        probability: 0.15,
        resourceChanges: {},
        message: 'An uneventful morning at court.',
      },
      {
        probability: 0.15,
        resourceChanges: { rumors: 1 },
        bonusReward: { patienceBonus: 1 },
        message: 'You made a good impression on a court official who may speak well of you.',
      },
    ],
  },
  {
    id: 'practice-skills',
    name: 'Practice Your Arts',
    description: 'Hone your skills in music, poetry, or calligraphy.',
    timeCost: 3,
    availableHours: { start: 9, end: 19 }, // Daytime practice
    outcomes: [
      {
        probability: 0.35,
        resourceChanges: { clothing: 1 },
        message: 'Your practice impressed a senior lady who gifted you fabric.',
      },
      {
        probability: 0.25,
        resourceChanges: { jewelry: 1 },
        message: 'A visiting noble noticed your talents and left a token of appreciation.',
      },
      {
        probability: 0.20,
        resourceChanges: { rumors: 1 },
        message: 'While practicing, you overheard nobles discussing affairs.',
      },
      {
        probability: 0.10,
        resourceChanges: {},
        message: 'A peaceful time of practice, though nothing eventful occurred.',
      },
      {
        probability: 0.10,
        resourceChanges: { jewelry: 1 },
        bonusReward: { startingFavor: 10 },
        message: 'A master praised your technique - your reputation grows!',
      },
    ],
  },
  {
    id: 'rest-quarters',
    name: 'Rest in Quarters',
    description: 'Take time to rest and gather your thoughts.',
    timeCost: 2,
    // No availableHours = always available
    outcomes: [
      {
        probability: 0.45,
        resourceChanges: {},
        message: 'You spent quiet hours resting.',
      },
      {
        probability: 0.25,
        resourceChanges: { rumors: 1 },
        message: 'A visitor came by your quarters with interesting news.',
      },
      {
        probability: 0.15,
        resourceChanges: { money: 1 },
        message: 'You found a coin you had misplaced while tidying.',
      },
      {
        probability: 0.15,
        resourceChanges: {},
        bonusReward: { patienceBonus: 1 },
        message: 'Deep meditation has sharpened your mind.',
      },
    ],
  },
  {
    id: 'evening-gathering',
    name: 'Attend Evening Gathering',
    description: 'Join the ladies of the court for evening entertainment.',
    timeCost: 3,
    availableHours: { start: 17, end: 23 }, // Evening only
    outcomes: [
      {
        probability: 0.30,
        resourceChanges: { rumors: 2 },
        message: 'Wine loosened tongues. You gathered valuable information.',
      },
      {
        probability: 0.25,
        resourceChanges: { jewelry: 1 },
        message: 'A lady admired your charm and gifted you a trinket.',
      },
      {
        probability: 0.20,
        resourceChanges: { clothing: 1, money: -1 },
        message: 'You had to contribute to refreshments, but received a lovely hair ornament.',
      },
      {
        probability: 0.15,
        resourceChanges: { rumors: 1 },
        bonusReward: { opponentShame: 5 },
        message: 'You discovered your rival made a fool of herself recently.',
      },
      {
        probability: 0.10,
        resourceChanges: {},
        message: 'A pleasant but uneventful evening.',
      },
    ],
  },
  {
    id: 'night-prayer',
    name: 'Night Prayers',
    description: 'Visit the temple for late night prayers and reflection.',
    timeCost: 2,
    availableHours: { start: 19, end: 23 }, // Night only
    outcomes: [
      {
        probability: 0.40,
        resourceChanges: {},
        bonusReward: { patienceBonus: 1 },
        message: 'Your prayers brought clarity and calm.',
      },
      {
        probability: 0.30,
        resourceChanges: { rumors: 1 },
        message: 'You overheard whispered confessions.',
      },
      {
        probability: 0.20,
        resourceChanges: {},
        message: 'A peaceful night of meditation.',
      },
      {
        probability: 0.10,
        resourceChanges: { rumors: 2 },
        bonusReward: { startingFavor: 5 },
        message: 'A priestess blessed you and shared court secrets.',
      },
    ],
  },
];

// ==================== CALENDAR EVENTS ====================
export const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: 'servant-warning',
    day: 0, // Day set dynamically when triggered
    name: 'Servant\'s Warning',
    description: 'A trusted servant pulls you aside. "My lady, I have heard whispers. Lady Chen plots against you. She plans to humiliate you at the tea ceremony."',
    type: 'story',
    resolved: false,
    choices: [
      {
        id: 'confront',
        label: 'Confront Her',
        description: 'Demand she explain herself publicly.',
        triggersBattle: true,
        battleOpponentIndex: 0,
        outcomeMessage: 'You decided to confront Lady Chen directly.',
      },
      {
        id: 'prepare',
        label: 'Prepare Defenses',
        description: 'Use this knowledge to prepare for her schemes.',
        bonusReward: { opponentShame: 10 },
        outcomeMessage: 'You will use this knowledge to your advantage.',
      },
      {
        id: 'ignore',
        label: 'Ignore It',
        description: 'Perhaps the servant is mistaken.',
        outcomeMessage: 'You decided to ignore the warning for now.',
      },
    ],
    notes: ['Lady Chen may be plotting against you'],
  },
  {
    id: 'tea-ceremony',
    day: 10,
    hour: 14, // 2pm
    name: 'Imperial Tea Ceremony',
    description: 'The Empress hosts a tea ceremony in the Garden of Eternal Spring. All concubines must attend. This is an opportunity to gain favor - or to face your rivals.',
    type: 'opportunity',
    resolved: false,
    choices: [
      {
        id: 'impress-empress',
        label: 'Impress the Empress',
        description: 'Focus on demonstrating your refinement.',
        resourceCost: { clothing: 2 },
        bonusReward: { startingFavor: 15 },
        outcomeMessage: 'Your elegant performance caught the Empress\'s eye.',
      },
      {
        id: 'challenge-rival',
        label: 'Challenge Your Rival',
        description: 'Use the ceremony to expose Lady Chen\'s schemes.',
        resourceCost: { rumors: 3 },
        triggersBattle: true,
        battleOpponentIndex: 0,
        outcomeMessage: 'You called out Lady Chen before the court!',
      },
      {
        id: 'stay-quiet',
        label: 'Keep a Low Profile',
        description: 'Observe and gather information quietly.',
        resourceReward: { rumors: 2 },
        outcomeMessage: 'You watched and listened carefully.',
      },
    ],
  },
  {
    id: 'garden-party',
    day: 20,
    hour: 16, // 4pm
    name: 'Noble Garden Party',
    description: 'The Duke of Wei\'s household hosts a garden gathering. Influential nobles will attend. This could be your chance to gain powerful allies.',
    type: 'opportunity',
    resolved: false,
    choices: [
      {
        id: 'network',
        label: 'Network with Nobles',
        description: 'Spend time making connections.',
        resourceCost: { jewelry: 2 },
        bonusReward: { patienceBonus: 2, startingFavor: 10 },
        outcomeMessage: 'You made valuable connections among the nobility.',
      },
      {
        id: 'spy',
        label: 'Gather Intelligence',
        description: 'Use the gathering to learn secrets.',
        resourceReward: { rumors: 3 },
        bonusReward: { opponentShame: 10 },
        outcomeMessage: 'You overheard many useful things.',
      },
      {
        id: 'perform',
        label: 'Perform for the Guests',
        description: 'Show off your artistic talents.',
        triggersBattle: true,
        battleOpponentIndex: 1,
        bonusReward: { startingFavor: 20 },
        outcomeMessage: 'Your performance was memorable - but Lady Wei challenged you!',
      },
    ],
  },
  {
    id: 'midnight-summons',
    day: 25,
    hour: 21, // 9pm
    name: 'Midnight Summons',
    description: 'A eunuch arrives with urgent news: the Emperor wishes to see you privately. This is highly unusual.',
    type: 'story',
    resolved: false,
    choices: [
      {
        id: 'attend',
        label: 'Answer the Summons',
        description: 'Go to the Emperor immediately.',
        bonusReward: { startingFavor: 25, patienceBonus: 2 },
        outcomeMessage: 'The Emperor was pleased by your swift response.',
      },
      {
        id: 'delay',
        label: 'Prepare First',
        description: 'Take time to dress properly before attending.',
        resourceCost: { clothing: 1, jewelry: 1 },
        bonusReward: { startingFavor: 15 },
        outcomeMessage: 'Your careful preparation was noted approvingly.',
      },
      {
        id: 'investigate',
        label: 'Question the Summons',
        description: 'This could be a trap. Investigate first.',
        resourceCost: { rumors: 2 },
        bonusReward: { opponentShame: 15 },
        outcomeMessage: 'You discovered it was indeed a scheme by your rivals!',
      },
    ],
  },
];

// ==================== BOSS EVENT ====================
export const BOSS_EVENT: CalendarEvent = {
  id: 'emperors-banquet',
  day: 30,
  hour: 18, // 6pm evening banquet
  name: 'The Emperor\'s Grand Banquet',
  description: 'The monthly imperial banquet has arrived. All your preparation leads to this moment. The Emperor will observe, the Empress will judge, and your rivals will scheme. Your standing in the palace will be determined by your performance in the battle of wits that awaits.',
  type: 'boss',
  resolved: false,
  choices: [
    {
      id: 'enter-banquet',
      label: 'Enter the Banquet Hall',
      description: 'Face your destiny with all the advantages you have gathered.',
      triggersBattle: true,
      battleOpponentIndex: 2, // Boss opponent
      outcomeMessage: 'You step into the banquet hall, ready for the challenge ahead.',
    },
  ],
  notes: [
    'This is the culmination of your month\'s efforts.',
    'All bonuses you have gathered will apply to this battle.',
  ],
};

// ==================== BOSS INTEL ====================
export const BOSS_INTEL_POOL: string[] = [
  'The Emperor favors those who display elegance - clothing bonuses may help.',
  'Rival concubines plan to embarrass newcomers at the banquet.',
  'The Empress Dowager will be observing closely - starting favor matters.',
  'Musical performances are highly regarded - practice your arts.',
  'Gifts may sway the opinions of key officials - bring jewelry.',
  'Rumors suggest a test of wit will occur - gather information.',
  'Lady Chen will be your main opponent - any shame on her helps.',
  'The Judge for the evening favors patience - conserve your resources.',
];
