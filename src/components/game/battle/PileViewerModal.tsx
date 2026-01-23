import { motion, AnimatePresence } from 'framer-motion';
import { Card, Element } from '../../../types/game';
import ElementIcon from '../ElementIcon';
import { X, Layers, RotateCcw, Flame } from 'lucide-react';

export type PileType = 'deck' | 'discard' | 'removed';

interface PileViewerModalProps {
  isOpen: boolean;
  pileType: PileType;
  cards: Card[];
  onClose: () => void;
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

const BAD_CARD_BORDER = 'border-rose-900';
const BAD_CARD_BG = 'bg-gradient-to-b from-rose-950/80 via-stone-950 to-stone-900';

const PILE_INFO: Record<PileType, { title: string; icon: React.ComponentType<{ className?: string }>; emptyMessage: string }> = {
  deck: {
    title: 'Deck',
    icon: Layers,
    emptyMessage: 'Deck is empty',
  },
  discard: {
    title: 'Discard Pile',
    icon: RotateCcw,
    emptyMessage: 'Discard pile is empty',
  },
  removed: {
    title: 'Removed from Play',
    icon: Flame,
    emptyMessage: 'No cards removed from play',
  },
};

export default function PileViewerModal({ isOpen, pileType, cards, onClose }: PileViewerModalProps) {
  const pileInfo = PILE_INFO[pileType];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <div className="flex-1 overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <pileInfo.icon className="w-6 h-6 text-amber-400" />
                  <h2 className="text-2xl font-bold text-amber-100">{pileInfo.title}</h2>
                  <span className="text-stone-400 text-sm">({cards.length} cards)</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 rounded-full bg-stone-700 text-stone-200 hover:bg-stone-600"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Cards Grid */}
              {cards.length === 0 ? (
                <div className="text-center text-stone-500 py-12">
                  <p>{pileInfo.emptyMessage}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {cards.map((card) => {
                    const isBadCard = card.isBad === true;
                    const borderColor = isBadCard ? BAD_CARD_BORDER : ELEMENT_BORDERS[card.element];
                    const bgColor = isBadCard ? BAD_CARD_BG : ELEMENT_BG[card.element];

                    return (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`
                          w-32 h-44 ${bgColor} border-2 ${borderColor} rounded-xl p-2
                          flex flex-col shadow-xl
                        `}
                      >
                        {/* Bad card indicator */}
                        {isBadCard && (
                          <div className="absolute -top-1 -right-1 bg-rose-800 text-rose-100 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-rose-600 shadow-lg">
                            BAD
                          </div>
                        )}

                        {/* Card content */}
                        <div className="flex items-center gap-1 mb-1">
                          {!isBadCard && <ElementIcon element={card.element} size="xs" />}
                          {isBadCard && <span className="text-xs">💀</span>}
                          <span className={`text-xs font-medium truncate leading-tight ${isBadCard ? 'text-rose-200' : 'text-stone-100'}`}>
                            {card.name}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-800/80 text-stone-300 self-start">
                          {card.patienceCost}P {card.faceCost > 0 && `/ ${card.faceCost}F`}
                        </div>
                        <div className="flex-1" />
                        <p className="text-[9px] text-stone-400 line-clamp-3">
                          {card.description}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
