import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Card, GameState } from '../../types/game';
import { DEBATE_DECK } from '../../data/cards';
import ElementIcon from '../game/ElementIcon';

interface DeckViewProps {
  gameState: GameState | null;
  onBack: () => void;
}

export default function DeckView({ gameState, onBack }: DeckViewProps) {
  const fullDeck: Card[] = DEBATE_DECK;

  // Group cards by element
  const cardsByElement = fullDeck.reduce((acc: Record<string, Card[]>, card: Card) => {
    if (!acc[card.element]) {
      acc[card.element] = [];
    }
    acc[card.element].push(card);
    return acc;
  }, {});

  const elementOrder: Array<'wood' | 'fire' | 'earth' | 'metal' | 'water'> = ['wood', 'fire', 'earth', 'metal', 'water'];
  const elementNames: Record<string, string> = {
    wood: 'Wood',
    fire: 'Fire',
    earth: 'Earth',
    metal: 'Metal',
    water: 'Water',
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-6 font-serif">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-2 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <h1 className="text-4xl font-bold text-amber-100">Deck</h1>
        </div>

        {/* Deck Statistics */}
        {gameState && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
              <div className="text-sm text-stone-400 uppercase tracking-wider mb-1">Hand</div>
              <div className="text-2xl font-mono text-stone-200">{gameState.player.hand.length}</div>
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
              <div className="text-sm text-stone-400 uppercase tracking-wider mb-1">Deck</div>
              <div className="text-2xl font-mono text-stone-200">{gameState.player.deck.length}</div>
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
              <div className="text-sm text-stone-400 uppercase tracking-wider mb-1">Discard</div>
              <div className="text-2xl font-mono text-stone-200">{gameState.player.discard.length}</div>
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
              <div className="text-sm text-stone-400 uppercase tracking-wider mb-1">Total</div>
              <div className="text-2xl font-mono text-stone-200">{fullDeck.length}</div>
            </div>
          </div>
        )}

        {/* Full Card List by Element */}
        <div className="space-y-8">
          {elementOrder.map((element) => {
            const cards = cardsByElement[element] || [];
            return (
              <div key={element} className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <ElementIcon element={element} size="md" />
                  <h2 className="text-2xl font-bold text-stone-200">{elementNames[element]}</h2>
                  <span className="text-stone-500 text-sm">({cards.length} cards)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cards.map((card) => (
                    <motion.div
                      key={card.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-stone-800 border border-stone-700 rounded-xl p-4 hover:border-amber-600 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <ElementIcon element={card.element} size="sm" />
                        <div className="text-xs text-stone-500 font-mono">
                          {card.patienceCost}P / {card.faceCost}F
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-stone-200 mb-1">{card.name}</h3>
                      <p className="text-sm text-stone-400 italic">{card.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
