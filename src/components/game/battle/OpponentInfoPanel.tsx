import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Swords, Sparkles, Hourglass, Zap, HelpCircle } from 'lucide-react';
import { Intention, JudgeEffects, INTENTION_TYPE, IntentionType } from '../../../types/game';

interface OpponentInfoPanelProps {
  name: string;
  face: number;
  maxFace: number;
  favor: number;
  patienceSpent: number;
  currentIntention: Intention | null;
  nextIntention: Intention | null;
  canSeeNextIntention: boolean;
  judgeEffects: JudgeEffects;
}

const OPPONENT_SPRITES: Record<string, string> = {
  'The Concubine': '👸',
  'The Scholar': '🧑‍🎓',
  'The General': '⚔️',
  'The Eunuch': '🧑‍🦲',
  'The Empress': '👑',
};

const INTENTION_ICONS: Record<IntentionType, React.ReactNode> = {
  [INTENTION_TYPE.ATTACK]: <Swords className="w-4 h-4 text-red-400" />,
  [INTENTION_TYPE.FAVOR]: <Sparkles className="w-4 h-4 text-purple-400" />,
  [INTENTION_TYPE.STALL]: <Hourglass className="w-4 h-4 text-amber-400" />,
  [INTENTION_TYPE.FLUSTERED]: <Zap className="w-4 h-4 text-blue-400" />,
};

const INTENTION_COLORS: Record<IntentionType, string> = {
  [INTENTION_TYPE.ATTACK]: 'intention-attack',
  [INTENTION_TYPE.FAVOR]: 'intention-favor',
  [INTENTION_TYPE.STALL]: 'intention-stall',
  [INTENTION_TYPE.FLUSTERED]: 'intention-flustered',
};

const INTENTION_DESCRIPTIONS: Record<IntentionType, (value: number, remaining: number) => string> = {
  [INTENTION_TYPE.ATTACK]: (value, remaining) => `Will deal ${value} damage to your Face (reduced by Composure) after ${remaining} more patience spent`,
  [INTENTION_TYPE.FAVOR]: (value, remaining) => `Will steal ${value} Favor from you after ${remaining} more patience spent`,
  [INTENTION_TYPE.STALL]: (value, remaining) => `Will reduce Patience by ${value} after ${remaining} more patience spent`,
  [INTENTION_TYPE.FLUSTERED]: () => `Opponent is flustered and will waste their action`,
};

export default function OpponentInfoPanel({
  name,
  face,
  maxFace,
  favor,
  patienceSpent,
  currentIntention,
  nextIntention,
  canSeeNextIntention,
  judgeEffects,
}: OpponentInfoPanelProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showNextTooltip, setShowNextTooltip] = useState(false);
  const facePercent = (face / maxFace) * 100;
  const sprite = OPPONENT_SPRITES[name] || '👤';

  const patienceRemaining = currentIntention
    ? Math.max(0, currentIntention.patienceThreshold - patienceSpent)
    : 0;

  // Calculate displayed value with modifiers
  const getDisplayedValue = (intention: Intention | null): number => {
    if (!intention) return 0;
    if (intention.type === INTENTION_TYPE.ATTACK) {
      return Math.floor(intention.value * judgeEffects.damageModifier);
    }
    return intention.value;
  };

  const getIntentionDescription = (intention: Intention | null, remaining?: number) => {
    if (!intention) return '';
    if (intention.type === INTENTION_TYPE.FLUSTERED) {
      return `Opponent is flustered and will waste their action (after ${remaining ?? intention.patienceThreshold} more patience spent)`;
    }
    const displayedValue = getDisplayedValue(intention);
    return INTENTION_DESCRIPTIONS[intention.type]?.(displayedValue, remaining ?? intention.patienceThreshold) || '';
  };

  return (
    <div className="panel p-4 w-56">
      {/* Header with sprite */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-stone-800 border border-stone-600 flex items-center justify-center text-2xl">
          {sprite}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-amber-100 truncate">{name}</div>
          <div className="text-xs text-stone-500">Opponent</div>
        </div>
      </div>

      {/* Face */}
      <div className="mb-2">
        <div className="stat-row mb-1">
          <div className="stat-row-label">
            <Heart className="w-3 h-3 icon-face" />
            <span>Face</span>
          </div>
          <span className="text-value">{face}/{maxFace}</span>
        </div>
        <div className="progress-bar">
          <motion.div
            animate={{ width: `${facePercent}%` }}
            className="h-full bg-rose-500"
          />
        </div>
      </div>

      {/* Favor */}
      <div className="mb-3">
        <div className="stat-row mb-1">
          <div className="stat-row-label">
            <Sparkles className="w-3 h-3 icon-favor" />
            <span>Favor</span>
          </div>
          <span className="text-value">{favor}/100</span>
        </div>
        <div className="progress-bar">
          <motion.div
            animate={{ width: `${favor}%` }}
            className="h-full bg-purple-500"
          />
        </div>
      </div>

      {/* Intentions */}
      <div className="border-t border-stone-700 pt-3 relative">
        <div className="text-label-small mb-2">Intentions</div>

        {/* Current Intention */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIntention?.name}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-help ${
              INTENTION_COLORS[currentIntention?.type || INTENTION_TYPE.ATTACK]
            }`}
          >
            {INTENTION_ICONS[currentIntention?.type || INTENTION_TYPE.ATTACK]}
            <div className="flex-1 min-w-0">
              <span className="text-sm">{currentIntention?.name}</span>
              {currentIntention && getDisplayedValue(currentIntention) > 0 && (
                <span className="text-xs opacity-70 ml-2">{getDisplayedValue(currentIntention)}</span>
              )}
            </div>
            {currentIntention && (
              <div className="flex items-center gap-1 text-xs bg-stone-900/60 px-1.5 py-0.5 rounded">
                <Hourglass className="w-3 h-3" />
                <span>{patienceRemaining}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Tooltip for current */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute left-0 right-0 top-full mt-2 p-2 bg-stone-800 border border-stone-600 rounded-lg text-xs text-stone-300 z-50 shadow-xl"
            >
              {getIntentionDescription(currentIntention, patienceRemaining)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Intention (hidden or revealed) */}
        <div className="mt-2 relative">
          <div className="text-label-small text-stone-600 mb-1">Next</div>
          {canSeeNextIntention && nextIntention ? (
            <motion.div
              onMouseEnter={() => setShowNextTooltip(true)}
              onMouseLeave={() => setShowNextTooltip(false)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border cursor-help opacity-70 ${
                INTENTION_COLORS[nextIntention.type]
              }`}
            >
              {INTENTION_ICONS[nextIntention.type]}
              <span className="text-xs">{nextIntention.name}</span>
              {getDisplayedValue(nextIntention) > 0 && (
                <span className="text-[10px] opacity-70 ml-auto">{getDisplayedValue(nextIntention)}</span>
              )}
            </motion.div>
          ) : (
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-stone-700 bg-stone-800/50 text-stone-500">
              <HelpCircle className="w-3 h-3" />
              <span className="text-xs">???</span>
            </div>
          )}

          {/* Tooltip for next */}
          <AnimatePresence>
            {showNextTooltip && canSeeNextIntention && nextIntention && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute left-0 right-0 top-full mt-2 p-2 bg-stone-800 border border-stone-600 rounded-lg text-xs text-stone-300 z-50 shadow-xl"
              >
                {getIntentionDescription(nextIntention)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
