import React from 'react';
import { PLAYER_COLORS } from '../game/constants.js';
import '../styles/Menu.css';

/**
 * Game over screen: shows winner or draw, with play again / menu buttons.
 */
function GameOver({ winner, onRestart, onMenu }) {
  const winnerColor = winner
    ? (PLAYER_COLORS[winner.playerIndex] ?? winner.color)
    : null;

  return (
    <div className="game-over">
      <h1>Game Over!</h1>

      {winner ? (
        <p className="game-over__result" style={{ color: winnerColor }}>
          Player {winner.playerIndex + 1} Wins! 🎉
        </p>
      ) : (
        <p className="game-over__result">It&rsquo;s a Draw! 🤝</p>
      )}

      <div className="game-over__buttons">
        <button onClick={onRestart}>Play Again</button>
        <button onClick={onMenu}>Main Menu</button>
      </div>
    </div>
  );
}

export default GameOver;
