import { Entity } from '../engine/Entity.js';
import { Location } from '../engine/Location.js';
import { Fire } from './Fire.js';
import { Wall } from './Wall.js';
import { Brick } from './Brick.js';
import { soundManager } from '../game/SoundManager.js';

/**
 * Timed explosive placed by players.
 */
export class Bomb extends Entity {
  constructor(timer = 10, radius = 2) {
    super({ color: 'black' });
    this.timer = timer;
    this.radius = radius;
    this.isSuperBomb = false;
    this.exploding = false;
    this.fire = [];
    this.owner = null;
  }

  getImageSuffix() {
    if (this.exploding) return 'CentralFire';
    if (this.isSuperBomb) return 'SuperBomb';
    // Map timer ticks to visual stages: 3, 2, 1 (each ~1 second)
    if (this.timer <= 3) return '1';
    if (this.timer <= 6) return '2';
    if (this.timer <= 9) return '3';
    return '';
  }

  act() {
    if (this.exploding) {
      this._cleanup();
      return;
    }

    this.timer--;

    // Countdown sound effects at ~1 second intervals
    if (this.timer === 9) soundManager.play('countdown3');
    else if (this.timer === 6) soundManager.play('countdown2');
    else if (this.timer === 3) soundManager.play('countdown1');

    if (this.timer <= 0) {
      this.detonate();
    }
  }

  /**
   * Trigger immediate explosion.
   */
  detonate() {
    if (this.exploding) return;
    this.exploding = true;

    soundManager.play('fireball');

    // Notify listeners (used for screen shake, etc.)
    if (typeof this._onDetonate === 'function') {
      this._onDetonate(this);
    }

    const directions = [Location.NORTH, Location.EAST, Location.SOUTH, Location.WEST];
    for (const dir of directions) {
      this._explodeDirection(dir);
    }
  }

  /**
   * Spread fire in one direction up to radius cells.
   */
  _explodeDirection(direction) {
    const grid = this.grid;
    let currentLoc = this.location;

    for (let i = 1; i <= this.radius; i++) {
      const nextLoc = currentLoc.adjacentLocation(direction);

      if (!grid.isValid(nextLoc)) break;

      const occupant = grid.get(nextLoc);

      if (occupant instanceof Wall) {
        // Wall: stop, don't place fire
        break;
      }

      if (occupant instanceof Brick) {
        // Brick: destroy it (which may spawn bonus)
        occupant.removeSelfFromGrid();

        // If bonus was spawned, don't replace it with fire
        const newOccupant = grid.get(nextLoc);
        if (newOccupant === null) {
          const isLeading = true; // fire stops at brick
          const fire = new Fire(direction, isLeading ? 1 : 2);
          fire.putSelfInGrid(grid, nextLoc);
          this.fire.push(nextLoc);
        }

        if (!this.isSuperBomb) break;
        // Super bomb continues through bricks
        currentLoc = nextLoc;
        continue;
      }

      if (occupant instanceof Bomb && occupant !== this) {
        // Chain detonate other bombs
        occupant.detonate();
        currentLoc = nextLoc;
        continue;
      }

      // If there's another entity (bug, etc.), remove it
      if (occupant !== null && !(occupant instanceof Fire)) {
        occupant.removeSelfFromGrid();
      }

      // Place fire
      const isLeading = i === this.radius;
      const stage = isLeading ? 1 : 2;
      const fire = new Fire(direction, stage);
      fire.putSelfInGrid(grid, nextLoc);
      this.fire.push(nextLoc);

      currentLoc = nextLoc;
    }
  }

  /**
   * Remove all fire and the bomb itself from the grid.
   */
  _cleanup() {
    const grid = this.grid;
    if (!grid) return;

    // Remove all fire
    for (const loc of this.fire) {
      const entity = grid.get(loc);
      if (entity instanceof Fire) {
        // Use Entity's removeSelfFromGrid directly
        Entity.prototype.removeSelfFromGrid.call(entity);
      }
    }
    this.fire = [];

    // Remove bomb itself
    if (this.grid) {
      Entity.prototype.removeSelfFromGrid.call(this);
    }
  }
}
