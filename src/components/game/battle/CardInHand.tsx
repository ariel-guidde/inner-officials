import { motion, AnimatePresence } from 'framer-motion';
import { Card, Element } from '../../../types/game';
import ElementIcon from '../ElementIcon';
import CardTooltip from './CardTooltip';

interface CardInHandProps {
  card: Card;
  canAfford: boolean;
  playabilityReason?: string;
  position: {
    x: number;
    y: number;
    rotation: number;
    zIndex: number;
    scale: number;
  };
  index: number;
  isHovered: boolean;
  onPlay: (card: Card) => void;
  onHover: (index: number | null) => void;
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

// Bad card styling
const BAD_CARD_BORDER = 'border-rose-900';
const BAD_CARD_BG = 'bg-gradient-to-b from-rose-950/80 via-stone-950 to-stone-900';

export default function CardInHand({
  card,
  canAfford,
  playabilityReason,
  position,
  index,
  isHovered,
  onPlay,
  onHover,
}: CardInHandProps) {
  const isBadCard = card.isBad === true;
  const borderColor = isBadCard
    ? BAD_CARD_BORDER
    : canAfford
      ? ELEMENT_BORDERS[card.element]
      : 'border-stone-700';
  const bgColor = isBadCard
    ? BAD_CARD_BG
    : canAfford
      ? ELEMENT_BG[card.element]
      : 'bg-stone-900';

  return (
    <motion.div
      initial={{ y: 200, opacity: 0 }}
      animate={{
        x: position.x,
        y: position.y,
        rotate: position.rotation,
        scale: position.scale,
        opacity: 1,
      }}
      exit={{ y: 200, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: index * 0.02,
      }}
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 0,
        zIndex: position.zIndex,
        transformOrigin: 'center bottom',
      }}
      className="relative"
    >
      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <CardTooltip card={card} canAfford={canAfford} playabilityReason={playabilityReason} />
        )}
      </AnimatePresence>

      {/* Card */}
      <motion.button
        whileTap={canAfford ? { scale: 0.95 } : {}}
        onClick={() => canAfford && onPlay(card)}
        onMouseEnter={() => onHover(index)}
        onMouseLeave={() => onHover(null)}
        disabled={!canAfford}
        className={`
          w-32 h-44 ${bgColor} border-2 rounded-xl p-2 text-left
          flex flex-col shadow-xl
          transition-colors
          ${borderColor}
          ${canAfford ? 'cursor-pointer hover:border-amber-400' : 'opacity-60 cursor-not-allowed'}
        `}
      >
        {/* Bad card indicator */}
        {isBadCard && (
          <div className="absolute -top-1 -right-1 bg-rose-800 text-rose-100 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-rose-600 shadow-lg">
            BAD
          </div>
        )}

        {/* Top: Name and Cost */}
        <div className="flex items-start justify-between gap-1 mb-1">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {!isBadCard && <ElementIcon element={card.element} size="xs" />}
            {isBadCard && <span className="text-xs">💀</span>}
            <span className={`text-xs font-medium truncate leading-tight ${isBadCard ? 'text-rose-200' : 'text-stone-100'}`}>
              {card.name}
            </span>
          </div>
        </div>

        {/* Cost badge */}
        <div className={`text-[10px] font-mono px-1.5 py-0.5 rounded self-start ${canAfford ? 'bg-stone-800/80 text-stone-300' : 'bg-red-900/50 text-red-400'}`}>
          {card.patienceCost}P {card.faceCost > 0 && `/ ${card.faceCost}F`}
        </div>

        {/* Faded element icon at bottom */}
        <div className="flex-1 flex items-end justify-end">
          <div className="opacity-20">
            <ElementIcon element={card.element} size="md" />
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}
