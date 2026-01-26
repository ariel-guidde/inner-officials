import { motion } from 'framer-motion';
import { Clock, ShoppingBag, Users, Building2, Brush, Moon, Wine, Flame, AlertCircle } from 'lucide-react';
import { DayAction, formatHour } from '../../types/campaign';

interface ActionPanelProps {
  actions: DayAction[];
  currentHour: number;
  hoursRemaining: number;
  isActionAvailable: (actionId: string) => boolean;
  onSelectAction: (actionId: string) => void;
  disabled?: boolean;
}

function getActionIcon(actionId: string) {
  switch (actionId) {
    case 'visit-market':
      return <ShoppingBag className="w-5 h-5" />;
    case 'gossip-servants':
      return <Users className="w-5 h-5" />;
    case 'attend-court':
      return <Building2 className="w-5 h-5" />;
    case 'practice-skills':
      return <Brush className="w-5 h-5" />;
    case 'rest-quarters':
      return <Moon className="w-5 h-5" />;
    case 'evening-gathering':
      return <Wine className="w-5 h-5" />;
    case 'night-prayer':
      return <Flame className="w-5 h-5" />;
    default:
      return <Clock className="w-5 h-5" />;
  }
}

function getAvailabilityReason(
  action: DayAction,
  currentHour: number,
  hoursRemaining: number
): string | null {
  if (!action.availableHours) {
    if (action.timeCost > hoursRemaining) {
      return 'Not enough time today';
    }
    return null;
  }

  const { start, end } = action.availableHours;

  if (currentHour < start) {
    return `Available from ${formatHour(start)}`;
  }

  if (currentHour >= end) {
    return `Closed after ${formatHour(end)}`;
  }

  if (currentHour + action.timeCost > end) {
    return `Need ${action.timeCost}h, closes at ${formatHour(end)}`;
  }

  if (action.timeCost > hoursRemaining) {
    return 'Not enough time today';
  }

  return null;
}

export default function ActionPanel({
  actions,
  currentHour,
  hoursRemaining,
  isActionAvailable,
  onSelectAction,
  disabled,
}: ActionPanelProps) {
  // Sort actions: available first, then by name
  const sortedActions = [...actions].sort((a, b) => {
    const aAvailable = isActionAvailable(a.id);
    const bAvailable = isActionAvailable(b.id);
    if (aAvailable && !bAvailable) return -1;
    if (!aAvailable && bAvailable) return 1;
    return a.name.localeCompare(b.name);
  });

  const availableCount = actions.filter(a => isActionAvailable(a.id)).length;

  return (
    <div className="bg-stone-900/60 backdrop-blur rounded-xl border border-stone-700 p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-amber-200 text-lg font-semibold">Actions</h3>
        <span className="text-stone-400 text-sm">
          {availableCount} available now
        </span>
      </div>

      <div className="space-y-2">
        {sortedActions.map((action, index) => {
          const available = isActionAvailable(action.id);
          const unavailableReason = getAvailabilityReason(action, currentHour, hoursRemaining);

          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={available && !disabled ? { scale: 1.02, x: 5 } : {}}
              whileTap={available && !disabled ? { scale: 0.98 } : {}}
              onClick={() => available && !disabled && onSelectAction(action.id)}
              disabled={!available || disabled}
              className={`
                w-full flex items-start gap-3 px-4 py-3 rounded-lg text-left transition-all
                ${available && !disabled
                  ? 'bg-stone-800 hover:bg-stone-700 border border-stone-700 hover:border-amber-600 cursor-pointer'
                  : 'bg-stone-800/30 border border-stone-800 cursor-not-allowed'
                }
              `}
            >
              <span className={available ? 'text-amber-500' : 'text-stone-600'}>
                {getActionIcon(action.id)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <span className={`font-medium ${available ? 'text-stone-200' : 'text-stone-500'}`}>
                    {action.name}
                  </span>
                  <span className={`text-sm flex items-center gap-1 flex-shrink-0 ${available ? 'text-stone-400' : 'text-stone-600'}`}>
                    <Clock className="w-3 h-3" />
                    {action.timeCost}h
                  </span>
                </div>
                <p className={`text-sm truncate ${available ? 'text-stone-400' : 'text-stone-600'}`}>
                  {action.description}
                </p>

                {/* Time availability info */}
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  {action.availableHours && (
                    <span className={available ? 'text-stone-500' : 'text-stone-600'}>
                      {formatHour(action.availableHours.start)} - {formatHour(action.availableHours.end)}
                    </span>
                  )}
                  {!action.availableHours && (
                    <span className="text-stone-500">Any time</span>
                  )}

                  {/* Show reason if unavailable */}
                  {unavailableReason && (
                    <span className="text-orange-400/80 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {unavailableReason}
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {availableCount === 0 && !disabled && (
        <div className="mt-4 p-3 bg-stone-800/50 rounded-lg border border-stone-700 text-center">
          <p className="text-stone-400 text-sm">
            No actions available at this hour. Rest until dawn to start a new day.
          </p>
        </div>
      )}
    </div>
  );
}
