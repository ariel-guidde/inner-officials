import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Element, GameState, ELEMENT } from '../../../types/game';
import ElementIcon from '../ElementIcon';
import CardTooltip from './CardTooltip';
import { calculateEffectiveCosts } from '../../../lib/combat';

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
  gameState: GameState;
  onPlay: (card: Card) => void;
  onHover: (index: number | null) => void;
}

const ELEMENT_BORDERS: Record<Element, string> = {
  [ELEMENT.WOOD]: 'border-green-600',
  [ELEMENT.FIRE]: 'border-red-600',
  [ELEMENT.EARTH]: 'border-yellow-600',
  [ELEMENT.METAL]: 'border-slate-400',
  [ELEMENT.WATER]: 'border-blue-600',
};

const ELEMENT_BG: Record<Element, string> = {
  [ELEMENT.WOOD]: 'bg-gradient-to-b from-green-950 to-stone-900',
  [ELEMENT.FIRE]: 'bg-gradient-to-b from-red-950 to-stone-900',
  [ELEMENT.EARTH]: 'bg-gradient-to-b from-yellow-950 to-stone-900',
  [ELEMENT.METAL]: 'bg-gradient-to-b from-slate-900 to-stone-900',
  [ELEMENT.WATER]: 'bg-gradient-to-b from-blue-950 to-stone-900',
};

// Bad card indicator overlay (doesn't override element colors)
const BAD_CARD_OVERLAY = 'before:absolute before:inset-0 before:bg-rose-950/20 before:rounded-xl before:pointer-events-none';

const CardInHand = forwardRef<HTMLDivElement, CardInHandProps>(function CardInHand({
  card,
  canAfford,
  playabilityReason,
  position,
  index,
  isHovered,
  gameState,
  onPlay,
  onHover,
}, ref) {
  const isBadCard = card.isBad === true;
  // Keep element colors even for bad cards
  const borderColor = canAfford
    ? ELEMENT_BORDERS[card.element]
    : 'border-stone-700';
  const bgColor = canAfford
    ? ELEMENT_BG[card.element]
    : 'bg-stone-900';
  
  const effectiveCosts = calculateEffectiveCosts(card, gameState);

  return (
    <motion.div
      ref={ref}
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
          <CardTooltip 
            card={card} 
            canAfford={canAfford} 
            playabilityReason={playabilityReason}
            gameState={gameState}
          />
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
          ${isBadCard ? BAD_CARD_OVERLAY : ''}
          ${canAfford ? 'cursor-pointer hover:border-amber-400' : 'opacity-60 cursor-not-allowed'}
        `}
      >
        {/* Bad card indicator - overlay badge */}
        {isBadCard && (
          <div className="absolute -top-1 -right-1 bg-rose-800 text-rose-100 text-[8px] font-bold px-1.5 py-0.5 rounded-full border-2 border-rose-600 shadow-lg z-10">
            BAD
          </div>
        )}

        {/* Top: Name and Cost */}
        <div className="flex items-start justify-between gap-1 mb-1">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <ElementIcon element={card.element} size="xs" />
            <span className={`text-xs font-medium truncate leading-tight ${isBadCard ? 'text-rose-200' : 'text-stone-100'}`}>
              {card.name}
            </span>
          </div>
        </div>

        {/* Cost badge with color coding */}
        <div className={`text-[10px] font-mono px-1.5 py-0.5 rounded self-start ${
          canAfford 
            ? effectiveCosts.isReduced 
              ? 'bg-green-900/50 text-green-300'
              : effectiveCosts.isIncreased
                ? 'bg-red-900/50 text-red-300'
                : 'bg-stone-800/80 text-stone-300'
            : 'bg-red-900/50 text-red-400'
        }`}>
          {effectiveCosts.isReduced && (
            <span className="line-through text-stone-500 mr-1">
              {effectiveCosts.originalPatienceCost}P{effectiveCosts.originalFaceCost > 0 ? ` / ${effectiveCosts.originalFaceCost}F` : ''}
            </span>
          )}
          <span>
            {effectiveCosts.effectivePatienceCost}P {effectiveCosts.effectiveFaceCost > 0 && `/ ${effectiveCosts.effectiveFaceCost}F`}
          </span>
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
});

CardInHand.displayName = 'CardInHand';

export default CardInHand;
