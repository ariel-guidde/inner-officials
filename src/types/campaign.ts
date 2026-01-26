// ==================== CAMPAIGN RESOURCES ====================
export type CampaignResource = 'money' | 'clothing' | 'jewelry' | 'rumors';

export interface CampaignResources {
  money: number;
  clothing: number;
  jewelry: number;
  rumors: number;
}

// ==================== TIME SYSTEM ====================
export const TIME_OF_DAY = {
  EARLY_MORNING: 'early_morning', // 5-7 (Chen hour)
  MORNING: 'morning',             // 7-11 (Si hour)
  MIDDAY: 'midday',               // 11-13 (Wu hour)
  AFTERNOON: 'afternoon',         // 13-17 (Wei/Shen hour)
  EVENING: 'evening',             // 17-19 (You hour)
  NIGHT: 'night',                 // 19-23 (Xu/Hai hour)
} as const;

export type TimeOfDay = typeof TIME_OF_DAY[keyof typeof TIME_OF_DAY];

export interface TimeSlot {
  hour: number;
  period: TimeOfDay;
  label: string;
}

export const HOURS_PER_DAY = 12; // Usable hours (5am to 11pm, simplified)
export const STARTING_HOUR = 5; // Day starts at 5am

// ==================== CALENDAR EVENTS ====================
export const CALENDAR_EVENT_TYPE = {
  BATTLE: 'battle',
  STORY: 'story',
  OPPORTUNITY: 'opportunity',
  BOSS: 'boss',
} as const;

export type CalendarEventType = typeof CALENDAR_EVENT_TYPE[keyof typeof CALENDAR_EVENT_TYPE];

// Event choice that player can make
export interface EventChoice {
  id: string;
  label: string;
  description: string;
  resourceCost?: Partial<CampaignResources>;
  resourceReward?: Partial<CampaignResources>;
  triggersBattle?: boolean;
  battleOpponentIndex?: number; // Which opponent to fight
  bonusReward?: Partial<BattleBonuses>; // Bonuses earned for boss battle
  outcomeMessage: string;
}

export interface CalendarEvent {
  id: string;
  day: number;
  hour?: number; // Optional specific hour
  name: string;
  description: string;
  type: CalendarEventType;
  resolved: boolean;
  choices?: EventChoice[]; // Choices available during event
  selectedChoiceId?: string; // Which choice was made
  notes?: string[]; // Player notes/knowledge about this event
}

// ==================== ACTION OUTCOMES ====================
export interface ActionOutcome {
  probability: number; // 0-1
  resourceChanges: Partial<CampaignResources>;
  eventTrigger?: string; // event ID to trigger
  message: string; // "You found a silver hairpin!"
  bonusReward?: Partial<BattleBonuses>; // Rare bonus for boss battle
}

export interface DayAction {
  id: string;
  name: string;
  description: string;
  timeCost: number; // hours it takes
  availableHours?: { start: number; end: number }; // When action is available (e.g., market 7-17)
  outcomes: ActionOutcome[]; // weighted random selection
}

// ==================== BATTLE BONUSES ====================
// Bonuses accumulated during campaign that affect the boss battle
export interface BattleBonuses {
  startingFavor: number;       // Extra starting favor
  opponentShame: number;       // Shame applied to opponent at start
  extraCards: string[];        // Card IDs to add to deck for boss battle
  patienceBonus: number;       // Extra starting patience
  // Could add more: special effects, judge modifiers, etc.
}

// ==================== CAMPAIGN STATE ====================
export interface CampaignState {
  currentDay: number;
  currentHour: number;
  maxDay: number; // 30 for lunar month
  resources: CampaignResources;
  calendar: CalendarEvent[];
  availableActions: DayAction[];
  bossEvent: CalendarEvent;
  bossIntel: string[]; // Info gathered about the boss event
  battleBonuses: BattleBonuses; // Accumulated bonuses for boss battle
  lastOutcomeMessage: string | null; // Message from last action
  activeEvent: CalendarEvent | null; // Currently triggered event
  selectedDay: number | null; // Day selected for viewing info
  pendingBattle: { opponentIndex: number; eventId: string } | null; // Battle to start
}

// ==================== CAMPAIGN SCREEN ====================
export const CAMPAIGN_SCREEN = {
  CAMPAIGN_MENU: 'campaign-menu',
  CAMPAIGN: 'campaign',
} as const;

export type CampaignScreen = typeof CAMPAIGN_SCREEN[keyof typeof CAMPAIGN_SCREEN];

// ==================== TIME HELPERS ====================
export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 7) return TIME_OF_DAY.EARLY_MORNING;
  if (hour >= 7 && hour < 11) return TIME_OF_DAY.MORNING;
  if (hour >= 11 && hour < 13) return TIME_OF_DAY.MIDDAY;
  if (hour >= 13 && hour < 17) return TIME_OF_DAY.AFTERNOON;
  if (hour >= 17 && hour < 19) return TIME_OF_DAY.EVENING;
  return TIME_OF_DAY.NIGHT;
}

export function getTimeLabel(hour: number): string {
  const period = getTimeOfDay(hour);
  const labels: Record<TimeOfDay, string> = {
    [TIME_OF_DAY.EARLY_MORNING]: 'Early Morning',
    [TIME_OF_DAY.MORNING]: 'Morning',
    [TIME_OF_DAY.MIDDAY]: 'Midday',
    [TIME_OF_DAY.AFTERNOON]: 'Afternoon',
    [TIME_OF_DAY.EVENING]: 'Evening',
    [TIME_OF_DAY.NIGHT]: 'Night',
  };
  return labels[period];
}

export function formatHour(hour: number): string {
  if (hour < 12) return `${hour}:00`;
  if (hour === 12) return '12:00';
  return `${hour}:00`;
}
