import { Layers, RotateCcw } from 'lucide-react';

interface DeckDisplayProps {
  deckCount: number;
  discardCount: number;
}

export default function DeckDisplay({ deckCount, discardCount }: DeckDisplayProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Deck */}
      <div className="flex items-center gap-2 bg-stone-900/80 border border-stone-700 rounded-lg px-3 py-2 backdrop-blur-sm">
        <Layers className="w-4 h-4 text-amber-500" />
        <div className="text-xs">
          <div className="text-stone-500">Deck</div>
          <div className="font-mono text-stone-200">{deckCount}</div>
        </div>
      </div>

      {/* Discard */}
      <div className="flex items-center gap-2 bg-stone-900/80 border border-stone-700 rounded-lg px-3 py-2 backdrop-blur-sm">
        <RotateCcw className="w-4 h-4 text-stone-500" />
        <div className="text-xs">
          <div className="text-stone-500">Discard</div>
          <div className="font-mono text-stone-200">{discardCount}</div>
        </div>
      </div>
    </div>
  );
}
