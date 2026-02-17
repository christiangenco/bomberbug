import { Entity } from '../engine/Entity.js';
import { Location } from '../engine/Location.js';
import { Wall } from './Wall.js';
import { Brick } from './Brick.js';
import { Bomb } from './Bomb.js';
import { Fire } from './Fire.js';

/**
 * AI-controlled enemy that moves randomly every N ticks.
 */
export class RandomBug extends Entity {
  constructor(moveInterval = null) {
    super({ color: 'green' });
    // Random interval between 20 and 70 if not specified
    this.moveInterval = moveInterval ?? (20 + Math.floor(Math.random() * 51));
    this.stepCounter = 0;
  }

  act() {
    this.stepCounter++;
    if (this.stepCounter >= this.moveInterval) {
      this.stepCounter = 0;
      this._moveRandomly();
    }
  }

  /**
   * Try to move in a random direction. If blocked, try turning.
   */
  _moveRandomly() {
    if (!this.grid) return;

    const directions = [Location.NORTH, Location.EAST, Location.SOUTH, Location.WEST];
    // Shuffle directions
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }

    for (const dir of directions) {
      if (this._canMove(dir)) {
        this.direction = dir;
        const dest = this.location.adjacentLocation(dir);
        this.moveTo(dest);
        return;
      }
    }
  }

  /**
   * Check if the bug can move in the given direction.
   */
  _canMove(direction) {
    if (!this.grid) return false;

    const dest = this.location.adjacentLocation(direction);
    if (!this.grid.isValid(dest)) return false;

    const occupant = this.grid.get(dest);
    if (occupant === null) return true;
    if (occupant instanceof Fire) return true; // Will die, but can move

    // Blocked by walls, bricks, bombs, other entities
    return false;
  }
}
