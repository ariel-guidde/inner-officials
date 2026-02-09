import { useState, useCallback, useEffect } from 'react';
import { CharacterAppearance, DEFAULT_CHARACTER, HairStyle, Clothing, Accessory } from '../types/character';

const STORAGE_KEY = 'inner-officials-character';

function loadCharacter(): CharacterAppearance {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_CHARACTER, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parse errors
  }
  return { ...DEFAULT_CHARACTER };
}

function saveCharacter(character: CharacterAppearance): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
  } catch {
    // Ignore storage errors
  }
}

export function useCharacter() {
  const [character, setCharacter] = useState<CharacterAppearance>(loadCharacter);

  useEffect(() => {
    saveCharacter(character);
  }, [character]);

  const setHair = useCallback((hair: HairStyle) => {
    setCharacter(prev => ({ ...prev, hair }));
  }, []);

  const setClothing = useCallback((clothing: Clothing) => {
    setCharacter(prev => ({ ...prev, clothing }));
  }, []);

  const setAccessory = useCallback((accessory: Accessory) => {
    setCharacter(prev => ({ ...prev, accessory }));
  }, []);

  const setName = useCallback((name: string) => {
    setCharacter(prev => ({ ...prev, name }));
  }, []);

  const reset = useCallback(() => {
    setCharacter({ ...DEFAULT_CHARACTER });
  }, []);

  return {
    character,
    setHair,
    setClothing,
    setAccessory,
    setName,
    reset,
  };
}
