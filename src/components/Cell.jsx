import React from 'react';
import EntitySprite from './EntitySprite.jsx';

/**
 * A single grid cell with a checkerboard background.
 * Renders the entity occupying this location (if any).
 */
const Cell = React.memo(function Cell({ row, col, entity }) {
  const isLight = (row + col) % 2 === 0;

  return (
    <div className={`cell ${isLight ? 'cell--light' : 'cell--dark'}`}>
      {entity && <EntitySprite entity={entity} />}
    </div>
  );
});

export default Cell;
