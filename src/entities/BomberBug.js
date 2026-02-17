import { Entity } from '../engine/Entity.js';
import { Location } from '../engine/Location.js';
import { Bomb } from './Bomb.js';
import { Bonus } from './Bonus.js';
import { Wall } from './Wall.js';
import { Brick } from './Brick.js';
import { Fire } from './Fire.js';
import { soundManager } from '../game/SoundManager.js';
import { BOMB_TIMER } from '../game/constants.js';

/**
 * Player-controlled character.
 */
export class BomberBug extends Entity {
  constructor({ color = 'red', playerIndex = 0 } = {}) {
    super({ color });
    this.playerIndex = playerIndex;
    this.maxBombs = 1;
    this.bombRadius = 2;
    this.hasSuperBomb = false;
    this.bombs = [];
    this._placeBombFlag = false;
    /** Callback invoked on death with (playerIndex, location). */
    this._onDeath = null;
  }

  /**
   * Move in the given direction if possible.
   * If placeBomb flag is set and move succeeds, places bomb at old location.
   */
  move(direction) {
    this.direction = direction;

    if (!this.grid) return;

    const dest = this.location.adjacentLocation(direction);

    // Check if destination is valid
    if (!this.grid.isValid(dest)) return;

    const occupant = this.grid.get(dest);

    // Check what's at destination — play wall/brick hit sounds
    if (occupant instanceof Wall) {
      soundManager.play('hit_wall');
      return;
    }
    if (occupant instanceof Brick) {
      soundManager.play('hit_brick');
      return;
    }
    if (occupant instanceof Bomb) return;
    if (occupant instanceof BomberBug) return;

    // Can move into: empty, Bonus, Fire, or other generic entities
    const oldLocation = this.location;

    // Collect bonus before moving (so it's removed before moveTo)
    let collectedBonus = null;
    if (occupant instanceof Bonus) {
      collectedBonus = occupant;
      occupant.removeSelfFromGrid();
    }

    // Move
    this.moveTo(dest);
    soundManager.play('bug_step');

    // Place bomb at old location if flag is set
    if (this._placeBombFlag) {
      const bomb = new Bomb(BOMB_TIMER, this.bombRadius);
      bomb.owner = this;
      bomb.isSuperBomb = this.hasSuperBomb;
      if (this.hasSuperBomb) {
        soundManager.play('watch_out_superbomb');
        this.hasSuperBomb = false;
      }
      bomb.putSelfInGrid(this.grid, oldLocation);
      this.bombs.push(bomb);
      this._placeBombFlag = false;
      soundManager.play('bomb_dropped');
    }

    // Apply collected bonus
    if (collectedBonus) {
      this.addBonus(collectedBonus);
      soundManager.play('bonus_gotten');
    }
  }

  /**
   * Queue a bomb to be placed on next successful move.
   * Returns true if bomb can be placed, false if at max.
   */
  placeBomb() {
    this.updateBombCount();
    if (this.bombs.length >= this.maxBombs) {
      return false;
    }
    this._placeBombFlag = true;
    return true;
  }

  /**
   * Apply a bonus power-up.
   */
  addBonus(bonus) {
    switch (bonus.type) {
      case Bonus.EXPAND_RADIUS:
        this.bombRadius++;
        break;
      case Bonus.ADD_BOMBS:
        this.maxBombs++;
        break;
      case Bonus.SUPER_BOMB:
        this.hasSuperBomb = true;
        break;
    }
  }

  /**
   * Remove bombs that are no longer in the grid from the tracking array.
   */
  updateBombCount() {
    this.bombs = this.bombs.filter(bomb => bomb.grid !== null);
  }

  /**
   * Remove bug from grid (death).
   */
  removeSelfFromGrid() {
    const loc = this.location; // capture before super clears it
    soundManager.play('dead_bug');

    // Notify listeners for death animation
    if (typeof this._onDeath === 'function') {
      this._onDeath(this.playerIndex, loc);
    }

    super.removeSelfFromGrid();
  }
}
