import { useEffect, useRef, useState, useCallback } from 'react';
import { PLAYER_CONTROLS, DIRECTIONS } from './constants.js';

/**
 * React hook for multiplayer keyboard input.
 * Maps key codes to player actions using PLAYER_CONTROLS config.
 * Returns an incrementing counter so the parent can re-render on input.
 *
 * @param {import('./GameState.js').GameState} gameState
 * @param {boolean} isRunning
 * @returns {{ inputTick: number }}
 */
export function useKeyboard(gameState, isRunning) {
  const [inputTick, setInputTick] = useState(0);
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  useEffect(() => {
    if (!isRunning) return;

    // Build a fast lookup: code -> { playerIndex, action }
    const keyMap = new Map();
    for (const [indexStr, controls] of Object.entries(PLAYER_CONTROLS)) {
      const index = Number(indexStr);
      for (const [action, code] of Object.entries(controls)) {
        keyMap.set(code, { playerIndex: index, action });
      }
    }

    const handleKeyDown = (event) => {
      const gs = gameStateRef.current;
      if (!gs || gs.gameOver) return;

      const mapping = keyMap.get(event.code);
      if (!mapping) return;

      const { playerIndex, action } = mapping;
      const player = gs.players[playerIndex];

      // Ignore input for dead or non-existent players
      if (!player || player.grid === null) return;

      event.preventDefault();

      if (action === 'bomb') {
        player.placeBomb();
      } else {
        player.move(DIRECTIONS[action]);
      }

      // Trigger re-render so the grid reflects the new state
      setInputTick(t => t + 1);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isRunning]);

  return { inputTick };
}
