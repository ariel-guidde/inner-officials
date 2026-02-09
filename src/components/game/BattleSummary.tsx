import { motion } from 'framer-motion';
import { Trophy, Skull, Heart, ChevronUp, ArrowRight, Home, Swords } from 'lucide-react';
import { BattleResult } from '../../hooks/useSession';
import { SessionState } from '../../types/game';

interface BattleSummaryProps {
  result: BattleResult;
  session: SessionState;
  onContinue: () => void;
  onReturnToMenu: () => void;
}

export default function BattleSummary({
  result,
  session,
  onContinue,
  onReturnToMenu,
}: BattleSummaryProps) {
  const isSessionOver = session.isSessionOver;
  const sessionWon = session.sessionWon;
  const battlesRemaining = session.totalBattles - session.currentBattle;

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-stone-900 border border-stone-700 rounded-2xl p-8 max-w-md w-full shadow-2xl"
      >
        {/* Battle Result Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
              result.won
                ? 'bg-amber-500/20 border-2 border-amber-500'
                : 'bg-rose-500/20 border-2 border-rose-500'
            }`}
          >
            {result.won ? (
              <Trophy className="w-10 h-10 text-amber-400" />
            ) : (
              <Skull className="w-10 h-10 text-rose-400" />
            )}
          </motion.div>

          <h2 className={`text-2xl font-bold mb-2 ${result.won ? 'text-amber-100' : 'text-rose-100'}`}>
            {result.won ? 'Victory!' : 'Defeat'}
          </h2>
          <p className="text-stone-400">
            Battle against <span className="text-stone-200">{result.opponentName}</span>
          </p>
        </div>

        {/* Battle Stats */}
        <div className="panel-inner p-4 mb-6 space-y-3">
          <div className="stat-row">
            <div className="stat-row-label">
              <Heart className="w-4 h-4 icon-face" />
              <span>Final Face</span>
            </div>
            <span className="text-value">{result.finalFace}/60</span>
          </div>
          <div className="stat-row">
            <div className="stat-row-label">
              <ChevronUp className="w-4 h-4 text-green-400" />
              <span>Your Tier</span>
            </div>
            <span className="text-value text-green-400">
              {result.playerTier}/{result.maxTier}
            </span>
          </div>
          <div className="stat-row">
            <div className="stat-row-label">
              <ChevronUp className="w-4 h-4 text-rose-400" />
              <span>Opponent Tier</span>
            </div>
            <span className="text-value text-rose-400">
              {result.opponentTier}/{result.maxTier}
            </span>
          </div>
        </div>

        {/* Session Progress */}
        <div className="panel-inner p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Swords className="w-4 h-4 icon-patience" />
            <span className="text-subheading">Campaign Progress</span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            {Array.from({ length: session.totalBattles }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  i < session.battlesWon
                    ? 'bg-amber-500'
                    : i === session.currentBattle - 1
                      ? result.won
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                      : 'bg-stone-700'
                }`}
              />
            ))}
          </div>

          <div className="text-sm text-stone-400 text-center">
            {result.won ? (
              battlesRemaining > 0 ? (
                <span>{battlesRemaining} battle{battlesRemaining > 1 ? 's' : ''} remaining</span>
              ) : (
                <span className="text-amber-400">Campaign Complete!</span>
              )
            ) : (
              <span className="text-rose-400">Campaign Failed</span>
            )}
          </div>
        </div>

        {/* Session End Message */}
        {isSessionOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`text-center p-4 rounded-xl mb-6 ${
              sessionWon
                ? 'bg-amber-500/10 border border-amber-500/30'
                : 'bg-rose-500/10 border border-rose-500/30'
            }`}
          >
            <p className={`text-lg font-medium ${sessionWon ? 'text-amber-200' : 'text-rose-200'}`}>
              {sessionWon
                ? 'You have triumphed in the Imperial Court!'
                : 'Your standing in the court has fallen.'}
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onReturnToMenu} className="flex-1 btn-secondary">
            <Home className="w-4 h-4" />
            <span>Menu</span>
          </button>

          {result.won && battlesRemaining > 0 && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              onClick={onContinue}
              className="flex-1 btn-primary"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
