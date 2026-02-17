import { describe, it, expect } from 'vitest';
import { Fire } from '../Fire.js';
import { Grid } from '../../engine/Grid.js';
import { Location } from '../../engine/Location.js';

describe('Fire', () => {
  it('constructs with direction and stage', () => {
    const fire = new Fire(Location.EAST, 2);
    expect(fire.direction).toBe(Location.EAST);
    expect(fire.stage).toBe(2);
  });

  it('defaults to NORTH direction and stage 1', () => {
    const fire = new Fire();
    expect(fire.direction).toBe(Location.NORTH);
    expect(fire.stage).toBe(1);
  });

  it('getImageSuffix returns empty string for stage 1 (leading edge)', () => {
    const fire = new Fire(Location.SOUTH, 1);
    expect(fire.getImageSuffix()).toBe('');
  });

  it('getImageSuffix returns "Middle" for stage 2', () => {
    const fire = new Fire(Location.SOUTH, 2);
    expect(fire.getImageSuffix()).toBe('Middle');
  });

  it('can be placed in a grid', () => {
    const grid = new Grid(5, 5);
    const fire = new Fire(Location.WEST);
    const loc = new Location(3, 3);
    fire.putSelfInGrid(grid, loc);
    expect(grid.get(loc)).toBe(fire);
  });

  it('can be removed from grid', () => {
    const grid = new Grid(5, 5);
    const fire = new Fire();
    const loc = new Location(3, 3);
    fire.putSelfInGrid(grid, loc);
    fire.removeSelfFromGrid();
    expect(grid.get(loc)).toBeNull();
  });

  it('stage can be changed after construction', () => {
    const fire = new Fire(Location.NORTH, 1);
    expect(fire.getImageSuffix()).toBe('');
    fire.stage = 2;
    expect(fire.getImageSuffix()).toBe('Middle');
  });
});
