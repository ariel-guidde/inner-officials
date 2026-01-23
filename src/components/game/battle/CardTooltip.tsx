import { motion } from 'framer-motion';
import { Card, Element, GameState, ELEMENT } from '../../../types/game';
import ElementIcon from '../ElementIcon';
import { calculateEffectiveCosts, calculateChaosModifiers } from '../../../lib/cardCosts';

interface CardTooltipProps {
  card: Card;
  canAfford: boolean;
  playabilityReason?: string;
  gameState: GameState;
}

const ELEMENT_COLORS: Record<Element, string> = {
  [ELEMENT.WOOD]: 'border-green-500 bg-green-950/90',
  [ELEMENT.FIRE]: 'border-red-500 bg-red-950/90',
  [ELEMENT.EARTH]: 'border-yellow-500 bg-yellow-950/90',
  [ELEMENT.METAL]: 'border-slate-400 bg-slate-950/90',
  [ELEMENT.WATER]: 'border-blue-500 bg-blue-950/90',
};

export default function CardTooltip({ card, canAfford, playabilityReason, gameState }: CardTooltipProps) {
  const effectiveCosts = calculateEffectiveCosts(card, gameState);
  const chaosModifiers = calculateChaosModifiers(card, gameState);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-4 rounded-xl border-2 backdrop-blur-md shadow-2xl z-[200] ${ELEMENT_COLORS[card.element]}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <ElementIcon element={card.element} size="sm" />
          <h4 className="font-bold text-amber-100">{card.name}</h4>
        </div>
        <div className={`text-xs font-mono px-2 py-1 rounded ${
          canAfford 
            ? effectiveCosts.isReduced 
              ? 'bg-green-900/70 text-green-200'
              : effectiveCosts.isIncreased
                ? 'bg-red-900/70 text-red-200'
                : 'bg-stone-800 text-stone-200'
            : 'bg-red-900 text-red-300'
        }`}>
          {effectiveCosts.isReduced && (
            <span className="line-through text-stone-400 mr-1">
              {effectiveCosts.originalPatienceCost}P{effectiveCosts.originalFaceCost > 0 ? ` / ${effectiveCosts.originalFaceCost}F` : ''}
            </span>
          )}
          <span>
            {effectiveCosts.effectivePatienceCost}P {effectiveCosts.effectiveFaceCost > 0 && `/ ${effectiveCosts.effectiveFaceCost}F`}
          </span>
        </div>
      </div>
      <p className="text-sm text-stone-300 leading-relaxed">{card.description}</p>
      
      {/* Show chaos bonus effects */}
      {chaosModifiers && (
        <div className="mt-2 pt-2 border-t border-stone-700">
          <div className="text-xs font-semibold text-red-400 mb-1">Chaos Bonus:</div>
          <div className="text-xs text-green-300 space-y-0.5">
            <div>+{chaosModifiers.favorGain} Favor</div>
            <div>+{chaosModifiers.damage} Shame to opponent</div>
          </div>
        </div>
      )}

      {/* Show modifier explanation */}
      {effectiveCosts.modifier && (
        <div className={`mt-2 text-xs ${effectiveCosts.isReduced ? 'text-green-400' : effectiveCosts.isIncreased ? 'text-red-400' : 'text-stone-400'}`}>
          ({effectiveCosts.modifier})
        </div>
      )}

      {!canAfford && playabilityReason && (
        <div className="mt-2 text-xs text-red-400 italic">{playabilityReason}</div>
      )}
    </motion.div>
  );
}
