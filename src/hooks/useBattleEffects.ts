/**
 * @fileoverview Battle Effects Management System
 *
 * Centralized animation state management for all battle visual effects.
 * Uses a priority-based animation queue for sequential playback.
 * Follows game industry patterns for animation orchestration:
 * - Event-driven triggers
 * - Queue-based sequential playback
 * - Automatic cleanup
 * - Non-blocking by default
 *
 * @module hooks/useBattleEffects
 */

import { useRef, useCallback } from 'react';
import { Element, Card, IntentionType } from '../types/game';
import { useAnimationQueue } from './useAnimationQueue';

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
 * Projectile animation configuration.
 * Directional attack animation from opponent to player.
 */
export interface ProjectileAnimation {
  id: string;
  intentionType: IntentionType;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

/**
 * Battle effects management hook with sequential animation queue.
 *
 * Centralizes state management for all battle animations including:
 * - Element particle effects when cards are played
 * - Projectile animations for attacks
 * - Opponent intention animations
 * - Judge decree scrolls
 * - Status effect indicators
 * - Tier advancement celebrations
 *
 * Animations play sequentially based on priority:
 * - Tier advancement: 100
 * - Judge decree: 80
 * - Projectile: 65
 * - Opponent intention: 60
 * - Status effect: 40
 * - Particle effect: 20
 *
 * @returns Object containing animation queue state and trigger functions
 *
 * @example
 * ```tsx
 * const battleEffects = useBattleEffects();
 *
 * // Trigger animation
 * battleEffects.triggerCardEffect(card, x, y);
 *
 * // Render current animation
 * {battleEffects.current?.type === 'intention' && (
 *   <IntentionAnimation {...battleEffects.current.data} />
 * )}
 * ```
 */
export function useBattleEffects() {
  const animQueue = useAnimationQueue();
  const nextIdRef = useRef(1);

  const getNextId = useCallback(() => {
    return nextIdRef.current++;
  }, []);

  /**
   * Triggers element particle burst when a card is played.
   * @param card - The card being played
   * @param x - Screen X coordinate for effect origin
   * @param y - Screen Y coordinate for effect origin
   */
  const triggerCardEffect = useCallback((card: Card, x: number, y: number) => {
    animQueue.enqueue({
      id: `particle-${getNextId()}`,
      type: 'particle',
      priority: 20,
      data: {
        element: card.element,
        x,
        y,
        count: 30,
        spread: 180,
        velocity: 120,
        duration: 1.2,
      },
      duration: 1200,
    });
  }, [animQueue, getNextId]);

  /**
   * Triggers directional projectile animation.
   * @param intentionType - Type of intention (determines icon)
   * @param fromX - Starting X coordinate
   * @param fromY - Starting Y coordinate
   * @param toX - Target X coordinate
   * @param toY - Target Y coordinate
   */
  const triggerProjectile = useCallback((
    intentionType: IntentionType,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ) => {
    animQueue.enqueue({
      id: `projectile-${getNextId()}`,
      type: 'projectile',
      priority: 65,
      data: {
        intentionType,
        fromX,
        fromY,
        toX,
        toY,
      },
      duration: 1100,
    });
  }, [animQueue, getNextId]);

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
    animQueue.enqueue({
      id: `intention-${getNextId()}`,
      type: 'intention',
      priority: 60,
      data: {
        intentionName,
        intentionType,
        value,
        opponentName,
      },
      duration: 2000,
    });
  }, [animQueue, getNextId]);

  /**
   * Triggers imperial scroll animation for judge decrees.
   * @param decreeName - Name of the decree
   * @param description - Full text description of the decree effect
   */
  const triggerJudgeDecree = useCallback((decreeName: string, description: string) => {
    animQueue.enqueue({
      id: `decree-${getNextId()}`,
      type: 'decree',
      priority: 80,
      data: {
        decreeName,
        description,
      },
      duration: 3000,
    });
  }, [animQueue, getNextId]);

  /**
   * Triggers floating status effect animation.
   * @param statusName - Name of the status being applied
   * @param targetId - Target identifier ('player' or opponent id)
   * @param isPositive - True for buffs, false for debuffs
   */
  const triggerStatusEffect = useCallback((statusName: string, targetId: string, isPositive: boolean) => {
    animQueue.enqueue({
      id: `status-${getNextId()}`,
      type: 'status',
      priority: 40,
      data: {
        statusName,
        targetId,
        isPositive,
      },
      duration: 1500,
    });
  }, [animQueue, getNextId]);

  /**
   * Triggers celebration animation when player advances to a new tier.
   * @param tierNumber - The tier number reached
   * @param tierName - Display name of the tier
   */
  const triggerTierAdvancement = useCallback((tierNumber: number, tierName: string) => {
    animQueue.enqueue({
      id: `tier-${getNextId()}`,
      type: 'tier',
      priority: 100,
      data: {
        tierNumber,
        tierName,
      },
      duration: 4000,
    });
  }, [animQueue, getNextId]);

  return {
    // Animation queue state
    current: animQueue.current,
    queueLength: animQueue.queueLength,
    isPlaying: animQueue.isPlaying,

    // Queue controls
    skip: animQueue.skip,
    pause: animQueue.pause,
    resume: animQueue.resume,
    clear: animQueue.clear,

    // Trigger functions
    triggerCardEffect,
    triggerProjectile,
    triggerIntentionAnimation,
    triggerJudgeDecree,
    triggerStatusEffect,
    triggerTierAdvancement,
  };
}
