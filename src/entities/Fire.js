import { Entity } from '../engine/Entity.js';
import { Location } from '../engine/Location.js';

/**
 * Temporary explosion effect that destroys bugs and bricks.
 */
export class Fire extends Entity {
  constructor(direction = Location.NORTH, stage = 1) {
    super({ color: 'orange', direction });
    this.stage = stage;
  }

  getImageSuffix() {
    return this.stage === 2 ? 'Middle' : '';
  }
}
