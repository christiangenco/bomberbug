import { describe, it, expect } from 'vitest';
import { Brick } from '../Brick.js';
import { Bonus } from '../Bonus.js';
import { Grid } from '../../engine/Grid.js';
import { Location } from '../../engine/Location.js';

describe('Brick', () => {
  it('constructs with default color and no bonus', () => {
    const brick = new Brick();
    expect(brick.color).toBe('brown');
    expect(brick.bonus).toBeNull();
  });

  it('can be placed in a grid', () => {
    const grid = new Grid(5, 5);
    const brick = new Brick();
    const loc = new Location(2, 3);
    brick.putSelfInGrid(grid, loc);
    expect(grid.get(loc)).toBe(brick);
  });

  it('setBonus stores a bonus', () => {
    const brick = new Brick();
    const bonus = new Bonus(Bonus.EXPAND_RADIUS);
    brick.setBonus(bonus);
    expect(brick.getBonus()).toBe(bonus);
  });

  it('removeSelfFromGrid removes brick from grid', () => {
    const grid = new Grid(5, 5);
    const brick = new Brick();
    const loc = new Location(2, 3);
    brick.putSelfInGrid(grid, loc);
    brick.removeSelfFromGrid();
    expect(grid.get(loc)).toBeNull();
    expect(brick.grid).toBeNull();
  });

  it('removeSelfFromGrid spawns bonus at same location if bonus exists', () => {
    const grid = new Grid(5, 5);
    const brick = new Brick();
    const bonus = new Bonus(Bonus.ADD_BOMBS);
    brick.setBonus(bonus);
    const loc = new Location(2, 3);
    brick.putSelfInGrid(grid, loc);

    brick.removeSelfFromGrid();

    // Brick is gone, bonus is now at that location
    expect(brick.grid).toBeNull();
    const occupant = grid.get(loc);
    expect(occupant).toBe(bonus);
    expect(bonus.grid).toBe(grid);
    expect(bonus.location.equals(loc)).toBe(true);
  });

  it('removeSelfFromGrid without bonus does not spawn anything', () => {
    const grid = new Grid(5, 5);
    const brick = new Brick();
    const loc = new Location(2, 3);
    brick.putSelfInGrid(grid, loc);
    brick.removeSelfFromGrid();
    expect(grid.get(loc)).toBeNull();
  });

  it('getImageSuffix returns empty string', () => {
    const brick = new Brick();
    expect(brick.getImageSuffix()).toBe('');
  });
});
