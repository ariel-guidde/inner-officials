import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Swords, Sparkles, Hourglass, Zap } from 'lucide-react';
import { Intention } from '../../../types/game';

interface OpponentInfoPanelProps {
  name: string;
  face: number;
  maxFace: number;
  favor: number;
  isShocked: number;
  currentIntention: Intention | null;
}

const OPPONENT_SPRITES: Record<string, string> = {
  'The Concubine': '👸',
  'The Scholar': '🧑‍🎓',
  'The General': '⚔️',
  'The Eunuch': '🧑‍🦲',
  'The Empress': '👑',
};

const INTENTION_ICONS: Record<string, React.ReactNode> = {
  attack: <Swords className="w-4 h-4 text-red-400" />,
  favor: <Sparkles className="w-4 h-4 text-purple-400" />,
  stall: <Hourglass className="w-4 h-4 text-amber-400" />,
  shocked: <Zap className="w-4 h-4 text-blue-400" />,
};

const INTENTION_COLORS: Record<string, string> = {
  attack: 'border-red-500/50 bg-red-500/10 text-red-400',
  favor: 'border-purple-500/50 bg-purple-500/10 text-purple-400',
  stall: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
  shocked: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
};

const INTENTION_DESCRIPTIONS: Record<string, (value: number) => string> = {
  attack: (value) => `Will deal ${value} damage to your Face (reduced by your Composure)`,
  favor: (value) => `Will steal ${value} Favor from you and gain it themselves`,
  stall: (value) => `Will reduce Patience by ${value}, speeding up the judgment`,
  shocked: () => `Stunned and cannot act this turn`,
};

export default function OpponentInfoPanel({
  name,
  face,
  maxFace,
  favor,
  isShocked,
  currentIntention,
}: OpponentInfoPanelProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const facePercent = (face / maxFace) * 100;
  const sprite = OPPONENT_SPRITES[name] || '👤';

  const getIntentionDescription = () => {
    if (isShocked > 0) {
      return INTENTION_DESCRIPTIONS.shocked(0);
    }
    if (currentIntention) {
      return INTENTION_DESCRIPTIONS[currentIntention.type]?.(currentIntention.value) || '';
    }
    return '';
  };

  return (
    <div className="bg-stone-900/80 border border-stone-700 rounded-xl p-4 backdrop-blur-sm w-56">
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
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3 h-3 text-rose-500" />
            <span className="text-xs text-stone-400">Face</span>
          </div>
          <span className="text-xs font-mono text-stone-300">{face}/{maxFace}</span>
        </div>
        <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${facePercent}%` }}
            className="h-full bg-rose-500"
          />
        </div>
      </div>

      {/* Favor */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span className="text-xs text-stone-400">Favor</span>
          </div>
          <span className="text-xs font-mono text-stone-300">{favor}/100</span>
        </div>
        <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${favor}%` }}
            className="h-full bg-purple-500"
          />
        </div>
      </div>

      {/* Intention */}
      <div className="border-t border-stone-700 pt-3 relative">
        <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-2">Intention</div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIntention?.name}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-help ${
              isShocked > 0
                ? INTENTION_COLORS.shocked
                : INTENTION_COLORS[currentIntention?.type || 'attack']
            }`}
          >
            {isShocked > 0 ? (
              <>
                {INTENTION_ICONS.shocked}
                <span className="text-sm">Shocked ({isShocked})</span>
              </>
            ) : (
              <>
                {INTENTION_ICONS[currentIntention?.type || 'attack']}
                <span className="text-sm">{currentIntention?.name}</span>
                {currentIntention && currentIntention.value > 0 && (
                  <span className="text-xs opacity-70 ml-auto">{currentIntention.value}</span>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute left-0 right-0 top-full mt-2 p-2 bg-stone-800 border border-stone-600 rounded-lg text-xs text-stone-300 z-50 shadow-xl"
            >
              {getIntentionDescription()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
