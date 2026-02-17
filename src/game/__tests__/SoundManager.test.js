import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SoundManager, soundManager } from '../SoundManager.js';

// Mock Audio for jsdom environment
class MockAudio {
  constructor(src) {
    this.src = src;
    this.preload = '';
    this.volume = 1;
    this.loop = false;
    this.currentTime = 0;
  }
  play() {
    return Promise.resolve();
  }
  pause() {}
  cloneNode() {
    const clone = new MockAudio(this.src);
    clone.preload = this.preload;
    clone.volume = this.volume;
    return clone;
  }
}

describe('SoundManager', () => {
  let sm;

  beforeEach(() => {
    // Set up global Audio mock
    globalThis.Audio = MockAudio;
    sm = new SoundManager();
  });

  describe('constructor', () => {
    it('initializes with default values', () => {
      expect(sm.sounds).toBeInstanceOf(Map);
      expect(sm.sounds.size).toBe(0);
      expect(sm.music).toBeNull();
      expect(sm.muted).toBe(false);
      expect(sm.volume).toBe(0.5);
    });
  });

  describe('preload', () => {
    it('loads sounds into the map', () => {
      sm.preload(['explosion', 'bonus']);
      expect(sm.sounds.size).toBe(2);
      expect(sm.sounds.has('explosion')).toBe(true);
      expect(sm.sounds.has('bonus')).toBe(true);
    });

    it('creates Audio with correct path', () => {
      sm.preload(['explosion']);
      const audio = sm.sounds.get('explosion');
      expect(audio.src).toBe('/sound/explosion.mp3');
    });

    it('supports custom base path', () => {
      sm.preload(['explosion'], '/assets/audio');
      const audio = sm.sounds.get('explosion');
      expect(audio.src).toBe('/assets/audio/explosion.mp3');
    });

    it('sets preload to auto', () => {
      sm.preload(['explosion']);
      const audio = sm.sounds.get('explosion');
      expect(audio.preload).toBe('auto');
    });

    it('handles missing Audio constructor gracefully', () => {
      delete globalThis.Audio;
      expect(() => sm.preload(['explosion'])).not.toThrow();
      expect(sm.sounds.size).toBe(0);
    });
  });

  describe('play', () => {
    beforeEach(() => {
      sm.preload(['explosion', 'bonus']);
    });

    it('plays a loaded sound', () => {
      const playSpy = vi.fn().mockResolvedValue(undefined);
      const original = sm.sounds.get('explosion');
      original.cloneNode = () => {
        const clone = new MockAudio(original.src);
        clone.play = playSpy;
        return clone;
      };

      sm.play('explosion');
      expect(playSpy).toHaveBeenCalled();
    });

    it('does not play when muted', () => {
      const playSpy = vi.fn().mockResolvedValue(undefined);
      const original = sm.sounds.get('explosion');
      original.cloneNode = () => {
        const clone = new MockAudio(original.src);
        clone.play = playSpy;
        return clone;
      };

      sm.setMuted(true);
      sm.play('explosion');
      expect(playSpy).not.toHaveBeenCalled();
    });

    it('does nothing for unknown sound names', () => {
      expect(() => sm.play('nonexistent')).not.toThrow();
    });

    it('sets volume on cloned audio', () => {
      let cloneVolume = null;
      const original = sm.sounds.get('explosion');
      original.cloneNode = () => {
        const clone = new MockAudio(original.src);
        const origPlay = clone.play.bind(clone);
        clone.play = () => {
          cloneVolume = clone.volume;
          return origPlay();
        };
        return clone;
      };

      sm.setVolume(0.8);
      sm.play('explosion');
      expect(cloneVolume).toBe(0.8);
    });
  });

  describe('playMusic', () => {
    it('creates a looping audio element', () => {
      sm.playMusic('background_music');
      expect(sm.music).not.toBeNull();
      expect(sm.music.loop).toBe(true);
    });

    it('sets music volume to half of effects volume', () => {
      sm.setVolume(0.8);
      sm.playMusic('background_music');
      expect(sm.music.volume).toBe(0.4);
    });

    it('stops previous music before playing new', () => {
      sm.playMusic('track1');
      const firstMusic = sm.music;
      const pauseSpy = vi.fn();
      firstMusic.pause = pauseSpy;

      sm.playMusic('track2');
      expect(pauseSpy).toHaveBeenCalled();
      expect(sm.music).not.toBe(firstMusic);
    });

    it('does not play when muted', () => {
      sm.setMuted(true);
      sm.playMusic('background_music');
      expect(sm.music).toBeNull();
    });

    it('handles missing Audio constructor gracefully', () => {
      delete globalThis.Audio;
      expect(() => sm.playMusic('background_music')).not.toThrow();
    });
  });

  describe('stopMusic', () => {
    it('stops and clears the music', () => {
      sm.playMusic('background_music');
      const pauseSpy = vi.fn();
      sm.music.pause = pauseSpy;

      sm.stopMusic();
      expect(pauseSpy).toHaveBeenCalled();
      expect(sm.music).toBeNull();
    });

    it('does nothing if no music is playing', () => {
      expect(() => sm.stopMusic()).not.toThrow();
      expect(sm.music).toBeNull();
    });
  });

  describe('setMuted', () => {
    it('sets muted state', () => {
      sm.setMuted(true);
      expect(sm.muted).toBe(true);
      sm.setMuted(false);
      expect(sm.muted).toBe(false);
    });

    it('pauses music when muting', () => {
      sm.playMusic('background_music');
      const pauseSpy = vi.fn();
      sm.music.pause = pauseSpy;

      sm.setMuted(true);
      expect(pauseSpy).toHaveBeenCalled();
    });

    it('resumes music when unmuting', () => {
      sm.playMusic('background_music');
      sm.setMuted(true);

      const playSpy = vi.fn().mockResolvedValue(undefined);
      sm.music.play = playSpy;

      sm.setMuted(false);
      expect(playSpy).toHaveBeenCalled();
    });
  });

  describe('setVolume', () => {
    it('sets volume in 0-1 range', () => {
      sm.setVolume(0.7);
      expect(sm.volume).toBe(0.7);
    });

    it('clamps volume to 0', () => {
      sm.setVolume(-0.5);
      expect(sm.volume).toBe(0);
    });

    it('clamps volume to 1', () => {
      sm.setVolume(1.5);
      expect(sm.volume).toBe(1);
    });

    it('updates music volume when music is playing', () => {
      sm.playMusic('background_music');
      sm.setVolume(0.6);
      expect(sm.music.volume).toBe(0.3); // Music is half volume
    });
  });

  describe('singleton', () => {
    it('exports a singleton instance', () => {
      expect(soundManager).toBeInstanceOf(SoundManager);
    });
  });
});
