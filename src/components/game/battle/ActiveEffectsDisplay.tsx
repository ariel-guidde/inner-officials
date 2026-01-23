import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActiveEffect, BoardEffect, Element, ELEMENT, EFFECT_TRIGGER, BOARD_EFFECT_TYPE } from '../../../types/game';
import { Clock, Shield, Zap, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import ElementIcon from '../ElementIcon';

interface ActiveEffectsDisplayProps {
  activeEffects: ActiveEffect[];
  boardEffects: BoardEffect[];
}

const ELEMENT_COLORS: Record<Element, string> = {
  [ELEMENT.WOOD]: 'border-green-600/50 bg-green-900/30',
  [ELEMENT.FIRE]: 'border-red-600/50 bg-red-900/30',
  [ELEMENT.EARTH]: 'border-yellow-600/50 bg-yellow-900/30',
  [ELEMENT.METAL]: 'border-slate-400/50 bg-slate-900/30',
  [ELEMENT.WATER]: 'border-blue-600/50 bg-blue-900/30',
};

const getTriggerIcon = (trigger: string) => {
  switch (trigger) {
    case EFFECT_TRIGGER.TURN_START:
      return <Sparkles className="w-3 h-3" />;
    case EFFECT_TRIGGER.TURN_END:
      return <Clock className="w-3 h-3" />;
    case EFFECT_TRIGGER.ON_DAMAGE:
      return <Shield className="w-3 h-3" />;
    case EFFECT_TRIGGER.PASSIVE:
      return <Zap className="w-3 h-3" />;
    default:
      return null;
  }
};

export default function ActiveEffectsDisplay({ activeEffects, boardEffects }: ActiveEffectsDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalEffects = activeEffects.length + boardEffects.length;

  if (totalEffects === 0) return null;

  return (
    <div className="bg-stone-900/60 border border-stone-700 rounded-xl backdrop-blur-sm overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-stone-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-stone-200">
            Active Effects ({totalEffects})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-stone-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-stone-400" />
        )}
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-2">
              {/* Active Effects (timed effects from wood cards) */}
              {activeEffects.map((effect) => (
                <div
                  key={effect.id}
                  className={`px-3 py-2 rounded-lg border ${ELEMENT_COLORS[effect.element]}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <ElementIcon element={effect.element} size="xs" />
                      <span className="text-sm font-medium text-stone-100">
                        {effect.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-stone-400">
                      {getTriggerIcon(effect.trigger)}
                      {effect.remainingTurns > 0 && (
                        <span>{effect.remainingTurns} turns</span>
                      )}
                      {effect.remainingTriggers !== undefined && (
                        <span>{effect.remainingTriggers} uses</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-stone-400">{effect.description}</p>
                </div>
              ))}

              {/* Board Effects (from metal cards) */}
              {boardEffects.map((effect, index) => {
                // For trap effects like negate_next_attack, show as "1 use" since they trigger once
                const isTrapEffect = effect.effectType === BOARD_EFFECT_TYPE.NEGATE_NEXT_ATTACK || effect.effectType === BOARD_EFFECT_TYPE.REFLECT_ATTACK;
                const displayCount = isTrapEffect ? 1 : effect.turnsRemaining;
                const countLabel = isTrapEffect ? 'use' : 'turns';
                
                return (
                  <div
                    key={effect.id}
                    className={`px-3 py-2 rounded-lg border ${ELEMENT_COLORS.metal}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <ElementIcon element={ELEMENT.METAL} size="xs" />
                        <span className="text-sm font-medium text-stone-100">
                          {effect.name}
                        </span>
                        {index === 0 && boardEffects.length > 1 && (
                          <span className="text-[10px] text-stone-500">({index + 1}/{boardEffects.length})</span>
                        )}
                      </div>
                      {displayCount !== undefined && (
                        <div className="flex items-center gap-1 text-xs text-stone-400">
                          <Shield className="w-3 h-3" />
                          <span>{displayCount} {countLabel}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-stone-400">
                      {getEffectDescription(effect)}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed preview */}
      {!isExpanded && totalEffects > 0 && (
        <div className="px-4 pb-2 flex gap-1 flex-wrap">
          {activeEffects.slice(0, 3).map((effect) => (
            <div
              key={effect.id}
              className={`px-2 py-0.5 rounded-full text-xs border ${ELEMENT_COLORS[effect.element]}`}
            >
              <span className="text-stone-300">{effect.name}</span>
            </div>
          ))}
          {boardEffects.slice(0, 3).map((effect) => (
            <div
              key={effect.id}
              className={`px-2 py-0.5 rounded-full text-xs border ${ELEMENT_COLORS[ELEMENT.METAL]}`}
            >
              <span className="text-stone-300">{effect.name}</span>
            </div>
          ))}
          {totalEffects > 6 && (
            <span className="text-xs text-stone-500">+{totalEffects - 6} more</span>
          )}
        </div>
      )}
    </div>
  );
}

function getEffectDescription(effect: BoardEffect): string {
  switch (effect.effectType) {
    case BOARD_EFFECT_TYPE.NEGATE_NEXT_ATTACK:
      return 'Negates the next opponent attack';
    case BOARD_EFFECT_TYPE.REFLECT_ATTACK:
      return `Reflects ${effect.value || 50}% of next attack damage`;
    case BOARD_EFFECT_TYPE.ELEMENT_COST_MOD:
      return `${effect.element} cards cost ${effect.value! > 0 ? '+' : ''}${effect.value} patience`;
    case BOARD_EFFECT_TYPE.RULE_MOD:
      return 'Modifies game rules';
    default:
      return '';
  }
}
