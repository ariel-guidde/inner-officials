import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Swords, Hourglass, Zap, TrendingDown, TrendingUp, Target, Crosshair } from 'lucide-react';
import { Intention, JudgeEffects, INTENTION_TYPE, IntentionType, TierDefinition, Opponent } from '../../../types/game';
import { SPRING_PRESETS } from '../../../lib/animations/constants';
import { getStatusIcon, getStatusColor, getStatusTextColor } from '../../../lib/statusIcons';
import { getStatusTemplate } from '../../../data/statusTemplates';
import { getOpponentImage } from '../../../lib/characterImages';

interface OpponentInfoPanelProps {
  opponents: Opponent[];
  tierStructure: TierDefinition[];
  judgeEffects: JudgeEffects;
  selectableOpponentIds?: string[];
  selectedOpponentId?: string;
  onOpponentClick?: (opponentId: string) => void;
}

const INTENTION_ICONS: Record<IntentionType, React.ReactNode> = {
  [INTENTION_TYPE.ATTACK]: <Swords className="w-4 h-4 text-red-400" />,
  [INTENTION_TYPE.STANDING_GAIN]: <TrendingUp className="w-4 h-4 text-purple-400" />,
  [INTENTION_TYPE.STANDING_DAMAGE]: <TrendingDown className="w-4 h-4 text-amber-400" />,
  [INTENTION_TYPE.STALL]: <Hourglass className="w-4 h-4 text-amber-400" />,
  [INTENTION_TYPE.FLUSTERED]: <Zap className="w-4 h-4 text-blue-400" />,
};

function SingleOpponentPanel({
  opponent,
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
  const [isHovered, setIsHovered] = useState(false);
  const facePercent = (opponent.face / opponent.maxFace) * 100;
  const characterImage = getOpponentImage(opponent.name);

  const canSeeNextIntention = opponent.statuses.some(s => s.tags?.includes('revealed'));

  const getDisplayedValue = (intention: Intention | null): number => {
    if (!intention) return 0;
    // Use pre-calculated displayValue if available (includes all modifiers)
    return intention.displayValue ?? intention.value;
  };

  return (
    <div className="flex flex-col gap-2">
      <motion.div
        data-opponent-panel
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={isSelectable ? onClick : undefined}
      >
        {/* Character Image - Main Display */}
        <motion.div
          animate={isSelectable ? {
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 0 20px rgba(239, 68, 68, 0.5)',
              '0 0 40px rgba(239, 68, 68, 0.8)',
              '0 0 20px rgba(239, 68, 68, 0.5)',
            ],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: isSelectable ? Infinity : 0,
            ease: 'easeInOut',
          }}
          whileHover={isSelectable ? { scale: 1.08 } : { scale: 1.05 }}
          className={`
            relative w-48 h-64 rounded-xl overflow-hidden shadow-2xl
            transition-all cursor-pointer
            ${isSelectable ? 'ring-4 ring-red-500' : ''}
            ${isSelected ? 'ring-4 ring-amber-500' : ''}
          `}
        >
        {/* Character Portrait */}
        <img
          src={characterImage}
          alt={opponent.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-stone-800 flex items-center justify-center text-6xl">👤</div>';
          }}
        />

        {/* Darkening overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Always visible: Name and Face Bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
          <div className="text-sm font-bold text-amber-100 drop-shadow-lg">{opponent.name}</div>

          {/* Face Bar */}
          <div className="relative">
            <div className="h-2 bg-black/50 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                animate={{ width: `${facePercent}%` }}
                className="h-full bg-rose-500"
              />
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Heart className="w-3 h-3 text-rose-400" />
              <span className="text-xs text-rose-100 font-mono">{opponent.face}/{opponent.maxFace}</span>
            </div>
          </div>
        </div>

        {/* Targeting crosshairs */}
        {isSelectable && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="absolute top-4 right-4 pointer-events-none z-10"
            >
              <Crosshair className="w-8 h-8 text-red-400 drop-shadow-lg" />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 border-4 border-red-500/30 rounded-xl pointer-events-none"
            />
          </>
        )}

        {/* Targeting indicator banner */}
        {isSelectable && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={SPRING_PRESETS.bouncy}
            className="absolute top-0 left-0 right-0 text-center text-xs text-red-100 font-bold bg-red-600/90 py-1 px-2 flex items-center justify-center gap-1"
          >
            <Target className="w-3 h-3" />
            SELECT TARGET
          </motion.div>
        )}
        </motion.div>

        {/* Hover Info Panel - Detailed Information */}
        <AnimatePresence>
          {isHovered && !isSelectable && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute right-full mr-4 top-0 w-72 bg-stone-900/95 border-2 border-stone-700 rounded-xl shadow-2xl backdrop-blur-md z-50 overflow-hidden"
              onMouseEnter={() => setIsHovered(true)}
            >
              {/* Header */}
              <div className="bg-stone-800/50 px-4 py-2 border-b border-stone-700">
                <div className="text-lg font-bold text-amber-100">{opponent.name}</div>
                <div className="text-xs text-stone-400">Opponent</div>
              </div>

              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {/* Core Argument */}
                {opponent.coreArgument && (
                  <div className="px-3 py-2 bg-purple-900/20 border border-purple-600/50 rounded-lg">
                    <div className="text-xs text-purple-400 mb-1">Core Argument</div>
                    <div className="text-sm font-medium text-purple-200">{opponent.coreArgument.name}</div>
                    <div className="text-xs text-stone-400 mt-1">{opponent.coreArgument.description}</div>
                  </div>
                )}

                {/* Opponent Statuses */}
                {opponent.statuses.length > 0 && (
                  <div>
                    <div className="text-xs text-stone-500 mb-2">Active Effects</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(() => {
                        // Group statuses by templateId
                        const statusGroups: Record<string, { statuses: typeof opponent.statuses, count: number, maxTurns: number, maxTriggers: number }> = {};
                        opponent.statuses.forEach(status => {
                          const key = status.templateId || status.id;
                          if (!statusGroups[key]) {
                            statusGroups[key] = { statuses: [], count: 0, maxTurns: status.turnsRemaining, maxTriggers: status.triggersRemaining || 0 };
                          }
                          statusGroups[key].statuses.push(status);
                          statusGroups[key].count++;
                          statusGroups[key].maxTurns = Math.max(statusGroups[key].maxTurns, status.turnsRemaining);
                          if (status.triggersRemaining !== undefined) {
                            statusGroups[key].maxTriggers = Math.max(statusGroups[key].maxTriggers, status.triggersRemaining);
                          }
                        });

                        return Object.entries(statusGroups).map(([templateId, group]) => {
                          const template = getStatusTemplate(templateId);
                          const firstStatus = group.statuses[0];
                          const Icon = getStatusIcon(templateId);
                          const isPositive = template?.isPositive ?? firstStatus.isPositive;

                          return (
                            <div key={templateId} className="relative group/status">
                              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getStatusColor(isPositive)}`}>
                                <Icon className={`w-4 h-4 ${getStatusTextColor(isPositive)}`} />
                              </div>
                              {group.count > 1 && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-stone-700 rounded-full text-[9px] flex items-center justify-center font-bold text-stone-200 border border-stone-600">
                                  {group.count}
                                </div>
                              )}
                              {(group.maxTurns > 0 || group.maxTriggers > 0) && (
                                <div className="absolute -bottom-1 -right-1 min-w-[16px] h-4 bg-stone-600 rounded-full text-[8px] flex items-center justify-center font-bold text-stone-200 border border-stone-500 px-0.5">
                                  {group.maxTurns > 0 && `${group.maxTurns}t`}
                                  {group.maxTriggers > 0 && `${group.maxTriggers}x`}
                                </div>
                              )}

                              {/* Tooltip */}
                              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/status:block z-50 pointer-events-none">
                                <div className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                                  <div className="font-bold text-stone-100">{template?.name || firstStatus.name}</div>
                                  <div className="text-stone-400 text-[10px] mt-0.5">{template?.description || firstStatus.description}</div>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {/* Next Intention in hover panel */}
                {canSeeNextIntention && opponent.nextIntention && (
                  <div>
                    <div className="text-xs text-stone-500 mb-2">Next Intention</div>
                    <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg opacity-70 bg-stone-800/30`}>
                      {INTENTION_ICONS[opponent.nextIntention.type]}
                      <span className="text-xs">{opponent.nextIntention.name}</span>
                      {getDisplayedValue(opponent.nextIntention) > 0 && (
                        <span className="text-[10px] opacity-70 ml-auto">{getDisplayedValue(opponent.nextIntention)}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Current Intention - Always Visible Below Image */}
      {opponent.currentIntention && (
        <div className="w-48 flex items-center gap-2 px-3 py-2 bg-stone-900/60 backdrop-blur-sm rounded-lg">
          {INTENTION_ICONS[opponent.currentIntention.type]}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-stone-100 truncate">{opponent.currentIntention.name}</div>
            {getDisplayedValue(opponent.currentIntention) > 0 && (
              <div className="text-[10px] text-stone-400">{getDisplayedValue(opponent.currentIntention)}</div>
            )}
          </div>
        </div>
      )}
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
    <div className="flex gap-4">
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
