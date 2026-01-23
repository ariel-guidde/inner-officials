import { Layers, RotateCcw, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface DeckDisplayProps {
  deckCount: number;
  discardCount: number;
  removedCount: number;
  onDeckClick: () => void;
  onDiscardClick: () => void;
  onRemovedClick: () => void;
}

export default function DeckDisplay({ 
  deckCount, 
  discardCount, 
  removedCount,
  onDeckClick,
  onDiscardClick,
  onRemovedClick,
}: DeckDisplayProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Deck */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDeckClick}
        className="flex items-center gap-2 bg-stone-900/80 border border-stone-700 rounded-lg px-3 py-2 backdrop-blur-sm hover:border-amber-500/50 transition-colors cursor-pointer"
      >
        <Layers className="w-4 h-4 text-amber-500" />
        <div className="text-xs">
          <div className="text-stone-500">Deck</div>
          <div className="font-mono text-stone-200">{deckCount}</div>
        </div>
      </motion.button>

      {/* Discard */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDiscardClick}
        className="flex items-center gap-2 bg-stone-900/80 border border-stone-700 rounded-lg px-3 py-2 backdrop-blur-sm hover:border-amber-500/50 transition-colors cursor-pointer"
      >
        <RotateCcw className="w-4 h-4 text-stone-500" />
        <div className="text-xs">
          <div className="text-stone-500">Discard</div>
          <div className="font-mono text-stone-200">{discardCount}</div>
        </div>
      </motion.button>

      {/* Removed from Play */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRemovedClick}
        className="flex items-center gap-2 bg-stone-900/80 border border-stone-700 rounded-lg px-3 py-2 backdrop-blur-sm hover:border-amber-500/50 transition-colors cursor-pointer"
      >
        <Flame className="w-4 h-4 text-red-500" />
        <div className="text-xs">
          <div className="text-stone-500">Removed</div>
          <div className="font-mono text-stone-200">{removedCount}</div>
        </div>
      </motion.button>
    </div>
  );
}
