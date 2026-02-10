import { useState, useCallback, useEffect } from 'react';
import { audioManager } from '../lib/audioManager';

export function useAudio() {
  const [masterVolume, setMasterVolumeState] = useState(audioManager.getMasterVolume());
  const [musicVolume, setMusicVolumeState] = useState(audioManager.getMusicVolume());
  const [isMuted, setIsMutedState] = useState(audioManager.getIsMuted());

  const setMasterVolume = useCallback((volume: number) => {
    audioManager.setMasterVolume(volume);
    setMasterVolumeState(volume);
  }, []);

  const setMusicVolume = useCallback((volume: number) => {
    audioManager.setMusicVolume(volume);
    setMusicVolumeState(volume);
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    audioManager.setMuted(muted);
    setIsMutedState(muted);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(!isMuted);
  }, [isMuted, setMuted]);

  const playBattleMusic = useCallback((battleNumber: number) => {
    audioManager.playBattleMusic(battleNumber);
  }, []);

  const playPlaylist = useCallback((tracks: string[]) => {
    audioManager.playPlaylist(tracks);
  }, []);

  const stopMusic = useCallback((fadeOut: boolean = true) => {
    audioManager.stopMusic(fadeOut);
  }, []);

  return {
    masterVolume,
    musicVolume,
    isMuted,
    setMasterVolume,
    setMusicVolume,
    setMuted,
    toggleMute,
    playBattleMusic,
    playPlaylist,
    stopMusic,
  };
}

// Hook specifically for battle music that auto-plays based on battle number
export function useBattleMusic(battleNumber: number, isActive: boolean) {
  useEffect(() => {
    if (isActive) {
      audioManager.playBattleMusic(battleNumber);
    }

    return () => {
      if (isActive) {
        audioManager.stopMusic(true);
      }
    };
  }, [battleNumber, isActive]);
}
