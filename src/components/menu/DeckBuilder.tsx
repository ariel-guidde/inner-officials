import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, X } from 'lucide-react';
import { Card, SavedDeck, Element, ELEMENT } from '../../types/game';
import { DEBATE_DECK } from '../../data/cards';
import { getCardById } from '../../lib/saveService';
import ElementIcon from '../game/ElementIcon';
import { renderDescription } from '../../lib/describe';
import { UsePlayerSaveReturn } from '../../hooks/usePlayerSave';

interface DeckBuilderProps {
  deck: SavedDeck | null;
  onSave: (deck: SavedDeck) => void;
  onCancel: () => void;
  validateDeck: UsePlayerSaveReturn['validateDeck'];
}

const MAX_COPIES_PER_CARD = 3;
const MIN_DECK_SIZE = 15;
const MAX_DECK_SIZE = 25;

const elementOrder: Array<Element> = [ELEMENT.WOOD, ELEMENT.FIRE, ELEMENT.EARTH, ELEMENT.METAL, ELEMENT.WATER];
const elementNames: Record<Element, string> = {
  [ELEMENT.WOOD]: 'Wood',
  [ELEMENT.FIRE]: 'Fire',
  [ELEMENT.EARTH]: 'Earth',
  [ELEMENT.METAL]: 'Metal',
  [ELEMENT.WATER]: 'Water',
};

export default function DeckBuilder({ deck, onSave, onCancel, validateDeck }: DeckBuilderProps) {
  const [deckName, setDeckName] = useState(deck?.name || 'New Deck');
  const [cardIds, setCardIds] = useState<string[]>(deck?.cardIds || []);

  const cardCounts = useMemo(() => {
    const counts = new Map<string, number>();
    cardIds.forEach(id => {
      counts.set(id, (counts.get(id) || 0) + 1);
    });
    return counts;
  }, [cardIds]);

  const validation = useMemo(() => validateDeck(cardIds), [cardIds, validateDeck]);

  const cardsByElement = useMemo(() => {
    return DEBATE_DECK.reduce((acc: Record<string, Card[]>, card: Card) => {
      if (!acc[card.element]) {
        acc[card.element] = [];
      }
      acc[card.element].push(card);
      return acc;
    }, {});
  }, []);

  const handleAddCard = (cardId: string) => {
    const currentCount = cardCounts.get(cardId) || 0;
    if (currentCount >= MAX_COPIES_PER_CARD) return;
    if (cardIds.length >= MAX_DECK_SIZE) return;
    setCardIds([...cardIds, cardId]);
  };

  const handleRemoveCard = (cardId: string) => {
    const index = cardIds.indexOf(cardId);
    if (index >= 0) {
      const newCardIds = [...cardIds];
      newCardIds.splice(index, 1);
      setCardIds(newCardIds);
    }
  };

  const handleSave = () => {
    if (!validation.valid) return;

    const deckToSave: SavedDeck = {
      id: deck?.id || `deck-${Date.now()}`,
      name: deckName.trim() || 'Unnamed Deck',
      cardIds,
      createdAt: deck?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    onSave(deckToSave);
  };

  const deckCards = useMemo(() => {
    return cardIds.map(id => getCardById(id)).filter((card): card is Card => card !== undefined);
  }, [cardIds]);

  const deckByElement = useMemo(() => {
    return deckCards.reduce((acc: Record<string, Card[]>, card: Card) => {
      if (!acc[card.element]) {
        acc[card.element] = [];
      }
      acc[card.element].push(card);
      return acc;
    }, {});
  }, [deckCards]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-6 font-serif">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onCancel}
              className="p-2 hover:bg-stone-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </motion.button>
            <h1 className="text-4xl font-bold text-amber-100">Deck Builder</h1>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              className="bg-stone-900 border border-stone-700 rounded-lg px-4 py-2 text-stone-200 focus:outline-none focus:border-amber-600"
              placeholder="Deck Name"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={!validation.valid}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                validation.valid
                  ? 'bg-amber-600 hover:bg-amber-700 text-stone-950'
                  : 'bg-stone-700 text-stone-500 cursor-not-allowed'
              }`}
            >
              Save Deck
            </motion.button>
          </div>
        </div>

        {/* Deck Stats and Validation */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
            <div className="text-sm text-stone-400 uppercase tracking-wider mb-1">Deck Size</div>
            <div className={`text-2xl font-mono ${cardIds.length < MIN_DECK_SIZE || cardIds.length > MAX_DECK_SIZE ? 'text-red-500' : 'text-stone-200'}`}>
              {cardIds.length} / {MAX_DECK_SIZE}
            </div>
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
            <div className="text-sm text-stone-400 uppercase tracking-wider mb-1">Min Required</div>
            <div className={`text-2xl font-mono ${cardIds.length >= MIN_DECK_SIZE ? 'text-green-500' : 'text-red-500'}`}>
              {MIN_DECK_SIZE}
            </div>
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
            <div className="text-sm text-stone-400 uppercase tracking-wider mb-1">Status</div>
            <div className={`text-lg font-semibold ${validation.valid ? 'text-green-500' : 'text-red-500'}`}>
              {validation.valid ? 'Valid' : 'Invalid'}
            </div>
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
            <div className="text-sm text-stone-400 uppercase tracking-wider mb-1">Error</div>
            <div className="text-sm text-red-500">{validation.error || '—'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Deck Composition */}
          <div>
            <h2 className="text-2xl font-bold text-amber-100 mb-4">Current Deck ({cardIds.length} cards)</h2>
            {cardIds.length === 0 ? (
              <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-8 text-center text-stone-500">
                No cards in deck. Add cards from the pool below.
              </div>
            ) : (
              <div className="space-y-4">
                {elementOrder.map((element) => {
                  const cards = deckByElement[element] || [];
                  if (cards.length === 0) return null;

                  return (
                    <div key={element} className="bg-stone-900/50 border border-stone-800 rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <ElementIcon element={element} size="md" />
                        <h3 className="text-xl font-bold text-stone-200">{elementNames[element]}</h3>
                        <span className="text-stone-500 text-sm">({cards.length})</span>
                      </div>
                      <div className="space-y-2">
                        {Array.from(new Set(cards.map(c => c.id))).map((cardId) => {
                          const card = getCardById(cardId);
                          if (!card) return null;
                          const count = cardCounts.get(cardId) || 0;
                          return (
                            <div
                              key={cardId}
                              className="flex items-center justify-between bg-stone-800 border border-stone-700 rounded-lg p-3"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <ElementIcon element={card.element} size="sm" />
                                  <span className="font-semibold text-stone-200">{card.name}</span>
                                  <span className="text-xs text-stone-500 font-mono">
                                    {card.patienceCost}P / {card.faceCost}F
                                  </span>
                                </div>
                                <p className="text-xs text-stone-400 italic">{renderDescription(card.description)}</p>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <span className="text-stone-400 font-mono w-8 text-center">{count}x</span>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleRemoveCard(cardId)}
                                  className="p-1 hover:bg-stone-700 rounded transition-colors"
                                >
                                  <Minus className="w-4 h-4 text-red-400" />
                                </motion.button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card Pool */}
          <div>
            <h2 className="text-2xl font-bold text-amber-100 mb-4">Card Pool</h2>
            <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
              {elementOrder.map((element) => {
                const cards = cardsByElement[element] || [];
                return (
                  <div key={element} className="bg-stone-900/50 border border-stone-800 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <ElementIcon element={element} size="md" />
                      <h3 className="text-xl font-bold text-stone-200">{elementNames[element]}</h3>
                      <span className="text-stone-500 text-sm">({cards.length} cards)</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {cards.map((card) => {
                        const count = cardCounts.get(card.id) || 0;
                        const canAdd = count < MAX_COPIES_PER_CARD && cardIds.length < MAX_DECK_SIZE;
                        return (
                          <motion.div
                            key={card.id}
                            whileHover={{ scale: 1.02 }}
                            className={`bg-stone-800 border rounded-lg p-3 transition-colors ${
                              canAdd ? 'border-stone-700 hover:border-amber-600' : 'border-stone-800 opacity-60'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <ElementIcon element={card.element} size="sm" />
                                <h4 className="font-semibold text-stone-200">{card.name}</h4>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-xs text-stone-500 font-mono">
                                  {card.patienceCost}P / {card.faceCost}F
                                </div>
                                {count > 0 && (
                                  <span className="text-xs text-amber-500 font-mono">{count}x</span>
                                )}
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleAddCard(card.id)}
                                  disabled={!canAdd}
                                  className={`p-1 rounded transition-colors ${
                                    canAdd
                                      ? 'hover:bg-stone-700 text-green-400'
                                      : 'text-stone-600 cursor-not-allowed'
                                  }`}
                                >
                                  <Plus className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </div>
                            <p className="text-xs text-stone-400 italic">{renderDescription(card.description)}</p>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
