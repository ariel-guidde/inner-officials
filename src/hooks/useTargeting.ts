import { useState, useCallback } from 'react';
import { Card, GameState, TargetRequirement, TargetedEffectContext } from '../types/game';

export interface TargetingState {
  isTargeting: boolean;
  pendingCard: Card | null;
  requirement: TargetRequirement | null;
  selectedTargets: Card[];
  validTargets: Card[];
}

export interface TargetingActions {
  startTargeting: (card: Card, state: GameState) => boolean;
  selectTarget: (card: Card) => void;
  deselectTarget: (card: Card) => void;
  confirmTargets: () => TargetedEffectContext | null;
  cancelTargeting: () => void;
  canConfirm: () => boolean;
}

export function useTargeting(): TargetingState & TargetingActions {
  const [isTargeting, setIsTargeting] = useState(false);
  const [pendingCard, setPendingCard] = useState<Card | null>(null);
  const [requirement, setRequirement] = useState<TargetRequirement | null>(null);
  const [selectedTargets, setSelectedTargets] = useState<Card[]>([]);
  const [validTargets, setValidTargets] = useState<Card[]>([]);

  // Start targeting mode for a card with a target requirement
  const startTargeting = useCallback((card: Card, state: GameState): boolean => {
    if (!card.targetRequirement || card.targetRequirement.type === 'none') {
      return false; // Card doesn't need targeting
    }

    const req = card.targetRequirement;

    // Determine valid targets from hand (excluding the card being played)
    let targets = state.player.hand.filter(c => c.id !== card.id);

    // Apply filter if provided
    if (req.filter) {
      targets = targets.filter(c => req.filter!(c, state));
    }

    // If no valid targets and targeting is optional, don't enter targeting mode
    if (targets.length === 0 && req.optional) {
      return false;
    }

    // If no valid targets and targeting is required, still enter mode (will show message)
    setIsTargeting(true);
    setPendingCard(card);
    setRequirement(req);
    setSelectedTargets([]);
    setValidTargets(targets);

    return true;
  }, []);

  // Select a target card
  const selectTarget = useCallback((card: Card) => {
    if (!validTargets.find(t => t.id === card.id)) return;

    // For now, we support single target selection
    // Multi-target could be added later
    setSelectedTargets([card]);
  }, [validTargets]);

  // Deselect a target card
  const deselectTarget = useCallback((card: Card) => {
    setSelectedTargets(prev => prev.filter(t => t.id !== card.id));
  }, []);

  // Check if we can confirm (have required targets or optional with none)
  const canConfirm = useCallback((): boolean => {
    if (!requirement) return false;
    if (requirement.optional) return true;
    return selectedTargets.length > 0;
  }, [requirement, selectedTargets.length]);

  // Confirm target selection and return context
  const confirmTargets = useCallback((): TargetedEffectContext | null => {
    if (!canConfirm()) return null;

    const context: TargetedEffectContext = {
      selectedCards: [...selectedTargets],
    };

    // Reset state
    setIsTargeting(false);
    setPendingCard(null);
    setRequirement(null);
    setSelectedTargets([]);
    setValidTargets([]);

    return context;
  }, [canConfirm, selectedTargets]);

  // Cancel targeting mode
  const cancelTargeting = useCallback(() => {
    setIsTargeting(false);
    setPendingCard(null);
    setRequirement(null);
    setSelectedTargets([]);
    setValidTargets([]);
  }, []);

  return {
    isTargeting,
    pendingCard,
    requirement,
    selectedTargets,
    validTargets,
    startTargeting,
    selectTarget,
    deselectTarget,
    confirmTargets,
    cancelTargeting,
    canConfirm,
  };
}
