/**
 * Immutable value object representing a position on the grid.
 * Row increases downward, col increases rightward.
 */
export class Location {
  static NORTH = 0;
  static NORTHEAST = 45;
  static EAST = 90;
  static SOUTHEAST = 135;
  static SOUTH = 180;
  static SOUTHWEST = 225;
  static WEST = 270;
  static NORTHWEST = 315;

  constructor(row = 0, col = 0) {
    this.row = row;
    this.col = col;
  }

  /**
   * Returns a new Location adjacent to this one in the given direction.
   * Direction is in degrees: 0=N, 90=E, 180=S, 270=W.
   */
  adjacentLocation(direction) {
    // Normalize direction to 0-359
    const dir = ((direction % 360) + 360) % 360;
    // Convert degrees to radians. In our coordinate system:
    // 0° = North (row-1), 90° = East (col+1), 180° = South (row+1), 270° = West (col-1)
    // Use a lookup approach for precision with 45° increments
    const dRow = Math.round(-Math.cos((dir * Math.PI) / 180));
    const dCol = Math.round(Math.sin((dir * Math.PI) / 180));
    return new Location(this.row + dRow, this.col + dCol);
  }

  /**
   * Returns true if this location has the same row and col as other.
   */
  equals(other) {
    if (!other) return false;
    return this.row === other.row && this.col === other.col;
  }

  toString() {
    return `(${this.row}, ${this.col})`;
  }
}
