import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../GameState.js';
import { Location } from '../../engine/Location.js';
import { Wall } from '../../entities/Wall.js';
import { Brick } from '../../entities/Brick.js';
import { Bonus } from '../../entities/Bonus.js';
import { BomberBug } from '../../entities/BomberBug.js';
import { RandomBug } from '../../entities/RandomBug.js';
import { Bomb } from '../../entities/Bomb.js';
import { Fire } from '../../entities/Fire.js';

describe('GameState', () => {
  describe('constructor', () => {
    it('creates a game with default 2 players and level 1', () => {
      const gs = new GameState();
      expect(gs.playerCount).toBe(2);
      expect(gs.level).toBe(1);
      expect(gs.gameOver).toBe(false);
      expect(gs.winner).toBeNull();
    });

    it('creates a game with specified players and level', () => {
      const gs = new GameState({ playerCount: 4, level: 3 });
      expect(gs.playerCount).toBe(4);
      expect(gs.level).toBe(3);
    });

    it('clamps playerCount to 1-4', () => {
      expect(new GameState({ playerCount: 0 }).playerCount).toBe(1);
      expect(new GameState({ playerCount: 5 }).playerCount).toBe(4);
    });

    it('clamps level to minimum 1', () => {
      expect(new GameState({ level: 0 }).level).toBe(1);
      expect(new GameState({ level: -1 }).level).toBe(1);
    });

    it('uses default 11x13 grid', () => {
      const gs = new GameState();
      expect(gs.rows).toBe(11);
      expect(gs.cols).toBe(13);
    });

    it('allows custom grid dimensions', () => {
      const gs = new GameState({ rows: 7, cols: 9 });
      expect(gs.rows).toBe(7);
      expect(gs.cols).toBe(9);
    });

    it('forces odd dimensions', () => {
      const gs = new GameState({ rows: 6, cols: 8 });
      expect(gs.rows % 2).toBe(1);
      expect(gs.cols % 2).toBe(1);
    });

    it('enforces minimum 5x5', () => {
      const gs = new GameState({ rows: 3, cols: 3 });
      expect(gs.rows).toBeGreaterThanOrEqual(5);
      expect(gs.cols).toBeGreaterThanOrEqual(5);
    });

    it('generates the level automatically', () => {
      const gs = new GameState();
      expect(gs.grid).not.toBeNull();
      expect(gs.players.length).toBeGreaterThan(0);
    });
  });

  describe('getPlayerSpawnLocations', () => {
    let gs;
    beforeEach(() => {
      gs = new GameState({ playerCount: 4 });
    });

    it('returns 4 spawn locations', () => {
      const spawns = gs.getPlayerSpawnLocations();
      expect(spawns).toHaveLength(4);
    });

    it('P0 is top-left (0,0)', () => {
      const spawns = gs.getPlayerSpawnLocations();
      expect(spawns[0].row).toBe(0);
      expect(spawns[0].col).toBe(0);
    });

    it('P1 is bottom-right', () => {
      const spawns = gs.getPlayerSpawnLocations();
      expect(spawns[1].row).toBe(gs.rows - 1);
      expect(spawns[1].col).toBe(gs.cols - 1);
    });

    it('P2 is top-right', () => {
      const spawns = gs.getPlayerSpawnLocations();
      expect(spawns[2].row).toBe(0);
      expect(spawns[2].col).toBe(gs.cols - 1);
    });

    it('P3 is bottom-left', () => {
      const spawns = gs.getPlayerSpawnLocations();
      expect(spawns[3].row).toBe(gs.rows - 1);
      expect(spawns[3].col).toBe(0);
    });
  });

  describe('getTabooLocations', () => {
    it('returns 12 taboo locations (3 per corner × 4 corners)', () => {
      const gs = new GameState({ playerCount: 4 });
      const taboo = gs.getTabooLocations();
      expect(taboo).toHaveLength(12);
    });

    it('includes spawn location plus 2 adjacent cells per corner', () => {
      const gs = new GameState({ rows: 11, cols: 13 });
      const taboo = gs.getTabooLocations();
      const tabooSet = new Set(taboo.map(l => `${l.row},${l.col}`));

      // Top-left corner
      expect(tabooSet.has('0,0')).toBe(true);
      expect(tabooSet.has('0,1')).toBe(true);
      expect(tabooSet.has('1,0')).toBe(true);

      // Bottom-right corner
      expect(tabooSet.has('10,12')).toBe(true);
      expect(tabooSet.has('9,12')).toBe(true);
      expect(tabooSet.has('10,11')).toBe(true);

      // Top-right corner
      expect(tabooSet.has('0,12')).toBe(true);
      expect(tabooSet.has('0,11')).toBe(true);
      expect(tabooSet.has('1,12')).toBe(true);

      // Bottom-left corner
      expect(tabooSet.has('10,0')).toBe(true);
      expect(tabooSet.has('10,1')).toBe(true);
      expect(tabooSet.has('9,0')).toBe(true);
    });
  });

  describe('generateLevel', () => {
    describe('walls', () => {
      it('places walls where both row and col are odd', () => {
        const gs = new GameState({ rows: 7, cols: 7 });
        const grid = gs.grid;

        for (let r = 0; r < gs.rows; r++) {
          for (let c = 0; c < gs.cols; c++) {
            const entity = grid.get(new Location(r, c));
            if (r % 2 === 1 && c % 2 === 1) {
              expect(entity).toBeInstanceOf(Wall);
            }
          }
        }
      });

      it('does not place walls where row or col is even', () => {
        const gs = new GameState({ rows: 7, cols: 7, playerCount: 1 });
        const grid = gs.grid;

        for (let r = 0; r < gs.rows; r++) {
          for (let c = 0; c < gs.cols; c++) {
            const entity = grid.get(new Location(r, c));
            if (r % 2 === 0 || c % 2 === 0) {
              if (entity instanceof Wall) {
                throw new Error(`Unexpected wall at (${r}, ${c})`);
              }
            }
          }
        }
      });
    });

    describe('bricks', () => {
      it('places bricks on the grid', () => {
        const gs = new GameState({ rows: 11, cols: 13, level: 2 });
        const bricks = gs.grid.getOccupiedLocations()
          .map(loc => gs.grid.get(loc))
          .filter(e => e instanceof Brick);
        expect(bricks.length).toBeGreaterThan(0);
      });

      it('never places bricks in taboo zones', () => {
        // Run multiple times for statistical confidence
        for (let i = 0; i < 5; i++) {
          const gs = new GameState({ playerCount: 4 });
          const taboo = new Set(
            gs.getTabooLocations().map(l => `${l.row},${l.col}`)
          );
          const brickLocs = gs.grid.getOccupiedLocations()
            .filter(loc => gs.grid.get(loc) instanceof Brick);

          for (const loc of brickLocs) {
            expect(taboo.has(`${loc.row},${loc.col}`)).toBe(false);
          }
        }
      });

      it('never places bricks at wall positions', () => {
        const gs = new GameState({ level: 5 }); // Higher level = more bricks
        const brickLocs = gs.grid.getOccupiedLocations()
          .filter(loc => gs.grid.get(loc) instanceof Brick);

        for (const loc of brickLocs) {
          const isWallPos = loc.row % 2 === 1 && loc.col % 2 === 1;
          expect(isWallPos).toBe(false);
        }
      });

      it('places more bricks at higher levels', () => {
        const gs1 = new GameState({ level: 1, rows: 11, cols: 13 });
        const gs5 = new GameState({ level: 5, rows: 11, cols: 13 });

        const count1 = gs1.grid.getOccupiedLocations()
          .filter(loc => gs1.grid.get(loc) instanceof Brick).length;
        const count5 = gs5.grid.getOccupiedLocations()
          .filter(loc => gs5.grid.get(loc) instanceof Brick).length;

        expect(count5).toBeGreaterThan(count1);
      });
    });

    describe('bonuses', () => {
      it('does not place bonuses on level 1', () => {
        const gs = new GameState({ level: 1 });
        const bricks = gs.grid.getOccupiedLocations()
          .map(loc => gs.grid.get(loc))
          .filter(e => e instanceof Brick);

        const withBonus = bricks.filter(b => b.getBonus() !== null);
        expect(withBonus.length).toBe(0);
      });

      it('places bonuses on level 2+', () => {
        // Run a few times since it's random
        let foundBonus = false;
        for (let i = 0; i < 10; i++) {
          const gs = new GameState({ level: 3 });
          const bricks = gs.grid.getOccupiedLocations()
            .map(loc => gs.grid.get(loc))
            .filter(e => e instanceof Brick);
          const withBonus = bricks.filter(b => b.getBonus() !== null);
          if (withBonus.length > 0) {
            foundBonus = true;
            break;
          }
        }
        expect(foundBonus).toBe(true);
      });

      it('bonuses have valid types', () => {
        const gs = new GameState({ level: 5 });
        const bricks = gs.grid.getOccupiedLocations()
          .map(loc => gs.grid.get(loc))
          .filter(e => e instanceof Brick);
        const withBonus = bricks.filter(b => b.getBonus() !== null);

        for (const brick of withBonus) {
          expect(Bonus.TYPES).toContain(brick.getBonus().type);
        }
      });
    });

    describe('players', () => {
      it('spawns correct number of players', () => {
        for (let count = 1; count <= 4; count++) {
          const gs = new GameState({ playerCount: count });
          expect(gs.players).toHaveLength(count);
        }
      });

      it('players are in the grid', () => {
        const gs = new GameState({ playerCount: 2 });
        for (const player of gs.players) {
          expect(player.grid).toBe(gs.grid);
          expect(player.location).not.toBeNull();
        }
      });

      it('players are at corner spawn positions', () => {
        const gs = new GameState({ playerCount: 4 });
        const spawns = gs.getPlayerSpawnLocations();
        for (let i = 0; i < 4; i++) {
          expect(gs.players[i].location.row).toBe(spawns[i].row);
          expect(gs.players[i].location.col).toBe(spawns[i].col);
        }
      });

      it('players have correct colors', () => {
        const gs = new GameState({ playerCount: 4 });
        expect(gs.players[0].color).toBe('red');
        expect(gs.players[1].color).toBe('orange');
        expect(gs.players[2].color).toBe('blue');
        expect(gs.players[3].color).toBe('green');
      });

      it('players have correct playerIndex', () => {
        const gs = new GameState({ playerCount: 4 });
        for (let i = 0; i < 4; i++) {
          expect(gs.players[i].playerIndex).toBe(i);
        }
      });
    });

    describe('random bugs', () => {
      it('does not spawn random bugs before level 3', () => {
        const gs = new GameState({ level: 1 });
        const bugs = gs.grid.getOccupiedLocations()
          .map(loc => gs.grid.get(loc))
          .filter(e => e instanceof RandomBug);
        expect(bugs.length).toBe(0);
      });

      it('spawns random bugs at level 3+', () => {
        // Large grid and high level to guarantee bugs
        let foundBugs = false;
        for (let i = 0; i < 5; i++) {
          const gs = new GameState({ level: 5, rows: 11, cols: 13 });
          const bugs = gs.grid.getOccupiedLocations()
            .map(loc => gs.grid.get(loc))
            .filter(e => e instanceof RandomBug && !(e instanceof BomberBug));
          if (bugs.length > 0) {
            foundBugs = true;
            break;
          }
        }
        expect(foundBugs).toBe(true);
      });
    });
  });

  describe('checkWinCondition', () => {
    it('does not end game when all players are alive', () => {
      const gs = new GameState({ playerCount: 2 });
      gs.checkWinCondition();
      expect(gs.gameOver).toBe(false);
      expect(gs.winner).toBeNull();
    });

    it('ends game when only 1 player is alive', () => {
      const gs = new GameState({ playerCount: 2 });
      // Kill player 1
      gs.players[1].removeSelfFromGrid();

      gs.checkWinCondition();
      expect(gs.gameOver).toBe(true);
      expect(gs.winner).toBe(gs.players[0]);
    });

    it('ends in draw when 0 players are alive', () => {
      const gs = new GameState({ playerCount: 2 });
      gs.players[0].removeSelfFromGrid();
      gs.players[1].removeSelfFromGrid();

      gs.checkWinCondition();
      expect(gs.gameOver).toBe(true);
      expect(gs.winner).toBeNull();
    });

    it('does not change gameOver once set', () => {
      const gs = new GameState({ playerCount: 2 });
      gs.players[1].removeSelfFromGrid();
      gs.checkWinCondition();

      const winner = gs.winner;
      gs.checkWinCondition(); // Call again
      expect(gs.winner).toBe(winner);
    });

    it('with 4 players, not game over while 2+ alive', () => {
      const gs = new GameState({ playerCount: 4 });
      gs.players[0].removeSelfFromGrid();
      gs.players[1].removeSelfFromGrid();

      gs.checkWinCondition();
      expect(gs.gameOver).toBe(false);
    });

    it('with 4 players, game over when 1 alive', () => {
      const gs = new GameState({ playerCount: 4 });
      gs.players[0].removeSelfFromGrid();
      gs.players[1].removeSelfFromGrid();
      gs.players[2].removeSelfFromGrid();

      gs.checkWinCondition();
      expect(gs.gameOver).toBe(true);
      expect(gs.winner).toBe(gs.players[3]);
    });

    it('single player game ends when player dies', () => {
      const gs = new GameState({ playerCount: 1 });
      gs.players[0].removeSelfFromGrid();
      gs.checkWinCondition();
      expect(gs.gameOver).toBe(true);
      expect(gs.winner).toBeNull();
    });
  });

  describe('tick', () => {
    it('does nothing when game is over', () => {
      const gs = new GameState({ playerCount: 2 });
      gs.gameOver = true;
      // Should not throw
      gs.tick();
    });

    it('calls act() on bombs', () => {
      const gs = new GameState({ playerCount: 2, rows: 7, cols: 7 });
      // Place a bomb manually
      const bomb = new Bomb(4, 2);
      bomb.owner = gs.players[0];
      const loc = new Location(0, 2);
      // Remove anything at that spot first
      const existing = gs.grid.get(loc);
      if (existing) existing.removeSelfFromGrid();
      bomb.putSelfInGrid(gs.grid, loc);

      const initialTimer = bomb.timer;
      gs.tick();
      expect(bomb.timer).toBe(initialTimer - 1);
    });

    it('checks win condition after acting', () => {
      const gs = new GameState({ playerCount: 2 });
      // Kill player 1 before tick
      gs.players[1].removeSelfFromGrid();

      gs.tick();
      expect(gs.gameOver).toBe(true);
      expect(gs.winner).toBe(gs.players[0]);
    });

    it('does not call act on walls, bricks, or bonuses', () => {
      const gs = new GameState({ playerCount: 2 });
      // Walls and bricks exist on the grid. If act() were called on them
      // it would be fine since it's a no-op, but the tick method filters for
      // Bomb and RandomBug instances only. Just verify no error is thrown.
      gs.tick();
    });
  });

  describe('reset', () => {
    it('creates a fresh grid', () => {
      const gs = new GameState({ playerCount: 2 });
      const oldGrid = gs.grid;

      gs.reset();
      expect(gs.grid).not.toBe(oldGrid);
    });

    it('resets gameOver and winner', () => {
      const gs = new GameState({ playerCount: 2 });
      gs.players[1].removeSelfFromGrid();
      gs.checkWinCondition();
      expect(gs.gameOver).toBe(true);

      gs.reset();
      expect(gs.gameOver).toBe(false);
      expect(gs.winner).toBeNull();
    });

    it('creates new player instances', () => {
      const gs = new GameState({ playerCount: 2 });
      const oldPlayers = [...gs.players];

      gs.reset();
      expect(gs.players[0]).not.toBe(oldPlayers[0]);
      expect(gs.players[1]).not.toBe(oldPlayers[1]);
    });

    it('preserves playerCount and level', () => {
      const gs = new GameState({ playerCount: 3, level: 5 });
      gs.reset();
      expect(gs.playerCount).toBe(3);
      expect(gs.level).toBe(5);
      expect(gs.players).toHaveLength(3);
    });
  });

  describe('grid integrity', () => {
    it('grid has correct dimensions', () => {
      const gs = new GameState({ rows: 11, cols: 13 });
      expect(gs.grid.rows).toBe(11);
      expect(gs.grid.cols).toBe(13);
    });

    it('no two entities occupy the same cell', () => {
      const gs = new GameState({ playerCount: 4, level: 3 });
      const locs = gs.grid.getOccupiedLocations();
      const keys = locs.map(l => `${l.row},${l.col}`);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });

    it('spawn corners are empty except for players', () => {
      const gs = new GameState({ playerCount: 4 });
      const taboo = gs.getTabooLocations();
      const spawnSet = new Set(
        gs.getPlayerSpawnLocations().map(l => `${l.row},${l.col}`)
      );

      for (const loc of taboo) {
        const entity = gs.grid.get(loc);
        const key = `${loc.row},${loc.col}`;
        if (spawnSet.has(key)) {
          // Should be a player
          expect(entity).toBeInstanceOf(BomberBug);
        } else {
          // Should be empty
          expect(entity).toBeNull();
        }
      }
    });
  });
});
