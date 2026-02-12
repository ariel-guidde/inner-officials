import { useState, useCallback } from 'react';
import { SessionState } from '../types/game';

const DEFAULT_MAX_FACE = 60;

export type BattleOutcome = 'won' | 'tied' | 'lost';

export interface BattleResult {
  outcome: BattleOutcome;
  finalFace: number;
  opponentName: string;
  playerTier: number;
  opponentTier: number;
  maxTier: number;
}

export function useSession(totalBattles: number = 3) {
  const [session, setSession] = useState<SessionState>({
    totalBattles,
    currentBattle: 1,
    battlesWon: 0,
    playerFaceCarryOver: DEFAULT_MAX_FACE,
    isSessionOver: false,
    sessionWon: null,
  });

  const [lastBattleResult, setLastBattleResult] = useState<BattleResult | null>(null);

  const startSession = useCallback((numBattles: number = 3) => {
    setSession({
      totalBattles: numBattles,
      currentBattle: 1,
      battlesWon: 0,
      playerFaceCarryOver: DEFAULT_MAX_FACE,
      isSessionOver: false,
      sessionWon: null,
    });
    setLastBattleResult(null);
  }, []);

  const recordBattleResult = useCallback((result: BattleResult) => {
    setLastBattleResult(result);

    setSession(prev => {
      const won = result.outcome === 'won';
      const lost = result.outcome === 'lost';

      const newBattlesWon = won ? prev.battlesWon + 1 : prev.battlesWon;
      const isLastBattle = prev.currentBattle >= prev.totalBattles;

      // Session ends if lost OR completed all battles after a win
      // Ties don't end session but don't advance either
      const sessionEnds = lost || (won && isLastBattle);
      const sessionWon = sessionEnds && won && isLastBattle;

      return {
        ...prev,
        battlesWon: newBattlesWon,
        // On win: carry over face. On tie: reset to max. On loss: reset to max
        playerFaceCarryOver: won ? result.finalFace : DEFAULT_MAX_FACE,
        isSessionOver: sessionEnds,
        sessionWon: sessionEnds ? sessionWon : null,
      };
    });
  }, []);

  const advanceToNextBattle = useCallback(() => {
    setSession(prev => ({
      ...prev,
      currentBattle: prev.currentBattle + 1,
    }));
    setLastBattleResult(null);
  }, []);

  const getBattlesRemaining = useCallback(() => {
    return session.totalBattles - session.currentBattle;
  }, [session.totalBattles, session.currentBattle]);

  return {
    session,
    lastBattleResult,
    startSession,
    recordBattleResult,
    advanceToNextBattle,
    getBattlesRemaining,
  };
}
