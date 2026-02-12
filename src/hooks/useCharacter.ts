import { useState, useCallback, useEffect } from 'react';
import { CharacterAppearance, DEFAULT_CHARACTER } from '../types/character';

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

  const setAttire = useCallback((attireId: string) => {
    setCharacter(prev => ({ ...prev, attireId }));
  }, []);

  const setName = useCallback((name: string) => {
    setCharacter(prev => ({ ...prev, name }));
  }, []);

  const reset = useCallback(() => {
    setCharacter({ ...DEFAULT_CHARACTER });
  }, []);

  return {
    character,
    setAttire,
    setName,
    reset,
  };
}
