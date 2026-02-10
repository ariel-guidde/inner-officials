import { GameState, Status, StatusTrigger, ModifierStat, MODIFIER_OP, Element, STATUS_TRIGGER } from '../../../types/game';
import { getStatusTemplate } from '../../../data/statusTemplates';
import { resolveEffects } from '../engine/effectResolver';

// ==================== STATUS MANAGEMENT ====================

function generateId(state: GameState, prefix: string): { id: string; state: GameState } {
  const id = `${prefix}_${state.nextId}`;
  return { id, state: { ...state, nextId: state.nextId + 1 } };
}

export function addStatus(state: GameState, status: Omit<Status, 'id'>): GameState {
  const { id, state: nextState } = generateId(state, 'status');
  const newStatus: Status = {
    ...status,
    id,
  };
  return {
    ...nextState,
    statuses: [...nextState.statuses, newStatus],
  };
}

/**
 * Add a status from a registered template.
 * Overrides allow customizing duration, owner, etc.
 */
export function addStatusFromTemplate(
  state: GameState,
  templateId: string,
  opts?: {
    owner?: 'player' | 'opponent';
    duration?: number;
    triggerCount?: number;
  }
): GameState {
  const template = getStatusTemplate(templateId);
  if (!template) {
    console.warn(`Status template not found: ${templateId}`);
    return state;
  }

  const owner = opts?.owner ?? 'player';
  const duration = opts?.duration ?? template.defaultDuration;
  const triggerCount = opts?.triggerCount ?? template.defaultTriggerCount;

  return addStatus(state, {
    templateId,
    name: template.name,
    description: template.description,
    owner,
    trigger: template.trigger,
    turnsRemaining: duration,
    triggersRemaining: triggerCount,
    modifiers: template.modifiers,
    apply: template.apply,
    isPositive: template.isPositive,
    tags: template.tags,
  });
}

export function removeStatus(state: GameState, statusId: string): GameState {
  return {
    ...state,
    statuses: state.statuses.filter((s) => s.id !== statusId),
  };
}

export function removeStatusByTag(state: GameState, tag: string, owner?: 'player' | 'opponent'): GameState {
  return {
    ...state,
    statuses: state.statuses.filter((s) => {
      if (owner && s.owner !== owner) return true;
      return !s.tags?.includes(tag);
    }),
  };
}

export function hasStatus(state: GameState, tag: string, owner?: 'player' | 'opponent'): boolean {
  return state.statuses.some((s) => {
    if (owner && s.owner !== owner) return false;
    return s.tags?.includes(tag) ?? false;
  });
}

export function getStatuses(state: GameState, owner?: 'player' | 'opponent', tag?: string): Status[] {
  return state.statuses.filter((s) => {
    if (owner && s.owner !== owner) return false;
    if (tag && !s.tags?.includes(tag)) return false;
    return true;
  });
}

export function getStatusesByTrigger(state: GameState, trigger: StatusTrigger, owner?: 'player' | 'opponent'): Status[] {
  return state.statuses.filter((s) => {
    if (s.trigger !== trigger) return false;
    if (owner && s.owner !== owner) return false;
    return true;
  });
}

// ==================== STATUS PROCESSING ====================

/**
 * Process all statuses matching a trigger.
 * Runs apply() for each matching status and decrements triggersRemaining.
 */
export function processStatusTrigger(state: GameState, trigger: StatusTrigger, owner?: 'player' | 'opponent'): GameState {
  let nextState = state;
  const matchingStatuses = getStatusesByTrigger(nextState, trigger, owner);

  for (const status of matchingStatuses) {
    // Check for data-driven triggered effects first (from template)
    if (status.templateId) {
      const template = getStatusTemplate(status.templateId);
      if (template?.triggeredEffects) {
        nextState = resolveEffects(nextState, template.triggeredEffects, { sourceCardId: status.id });
      }
    } else if (status.apply) {
      // Legacy: apply closure
      nextState = status.apply(nextState);
    }

    // Decrement triggers if applicable
    if (status.triggersRemaining !== undefined) {
      const remaining = status.triggersRemaining - 1;
      if (remaining <= 0) {
        nextState = removeStatus(nextState, status.id);
      } else {
        nextState = {
          ...nextState,
          statuses: nextState.statuses.map((s) =>
            s.id === status.id ? { ...s, triggersRemaining: remaining } : s
          ),
        };
      }
    }
  }

  return nextState;
}

/**
 * Tick all statuses: decrement turnsRemaining, remove expired.
 * Called at end of turn.
 */
export function tickStatuses(state: GameState): GameState {
  const updatedStatuses: Status[] = [];

  for (const status of state.statuses) {
    if (status.turnsRemaining === -1) {
      // Permanent status
      updatedStatuses.push(status);
    } else if (status.turnsRemaining > 1) {
      updatedStatuses.push({ ...status, turnsRemaining: status.turnsRemaining - 1 });
    }
    // turnsRemaining === 1 means this was the last turn, don't include (expired)
    // turnsRemaining === 0 should already be removed
  }

  return {
    ...state,
    statuses: updatedStatuses,
  };
}

// ==================== MODIFIER AGGREGATION ====================

/**
 * Aggregate all modifiers for a given stat from all active statuses.
 * Processing order: ADD first, then MULTIPLY, then SET.
 */
export function getModifierTotal(
  state: GameState,
  stat: ModifierStat,
  owner?: 'player' | 'opponent',
  element?: Element
): number {
  const relevantStatuses = state.statuses.filter((s) => {
    if (owner && s.owner !== owner) return false;
    return s.modifiers.some((m) => {
      if (m.stat !== stat) return false;
      if (element && m.element && m.element !== element) return false;
      if (!element && m.element) return false; // Skip element-specific if no element queried
      return true;
    });
  });

  // Collect all matching modifiers
  const adds: number[] = [];
  const multiplies: number[] = [];
  const sets: number[] = [];

  for (const status of relevantStatuses) {
    for (const mod of status.modifiers) {
      if (mod.stat !== stat) continue;
      if (element && mod.element && mod.element !== element) continue;
      if (!element && mod.element) continue;

      switch (mod.op) {
        case MODIFIER_OP.ADD:
          adds.push(mod.value);
          break;
        case MODIFIER_OP.MULTIPLY:
          multiplies.push(mod.value);
          break;
        case MODIFIER_OP.SET:
          sets.push(mod.value);
          break;
      }
    }
  }

  // If there's a SET, use the last one
  if (sets.length > 0) {
    return sets[sets.length - 1];
  }

  // Start with sum of adds
  let total = adds.reduce((sum, v) => sum + v, 0);

  // Apply multipliers
  for (const mult of multiplies) {
    total = Math.floor(total * mult);
  }

  return total;
}

/**
 * Get the aggregate multiplier for a stat (for things like favorGainModifier).
 * Returns product of all multiply modifiers (default 1.0).
 */
export function getModifierMultiplier(
  state: GameState,
  stat: ModifierStat,
  owner?: 'player' | 'opponent'
): number {
  let multiplier = 1.0;

  for (const status of state.statuses) {
    if (owner && status.owner !== owner) continue;
    for (const mod of status.modifiers) {
      if (mod.stat !== stat) continue;
      if (mod.op === MODIFIER_OP.MULTIPLY) {
        multiplier *= mod.value;
      }
    }
  }

  return multiplier;
}

/**
 * Get the aggregate additive bonus for a stat.
 */
export function getModifierAdditive(
  state: GameState,
  stat: ModifierStat,
  owner?: 'player' | 'opponent',
  element?: Element
): number {
  let total = 0;

  for (const status of state.statuses) {
    if (owner && status.owner !== owner) continue;
    for (const mod of status.modifiers) {
      if (mod.stat !== stat) continue;
      if (element && mod.element && mod.element !== element) continue;
      if (!element && mod.element) continue;
      if (mod.op === MODIFIER_OP.ADD) {
        total += mod.value;
      }
    }
  }

  return total;
}

// ==================== REVEAL STATUS HELPER ====================

export function addRevealStatus(state: GameState, opponentId: string, count: number = 1): GameState {
  // Check if opponent already has a reveal status
  const existingReveal = state.opponents
    .find(o => o.id === opponentId)
    ?.statuses.find(s => s.tags?.includes('revealed'));

  if (existingReveal) {
    // Stack: add to existing triggers
    return {
      ...state,
      opponents: state.opponents.map(o =>
        o.id === opponentId
          ? {
              ...o,
              statuses: o.statuses.map(s =>
                s.id === existingReveal.id
                  ? { ...s, triggersRemaining: (s.triggersRemaining ?? 0) + count }
                  : s
              ),
            }
          : o
      ),
    };
  }

  // Add new reveal status to the specific opponent
  const { id: revealId, state: nextState } = generateId(state, 'reveal');
  const revealStatus: Status = {
    id: revealId,
    name: 'Keen Insight',
    description: `Reveal next ${count} intention(s)`,
    owner: 'opponent',
    trigger: STATUS_TRIGGER.PASSIVE,
    turnsRemaining: -1,
    triggersRemaining: count,
    modifiers: [],
    isPositive: false, // Not positive for the opponent
    tags: ['revealed'],
  };

  return {
    ...nextState,
    opponents: nextState.opponents.map(o =>
      o.id === opponentId
        ? { ...o, statuses: [...o.statuses, revealStatus] }
        : o
    ),
  };
}

/**
 * Consume one reveal trigger from a specific opponent.
 * Returns updated state. If triggers exhausted, removes the status.
 */
export function consumeOpponentRevealTrigger(state: GameState, opponentId: string): GameState {
  const opponent = state.opponents.find(o => o.id === opponentId);
  if (!opponent) return state;

  const revealStatus = opponent.statuses.find(s => s.tags?.includes('revealed'));
  if (!revealStatus || revealStatus.triggersRemaining === undefined) return state;

  const remaining = revealStatus.triggersRemaining - 1;
  if (remaining <= 0) {
    return {
      ...state,
      opponents: state.opponents.map(o =>
        o.id === opponentId
          ? { ...o, statuses: o.statuses.filter(s => s.id !== revealStatus.id) }
          : o
      ),
    };
  }

  return {
    ...state,
    opponents: state.opponents.map(o =>
      o.id === opponentId
        ? {
            ...o,
            statuses: o.statuses.map(s =>
              s.id === revealStatus.id ? { ...s, triggersRemaining: remaining } : s
            ),
          }
        : o
    ),
  };
}

/**
 * Check if an opponent has reveal status
 */
export function isOpponentRevealed(state: GameState, opponentId: string): boolean {
  const opponent = state.opponents.find(o => o.id === opponentId);
  if (!opponent) return false;
  return opponent.statuses.some(s => s.tags?.includes('revealed'));
}
