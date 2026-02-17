import { Location } from './Location.js';

/**
 * Base class for all game objects (bugs, bombs, walls, etc.).
 * Entities exist in at most one grid at a time.
 */
export class Entity {
  constructor({ color = 'white', direction = Location.NORTH } = {}) {
    this.color = color;
    this.direction = direction;
    this.grid = null;
    this.location = null;
  }

  /**
   * Places this entity into a grid at the given location.
   * Throws if already in a grid.
   * Removes any existing entity at that location.
   */
  putSelfInGrid(grid, location) {
    if (this.grid !== null) {
      throw new Error('Entity is already in a grid. Call removeSelfFromGrid() first.');
    }

    // Remove any existing entity at the target location
    const existing = grid.get(location);
    if (existing !== null) {
      existing.removeSelfFromGrid();
    }

    this.grid = grid;
    this.location = location;
    grid.put(location, this);
  }

  /**
   * Removes this entity from its grid.
   * Throws if not in a grid.
   */
  removeSelfFromGrid() {
    if (this.grid === null) {
      throw new Error('Entity is not in a grid.');
    }

    this.grid.remove(this.location);
    this.grid = null;
    this.location = null;
  }

  /**
   * Moves this entity to a new location within the same grid.
   * Removes any entity already at the destination.
   * Throws if not in a grid.
   */
  moveTo(newLocation) {
    if (this.grid === null) {
      throw new Error('Entity is not in a grid.');
    }

    const grid = this.grid;
    const oldLocation = this.location;

    // Remove any existing entity at the destination
    const existing = grid.get(newLocation);
    if (existing !== null && existing !== this) {
      existing.removeSelfFromGrid();
    }

    // Move: remove from old, place at new
    grid.remove(oldLocation);
    this.location = newLocation;
    grid.put(newLocation, this);
  }

  /**
   * Returns the location adjacent to current position in the given direction.
   */
  getAdjacentLocation(direction) {
    return this.location.adjacentLocation(direction);
  }

  /**
   * Called each game tick. Override in subclasses.
   */
  act() {
    // Default: do nothing
  }

  /**
   * Returns string suffix for image/sprite selection.
   * Override in subclasses for animated entities.
   */
  getImageSuffix() {
    return '';
  }
}
