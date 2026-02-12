/**
 * @fileoverview Battle Effects Management System
 *
 * Centralized animation state management for all battle visual effects.
 * Follows game industry patterns for animation orchestration:
 * - Event-driven triggers
 * - Queue-based playback
 * - Automatic cleanup
 * - Non-blocking by default
 *
 * @module hooks/useBattleEffects
 */

import { useState, useCallback } from 'react';
import { Element, Card, IntentionType } from '../types/game';

/**
 * Particle effect burst configuration.
 * Used for element-themed particles when cards are played.
 */
export interface ParticleEffect {
  id: string;
  element: Element;
  x: number;
  y: number;
  count?: number;
  spread?: number;
  velocity?: number;
  duration?: number;
}

/**
 * Opponent intention animation configuration.
 * Displays full-screen type-specific animation when opponent acts.
 */
export interface IntentionAnimation {
  id: string;
  intentionName: string;
  intentionType: IntentionType;
  value: number;
  opponentName: string;
}

/**
 * Judge decree animation configuration.
 * Displays imperial scroll with decree text in Tang Dynasty style.
 */
export interface JudgeDecreeAnimation {
  id: string;
  decreeName: string;
  description: string;
}

/**
 * Status effect animation configuration.
 * Displays floating icon with particles for buffs/debuffs.
 */
export interface StatusEffectAnimation {
  id: string;
  statusName: string;
  targetId: string; // 'player' or opponent id
  isPositive: boolean;
}

/**
 * Tier advancement celebration animation configuration.
 * Displays fireworks, confetti, and crown for player tier advancement.
 */
export interface TierAdvancementAnimation {
  id: string;
  tierNumber: number;
  tierName: string;
}

/**
 * Battle effects management hook.
 *
 * Centralizes state management for all battle animations including:
 * - Element particle effects when cards are played
 * - Opponent intention animations
 * - Judge decree scrolls
 * - Status effect indicators
 * - Tier advancement celebrations
 *
 * @returns Object containing animation state arrays and trigger/cleanup functions
 *
 * @example
 * ```tsx
 * const battleEffects = useBattleEffects();
 *
 * // Trigger animation
 * battleEffects.triggerCardEffect(card, x, y);
 *
 * // Render containers
 * <ElementParticlesContainer
 *   effects={battleEffects.particleEffects}
 *   onEffectComplete={battleEffects.removeParticleEffect}
 * />
 * ```
 */
export function useBattleEffects() {
  const [particleEffects, setParticleEffects] = useState<ParticleEffect[]>([]);
  const [intentionAnimations, setIntentionAnimations] = useState<IntentionAnimation[]>([]);
  const [judgeDecreeAnimations, setJudgeDecreeAnimations] = useState<JudgeDecreeAnimation[]>([]);
  const [statusEffectAnimations, setStatusEffectAnimations] = useState<StatusEffectAnimation[]>([]);
  const [tierAdvancementAnimation, setTierAdvancementAnimation] = useState<TierAdvancementAnimation | null>(null);

  /**
   * Triggers element particle burst when a card is played.
   * @param card - The card being played
   * @param x - Screen X coordinate for effect origin
   * @param y - Screen Y coordinate for effect origin
   */
  const triggerCardEffect = useCallback((card: Card, x: number, y: number) => {
    const effect: ParticleEffect = {
      id: `card-${Date.now()}-${Math.random()}`,
      element: card.element,
      x,
      y,
      count: 30,
      spread: 180,
      velocity: 120,
      duration: 1.2,
    };
    setParticleEffects(prev => [...prev, effect]);
  }, []);

  /**
   * Triggers full-screen intention animation when opponent acts.
   * @param intentionName - Name of the intention being executed
   * @param intentionType - Type determines visual theme (attack, standing, stall, etc.)
   * @param value - Numerical value of the intention effect
   * @param opponentName - Name of the opponent performing the action
   */
  const triggerIntentionAnimation = useCallback((
    intentionName: string,
    intentionType: IntentionType,
    value: number,
    opponentName: string
  ) => {
    const animation: IntentionAnimation = {
      id: `intention-${Date.now()}-${Math.random()}`,
      intentionName,
      intentionType,
      value,
      opponentName,
    };
    setIntentionAnimations(prev => [...prev, animation]);
  }, []);

  /**
   * Triggers imperial scroll animation for judge decrees.
   * @param decreeName - Name of the decree
   * @param description - Full text description of the decree effect
   */
  const triggerJudgeDecree = useCallback((decreeName: string, description: string) => {
    const animation: JudgeDecreeAnimation = {
      id: `decree-${Date.now()}-${Math.random()}`,
      decreeName,
      description,
    };
    setJudgeDecreeAnimations(prev => [...prev, animation]);
  }, []);

  /**
   * Triggers floating status effect animation.
   * @param statusName - Name of the status being applied
   * @param targetId - Target identifier ('player' or opponent id)
   * @param isPositive - True for buffs, false for debuffs
   */
  const triggerStatusEffect = useCallback((statusName: string, targetId: string, isPositive: boolean) => {
    const animation: StatusEffectAnimation = {
      id: `status-${Date.now()}-${Math.random()}`,
      statusName,
      targetId,
      isPositive,
    };
    setStatusEffectAnimations(prev => [...prev, animation]);
  }, []);

  /**
   * Triggers celebration animation when player advances to a new tier.
   * @param tierNumber - The tier number reached
   * @param tierName - Display name of the tier
   */
  const triggerTierAdvancement = useCallback((tierNumber: number, tierName: string) => {
    const animation: TierAdvancementAnimation = {
      id: `tier-${Date.now()}-${Math.random()}`,
      tierNumber,
      tierName,
    };
    setTierAdvancementAnimation(animation);
  }, []);

  /**
   * Removes a completed particle effect from state.
   * Called automatically by animation component after completion.
   * @param id - Unique identifier of the effect to remove
   */
  const removeParticleEffect = useCallback((id: string) => {
    setParticleEffects(prev => prev.filter(e => e.id !== id));
  }, []);

  /**
   * Removes a completed intention animation from state.
   * @param id - Unique identifier of the animation to remove
   */
  const removeIntentionAnimation = useCallback((id: string) => {
    setIntentionAnimations(prev => prev.filter(a => a.id !== id));
  }, []);

  /**
   * Removes a completed judge decree animation from state.
   * @param id - Unique identifier of the animation to remove
   */
  const removeJudgeDecreeAnimation = useCallback((id: string) => {
    setJudgeDecreeAnimations(prev => prev.filter(a => a.id !== id));
  }, []);

  /**
   * Removes a completed status effect animation from state.
   * @param id - Unique identifier of the animation to remove
   */
  const removeStatusEffectAnimation = useCallback((id: string) => {
    setStatusEffectAnimations(prev => prev.filter(a => a.id !== id));
  }, []);

  /**
   * Removes the tier advancement animation from state.
   * @param id - Unique identifier of the animation to remove
   */
  const removeTierAdvancementAnimation = useCallback((id: string) => {
    setTierAdvancementAnimation(prev => (prev?.id === id ? null : prev));
  }, []);

  return {
    // State
    particleEffects,
    intentionAnimations,
    judgeDecreeAnimations,
    statusEffectAnimations,
    tierAdvancementAnimation,
    // Actions
    triggerCardEffect,
    triggerIntentionAnimation,
    triggerJudgeDecree,
    triggerStatusEffect,
    triggerTierAdvancement,
    // Cleanup
    removeParticleEffect,
    removeIntentionAnimation,
    removeJudgeDecreeAnimation,
    removeStatusEffectAnimation,
    removeTierAdvancementAnimation,
  };
}
