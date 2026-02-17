import React, { useState } from 'react';
import Controls from './Controls.jsx';
import '../styles/Menu.css';

/**
 * Start screen: pick player count, view controls, start game.
 */
function Menu({ onStart }) {
  const [playerCount, setPlayerCount] = useState(2);

  return (
    <div className="menu">
      <h1>🐛 BomberBug 💣</h1>
      <p className="menu__subtitle">A classic Bomberman-style game</p>

      <div className="menu__players">
        <label>Players:</label>
        {[2, 3, 4].map(count => (
          <button
            key={count}
            className={playerCount === count ? 'active' : ''}
            onClick={() => setPlayerCount(count)}
          >
            {count}
          </button>
        ))}
      </div>

      <button
        className="menu__start"
        onClick={() => onStart(playerCount)}
      >
        Start Game
      </button>

      <div className="menu__controls">
        <h2>Controls</h2>
        <Controls playerCount={playerCount} />
      </div>
    </div>
  );
}

export default Menu;
