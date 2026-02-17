import React, { useState, useCallback } from 'react';
import { soundManager } from '../game/SoundManager.js';

/**
 * Mute toggle + volume slider for game audio.
 */
function SoundControls() {
  const [muted, setMuted] = useState(soundManager.muted);
  const [volume, setVolume] = useState(soundManager.volume);

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    soundManager.setMuted(next);
  }, [muted]);

  const handleVolume = useCallback((e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    soundManager.setVolume(v);
  }, []);

  return (
    <div className="sound-controls">
      <button
        className="sound-controls__mute"
        onClick={toggleMute}
        aria-label={muted ? 'Unmute' : 'Mute'}
        title={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? '🔇' : '🔊'}
      </button>
      <input
        className="sound-controls__volume"
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={volume}
        onChange={handleVolume}
        aria-label="Volume"
        title={`Volume: ${Math.round(volume * 100)}%`}
      />
    </div>
  );
}

export default React.memo(SoundControls);
