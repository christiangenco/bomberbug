/**
 * Utility for playing game sounds.
 * Designed to be mock-safe: gracefully handles missing Audio constructor.
 */
export class SoundManager {
  constructor() {
    this.sounds = new Map();
    this.music = null;
    this.muted = false;
    this.volume = 0.5;
  }

  /**
   * Preload sound files for instant playback.
   * @param {string[]} names - Sound names (without path/extension)
   * @param {string} [basePath='/sound'] - Base path for sound files
   */
  preload(names, basePath = '/sound') {
    if (typeof Audio === 'undefined') return;

    names.forEach(name => {
      try {
        const audio = new Audio(`${basePath}/${name}.mp3`);
        audio.preload = 'auto';
        this.sounds.set(name, audio);
      } catch {
        // Ignore errors in environments without Audio support
      }
    });
  }

  /**
   * Play a sound by name. Creates a clone for overlapping playback.
   * @param {string} name - Sound name
   */
  play(name) {
    if (this.muted) return;

    const original = this.sounds.get(name);
    if (!original) return;

    try {
      const audio = original.cloneNode();
      audio.volume = this.volume;
      audio.play().catch(() => {}); // Ignore autoplay errors
    } catch {
      // Ignore errors
    }
  }

  /**
   * Play looping background music.
   * @param {string} name - Sound name
   * @param {string} [basePath='/sound'] - Base path for sound files
   */
  playMusic(name, basePath = '/sound') {
    this.stopMusic();

    if (typeof Audio === 'undefined') return;
    if (this.muted) return;

    try {
      this.music = new Audio(`${basePath}/${name}.mp3`);
      this.music.loop = true;
      this.music.volume = this.volume * 0.5; // Music quieter than effects
      this.music.play().catch(() => {});
    } catch {
      // Ignore errors
    }
  }

  /**
   * Stop background music.
   */
  stopMusic() {
    if (this.music) {
      try {
        this.music.pause();
        this.music.currentTime = 0;
      } catch {
        // Ignore errors
      }
      this.music = null;
    }
  }

  /**
   * Toggle mute state.
   * @param {boolean} muted
   */
  setMuted(muted) {
    this.muted = muted;
    if (this.music) {
      try {
        if (muted) {
          this.music.pause();
        } else {
          this.music.play().catch(() => {});
        }
      } catch {
        // Ignore errors
      }
    }
  }

  /**
   * Set global volume (0-1).
   * @param {number} volume
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.music) {
      try {
        this.music.volume = this.volume * 0.5;
      } catch {
        // Ignore errors
      }
    }
  }
}

// Singleton instance for the app
export const soundManager = new SoundManager();
