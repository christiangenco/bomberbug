import { describe, it, expect } from 'vitest';
import { Location } from '../Location.js';

describe('Location', () => {
  describe('constructor', () => {
    it('stores row and col', () => {
      const loc = new Location(3, 5);
      expect(loc.row).toBe(3);
      expect(loc.col).toBe(5);
    });

    it('defaults to (0, 0)', () => {
      const loc = new Location();
      expect(loc.row).toBe(0);
      expect(loc.col).toBe(0);
    });
  });

  describe('direction constants', () => {
    it('defines NORTH as 0', () => {
      expect(Location.NORTH).toBe(0);
    });
    it('defines NORTHEAST as 45', () => {
      expect(Location.NORTHEAST).toBe(45);
    });
    it('defines EAST as 90', () => {
      expect(Location.EAST).toBe(90);
    });
    it('defines SOUTHEAST as 135', () => {
      expect(Location.SOUTHEAST).toBe(135);
    });
    it('defines SOUTH as 180', () => {
      expect(Location.SOUTH).toBe(180);
    });
    it('defines SOUTHWEST as 225', () => {
      expect(Location.SOUTHWEST).toBe(225);
    });
    it('defines WEST as 270', () => {
      expect(Location.WEST).toBe(270);
    });
    it('defines NORTHWEST as 315', () => {
      expect(Location.NORTHWEST).toBe(315);
    });
  });

  describe('adjacentLocation()', () => {
    it('returns location to the north (row - 1)', () => {
      const loc = new Location(5, 5);
      const adj = loc.adjacentLocation(Location.NORTH);
      expect(adj.row).toBe(4);
      expect(adj.col).toBe(5);
    });

    it('returns location to the south (row + 1)', () => {
      const loc = new Location(5, 5);
      const adj = loc.adjacentLocation(Location.SOUTH);
      expect(adj.row).toBe(6);
      expect(adj.col).toBe(5);
    });

    it('returns location to the east (col + 1)', () => {
      const loc = new Location(5, 5);
      const adj = loc.adjacentLocation(Location.EAST);
      expect(adj.row).toBe(5);
      expect(adj.col).toBe(6);
    });

    it('returns location to the west (col - 1)', () => {
      const loc = new Location(5, 5);
      const adj = loc.adjacentLocation(Location.WEST);
      expect(adj.row).toBe(5);
      expect(adj.col).toBe(4);
    });

    it('returns location to the northeast', () => {
      const loc = new Location(5, 5);
      const adj = loc.adjacentLocation(Location.NORTHEAST);
      expect(adj.row).toBe(4);
      expect(adj.col).toBe(6);
    });

    it('returns location to the southeast', () => {
      const loc = new Location(5, 5);
      const adj = loc.adjacentLocation(Location.SOUTHEAST);
      expect(adj.row).toBe(6);
      expect(adj.col).toBe(6);
    });

    it('returns location to the southwest', () => {
      const loc = new Location(5, 5);
      const adj = loc.adjacentLocation(Location.SOUTHWEST);
      expect(adj.row).toBe(6);
      expect(adj.col).toBe(4);
    });

    it('returns location to the northwest', () => {
      const loc = new Location(5, 5);
      const adj = loc.adjacentLocation(Location.NORTHWEST);
      expect(adj.row).toBe(4);
      expect(adj.col).toBe(4);
    });

    it('returns a new Location instance (immutability)', () => {
      const loc = new Location(5, 5);
      const adj = loc.adjacentLocation(Location.NORTH);
      expect(adj).not.toBe(loc);
      expect(adj).toBeInstanceOf(Location);
    });

    it('does not modify the original location', () => {
      const loc = new Location(5, 5);
      loc.adjacentLocation(Location.NORTH);
      expect(loc.row).toBe(5);
      expect(loc.col).toBe(5);
    });
  });

  describe('equals()', () => {
    it('returns true for same row and col', () => {
      const a = new Location(3, 7);
      const b = new Location(3, 7);
      expect(a.equals(b)).toBe(true);
    });

    it('returns false for different row', () => {
      const a = new Location(3, 7);
      const b = new Location(4, 7);
      expect(a.equals(b)).toBe(false);
    });

    it('returns false for different col', () => {
      const a = new Location(3, 7);
      const b = new Location(3, 8);
      expect(a.equals(b)).toBe(false);
    });

    it('returns false for null', () => {
      const a = new Location(3, 7);
      expect(a.equals(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      const a = new Location(3, 7);
      expect(a.equals(undefined)).toBe(false);
    });
  });

  describe('toString()', () => {
    it('returns formatted string', () => {
      const loc = new Location(3, 7);
      expect(loc.toString()).toBe('(3, 7)');
    });

    it('works for origin', () => {
      const loc = new Location(0, 0);
      expect(loc.toString()).toBe('(0, 0)');
    });
  });
});
