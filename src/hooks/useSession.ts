import { useState, useCallback } from 'react';
import { SessionState } from '../types/game';

const DEFAULT_MAX_FACE = 60;

export interface BattleResult {
  won: boolean;
  finalFace: number;
  opponentName: string;
  favorGained: number;
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
      const newBattlesWon = result.won ? prev.battlesWon + 1 : prev.battlesWon;
      const isLastBattle = prev.currentBattle >= prev.totalBattles;

      // Session ends if lost a battle or completed all battles
      const sessionEnds = !result.won || isLastBattle;
      const sessionWon = sessionEnds && result.won && isLastBattle;

      return {
        ...prev,
        battlesWon: newBattlesWon,
        playerFaceCarryOver: result.won ? result.finalFace : DEFAULT_MAX_FACE,
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
