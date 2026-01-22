import { motion, AnimatePresence } from 'framer-motion';
import { Card, Element, TargetRequirement } from '../../../types/game';
import ElementIcon from '../ElementIcon';
import { X, Check, Target } from 'lucide-react';

interface TargetingOverlayProps {
  isActive: boolean;
  pendingCard: Card | null;
  requirement: TargetRequirement | null;
  validTargets: Card[];
  selectedTargets: Card[];
  onSelectTarget: (card: Card) => void;
  onDeselectTarget: (card: Card) => void;
  onConfirm: () => void;
  onCancel: () => void;
  canConfirm: boolean;
}

const ELEMENT_BORDERS: Record<Element, string> = {
  wood: 'border-green-600',
  fire: 'border-red-600',
  earth: 'border-yellow-600',
  metal: 'border-slate-400',
  water: 'border-blue-600',
};

const ELEMENT_BG: Record<Element, string> = {
  wood: 'bg-gradient-to-b from-green-950 to-stone-900',
  fire: 'bg-gradient-to-b from-red-950 to-stone-900',
  earth: 'bg-gradient-to-b from-yellow-950 to-stone-900',
  metal: 'bg-gradient-to-b from-slate-900 to-stone-900',
  water: 'bg-gradient-to-b from-blue-950 to-stone-900',
};

export default function TargetingOverlay({
  isActive,
  pendingCard,
  requirement,
  validTargets,
  selectedTargets,
  onSelectTarget,
  onDeselectTarget,
  onConfirm,
  onCancel,
  canConfirm,
}: TargetingOverlayProps) {
  if (!isActive || !pendingCard || !requirement) return null;

  const hasValidTargets = validTargets.length > 0;
  const isSelected = (card: Card) => selectedTargets.some(t => t.id === card.id);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-bold text-amber-100">Select Target</h2>
          </div>
          <p className="text-stone-400">
            {requirement.prompt || 'Choose a card from your hand'}
          </p>
          {requirement.optional && (
            <p className="text-sm text-stone-500 mt-1">
              (Optional - you can skip targeting)
            </p>
          )}
        </div>

        {/* Card being played */}
        <div className="mb-6">
          <p className="text-sm text-stone-500 text-center mb-2">Playing:</p>
          <div className={`w-32 h-44 ${ELEMENT_BG[pendingCard.element]} border-2 ${ELEMENT_BORDERS[pendingCard.element]} rounded-xl p-2 flex flex-col shadow-xl`}>
            <div className="flex items-center gap-1 mb-1">
              <ElementIcon element={pendingCard.element} size="xs" />
              <span className="text-xs font-medium text-stone-100 truncate">
                {pendingCard.name}
              </span>
            </div>
            <p className="text-[10px] text-stone-400 flex-1 overflow-hidden">
              {pendingCard.description}
            </p>
          </div>
        </div>

        {/* Target cards */}
        {hasValidTargets ? (
          <div className="flex gap-4 flex-wrap justify-center max-w-4xl px-4 mb-8">
            {validTargets.map((card) => {
              const selected = isSelected(card);
              return (
                <motion.button
                  key={card.id}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => selected ? onDeselectTarget(card) : onSelectTarget(card)}
                  className={`
                    relative w-32 h-44 ${ELEMENT_BG[card.element]} border-2 rounded-xl p-2 text-left
                    flex flex-col shadow-xl transition-all
                    ${selected
                      ? 'border-amber-400 ring-2 ring-amber-400/50'
                      : `${ELEMENT_BORDERS[card.element]} hover:border-amber-400/50`
                    }
                  `}
                >
                  {/* Selection indicator */}
                  {selected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-black" />
                    </div>
                  )}

                  {/* Card content */}
                  <div className="flex items-center gap-1 mb-1">
                    <ElementIcon element={card.element} size="xs" />
                    <span className="text-xs font-medium text-stone-100 truncate">
                      {card.name}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-800/80 text-stone-300 self-start">
                    {card.patienceCost}P {card.faceCost > 0 && `/ ${card.faceCost}F`}
                  </div>
                  <div className="flex-1" />
                  <p className="text-[9px] text-stone-400 line-clamp-2">
                    {card.description}
                  </p>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="mb-8 text-center text-stone-500">
            <p>No valid targets available</p>
            {requirement.optional && (
              <p className="text-sm mt-2">You can proceed without selecting a target</p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="px-6 py-3 rounded-full font-bold bg-stone-700 text-stone-200 hover:bg-stone-600 flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancel
          </motion.button>
          <motion.button
            whileHover={canConfirm ? { scale: 1.05 } : {}}
            whileTap={canConfirm ? { scale: 0.95 } : {}}
            onClick={onConfirm}
            disabled={!canConfirm}
            className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 ${
              canConfirm
                ? 'bg-amber-600 text-white hover:bg-amber-500'
                : 'bg-stone-800 text-stone-600 cursor-not-allowed'
            }`}
          >
            <Check className="w-5 h-5" />
            Confirm
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
