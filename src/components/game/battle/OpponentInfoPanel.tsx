import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Swords, Hourglass, Zap, HelpCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { Intention, JudgeEffects, INTENTION_TYPE, IntentionType, TierDefinition, Opponent } from '../../../types/game';

interface OpponentInfoPanelProps {
  opponents: Opponent[];
  tierStructure: TierDefinition[];
  judgeEffects: JudgeEffects;
  selectableOpponentIds?: string[];
  selectedOpponentId?: string;
  onOpponentClick?: (opponentId: string) => void;
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
  [INTENTION_TYPE.STANDING_GAIN]: <TrendingUp className="w-4 h-4 text-purple-400" />,
  [INTENTION_TYPE.STANDING_DAMAGE]: <TrendingDown className="w-4 h-4 text-amber-400" />,
  [INTENTION_TYPE.STALL]: <Hourglass className="w-4 h-4 text-amber-400" />,
  [INTENTION_TYPE.FLUSTERED]: <Zap className="w-4 h-4 text-blue-400" />,
};

const INTENTION_COLORS: Record<IntentionType, string> = {
  [INTENTION_TYPE.ATTACK]: 'intention-attack',
  [INTENTION_TYPE.STANDING_GAIN]: 'intention-standing-gain',
  [INTENTION_TYPE.STANDING_DAMAGE]: 'intention-standing-damage',
  [INTENTION_TYPE.STALL]: 'intention-stall',
  [INTENTION_TYPE.FLUSTERED]: 'intention-flustered',
};

const INTENTION_DESCRIPTIONS: Record<IntentionType, (value: number) => string> = {
  [INTENTION_TYPE.ATTACK]: (value) => `Will deal ${value} damage to your Face (reduced by Composure) at end of turn`,
  [INTENTION_TYPE.STANDING_GAIN]: (value) => `Will gain ${value} Standing with the judge at end of turn`,
  [INTENTION_TYPE.STANDING_DAMAGE]: (value) => `Will damage your Standing by ${value} at end of turn`,
  [INTENTION_TYPE.STALL]: (value) => `Will reduce Patience by ${value} at end of turn`,
  [INTENTION_TYPE.FLUSTERED]: () => `Opponent is flustered and will waste their action`,
};

function SingleOpponentPanel({
  opponent,
  judgeEffects,
  isSelectable,
  isSelected,
  onClick,
}: {
  opponent: Opponent;
  tierStructure: TierDefinition[];
  judgeEffects: JudgeEffects;
  isSelectable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showNextTooltip, setShowNextTooltip] = useState(false);
  const facePercent = (opponent.face / opponent.maxFace) * 100;
  const sprite = OPPONENT_SPRITES[opponent.name] || '👤';

  const canSeeNextIntention = opponent.statuses.some(s => s.tags?.includes('revealed'));

  const getDisplayedValue = (intention: Intention | null): number => {
    if (!intention) return 0;
    if (intention.type === INTENTION_TYPE.ATTACK) {
      return Math.floor(intention.value * judgeEffects.damageModifier);
    }
    return intention.value;
  };

  const getIntentionDescription = (intention: Intention | null) => {
    if (!intention) return '';
    if (intention.type === INTENTION_TYPE.FLUSTERED) {
      return `Opponent is flustered and will waste their action`;
    }
    const displayedValue = getDisplayedValue(intention);
    return INTENTION_DESCRIPTIONS[intention.type]?.(displayedValue) || '';
  };

  return (
    <div
      className={`panel p-4 w-56 transition-all ${
        isSelectable
          ? 'cursor-pointer ring-2 ring-red-500/50 hover:ring-red-400 animate-pulse'
          : ''
      } ${isSelected ? 'ring-2 ring-amber-500' : ''}`}
      onClick={isSelectable ? onClick : undefined}
    >
      {/* Targeting indicator */}
      {isSelectable && (
        <div className="text-center text-xs text-red-400 font-medium mb-2 bg-red-900/30 rounded py-0.5">
          Click to target
        </div>
      )}
      {/* Header with sprite */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-stone-800 border border-stone-600 flex items-center justify-center text-2xl">
          {sprite}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-amber-100 truncate">{opponent.name}</div>
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
          <span className="text-value">{opponent.face}/{opponent.maxFace}</span>
        </div>
        <div className="progress-bar">
          <motion.div
            animate={{ width: `${facePercent}%` }}
            className="h-full bg-rose-500"
          />
        </div>
      </div>

      {/* Core Argument */}
      {opponent.coreArgument && (
        <div className="mb-3 px-2 py-1.5 bg-stone-800/50 border border-stone-700 rounded-lg">
          <div className="text-[10px] text-stone-500 mb-0.5">Core Argument</div>
          <div className="text-xs text-amber-200">{opponent.coreArgument.name}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">{opponent.coreArgument.description}</div>
        </div>
      )}

      {/* Opponent Statuses */}
      {opponent.statuses.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {opponent.statuses.map(status => (
            <div
              key={status.id}
              className={`px-1.5 py-0.5 rounded text-[10px] border ${
                status.isPositive
                  ? 'border-green-600/50 bg-green-900/30 text-green-300'
                  : 'border-red-600/50 bg-red-900/30 text-red-300'
              }`}
              title={status.description}
            >
              {status.name}
              {status.triggersRemaining !== undefined && (
                <span className="ml-0.5 opacity-60">{status.triggersRemaining}x</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Intentions */}
      <div className="border-t border-stone-700 pt-3 relative">
        <div className="text-label-small mb-2">Intentions</div>

        {/* Current Intention */}
        <AnimatePresence mode="wait">
          <motion.div
            key={opponent.currentIntention?.name}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-help ${
              INTENTION_COLORS[opponent.currentIntention?.type || INTENTION_TYPE.ATTACK]
            }`}
          >
            {INTENTION_ICONS[opponent.currentIntention?.type || INTENTION_TYPE.ATTACK]}
            <div className="flex-1 min-w-0">
              <span className="text-sm">{opponent.currentIntention?.name}</span>
              {opponent.currentIntention && getDisplayedValue(opponent.currentIntention) > 0 && (
                <span className="text-xs opacity-70 ml-2">{getDisplayedValue(opponent.currentIntention)}</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs bg-stone-900/60 px-1.5 py-0.5 rounded text-stone-400">
              End of turn
            </div>
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
              {getIntentionDescription(opponent.currentIntention)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Intention (hidden or revealed) */}
        <div className="mt-2 relative">
          <div className="text-label-small text-stone-600 mb-1">Next</div>
          {canSeeNextIntention && opponent.nextIntention ? (
            <motion.div
              onMouseEnter={() => setShowNextTooltip(true)}
              onMouseLeave={() => setShowNextTooltip(false)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border cursor-help opacity-70 ${
                INTENTION_COLORS[opponent.nextIntention.type]
              }`}
            >
              {INTENTION_ICONS[opponent.nextIntention.type]}
              <span className="text-xs">{opponent.nextIntention.name}</span>
              {getDisplayedValue(opponent.nextIntention) > 0 && (
                <span className="text-[10px] opacity-70 ml-auto">{getDisplayedValue(opponent.nextIntention)}</span>
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
            {showNextTooltip && canSeeNextIntention && opponent.nextIntention && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute left-0 right-0 top-full mt-2 p-2 bg-stone-800 border border-stone-600 rounded-lg text-xs text-stone-300 z-50 shadow-xl"
              >
                {getIntentionDescription(opponent.nextIntention)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function OpponentInfoPanel({
  opponents,
  tierStructure,
  judgeEffects,
  selectableOpponentIds,
  selectedOpponentId,
  onOpponentClick,
}: OpponentInfoPanelProps) {
  return (
    <div className="flex gap-3">
      {opponents.map((opponent) => (
        <SingleOpponentPanel
          key={opponent.id}
          opponent={opponent}
          tierStructure={tierStructure}
          judgeEffects={judgeEffects}
          isSelectable={selectableOpponentIds?.includes(opponent.id)}
          isSelected={selectedOpponentId === opponent.id}
          onClick={onOpponentClick ? () => onOpponentClick(opponent.id) : undefined}
        />
      ))}
    </div>
  );
}
