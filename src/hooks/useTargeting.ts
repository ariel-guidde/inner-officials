import { useState, useCallback } from 'react';
import { Card, GameState, TargetRequirement, TargetedEffectContext, TARGET_TYPE } from '../types/game';

export interface TargetingState {
  isTargeting: boolean;
  pendingCard: Card | null;
  requirement: TargetRequirement | null;
  selectedTargets: Card[];
  validTargets: Card[];
  // Opponent targeting
  isOpponentTargeting: boolean;
  selectableOpponentIds: string[];
  targetOpponentId: string | null;
}

export interface TargetingActions {
  startTargeting: (card: Card, state: GameState) => boolean;
  startOpponentTargeting: (card: Card, state: GameState) => boolean;
  selectTarget: (card: Card) => void;
  deselectTarget: (card: Card) => void;
  selectOpponent: (opponentId: string) => void;
  selectOpponentAndConfirm: (opponentId: string) => TargetedEffectContext | null;
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
  // Opponent targeting state
  const [isOpponentTargeting, setIsOpponentTargeting] = useState(false);
  const [selectableOpponentIds, setSelectableOpponentIds] = useState<string[]>([]);
  const [targetOpponentId, setTargetOpponentId] = useState<string | null>(null);

  const resetAll = useCallback(() => {
    setIsTargeting(false);
    setPendingCard(null);
    setRequirement(null);
    setSelectedTargets([]);
    setValidTargets([]);
    setIsOpponentTargeting(false);
    setSelectableOpponentIds([]);
    setTargetOpponentId(null);
  }, []);

  // Start targeting mode for a card with a hand_card target requirement
  const startTargeting = useCallback((card: Card, state: GameState): boolean => {
    if (!card.targetRequirement || card.targetRequirement.type === TARGET_TYPE.NONE) {
      return false;
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

  // Start opponent targeting mode
  const startOpponentTargeting = useCallback((card: Card, state: GameState): boolean => {
    if (!card.targetRequirement || card.targetRequirement.type !== TARGET_TYPE.OPPONENT) {
      return false;
    }

    const opponentIds = state.opponents.map(o => o.id);
    if (opponentIds.length === 0) return false;

    // Single opponent: auto-target
    if (opponentIds.length === 1) {
      return false; // Signal to caller to auto-target
    }

    setIsTargeting(true);
    setIsOpponentTargeting(true);
    setPendingCard(card);
    setRequirement(card.targetRequirement);
    setSelectableOpponentIds(opponentIds);
    setTargetOpponentId(null);

    return true;
  }, []);

  // Select a target card
  const selectTarget = useCallback((card: Card) => {
    if (!validTargets.find(t => t.id === card.id)) return;
    setSelectedTargets([card]);
  }, [validTargets]);

  // Deselect a target card
  const deselectTarget = useCallback((card: Card) => {
    setSelectedTargets(prev => prev.filter(t => t.id !== card.id));
  }, []);

  // Select an opponent target
  const selectOpponent = useCallback((opponentId: string) => {
    if (!selectableOpponentIds.includes(opponentId)) return;
    setTargetOpponentId(opponentId);
  }, [selectableOpponentIds]);

  // Select opponent and immediately return context (for auto-confirm on click)
  const selectOpponentAndConfirm = useCallback((opponentId: string): TargetedEffectContext | null => {
    if (!selectableOpponentIds.includes(opponentId)) return null;
    const context: TargetedEffectContext = { targetOpponentId: opponentId };
    resetAll();
    return context;
  }, [selectableOpponentIds, resetAll]);

  // Check if we can confirm
  const canConfirm = useCallback((): boolean => {
    if (!requirement) return false;
    if (isOpponentTargeting) return targetOpponentId !== null;
    if (requirement.optional) return true;
    return selectedTargets.length > 0;
  }, [requirement, isOpponentTargeting, targetOpponentId, selectedTargets.length]);

  // Confirm target selection and return context
  const confirmTargets = useCallback((): TargetedEffectContext | null => {
    if (!canConfirm()) return null;

    const context: TargetedEffectContext = {};

    if (isOpponentTargeting) {
      context.targetOpponentId = targetOpponentId ?? undefined;
    } else {
      context.selectedCards = [...selectedTargets];
    }

    resetAll();
    return context;
  }, [canConfirm, isOpponentTargeting, targetOpponentId, selectedTargets, resetAll]);

  // Cancel targeting mode
  const cancelTargeting = useCallback(() => {
    resetAll();
  }, [resetAll]);

  return {
    isTargeting,
    pendingCard,
    requirement,
    selectedTargets,
    validTargets,
    isOpponentTargeting,
    selectableOpponentIds,
    targetOpponentId,
    startTargeting,
    startOpponentTargeting,
    selectTarget,
    deselectTarget,
    selectOpponent,
    selectOpponentAndConfirm,
    confirmTargets,
    cancelTargeting,
    canConfirm,
  };
}
