import { z } from 'zod';
import { PlayerSaveData, SavedDeck } from '../types/game';
import { DEBATE_DECK } from '../data/cards';

const SAVE_KEY = 'inner-officials-save';
const CURRENT_VERSION = 1;

const SavedDeckSchema = z.object({
  id: z.string(),
  name: z.string(),
  cardIds: z.array(z.string()),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const PlayerSaveDataSchema = z.object({
  version: z.literal(CURRENT_VERSION),
  decks: z.array(SavedDeckSchema),
  activeDeckId: z.string().nullable(),
});

function createDefaultStarterDeck(): SavedDeck {
  // Create a balanced starter deck with ~20 cards distributed across elements
  const starterCardIds = [
    // Water cards (4)
    'wa1', 'wa2', 'wa3', 'wa6',
    // Wood cards (4)
    'w1', 'w2', 'w3', 'w6',
    // Fire cards (4)
    'f1', 'f2', 'f7', 'f9',
    // Metal cards (4)
    'm1', 'm2', 'm5', 'm6',
    // Earth cards (4)
    'e1', 'e2', 'e5', 'e6',
  ];
  
  return {
    id: `deck-${Date.now()}`,
    name: 'Starter Deck',
    cardIds: starterCardIds,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function createDefaultSaveData(): PlayerSaveData {
  const starterDeck = createDefaultStarterDeck();
  return {
    version: CURRENT_VERSION,
    decks: [starterDeck],
    activeDeckId: starterDeck.id,
  };
}

export function loadPlayerData(): PlayerSaveData {
  try {
    const stored = localStorage.getItem(SAVE_KEY);
    if (!stored) {
      const defaultData = createDefaultSaveData();
      savePlayerData(defaultData);
      return defaultData;
    }
    
    const parsed = JSON.parse(stored);
    const result = PlayerSaveDataSchema.safeParse(parsed);
    
    if (result.success) {
      return result.data;
    }
    
    // Invalid data, create default
    console.warn('Invalid save data, creating default:', result.error);
    const defaultData = createDefaultSaveData();
    savePlayerData(defaultData);
    return defaultData;
  } catch (error) {
    console.error('Failed to load player data:', error);
    const defaultData = createDefaultSaveData();
    savePlayerData(defaultData);
    return defaultData;
  }
}

export function savePlayerData(data: PlayerSaveData): void {
  try {
    const result = PlayerSaveDataSchema.safeParse(data);
    if (!result.success) {
      console.error('Invalid save data:', result.error);
      return;
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(result.data));
  } catch (error) {
    console.error('Failed to save player data:', error);
  }
}

export function validateCardIds(cardIds: string[]): { valid: boolean; invalidIds: string[] } {
  const validCardIds = new Set(DEBATE_DECK.map(card => card.id));
  const invalidIds = cardIds.filter(id => !validCardIds.has(id));
  return {
    valid: invalidIds.length === 0,
    invalidIds,
  };
}

export function getCardById(cardId: string) {
  return DEBATE_DECK.find(card => card.id === cardId);
}
