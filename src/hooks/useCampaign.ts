import { useState, useCallback } from 'react';
import {
  CampaignState,
  CampaignResources,
  CalendarEvent,
  ActionOutcome,
  BattleBonuses,
  HOURS_PER_DAY,
  STARTING_HOUR,
} from '../types/campaign';
import {
  STARTING_RESOURCES,
  STARTING_BONUSES,
  DAY_ACTIONS,
  SAMPLE_EVENTS,
  BOSS_EVENT,
  BOSS_INTEL_POOL,
} from '../data/campaign';

const MAX_DAY = 30;
const END_OF_DAY_HOUR = STARTING_HOUR + HOURS_PER_DAY; // 17 (5pm end of usable day)

function createInitialState(): CampaignState {
  return {
    currentDay: 1,
    currentHour: STARTING_HOUR,
    maxDay: MAX_DAY,
    resources: { ...STARTING_RESOURCES },
    calendar: SAMPLE_EVENTS.map(e => ({ ...e })),
    availableActions: [...DAY_ACTIONS],
    bossEvent: { ...BOSS_EVENT },
    bossIntel: [],
    battleBonuses: { ...STARTING_BONUSES },
    lastOutcomeMessage: null,
    activeEvent: null,
    selectedDay: null,
    pendingBattle: null,
  };
}

function selectRandomOutcome(outcomes: ActionOutcome[]): ActionOutcome {
  const rand = Math.random();
  let cumulative = 0;

  for (const outcome of outcomes) {
    cumulative += outcome.probability;
    if (rand < cumulative) {
      return outcome;
    }
  }

  return outcomes[outcomes.length - 1];
}

function mergeBonuses(current: BattleBonuses, addition: Partial<BattleBonuses>): BattleBonuses {
  return {
    startingFavor: current.startingFavor + (addition.startingFavor || 0),
    opponentShame: current.opponentShame + (addition.opponentShame || 0),
    extraCards: [...current.extraCards, ...(addition.extraCards || [])],
    patienceBonus: current.patienceBonus + (addition.patienceBonus || 0),
  };
}

export function useCampaign() {
  const [campaign, setCampaign] = useState<CampaignState>(createInitialState);

  const startNewCampaign = useCallback(() => {
    setCampaign(createInitialState());
  }, []);

  // Advance time by hours, rolling over to next day if needed
  const advanceTime = useCallback((hours: number) => {
    setCampaign(prev => {
      let newHour = prev.currentHour + hours;
      let newDay = prev.currentDay;

      // Roll over to next day if past end of day
      while (newHour >= END_OF_DAY_HOUR) {
        newHour = STARTING_HOUR + (newHour - END_OF_DAY_HOUR);
        newDay = Math.min(newDay + 1, prev.maxDay);
      }

      // Check if any calendar events should trigger on entering new day
      const triggeredEvent = prev.calendar.find(
        event => !event.resolved && event.day === newDay &&
        (event.hour === undefined || event.hour <= newHour)
      );

      return {
        ...prev,
        currentDay: newDay,
        currentHour: newHour,
        activeEvent: triggeredEvent || null,
      };
    });
  }, []);

  // Skip to next day (for rest or when day's activities are done)
  const skipToNextDay = useCallback(() => {
    setCampaign(prev => {
      const newDay = Math.min(prev.currentDay + 1, prev.maxDay);

      const triggeredEvent = prev.calendar.find(
        event => !event.resolved && event.day === newDay
      );

      return {
        ...prev,
        currentDay: newDay,
        currentHour: STARTING_HOUR,
        activeEvent: triggeredEvent || null,
      };
    });
  }, []);

  const spendResources = useCallback((cost: Partial<CampaignResources>) => {
    setCampaign(prev => {
      const newResources = { ...prev.resources };
      for (const [key, value] of Object.entries(cost)) {
        if (value) {
          newResources[key as keyof CampaignResources] = Math.max(
            0,
            newResources[key as keyof CampaignResources] - value
          );
        }
      }
      return { ...prev, resources: newResources };
    });
  }, []);

  const gainResources = useCallback((reward: Partial<CampaignResources>) => {
    setCampaign(prev => {
      const newResources = { ...prev.resources };
      for (const [key, value] of Object.entries(reward)) {
        if (value) {
          newResources[key as keyof CampaignResources] = Math.max(
            0,
            newResources[key as keyof CampaignResources] + value
          );
        }
      }
      return { ...prev, resources: newResources };
    });
  }, []);

  // Check if an action is currently available based on time
  const isActionAvailable = useCallback((actionId: string): boolean => {
    const action = campaign.availableActions.find(a => a.id === actionId);
    if (!action) return false;

    // Check time restrictions
    if (action.availableHours) {
      const { start, end } = action.availableHours;
      if (campaign.currentHour < start || campaign.currentHour >= end) {
        return false;
      }
      // Check if there's enough time before the action window closes
      if (campaign.currentHour + action.timeCost > end) {
        return false;
      }
    }

    // Check if action would exceed end of day
    if (campaign.currentHour + action.timeCost > END_OF_DAY_HOUR) {
      return false;
    }

    return true;
  }, [campaign.currentHour, campaign.availableActions]);

  const performAction = useCallback((actionId: string) => {
    setCampaign(prev => {
      const action = prev.availableActions.find(a => a.id === actionId);
      if (!action) return prev;

      // Validate time constraints
      if (action.availableHours) {
        const { start, end } = action.availableHours;
        if (prev.currentHour < start || prev.currentHour + action.timeCost > end) {
          return {
            ...prev,
            lastOutcomeMessage: `${action.name} is not available at this hour.`,
          };
        }
      }

      if (prev.currentHour + action.timeCost > END_OF_DAY_HOUR) {
        return {
          ...prev,
          lastOutcomeMessage: 'Not enough time left today for this action.',
        };
      }

      // Select random outcome
      const outcome = selectRandomOutcome(action.outcomes);

      // Apply resource changes
      const newResources = { ...prev.resources };
      for (const [key, value] of Object.entries(outcome.resourceChanges)) {
        if (value !== undefined) {
          newResources[key as keyof CampaignResources] = Math.max(
            0,
            newResources[key as keyof CampaignResources] + value
          );
        }
      }

      // Advance time
      let newHour = prev.currentHour + action.timeCost;
      let newDay = prev.currentDay;

      if (newHour >= END_OF_DAY_HOUR) {
        newHour = STARTING_HOUR;
        newDay = Math.min(newDay + 1, prev.maxDay);
      }

      // Apply battle bonuses if any
      let newBonuses = prev.battleBonuses;
      if (outcome.bonusReward) {
        newBonuses = mergeBonuses(newBonuses, outcome.bonusReward);
      }

      // Check for boss intel (chance when gaining rumors)
      let newBossIntel = [...prev.bossIntel];
      if (outcome.resourceChanges.rumors && outcome.resourceChanges.rumors > 0) {
        if (Math.random() < 0.3 && newBossIntel.length < BOSS_INTEL_POOL.length) {
          const availableIntel = BOSS_INTEL_POOL.filter(intel => !newBossIntel.includes(intel));
          if (availableIntel.length > 0) {
            const randomIntel = availableIntel[Math.floor(Math.random() * availableIntel.length)];
            newBossIntel.push(randomIntel);
          }
        }
      }

      // Check for triggered calendar events
      const triggeredEvent = prev.calendar.find(
        event => !event.resolved && event.day === newDay &&
        (event.hour === undefined || (prev.currentHour < event.hour && newHour >= event.hour))
      );

      // Check for dynamic event trigger from outcome
      let updatedCalendar = [...prev.calendar];
      if (outcome.eventTrigger) {
        updatedCalendar = updatedCalendar.map(event =>
          event.id === outcome.eventTrigger
            ? { ...event, day: newDay }
            : event
        );
      }

      return {
        ...prev,
        currentDay: newDay,
        currentHour: newHour,
        resources: newResources,
        battleBonuses: newBonuses,
        lastOutcomeMessage: outcome.message,
        bossIntel: newBossIntel,
        calendar: updatedCalendar,
        activeEvent: triggeredEvent || (outcome.eventTrigger
          ? updatedCalendar.find(e => e.id === outcome.eventTrigger) || null
          : null),
      };
    });
  }, []);

  // Handle making a choice during an event
  const makeEventChoice = useCallback((eventId: string, choiceId: string) => {
    setCampaign(prev => {
      const event = prev.calendar.find(e => e.id === eventId) ||
        (prev.bossEvent.id === eventId ? prev.bossEvent : null);
      if (!event || !event.choices) return prev;

      const choice = event.choices.find(c => c.id === choiceId);
      if (!choice) return prev;

      // Check resource costs
      if (choice.resourceCost) {
        for (const [key, value] of Object.entries(choice.resourceCost)) {
          if (value && prev.resources[key as keyof CampaignResources] < value) {
            return {
              ...prev,
              lastOutcomeMessage: `Not enough ${key} for this choice.`,
            };
          }
        }
      }

      // Apply resource cost
      const newResources = { ...prev.resources };
      if (choice.resourceCost) {
        for (const [key, value] of Object.entries(choice.resourceCost)) {
          if (value) {
            newResources[key as keyof CampaignResources] -= value;
          }
        }
      }

      // Apply resource reward
      if (choice.resourceReward) {
        for (const [key, value] of Object.entries(choice.resourceReward)) {
          if (value) {
            newResources[key as keyof CampaignResources] += value;
          }
        }
      }

      // Apply battle bonuses
      let newBonuses = prev.battleBonuses;
      if (choice.bonusReward) {
        newBonuses = mergeBonuses(newBonuses, choice.bonusReward);
      }

      // Update event as resolved with selected choice
      const updatedCalendar = prev.calendar.map(e =>
        e.id === eventId
          ? { ...e, resolved: true, selectedChoiceId: choiceId }
          : e
      );

      const updatedBossEvent = prev.bossEvent.id === eventId
        ? { ...prev.bossEvent, resolved: true, selectedChoiceId: choiceId }
        : prev.bossEvent;

      // Check if choice triggers a battle
      const pendingBattle = choice.triggersBattle && choice.battleOpponentIndex !== undefined
        ? { opponentIndex: choice.battleOpponentIndex, eventId }
        : null;

      return {
        ...prev,
        resources: newResources,
        battleBonuses: newBonuses,
        calendar: updatedCalendar,
        bossEvent: updatedBossEvent,
        lastOutcomeMessage: choice.outcomeMessage,
        activeEvent: null,
        pendingBattle,
      };
    });
  }, []);

  const resolveEvent = useCallback((eventId: string) => {
    setCampaign(prev => ({
      ...prev,
      calendar: prev.calendar.map(event =>
        event.id === eventId ? { ...event, resolved: true } : event
      ),
      activeEvent: null,
    }));
  }, []);

  const addEvent = useCallback((event: CalendarEvent) => {
    setCampaign(prev => ({
      ...prev,
      calendar: [...prev.calendar, event],
    }));
  }, []);

  const dismissOutcomeMessage = useCallback(() => {
    setCampaign(prev => ({
      ...prev,
      lastOutcomeMessage: null,
    }));
  }, []);

  // Select a day to view its info
  const selectDay = useCallback((day: number | null) => {
    setCampaign(prev => ({
      ...prev,
      selectedDay: day,
    }));
  }, []);

  // Clear pending battle after it's been handled
  const clearPendingBattle = useCallback(() => {
    setCampaign(prev => ({
      ...prev,
      pendingBattle: null,
    }));
  }, []);

  // Record battle result (win/loss affects campaign)
  const recordCampaignBattleResult = useCallback((won: boolean, _eventId: string) => {
    setCampaign(prev => {
      // Could add logic here for battle consequences based on eventId
      // For now, just clear the pending battle
      return {
        ...prev,
        pendingBattle: null,
        lastOutcomeMessage: won
          ? 'Victory! Your reputation grows.'
          : 'Defeat... but the campaign continues.',
      };
    });
  }, []);

  const isCampaignOver = campaign.currentDay >= campaign.maxDay;
  const hoursRemainingToday = END_OF_DAY_HOUR - campaign.currentHour;

  return {
    campaign,
    startNewCampaign,
    advanceTime,
    skipToNextDay,
    spendResources,
    gainResources,
    performAction,
    isActionAvailable,
    makeEventChoice,
    resolveEvent,
    addEvent,
    dismissOutcomeMessage,
    selectDay,
    clearPendingBattle,
    recordCampaignBattleResult,
    isCampaignOver,
    hoursRemainingToday,
  };
}
