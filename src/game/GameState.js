import { Grid } from '../engine/Grid.js';
import { Location } from '../engine/Location.js';
import { Wall } from '../entities/Wall.js';
import { Brick } from '../entities/Brick.js';
import { Bonus } from '../entities/Bonus.js';
import { BomberBug } from '../entities/BomberBug.js';
import { RandomBug } from '../entities/RandomBug.js';
import { Bomb } from '../entities/Bomb.js';
import { Fire } from '../entities/Fire.js';
import { soundManager } from './SoundManager.js';
import {
  GRID_ROWS,
  GRID_COLS,
  PLAYER_COLORS,
} from './constants.js';

/**
 * Manages overall game state and level generation.
 */
export class GameState {
  /**
   * @param {object} options
   * @param {number} options.playerCount - Number of players (1-4)
   * @param {number} options.level - Current difficulty level (1+)
   * @param {number} [options.rows] - Grid rows (default GRID_ROWS)
   * @param {number} [options.cols] - Grid cols (default GRID_COLS)
   */
  constructor({ playerCount = 2, level = 1, rows, cols } = {}) {
    this.playerCount = Math.max(1, Math.min(4, playerCount));
    this.level = Math.max(1, level);
    this.rows = rows ?? GRID_ROWS;
    this.cols = cols ?? GRID_COLS;

    // Ensure odd dimensions for wall pattern
    if (this.rows % 2 === 0) this.rows++;
    if (this.cols % 2 === 0) this.cols++;
    // Minimum 5x5
    this.rows = Math.max(5, this.rows);
    this.cols = Math.max(5, this.cols);

    this.grid = null;
    this.players = [];
    this.gameOver = false;
    this.winner = null;

    /** Callbacks for UI effects. Set by Game component. */
    this._onExplosion = null;
    this._onDeath = null;

    this.generateLevel();
  }

  /**
   * Returns spawn locations for corners.
   * P0=top-left, P1=bottom-right, P2=top-right, P3=bottom-left
   */
  getPlayerSpawnLocations() {
    return [
      new Location(0, 0),                           // P0: top-left
      new Location(this.rows - 1, this.cols - 1),   // P1: bottom-right
      new Location(0, this.cols - 1),                // P2: top-right
      new Location(this.rows - 1, 0),                // P3: bottom-left
    ];
  }

  /**
   * Returns locations that should NOT have bricks (spawn areas).
   * Each corner has 3 cells that must stay empty so players can escape.
   */
  getTabooLocations() {
    const r = this.rows - 1;
    const c = this.cols - 1;

    // Each spawn corner: the corner itself + 2 adjacent cells
    const allTaboo = [
      // P0: top-left
      new Location(0, 0), new Location(0, 1), new Location(1, 0),
      // P1: bottom-right
      new Location(r, c), new Location(r - 1, c), new Location(r, c - 1),
      // P2: top-right
      new Location(0, c), new Location(0, c - 1), new Location(1, c),
      // P3: bottom-left
      new Location(r, 0), new Location(r, 1), new Location(r - 1, 0),
    ];

    // Return taboo zones for the number of players in use
    // Always reserve all 4 corners to keep the grid symmetric
    return allTaboo;
  }

  /**
   * Generates a new level: walls, bricks, bonuses, players, enemies.
   */
  generateLevel() {
    this.grid = new Grid(this.rows, this.cols);
    this.players = [];
    this.gameOver = false;
    this.winner = null;

    // 1. Place Walls at every position where BOTH row AND col are odd
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (r % 2 === 1 && c % 2 === 1) {
          const wall = new Wall();
          wall.putSelfInGrid(this.grid, new Location(r, c));
        }
      }
    }

    // 2. Calculate taboo locations (set of "row,col" strings for fast lookup)
    const taboo = new Set(
      this.getTabooLocations().map(loc => `${loc.row},${loc.col}`)
    );

    // 3. Calculate brick count: (rows * cols) / 5 * sqrt(level)
    const brickCount = Math.floor(
      (this.rows * this.cols) / 5 * Math.sqrt(this.level)
    );

    // 4. Place Bricks randomly
    const bricks = [];
    let attempts = 0;
    const maxAttempts = this.rows * this.cols * 10; // safety limit
    while (bricks.length < brickCount && attempts < maxAttempts) {
      attempts++;
      const r = Math.floor(Math.random() * this.rows);
      const c = Math.floor(Math.random() * this.cols);

      // Must not be at a wall position (both odd)
      if (r % 2 === 1 && c % 2 === 1) continue;

      // Must not be in a taboo zone
      if (taboo.has(`${r},${c}`)) continue;

      // Must be empty
      const loc = new Location(r, c);
      if (this.grid.get(loc) !== null) continue;

      const brick = new Brick();
      brick.putSelfInGrid(this.grid, loc);
      bricks.push(brick);
    }

    // 5. Hide Bonuses in some Bricks
    // bonusCount = sqrt(rows * cols)
    // bonusTypes available = min(3, level - 1)  -- No bonuses on level 1
    const maxBonusTypes = Math.min(3, this.level - 1);
    if (maxBonusTypes > 0 && bricks.length > 0) {
      const bonusCount = Math.floor(Math.sqrt(this.rows * this.cols));
      const availableTypes = Bonus.TYPES.slice(0, maxBonusTypes);

      // Pick random bricks to hide bonuses in
      const shuffled = [...bricks].sort(() => Math.random() - 0.5);
      const count = Math.min(bonusCount, shuffled.length);
      for (let i = 0; i < count; i++) {
        const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        shuffled[i].setBonus(new Bonus(type));
      }
    }

    // 6. Spawn players in corners
    const spawnLocations = this.getPlayerSpawnLocations();
    for (let i = 0; i < this.playerCount; i++) {
      const player = new BomberBug({
        color: PLAYER_COLORS[i],
        playerIndex: i,
      });
      // Wire up death callback for death animations
      player._onDeath = (playerIndex, loc) => {
        if (typeof this._onDeath === 'function') {
          this._onDeath(playerIndex, loc);
        }
      };
      player.putSelfInGrid(this.grid, spawnLocations[i]);
      this.players.push(player);
    }

    // 7. Optionally spawn RandomBugs at higher levels (level 3+)
    if (this.level >= 3) {
      const bugCount = Math.floor(
        (this.level - 2) * Math.sqrt(Math.min(this.rows, this.cols))
      );
      for (let i = 0; i < bugCount; i++) {
        const loc = this._getRandomEmptyNonTaboo(taboo);
        if (loc) {
          const bug = new RandomBug();
          bug.putSelfInGrid(this.grid, loc);
        }
      }
    }
  }

  /**
   * Find a random empty location that is not in the taboo set.
   */
  _getRandomEmptyNonTaboo(tabooSet) {
    const empty = this.grid.getEmptyLocations().filter(
      loc => !tabooSet.has(`${loc.row},${loc.col}`)
    );
    if (empty.length === 0) return null;
    return empty[Math.floor(Math.random() * empty.length)];
  }

  /**
   * Check win condition after each tick.
   * Count living players (those still in the grid).
   * If 1 or fewer remain, game over.
   */
  checkWinCondition() {
    if (this.gameOver) return;

    const alive = this.players.filter(p => p.grid !== null);

    if (alive.length <= 1) {
      this.gameOver = true;
      this.winner = alive.length === 1 ? alive[0] : null; // null = draw
      soundManager.play('game_over');
    }
  }

  /**
   * Tick: call act() on all dynamic entities (Bombs, RandomBugs, etc.),
   * then check win condition.
   */
  tick() {
    if (this.gameOver) return;

    // Collect all entities that can act.
    // We snapshot the list before iterating since act() can modify the grid.
    const actors = this.grid.getOccupiedLocations()
      .map(loc => this.grid.get(loc))
      .filter(entity => entity !== null && typeof entity.act === 'function');

    // Only act on entities that have meaningful act() implementations
    // (Bombs, RandomBugs, BlockBugs — not Walls, Bricks, Bonuses, Fire, or BomberBugs)
    for (const actor of actors) {
      // Skip entities removed during this tick
      if (actor.grid === null) continue;
      if (actor instanceof Bomb) {
        // Attach explosion callback if not yet set
        if (!actor._onDetonate && typeof this._onExplosion === 'function') {
          actor._onDetonate = () => this._onExplosion();
        }
        actor.act();
      } else if (actor instanceof RandomBug) { // BlockBug extends RandomBug
        actor.act();
      }
    }

    this.checkWinCondition();
  }

  /**
   * Reset and start a new game with the same settings.
   */
  reset() {
    this.generateLevel();
  }
}
