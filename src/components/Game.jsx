import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState } from '../game/GameState.js';
import { useGameLoop } from '../game/useGameLoop.js';
import { useKeyboard } from '../game/useKeyboard.js';
import { soundManager } from '../game/SoundManager.js';
import { SOUNDS } from '../game/constants.js';
import GridComponent from './Grid.jsx';
import HUD from './HUD.jsx';
import Controls from './Controls.jsx';
import TouchControls from './TouchControls.jsx';
import SoundControls from './SoundControls.jsx';
import DeathEffect from './DeathEffect.jsx';
import '../styles/Game.css';

/**
 * Main game container.
 * Creates GameState, sets up game loop + keyboard hooks,
 * renders Grid, HUD, Controls, pause button, touch controls,
 * screen shake, death animations, and sound controls.
 */
function Game({ playerCount, onGameOver }) {
  const [gameState] = useState(() => new GameState({ playerCount, level: 1 }));
  const [isRunning, setIsRunning] = useState(true);
  const [shake, setShake] = useState(false);
  const [deaths, setDeaths] = useState([]); // { id, row, col }
  const gameOverFired = useRef(false);
  const deathIdRef = useRef(0);

  // Wire up explosion callback for screen shake
  useEffect(() => {
    gameState._onExplosion = () => {
      setShake(true);
      setTimeout(() => setShake(false), 150);
    };

    gameState._onDeath = (playerIndex, loc) => {
      const id = ++deathIdRef.current;
      setDeaths(prev => [...prev, { id, row: loc.row, col: loc.col }]);
    };

    return () => {
      gameState._onExplosion = null;
      gameState._onDeath = null;
    };
  }, [gameState]);

  const removeDeathEffect = useCallback((id) => {
    setDeaths(prev => prev.filter(d => d.id !== id));
  }, []);

  // Game loop — returns { tick } counter that forces re-renders
  const { tick } = useGameLoop(gameState, isRunning);

  // Keyboard input — returns { inputTick } to trigger re-renders on key press
  const { inputTick } = useKeyboard(gameState, isRunning);

  // Combined render key so Grid always gets fresh data
  const renderTick = tick + inputTick;

  // Sound: unlock on first click (browser autoplay policy) & preload
  const audioUnlocked = useRef(false);
  useEffect(() => {
    soundManager.preload(SOUNDS);

    const unlock = () => {
      if (!audioUnlocked.current) {
        audioUnlocked.current = true;
        soundManager.playMusic('background_music');
      }
    };

    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });

    return () => {
      soundManager.stopMusic();
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
    };
  }, []);

  // Check for game over
  useEffect(() => {
    if (gameState.gameOver && !gameOverFired.current) {
      gameOverFired.current = true;
      setIsRunning(false);
      soundManager.stopMusic();
      // Small delay so the final state renders before transition
      const id = setTimeout(() => onGameOver(gameState.winner), 600);
      return () => clearTimeout(id);
    }
  }, [tick, gameState, onGameOver]);

  const togglePause = useCallback(() => {
    setIsRunning(r => !r);
  }, []);

  return (
    <div className={`game${shake ? ' game--shake' : ''}`}>
      <HUD players={gameState.players} />
      <div className="game__grid-wrapper">
        <GridComponent grid={gameState.grid} renderTick={renderTick} />
        {deaths.map(d => (
          <DeathEffect
            key={d.id}
            row={d.row}
            col={d.col}
            gridRows={gameState.rows}
            gridCols={gameState.cols}
            onComplete={() => removeDeathEffect(d.id)}
          />
        ))}
      </div>
      <div className="game__toolbar">
        <Controls playerCount={playerCount} />
        <button onClick={togglePause}>
          {isRunning ? '⏸ Pause' : '▶ Resume'}
        </button>
        <SoundControls />
      </div>
      <TouchControls gameState={gameState} />
    </div>
  );
}

export default Game;
