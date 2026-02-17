import { Location } from './Location.js';

/**
 * A 2D container that holds entities at locations.
 * Uses a Map with string keys "row,col" for O(1) access.
 */
export class Grid {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.cells = new Map();
  }

  /** Returns a string key for a Location. */
  _key(location) {
    return `${location.row},${location.col}`;
  }

  /** Returns true if the location is within grid bounds. */
  isValid(location) {
    return (
      location.row >= 0 &&
      location.row < this.rows &&
      location.col >= 0 &&
      location.col < this.cols
    );
  }

  /** Returns the entity at the given location, or null if empty. */
  get(location) {
    return this.cells.get(this._key(location)) ?? null;
  }

  /** Places an entity at the given location. Overwrites any existing entity. */
  put(location, entity) {
    this.cells.set(this._key(location), entity);
  }

  /** Removes and returns the entity at the given location, or null. */
  remove(location) {
    const key = this._key(location);
    const entity = this.cells.get(key) ?? null;
    this.cells.delete(key);
    return entity;
  }

  /** Returns an array of all Locations that have entities. */
  getOccupiedLocations() {
    const locations = [];
    for (const key of this.cells.keys()) {
      const [row, col] = key.split(',').map(Number);
      locations.push(new Location(row, col));
    }
    return locations;
  }

  /** Returns an array of all empty Locations. */
  getEmptyLocations() {
    const locations = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const loc = new Location(r, c);
        if (!this.cells.has(this._key(loc))) {
          locations.push(loc);
        }
      }
    }
    return locations;
  }

  /** Returns a random empty Location, or null if grid is full. */
  getRandomEmptyLocation() {
    const empty = this.getEmptyLocations();
    if (empty.length === 0) return null;
    return empty[Math.floor(Math.random() * empty.length)];
  }

  /** Returns an array of entities in the 4 cardinal adjacent cells. */
  getNeighbors(location) {
    const directions = [Location.NORTH, Location.EAST, Location.SOUTH, Location.WEST];
    const neighbors = [];
    for (const dir of directions) {
      const adj = location.adjacentLocation(dir);
      if (this.isValid(adj)) {
        const entity = this.get(adj);
        if (entity !== null) {
          neighbors.push(entity);
        }
      }
    }
    return neighbors;
  }
}
