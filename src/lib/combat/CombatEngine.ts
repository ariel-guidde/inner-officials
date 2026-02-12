import { GameState, Card, STATUS_TRIGGER } from '../../types/game';
import { EffectContext } from '../../types/effects';
import { CombatLog, combatLogger } from '../debug/combatLogger';
import { JUDGES } from '../../data/judges';
import { HARMONY_THRESHOLD, DEFAULT_JUDGE_EFFECTS } from './constants';
import { calculateFlowType } from './modules/harmony';
import { deductFaceCost, calculateEffectiveCosts } from './engine/costCalculator';
import { resolveEffects } from './engine/effectResolver';
import { checkVictory } from './modules/victory';
import { executeAllOpponentActions, applyFlusteredMechanic } from './modules/opponent';
import { checkJudgeTrigger } from './modules/judge';
import { addStanding, getTotalFavor } from './modules/standing';
import { processCoreArgumentTrigger } from './modules/coreArguments';
import { processStatusTrigger, tickStatuses, getModifierMultiplier, getModifierAdditive } from './modules/statuses';
import { MODIFIER_STAT } from '../../types/game';

type DrawCardsFunction = (state: GameState, count: number) => GameState;

/**
 * Core combat engine orchestrating all combat operations
 */
export class CombatEngine {
  /**
   * Process a card play turn
   */
  processTurn(state: GameState, card: Card, drawCards: DrawCardsFunction, log: CombatLog = combatLogger): GameState {
    const beforeState = state;
    let nextState = { ...state };

    // Update logger turn
    log.setTurn(state.turnNumber ?? 1);

    // 1. Flow Calculation
    const flowResult = calculateFlowType(nextState, card.element, HARMONY_THRESHOLD);
    const flowType = flowResult.flowType;

    // 2. Resource Costs (with judge modifiers)
    const judgeEffects = nextState.judge?.effects ?? DEFAULT_JUDGE_EFFECTS;
    const costResult = calculateEffectiveCosts(card, nextState);

    nextState.patience -= costResult.effectivePatienceCost;
    nextState = deductFaceCost(nextState, costResult.effectiveFaceCost);

    // 3. Effect Application (with chaos double-execution)
    const standingBefore = getTotalFavor(nextState.player.standing, nextState.judge.tierStructure);
    const tierBefore = nextState.player.standing.currentTier;

    // Execute card effects (1.5x multiplier if chaos)
    const chaosMultiplier = flowResult.isChaos ? 1.5 : undefined;
    if (card.effects) {
      // Data-driven path
      const effectContext: EffectContext = { sourceCardId: card.id };
      nextState = resolveEffects(nextState, card.effects, effectContext, drawCards, chaosMultiplier);
    } else {
      // Legacy closure path
      nextState = card.effect(nextState, drawCards);
      if (flowResult.isChaos) {
        nextState = card.effect(nextState, drawCards);
      }
    }

    // 4. Apply standing gain modifier from judge and core arguments
    const standingAfter = getTotalFavor(nextState.player.standing, nextState.judge.tierStructure);
    const baseStandingGained = standingAfter - standingBefore;

    if (baseStandingGained > 0) {
      const judgeModifier = judgeEffects.favorGainModifier;
      const statusMultiplier = getModifierMultiplier(nextState, MODIFIER_STAT.FAVOR_GAIN_MULTIPLIER, 'player');
      const statusBonus = getModifierAdditive(nextState, MODIFIER_STAT.STANDING_GAIN, 'player');

      const totalMultiplier = judgeModifier * statusMultiplier;
      const modifiedGain = Math.floor(baseStandingGained * totalMultiplier) + statusBonus - baseStandingGained;

      if (modifiedGain > 0) {
        nextState = addStanding(nextState, 'player', modifiedGain);
      }
    }

    // Check for tier advancement trigger
    const tierAfter = nextState.player.standing.currentTier;
    if (tierAfter > tierBefore) {
      nextState = processCoreArgumentTrigger(nextState, 'on_tier_advance');
    }

    // Process on_card_play trigger
    nextState = processCoreArgumentTrigger(nextState, 'on_card_play');

    // 5. Update State
    nextState.lastElement = card.element;
    nextState.harmonyStreak = flowResult.newHarmonyStreak;

    // 6. Flustered Mechanic - when opponent face breaks
    nextState = applyFlusteredMechanic(nextState, log);

    const finalState = checkVictory(nextState);

    // Log the card play
    log.logCardPlayed(
      card.name,
      card.element,
      { patience: costResult.effectivePatienceCost, face: costResult.effectiveFaceCost },
      flowType,
      beforeState,
      finalState
    );

    if (finalState.isGameOver) {
      log.logSystemEvent('Game Over', { winner: finalState.winner });
    }

    return finalState;
  }

  /**
   * Process end of turn - all opponents act, judge triggers, effects tick
   */
  processEndTurn(state: GameState, log: CombatLog = combatLogger): GameState {
    let nextState = { ...state };
    const judgeEffects = state.judge?.effects ?? DEFAULT_JUDGE_EFFECTS;

    // 1. End turn costs patience
    const endTurnCost = judgeEffects.endTurnPatienceCost;
    nextState.patience -= endTurnCost;

    log.log('system', `End Turn (-${endTurnCost} patience)`, { cost: endTurnCost });

    // 2. All opponents act in sequence
    nextState = executeAllOpponentActions(nextState, log);

    // 2.5. Apply flustered mechanic after opponent actions
    nextState = applyFlusteredMechanic(nextState, log);

    // 3. Check judge trigger
    const judgeActions = this.getJudgeActions(nextState);
    if (judgeActions.length > 0) {
      nextState = checkJudgeTrigger(nextState, endTurnCost, judgeActions, log);
    }

    // 4. Process turn_end statuses
    nextState = processStatusTrigger(nextState, STATUS_TRIGGER.TURN_END);

    // 5. Process core argument turn_end triggers
    nextState = processCoreArgumentTrigger(nextState, 'on_turn_end');

    // 6. Tick status counters and remove expired
    nextState = tickStatuses(nextState);

    // 7. Reset composure (poise) at end of turn
    nextState = {
      ...nextState,
      player: {
        ...nextState.player,
        poise: 0,
      },
    };

    return checkVictory(nextState);
  }

  /**
   * Process start of turn - applies turn_start effects
   */
  processStartTurn(state: GameState): GameState {
    let nextState = { ...state };

    // Process turn_start statuses (healing, poise gain, core argument poise)
    nextState = processStatusTrigger(nextState, STATUS_TRIGGER.TURN_START);

    // Process core argument turn_start triggers
    nextState = processCoreArgumentTrigger(nextState, 'on_turn_start');

    return nextState;
  }

  /**
   * Get judge actions for the current judge in state
   */
  private getJudgeActions(state: GameState) {
    if (!state.judge?.name) {
      return [];
    }
    const judgeTemplate = JUDGES.find((j) => j.name === state.judge.name);
    return judgeTemplate?.judgeActions ?? [];
  }
}

// Singleton instance for convenience
const combatEngine = new CombatEngine();

// Export convenience functions that use the singleton
export function processTurn(state: GameState, card: Card, drawCards: DrawCardsFunction, log?: CombatLog): GameState {
  return combatEngine.processTurn(state, card, drawCards, log);
}

export function processEndTurn(state: GameState, log?: CombatLog): GameState {
  return combatEngine.processEndTurn(state, log);
}

export function processStartTurn(state: GameState): GameState {
  return combatEngine.processStartTurn(state);
}
