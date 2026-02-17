# Phase 1: Core Engine

## Overview

The core engine provides the foundational classes that all game entities use. This mirrors the Java GridWorld framework's architecture but simplified for our needs.

## Files to Create

```
src/
  engine/
    Location.js
    Grid.js
    Entity.js
    index.js        # Re-export all
```

---

## Location.js

A simple value object representing a position on the grid plus direction utilities.

### Properties
- `row` (number) - Row index (0-based, increases downward)
- `col` (number) - Column index (0-based, increases rightward)

### Static Constants (directions in degrees)
```
NORTH = 0
NORTHEAST = 45
EAST = 90
SOUTHEAST = 135
SOUTH = 180
SOUTHWEST = 225
WEST = 270
NORTHWEST = 315
```

### Methods

**`adjacentLocation(direction)`**
Returns a new Location in the given direction.
- Input: direction (0, 90, 180, 270 for cardinal)
- Output: new Location

**`equals(other)`**
Returns true if row and col match.

**`toString()`**
Returns `"(row, col)"` for debugging.

### Reference
See `archive-2016-react-attempt/scripts/components/gridworld/Location.js` - this was mostly complete and can be adapted.

---

## Grid.js

A 2D container that holds entities at locations.

### Constructor
```javascript
new Grid(rows, cols)
```

### Properties
- `rows` (number) - Number of rows
- `cols` (number) - Number of columns  
- `cells` (Map) - Internal storage, keyed by "row,col" string

### Methods

**`isValid(location)`**
Returns true if location is within grid bounds.

**`get(location)`**
Returns entity at location, or null if empty.

**`put(location, entity)`**
Places entity at location. Removes any existing entity first.

**`remove(location)`**
Removes and returns entity at location.

**`getOccupiedLocations()`**
Returns array of all Locations that have entities.

**`getEmptyLocations()`**
Returns array of all empty Locations.

**`getRandomEmptyLocation()`**
Returns a random empty Location (for spawning).

**`getNeighbors(location)`**
Returns array of entities in adjacent cells (4-directional).

### Implementation Notes
- Use a Map with string keys like `"3,5"` for O(1) access
- Could also use a 2D array: `cells[row][col]`
- Map is cleaner for sparse grids

### Reference
See `archive-2016-react-attempt/scripts/components/gridworld/Grid.js` - partially complete.

---

## Entity.js

Base class for all game objects (bugs, bombs, walls, etc.).

### Constructor
```javascript
new Entity({ color, direction })
```

### Properties
- `grid` (Grid | null) - The grid this entity is in
- `location` (Location | null) - Current position
- `color` (string) - CSS color value
- `direction` (number) - Facing direction in degrees

### Methods

**`putSelfInGrid(grid, location)`**
Places this entity into a grid at the given location.
- Throws if already in a grid
- Removes any existing entity at that location

**`removeSelfFromGrid()`**
Removes this entity from its grid.
- Sets grid and location to null

**`moveTo(newLocation)`**
Moves this entity to a new location within the same grid.
- Removes any entity already at newLocation

**`getAdjacentLocation(direction)`**
Convenience method: returns location adjacent to current position.

**`act()`**
Called each game tick. Default: do nothing. Override in subclasses.

**`getImageSuffix()`**
Returns string to append to image name for animation states.
Default: empty string. Override for animated entities (Bomb).

### Reference
See `archive-2016-react-attempt/scripts/components/gridworld/Actor.js` - partially ported, has Java syntax errors.

---

## Testing the Core Engine

Before moving to Phase 2, verify the engine works:

```javascript
import { Grid, Location, Entity } from './engine';

const grid = new Grid(10, 10);
const loc = new Location(5, 5);
const entity = new Entity({ color: 'red' });

entity.putSelfInGrid(grid, loc);
console.log(grid.get(loc) === entity); // true
console.log(entity.location.equals(loc)); // true

entity.moveTo(new Location(5, 6));
console.log(grid.get(loc)); // null
console.log(grid.get(new Location(5, 6)) === entity); // true
```

---

## Decisions to Make

1. **Class vs Functional**: Use ES6 classes for entities (cleaner OOP model that matches original Java)
2. **Immutable Locations**: Location objects should be treated as immutable - always create new ones
3. **Entity lifecycle**: Entities must be in exactly 0 or 1 grid at a time
