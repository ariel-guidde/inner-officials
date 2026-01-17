import { motion } from 'framer-motion';
import { Hourglass, Sparkles, Scale } from 'lucide-react';

interface JudgePanelProps {
  patience: number;
  maxPatience: number;
  playerFavor: number;
  opponentFavor: number;
}

export default function JudgePanel({ patience, maxPatience, playerFavor, opponentFavor }: JudgePanelProps) {
  const patiencePercent = (patience / maxPatience) * 100;
  const patienceColor = patiencePercent > 50 ? 'bg-amber-500' : patiencePercent > 25 ? 'bg-orange-500' : 'bg-red-500';

  const favorDiff = playerFavor - opponentFavor;
  const favorAdvantage = favorDiff > 0 ? 'player' : favorDiff < 0 ? 'opponent' : 'tie';

  return (
    <div className="bg-stone-900/60 border border-stone-700 rounded-2xl p-6 backdrop-blur-sm max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Scale className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-medium text-amber-100">The Judgment</h3>
      </div>

      {/* Patience */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Hourglass className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-stone-300">Patience Remaining</span>
          </div>
          <span className="text-lg font-mono text-amber-400">{patience}</span>
        </div>
        <div className="h-3 bg-stone-800 rounded-full overflow-hidden border border-stone-700">
          <motion.div
            animate={{ width: `${patiencePercent}%` }}
            className={`h-full ${patienceColor} transition-colors`}
          />
        </div>
        {patience <= 10 && (
          <div className="text-xs text-orange-400 mt-1 text-center">
            Judges growing impatient...
          </div>
        )}
      </div>

      {/* Favor Comparison */}
      <div>
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="text-sm text-stone-300">Favor Standing</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Player favor */}
          <div className="flex-1 text-right">
            <div className="text-xs text-stone-500 mb-1">You</div>
            <div className={`text-2xl font-mono ${favorAdvantage === 'player' ? 'text-green-400' : 'text-stone-300'}`}>
              {playerFavor}
            </div>
          </div>

          {/* VS */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              favorAdvantage === 'player' ? 'bg-green-600/30 text-green-400 border border-green-500/50' :
              favorAdvantage === 'opponent' ? 'bg-red-600/30 text-red-400 border border-red-500/50' :
              'bg-stone-700 text-stone-400 border border-stone-600'
            }`}>
              vs
            </div>
          </div>

          {/* Opponent favor */}
          <div className="flex-1 text-left">
            <div className="text-xs text-stone-500 mb-1">Opponent</div>
            <div className={`text-2xl font-mono ${favorAdvantage === 'opponent' ? 'text-red-400' : 'text-stone-300'}`}>
              {opponentFavor}
            </div>
          </div>
        </div>

        {/* Win condition reminder */}
        <div className="mt-4 text-center text-xs text-stone-500">
          Reach 100 favor to win instantly
        </div>
      </div>
    </div>
  );
}
