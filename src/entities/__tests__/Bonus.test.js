import { describe, it, expect } from 'vitest';
import { Bonus } from '../Bonus.js';
import { Grid } from '../../engine/Grid.js';
import { Location } from '../../engine/Location.js';

describe('Bonus', () => {
  it('has static type constants', () => {
    expect(Bonus.EXPAND_RADIUS).toBe('ExpandBombRadius');
    expect(Bonus.ADD_BOMBS).toBe('AddMoreBombs');
    expect(Bonus.SUPER_BOMB).toBe('SuperBomb');
  });

  it('has a TYPES array with all bonus types', () => {
    expect(Bonus.TYPES).toEqual(['ExpandBombRadius', 'AddMoreBombs', 'SuperBomb']);
  });

  it('constructs with a type', () => {
    const bonus = new Bonus(Bonus.EXPAND_RADIUS);
    expect(bonus.type).toBe('ExpandBombRadius');
  });

  it('constructs with empty type by default', () => {
    const bonus = new Bonus();
    expect(bonus.type).toBe('');
  });

  it('can be constructed with numeric index', () => {
    const bonus = new Bonus(Bonus.TYPES[1]);
    expect(bonus.type).toBe('AddMoreBombs');
  });

  it('getImageSuffix returns the type', () => {
    const bonus = new Bonus(Bonus.SUPER_BOMB);
    expect(bonus.getImageSuffix()).toBe('SuperBomb');
  });

  it('getImageSuffix returns empty string for default bonus', () => {
    const bonus = new Bonus();
    expect(bonus.getImageSuffix()).toBe('');
  });

  it('can be placed and removed from grid', () => {
    const grid = new Grid(5, 5);
    const bonus = new Bonus(Bonus.ADD_BOMBS);
    const loc = new Location(2, 3);
    bonus.putSelfInGrid(grid, loc);
    expect(grid.get(loc)).toBe(bonus);

    bonus.removeSelfFromGrid();
    expect(grid.get(loc)).toBeNull();
    expect(bonus.grid).toBeNull();
  });
});
