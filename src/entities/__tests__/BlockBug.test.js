import { describe, it, expect, vi } from 'vitest';
import { BlockBug } from '../BlockBug.js';
import { RandomBug } from '../RandomBug.js';
import { Brick } from '../Brick.js';
import { Wall } from '../Wall.js';
import { Grid } from '../../engine/Grid.js';
import { Location } from '../../engine/Location.js';

describe('BlockBug', () => {
  describe('constructor', () => {
    it('extends RandomBug', () => {
      const bug = new BlockBug();
      expect(bug).toBeInstanceOf(RandomBug);
    });

    it('has purple color', () => {
      const bug = new BlockBug();
      expect(bug.color).toBe('purple');
    });

    it('starts with empty placedBlocks array', () => {
      const bug = new BlockBug();
      expect(bug.placedBlocks).toEqual([]);
    });

    it('accepts moveInterval', () => {
      const bug = new BlockBug(5);
      expect(bug.moveInterval).toBe(5);
    });
  });

  describe('movement leaves blocks', () => {
    it('leaves a block at old location after moving', () => {
      const bug = new BlockBug(1);
      const grid = new Grid(5, 5);
      bug.putSelfInGrid(grid, new Location(2, 2));

      bug.act(); // Moves, leaves block behind

      // Bug should have moved
      expect(bug.location.equals(new Location(2, 2))).toBe(false);

      // Old location should have a block
      const block = grid.get(new Location(2, 2));
      expect(block instanceof Brick || block instanceof Wall).toBe(true);
    });

    it('tracks placed blocks', () => {
      const bug = new BlockBug(1);
      const grid = new Grid(5, 5);
      bug.putSelfInGrid(grid, new Location(2, 2));

      bug.act();

      expect(bug.placedBlocks.length).toBe(1);
    });

    it('accumulates blocks over multiple moves', () => {
      const bug = new BlockBug(1);
      const grid = new Grid(9, 9);
      bug.putSelfInGrid(grid, new Location(4, 4));

      bug.act();
      bug.act();
      bug.act();

      expect(bug.placedBlocks.length).toBe(3);
    });

    it('does not leave block when movement is blocked', () => {
      const bug = new BlockBug(1);
      const grid = new Grid(3, 3);
      bug.putSelfInGrid(grid, new Location(1, 1));

      // Completely surround
      new Wall().putSelfInGrid(grid, new Location(0, 1));
      new Wall().putSelfInGrid(grid, new Location(2, 1));
      new Wall().putSelfInGrid(grid, new Location(1, 0));
      new Wall().putSelfInGrid(grid, new Location(1, 2));

      bug.act();

      expect(bug.placedBlocks.length).toBe(0);
      expect(bug.location.equals(new Location(1, 1))).toBe(true);
    });
  });

  describe('removeSelfFromGrid()', () => {
    it('removes all placed blocks when killed', () => {
      const bug = new BlockBug(1);
      const grid = new Grid(9, 9);
      bug.putSelfInGrid(grid, new Location(4, 4));

      // Move a few times to place blocks
      bug.act();
      bug.act();

      const blocks = [...bug.placedBlocks];
      expect(blocks.length).toBe(2);

      // Kill the bug
      bug.removeSelfFromGrid();

      // All placed blocks should be removed
      for (const block of blocks) {
        expect(block.grid).toBeNull();
      }

      // Bug is removed
      expect(bug.grid).toBeNull();
    });

    it('clears placedBlocks array on death', () => {
      const bug = new BlockBug(1);
      const grid = new Grid(9, 9);
      bug.putSelfInGrid(grid, new Location(4, 4));

      bug.act();
      bug.act();

      bug.removeSelfFromGrid();
      expect(bug.placedBlocks).toEqual([]);
    });

    it('handles blocks that were already removed', () => {
      const bug = new BlockBug(1);
      const grid = new Grid(9, 9);
      bug.putSelfInGrid(grid, new Location(4, 4));

      bug.act();

      // Manually remove the placed block (e.g., destroyed by explosion)
      const block = bug.placedBlocks[0];
      if (block instanceof Brick) {
        block.removeSelfFromGrid();
      }
      // For Wall, it can't be removed normally, but the code handles grid===null check

      // Should not throw
      expect(() => bug.removeSelfFromGrid()).not.toThrow();
    });
  });
});
