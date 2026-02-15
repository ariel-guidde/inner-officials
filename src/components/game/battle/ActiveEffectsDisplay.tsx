import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Status } from '../../../types/game';
import { Zap, ChevronDown, ChevronUp, Anchor } from 'lucide-react';
import { getStatusIcon, getStatusColor, getStatusTextColor } from '../../../lib/statusIcons';
import { getStatusTemplate } from '../../../data/statusTemplates';

interface ActiveEffectsDisplayProps {
  statuses: Status[];
}

interface StatusGroup {
  templateId: string;
  statuses: Status[];
  maxTurns: number;
  maxTriggers: number;
  count: number;
}

export default function ActiveEffectsDisplay({ statuses }: ActiveEffectsDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const coreArgStatuses = statuses.filter(s => s.tags?.includes('core_argument'));
  const temporaryStatuses = statuses.filter(s => !s.tags?.includes('core_argument'));

  // Group temporary statuses by templateId
  const statusGroups: Record<string, StatusGroup> = {};
  temporaryStatuses.forEach(status => {
    const key = status.templateId || status.id;
    if (!statusGroups[key]) {
      statusGroups[key] = {
        templateId: key,
        statuses: [],
        maxTurns: status.turnsRemaining,
        maxTriggers: status.triggersRemaining || 0,
        count: 0,
      };
    }
    statusGroups[key].statuses.push(status);
    statusGroups[key].count++;
    statusGroups[key].maxTurns = Math.max(statusGroups[key].maxTurns, status.turnsRemaining);
    if (status.triggersRemaining !== undefined) {
      statusGroups[key].maxTriggers = Math.max(statusGroups[key].maxTriggers, status.triggersRemaining);
    }
  });

  const groupedStatuses = Object.values(statusGroups);
  const totalCount = coreArgStatuses.length + groupedStatuses.length;

  if (totalCount === 0) return null;

  return (
    <div className="relative">
      {/* Compact bar with icon display */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 bg-stone-900/60 border border-stone-700 rounded-xl px-3 py-2 backdrop-blur-sm hover:bg-stone-800/50 transition-colors"
      >
        <Zap className="w-3 h-3 text-purple-400" />
        <span className="text-xs text-stone-300">{totalCount}</span>

        {/* Inline status icons */}
        <div className="flex gap-1.5">
          {/* Core argument statuses */}
          {coreArgStatuses.slice(0, 2).map((status) => (
            <div
              key={status.id}
              className="relative w-6 h-6 rounded-full border-2 border-purple-600/50 bg-purple-900/30 flex items-center justify-center"
              title={status.name}
            >
              <Anchor className="w-3 h-3 text-purple-400" />
            </div>
          ))}

          {/* Grouped temporary statuses */}
          {groupedStatuses.slice(0, 3 - Math.min(coreArgStatuses.length, 2)).map((group) => {
            const template = getStatusTemplate(group.templateId);
            const firstStatus = group.statuses[0];
            const Icon = getStatusIcon(group.templateId);

            return (
              <div key={group.templateId} className="relative">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${getStatusColor(
                    template?.isPositive ?? firstStatus.isPositive
                  )}`}
                  title={template?.name || firstStatus.name}
                >
                  <Icon className="w-3 h-3" />
                </div>
                {group.count > 1 && (
                  <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-stone-700 rounded-full text-[8px] flex items-center justify-center font-bold text-stone-200">
                    {group.count}
                  </div>
                )}
              </div>
            );
          })}

          {totalCount > 3 && (
            <span className="text-[10px] text-stone-500 self-center">+{totalCount - 3}</span>
          )}
        </div>

        {isExpanded ? (
          <ChevronUp className="w-3 h-3 text-stone-400" />
        ) : (
          <ChevronDown className="w-3 h-3 text-stone-400" />
        )}
      </button>

      {/* Expanded dropdown */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-0 w-80 bg-stone-900 border border-stone-700 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-stone-700">
              <span className="text-xs font-medium text-stone-300">Active Effects</span>
            </div>
            <div className="px-3 py-2 space-y-2 max-h-64 overflow-y-auto">
              {/* Core argument statuses */}
              {coreArgStatuses.map((status) => (
                <div
                  key={status.id}
                  className="px-3 py-2 rounded-lg border border-purple-600/50 bg-purple-900/20"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full border-2 border-purple-600/50 bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <Anchor className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-purple-200">{status.name}</div>
                      <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-2">
                        {status.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Grouped temporary statuses */}
              {groupedStatuses.map((group) => {
                const template = getStatusTemplate(group.templateId);
                const firstStatus = group.statuses[0];
                const Icon = getStatusIcon(group.templateId);
                const isPositive = template?.isPositive ?? firstStatus.isPositive;

                return (
                  <div
                    key={group.templateId}
                    className={`px-3 py-2 rounded-lg border ${
                      isPositive
                        ? 'border-green-600/50 bg-green-900/30'
                        : 'border-red-600/50 bg-red-900/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {/* Icon circle with badges */}
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getStatusColor(
                            isPositive
                          )}`}
                        >
                          <Icon className={`w-4 h-4 ${getStatusTextColor(isPositive)}`} />
                        </div>

                        {/* Count badge */}
                        {group.count > 1 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-stone-700 rounded-full text-[10px] flex items-center justify-center font-bold text-stone-200 border border-stone-600">
                            ×{group.count}
                          </div>
                        )}

                        {/* Turn/trigger badge */}
                        {(group.maxTurns > 0 || group.maxTriggers > 0) && (
                          <div className="absolute -bottom-1 -right-1 min-w-[16px] h-4 bg-stone-600 rounded-full text-[9px] flex items-center justify-center font-bold text-stone-200 border border-stone-500 px-1">
                            {group.maxTurns > 0 && `${group.maxTurns}t`}
                            {group.maxTriggers > 0 && `${group.maxTriggers}x`}
                          </div>
                        )}
                      </div>

                      {/* Status info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-stone-100">
                          {template?.name || firstStatus.name}
                        </div>
                        <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-2">
                          {template?.description || firstStatus.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
