import { useState, useEffect, useCallback, useRef } from 'react';
import { TICK_RATE } from './constants.js';

/**
 * React hook that drives the game tick.
 * Calls gameState.tick() every TICK_RATE ms when running.
 *
 * @param {import('./GameState.js').GameState} gameState
 * @param {boolean} isRunning
 * @returns {{ tick: number }}
 */
export function useGameLoop(gameState, isRunning) {
  const [tick, setTick] = useState(0);
  const gameStateRef = useRef(gameState);

  // Keep ref up to date
  gameStateRef.current = gameState;

  const doTick = useCallback(() => {
    const gs = gameStateRef.current;
    if (!gs || gs.gameOver) return;
    gs.tick();
    setTick(t => t + 1);
  }, []);

  useEffect(() => {
    if (!isRunning || !gameState) return;

    const intervalId = setInterval(doTick, TICK_RATE);
    return () => clearInterval(intervalId);
  }, [isRunning, gameState, doTick]);

  return { tick };
}
