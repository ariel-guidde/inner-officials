import { GameState, Card, Element, Intention, JudgeEffects, BoardEffect, IntentionModifier, GameEvent } from '../types/game';
import { combatLogger } from './debug/combatLogger';
import { OPPONENTS, JUDGE_ACTIONS, FLUSTERED_EFFECTS } from '../data/opponents';
import { processEffects, tickEffects, addActiveEffect } from './effects';

type DrawCardsFunction = (state: GameState, count: number) => GameState;

// Default judge effects
export const DEFAULT_JUDGE_EFFECTS: JudgeEffects = {
  endTurnPatienceCost: 1,
  elementCostModifier: {},
  favorGainModifier: 1.0,
  damageModifier: 1.0,
  activeDecrees: [],
};

// ==================== COMPOSURE BEFORE FACE ====================
// Deduct face cost using poise (composure) first, then face
const deductFaceCost = (state: GameState, cost: number): GameState => {
  const poiseUsed = Math.min(state.player.poise, cost);
  const faceCost = cost - poiseUsed;
  return {
    ...state,
    player: {
      ...state.player,
      poise: state.player.poise - poiseUsed,
      face: state.player.face - faceCost,
    },
  };
};

// ==================== BOARD EFFECTS ====================
export const addBoardEffect = (state: GameState, effect: Omit<BoardEffect, 'id'>): GameState => {
  const newEffect: BoardEffect = {
    ...effect,
    id: `be_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  return {
    ...state,
    boardEffects: [...state.boardEffects, newEffect],
  };
};

export const removeBoardEffect = (state: GameState, effectId: string): GameState => {
  return {
    ...state,
    boardEffects: state.boardEffects.filter(e => e.id !== effectId),
  };
};

// Check and consume trap effects (like negate_next_attack)
const checkTrapEffects = (state: GameState, intention: Intention): { state: GameState; intention: Intention | null } => {
  let nextState = { ...state };
  let modifiedIntention: Intention | null = intention;

  // Check for negate_next_attack
  const negateEffect = nextState.boardEffects.find(e => e.effectType === 'negate_next_attack');
  if (negateEffect && intention.type === 'attack') {
    // Remove the effect and negate the attack
    nextState = removeBoardEffect(nextState, negateEffect.id);
    combatLogger.log('system', `${negateEffect.name} negated the attack!`, { effect: negateEffect.name });
    modifiedIntention = null; // Attack is completely negated
  }

  return { state: nextState, intention: modifiedIntention };
};

// ==================== INTENTION MODIFIERS ====================
export const addIntentionModifier = (state: GameState, modifier: Omit<IntentionModifier, 'id'>): GameState => {
  const newModifier: IntentionModifier = {
    ...modifier,
    id: `im_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  return {
    ...state,
    intentionModifiers: [...state.intentionModifiers, newModifier],
  };
};

// Apply intention modifiers and consume triggers
const applyIntentionModifiers = (state: GameState, intention: Intention): { state: GameState; intention: Intention } => {
  let nextState = { ...state };
  let modifiedIntention = { ...intention };
  const remainingModifiers: IntentionModifier[] = [];

  for (const modifier of nextState.intentionModifiers) {
    modifiedIntention = modifier.modify(modifiedIntention);
    const remaining = modifier.remainingTriggers - 1;
    if (remaining > 0) {
      remainingModifiers.push({ ...modifier, remainingTriggers: remaining });
    }
  }

  nextState.intentionModifiers = remainingModifiers;
  return { state: nextState, intention: modifiedIntention };
};

// ==================== EVENT EMISSION ====================
export const emitGameEvent = (state: GameState, event: Omit<GameEvent, 'id'>): GameState => {
  const newEvent: GameEvent = {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  return {
    ...state,
    pendingEvents: [...state.pendingEvents, newEvent],
  };
};

// Helper to reveal next intention (legacy - use addRevealEffect instead)
export const revealNextIntention = (state: GameState): GameState => {
  return addRevealEffect(state, 1);
};

// Add reveal effect with counter tracking
export const addRevealEffect = (state: GameState, count: number = 1): GameState => {
  // Check if reveal effect already exists
  const existingReveal = state.activeEffects.find(e => e.name === 'Keen Insight');
  
  if (existingReveal) {
    // Add to existing counter
    return {
      ...state,
      activeEffects: state.activeEffects.map(e => 
        e.name === 'Keen Insight' 
          ? { ...e, remainingTriggers: (e.remainingTriggers ?? 0) + count }
          : e
      ),
      player: { ...state.player, canSeeNextIntention: true },
    };
  }
  
  // Create new effect
  const newState = addActiveEffect(state, {
    name: 'Keen Insight',
    description: `Reveal next ${count} intention(s)`,
    element: 'metal',
    trigger: 'passive',
    remainingTurns: -1,
    remainingTriggers: count,
    apply: (s) => s, // Passive - actual reveal is in canSeeNextIntention
    isPositive: true,
  });
  
  // Set canSeeNextIntention to true
  return {
    ...newState,
    player: { ...newState.player, canSeeNextIntention: true },
  };
};

export const processTurn = (state: GameState, card: Card, drawCards: DrawCardsFunction): GameState => {
  const beforeState = state;
  let nextState = { ...state };

  // Update logger turn
  combatLogger.setTurn(state.turnNumber ?? 1);

  // Harmony threshold constant
  const HARMONY_THRESHOLD = 5;

  // 1. Flow Calculation
  const isBalanced = checkBalanced(state.lastElement, card.element);
  const isChaos = checkChaos(state.lastElement, card.element);
  const flowType = isBalanced ? 'balanced' : isChaos ? 'chaos' : 'neutral';

  let newHarmonyStreak = state.harmonyStreak ?? 0;
  if (isBalanced) {
    newHarmonyStreak = Math.min(HARMONY_THRESHOLD, newHarmonyStreak + 1);
  } else if (isChaos) {
    newHarmonyStreak = 0; // Chaos fast-tracks harmony
  } else {
    newHarmonyStreak = Math.max(0, newHarmonyStreak - 1);
  }
  const isInHarmony = newHarmonyStreak >= HARMONY_THRESHOLD;

  // 2. Resource Costs (with judge modifiers)
  const judgeEffects = state.judge?.effects ?? DEFAULT_JUDGE_EFFECTS;
  const elementModifier = judgeEffects.elementCostModifier[card.element] ?? 0;

  let finalPatienceCost = card.patienceCost + elementModifier;
  let finalFaceCost = card.faceCost;

  // Only apply harmony discount if in harmony mode (5+ consecutive cards)
  if (isBalanced && isInHarmony) {
    finalPatienceCost = Math.max(0, finalPatienceCost - 1);
  } else if (isChaos) {
    finalPatienceCost = finalPatienceCost + 2;
    finalFaceCost = finalFaceCost + 5;
  }

  nextState.patience -= finalPatienceCost;
  // Use composure (poise) before face for face costs
  nextState = deductFaceCost(nextState, finalFaceCost);

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
  nextState.harmonyStreak = newHarmonyStreak;

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
            
            // Consume a reveal trigger when intention changes
            const revealEffect = nextState.activeEffects.find(e => e.name === 'Keen Insight');
            if (revealEffect && revealEffect.remainingTriggers !== undefined) {
              const remaining = revealEffect.remainingTriggers - 1;
              if (remaining <= 0) {
                // Remove effect and hide next intention
                nextState = {
                  ...nextState,
                  activeEffects: nextState.activeEffects.filter(e => e.name !== 'Keen Insight'),
                  player: { ...nextState.player, canSeeNextIntention: false },
                };
              } else {
                // Decrement counter
                nextState = {
                  ...nextState,
                  activeEffects: nextState.activeEffects.map(e =>
                    e.name === 'Keen Insight' ? { ...e, remainingTriggers: remaining } : e
                  ),
                };
              }
            }
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

        // Accumulate the decree in activeDecrees
        const newDecree = {
          name: judgeAction.name,
          description: judgeAction.description,
          turnApplied: nextState.turnNumber || 1,
        };

        nextState.judge = {
          effects: {
            ...newEffects,
            activeDecrees: [...(nextState.judge.effects.activeDecrees || []), newDecree],
          },
          nextEffect: newAction.name,
          patienceThreshold: newAction.patienceThreshold,
          patienceSpent: 0, // Reset tracking
        };

        // Emit judge decree event
        nextState = emitGameEvent(nextState, {
          type: 'judge_decree',
          name: judgeAction.name,
          description: judgeAction.description,
        });
      }
    }
  }

  return nextState;
};

// Process end of turn - costs patience, resets composure, processes effects
export const processEndTurn = (state: GameState): GameState => {
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
      nextState.opponent = {
        ...nextState.opponent,
        currentIntention: nextState.opponent.nextIntention || pickRandomIntention(template.intentions),
        nextIntention: pickRandomIntention(template.intentions),
        patienceSpent: 0, // Reset tracking
      };
      
      // Consume a reveal trigger when intention changes
      const revealEffect = nextState.activeEffects.find(e => e.name === 'Keen Insight');
      if (revealEffect && revealEffect.remainingTriggers !== undefined) {
        const remaining = revealEffect.remainingTriggers - 1;
        if (remaining <= 0) {
          // Remove effect and hide next intention
          nextState = {
            ...nextState,
            activeEffects: nextState.activeEffects.filter(e => e.name !== 'Keen Insight'),
            player: { ...nextState.player, canSeeNextIntention: false },
          };
        } else {
          // Decrement counter
          nextState = {
            ...nextState,
            activeEffects: nextState.activeEffects.map(e =>
              e.name === 'Keen Insight' ? { ...e, remainingTriggers: remaining } : e
            ),
          };
        }
      }
    }
  }

  // 3. Track patience spent for judge triggers only (opponent already handled above)
  // We need to manually track judge patience since trackPatienceSpent also handles opponent
  const newJudgePatienceSpent = (nextState.judge?.patienceSpent || 0) + endTurnCost;
  if (nextState.judge) {
    nextState.judge = { ...nextState.judge, patienceSpent: newJudgePatienceSpent };

    // Check if judge action should trigger
    if (nextState.judge.nextEffect && newJudgePatienceSpent >= nextState.judge.patienceThreshold) {
      const judgeAction = JUDGE_ACTIONS.find((a) => a.name === nextState.judge.nextEffect);
      if (judgeAction) {
        const newEffects = judgeAction.apply(nextState.judge.effects);
        const newAction = pickRandomJudgeAction();
        combatLogger.log('judge', `${judgeAction.name}`, { description: judgeAction.description });

        // Accumulate the decree in activeDecrees
        const newDecree = {
          name: judgeAction.name,
          description: judgeAction.description,
          turnApplied: nextState.turnNumber || 1,
        };

        nextState.judge = {
          effects: {
            ...newEffects,
            activeDecrees: [...(nextState.judge.effects.activeDecrees || []), newDecree],
          },
          nextEffect: newAction.name,
          patienceThreshold: newAction.patienceThreshold,
          patienceSpent: 0, // Reset tracking
        };

        // Emit judge decree event
        nextState = emitGameEvent(nextState, {
          type: 'judge_decree',
          name: judgeAction.name,
          description: judgeAction.description,
        });
      }
    }
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
};

// Process start of turn - applies turn_start effects
export const processStartTurn = (state: GameState): GameState => {
  let nextState = { ...state };

  // Process turn_start effects (e.g., healing, poise gain)
  nextState = processEffects(nextState, 'turn_start');

  return nextState;
};

// Execute opponent action (separated from cooldown logic)
const executeOpponentAction = (state: GameState, intention: Intention): GameState => {
  const beforeState = state;
  let nextState = { ...state };
  const judgeEffects = state.judge?.effects ?? DEFAULT_JUDGE_EFFECTS;

  // Apply intention modifiers first (e.g., halve attack damage)
  const modifierResult = applyIntentionModifiers(nextState, intention);
  nextState = modifierResult.state;
  let modifiedIntention: Intention | null = modifierResult.intention;

  // Check for trap effects (e.g., negate_next_attack)
  if (modifiedIntention) {
    const trapResult = checkTrapEffects(nextState, modifiedIntention);
    nextState = trapResult.state;
    modifiedIntention = trapResult.intention;
  }

  // If intention was negated, emit event and return
  if (!modifiedIntention) {
    nextState = emitGameEvent(nextState, {
      type: 'opponent_action',
      name: intention.name,
      description: 'Attack was negated!',
      actionType: intention.type as 'attack' | 'favor' | 'stall',
      value: 0,
      statChanges: {},
    });
    return nextState;
  }

  // Track stat changes for event emission
  let statChanges: { playerFace?: number; playerFavor?: number } = {};

  if (modifiedIntention.type === 'attack') {
    const baseDamage = Math.floor(modifiedIntention.value * judgeEffects.damageModifier);

    // Check for on_damage active effects that reduce damage
    let finalDamage = baseDamage;
    const damageReductionEffects = nextState.activeEffects.filter(e => e.trigger === 'on_damage');
    for (const effect of damageReductionEffects) {
      // Apply the effect (which may modify the state and provide damage reduction)
      nextState = effect.apply(nextState);
      // Decrement remaining triggers if applicable
      if (effect.remainingTriggers !== undefined) {
        const remaining = effect.remainingTriggers - 1;
        if (remaining <= 0) {
          nextState = {
            ...nextState,
            activeEffects: nextState.activeEffects.filter(e => e.id !== effect.id),
          };
        } else {
          nextState = {
            ...nextState,
            activeEffects: nextState.activeEffects.map(e =>
              e.id === effect.id ? { ...e, remainingTriggers: remaining } : e
            ),
          };
        }
      }
    }

    // Apply damage with poise reduction
    const damage = Math.max(0, finalDamage - nextState.player.poise);
    const previousFace = nextState.player.face;
    nextState.player = {
      ...nextState.player,
      poise: Math.max(0, nextState.player.poise - finalDamage),
      face: nextState.player.face - damage,
    };
    statChanges.playerFace = nextState.player.face - previousFace;
  } else if (modifiedIntention.type === 'favor') {
    const favorSteal = modifiedIntention.value;
    const previousFavor = nextState.player.favor;
    nextState.player = {
      ...nextState.player,
      favor: Math.max(0, nextState.player.favor - favorSteal),
    };
    nextState.opponent = {
      ...nextState.opponent,
      favor: Math.min(100, nextState.opponent.favor + favorSteal),
    };
    statChanges.playerFavor = nextState.player.favor - previousFavor;
  } else if (modifiedIntention.type === 'stall') {
    nextState.patience -= modifiedIntention.value;
  } else if (modifiedIntention.type === 'flustered') {
    // Flustered does nothing - opponent wastes their action
    combatLogger.logSystemEvent('Opponent Flustered', { effect: modifiedIntention.name });
  }

  // Emit opponent action event
  nextState = emitGameEvent(nextState, {
    type: 'opponent_action',
    name: modifiedIntention.name,
    description: getIntentionDescription(modifiedIntention),
    actionType: modifiedIntention.type as 'attack' | 'favor' | 'stall',
    value: modifiedIntention.value,
    statChanges,
  });

  combatLogger.logAIAction(
    modifiedIntention.name,
    modifiedIntention.type,
    modifiedIntention.value,
    beforeState,
    nextState
  );

  return nextState;
};

// Helper to get intention description
const getIntentionDescription = (intention: Intention): string => {
  switch (intention.type) {
    case 'attack':
      return `Deals ${intention.value} damage`;
    case 'favor':
      return `Steals ${intention.value} favor`;
    case 'stall':
      return `Drains ${intention.value} patience`;
    case 'flustered':
      return 'Opponent is flustered!';
    default:
      return '';
  }
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
  if (!last) return true; // First move is in harmony
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
