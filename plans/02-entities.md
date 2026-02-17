# Phase 2: Game Entities

## Overview

All game objects extend Entity and implement their specific behavior. Entities are divided into two categories:

- **Static**: Wall, Brick, Bonus, Fire (no autonomous movement)
- **Dynamic**: BomberBug, RandomBug, Bomb (act on game ticks)

## Files to Create

```
src/
  entities/
    Wall.js
    Brick.js
    Bonus.js
    Fire.js
    Bomb.js
    BomberBug.js
    RandomBug.js     # Optional - AI enemy
    BlockBug.js      # Optional - AI that leaves trails
    index.js         # Re-export all
```

---

## Wall.js

Indestructible obstacle placed on the grid in a checkerboard pattern.

### Behavior
- Cannot be destroyed
- Blocks movement
- Blocks fire/explosions
- Override `removeSelfFromGrid()` to do nothing

### Sprite
`Wall.GIF`

### Reference
`archive-2016-react-attempt/java/Wall.java` - Very simple, ~15 lines

---

## Brick.js

Destructible obstacle that may contain a hidden bonus.

### Properties
- `bonus` (Bonus | null) - Hidden power-up revealed when destroyed

### Behavior
- Can be destroyed by fire
- When destroyed: if has bonus, spawn bonus at same location
- Blocks movement
- Stops fire (but is destroyed by it)

### Methods
- `setBonus(bonus)` - Hide a bonus inside
- `getBonus()` - Get hidden bonus
- Override `removeSelfFromGrid()` to spawn bonus

### Sprite
`Brick.GIF`

### Reference
`archive-2016-react-attempt/java/Brick.java`

---

## Bonus.js

Power-up that enhances player abilities.

### Types (static constants)
```javascript
EXPAND_RADIUS = 'ExpandBombRadius'   // +1 bomb explosion radius
ADD_BOMBS = 'AddMoreBombs'           // +1 concurrent bombs allowed  
SUPER_BOMB = 'SuperBomb'             // Next bomb destroys everything in path
```

### Properties
- `type` (string) - One of the type constants

### Behavior
- Sits on grid until collected by a BomberBug
- Destroyed by fire (uncollected bonus lost)

### Methods
- `getImageSuffix()` - Returns type for sprite selection

### Sprites
- `Bonus.GIF` (default)
- `BonusExpandBombRadius.GIF`
- `BonusAddMoreBombs.GIF`
- `BonusSuperBomb.GIF`

### Sounds
- `bonus_revealed.mp3` - When brick destroyed, bonus appears
- `bonus_gotten.mp3` - When player collects bonus

### Reference
`archive-2016-react-attempt/java/Bonus.java`

---

## Fire.js

Temporary explosion effect that destroys bugs and bricks.

### Properties
- `direction` (number) - Direction fire is spreading
- `stage` (number) - 1 = leading edge, 2 = middle

### Behavior
- Created by exploding bombs
- Exists for a short duration then disappears
- Kills any BomberBug/RandomBug that touches it
- Destroys Bricks (revealing bonuses)
- Stopped by Walls
- Can chain-detonate other Bombs

### Methods
- `getImageSuffix()` - Returns 'Middle' for stage 2

### Sprites
- `Fire.GIF` - Leading edge of explosion
- `FireMiddle.GIF` - Middle sections

### Sound
- `fireball.mp3` - When explosion occurs

### Reference
`archive-2016-react-attempt/java/Fire.java`

---

## Bomb.js

Timed explosive placed by players.

### Properties
- `timer` (number) - Ticks until explosion (default: 4 cycles)
- `radius` (number) - How far fire spreads (default: 2)
- `isSuperBomb` (boolean) - If true, fire goes through bricks
- `owner` (BomberBug) - Who placed this bomb
- `step` (number) - Animation frame counter
- `exploding` (boolean) - Currently in explosion phase
- `fire` (Location[]) - Locations of active fire from this bomb

### Behavior
- Countdown animation (3, 2, 1...)
- When timer hits 0, explode in 4 cardinal directions
- Fire spreads up to `radius` cells in each direction
- Fire stops at Walls
- Fire stops at Bricks (but destroys them) unless SuperBomb
- When explosion finishes, remove self and all fire

### Methods
- `act()` - Decrement timer, handle explosion phases
- `explode(direction)` - Spread fire in one direction
- `getImageSuffix()` - Returns timer value or 'CentralFire'/'SuperBomb'

### Sprites
- `Bomb.gif`, `Bomb0.gif` - Default
- `Bomb1.gif`, `Bomb2.gif`, `Bomb3.gif` - Countdown states
- `BombCentralFire.GIF` - Center during explosion
- `BombSuperBomb.GIF` - Super bomb indicator

### Sounds
- `bomb_dropped.mp3` - When placed
- `bomb_armed.mp3` - When player moves away
- `ticking.mp3` - Ambient while counting down
- `countdown3.mp3`, `countdown2.mp3`, `countdown1.mp3`
- `fireball.mp3` - When exploding
- `watch_out_superbomb.mp3` - When super bomb placed

### Reference
`archive-2016-react-attempt/java/Bomb.java` - Most complex entity (~200 lines)

---

## BomberBug.js

Player-controlled character.

### Properties
- `maxBombs` (number) - Max concurrent bombs (starts at 1)
- `bombRadius` (number) - Explosion radius (starts at 2)
- `bombs` (Bomb[]) - Active bombs placed by this player
- `hasSuperBomb` (boolean) - Next bomb is super bomb
- `playerIndex` (number) - 0-3 for multiplayer
- `color` (string) - Player color (red, blue, green, yellow)

### Behavior
- Controlled by keyboard input (not act())
- Can move in 4 directions if destination is empty/bonus/fire
- Places bombs at previous location when moving after pressing bomb key
- Collects bonuses on contact
- Dies when touching fire

### Methods
- `move(direction)` - Move in direction if possible
- `placeBomb()` - Queue a bomb to be placed on next move
- `addBonus(bonus)` - Apply bonus effect
- `updateBombCount()` - Clean up exploded bombs from list
- Override `removeSelfFromGrid()` to play death sound

### Sprites
- `BomberBug.gif` - Can tint by color

### Sounds
- `bug_step.mp3` - When moving
- `dead_bug.mp3` - When killed
- `hit_wall.mp3` - When trying to move into wall
- `hit_brick.mp3` - When trying to move into brick

### Reference
`archive-2016-react-attempt/java/BomberBug.java`

---

## RandomBug.js (Optional)

AI-controlled enemy that moves randomly.

### Properties
- `moveInterval` (number) - Ticks between moves (randomized)
- `stepCounter` (number) - Current tick count

### Behavior
- Moves in random direction periodically
- Can be killed by fire
- Adds challenge in single-player or higher levels

### Sprite
- `RandomBug.GIF`

### Reference
`archive-2016-react-attempt/java/RandomBug.java`

---

## BlockBug.js (Optional)

AI enemy that leaves brick/wall trails.

### Behavior
- Moves randomly like RandomBug
- Leaves Brick or Wall behind when moving
- When killed, all blocks it placed are destroyed

### Reference
`archive-2016-react-attempt/java/BlockBug.java`

---

## Entity Interaction Matrix

| Entity | Wall | Brick | Bonus | Fire | Bomb | Bug |
|--------|------|-------|-------|------|------|-----|
| **Bug moves into** | Blocked | Blocked | Collect | Die | Blocked | Blocked |
| **Fire spreads into** | Stopped | Destroy+Stop | Destroy | Continue | Detonate | Kill |

---

## Implementation Order

1. **Wall** - Simplest, test grid rendering
2. **Brick** - Test destruction
3. **Bonus** - Test collection
4. **Fire** - Test temporary entities
5. **Bomb** - Test complex behavior, tie it all together
6. **BomberBug** - Test player control
7. **RandomBug** - Optional, add last
