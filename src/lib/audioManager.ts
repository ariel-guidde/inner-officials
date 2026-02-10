// Audio tracks for battles
export const BATTLE_TRACKS = {
  1: '/audio/combat-music-1.mp3',
  2: '/audio/combat-music-2.mp3',
  3: '/audio/boss-music-1.mp3',
} as const;

const FADE_DURATION = 1500; // ms
const FADE_INTERVAL = 50; // ms

class AudioManager {
  private static instance: AudioManager;
  private currentAudio: HTMLAudioElement | null = null;
  private masterVolume: number = 0.7;
  private musicVolume: number = 0.5;
  private isMuted: boolean = false;
  private fadeInterval: ReturnType<typeof setInterval> | null = null;
  private playlist: string[] = [];
  private playlistIndex: number = 0;

  private constructor() {
    // Load saved settings from localStorage
    const savedMasterVolume = localStorage.getItem('audio_masterVolume');
    const savedMusicVolume = localStorage.getItem('audio_musicVolume');
    const savedMuted = localStorage.getItem('audio_muted');

    if (savedMasterVolume) this.masterVolume = parseFloat(savedMasterVolume);
    if (savedMusicVolume) this.musicVolume = parseFloat(savedMusicVolume);
    if (savedMuted) this.isMuted = savedMuted === 'true';
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private getEffectiveVolume(): number {
    if (this.isMuted) return 0;
    return this.masterVolume * this.musicVolume;
  }

  private clearFadeInterval(): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
  }

  async playMusic(src: string, fadeIn: boolean = true): Promise<void> {
    // If same track is already playing, don't restart
    if (this.currentAudio && this.currentAudio.src.endsWith(src)) {
      return;
    }

    // Fade out current music first
    if (this.currentAudio) {
      await this.fadeOut();
    }

    const audio = new Audio(src);
    audio.loop = this.playlist.length === 0; // Loop only when not in playlist mode
    this.currentAudio = audio;

    // In playlist mode, advance to next track when current ends
    if (this.playlist.length > 0) {
      audio.onended = () => {
        this.playlistIndex = (this.playlistIndex + 1) % this.playlist.length;
        this.playPlaylistTrack();
      };
    }

    if (fadeIn) {
      audio.volume = 0;
      await audio.play();
      await this.fadeIn();
    } else {
      audio.volume = this.getEffectiveVolume();
      await audio.play();
    }
  }

  private fadeIn(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.currentAudio) {
        resolve();
        return;
      }

      this.clearFadeInterval();
      const targetVolume = this.getEffectiveVolume();
      const steps = FADE_DURATION / FADE_INTERVAL;
      const volumeStep = targetVolume / steps;
      let currentStep = 0;

      this.fadeInterval = setInterval(() => {
        currentStep++;
        if (this.currentAudio) {
          this.currentAudio.volume = Math.min(volumeStep * currentStep, targetVolume);
        }

        if (currentStep >= steps) {
          this.clearFadeInterval();
          resolve();
        }
      }, FADE_INTERVAL);
    });
  }

  private fadeOut(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.currentAudio) {
        resolve();
        return;
      }

      this.clearFadeInterval();
      const startVolume = this.currentAudio.volume;
      const steps = FADE_DURATION / FADE_INTERVAL;
      const volumeStep = startVolume / steps;
      let currentStep = 0;

      this.fadeInterval = setInterval(() => {
        currentStep++;
        if (this.currentAudio) {
          this.currentAudio.volume = Math.max(startVolume - (volumeStep * currentStep), 0);
        }

        if (currentStep >= steps) {
          this.clearFadeInterval();
          if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
          }
          resolve();
        }
      }, FADE_INTERVAL);
    });
  }

  async stopMusic(fadeOut: boolean = true): Promise<void> {
    if (!this.currentAudio) return;

    if (fadeOut) {
      await this.fadeOut();
    } else {
      this.clearFadeInterval();
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('audio_masterVolume', this.masterVolume.toString());
    this.updateCurrentVolume();
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('audio_musicVolume', this.musicVolume.toString());
    this.updateCurrentVolume();
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    localStorage.setItem('audio_muted', muted.toString());
    this.updateCurrentVolume();
  }

  private updateCurrentVolume(): void {
    if (this.currentAudio && !this.fadeInterval) {
      this.currentAudio.volume = this.getEffectiveVolume();
    }
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  getMusicVolume(): number {
    return this.musicVolume;
  }

  getIsMuted(): boolean {
    return this.isMuted;
  }

  async playPlaylist(tracks: string[]): Promise<void> {
    this.playlist = tracks;
    this.playlistIndex = 0;
    if (tracks.length > 0) {
      await this.playMusic(tracks[0]);
    }
  }

  private async playPlaylistTrack(): Promise<void> {
    const track = this.playlist[this.playlistIndex];
    if (!track) return;

    // Stop current without fade for seamless transition
    if (this.currentAudio) {
      this.clearFadeInterval();
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    await this.playMusic(track, false);
  }

  stopPlaylist(): void {
    this.playlist = [];
    this.playlistIndex = 0;
    this.stopMusic();
  }

  // Play battle music based on battle number
  async playBattleMusic(battleNumber: number): Promise<void> {
    const track = BATTLE_TRACKS[battleNumber as keyof typeof BATTLE_TRACKS];
    if (track) {
      await this.playMusic(track);
    }
  }
}

export const audioManager = AudioManager.getInstance();
