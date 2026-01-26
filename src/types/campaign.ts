// ==================== CAMPAIGN RESOURCES ====================
export type CampaignResource = 'money' | 'clothing' | 'jewelry' | 'rumors';

export interface CampaignResources {
  money: number;
  clothing: number;
  jewelry: number;
  rumors: number;
}

// ==================== TIME SEGMENT SYSTEM ====================
// Day is divided into 8 segments (2 per time period)
// Night segments are for rest only
export const TIME_PERIOD = {
  EARLY_MORNING: 'early_morning',
  LATE_MORNING: 'late_morning',
  EVENING: 'evening',
  NIGHT: 'night',
} as const;

export type TimePeriod = typeof TIME_PERIOD[keyof typeof TIME_PERIOD];

export const SEGMENTS_PER_DAY = 8;
export const SEGMENTS_PER_PERIOD = 2;
export const USABLE_SEGMENTS = 6; // Excluding night (2 segments)
export const NIGHT_START_SEGMENT = 6; // Segments 6-7 are night

// Helper to get period from segment index
export function getTimePeriod(segment: number): TimePeriod {
  if (segment < 2) return TIME_PERIOD.EARLY_MORNING;
  if (segment < 4) return TIME_PERIOD.LATE_MORNING;
  if (segment < 6) return TIME_PERIOD.EVENING;
  return TIME_PERIOD.NIGHT;
}

export function getTimePeriodLabel(period: TimePeriod): string {
  const labels: Record<TimePeriod, string> = {
    [TIME_PERIOD.EARLY_MORNING]: 'Early Morning',
    [TIME_PERIOD.LATE_MORNING]: 'Late Morning',
    [TIME_PERIOD.EVENING]: 'Evening',
    [TIME_PERIOD.NIGHT]: 'Night',
  };
  return labels[period];
}

export function getSegmentLabel(segment: number): string {
  const period = getTimePeriod(segment);
  const periodSegment = (segment % 2) + 1;
  return `${getTimePeriodLabel(period)} ${periodSegment}`;
}

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
  faceCost?: number;
  resourceReward?: Partial<CampaignResources>;
  triggersBattle?: boolean;
  battleOpponentIndex?: number;
  bonusReward?: Partial<BattleBonuses>;
  addsEvent?: CalendarEvent; // This choice adds an event to the calendar
  outcomeMessage: string;
}

// Skip event choice (auto-generated for non-boss events)
export const SKIP_EVENT_COST: { resources: Partial<CampaignResources>; face: number } = {
  resources: { rumors: 1 },
  face: 5,
};

export interface CalendarEvent {
  id: string;
  day: number;
  timePeriod?: TimePeriod; // When during the day this event occurs
  name: string;
  description: string;
  type: CalendarEventType;
  resolved: boolean;
  choices?: EventChoice[];
  selectedChoiceId?: string;
  notes?: string[];
  cannotSkip?: boolean; // Boss events cannot be skipped
}

// ==================== ACTION OUTCOMES ====================
export interface ActionOutcome {
  probability: number;
  resourceChanges: Partial<CampaignResources>;
  faceChange?: number; // Can heal or damage face
  eventTrigger?: string;
  addsEvent?: Omit<CalendarEvent, 'resolved'>; // Outcome can add event to calendar
  bonusReward?: Partial<BattleBonuses>;
  message: string;
}

export interface DayAction {
  id: string;
  name: string;
  description: string;
  segmentCost: number; // 1 or 2 segments
  availablePeriods?: TimePeriod[]; // When action is available (if not set, any non-night)
  outcomes: ActionOutcome[];
}

// ==================== BATTLE BONUSES ====================
export interface BattleBonuses {
  startingFavor: number;
  opponentShame: number;
  extraCards: string[];
  patienceBonus: number;
}

// ==================== CAMPAIGN STATE ====================
export interface CampaignState {
  currentDay: number;
  currentSegment: number; // 0-7 (0-5 usable, 6-7 night)
  maxDay: number;

  // Player status
  face: number;
  maxFace: number;
  mustRest: boolean; // True when face = 0, must rest to full

  resources: CampaignResources;
  calendar: CalendarEvent[];
  availableActions: DayAction[];
  bossEvent: CalendarEvent;
  bossIntel: string[];
  battleBonuses: BattleBonuses;

  lastOutcomeMessage: string | null;
  activeEvent: CalendarEvent | null;
  selectedDay: number | null;
  pendingBattle: { opponentIndex: number; eventId: string } | null;
}

// ==================== CAMPAIGN SCREEN ====================
export const CAMPAIGN_SCREEN = {
  CAMPAIGN_MENU: 'campaign-menu',
  CAMPAIGN: 'campaign',
} as const;

export type CampaignScreen = typeof CAMPAIGN_SCREEN[keyof typeof CAMPAIGN_SCREEN];
