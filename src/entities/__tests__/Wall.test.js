import { describe, it, expect } from 'vitest';
import { Wall } from '../Wall.js';
import { Grid } from '../../engine/Grid.js';
import { Location } from '../../engine/Location.js';

describe('Wall', () => {
  it('extends Entity with default color', () => {
    const wall = new Wall();
    expect(wall.color).toBe('gray');
  });

  it('can be placed in a grid', () => {
    const grid = new Grid(5, 5);
    const wall = new Wall();
    wall.putSelfInGrid(grid, new Location(1, 1));
    expect(grid.get(new Location(1, 1))).toBe(wall);
    expect(wall.grid).toBe(grid);
    expect(wall.location.equals(new Location(1, 1))).toBe(true);
  });

  it('removeSelfFromGrid is a no-op (indestructible)', () => {
    const grid = new Grid(5, 5);
    const wall = new Wall();
    const loc = new Location(1, 1);
    wall.putSelfInGrid(grid, loc);

    // Should NOT throw, but also should NOT remove
    wall.removeSelfFromGrid();

    expect(grid.get(loc)).toBe(wall);
    expect(wall.grid).toBe(grid);
    expect(wall.location.equals(loc)).toBe(true);
  });

  it('getImageSuffix returns empty string', () => {
    const wall = new Wall();
    expect(wall.getImageSuffix()).toBe('');
  });

  it('act does nothing', () => {
    const wall = new Wall();
    expect(() => wall.act()).not.toThrow();
  });
});
