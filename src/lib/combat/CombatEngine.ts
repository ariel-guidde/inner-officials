import { GameState, Card } from '../../types/game';
import { combatLogger } from '../debug/combatLogger';
import { OPPONENTS } from '../../data/opponents';
import { JUDGES } from '../../data/judges';
import { HARMONY_THRESHOLD, DEFAULT_JUDGE_EFFECTS } from './constants';
import { processEffects, tickEffects } from './effects';
import { calculateFlowType } from './modules/harmony';
import { deductFaceCost, calculateEffectiveCosts } from './modules/costs';
import { checkVictory } from './modules/victory';
import { executeOpponentAction, advanceOpponentIntention, applyFlusteredMechanic } from './modules/opponent';
import { checkJudgeTrigger } from './modules/judge';
import { consumeRevealTrigger } from './modules/events';

type DrawCardsFunction = (state: GameState, count: number) => GameState;

/**
 * Core combat engine orchestrating all combat operations
 */
export class CombatEngine {
  /**
   * Process a card play turn
   */
  processTurn(state: GameState, card: Card, drawCards: DrawCardsFunction): GameState {
    const beforeState = state;
    let nextState = { ...state };

    // Update logger turn
    combatLogger.setTurn(state.turnNumber ?? 1);

    // 1. Flow Calculation
    const flowResult = calculateFlowType(nextState, card.element, HARMONY_THRESHOLD);
    const flowType = flowResult.flowType;

    // 2. Resource Costs (with judge modifiers)
    const judgeEffects = nextState.judge?.effects ?? DEFAULT_JUDGE_EFFECTS;
    const costResult = calculateEffectiveCosts(card, nextState);

    nextState.patience -= costResult.effectivePatienceCost;
    // Use composure (poise) before face for face costs
    nextState = deductFaceCost(nextState, costResult.effectiveFaceCost);

    // 3. Track patience spent for opponent and judge triggers
    nextState = this.trackPatienceSpent(nextState, costResult.effectivePatienceCost);

    // 4. Effect Application
    nextState = card.effect(nextState, drawCards);

    // 5. Apply favor gain modifier
    const favorGained = nextState.player.favor - beforeState.player.favor;
    if (favorGained > 0 && judgeEffects.favorGainModifier !== 1.0) {
      const modifiedGain = Math.floor(favorGained * judgeEffects.favorGainModifier);
      nextState.player = {
        ...nextState.player,
        favor: Math.min(100, beforeState.player.favor + modifiedGain),
      };
    }

    // 6. Chaos Bonus (high reward)
    if (flowResult.isChaos) {
      const chaosFavor = Math.floor(10 * judgeEffects.favorGainModifier);
      const chaosDamage = Math.floor(8 * judgeEffects.damageModifier);
      nextState.player = {
        ...nextState.player,
        favor: Math.min(100, nextState.player.favor + chaosFavor),
      };
      nextState.opponent = {
        ...nextState.opponent,
        face: nextState.opponent.face - chaosDamage,
      };
    }

    // 7. Update State
    nextState.lastElement = card.element;
    nextState.harmonyStreak = flowResult.newHarmonyStreak;

    // 8. Flustered Mechanic - when opponent face breaks, push flustered to top of intentions
    nextState = applyFlusteredMechanic(nextState);

    const finalState = checkVictory(nextState);

    // Log the card play
    combatLogger.logCardPlayed(
      card.name,
      card.element,
      { patience: costResult.effectivePatienceCost, face: costResult.effectiveFaceCost },
      flowType,
      beforeState,
      finalState
    );

    if (finalState.isGameOver) {
      combatLogger.logSystemEvent('Game Over', { winner: finalState.winner });
    }

    return finalState;
  }

  /**
   * Process end of turn - costs patience, resets composure, processes effects
   */
  processEndTurn(state: GameState): GameState {
    let nextState = { ...state };
    const judgeEffects = state.judge?.effects ?? DEFAULT_JUDGE_EFFECTS;

    // 1. End turn costs patience
    const endTurnCost = judgeEffects.endTurnPatienceCost;
    nextState.patience -= endTurnCost;

    combatLogger.log('system', `End Turn (-${endTurnCost} patience)`, { cost: endTurnCost });

    // 2. Always trigger opponent action when ending turn (as if patience threshold reached)
    if (nextState.opponent.currentIntention) {
      nextState = executeOpponentAction(nextState, nextState.opponent.currentIntention);
      // Move to next intention
      const template = OPPONENTS.find((o) => o.name === nextState.opponent.name);
      if (template) {
        nextState = advanceOpponentIntention(nextState);
        // Consume a reveal trigger when intention changes
        nextState = consumeRevealTrigger(nextState);
      }
    }

    // 3. Track patience spent for judge triggers only (opponent already handled above)
    // We need to manually track judge patience since trackPatienceSpent also handles opponent
    const judgeActions = this.getJudgeActions(nextState);
    if (judgeActions.length > 0) {
      nextState = checkJudgeTrigger(nextState, endTurnCost, judgeActions);
    }

    // 4. Process turn_end effects (e.g., wood cards that give favor at end of turn)
    nextState = processEffects(nextState, 'turn_end');

    // 5. Tick effect counters and remove expired effects
    nextState = tickEffects(nextState);

    // 6. Reset composure (poise) at end of turn
    nextState.player = {
      ...nextState.player,
      poise: 0,
    };

    return checkVictory(nextState);
  }

  /**
   * Process start of turn - applies turn_start effects
   */
  processStartTurn(state: GameState): GameState {
    let nextState = { ...state };

    // Process turn_start effects (e.g., healing, poise gain)
    nextState = processEffects(nextState, 'turn_start');

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

  /**
   * Track patience spent and trigger opponent/judge actions when thresholds are reached
   */
  private trackPatienceSpent(state: GameState, patienceSpent: number): GameState {
    let nextState = { ...state };

    // Track for opponent intention
    const newOpponentPatienceSpent = (nextState.opponent.patienceSpent || 0) + patienceSpent;
    nextState.opponent = { ...nextState.opponent, patienceSpent: newOpponentPatienceSpent };

    // Check if opponent intention should trigger
    if (nextState.opponent.currentIntention) {
      const threshold = nextState.opponent.currentIntention.patienceThreshold;
      if (newOpponentPatienceSpent >= threshold) {
        nextState = executeOpponentAction(nextState, nextState.opponent.currentIntention);
        // Move to next intention
        const template = OPPONENTS.find((o) => o.name === nextState.opponent.name);
        if (template) {
          nextState = advanceOpponentIntention(nextState);
          // Consume a reveal trigger when intention changes
          nextState = consumeRevealTrigger(nextState);
        }
      }
    }

    // Track for judge
    const judgeActions = this.getJudgeActions(nextState);
    if (judgeActions.length > 0) {
      nextState = checkJudgeTrigger(nextState, patienceSpent, judgeActions);
    }

    return nextState;
  }
}

// Singleton instance for convenience
const combatEngine = new CombatEngine();

// Export convenience functions that use the singleton
export function processTurn(state: GameState, card: Card, drawCards: DrawCardsFunction): GameState {
  return combatEngine.processTurn(state, card, drawCards);
}

export function processEndTurn(state: GameState): GameState {
  return combatEngine.processEndTurn(state);
}

export function processStartTurn(state: GameState): GameState {
  return combatEngine.processStartTurn(state);
}
