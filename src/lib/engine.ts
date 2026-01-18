import { GameState, Card, Element, Intention, JudgeEffects } from '../types/game';
import { combatLogger } from './debug/combatLogger';
import { OPPONENTS, JUDGE_ACTIONS, FLUSTERED_EFFECTS } from '../data/opponents';

type DrawCardsFunction = (state: GameState, count: number) => GameState;

// Default judge effects
export const DEFAULT_JUDGE_EFFECTS: JudgeEffects = {
  endTurnPatienceCost: 1,
  elementCostModifier: {},
  favorGainModifier: 1.0,
  damageModifier: 1.0,
};

export const processTurn = (state: GameState, card: Card, drawCards: DrawCardsFunction): GameState => {
  const beforeState = state;
  let nextState = { ...state };

  // Update logger turn
  combatLogger.setTurn(state.turnNumber ?? 1);

  // 1. Flow Calculation
  const isBalanced = checkBalanced(state.lastElement, card.element);
  const isChaos = checkChaos(state.lastElement, card.element);
  const flowType = isBalanced ? 'balanced' : isChaos ? 'chaos' : 'neutral';

  // 2. Resource Costs (with judge modifiers)
  const judgeEffects = state.judge?.effects ?? DEFAULT_JUDGE_EFFECTS;
  const elementModifier = judgeEffects.elementCostModifier[card.element] ?? 0;

  let finalPatienceCost = card.patienceCost + elementModifier;
  let finalFaceCost = card.faceCost;

  if (isBalanced) {
    finalPatienceCost = Math.max(0, finalPatienceCost - 1);
  } else if (isChaos) {
    finalPatienceCost = finalPatienceCost + 2;
    finalFaceCost = finalFaceCost + 5;
  }

  nextState.patience -= finalPatienceCost;
  nextState.player = { ...nextState.player, face: nextState.player.face - finalFaceCost };

  // 3. Track patience spent for opponent and judge triggers
  nextState = trackPatienceSpent(nextState, finalPatienceCost);

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
  if (isChaos) {
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

  // 8. Flustered Mechanic - when opponent face breaks, push flustered to top of intentions
  if (nextState.opponent.face <= 0) {
    const flustered = pickRandomFlustered();
    nextState.opponent = {
      ...nextState.opponent,
      face: Math.floor(nextState.opponent.maxFace / 2),
      // Push flustered to current, move current to next (losing the old next)
      nextIntention: nextState.opponent.currentIntention,
      currentIntention: flustered,
      patienceSpent: 0, // Reset patience tracking for the new flustered intention
    };
    combatLogger.logSystemEvent('Opponent Flustered', { effect: flustered.name });
  }

  const finalState = checkVictory(nextState);

  // Log the card play
  combatLogger.logCardPlayed(
    card.name,
    card.element,
    { patience: finalPatienceCost, face: finalFaceCost },
    flowType,
    beforeState,
    finalState
  );

  if (finalState.isGameOver) {
    combatLogger.logSystemEvent('Game Over', { winner: finalState.winner });
  }

  return finalState;
};

// Track patience spent and trigger opponent/judge actions when thresholds are reached
const trackPatienceSpent = (state: GameState, patienceSpent: number): GameState => {
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
        nextState.opponent = {
          ...nextState.opponent,
          currentIntention: nextState.opponent.nextIntention || pickRandomIntention(template.intentions),
          nextIntention: pickRandomIntention(template.intentions),
          patienceSpent: 0, // Reset tracking
        };
      }
    }
  }

  // Track for judge
  const newJudgePatienceSpent = (nextState.judge?.patienceSpent || 0) + patienceSpent;
  if (nextState.judge) {
    nextState.judge = { ...nextState.judge, patienceSpent: newJudgePatienceSpent };

    // Check if judge action should trigger
    if (nextState.judge.nextEffect && newJudgePatienceSpent >= nextState.judge.patienceThreshold) {
      const judgeAction = JUDGE_ACTIONS.find((a) => a.name === nextState.judge.nextEffect);
      if (judgeAction) {
        const newEffects = judgeAction.apply(nextState.judge.effects);
        const newAction = pickRandomJudgeAction();
        combatLogger.log('judge', `${judgeAction.name}`, { description: judgeAction.description });

        nextState.judge = {
          effects: newEffects,
          nextEffect: newAction.name,
          patienceThreshold: newAction.patienceThreshold,
          patienceSpent: 0, // Reset tracking
        };
      }
    }
  }

  return nextState;
};

// Process end of turn - costs patience, resets composure
export const processEndTurn = (state: GameState): GameState => {
  let nextState = { ...state };
  const judgeEffects = state.judge?.effects ?? DEFAULT_JUDGE_EFFECTS;

  // 1. End turn costs patience
  const endTurnCost = judgeEffects.endTurnPatienceCost;
  nextState.patience -= endTurnCost;

  combatLogger.log('system', `End Turn (-${endTurnCost} patience)`, { cost: endTurnCost });

  // 2. Track patience spent for opponent and judge triggers
  nextState = trackPatienceSpent(nextState, endTurnCost);

  // 3. Reset composure (poise) at end of turn
  nextState.player = {
    ...nextState.player,
    poise: 0,
  };

  return checkVictory(nextState);
};

// Execute opponent action (separated from cooldown logic)
const executeOpponentAction = (state: GameState, intention: Intention): GameState => {
  const beforeState = state;
  let nextState = { ...state };
  const judgeEffects = state.judge?.effects ?? DEFAULT_JUDGE_EFFECTS;

  if (intention.type === 'attack') {
    const baseDamage = Math.floor(intention.value * judgeEffects.damageModifier);
    const damage = Math.max(0, baseDamage - nextState.player.poise);
    nextState.player = {
      ...nextState.player,
      poise: Math.max(0, nextState.player.poise - baseDamage),
      face: nextState.player.face - damage,
    };
  } else if (intention.type === 'favor') {
    const favorSteal = intention.value;
    nextState.player = {
      ...nextState.player,
      favor: Math.max(0, nextState.player.favor - favorSteal),
    };
    nextState.opponent = {
      ...nextState.opponent,
      favor: Math.min(100, nextState.opponent.favor + favorSteal),
    };
  } else if (intention.type === 'stall') {
    nextState.patience -= intention.value;
  } else if (intention.type === 'flustered') {
    // Flustered does nothing - opponent wastes their action
    combatLogger.logSystemEvent('Opponent Flustered', { effect: intention.name });
  }

  combatLogger.logAIAction(
    intention.name,
    intention.type,
    intention.value,
    beforeState,
    nextState
  );

  return nextState;
};

// Pick a random intention from the pool
const pickRandomIntention = (intentions: Intention[]): Intention => {
  const index = Math.floor(Math.random() * intentions.length);
  return { ...intentions[index] }; // Clone to avoid mutation
};

// Pick a random flustered effect
const pickRandomFlustered = (): Intention => {
  const index = Math.floor(Math.random() * FLUSTERED_EFFECTS.length);
  return { ...FLUSTERED_EFFECTS[index] };
};

// Pick a random judge action
const pickRandomJudgeAction = () => {
  const index = Math.floor(Math.random() * JUDGE_ACTIONS.length);
  return JUDGE_ACTIONS[index];
};

// Legacy function for compatibility - now just checks state
export const resolveAIAction = (state: GameState): GameState => {
  // This is now handled by processEndTurn
  return state;
};

const checkBalanced = (last: Element | null, current: Element) => {
  const cycle: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];
  if (!last) return true;
  return cycle[(cycle.indexOf(last) + 1) % 5] === current;
};

const checkChaos = (last: Element | null, current: Element) => {
  const cycle: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];
  if (!last) return false;
  return cycle[(cycle.indexOf(last) + 2) % 5] === current;
};

const checkVictory = (s: GameState): GameState => {
  if (s.player.face <= 0) return { ...s, isGameOver: true, winner: 'opponent' };
  if (s.player.favor >= 100) return { ...s, isGameOver: true, winner: 'player' };
  if (s.opponent.favor >= 100) return { ...s, isGameOver: true, winner: 'opponent' };
  if (s.patience <= 0) {
    // When patience runs out, compare favor
    if (s.player.favor > s.opponent.favor) {
      return { ...s, isGameOver: true, winner: 'player' };
    } else if (s.opponent.favor > s.player.favor) {
      return { ...s, isGameOver: true, winner: 'opponent' };
    } else {
      // Tie goes to player if they have at least 50 favor
      return { ...s, isGameOver: true, winner: s.player.favor >= 50 ? 'player' : 'opponent' };
    }
  }
  return s;
};
