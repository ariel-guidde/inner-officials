import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Zap } from 'lucide-react';
import { Card, CoreArgument, GameState } from '../../../types/game';
import { SPRING_PRESETS, ELEMENT_THEMES } from '../../../lib/animations/constants';
import { calculateEffectiveCosts } from '../../../lib/combat/engine/costCalculator';
import { renderDescription } from '../../../lib/describe';
import ElementIcon from '../ElementIcon';

interface DetailModalProps {
  type: 'card' | 'core_argument';
  data: Card | CoreArgument;
  state?: GameState; // Required for card cost calculations
  onClose: () => void;
}

export default function DetailModal({ type, data, state, onClose }: DetailModalProps) {
  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const renderCardDetails = (card: Card) => {
    const costs = state ? calculateEffectiveCosts(card, state) : null;
    const elementTheme = ELEMENT_THEMES[card.element];
    const isBadCard = card.isBad === true;

    return (
      <div className="max-w-2xl mx-auto">
        {/* Card Header */}
        <div className={`mb-6 p-6 rounded-xl border-2 ${elementTheme.borderColor} ${
          isBadCard ? 'bg-gradient-to-b from-rose-950/80 to-stone-900' : `bg-gradient-to-b ${elementTheme.bgGradient}`
        }`}>
          <div className="flex items-center gap-3 mb-4">
            {!isBadCard && <ElementIcon element={card.element} size="lg" />}
            {isBadCard && <span className="text-4xl">💀</span>}
            <h2 className="text-3xl font-bold text-amber-100">{card.name}</h2>
            {isBadCard && (
              <span className="ml-auto bg-rose-800 text-rose-100 text-xs font-bold px-2 py-1 rounded-full border border-rose-600">
                BAD CARD
              </span>
            )}
          </div>

          {/* Costs */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-stone-800/60 px-4 py-2 rounded-lg">
              <Zap className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs text-stone-400">Patience</div>
                <div className="text-lg font-bold text-stone-100">
                  {costs ? (
                    <>
                      <span className={costs.isReduced ? 'text-green-400' : costs.isIncreased ? 'text-red-400' : ''}>
                        {costs.effectivePatienceCost}
                      </span>
                      {costs.effectivePatienceCost !== costs.originalPatienceCost && (
                        <span className="text-xs text-stone-500 ml-1 line-through">
                          {costs.originalPatienceCost}
                        </span>
                      )}
                    </>
                  ) : (
                    card.patienceCost
                  )}
                </div>
                {costs && costs.modifier && (
                  <div className="text-[10px] text-stone-400">{costs.modifier}</div>
                )}
              </div>
            </div>

            {(card.faceCost > 0 || (costs && costs.effectiveFaceCost > 0)) && (
              <div className="flex items-center gap-2 bg-stone-800/60 px-4 py-2 rounded-lg">
                <Heart className="w-5 h-5 text-red-400" />
                <div>
                  <div className="text-xs text-stone-400">Face</div>
                  <div className="text-lg font-bold text-stone-100">
                    {costs ? (
                      <>
                        <span className={costs.isIncreased ? 'text-red-400' : ''}>
                          {costs.effectiveFaceCost}
                        </span>
                        {costs.effectiveFaceCost !== costs.originalFaceCost && (
                          <span className="text-xs text-stone-500 ml-1 line-through">
                            {costs.originalFaceCost}
                          </span>
                        )}
                      </>
                    ) : (
                      card.faceCost
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-amber-200 mb-2">Effect</h3>
          <div className="panel p-4">
            <p className="text-stone-300 leading-relaxed">
              {renderDescription(card.description)}
            </p>
          </div>
        </div>

        {/* Special Properties */}
        {(card.removeAfterPlay || card.isBad || card.targetRequirement) && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-amber-200 mb-2">Properties</h3>
            <div className="panel p-4 space-y-2">
              {card.removeAfterPlay && (
                <div className="text-sm text-orange-300">
                  🔥 Removed from game after play
                </div>
              )}
              {card.isBad && (
                <div className="text-sm text-rose-300">
                  💀 Bad card - removed from deck when played
                </div>
              )}
              {card.targetRequirement && (
                <div className="text-sm text-blue-300">
                  🎯 Requires target selection
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCoreArgumentDetails = (coreArgument: CoreArgument) => {
    const elementTheme = coreArgument.element ? ELEMENT_THEMES[coreArgument.element] : null;

    return (
      <div className="max-w-2xl mx-auto">
        {/* Core Argument Header */}
        <div className={`mb-6 p-6 rounded-xl border-2 ${
          elementTheme ? `${elementTheme.borderColor} bg-gradient-to-b ${elementTheme.bgGradient}` : 'border-stone-600 bg-gradient-to-b from-stone-800 to-stone-900'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            {coreArgument.element && <ElementIcon element={coreArgument.element} size="lg" />}
            <h2 className="text-3xl font-bold text-amber-100">{coreArgument.name}</h2>
          </div>
          <p className="text-stone-300 leading-relaxed">
            {coreArgument.description}
          </p>
        </div>

        {/* Passive Modifiers */}
        {coreArgument.passiveModifiers && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-amber-200 mb-2">Passive Modifiers</h3>
            <div className="panel p-4 space-y-3">
              {coreArgument.passiveModifiers.standingGainBonus !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-stone-300">Standing Gain Bonus</span>
                  <span className="text-green-400 font-bold">
                    +{coreArgument.passiveModifiers.standingGainBonus}
                  </span>
                </div>
              )}
              {coreArgument.passiveModifiers.standingGainMultiplier !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-stone-300">Standing Gain Multiplier</span>
                  <span className="text-green-400 font-bold">
                    ×{coreArgument.passiveModifiers.standingGainMultiplier}
                  </span>
                </div>
              )}
              {coreArgument.passiveModifiers.opponentStandingDamageBonus !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-stone-300">Opponent Standing Damage</span>
                  <span className="text-red-400 font-bold">
                    +{coreArgument.passiveModifiers.opponentStandingDamageBonus}
                  </span>
                </div>
              )}
              {coreArgument.passiveModifiers.patienceCostReduction !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-stone-300">Patience Cost Reduction</span>
                  <span className="text-blue-400 font-bold">
                    -{coreArgument.passiveModifiers.patienceCostReduction}
                  </span>
                </div>
              )}
              {coreArgument.passiveModifiers.elementCostReduction && Object.keys(coreArgument.passiveModifiers.elementCostReduction).length > 0 && (
                <div>
                  <div className="text-stone-300 mb-2">Element Cost Reduction</div>
                  <div className="ml-4 space-y-1">
                    {Object.entries(coreArgument.passiveModifiers.elementCostReduction).map(([element, reduction]) => (
                      <div key={element} className="flex items-center gap-2">
                        <ElementIcon element={element as any} size="xs" />
                        <span className="text-blue-400 font-bold">-{reduction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {coreArgument.passiveModifiers.drawBonus !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-stone-300">Extra Cards per Turn</span>
                  <span className="text-purple-400 font-bold">
                    +{coreArgument.passiveModifiers.drawBonus}
                  </span>
                </div>
              )}
              {coreArgument.passiveModifiers.startingPoise !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-stone-300">Starting Poise</span>
                  <span className="text-cyan-400 font-bold">
                    {coreArgument.passiveModifiers.startingPoise}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Triggered Effects */}
        {coreArgument.trigger && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-amber-200 mb-2">Triggered Effect</h3>
            <div className="panel p-4">
              <div className="text-sm text-stone-400 mb-1">Trigger:</div>
              <div className="text-stone-300">
                {coreArgument.trigger.replace(/_/g, ' ').toUpperCase()}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={SPRING_PRESETS.bouncy}
          className="relative max-h-[90vh] overflow-y-auto m-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-stone-700 text-stone-200 hover:bg-stone-600"
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* Content */}
          {type === 'card' ? renderCardDetails(data as Card) : renderCoreArgumentDetails(data as CoreArgument)}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
