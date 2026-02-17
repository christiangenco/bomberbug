import { Entity } from '../engine/Entity.js';

/**
 * Indestructible obstacle. Cannot be destroyed or removed from the grid.
 */
export class Wall extends Entity {
  constructor() {
    super({ color: 'gray' });
  }

  /**
   * Override: do nothing. Walls are indestructible.
   */
  removeSelfFromGrid() {
    // No-op — walls cannot be removed
  }
}
