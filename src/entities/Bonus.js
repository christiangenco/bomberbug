import { Entity } from '../engine/Entity.js';

/**
 * Power-up that enhances player abilities.
 */
export class Bonus extends Entity {
  static EXPAND_RADIUS = 'ExpandBombRadius';
  static ADD_BOMBS = 'AddMoreBombs';
  static SUPER_BOMB = 'SuperBomb';
  static TYPES = [Bonus.EXPAND_RADIUS, Bonus.ADD_BOMBS, Bonus.SUPER_BOMB];

  constructor(type = '') {
    super({ color: 'yellow' });
    this.type = type;
  }

  getImageSuffix() {
    return this.type;
  }
}
