import { describe, it, expect, vi } from 'vitest';
import { RandomBug } from '../RandomBug.js';
import { Wall } from '../Wall.js';
import { Brick } from '../Brick.js';
import { Fire } from '../Fire.js';
import { Grid } from '../../engine/Grid.js';
import { Location } from '../../engine/Location.js';

describe('RandomBug', () => {
  describe('constructor', () => {
    it('has default color green', () => {
      const bug = new RandomBug();
      expect(bug.color).toBe('green');
    });

    it('starts with stepCounter at 0', () => {
      const bug = new RandomBug();
      expect(bug.stepCounter).toBe(0);
    });

    it('accepts a custom moveInterval', () => {
      const bug = new RandomBug(10);
      expect(bug.moveInterval).toBe(10);
    });

    it('generates random moveInterval between 20 and 70 if not specified', () => {
      const bug = new RandomBug();
      expect(bug.moveInterval).toBeGreaterThanOrEqual(20);
      expect(bug.moveInterval).toBeLessThanOrEqual(70);
    });
  });

  describe('act()', () => {
    it('increments stepCounter each act()', () => {
      const bug = new RandomBug(100);
      const grid = new Grid(5, 5);
      bug.putSelfInGrid(grid, new Location(2, 2));

      bug.act();
      expect(bug.stepCounter).toBe(1);
      bug.act();
      expect(bug.stepCounter).toBe(2);
    });

    it('does not move before reaching moveInterval', () => {
      const bug = new RandomBug(5);
      const grid = new Grid(5, 5);
      bug.putSelfInGrid(grid, new Location(2, 2));

      for (let i = 0; i < 4; i++) {
        bug.act();
      }
      // Should still be at (2,2) - hasn't reached interval yet
      expect(bug.location.equals(new Location(2, 2))).toBe(true);
    });

    it('moves when stepCounter reaches moveInterval', () => {
      const bug = new RandomBug(3);
      const grid = new Grid(5, 5);
      bug.putSelfInGrid(grid, new Location(2, 2));

      bug.act(); // 1
      bug.act(); // 2
      bug.act(); // 3 = interval, should move

      // Bug should have moved to an adjacent cell
      const loc = bug.location;
      const distance = Math.abs(loc.row - 2) + Math.abs(loc.col - 2);
      expect(distance).toBe(1);
    });

    it('resets stepCounter after moving', () => {
      const bug = new RandomBug(2);
      const grid = new Grid(5, 5);
      bug.putSelfInGrid(grid, new Location(2, 2));

      bug.act();
      bug.act();
      expect(bug.stepCounter).toBe(0);
    });
  });

  describe('movement', () => {
    it('is blocked by walls', () => {
      const bug = new RandomBug(1);
      const grid = new Grid(3, 3);
      bug.putSelfInGrid(grid, new Location(1, 1));

      // Surround with walls on 3 sides
      new Wall().putSelfInGrid(grid, new Location(0, 1)); // N
      new Wall().putSelfInGrid(grid, new Location(1, 0)); // W
      new Wall().putSelfInGrid(grid, new Location(1, 2)); // E

      bug.act(); // Should only be able to move south

      expect(bug.location.equals(new Location(2, 1))).toBe(true);
    });

    it('is blocked by bricks', () => {
      const bug = new RandomBug(1);
      const grid = new Grid(3, 3);
      bug.putSelfInGrid(grid, new Location(1, 1));

      // Surround with bricks on 3 sides
      new Brick().putSelfInGrid(grid, new Location(0, 1)); // N
      new Brick().putSelfInGrid(grid, new Location(1, 0)); // W
      new Brick().putSelfInGrid(grid, new Location(1, 2)); // E

      bug.act();

      expect(bug.location.equals(new Location(2, 1))).toBe(true);
    });

    it('stays put when completely surrounded', () => {
      const bug = new RandomBug(1);
      const grid = new Grid(3, 3);
      bug.putSelfInGrid(grid, new Location(1, 1));

      new Wall().putSelfInGrid(grid, new Location(0, 1)); // N
      new Wall().putSelfInGrid(grid, new Location(2, 1)); // S
      new Wall().putSelfInGrid(grid, new Location(1, 0)); // W
      new Wall().putSelfInGrid(grid, new Location(1, 2)); // E

      bug.act();

      expect(bug.location.equals(new Location(1, 1))).toBe(true);
    });

    it('does not move off the grid edges', () => {
      const bug = new RandomBug(1);
      const grid = new Grid(1, 1);
      bug.putSelfInGrid(grid, new Location(0, 0));

      bug.act();

      expect(bug.location.equals(new Location(0, 0))).toBe(true);
    });
  });

  describe('removeSelfFromGrid', () => {
    it('can be removed from grid (killed)', () => {
      const grid = new Grid(5, 5);
      const bug = new RandomBug();
      const loc = new Location(2, 2);
      bug.putSelfInGrid(grid, loc);

      bug.removeSelfFromGrid();

      expect(bug.grid).toBeNull();
      expect(grid.get(loc)).toBeNull();
    });
  });
});
