import { Card, GameState, TargetedEffectContext, CARD_DESTINATION } from '../../../types/game';
import { burnCard, discardCard } from './deckService';

/**
 * Resolve random card selection for cards with random selection mode.
 * Returns updated state and the target context with selected cards.
 */
export function resolveRandomSelection(
  state: GameState,
  card: Card
): { state: GameState; targetContext: TargetedEffectContext | undefined } {
  const req = card.targetRequirement;
  if (!req || req.selectionMode !== 'random') {
    return { state, targetContext: undefined };
  }

  // Get valid targets
  let candidates = state.player.hand.filter(c => c.id !== card.id);
  if (req.filter) {
    candidates = candidates.filter(c => req.filter!(c, state));
  }

  if (candidates.length === 0) {
    return { state, targetContext: undefined };
  }

  const randomIndex = Math.floor(Math.random() * candidates.length);
  const selectedCard = candidates[randomIndex];

  // Apply destination (burn or discard)
  let nextState = state;
  if (req.destination === CARD_DESTINATION.BURN) {
    nextState = burnCard(nextState, selectedCard.id);
  } else if (req.destination === CARD_DESTINATION.DISCARD) {
    nextState = discardCard(nextState, selectedCard.id);
  }

  return {
    state: nextState,
    targetContext: { selectedCards: [selectedCard] },
  };
}

/**
 * Apply card destination (burn/discard) to selected target cards.
 */
export function applyTargetDestination(
  state: GameState,
  card: Card,
  selectedCards: Card[]
): GameState {
  const req = card.targetRequirement;
  if (!req) return state;

  let nextState = state;
  if (req.destination === CARD_DESTINATION.BURN) {
    selectedCards.forEach(targetCard => {
      nextState = burnCard(nextState, targetCard.id);
    });
  } else if (req.destination === CARD_DESTINATION.DISCARD) {
    selectedCards.forEach(targetCard => {
      nextState = discardCard(nextState, targetCard.id);
    });
  }

  return nextState;
}
