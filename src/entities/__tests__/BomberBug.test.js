import { describe, it, expect } from 'vitest';
import { BomberBug } from '../BomberBug.js';
import { Bomb } from '../Bomb.js';
import { Bonus } from '../Bonus.js';
import { Wall } from '../Wall.js';
import { Brick } from '../Brick.js';
import { Fire } from '../Fire.js';
import { Grid } from '../../engine/Grid.js';
import { Location } from '../../engine/Location.js';
import { Entity } from '../../engine/Entity.js';

describe('BomberBug', () => {
  describe('constructor', () => {
    it('has default properties', () => {
      const bug = new BomberBug();
      expect(bug.maxBombs).toBe(1);
      expect(bug.bombRadius).toBe(2);
      expect(bug.hasSuperBomb).toBe(false);
      expect(bug.bombs).toEqual([]);
      expect(bug.color).toBe('red');
      expect(bug.playerIndex).toBe(0);
    });

    it('accepts custom color and player index', () => {
      const bug = new BomberBug({ color: 'blue', playerIndex: 1 });
      expect(bug.color).toBe('blue');
      expect(bug.playerIndex).toBe(1);
    });
  });

  describe('move()', () => {
    it('moves to empty adjacent cell', () => {
      const grid = new Grid(5, 5);
      const bug = new BomberBug();
      bug.putSelfInGrid(grid, new Location(2, 2));

      bug.move(Location.NORTH);

      expect(bug.location.equals(new Location(1, 2))).toBe(true);
      expect(bug.direction).toBe(Location.NORTH);
    });

    it('is blocked by walls', () => {
      const grid = new Grid(5, 5);
      const bug = new BomberBug();
      bug.putSelfInGrid(grid, new Location(2, 2));

      const wall = new Wall();
      wall.putSelfInGrid(grid, new Location(1, 2));

      bug.move(Location.NORTH);

      expect(bug.location.equals(new Location(2, 2))).toBe(true);
    });

    it('is blocked by bricks', () => {
      const grid = new Grid(5, 5);
      const bug = new BomberBug();
      bug.putSelfInGrid(grid, new Location(2, 2));

      const brick = new Brick();
      brick.putSelfInGrid(grid, new Location(1, 2));

      bug.move(Location.NORTH);

      expect(bug.location.equals(new Location(2, 2))).toBe(true);
    });

    it('is blocked by bombs', () => {
      const grid = new Grid(5, 5);
      const bug = new BomberBug();
      bug.putSelfInGrid(grid, new Location(2, 2));

      const bomb = new Bomb();
      bomb.putSelfInGrid(grid, new Location(1, 2));

      bug.move(Location.NORTH);

      expect(bug.location.equals(new Location(2, 2))).toBe(true);
    });

    it('is blocked by other bugs', () => {
      const grid = new Grid(5, 5);
      const bug1 = new BomberBug();
      bug1.putSelfInGrid(grid, new Location(2, 2));

      const bug2 = new BomberBug({ color: 'blue' });
      bug2.putSelfInGrid(grid, new Location(1, 2));

      bug1.move(Location.NORTH);

      expect(bug1.location.equals(new Location(2, 2))).toBe(true);
    });

    it('is blocked at grid edges', () => {
      const grid = new Grid(5, 5);
      const bug = new BomberBug();
      bug.putSelfInGrid(grid, new Location(0, 0));

      bug.move(Location.NORTH);

      expect(bug.location.equals(new Location(0, 0))).toBe(true);
    });

    it('collects bonuses', () => {
      const grid = new Grid(5, 5);
      const bug = new BomberBug();
      bug.putSelfInGrid(grid, new Location(2, 2));

      const bonus = new Bonus(Bonus.EXPAND_RADIUS);
      bonus.putSelfInGrid(grid, new Location(1, 2));

      bug.move(Location.NORTH);

      expect(bug.location.equals(new Location(1, 2))).toBe(true);
      expect(bug.bombRadius).toBe(3); // Expanded
    });

    it('can walk into fire (fire removed, bug survives)', () => {
      const grid = new Grid(5, 5);
      const bug = new BomberBug();
      bug.putSelfInGrid(grid, new Location(2, 2));

      const fire = new Fire(Location.NORTH);
      fire.putSelfInGrid(grid, new Location(1, 2));

      bug.move(Location.NORTH);

      expect(bug.location.equals(new Location(1, 2))).toBe(true);
      expect(bug.grid).toBe(grid); // Bug survives
    });

    it('updates direction even when blocked', () => {
      const grid = new Grid(5, 5);
      const bug = new BomberBug();
      bug.putSelfInGrid(grid, new Location(0, 0));

      bug.move(Location.WEST); // Blocked by edge
      expect(bug.direction).toBe(Location.WEST);
    });
  });

  describe('bomb placement', () => {
    it('placeBomb() sets flag and returns true', () => {
      const bug = new BomberBug();
      const result = bug.placeBomb();
      expect(result).toBe(true);
    });

    it('placeBomb() returns false when at max bombs', () => {
      const grid = new Grid(5, 5);
      const bug = new BomberBug();
      bug.putSelfInGrid(grid, new Location(2, 2));

      // Place one bomb
      bug.placeBomb();
      bug.move(Location.NORTH); // Places bomb at (2,2)

      // Try to place another (maxBombs = 1)
      const result = bug.placeBomb();
      expect(result).toBe(false);
    });

    it('bomb is placed at OLD location after move', () => {
      const grid = new Grid(5, 5);
      const bug = new BomberBug();
      bug.putSelfInGrid(grid, new Location(2, 2));

      bug.placeBomb();
      bug.move(Location.NORTH);

      // Bug moved to (1,2), bomb at old location (2,2)
      expect(bug.location.equals(new Location(1, 2))).toBe(true);
      const bomb = grid.get(new Location(2, 2));
      expect(bomb).toBeInstanceOf(Bomb);
    });

    it('bomb has correct radius', () => {
      const grid = new Grid(5, 5);
      const bug = new BomberBug();
      bug.bombRadius = 3;
      bug.putSelfInGrid(grid, new Location(2, 2));

      bug.placeBomb();
      bug.move(Location.NORTH);

      const bomb = grid.get(new Location(2, 2));
      expect(bomb.radius).toBe(3);
    });

    it('bomb is tracked in bombs array', () => {
      const grid = new Grid(5, 5);
      const bug = new BomberBug();
      bug.putSelfInGrid(grid, new Location(2, 2));

      bug.placeBomb();
      bug.move(Location.NORTH);

      expect(bug.bombs.length).toBe(1);
      expect(bug.bombs[0]).toBeInstanceOf(Bomb);
    });

    it('bomb flag resets after placement', () => {
      const grid = new Grid(5, 5);
      const bug = new BomberBug();
      bug.putSelfInGrid(grid, new Location(2, 2));

      bug.placeBomb();
      bug.move(Location.NORTH);

      // Move again - no bomb should be placed
      bug.move(Location.EAST);
      expect(grid.get(new Location(1, 2))).toBeNull(); // No bomb at previous loc
    });

    it('no bomb placed if move is blocked', () => {
      const grid = new Grid(5, 5);
      const bug = new BomberBug();
      bug.putSelfInGrid(grid, new Location(2, 2));

      const wall = new Wall();
      wall.putSelfInGrid(grid, new Location(1, 2));

      bug.placeBomb();
      bug.move(Location.NORTH); // Blocked by wall

      // No bomb placed since bug didn't move
      expect(bug.bombs.length).toBe(0);
      // Flag should still be set (will place on next successful move)
    });

    it('bomb owner is set to the bug', () => {
      const grid = new Grid(5, 5);
      const bug = new BomberBug();
      bug.putSelfInGrid(grid, new Location(2, 2));

      bug.placeBomb();
      bug.move(Location.NORTH);

      expect(bug.bombs[0].owner).toBe(bug);
    });
  });

  describe('super bomb', () => {
    it('super bomb flag applies to next bomb and resets', () => {
      const grid = new Grid(7, 7);
      const bug = new BomberBug();
      bug.maxBombs = 3;
      bug.hasSuperBomb = true;
      bug.putSelfInGrid(grid, new Location(3, 3));

      bug.placeBomb();
      bug.move(Location.NORTH);

      const bomb1 = grid.get(new Location(3, 3));
      expect(bomb1.isSuperBomb).toBe(true);
      expect(bug.hasSuperBomb).toBe(false);

      // Next bomb should not be super
      bug.placeBomb();
      bug.move(Location.NORTH);

      const bomb2 = grid.get(new Location(2, 3));
      expect(bomb2.isSuperBomb).toBe(false);
    });
  });

  describe('addBonus()', () => {
    it('ExpandBombRadius increases radius', () => {
      const bug = new BomberBug();
      const bonus = new Bonus(Bonus.EXPAND_RADIUS);
      bug.addBonus(bonus);
      expect(bug.bombRadius).toBe(3);
    });

    it('AddMoreBombs increases max bombs', () => {
      const bug = new BomberBug();
      const bonus = new Bonus(Bonus.ADD_BOMBS);
      bug.addBonus(bonus);
      expect(bug.maxBombs).toBe(2);
    });

    it('SuperBomb sets flag', () => {
      const bug = new BomberBug();
      const bonus = new Bonus(Bonus.SUPER_BOMB);
      bug.addBonus(bonus);
      expect(bug.hasSuperBomb).toBe(true);
    });
  });

  describe('updateBombCount()', () => {
    it('removes bombs no longer in grid', () => {
      const grid = new Grid(7, 7);
      const bug = new BomberBug();
      bug.maxBombs = 3;
      bug.putSelfInGrid(grid, new Location(3, 3));

      // Place a bomb
      bug.placeBomb();
      bug.move(Location.NORTH);
      expect(bug.bombs.length).toBe(1);

      // Simulate bomb exploding and being removed
      const bomb = bug.bombs[0];
      bomb.detonate();
      bomb.act(); // Cleanup - removes bomb from grid

      bug.updateBombCount();
      expect(bug.bombs.length).toBe(0);
    });
  });

  describe('removeSelfFromGrid()', () => {
    it('removes bug from grid', () => {
      const grid = new Grid(5, 5);
      const bug = new BomberBug();
      const loc = new Location(2, 2);
      bug.putSelfInGrid(grid, loc);

      bug.removeSelfFromGrid();

      expect(bug.grid).toBeNull();
      expect(grid.get(loc)).toBeNull();
    });
  });

  describe('act()', () => {
    it('does nothing (player-controlled)', () => {
      const bug = new BomberBug();
      expect(() => bug.act()).not.toThrow();
    });
  });
});
