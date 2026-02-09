import { GameState, CombatResult, COMBAT_LOG_ACTOR } from '../../../types/game';
import { getCombatResult } from './standing';

/**
 * Check victory conditions and update game state
 *
 * Victory conditions:
 * - Player face <= 0: Opponent wins
 * - Patience <= 0: Player wins if their tier > ALL opponent tiers. Tie goes to opponent.
 */
export function checkVictory(state: GameState): GameState {
  // Player loses face completely - opponent wins by default
  if (state.player.face <= 0) {
    return { ...state, isGameOver: true, winner: COMBAT_LOG_ACTOR.OPPONENT };
  }

  // Patience runs out - resolve based on tiers
  if (state.patience <= 0) {
    const result = getCombatResult(state);

    // Player must have higher tier than ALL opponents to win
    // Check against all opponents in the opponents array
    const allOpponentTiers = state.opponents.map(o => o.standing.currentTier);
    const maxOpponentTier = allOpponentTiers.length > 0
      ? Math.max(...allOpponentTiers)
      : result.opponentTier;

    if (result.playerTier > maxOpponentTier) {
      return { ...state, isGameOver: true, winner: COMBAT_LOG_ACTOR.PLAYER };
    }

    // Opponent wins on tie or if any opponent has higher tier
    return { ...state, isGameOver: true, winner: COMBAT_LOG_ACTOR.OPPONENT };
  }

  return state;
}

/**
 * Get detailed combat result for reward/penalty calculation
 */
export function getDetailedCombatResult(state: GameState): CombatResult | null {
  if (!state.isGameOver) return null;
  return getCombatResult(state);
}

/**
 * Calculate rewards based on combat result
 */
export interface CombatReward {
  faceHealing: number;
  startingStanding: number;
  standingPenalty: number;
}

export function calculateCombatRewards(result: CombatResult): CombatReward {
  const playerTierBonus = result.playerTier;
  const faceHealing = 5 + (playerTierBonus * 5);
  const startingStanding = 3 + (playerTierBonus * 4);

  const opponentTierPenalty = result.opponentTier;
  const standingPenalty = opponentTierPenalty * 3;

  return {
    faceHealing,
    startingStanding,
    standingPenalty,
  };
}
