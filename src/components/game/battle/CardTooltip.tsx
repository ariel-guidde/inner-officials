import { motion } from 'framer-motion';
import { Card, Element } from '../../../types/game';
import ElementIcon from '../ElementIcon';

interface CardTooltipProps {
  card: Card;
  canAfford: boolean;
}

const ELEMENT_COLORS: Record<Element, string> = {
  wood: 'border-green-500 bg-green-950/90',
  fire: 'border-red-500 bg-red-950/90',
  earth: 'border-yellow-500 bg-yellow-950/90',
  metal: 'border-slate-400 bg-slate-950/90',
  water: 'border-blue-500 bg-blue-950/90',
};

export default function CardTooltip({ card, canAfford }: CardTooltipProps) {
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
        <div className={`text-xs font-mono px-2 py-1 rounded ${canAfford ? 'bg-stone-800 text-stone-200' : 'bg-red-900 text-red-300'}`}>
          {card.patienceCost}P / {card.faceCost}F
        </div>
      </div>
      <p className="text-sm text-stone-300 leading-relaxed">{card.description}</p>
      {!canAfford && (
        <div className="mt-2 text-xs text-red-400 italic">Not enough resources</div>
      )}
    </motion.div>
  );
}
