import { motion } from 'framer-motion';
import { Clock, ShoppingBag, Users, Building2, Brush, Moon, Wine, AlertCircle } from 'lucide-react';
import { DayAction, TimePeriod, getTimePeriodLabel, getTimePeriod } from '../../types/campaign';

interface ActionPanelProps {
  actions: DayAction[];
  currentSegment: number;
  segmentsRemaining: number;
  isActionAvailable: (actionId: string) => boolean;
  onSelectAction: (actionId: string) => void;
  mustRest: boolean;
  isNightTime: boolean;
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
    case 'rest':
      return <Moon className="w-5 h-5" />;
    case 'evening-gathering':
      return <Wine className="w-5 h-5" />;
    default:
      return <Clock className="w-5 h-5" />;
  }
}

function formatPeriods(periods: TimePeriod[]): string {
  return periods.map(p => getTimePeriodLabel(p)).join(', ');
}

function getUnavailabilityReason(
  action: DayAction,
  currentSegment: number,
  segmentsRemaining: number,
  mustRest: boolean,
  isNightTime: boolean
): string | null {
  if (mustRest && action.id !== 'rest') {
    return 'Must rest until face restored';
  }

  if (isNightTime && action.id !== 'rest') {
    return 'Only rest at night';
  }

  if (action.segmentCost > segmentsRemaining && action.id !== 'rest') {
    return `Need ${action.segmentCost} segments`;
  }

  if (action.availablePeriods && action.availablePeriods.length > 0) {
    const currentPeriod = getTimePeriod(currentSegment);
    if (!action.availablePeriods.includes(currentPeriod)) {
      return `Only: ${formatPeriods(action.availablePeriods)}`;
    }
  }

  return null;
}

export default function ActionPanel({
  actions,
  currentSegment,
  segmentsRemaining,
  isActionAvailable,
  onSelectAction,
  mustRest,
  isNightTime,
  disabled,
}: ActionPanelProps) {
  // Sort actions: available first, then rest, then by name
  const sortedActions = [...actions].sort((a, b) => {
    const aAvailable = isActionAvailable(a.id);
    const bAvailable = isActionAvailable(b.id);

    // Rest action special handling
    if (a.id === 'rest' && !bAvailable) return -1;
    if (b.id === 'rest' && !aAvailable) return 1;

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
          {availableCount} available
        </span>
      </div>

      {mustRest && (
        <div className="mb-3 p-2 bg-red-900/30 border border-red-700/50 rounded-lg">
          <p className="text-red-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            You are exhausted. Only rest is available.
          </p>
        </div>
      )}

      {isNightTime && !mustRest && (
        <div className="mb-3 p-2 bg-indigo-900/30 border border-indigo-700/50 rounded-lg">
          <p className="text-indigo-300 text-sm flex items-center gap-2">
            <Moon className="w-4 h-4" />
            Night has fallen. Rest until dawn.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {sortedActions.map((action, index) => {
          const available = isActionAvailable(action.id);
          const unavailableReason = getUnavailabilityReason(
            action,
            currentSegment,
            segmentsRemaining,
            mustRest,
            isNightTime
          );

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
                    {action.segmentCost} seg
                  </span>
                </div>
                <p className={`text-sm truncate ${available ? 'text-stone-400' : 'text-stone-600'}`}>
                  {action.description}
                </p>

                {/* Availability info */}
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  {action.availablePeriods && action.availablePeriods.length > 0 && (
                    <span className={available ? 'text-stone-500' : 'text-stone-600'}>
                      {formatPeriods(action.availablePeriods)}
                    </span>
                  )}
                  {!action.availablePeriods && action.id !== 'rest' && (
                    <span className="text-stone-500">Any time</span>
                  )}

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
    </div>
  );
}
