import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Status } from '../../../types/game';
import { Clock, Shield, Zap, Sparkles, ChevronDown, ChevronUp, Anchor } from 'lucide-react';

interface ActiveEffectsDisplayProps {
  statuses: Status[];
}

const getTriggerIcon = (trigger: string) => {
  switch (trigger) {
    case 'turn_start':
      return <Sparkles className="w-3 h-3" />;
    case 'turn_end':
      return <Clock className="w-3 h-3" />;
    case 'on_damage_received':
      return <Shield className="w-3 h-3" />;
    case 'passive':
      return <Zap className="w-3 h-3" />;
    default:
      return null;
  }
};

export default function ActiveEffectsDisplay({ statuses }: ActiveEffectsDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const coreArgStatuses = statuses.filter(s => s.tags?.includes('core_argument'));
  const temporaryStatuses = statuses.filter(s => !s.tags?.includes('core_argument'));
  const allVisible = [...coreArgStatuses, ...temporaryStatuses];

  if (allVisible.length === 0) return null;

  return (
    <div className="relative">
      {/* Compact bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 bg-stone-900/60 border border-stone-700 rounded-xl px-3 py-2 backdrop-blur-sm hover:bg-stone-800/50 transition-colors"
      >
        <Zap className="w-3 h-3 text-purple-400" />
        <span className="text-xs text-stone-300">{allVisible.length}</span>
        {/* Inline status pills */}
        <div className="flex gap-1">
          {allVisible.slice(0, 3).map((status) => (
            <div
              key={status.id}
              className={`px-1.5 py-0.5 rounded text-[10px] border ${
                status.tags?.includes('core_argument')
                  ? 'border-purple-600/50 bg-purple-900/30 text-purple-300'
                  : status.isPositive
                    ? 'border-green-600/50 bg-green-900/30 text-green-300'
                    : 'border-red-600/50 bg-red-900/30 text-red-300'
              }`}
            >
              {status.name}
              {status.turnsRemaining > 0 && (
                <span className="ml-0.5 opacity-60">{status.turnsRemaining}</span>
              )}
            </div>
          ))}
          {allVisible.length > 3 && (
            <span className="text-[10px] text-stone-500">+{allVisible.length - 3}</span>
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
            className="absolute bottom-full mb-2 left-0 w-64 bg-stone-900 border border-stone-700 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-stone-700">
              <span className="text-xs font-medium text-stone-300">Active Effects</span>
            </div>
            <div className="px-3 py-2 space-y-1.5 max-h-48 overflow-y-auto">
              {/* Core argument statuses */}
              {coreArgStatuses.map((status) => (
                <div
                  key={status.id}
                  className="px-2 py-1.5 rounded-lg border border-purple-600/50 bg-purple-900/20"
                >
                  <div className="flex items-center gap-1.5">
                    <Anchor className="w-3 h-3 text-purple-400" />
                    <span className="text-xs font-medium text-purple-200">{status.name}</span>
                  </div>
                  <p className="text-[10px] text-stone-400 mt-0.5">{status.description}</p>
                </div>
              ))}
              {/* Temporary statuses */}
              {temporaryStatuses.map((status) => (
                <div
                  key={status.id}
                  className={`px-2 py-1.5 rounded-lg border ${
                    status.isPositive
                      ? 'border-green-600/50 bg-green-900/30'
                      : 'border-red-600/50 bg-red-900/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {getTriggerIcon(status.trigger)}
                      <span className="text-xs font-medium text-stone-100">{status.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-stone-400">
                      {status.turnsRemaining > 0 && <span>{status.turnsRemaining}t</span>}
                      {status.triggersRemaining !== undefined && <span>{status.triggersRemaining}x</span>}
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-400 mt-0.5">{status.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
