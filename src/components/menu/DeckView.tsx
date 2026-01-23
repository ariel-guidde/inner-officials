import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Edit2, Trash2, Check } from 'lucide-react';
import { SavedDeck } from '../../types/game';
import { UsePlayerSaveReturn } from '../../hooks/usePlayerSave';
import DeckBuilder from './DeckBuilder';

interface DeckViewProps {
  playerSave: UsePlayerSaveReturn;
  onBack: () => void;
}

export default function DeckView({ playerSave, onBack }: DeckViewProps) {
  const [editingDeck, setEditingDeck] = useState<SavedDeck | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { playerData, activeDeck, saveDeck, deleteDeck, setActiveDeck, validateDeck } = playerSave;

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingDeck(null);
  };

  const handleEdit = (deck: SavedDeck) => {
    setEditingDeck(deck);
    setIsCreating(false);
  };

  const handleDelete = (deckId: string) => {
    if (confirm('Are you sure you want to delete this deck?')) {
      deleteDeck(deckId);
    }
  };

  const handleSave = (deck: SavedDeck) => {
    const result = saveDeck(deck);
    if (result.success) {
      setEditingDeck(null);
      setIsCreating(false);
    } else {
      alert(`Failed to save deck: ${result.error}`);
    }
  };

  const handleCancel = () => {
    setEditingDeck(null);
    setIsCreating(false);
  };

  // If editing or creating, show the builder
  if (editingDeck || isCreating) {
    return (
      <DeckBuilder
        deck={editingDeck}
        onSave={handleSave}
        onCancel={handleCancel}
        validateDeck={validateDeck}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-6 font-serif">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="p-2 hover:bg-stone-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
            <h1 className="text-4xl font-bold text-amber-100">Deck Management</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-stone-950 rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create New Deck
          </motion.button>
        </div>

        {/* Active Deck Indicator */}
        {activeDeck && (
          <div className="mb-6 p-4 bg-amber-900/30 border border-amber-700 rounded-xl">
            <div className="flex items-center gap-2 text-amber-200">
              <Check className="w-5 h-5" />
              <span className="font-semibold">Active Deck: {activeDeck.name}</span>
              <span className="text-sm text-amber-300">({activeDeck.cardIds.length} cards)</span>
            </div>
          </div>
        )}

        {/* Deck List */}
        {playerData.decks.length === 0 ? (
          <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-12 text-center">
            <p className="text-stone-400 text-lg mb-4">No decks saved yet.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateNew}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-stone-950 rounded-lg font-semibold transition-colors"
            >
              Create Your First Deck
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playerData.decks.map((deck) => {
              const isActive = deck.id === playerData.activeDeckId;
              return (
                <motion.div
                  key={deck.id}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-stone-900 border rounded-2xl p-6 transition-colors ${
                    isActive ? 'border-amber-600 bg-amber-900/20' : 'border-stone-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-stone-200 mb-1">{deck.name}</h3>
                      <p className="text-sm text-stone-400">
                        {deck.cardIds.length} cards
                      </p>
                      <p className="text-xs text-stone-500 mt-2">
                        Updated {new Date(deck.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {isActive && (
                      <div className="flex items-center gap-1 text-amber-500">
                        <Check className="w-5 h-5" />
                        <span className="text-xs font-semibold">Active</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    {!isActive && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveDeck(deck.id)}
                        className="flex-1 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Set Active
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(deck)}
                      className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-colors"
                      title="Edit deck"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(deck.id)}
                      className="p-2 bg-stone-800 hover:bg-red-900 text-red-400 rounded-lg transition-colors"
                      title="Delete deck"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
