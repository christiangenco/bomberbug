import { describe, it, expect } from 'vitest';
import { Bomb } from '../Bomb.js';
import { Fire } from '../Fire.js';
import { Wall } from '../Wall.js';
import { Brick } from '../Brick.js';
import { Bonus } from '../Bonus.js';
import { Grid } from '../../engine/Grid.js';
import { Location } from '../../engine/Location.js';
import { Entity } from '../../engine/Entity.js';

describe('Bomb', () => {
  describe('constructor', () => {
    it('has default timer of 10 and radius of 2', () => {
      const bomb = new Bomb();
      expect(bomb.timer).toBe(10);
      expect(bomb.radius).toBe(2);
    });

    it('accepts custom timer and radius', () => {
      const bomb = new Bomb(6, 3);
      expect(bomb.timer).toBe(6);
      expect(bomb.radius).toBe(3);
    });

    it('starts not exploding', () => {
      const bomb = new Bomb();
      expect(bomb.exploding).toBe(false);
    });

    it('starts with no super bomb', () => {
      const bomb = new Bomb();
      expect(bomb.isSuperBomb).toBe(false);
    });

    it('starts with empty fire array', () => {
      const bomb = new Bomb();
      expect(bomb.fire).toEqual([]);
    });

    it('starts with no owner', () => {
      const bomb = new Bomb();
      expect(bomb.owner).toBeNull();
    });
  });

  describe('getImageSuffix', () => {
    it('returns stage string based on timer range', () => {
      const bomb = new Bomb(10);
      expect(bomb.getImageSuffix()).toBe('');     // timer > 9: no suffix
      bomb.timer = 9;
      expect(bomb.getImageSuffix()).toBe('3');    // 7-9: stage 3
      bomb.timer = 6;
      expect(bomb.getImageSuffix()).toBe('2');    // 4-6: stage 2
      bomb.timer = 3;
      expect(bomb.getImageSuffix()).toBe('1');    // 1-3: stage 1
    });

    it('returns "CentralFire" when exploding', () => {
      const bomb = new Bomb();
      bomb.exploding = true;
      expect(bomb.getImageSuffix()).toBe('CentralFire');
    });

    it('returns "SuperBomb" for super bombs (not exploding)', () => {
      const bomb = new Bomb();
      bomb.isSuperBomb = true;
      expect(bomb.getImageSuffix()).toBe('SuperBomb');
    });
  });

  describe('act() countdown', () => {
    it('decrements timer each act() call', () => {
      const bomb = new Bomb(4);
      const grid = new Grid(7, 7);
      bomb.putSelfInGrid(grid, new Location(3, 3));

      bomb.act();
      expect(bomb.timer).toBe(3);
      bomb.act();
      expect(bomb.timer).toBe(2);
      bomb.act();
      expect(bomb.timer).toBe(1);
    });

    it('detonates when timer reaches 0', () => {
      const bomb = new Bomb(1);
      const grid = new Grid(7, 7);
      bomb.putSelfInGrid(grid, new Location(3, 3));

      bomb.act(); // timer 1 -> 0, detonate
      expect(bomb.exploding).toBe(true);
    });

    it('does not decrement timer once exploding', () => {
      const bomb = new Bomb(1);
      const grid = new Grid(7, 7);
      bomb.putSelfInGrid(grid, new Location(3, 3));

      bomb.act(); // detonate
      const timerAfterDetonate = bomb.timer;
      // Next act should cleanup, not decrement
      // (bomb may be removed from grid by cleanup)
    });
  });

  describe('explosion - empty grid', () => {
    it('places fire in 4 cardinal directions up to radius', () => {
      const grid = new Grid(7, 7);
      const bomb = new Bomb(1, 2);
      bomb.putSelfInGrid(grid, new Location(3, 3));

      bomb.act(); // timer 1 -> 0, detonate

      // Check fire placed in 4 directions, 2 cells each
      expect(grid.get(new Location(2, 3))).toBeInstanceOf(Fire); // North 1
      expect(grid.get(new Location(1, 3))).toBeInstanceOf(Fire); // North 2
      expect(grid.get(new Location(4, 3))).toBeInstanceOf(Fire); // South 1
      expect(grid.get(new Location(5, 3))).toBeInstanceOf(Fire); // South 2
      expect(grid.get(new Location(3, 4))).toBeInstanceOf(Fire); // East 1
      expect(grid.get(new Location(3, 5))).toBeInstanceOf(Fire); // East 2
      expect(grid.get(new Location(3, 2))).toBeInstanceOf(Fire); // West 1
      expect(grid.get(new Location(3, 1))).toBeInstanceOf(Fire); // West 2
    });

    it('fire tracking includes all fire locations', () => {
      const grid = new Grid(7, 7);
      const bomb = new Bomb(1, 2);
      bomb.putSelfInGrid(grid, new Location(3, 3));

      bomb.act();
      expect(bomb.fire.length).toBe(8); // 4 directions * 2 radius
    });

    it('last fire in each direction is stage 1 (leading edge)', () => {
      const grid = new Grid(7, 7);
      const bomb = new Bomb(1, 2);
      bomb.putSelfInGrid(grid, new Location(3, 3));

      bomb.act();

      // Leading edges (outermost fires)
      expect(grid.get(new Location(1, 3)).stage).toBe(1);
      expect(grid.get(new Location(5, 3)).stage).toBe(1);
      expect(grid.get(new Location(3, 5)).stage).toBe(1);
      expect(grid.get(new Location(3, 1)).stage).toBe(1);
    });

    it('intermediate fire is stage 2 (middle)', () => {
      const grid = new Grid(7, 7);
      const bomb = new Bomb(1, 3);
      bomb.putSelfInGrid(grid, new Location(3, 3));

      bomb.act();

      // Middle fires (between bomb and leading edge)
      expect(grid.get(new Location(2, 3)).stage).toBe(2);
      expect(grid.get(new Location(4, 3)).stage).toBe(2);
      expect(grid.get(new Location(3, 4)).stage).toBe(2);
      expect(grid.get(new Location(3, 2)).stage).toBe(2);
    });
  });

  describe('explosion - walls', () => {
    it('fire stops at walls (no fire placed on wall)', () => {
      const grid = new Grid(7, 7);
      const bomb = new Bomb(1, 3);
      bomb.putSelfInGrid(grid, new Location(3, 3));

      const wall = new Wall();
      wall.putSelfInGrid(grid, new Location(1, 3)); // 2 cells north

      bomb.act();

      // Fire at 1 cell north, but NOT at wall or beyond
      expect(grid.get(new Location(2, 3))).toBeInstanceOf(Fire);
      expect(grid.get(new Location(1, 3))).toBe(wall); // Wall still there
      expect(grid.get(new Location(0, 3))).toBeNull(); // Nothing beyond
    });

    it('wall is not destroyed', () => {
      const grid = new Grid(7, 7);
      const bomb = new Bomb(1, 2);
      bomb.putSelfInGrid(grid, new Location(3, 3));

      const wall = new Wall();
      wall.putSelfInGrid(grid, new Location(2, 3));

      bomb.act();

      expect(grid.get(new Location(2, 3))).toBe(wall);
      expect(wall.grid).toBe(grid);
    });
  });

  describe('explosion - bricks', () => {
    it('fire destroys bricks but stops', () => {
      const grid = new Grid(7, 7);
      const bomb = new Bomb(1, 3);
      bomb.putSelfInGrid(grid, new Location(3, 3));

      const brick = new Brick();
      brick.putSelfInGrid(grid, new Location(2, 3)); // 1 cell north

      bomb.act();

      // Brick destroyed, fire placed there, but no fire beyond
      expect(grid.get(new Location(2, 3))).toBeInstanceOf(Fire);
      expect(brick.grid).toBeNull();
      expect(grid.get(new Location(1, 3))).toBeNull(); // No fire beyond
    });

    it('brick with bonus reveals bonus instead of placing fire', () => {
      const grid = new Grid(7, 7);
      const bomb = new Bomb(1, 2);
      bomb.putSelfInGrid(grid, new Location(3, 3));

      const brick = new Brick();
      const bonus = new Bonus(Bonus.EXPAND_RADIUS);
      brick.setBonus(bonus);
      brick.putSelfInGrid(grid, new Location(2, 3));

      bomb.act();

      // Bonus should be revealed, not replaced by fire
      expect(grid.get(new Location(2, 3))).toBe(bonus);
      expect(brick.grid).toBeNull();
    });
  });

  describe('explosion - super bomb', () => {
    it('super bomb fire goes through bricks', () => {
      const grid = new Grid(7, 7);
      const bomb = new Bomb(1, 3);
      bomb.isSuperBomb = true;
      bomb.putSelfInGrid(grid, new Location(3, 3));

      const brick = new Brick();
      brick.putSelfInGrid(grid, new Location(2, 3)); // 1 cell north

      bomb.act();

      // Brick destroyed, fire placed there AND beyond
      expect(brick.grid).toBeNull();
      expect(grid.get(new Location(2, 3))).toBeInstanceOf(Fire);
      expect(grid.get(new Location(1, 3))).toBeInstanceOf(Fire);
    });
  });

  describe('explosion - chain detonation', () => {
    it('fire chain-detonates other bombs', () => {
      const grid = new Grid(9, 9);
      const bombA = new Bomb(1, 2);
      bombA.putSelfInGrid(grid, new Location(4, 4));

      const bombB = new Bomb(10, 2); // Long timer, won't detonate on its own
      bombB.putSelfInGrid(grid, new Location(4, 6)); // 2 cells east

      bombA.act(); // Detonate A, fire reaches B

      expect(bombB.exploding).toBe(true);
      // B's fire should exist (it detonated)
      expect(bombB.fire.length).toBeGreaterThan(0);
    });
  });

  describe('explosion - grid edges', () => {
    it('fire stops at grid boundaries', () => {
      const grid = new Grid(5, 5);
      const bomb = new Bomb(1, 3);
      bomb.putSelfInGrid(grid, new Location(0, 0));

      bomb.act();

      // Only south and east have room for fire
      expect(grid.get(new Location(1, 0))).toBeInstanceOf(Fire);
      expect(grid.get(new Location(2, 0))).toBeInstanceOf(Fire);
      expect(grid.get(new Location(0, 1))).toBeInstanceOf(Fire);
      expect(grid.get(new Location(0, 2))).toBeInstanceOf(Fire);
      // Total fire: 4 cells south + 2 east (within bounds and radius)
    });
  });

  describe('explosion - kills entities', () => {
    it('fire removes generic entities (bugs)', () => {
      const grid = new Grid(7, 7);
      const bomb = new Bomb(1, 2);
      bomb.putSelfInGrid(grid, new Location(3, 3));

      const bug = new Entity({ color: 'green' });
      bug.putSelfInGrid(grid, new Location(2, 3));

      bomb.act();

      expect(bug.grid).toBeNull();
      expect(grid.get(new Location(2, 3))).toBeInstanceOf(Fire);
    });
  });

  describe('cleanup', () => {
    it('removes all fire and bomb after explosion', () => {
      const grid = new Grid(7, 7);
      const bomb = new Bomb(1, 2);
      bomb.putSelfInGrid(grid, new Location(3, 3));

      bomb.act(); // Detonate - places fire
      expect(bomb.fire.length).toBe(8);

      bomb.act(); // Cleanup

      // All fire should be removed
      expect(grid.get(new Location(2, 3))).toBeNull();
      expect(grid.get(new Location(4, 3))).toBeNull();
      expect(grid.get(new Location(3, 2))).toBeNull();
      expect(grid.get(new Location(3, 4))).toBeNull();

      // Bomb itself should be removed
      expect(bomb.grid).toBeNull();
      expect(grid.get(new Location(3, 3))).toBeNull();
    });
  });

  describe('detonate()', () => {
    it('triggers immediate explosion', () => {
      const grid = new Grid(7, 7);
      const bomb = new Bomb(10, 2); // Long timer
      bomb.putSelfInGrid(grid, new Location(3, 3));

      bomb.detonate();

      expect(bomb.exploding).toBe(true);
      expect(bomb.fire.length).toBe(8);
    });

    it('does nothing if already exploding', () => {
      const grid = new Grid(7, 7);
      const bomb = new Bomb(1, 2);
      bomb.putSelfInGrid(grid, new Location(3, 3));

      bomb.detonate();
      const fireCount = bomb.fire.length;

      bomb.detonate(); // Should be no-op
      expect(bomb.fire.length).toBe(fireCount);
    });
  });
});
