import React from 'react';
import { Location } from '../engine/Location.js';
import Cell from './Cell.jsx';
import '../styles/Grid.css';

/**
 * Renders the game grid as a CSS Grid layout.
 * Iterates every row×col and renders a Cell for each.
 */
function GridComponent({ grid, renderTick }) {
  const cells = [];

  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const loc = new Location(row, col);
      const entity = grid.get(loc);
      cells.push(
        <Cell
          key={`${row}-${col}`}
          row={row}
          col={col}
          entity={entity}
        />
      );
    }
  }

  return (
    <div
      className="grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
        gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
      }}
    >
      {cells}
    </div>
  );
}

export default GridComponent;
