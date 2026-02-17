# Java Implementation Reference

## Overview

The original BomberBug was written in Java in 2009, built on the [GridWorld](http://www.horstmann.com/gridworld/) framework (used in AP Computer Science courses). This document extracts key implementation details for reference during the port.

## Source Files Location

All Java files are in:
```
archive-2016-react-attempt/java/
```

---

## GridWorld Framework Concepts

### Actor
Base class for all grid entities. Key methods:
- `putSelfInGrid(Grid, Location)` - Place in grid
- `removeSelfFromGrid()` - Remove from grid
- `moveTo(Location)` - Move within grid
- `act()` - Called each step
- `getGrid()`, `getLocation()`, `getDirection()`, `getColor()`

### Grid
2D container for Actors:
- `get(Location)` - Get actor at location
- `put(Location, Actor)` - Place actor
- `remove(Location)` - Remove actor
- `isValid(Location)` - Check bounds
- `getNumRows()`, `getNumCols()`

### Location
Position on grid:
- `row`, `col` properties
- `getAdjacentLocation(direction)` - Get neighbor
- Direction constants: NORTH=0, EAST=90, SOUTH=180, WEST=270

### Bug (extends Actor)
Moving entity that leaves Flowers:
- `move()` - Move forward
- `turn()` - Rotate 45°
- `canMove()` - Check if can move forward

### Rock (extends Actor)
Stationary entity:
- `act()` does nothing (can't move)

---

## Key Java Classes

### BomberBug.java (Player)

```java
public class BomberBug extends Bug {
    private int maxBombs;           // Concurrent bomb limit
    boolean placeBomb;              // Flag to place bomb on next move
    private int bombRadius;         // Explosion radius
    private boolean superBomb;      // Next bomb is super
    ArrayList<Bomb> bombs;          // Active bombs
    
    public void move(int direction) {
        // 1. Check if destination is valid (empty, bonus, or fire)
        // 2. Move to new location
        // 3. If placeBomb flag set, create bomb at OLD location
        // 4. If stepped on Bonus, apply it
        // 5. Play appropriate sound
    }
    
    public boolean placeBomb() {
        // Check if under bomb limit
        // Set placeBomb flag (actual placement on next move)
    }
    
    public void addBonus(Actor a) {
        // ExpandBombRadius: bombRadius++
        // AddMoreBombs: maxBombs++
        // SuperBomb: superBomb = true
    }
}
```

**Key insight**: Bombs are placed at the PREVIOUS location after moving, not at current location.

### Bomb.java (Explosive)

```java
public class Bomb extends Rock {
    private int timer;              // Countdown (default 4)
    private int radius;             // Explosion range
    private boolean superBomb;      // Goes through bricks
    private boolean exploding;      // In explosion phase
    boolean[] finishedExploding;    // Track 4 directions
    ArrayList<Location> fire;       // Active fire locations
    
    public void act() {
        // If not exploding, return (countdown in getImageSuffix)
        // If all 4 directions done, clean up and remove self
        // Otherwise, call explode() for each direction
    }
    
    public void explode(int direction) {
        // 1. Check if already finished this direction
        // 2. Get adjacent location
        // 3. If invalid/wall, mark finished
        // 4. If empty, place Fire
        // 5. If Fire/Flower, continue through (up to radius)
        // 6. If Brick/Bug, destroy and place Fire, mark finished
        // 7. SuperBomb: don't stop at bricks
    }
    
    public String getImageSuffix() {
        // Handles countdown animation
        // Returns "3", "2", "1" based on timer
        // Returns "CentralFire" when exploding
        // Decrements timer, triggers explosion when 0
    }
}
```

**Key insight**: The countdown happens in `getImageSuffix()` which is called during rendering. This is a bit odd - in React we should separate animation state from rendering.

### BugWorld.java (Game State)

```java
public class BugWorld extends ActorWorld {
    ArrayList<BomberBug> bugs;      // Players
    private boolean gameOver;
    
    // Constructor generates level:
    public BugWorld(int rows, int cols, ArrayList<BomberBug> bs, int level) {
        // 1. Ensure odd dimensions (for wall pattern)
        // 2. Calculate brick count based on level
        // 3. Create grid
        // 4. Define taboo locations (player spawn corners)
        // 5. Place Walls at odd row AND odd col intersections
        // 6. Place random Bricks (not in taboo zones)
        // 7. Hide Bonuses in some Bricks
        // 8. Place players in corners
        // 9. Add RandomBugs at higher levels
    }
    
    public void step() {
        // Called each game tick
        // Check if players are dead
        // If 1 or fewer alive, game over
    }
    
    public boolean keyPressed(String description, Location loc) {
        // Map keys to player actions
        // Player 1: W/S/A/D + Q
        // Player 2: Arrows + Slash
        // Player 3: U/J/H/K + Y
        // Player 4: Numpad
    }
}
```

### Wall.java

```java
public class Wall extends Rock {
    public void removeSelfFromGrid() {
        // Override to do nothing - walls are indestructible
    }
}
```

### Brick.java

```java
public class Brick extends Rock {
    private Bonus bonus;            // Hidden power-up
    
    public void removeSelfFromGrid() {
        // If has bonus, place it at this location
        Grid grid = getGrid();
        Location loc = getLocation();
        super.removeSelfFromGrid();
        if (bonus != null) {
            bonus.putSelfInGrid(grid, loc);
        }
    }
}
```

### Bonus.java

```java
public class Bonus extends Rock {
    String type;
    String[] types = {"ExpandBombRadius", "AddMoreBombs", "SuperBomb"};
    
    public String getImageSuffix() {
        return type;  // Used for sprite selection
    }
}
```

### Fire.java

```java
public class Fire extends Actor {
    // Very simple - just exists to mark explosion area
    // Removed by Bomb when explosion finishes
}
```

### RandomBug.java

```java
public class RandomBug extends Bug {
    private int scale;      // Ticks between moves (20-70)
    private int step;       // Current tick count
    
    public void act() {
        if (step >= scale) {
            super.act();    // Bug.act() = move or turn
            step = 0;
        } else {
            step++;
        }
    }
}
```

### BlockBug.java

```java
public class BlockBug extends RandomBug {
    ArrayList<Rock> keeper;  // Blocks placed by this bug
    
    public void move() {
        Location oldLoc = getLocation();
        super.move();
        
        // Leave brick or wall behind
        Rock brick = Math.random() > 0.25 ? new Brick() : new Wall();
        brick.putSelfInGrid(grid, oldLoc);
        keeper.add(brick);
    }
    
    public void removeSelfFromGrid() {
        // When killed, remove all blocks placed
        for (Rock b : keeper) {
            if (b.getGrid() != null) {
                b.removeSelfFromGrid();
            }
        }
        super.removeSelfFromGrid();
    }
}
```

---

## Level Generation Algorithm

From `BugWorld` constructor:

```
1. Grid dimensions must be ODD (so walls form grid pattern)
   - If even, add 1
   - Minimum 5x5

2. Brick count = (rows * cols) / 5 * sqrt(level)

3. Place permanent Walls:
   for each row r:
     for each col c:
       if r is ODD and c is ODD:
         place Wall at (r, c)

4. Define taboo (no-brick) zones around spawn corners:
   - Top-left: (0,0), (0,1), (1,0)
   - Bottom-right: (rows-1,cols-1), (rows-2,cols-1), (rows-1,cols-2)
   - (Similar for 3rd and 4th players)

5. Place Bricks randomly:
   while bricks.size < targetCount:
     pick random (r, c)
     if (r is EVEN or c is EVEN) AND not taboo AND empty:
       place Brick

6. Hide Bonuses in Bricks:
   bonusCount = sqrt(rows * cols)
   bonusTypes available = min(3, level-1)  // No bonuses on level 1
   for i in 0..bonusCount:
     pick random brick without bonus
     assign random bonus type

7. Place players in corners

8. At level 3+, add RandomBugs:
   count = (level-2) * sqrt(min(rows, cols))
```

---

## Sound Effects Used

| Event | Sound File |
|-------|------------|
| Bug moves | bug_step.mp3 |
| Bug dies | dead_bug.mp3 |
| Hit wall | hit_wall.mp3 |
| Hit brick | hit_brick.mp3 |
| Bomb dropped | bomb_dropped.mp3 |
| Bomb armed (player walks away) | bomb_armed.mp3 |
| Bomb ticking | ticking.mp3 |
| Countdown 3/2/1 | countdown3/2/1.mp3 |
| Explosion | fireball.mp3 |
| Bonus revealed | bonus_revealed.mp3 |
| Bonus collected | bonus_gotten.mp3 |
| Super bomb placed | watch_out_superbomb.mp3 |
| Game over | game_over.mp3 |
| Background | background_music.mp3 |

---

## Quirks to Be Aware Of

1. **Bomb placement timing**: Player sets `placeBomb=true`, then on NEXT move, bomb is created at old location.

2. **Timer in getImageSuffix**: The bomb timer decrements during sprite lookup, not in act(). Separate this in the port.

3. **Fire cleanup**: Bomb tracks all fire locations and removes them all at once when explosion ends.

4. **SuperBomb**: Only affects the NEXT bomb placed, then resets.

5. **Wall.removeSelfFromGrid()**: Does nothing, making walls truly indestructible even to code trying to remove them.

6. **Direction units**: Degrees, not radians. 0=North, 90=East, 180=South, 270=West.
