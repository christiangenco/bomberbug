import { describe, it, expect } from 'vitest';
import { Grid } from '../Grid.js';
import { Location } from '../Location.js';
import { Entity } from '../Entity.js';

describe('Grid', () => {
  describe('constructor', () => {
    it('stores rows and cols', () => {
      const grid = new Grid(10, 15);
      expect(grid.rows).toBe(10);
      expect(grid.cols).toBe(15);
    });

    it('starts with no occupied locations', () => {
      const grid = new Grid(5, 5);
      expect(grid.getOccupiedLocations()).toHaveLength(0);
    });
  });

  describe('isValid()', () => {
    const grid = new Grid(10, 10);

    it('returns true for location within bounds', () => {
      expect(grid.isValid(new Location(0, 0))).toBe(true);
      expect(grid.isValid(new Location(5, 5))).toBe(true);
      expect(grid.isValid(new Location(9, 9))).toBe(true);
    });

    it('returns false for negative row', () => {
      expect(grid.isValid(new Location(-1, 5))).toBe(false);
    });

    it('returns false for negative col', () => {
      expect(grid.isValid(new Location(5, -1))).toBe(false);
    });

    it('returns false for row >= rows', () => {
      expect(grid.isValid(new Location(10, 5))).toBe(false);
    });

    it('returns false for col >= cols', () => {
      expect(grid.isValid(new Location(5, 10))).toBe(false);
    });
  });

  describe('put() and get()', () => {
    it('stores and retrieves an entity', () => {
      const grid = new Grid(10, 10);
      const entity = new Entity({ color: 'red' });
      const loc = new Location(3, 4);

      grid.put(loc, entity);
      expect(grid.get(loc)).toBe(entity);
    });

    it('returns null for empty location', () => {
      const grid = new Grid(10, 10);
      expect(grid.get(new Location(0, 0))).toBeNull();
    });

    it('replaces existing entity at location', () => {
      const grid = new Grid(10, 10);
      const entity1 = new Entity({ color: 'red' });
      const entity2 = new Entity({ color: 'blue' });
      const loc = new Location(3, 4);

      grid.put(loc, entity1);
      grid.put(loc, entity2);
      expect(grid.get(loc)).toBe(entity2);
    });
  });

  describe('remove()', () => {
    it('removes and returns entity at location', () => {
      const grid = new Grid(10, 10);
      const entity = new Entity({ color: 'red' });
      const loc = new Location(3, 4);

      grid.put(loc, entity);
      const removed = grid.remove(loc);

      expect(removed).toBe(entity);
      expect(grid.get(loc)).toBeNull();
    });

    it('returns null when removing from empty location', () => {
      const grid = new Grid(10, 10);
      const removed = grid.remove(new Location(0, 0));
      expect(removed).toBeNull();
    });
  });

  describe('getOccupiedLocations()', () => {
    it('returns all locations with entities', () => {
      const grid = new Grid(10, 10);
      const e1 = new Entity({ color: 'red' });
      const e2 = new Entity({ color: 'blue' });

      grid.put(new Location(1, 2), e1);
      grid.put(new Location(3, 4), e2);

      const occupied = grid.getOccupiedLocations();
      expect(occupied).toHaveLength(2);

      const hasLoc12 = occupied.some(loc => loc.row === 1 && loc.col === 2);
      const hasLoc34 = occupied.some(loc => loc.row === 3 && loc.col === 4);
      expect(hasLoc12).toBe(true);
      expect(hasLoc34).toBe(true);
    });

    it('returns Location instances', () => {
      const grid = new Grid(10, 10);
      grid.put(new Location(1, 2), new Entity({ color: 'red' }));

      const occupied = grid.getOccupiedLocations();
      expect(occupied[0]).toBeInstanceOf(Location);
    });

    it('returns empty array for empty grid', () => {
      const grid = new Grid(5, 5);
      expect(grid.getOccupiedLocations()).toEqual([]);
    });
  });

  describe('getEmptyLocations()', () => {
    it('returns all empty locations', () => {
      const grid = new Grid(3, 3);
      grid.put(new Location(1, 1), new Entity({ color: 'red' }));

      const empty = grid.getEmptyLocations();
      expect(empty).toHaveLength(8); // 9 total - 1 occupied
    });

    it('returns all locations when grid is empty', () => {
      const grid = new Grid(3, 3);
      const empty = grid.getEmptyLocations();
      expect(empty).toHaveLength(9);
    });

    it('returns empty array when grid is full', () => {
      const grid = new Grid(2, 2);
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 2; c++) {
          grid.put(new Location(r, c), new Entity({ color: 'red' }));
        }
      }
      expect(grid.getEmptyLocations()).toHaveLength(0);
    });

    it('returns Location instances', () => {
      const grid = new Grid(2, 2);
      const empty = grid.getEmptyLocations();
      empty.forEach(loc => expect(loc).toBeInstanceOf(Location));
    });
  });

  describe('getRandomEmptyLocation()', () => {
    it('returns a Location on an empty grid', () => {
      const grid = new Grid(5, 5);
      const loc = grid.getRandomEmptyLocation();
      expect(loc).toBeInstanceOf(Location);
      expect(grid.isValid(loc)).toBe(true);
    });

    it('returns the only empty location', () => {
      const grid = new Grid(2, 2);
      // Fill all but (0, 0)
      grid.put(new Location(0, 1), new Entity({ color: 'red' }));
      grid.put(new Location(1, 0), new Entity({ color: 'red' }));
      grid.put(new Location(1, 1), new Entity({ color: 'red' }));

      const loc = grid.getRandomEmptyLocation();
      expect(loc.row).toBe(0);
      expect(loc.col).toBe(0);
    });

    it('returns null when grid is full', () => {
      const grid = new Grid(2, 2);
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 2; c++) {
          grid.put(new Location(r, c), new Entity({ color: 'red' }));
        }
      }
      expect(grid.getRandomEmptyLocation()).toBeNull();
    });
  });

  describe('getNeighbors()', () => {
    it('returns entities in 4 cardinal adjacent cells', () => {
      const grid = new Grid(5, 5);
      const center = new Location(2, 2);
      const north = new Entity({ color: 'red' });
      const south = new Entity({ color: 'blue' });

      grid.put(new Location(1, 2), north);
      grid.put(new Location(3, 2), south);

      const neighbors = grid.getNeighbors(center);
      expect(neighbors).toHaveLength(2);
      expect(neighbors).toContain(north);
      expect(neighbors).toContain(south);
    });

    it('returns empty array when no neighbors', () => {
      const grid = new Grid(5, 5);
      const neighbors = grid.getNeighbors(new Location(2, 2));
      expect(neighbors).toEqual([]);
    });

    it('handles corner location (only 2 possible neighbors)', () => {
      const grid = new Grid(5, 5);
      const e1 = new Entity({ color: 'red' });
      const e2 = new Entity({ color: 'blue' });

      grid.put(new Location(0, 1), e1);
      grid.put(new Location(1, 0), e2);

      const neighbors = grid.getNeighbors(new Location(0, 0));
      expect(neighbors).toHaveLength(2);
      expect(neighbors).toContain(e1);
      expect(neighbors).toContain(e2);
    });

    it('does not include diagonal entities', () => {
      const grid = new Grid(5, 5);
      grid.put(new Location(1, 1), new Entity({ color: 'red' })); // diagonal

      const neighbors = grid.getNeighbors(new Location(2, 2));
      expect(neighbors).toHaveLength(0);
    });
  });
});
