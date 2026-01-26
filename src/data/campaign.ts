import {
  CampaignResources,
  DayAction,
  CalendarEvent,
  BattleBonuses,
  TIME_PERIOD,
} from '../types/campaign';

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

export const STARTING_FACE = 60;
export const MAX_FACE = 60;
export const REST_FACE_HEAL = 10; // Face healed per rest segment

// ==================== DAY ACTIONS ====================
// Actions cost 1-2 segments and may be restricted to certain time periods
export const DAY_ACTIONS: DayAction[] = [
  {
    id: 'visit-market',
    name: 'Visit the Market',
    description: 'Browse the bustling market for goods and gossip.',
    segmentCost: 1,
    availablePeriods: [TIME_PERIOD.EARLY_MORNING, TIME_PERIOD.LATE_MORNING],
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
        bonusReward: { startingFavor: 5, opponentShame: 0, extraCards: [], patienceBonus: 0 },
        message: 'A merchant gifted you a lucky charm - it may bring fortune at the banquet!',
      },
    ],
  },
  {
    id: 'gossip-servants',
    name: 'Gossip with Servants',
    description: 'Spend time listening to the whispers of palace servants.',
    segmentCost: 1,
    availablePeriods: [TIME_PERIOD.LATE_MORNING, TIME_PERIOD.EVENING],
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
        probability: 0.15,
        resourceChanges: {},
        message: 'The servants were tight-lipped today.',
      },
      {
        probability: 0.15,
        resourceChanges: { rumors: 2 },
        bonusReward: { startingFavor: 0, opponentShame: 5, extraCards: [], patienceBonus: 0 },
        message: 'You learned a scandalous secret about your rival!',
      },
      {
        probability: 0.10,
        resourceChanges: { rumors: 1 },
        addsEvent: {
          id: `servant-tip-${Date.now()}`,
          day: 0, // Will be set to a future day
          timePeriod: TIME_PERIOD.EVENING,
          name: 'Secret Meeting',
          description: 'A servant promises to share valuable information if you meet them in the evening.',
          type: 'opportunity',
          choices: [
            {
              id: 'attend-meeting',
              label: 'Attend the Meeting',
              description: 'Meet the servant as promised.',
              resourceReward: { rumors: 3 },
              bonusReward: { startingFavor: 0, opponentShame: 10, extraCards: [], patienceBonus: 0 },
              outcomeMessage: 'The servant revealed your rival\'s weakness!',
            },
            {
              id: 'bring-gift',
              label: 'Bring a Gift',
              description: 'Bring something to loosen their tongue further.',
              resourceCost: { jewelry: 1 },
              resourceReward: { rumors: 4 },
              bonusReward: { startingFavor: 5, opponentShame: 15, extraCards: [], patienceBonus: 0 },
              outcomeMessage: 'Your generosity was rewarded with extraordinary secrets!',
            },
          ],
        },
        message: 'A servant whispered about a secret they could share later...',
      },
    ],
  },
  {
    id: 'attend-court',
    name: 'Attend Morning Court',
    description: 'Show your face at the morning court assembly.',
    segmentCost: 2,
    availablePeriods: [TIME_PERIOD.EARLY_MORNING],
    outcomes: [
      {
        probability: 0.20,
        resourceChanges: { clothing: -1, rumors: 2 },
        faceChange: -5,
        message: 'Your modest attire drew whispers, damaging your reputation slightly.',
      },
      {
        probability: 0.25,
        resourceChanges: { money: 2 },
        faceChange: 5,
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
        bonusReward: { startingFavor: 0, opponentShame: 0, extraCards: [], patienceBonus: 1 },
        message: 'You made a good impression on a court official.',
      },
    ],
  },
  {
    id: 'practice-skills',
    name: 'Practice Your Arts',
    description: 'Hone your skills in music, poetry, or calligraphy.',
    segmentCost: 2,
    availablePeriods: [TIME_PERIOD.LATE_MORNING, TIME_PERIOD.EVENING],
    outcomes: [
      {
        probability: 0.35,
        resourceChanges: { clothing: 1 },
        message: 'Your practice impressed a senior lady who gifted you fabric.',
      },
      {
        probability: 0.25,
        resourceChanges: { jewelry: 1 },
        message: 'A visiting noble noticed your talents and left a token.',
      },
      {
        probability: 0.15,
        resourceChanges: { rumors: 1 },
        message: 'While practicing, you overheard nobles discussing affairs.',
      },
      {
        probability: 0.10,
        resourceChanges: {},
        message: 'A peaceful time of practice.',
      },
      {
        probability: 0.15,
        resourceChanges: { jewelry: 1 },
        faceChange: 5,
        bonusReward: { startingFavor: 10, opponentShame: 0, extraCards: [], patienceBonus: 0 },
        message: 'A master praised your technique - your reputation grows!',
      },
    ],
  },
  {
    id: 'rest',
    name: 'Rest',
    description: 'Take time to rest and recover your composure.',
    segmentCost: 1,
    // Available any time (including forced during night)
    outcomes: [
      {
        probability: 0.50,
        resourceChanges: {},
        faceChange: REST_FACE_HEAL,
        message: 'You rested peacefully and recovered your composure.',
      },
      {
        probability: 0.30,
        resourceChanges: { rumors: 1 },
        faceChange: REST_FACE_HEAL,
        message: 'A visitor came by with news while you rested.',
      },
      {
        probability: 0.20,
        resourceChanges: {},
        faceChange: REST_FACE_HEAL,
        bonusReward: { startingFavor: 0, opponentShame: 0, extraCards: [], patienceBonus: 1 },
        message: 'Deep meditation sharpened your mind.',
      },
    ],
  },
  {
    id: 'evening-gathering',
    name: 'Evening Gathering',
    description: 'Join the ladies of the court for evening entertainment.',
    segmentCost: 2,
    availablePeriods: [TIME_PERIOD.EVENING],
    outcomes: [
      {
        probability: 0.30,
        resourceChanges: { rumors: 2 },
        message: 'Wine loosened tongues. You gathered valuable information.',
      },
      {
        probability: 0.20,
        resourceChanges: { jewelry: 1 },
        message: 'A lady admired your charm and gifted you a trinket.',
      },
      {
        probability: 0.20,
        resourceChanges: { clothing: 1, money: -1 },
        message: 'You contributed to refreshments but received a lovely gift.',
      },
      {
        probability: 0.15,
        resourceChanges: { rumors: 1 },
        bonusReward: { startingFavor: 0, opponentShame: 5, extraCards: [], patienceBonus: 0 },
        message: 'You discovered your rival made a fool of herself recently.',
      },
      {
        probability: 0.15,
        resourceChanges: {},
        faceChange: -5,
        message: 'An awkward moment damaged your reputation slightly.',
      },
    ],
  },
];

// ==================== CALENDAR EVENTS ====================
export const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: 'tea-ceremony',
    day: 10,
    timePeriod: TIME_PERIOD.LATE_MORNING,
    name: 'Imperial Tea Ceremony',
    description: 'The Empress hosts a tea ceremony. All concubines must attend. This is an opportunity to gain favor - or face your rivals.',
    type: 'opportunity',
    resolved: false,
    choices: [
      {
        id: 'impress-empress',
        label: 'Impress the Empress',
        description: 'Focus on demonstrating your refinement.',
        resourceCost: { clothing: 2 },
        bonusReward: { startingFavor: 15, opponentShame: 0, extraCards: [], patienceBonus: 0 },
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
    timePeriod: TIME_PERIOD.EVENING,
    name: 'Noble Garden Party',
    description: 'The Duke of Wei\'s household hosts a garden gathering. Influential nobles will attend.',
    type: 'opportunity',
    resolved: false,
    choices: [
      {
        id: 'network',
        label: 'Network with Nobles',
        description: 'Spend time making connections.',
        resourceCost: { jewelry: 2 },
        bonusReward: { startingFavor: 10, opponentShame: 0, extraCards: [], patienceBonus: 2 },
        outcomeMessage: 'You made valuable connections among the nobility.',
      },
      {
        id: 'spy',
        label: 'Gather Intelligence',
        description: 'Use the gathering to learn secrets.',
        resourceReward: { rumors: 3 },
        bonusReward: { startingFavor: 0, opponentShame: 10, extraCards: [], patienceBonus: 0 },
        outcomeMessage: 'You overheard many useful things.',
      },
      {
        id: 'perform',
        label: 'Perform for the Guests',
        description: 'Show off your artistic talents.',
        triggersBattle: true,
        battleOpponentIndex: 1,
        bonusReward: { startingFavor: 20, opponentShame: 0, extraCards: [], patienceBonus: 0 },
        outcomeMessage: 'Your performance was memorable - but Lady Wei challenged you!',
      },
    ],
  },
  {
    id: 'midnight-summons',
    day: 25,
    timePeriod: TIME_PERIOD.EVENING,
    name: 'Urgent Summons',
    description: 'A eunuch arrives with urgent news: the Emperor wishes to see you. This is highly unusual.',
    type: 'story',
    resolved: false,
    choices: [
      {
        id: 'attend',
        label: 'Answer Immediately',
        description: 'Go to the Emperor at once.',
        bonusReward: { startingFavor: 25, opponentShame: 0, extraCards: [], patienceBonus: 2 },
        outcomeMessage: 'The Emperor was pleased by your swift response.',
      },
      {
        id: 'delay',
        label: 'Prepare First',
        description: 'Take time to dress properly before attending.',
        resourceCost: { clothing: 1, jewelry: 1 },
        bonusReward: { startingFavor: 15, opponentShame: 0, extraCards: [], patienceBonus: 0 },
        outcomeMessage: 'Your careful preparation was noted approvingly.',
      },
      {
        id: 'investigate',
        label: 'Question the Summons',
        description: 'This could be a trap. Investigate first.',
        resourceCost: { rumors: 2 },
        bonusReward: { startingFavor: 0, opponentShame: 15, extraCards: [], patienceBonus: 0 },
        outcomeMessage: 'You discovered it was a scheme by your rivals!',
      },
    ],
  },
];

// ==================== BOSS EVENT ====================
export const BOSS_EVENT: CalendarEvent = {
  id: 'emperors-banquet',
  day: 30,
  timePeriod: TIME_PERIOD.EVENING,
  name: 'The Emperor\'s Grand Banquet',
  description: 'The monthly imperial banquet has arrived. All your preparation leads to this moment. Your standing in the palace will be determined by your performance.',
  type: 'boss',
  resolved: false,
  cannotSkip: true,
  choices: [
    {
      id: 'enter-banquet',
      label: 'Enter the Banquet Hall',
      description: 'Face your destiny with all the advantages you have gathered.',
      triggersBattle: true,
      battleOpponentIndex: 2,
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
