import { RandomBug } from './RandomBug.js';
import { Brick } from './Brick.js';
import { Wall } from './Wall.js';
import { Entity } from '../engine/Entity.js';

/**
 * AI enemy that leaves brick/wall trails behind when moving.
 * When killed, all blocks it placed are destroyed.
 */
export class BlockBug extends RandomBug {
  constructor(moveInterval = null) {
    super(moveInterval);
    this.color = 'purple';
    this.placedBlocks = [];
  }

  /**
   * Override _moveRandomly to leave a block behind at the old location.
   */
  _moveRandomly() {
    if (!this.grid) return;

    const directions = [
      { dir: 0, name: 'NORTH' },
      { dir: 90, name: 'EAST' },
      { dir: 180, name: 'SOUTH' },
      { dir: 270, name: 'WEST' },
    ].map(d => d.dir);

    // Shuffle directions
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }

    for (const dir of directions) {
      if (this._canMove(dir)) {
        const oldLoc = this.location;
        const grid = this.grid;
        this.direction = dir;
        const dest = this.location.adjacentLocation(dir);
        this.moveTo(dest);

        // Leave a brick or wall behind (75% brick, 25% wall)
        const block = Math.random() > 0.25 ? new Brick() : new Wall();
        block.putSelfInGrid(grid, oldLoc);
        this.placedBlocks.push(block);
        return;
      }
    }
  }

  /**
   * Override: when killed, remove all blocks this bug placed.
   */
  removeSelfFromGrid() {
    // Remove all placed blocks first
    for (const block of this.placedBlocks) {
      if (block.grid !== null) {
        // Use Entity's removeSelfFromGrid to force-remove even Walls
        Entity.prototype.removeSelfFromGrid.call(block);
      }
    }
    this.placedBlocks = [];

    // Remove self
    super.removeSelfFromGrid();
  }
}
