import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hourglass, Sparkles, Scale, Gavel, AlertTriangle, Flame, Droplets } from 'lucide-react';
import { JudgeEffects } from '../../../types/game';

interface JudgePanelProps {
  judgeName: string;
  patience: number;
  maxPatience: number;
  playerFavor: number;
  opponentFavor: number;
  judgeEffects: JudgeEffects;
  nextJudgeAction: string | null;
  patienceThreshold: number;
  patienceSpent: number;
}

export default function JudgePanel({
  judgeName,
  patience,
  maxPatience,
  playerFavor,
  opponentFavor,
  judgeEffects,
  nextJudgeAction,
  patienceThreshold,
  patienceSpent,
}: JudgePanelProps) {
  const patienceRemaining = Math.max(0, patienceThreshold - patienceSpent);
  const [showEffectsTooltip, setShowEffectsTooltip] = useState(false);
  const patiencePercent = (patience / maxPatience) * 100;
  const patienceColor = patiencePercent > 50 ? 'bg-amber-500' : patiencePercent > 25 ? 'bg-orange-500' : 'bg-red-500';

  const favorDiff = playerFavor - opponentFavor;
  const favorAdvantage = favorDiff > 0 ? 'player' : favorDiff < 0 ? 'opponent' : 'tie';

  // Check for active modifiers
  const hasActiveModifiers =
    judgeEffects.endTurnPatienceCost !== 1 ||
    judgeEffects.favorGainModifier !== 1.0 ||
    judgeEffects.damageModifier !== 1.0 ||
    Object.keys(judgeEffects.elementCostModifier).length > 0;

  const getActiveModifiersText = () => {
    const mods: string[] = [];
    if (judgeEffects.endTurnPatienceCost !== 1) {
      mods.push(`End turn costs ${judgeEffects.endTurnPatienceCost} patience`);
    }
    if (judgeEffects.favorGainModifier !== 1.0) {
      const percent = Math.round((judgeEffects.favorGainModifier - 1) * 100);
      mods.push(`Favor gains ${percent > 0 ? '+' : ''}${percent}%`);
    }
    if (judgeEffects.damageModifier !== 1.0) {
      const percent = Math.round((judgeEffects.damageModifier - 1) * 100);
      mods.push(`All damage ${percent > 0 ? '+' : ''}${percent}%`);
    }
    if (judgeEffects.elementCostModifier.fire) {
      mods.push(`Fire cards +${judgeEffects.elementCostModifier.fire} patience`);
    }
    if (judgeEffects.elementCostModifier.water) {
      mods.push(`Water cards +${judgeEffects.elementCostModifier.water} patience`);
    }
    if (judgeEffects.elementCostModifier.wood) {
      mods.push(`Wood cards +${judgeEffects.elementCostModifier.wood} patience`);
    }
    if (judgeEffects.elementCostModifier.earth) {
      mods.push(`Earth cards +${judgeEffects.elementCostModifier.earth} patience`);
    }
    if (judgeEffects.elementCostModifier.metal) {
      mods.push(`Metal cards +${judgeEffects.elementCostModifier.metal} patience`);
    }
    return mods;
  };

  return (
    <div className="bg-stone-900/60 border border-stone-700 rounded-2xl p-6 backdrop-blur-sm max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Scale className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-medium text-amber-100">{judgeName}'s Judgment</h3>
      </div>

      {/* Patience */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Hourglass className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-stone-300">Patience</span>
            <span className="text-xs text-stone-500">(-{judgeEffects.endTurnPatienceCost}/turn)</span>
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

      {/* Active Judge Effects / Accumulated Decrees */}
      {(hasActiveModifiers || (judgeEffects.activeDecrees && judgeEffects.activeDecrees.length > 0)) && (
        <div
          className="mb-4 relative"
          onMouseEnter={() => setShowEffectsTooltip(true)}
          onMouseLeave={() => setShowEffectsTooltip(false)}
        >
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-900/30 border border-amber-700/50 rounded-lg cursor-help">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-300">
              Active Decrees ({judgeEffects.activeDecrees?.length || 0})
            </span>
            <div className="ml-auto flex gap-1">
              {judgeEffects.endTurnPatienceCost > 1 && (
                <Hourglass className="w-3 h-3 text-amber-400" />
              )}
              {judgeEffects.favorGainModifier !== 1.0 && (
                <Sparkles className="w-3 h-3 text-purple-400" />
              )}
              {judgeEffects.elementCostModifier.fire && (
                <Flame className="w-3 h-3 text-red-400" />
              )}
              {judgeEffects.elementCostModifier.water && (
                <Droplets className="w-3 h-3 text-blue-400" />
              )}
            </div>
          </div>
          <AnimatePresence>
            {showEffectsTooltip && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute left-0 right-0 top-full mt-2 p-3 bg-stone-800 border border-stone-600 rounded-lg text-xs z-50 shadow-xl max-h-48 overflow-y-auto"
              >
                <div className="font-medium text-amber-200 mb-2">Current Effects:</div>
                <ul className="space-y-1 text-stone-300 mb-3">
                  {getActiveModifiersText().map((mod, i) => (
                    <li key={i}>• {mod}</li>
                  ))}
                </ul>
                {judgeEffects.activeDecrees && judgeEffects.activeDecrees.length > 0 && (
                  <>
                    <div className="font-medium text-amber-200 mb-2 border-t border-stone-600 pt-2">
                      Decree History:
                    </div>
                    <ul className="space-y-2 text-stone-300">
                      {judgeEffects.activeDecrees.map((decree, i) => (
                        <li key={i} className="border-l-2 border-amber-600/50 pl-2">
                          <div className="font-medium text-amber-100">{decree.name}</div>
                          <div className="text-[10px] text-stone-400">
                            Turn {decree.turnApplied} - {decree.description}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Upcoming Judge Action */}
      {nextJudgeAction && (
        <div className="mb-4 px-3 py-2 bg-stone-800/50 border border-stone-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gavel className="w-4 h-4 text-stone-400" />
              <span className="text-xs text-stone-400">Next Decree:</span>
            </div>
            <div className="flex items-center gap-1 text-xs bg-stone-900/60 px-1.5 py-0.5 rounded">
              <Hourglass className="w-3 h-3 text-stone-400" />
              <span className="text-stone-300">{patienceRemaining}</span>
            </div>
          </div>
          <div className="text-sm text-amber-200 mt-1">{nextJudgeAction}</div>
        </div>
      )}

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
