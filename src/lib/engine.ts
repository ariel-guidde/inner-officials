import { GameState, Card, Element } from '../types/game';
import { combatLogger } from './debug/combatLogger';

type DrawCardsFunction = (state: GameState, count: number) => GameState;

export const processTurn = (state: GameState, card: Card, drawCards: DrawCardsFunction): GameState => {
  const beforeState = state;
  let nextState = { ...state };

  // Update logger turn
  combatLogger.setTurn(state.turnNumber ?? 1);

  // 1. Flow Calculation
  const isBalanced = checkBalanced(state.lastElement, card.element);
  const isChaos = checkChaos(state.lastElement, card.element);
  const flowType = isBalanced ? 'balanced' : isChaos ? 'chaos' : 'neutral';

  // 2. Resource Costs
  // Balanced: -1 patience cost
  // Chaos: +2 patience cost, +5 face cost (high risk)
  let finalPatienceCost = card.patienceCost;
  let finalFaceCost = card.faceCost;

  if (isBalanced) {
    finalPatienceCost = Math.max(0, card.patienceCost - 1);
  } else if (isChaos) {
    finalPatienceCost = card.patienceCost + 2;
    finalFaceCost = card.faceCost + 5;
  }

  nextState.patience -= finalPatienceCost;
  nextState.player.face -= finalFaceCost;

  // 3. Effect Application
  // Pass drawCards function to card effects that need it
  nextState = card.effect(nextState, drawCards);

  // 4. Chaos Bonus (high reward)
  // Chaos flow: +10 favor, deal 8 direct damage to opponent
  if (isChaos) {
    nextState.player.favor = Math.min(100, nextState.player.favor + 10);
    nextState.opponent.face -= 8;
  }

  // 5. Update State
  nextState.lastElement = card.element;

  // 6. Shock Mechanic
  if (nextState.opponent.face <= 0) {
    nextState.opponent.isShocked = 3;
    nextState.opponent.face = nextState.opponent.maxFace / 2;
    nextState.opponent.currentIntention = { name: 'Stunned', type: 'shocked', value: 0 };
    combatLogger.logSystemEvent('Opponent Shocked', { turnsRemaining: 3 });
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

export const resolveAIAction = (state: GameState): GameState => {
  const beforeState = state;

  if (state.isGameOver || state.opponent.isShocked > 0) {
    const nextState = {
      ...state,
      opponent: { ...state.opponent, isShocked: Math.max(0, state.opponent.isShocked - 1) },
    };
    if (state.opponent.isShocked > 0) {
      combatLogger.logSystemEvent('Opponent Still Shocked', {
        turnsRemaining: Math.max(0, state.opponent.isShocked - 1),
      });
    }
    return nextState;
  }

  let next = { ...state };
  const intention = state.opponent.currentIntention;

  if (intention) {
    if (intention.type === 'attack') {
      const damage = Math.max(0, intention.value - next.player.poise);
      next.player.poise = Math.max(0, next.player.poise - intention.value);
      next.player.face -= damage;
    } else if (intention.type === 'favor') {
      // Opponent reduces player favor and gains favor themselves
      next.player.favor = Math.max(0, next.player.favor - intention.value);
      next.opponent.favor = Math.min(100, next.opponent.favor + intention.value);
    } else if (intention.type === 'stall') {
      next.patience -= intention.value;
    }
  }

  // Check victory conditions including opponent favor
  const finalState = checkVictory(next);

  // Log the AI action
  if (intention) {
    combatLogger.logAIAction(
      intention.name,
      intention.type,
      intention.value,
      beforeState,
      finalState
    );
  }

  if (finalState.isGameOver) {
    combatLogger.logSystemEvent('Game Over', { winner: finalState.winner });
  }

  return finalState;
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
