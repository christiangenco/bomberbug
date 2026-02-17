import React from 'react';
import { PLAYER_COLORS } from '../game/constants.js';

/**
 * Displays status for each player: color, name, bombs, radius, super bomb, dead.
 */
function HUD({ players }) {
  return (
    <div className="hud">
      {players.map((player, index) => (
        <PlayerStatus key={index} player={player} playerIndex={index} />
      ))}
    </div>
  );
}

function PlayerStatus({ player, playerIndex }) {
  const isAlive = player.grid !== null;
  const color = PLAYER_COLORS[playerIndex] ?? player.color;

  return (
    <div className={`player-status${isAlive ? '' : ' player-status--dead'}`}>
      <span
        className="player-status__color"
        style={{ backgroundColor: color }}
      />
      <span className="player-status__name">P{playerIndex + 1}</span>

      {isAlive ? (
        <>
          <span className="player-status__stat">💣{player.maxBombs}</span>
          <span className="player-status__stat">💥{player.bombRadius}</span>
          {player.hasSuperBomb && <span className="player-status__stat">⭐</span>}
        </>
      ) : (
        <span className="player-status__stat">💀</span>
      )}
    </div>
  );
}

export default React.memo(HUD);
