import { useState, useCallback, useEffect } from 'react';
import { PlayerSaveData, SavedDeck } from '../types/game';
import { loadPlayerData, savePlayerData, validateCardIds } from '../lib/saveService';

const MIN_DECK_SIZE = 15;
const MAX_DECK_SIZE = 25;
const MAX_COPIES_PER_CARD = 3;

export interface UsePlayerSaveReturn {
  playerData: PlayerSaveData;
  activeDeck: SavedDeck | null;
  saveDeck: (deck: SavedDeck) => { success: boolean; error?: string };
  deleteDeck: (deckId: string) => void;
  setActiveDeck: (deckId: string | null) => void;
  getActiveDeck: () => SavedDeck | null;
  validateDeck: (cardIds: string[]) => { valid: boolean; error?: string };
}

export function usePlayerSave(): UsePlayerSaveReturn {
  const [playerData, setPlayerData] = useState<PlayerSaveData>(() => loadPlayerData());

  useEffect(() => {
    // Sync to localStorage whenever playerData changes
    savePlayerData(playerData);
  }, [playerData]);

  const validateDeck = useCallback((cardIds: string[]): { valid: boolean; error?: string } => {
    // Check deck size
    if (cardIds.length < MIN_DECK_SIZE) {
      return { valid: false, error: `Deck must have at least ${MIN_DECK_SIZE} cards` };
    }
    if (cardIds.length > MAX_DECK_SIZE) {
      return { valid: false, error: `Deck cannot have more than ${MAX_DECK_SIZE} cards` };
    }

    // Check card validity
    const cardValidation = validateCardIds(cardIds);
    if (!cardValidation.valid) {
      return { valid: false, error: `Invalid card IDs: ${cardValidation.invalidIds.join(', ')}` };
    }

    // Check copy limits
    const cardCounts = new Map<string, number>();
    cardIds.forEach(id => {
      cardCounts.set(id, (cardCounts.get(id) || 0) + 1);
    });

    const overLimit = Array.from(cardCounts.entries()).find(([_, count]) => count > MAX_COPIES_PER_CARD);
    if (overLimit) {
      return { valid: false, error: `Cannot have more than ${MAX_COPIES_PER_CARD} copies of the same card` };
    }

    return { valid: true };
  }, []);

  const saveDeck = useCallback((deck: SavedDeck): { success: boolean; error?: string } => {
    const validation = validateDeck(deck.cardIds);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    setPlayerData((prev) => {
      const existingIndex = prev.decks.findIndex(d => d.id === deck.id);
      const updatedDeck: SavedDeck = {
        ...deck,
        updatedAt: Date.now(),
      };

      if (existingIndex >= 0) {
        // Update existing deck
        const newDecks = [...prev.decks];
        newDecks[existingIndex] = updatedDeck;
        return {
          ...prev,
          decks: newDecks,
        };
      } else {
        // Add new deck
        return {
          ...prev,
          decks: [...prev.decks, updatedDeck],
        };
      }
    });

    return { success: true };
  }, [validateDeck]);

  const deleteDeck = useCallback((deckId: string) => {
    setPlayerData((prev) => {
      const newDecks = prev.decks.filter(d => d.id !== deckId);
      let newActiveDeckId = prev.activeDeckId;

      // If deleting the active deck, clear it
      if (prev.activeDeckId === deckId) {
        newActiveDeckId = newDecks.length > 0 ? newDecks[0].id : null;
      }

      return {
        ...prev,
        decks: newDecks,
        activeDeckId: newActiveDeckId,
      };
    });
  }, []);

  const setActiveDeck = useCallback((deckId: string | null) => {
    setPlayerData((prev) => {
      // Validate that deck exists if setting active
      if (deckId !== null && !prev.decks.some(d => d.id === deckId)) {
        return prev;
      }
      return {
        ...prev,
        activeDeckId: deckId,
      };
    });
  }, []);

  const getActiveDeck = useCallback((): SavedDeck | null => {
    if (!playerData.activeDeckId) return null;
    return playerData.decks.find(d => d.id === playerData.activeDeckId) || null;
  }, [playerData]);

  const activeDeck = getActiveDeck();

  return {
    playerData,
    activeDeck,
    saveDeck,
    deleteDeck,
    setActiveDeck,
    getActiveDeck,
    validateDeck,
  };
}
