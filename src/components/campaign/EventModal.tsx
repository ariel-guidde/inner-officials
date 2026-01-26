import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles, BookOpen, Swords, Coins, Shirt, Gem, MessageCircle, Star, AlertTriangle, XCircle, Heart } from 'lucide-react';
import { CalendarEvent, CampaignResources, BattleBonuses, SKIP_EVENT_COST } from '../../types/campaign';

interface EventModalProps {
  event: CalendarEvent | null;
  resources: CampaignResources;
  face: number;
  canAffordChoice: (choice: { resourceCost?: Partial<CampaignResources>; faceCost?: number }) => boolean;
  canSkip: boolean;
  onMakeChoice: (eventId: string, choiceId: string) => void;
  onSkipEvent: (eventId: string) => void;
  onClose: () => void;
}

function getEventIcon(type: CalendarEvent['type']) {
  switch (type) {
    case 'boss':
      return <Crown className="w-8 h-8 text-red-400" />;
    case 'opportunity':
      return <Sparkles className="w-8 h-8 text-amber-400" />;
    case 'story':
      return <BookOpen className="w-8 h-8 text-purple-400" />;
    case 'battle':
      return <Swords className="w-8 h-8 text-blue-400" />;
    default:
      return null;
  }
}

function getEventColors(type: CalendarEvent['type']) {
  switch (type) {
    case 'boss':
      return {
        border: 'border-red-500/50',
        bg: 'bg-red-900/20',
        button: 'bg-red-600 hover:bg-red-500',
      };
    case 'opportunity':
      return {
        border: 'border-amber-500/50',
        bg: 'bg-amber-900/20',
        button: 'bg-amber-600 hover:bg-amber-500',
      };
    case 'story':
      return {
        border: 'border-purple-500/50',
        bg: 'bg-purple-900/20',
        button: 'bg-purple-600 hover:bg-purple-500',
      };
    case 'battle':
      return {
        border: 'border-blue-500/50',
        bg: 'bg-blue-900/20',
        button: 'bg-blue-600 hover:bg-blue-500',
      };
    default:
      return {
        border: 'border-stone-500/50',
        bg: 'bg-stone-900/20',
        button: 'bg-stone-600 hover:bg-stone-500',
      };
  }
}

function ResourceIcon({ resource }: { resource: string }) {
  switch (resource) {
    case 'money':
      return <Coins className="w-3 h-3 text-yellow-400" />;
    case 'clothing':
      return <Shirt className="w-3 h-3 text-pink-400" />;
    case 'jewelry':
      return <Gem className="w-3 h-3 text-cyan-400" />;
    case 'rumors':
      return <MessageCircle className="w-3 h-3 text-purple-400" />;
    default:
      return null;
  }
}

function formatBonuses(bonuses: Partial<BattleBonuses>): string[] {
  const result: string[] = [];
  if (bonuses.startingFavor) result.push(`+${bonuses.startingFavor} Favor`);
  if (bonuses.opponentShame) result.push(`+${bonuses.opponentShame} Shame`);
  if (bonuses.patienceBonus) result.push(`+${bonuses.patienceBonus} Patience`);
  if (bonuses.extraCards?.length) result.push(`+${bonuses.extraCards.length} Cards`);
  return result;
}

export default function EventModal({
  event,
  resources,
  face,
  canAffordChoice,
  canSkip,
  onMakeChoice,
  onSkipEvent,
  onClose,
}: EventModalProps) {
  if (!event) return null;

  const colors = getEventColors(event.type);
  const hasChoices = event.choices && event.choices.length > 0;
  const canSkipThis = !event.cannotSkip && canSkip;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={`
            bg-stone-900 rounded-xl border ${colors.border} ${colors.bg}
            max-w-lg w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto
          `}
        >
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-800 mb-3">
              {getEventIcon(event.type)}
            </div>
            <h2 className="text-xl font-bold text-amber-100">{event.name}</h2>
            {event.day > 0 && (
              <p className="text-stone-400 text-sm mt-1">Day {event.day}</p>
            )}
          </div>

          <p className="text-stone-300 text-center mb-6 leading-relaxed">
            {event.description}
          </p>

          {/* Choices */}
          {hasChoices && (
            <div className="space-y-3">
              <h3 className="text-amber-200 font-semibold text-center mb-3">What will you do?</h3>
              {event.choices!.map((choice) => {
                const affordable = canAffordChoice(choice);
                const bonuses = choice.bonusReward ? formatBonuses(choice.bonusReward) : [];

                return (
                  <motion.button
                    key={choice.id}
                    whileHover={affordable ? { scale: 1.02 } : {}}
                    whileTap={affordable ? { scale: 0.98 } : {}}
                    onClick={() => affordable && onMakeChoice(event.id, choice.id)}
                    disabled={!affordable}
                    className={`
                      w-full p-4 rounded-lg border text-left transition-all
                      ${affordable
                        ? 'bg-stone-800 hover:bg-stone-700 border-stone-600 hover:border-amber-500 cursor-pointer'
                        : 'bg-stone-800/50 border-stone-700 cursor-not-allowed opacity-60'
                      }
                    `}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-amber-100">{choice.label}</span>
                      {choice.triggersBattle && (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                          <Swords className="w-3 h-3" />
                          Battle
                        </span>
                      )}
                    </div>
                    <p className="text-stone-400 text-sm mb-2">{choice.description}</p>

                    {/* Cost/Reward info */}
                    <div className="flex flex-wrap gap-3 text-xs">
                      {/* Resource costs */}
                      {choice.resourceCost && Object.entries(choice.resourceCost).map(([key, value]) => (
                        value ? (
                          <span key={key} className={`flex items-center gap-1 ${
                            resources[key as keyof CampaignResources] >= value
                              ? 'text-stone-400'
                              : 'text-red-400'
                          }`}>
                            <ResourceIcon resource={key} />
                            -{value} {key}
                            {resources[key as keyof CampaignResources] < value && (
                              <AlertTriangle className="w-3 h-3" />
                            )}
                          </span>
                        ) : null
                      ))}

                      {/* Face cost */}
                      {choice.faceCost && (
                        <span className={`flex items-center gap-1 ${
                          face >= choice.faceCost ? 'text-stone-400' : 'text-red-400'
                        }`}>
                          <Heart className="w-3 h-3 text-red-400" />
                          -{choice.faceCost} face
                          {face < choice.faceCost && <AlertTriangle className="w-3 h-3" />}
                        </span>
                      )}

                      {/* Resource rewards */}
                      {choice.resourceReward && Object.entries(choice.resourceReward).map(([key, value]) => (
                        value ? (
                          <span key={key} className="flex items-center gap-1 text-green-400">
                            <ResourceIcon resource={key} />
                            +{value} {key}
                          </span>
                        ) : null
                      ))}

                      {/* Battle bonuses */}
                      {bonuses.length > 0 && (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Star className="w-3 h-3" />
                          {bonuses.join(', ')}
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}

              {/* Skip option for non-boss events */}
              {!event.cannotSkip && (
                <motion.button
                  whileHover={canSkipThis ? { scale: 1.02 } : {}}
                  whileTap={canSkipThis ? { scale: 0.98 } : {}}
                  onClick={() => canSkipThis && onSkipEvent(event.id)}
                  disabled={!canSkipThis}
                  className={`
                    w-full p-4 rounded-lg border text-left transition-all
                    ${canSkipThis
                      ? 'bg-stone-800/50 hover:bg-stone-800 border-stone-700 hover:border-red-500 cursor-pointer'
                      : 'bg-stone-800/30 border-stone-800 cursor-not-allowed opacity-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="font-medium text-stone-300">Skip This Event</span>
                  </div>
                  <p className="text-stone-500 text-sm mb-2">
                    Decline to attend. You will lose reputation.
                  </p>
                  <div className="flex gap-3 text-xs">
                    {Object.entries(SKIP_EVENT_COST.resources).map(([key, value]) => (
                      value ? (
                        <span key={key} className={`flex items-center gap-1 ${
                          resources[key as keyof CampaignResources] >= value
                            ? 'text-stone-400'
                            : 'text-red-400'
                        }`}>
                          <ResourceIcon resource={key} />
                          -{value} {key}
                        </span>
                      ) : null
                    ))}
                    <span className={`flex items-center gap-1 ${
                      face >= SKIP_EVENT_COST.face ? 'text-stone-400' : 'text-red-400'
                    }`}>
                      <Heart className="w-3 h-3 text-red-400" />
                      -{SKIP_EVENT_COST.face} face
                    </span>
                  </div>
                </motion.button>
              )}
            </div>
          )}

          {/* Simple continue for events without choices */}
          {!hasChoices && (
            <button
              onClick={onClose}
              className={`
                w-full py-3 rounded-lg font-medium text-white transition-colors
                ${colors.button}
              `}
            >
              Continue
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
