import { describe, it, expect } from 'vitest';
import { Entity } from '../Entity.js';
import { Grid } from '../Grid.js';
import { Location } from '../Location.js';

describe('Entity', () => {
  describe('constructor', () => {
    it('sets color and direction', () => {
      const entity = new Entity({ color: 'red', direction: Location.EAST });
      expect(entity.color).toBe('red');
      expect(entity.direction).toBe(Location.EAST);
    });

    it('defaults direction to NORTH', () => {
      const entity = new Entity({ color: 'blue' });
      expect(entity.direction).toBe(Location.NORTH);
    });

    it('defaults color to white', () => {
      const entity = new Entity({});
      expect(entity.color).toBe('white');
    });

    it('starts with no grid or location', () => {
      const entity = new Entity({ color: 'red' });
      expect(entity.grid).toBeNull();
      expect(entity.location).toBeNull();
    });
  });

  describe('putSelfInGrid()', () => {
    it('places entity into the grid at the given location', () => {
      const grid = new Grid(10, 10);
      const entity = new Entity({ color: 'red' });
      const loc = new Location(3, 4);

      entity.putSelfInGrid(grid, loc);

      expect(entity.grid).toBe(grid);
      expect(entity.location.equals(loc)).toBe(true);
      expect(grid.get(loc)).toBe(entity);
    });

    it('throws if entity is already in a grid', () => {
      const grid = new Grid(10, 10);
      const entity = new Entity({ color: 'red' });
      entity.putSelfInGrid(grid, new Location(0, 0));

      expect(() => {
        entity.putSelfInGrid(grid, new Location(1, 1));
      }).toThrow();
    });

    it('removes any existing entity at that location', () => {
      const grid = new Grid(10, 10);
      const loc = new Location(3, 4);

      const existing = new Entity({ color: 'blue' });
      existing.putSelfInGrid(grid, loc);

      const newEntity = new Entity({ color: 'red' });
      newEntity.putSelfInGrid(grid, loc);

      expect(grid.get(loc)).toBe(newEntity);
      expect(existing.grid).toBeNull();
      expect(existing.location).toBeNull();
    });
  });

  describe('removeSelfFromGrid()', () => {
    it('removes entity from its grid', () => {
      const grid = new Grid(10, 10);
      const entity = new Entity({ color: 'red' });
      const loc = new Location(3, 4);

      entity.putSelfInGrid(grid, loc);
      entity.removeSelfFromGrid();

      expect(entity.grid).toBeNull();
      expect(entity.location).toBeNull();
      expect(grid.get(loc)).toBeNull();
    });

    it('throws if entity is not in a grid', () => {
      const entity = new Entity({ color: 'red' });
      expect(() => entity.removeSelfFromGrid()).toThrow();
    });
  });

  describe('moveTo()', () => {
    it('moves entity to a new location', () => {
      const grid = new Grid(10, 10);
      const entity = new Entity({ color: 'red' });
      const oldLoc = new Location(3, 4);
      const newLoc = new Location(5, 6);

      entity.putSelfInGrid(grid, oldLoc);
      entity.moveTo(newLoc);

      expect(entity.location.equals(newLoc)).toBe(true);
      expect(grid.get(newLoc)).toBe(entity);
      expect(grid.get(oldLoc)).toBeNull();
    });

    it('removes any entity already at the destination', () => {
      const grid = new Grid(10, 10);
      const entity1 = new Entity({ color: 'red' });
      const entity2 = new Entity({ color: 'blue' });

      entity1.putSelfInGrid(grid, new Location(0, 0));
      entity2.putSelfInGrid(grid, new Location(1, 1));

      entity1.moveTo(new Location(1, 1));

      expect(grid.get(new Location(1, 1))).toBe(entity1);
      expect(entity2.grid).toBeNull();
      expect(entity2.location).toBeNull();
    });

    it('throws if entity is not in a grid', () => {
      const entity = new Entity({ color: 'red' });
      expect(() => entity.moveTo(new Location(0, 0))).toThrow();
    });
  });

  describe('getAdjacentLocation()', () => {
    it('returns adjacent location based on current position', () => {
      const grid = new Grid(10, 10);
      const entity = new Entity({ color: 'red' });
      entity.putSelfInGrid(grid, new Location(5, 5));

      const adj = entity.getAdjacentLocation(Location.NORTH);
      expect(adj.row).toBe(4);
      expect(adj.col).toBe(5);
    });
  });

  describe('act()', () => {
    it('exists and does nothing by default', () => {
      const entity = new Entity({ color: 'red' });
      expect(() => entity.act()).not.toThrow();
    });
  });

  describe('getImageSuffix()', () => {
    it('returns empty string by default', () => {
      const entity = new Entity({ color: 'red' });
      expect(entity.getImageSuffix()).toBe('');
    });
  });
});
