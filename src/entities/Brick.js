import { Entity } from '../engine/Entity.js';
import { soundManager } from '../game/SoundManager.js';

/**
 * Destructible obstacle that may contain a hidden bonus.
 */
export class Brick extends Entity {
  constructor() {
    super({ color: 'brown' });
    this.bonus = null;
  }

  setBonus(bonus) {
    this.bonus = bonus;
  }

  getBonus() {
    return this.bonus;
  }

  /**
   * Override: when destroyed, spawn the hidden bonus (if any) at the same location.
   */
  removeSelfFromGrid() {
    if (this.grid === null) {
      throw new Error('Entity is not in a grid.');
    }

    const grid = this.grid;
    const loc = this.location;
    const bonus = this.bonus;

    // Remove brick from grid
    grid.remove(loc);
    this.grid = null;
    this.location = null;

    // Spawn bonus at the same location
    if (bonus !== null) {
      bonus.putSelfInGrid(grid, loc);
      soundManager.play('bonus_revealed');
    }
  }
}
