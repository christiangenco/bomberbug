import React from 'react';
import { PLAYER_CONTROLS, PLAYER_COLORS } from '../game/constants.js';

const ACTION_LABELS = ['↑', '↓', '←', '→', '💣'];
const ACTION_ORDER = ['up', 'down', 'left', 'right', 'bomb'];

function formatKey(code) {
  return code
    .replace('Key', '')
    .replace('Arrow', '')
    .replace('Numpad', 'Num')
    .replace('Slash', '/');
}

/**
 * Shows keyboard control bindings for each active player.
 */
function Controls({ playerCount }) {
  return (
    <div className="controls">
      {Array.from({ length: playerCount }, (_, i) => {
        const bindings = PLAYER_CONTROLS[i];
        if (!bindings) return null;

        return (
          <div key={i} className="controls__player">
            <strong style={{ color: PLAYER_COLORS[i] }}>P{i + 1}:</strong>
            {ACTION_ORDER.map((action, j) => (
              <span key={action}>
                {ACTION_LABELS[j]}{' '}
                <span className="controls__key">{formatKey(bindings[action])}</span>
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default React.memo(Controls);
