import React, { useCallback } from 'react';
import { Location } from '../engine/Location.js';

/**
 * On-screen D-pad + bomb button, shown only on touch devices (via CSS media query).
 * Controls Player 1 only.
 */
function TouchControls({ gameState }) {
  const getPlayer = useCallback(() => {
    if (!gameState || gameState.gameOver) return null;
    const p = gameState.players[0];
    return p && p.grid !== null ? p : null;
  }, [gameState]);

  const handleMove = useCallback((direction) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    const player = getPlayer();
    if (player) player.move(direction);
  }, [getPlayer]);

  const handleBomb = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const player = getPlayer();
    if (player) player.placeBomb();
  }, [getPlayer]);

  return (
    <div className="touch-controls" role="group" aria-label="Game controls">
      <button
        className="touch-btn touch-btn--up"
        onTouchStart={handleMove(Location.NORTH)}
        aria-label="Move up"
      >▲</button>
      <button
        className="touch-btn touch-btn--left"
        onTouchStart={handleMove(Location.WEST)}
        aria-label="Move left"
      >◀</button>
      <button
        className="touch-btn touch-btn--down"
        onTouchStart={handleMove(Location.SOUTH)}
        aria-label="Move down"
      >▼</button>
      <button
        className="touch-btn touch-btn--right"
        onTouchStart={handleMove(Location.EAST)}
        aria-label="Move right"
      >▶</button>
      <button
        className="touch-btn touch-btn--bomb"
        onTouchStart={handleBomb}
        aria-label="Place bomb"
      >💣</button>
    </div>
  );
}

export default React.memo(TouchControls);
