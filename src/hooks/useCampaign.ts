import { useState, useCallback } from 'react';
import {
  CampaignState,
  CampaignResources,
  CalendarEvent,
  ActionOutcome,
  BattleBonuses,
  SEGMENTS_PER_DAY,
  NIGHT_START_SEGMENT,
  SKIP_EVENT_COST,
  getTimePeriod,
} from '../types/campaign';
import {
  STARTING_RESOURCES,
  STARTING_BONUSES,
  DAY_ACTIONS,
  SAMPLE_EVENTS,
  BOSS_EVENT,
  BOSS_INTEL_POOL,
  STARTING_FACE,
  MAX_FACE,
  REST_FACE_HEAL,
} from '../data/campaign';

const MAX_DAY = 30;

function createInitialState(): CampaignState {
  return {
    currentDay: 1,
    currentSegment: 0,
    maxDay: MAX_DAY,
    face: STARTING_FACE,
    maxFace: MAX_FACE,
    mustRest: false,
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
    if (rand < cumulative) return outcome;
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

  // Check if it's night time
  const isNightTime = useCallback((): boolean => {
    return campaign.currentSegment >= NIGHT_START_SEGMENT;
  }, [campaign.currentSegment]);

  // Check if action is available based on time and face
  const isActionAvailable = useCallback((actionId: string): boolean => {
    const action = campaign.availableActions.find(a => a.id === actionId);
    if (!action) return false;

    // If must rest, only rest action is available
    if (campaign.mustRest && actionId !== 'rest') return false;

    // Check if it's night time - only rest is allowed
    if (isNightTime() && actionId !== 'rest') return false;

    // Check segment cost
    const segmentsRemaining = NIGHT_START_SEGMENT - campaign.currentSegment;
    if (!isNightTime() && action.segmentCost > segmentsRemaining) return false;

    // Check time period restrictions
    if (action.availablePeriods && action.availablePeriods.length > 0) {
      const currentPeriod = getTimePeriod(campaign.currentSegment);
      if (!action.availablePeriods.includes(currentPeriod)) return false;

      // Check if there's enough time before period ends
      const segmentInPeriod = campaign.currentSegment % 2;
      const segmentsLeftInPeriod = 2 - segmentInPeriod;
      if (action.segmentCost > segmentsLeftInPeriod) {
        // Check if action can continue into valid periods
        const nextPeriod = getTimePeriod(campaign.currentSegment + segmentsLeftInPeriod);
        if (!action.availablePeriods.includes(nextPeriod)) return false;
      }
    }

    return true;
  }, [campaign.currentSegment, campaign.mustRest, campaign.availableActions, isNightTime]);

  // Check for events at a given day/segment
  function checkForEvent(
    calendar: CalendarEvent[],
    bossEvent: CalendarEvent,
    day: number,
    segment: number,
    prevDay: number,
    prevSegment: number
  ): CalendarEvent | null {
    const currentPeriod = getTimePeriod(segment);

    // Check boss event first
    if (bossEvent.day === day && !bossEvent.resolved) {
      if (bossEvent.timePeriod === currentPeriod || !bossEvent.timePeriod) {
        if (prevDay < day || (prevDay === day && getTimePeriod(prevSegment) !== currentPeriod)) {
          return bossEvent;
        }
      }
    }

    // Check calendar events
    for (const event of calendar) {
      if (event.resolved || event.day !== day) continue;
      if (event.timePeriod && event.timePeriod !== currentPeriod) continue;

      // Event triggers when we enter its day/period
      if (prevDay < day || (prevDay === day && event.timePeriod && getTimePeriod(prevSegment) !== currentPeriod)) {
        return event;
      }
    }

    return null;
  }

  // Rest until next day
  const restUntilDawn = useCallback(() => {
    setCampaign(prev => {
      const segmentsToRest = SEGMENTS_PER_DAY - prev.currentSegment;
      const faceHealed = segmentsToRest * REST_FACE_HEAL;
      const newFace = Math.min(prev.face + faceHealed, prev.maxFace);
      const newDay = Math.min(prev.currentDay + 1, prev.maxDay);

      // Check if still need to rest
      const stillMustRest = prev.mustRest && newFace < prev.maxFace;

      // Check for events on the new day
      const triggeredEvent = checkForEvent(prev.calendar, prev.bossEvent, newDay, 0, prev.currentDay, prev.currentSegment);

      return {
        ...prev,
        currentDay: newDay,
        currentSegment: 0,
        face: newFace,
        mustRest: stillMustRest,
        lastOutcomeMessage: `You rested through the night and recovered ${faceHealed} face.`,
        activeEvent: triggeredEvent,
      };
    });
  }, []);

  // Perform an action
  const performAction = useCallback((actionId: string) => {
    setCampaign(prev => {
      const action = prev.availableActions.find(a => a.id === actionId);
      if (!action) return prev;

      // Validate availability
      if (prev.mustRest && actionId !== 'rest') {
        return { ...prev, lastOutcomeMessage: 'You must rest until your face is restored.' };
      }

      if (prev.currentSegment >= NIGHT_START_SEGMENT && actionId !== 'rest') {
        return { ...prev, lastOutcomeMessage: 'It is night. You can only rest.' };
      }

      // Select random outcome
      const outcome = selectRandomOutcome(action.outcomes);

      // Apply resource changes
      const newResources = { ...prev.resources };
      for (const [key, value] of Object.entries(outcome.resourceChanges)) {
        if (value !== undefined) {
          newResources[key as keyof CampaignResources] = Math.max(0, newResources[key as keyof CampaignResources] + value);
        }
      }

      // Apply face change
      let newFace = prev.face + (outcome.faceChange || 0);
      newFace = Math.max(0, Math.min(newFace, prev.maxFace));

      // Check if must rest (face hit 0)
      const newMustRest = newFace === 0 || (prev.mustRest && newFace < prev.maxFace);

      // Advance segments
      let newSegment = prev.currentSegment + action.segmentCost;
      let newDay = prev.currentDay;

      if (newSegment >= SEGMENTS_PER_DAY) {
        newSegment = 0;
        newDay = Math.min(newDay + 1, prev.maxDay);
      }

      // Apply battle bonuses
      let newBonuses = prev.battleBonuses;
      if (outcome.bonusReward) {
        newBonuses = mergeBonuses(newBonuses, outcome.bonusReward);
      }

      // Check for boss intel
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

      // Handle event added by outcome
      let newCalendar = [...prev.calendar];
      if (outcome.addsEvent) {
        const futureDay = newDay + Math.floor(Math.random() * 5) + 2; // 2-6 days from now
        if (futureDay <= prev.maxDay) {
          newCalendar.push({
            ...outcome.addsEvent,
            id: `${outcome.addsEvent.id}-${Date.now()}`,
            day: futureDay,
            resolved: false,
          });
        }
      }

      // Check for triggered events
      const triggeredEvent = checkForEvent(newCalendar, prev.bossEvent, newDay, newSegment, prev.currentDay, prev.currentSegment);

      return {
        ...prev,
        currentDay: newDay,
        currentSegment: newSegment,
        face: newFace,
        mustRest: newMustRest,
        resources: newResources,
        battleBonuses: newBonuses,
        bossIntel: newBossIntel,
        calendar: newCalendar,
        lastOutcomeMessage: outcome.message,
        activeEvent: triggeredEvent,
      };
    });
  }, []);

  // Make a choice during an event
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
            return { ...prev, lastOutcomeMessage: `Not enough ${key} for this choice.` };
          }
        }
      }

      // Check face cost
      if (choice.faceCost && prev.face < choice.faceCost) {
        return { ...prev, lastOutcomeMessage: 'Not enough face for this choice.' };
      }

      // Apply resource cost
      const newResources = { ...prev.resources };
      if (choice.resourceCost) {
        for (const [key, value] of Object.entries(choice.resourceCost)) {
          if (value) newResources[key as keyof CampaignResources] -= value;
        }
      }

      // Apply resource reward
      if (choice.resourceReward) {
        for (const [key, value] of Object.entries(choice.resourceReward)) {
          if (value) newResources[key as keyof CampaignResources] += value;
        }
      }

      // Apply face cost
      let newFace = prev.face - (choice.faceCost || 0);
      newFace = Math.max(0, newFace);
      const newMustRest = newFace === 0;

      // Apply battle bonuses
      let newBonuses = prev.battleBonuses;
      if (choice.bonusReward) {
        newBonuses = mergeBonuses(newBonuses, choice.bonusReward);
      }

      // Handle added events
      let newCalendar = [...prev.calendar];
      if (choice.addsEvent) {
        const futureDay = prev.currentDay + Math.floor(Math.random() * 5) + 2;
        if (futureDay <= prev.maxDay) {
          newCalendar.push({
            ...choice.addsEvent,
            id: `${choice.addsEvent.id}-${Date.now()}`,
            day: futureDay,
            resolved: false,
          });
        }
      }

      // Update event as resolved
      newCalendar = newCalendar.map(e =>
        e.id === eventId ? { ...e, resolved: true, selectedChoiceId: choiceId } : e
      );

      const updatedBossEvent = prev.bossEvent.id === eventId
        ? { ...prev.bossEvent, resolved: true, selectedChoiceId: choiceId }
        : prev.bossEvent;

      // Check if triggers battle
      const pendingBattle = choice.triggersBattle && choice.battleOpponentIndex !== undefined
        ? { opponentIndex: choice.battleOpponentIndex, eventId }
        : null;

      return {
        ...prev,
        resources: newResources,
        face: newFace,
        mustRest: newMustRest,
        battleBonuses: newBonuses,
        calendar: newCalendar,
        bossEvent: updatedBossEvent,
        lastOutcomeMessage: choice.outcomeMessage,
        activeEvent: null,
        pendingBattle,
      };
    });
  }, []);

  // Skip an event (costs resources and face)
  const skipEvent = useCallback((eventId: string) => {
    setCampaign(prev => {
      const event = prev.calendar.find(e => e.id === eventId);
      if (!event || event.cannotSkip) return prev;

      // Check if can afford skip cost
      const cost = SKIP_EVENT_COST;
      for (const [key, value] of Object.entries(cost.resources)) {
        if (value && prev.resources[key as keyof CampaignResources] < value) {
          return { ...prev, lastOutcomeMessage: `Cannot skip - need ${value} ${key}.` };
        }
      }
      if (prev.face < cost.face) {
        return { ...prev, lastOutcomeMessage: `Cannot skip - need ${cost.face} face.` };
      }

      // Apply costs
      const newResources = { ...prev.resources };
      for (const [key, value] of Object.entries(cost.resources)) {
        if (value) newResources[key as keyof CampaignResources] -= value;
      }
      const newFace = Math.max(0, prev.face - cost.face);
      const newMustRest = newFace === 0;

      // Mark event as resolved
      const newCalendar = prev.calendar.map(e =>
        e.id === eventId ? { ...e, resolved: true, selectedChoiceId: 'skipped' } : e
      );

      return {
        ...prev,
        resources: newResources,
        face: newFace,
        mustRest: newMustRest,
        calendar: newCalendar,
        lastOutcomeMessage: `You chose not to attend ${event.name}, damaging your reputation.`,
        activeEvent: null,
      };
    });
  }, []);

  // Can afford to skip
  const canSkipEvent = useCallback((eventId: string): boolean => {
    const event = campaign.calendar.find(e => e.id === eventId) || campaign.bossEvent;
    if (!event || event.cannotSkip) return false;

    const cost = SKIP_EVENT_COST;
    for (const [key, value] of Object.entries(cost.resources)) {
      if (value && campaign.resources[key as keyof CampaignResources] < value) return false;
    }
    return campaign.face >= cost.face;
  }, [campaign.calendar, campaign.bossEvent, campaign.resources, campaign.face]);

  // Can afford a choice
  const canAffordChoice = useCallback((choice: { resourceCost?: Partial<CampaignResources>; faceCost?: number }): boolean => {
    if (choice.resourceCost) {
      for (const [key, value] of Object.entries(choice.resourceCost)) {
        if (value && campaign.resources[key as keyof CampaignResources] < value) return false;
      }
    }
    if (choice.faceCost && campaign.face < choice.faceCost) return false;
    return true;
  }, [campaign.resources, campaign.face]);

  const resolveEvent = useCallback((eventId: string) => {
    setCampaign(prev => ({
      ...prev,
      calendar: prev.calendar.map(e => e.id === eventId ? { ...e, resolved: true } : e),
      activeEvent: null,
    }));
  }, []);

  const dismissOutcomeMessage = useCallback(() => {
    setCampaign(prev => ({ ...prev, lastOutcomeMessage: null }));
  }, []);

  const selectDay = useCallback((day: number | null) => {
    setCampaign(prev => ({ ...prev, selectedDay: day }));
  }, []);

  const clearPendingBattle = useCallback(() => {
    setCampaign(prev => ({ ...prev, pendingBattle: null }));
  }, []);

  const recordCampaignBattleResult = useCallback((won: boolean, _eventId: string) => {
    setCampaign(prev => ({
      ...prev,
      pendingBattle: null,
      face: won ? prev.face : Math.max(0, prev.face - 20), // Lose face on defeat
      mustRest: !won && prev.face <= 20,
      lastOutcomeMessage: won
        ? 'Victory! Your reputation grows.'
        : 'Defeat... You lost face in the court.',
    }));
  }, []);

  const segmentsRemainingToday = Math.max(0, NIGHT_START_SEGMENT - campaign.currentSegment);
  const isCampaignOver = campaign.currentDay >= campaign.maxDay;
  const currentPeriod = getTimePeriod(campaign.currentSegment);

  return {
    campaign,
    startNewCampaign,
    performAction,
    isActionAvailable,
    makeEventChoice,
    skipEvent,
    canSkipEvent,
    canAffordChoice,
    resolveEvent,
    dismissOutcomeMessage,
    selectDay,
    restUntilDawn,
    clearPendingBattle,
    recordCampaignBattleResult,
    segmentsRemainingToday,
    isCampaignOver,
    currentPeriod,
    isNightTime: isNightTime(),
  };
}
