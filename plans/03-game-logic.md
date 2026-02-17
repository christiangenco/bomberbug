# Phase 3: Game Logic

## Overview

This phase implements the game state management, level generation, game loop, and input handling. This is the "glue" that makes entities work together as a game.

## Files to Create

```
src/
  game/
    GameState.js      # Level generation, win/lose conditions
    useGameLoop.js    # React hook for game tick
    useKeyboard.js    # React hook for keyboard input
    SoundManager.js   # Audio playback utility
    constants.js      # Game configuration
    index.js          # Re-export all
```

---

## constants.js

Centralized game configuration.

```javascript
export const GRID_ROWS = 11;        // Must be odd for wall pattern
export const GRID_COLS = 13;        // Must be odd for wall pattern
export const TICK_RATE = 100;       // ms between game ticks
export const BOMB_TIMER = 4;        // Ticks before explosion
export const DEFAULT_BOMB_RADIUS = 2;
export const BRICK_DENSITY = 0.2;   // % of empty cells filled with bricks
export const BONUS_CHANCE = 0.3;    // % of bricks that contain bonuses

export const PLAYER_COLORS = ['red', 'orange', 'blue', 'green'];

export const PLAYER_CONTROLS = {
  0: { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', bomb: 'KeyQ' },
  1: { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', bomb: 'Slash' },
  2: { up: 'KeyU', down: 'KeyJ', left: 'KeyH', right: 'KeyK', bomb: 'KeyY' },
  3: { up: 'Numpad8', down: 'Numpad5', left: 'Numpad4', right: 'Numpad6', bomb: 'Numpad7' },
};

export const DIRECTIONS = {
  up: 0,      // NORTH
  right: 90,  // EAST
  down: 180,  // SOUTH
  left: 270,  // WEST
};
```

---

## GameState.js

Manages overall game state and level generation.

### Class: GameState

#### Constructor
```javascript
new GameState({ playerCount, level })
```

#### Properties
- `grid` (Grid) - The game grid
- `players` (BomberBug[]) - Player entities
- `level` (number) - Current difficulty level
- `gameOver` (boolean) - Game has ended
- `winner` (BomberBug | null) - Winning player

#### Methods

**`generateLevel()`**
Creates a new level:
1. Create grid with odd dimensions
2. Place Walls in checkerboard pattern (odd row AND odd col)
3. Reserve corners for player spawns (3 cells each)
4. Fill random empty cells with Bricks
5. Hide Bonuses in some Bricks (more bonuses at higher levels)
6. Spawn players in corners
7. Optionally spawn RandomBugs (higher levels)

**`getPlayerSpawnLocations(playerCount)`**
Returns array of corner locations:
- Player 0: top-left (0, 0)
- Player 1: bottom-right (rows-1, cols-1)
- Player 2: top-right (0, cols-1)
- Player 3: bottom-left (rows-1, 0)

**`getTabooLocations(playerCount)`**
Returns locations that should NOT have bricks (spawn areas).
Each corner needs 3 empty cells for player to escape.

**`checkWinCondition()`**
Called after each tick:
- Count living players
- If 1 or fewer remain, game over
- Set winner to surviving player (or null for draw)

**`reset()`**
Start a new game with same settings.

### Reference
`archive-2016-react-attempt/java/BugWorld.java` - Constructor has level generation logic

---

## useGameLoop.js

React hook that drives the game tick.

### Hook: useGameLoop

```javascript
function useGameLoop(gameState, isRunning) {
  // Returns: { tick, fps }
}
```

#### Behavior
1. When `isRunning` is true, call `tick()` every TICK_RATE ms
2. `tick()` calls `act()` on all dynamic entities (Bombs, RandomBugs)
3. After all acts, check win condition
4. Trigger React re-render

#### Implementation Notes
- Use `useRef` to store interval ID
- Use `useCallback` for tick function
- Clean up interval on unmount or when paused
- Consider using `requestAnimationFrame` for smoother animation

```javascript
useEffect(() => {
  if (!isRunning) return;
  
  const intervalId = setInterval(() => {
    // Get all entities that can act
    const actors = gameState.grid.getOccupiedLocations()
      .map(loc => gameState.grid.get(loc))
      .filter(entity => typeof entity.act === 'function');
    
    // Call act on each
    actors.forEach(actor => actor.act());
    
    // Check win condition
    gameState.checkWinCondition();
    
    // Force re-render
    setTick(t => t + 1);
  }, TICK_RATE);
  
  return () => clearInterval(intervalId);
}, [isRunning, gameState]);
```

---

## useKeyboard.js

React hook for multiplayer keyboard input.

### Hook: useKeyboard

```javascript
function useKeyboard(gameState, isRunning) {
  // Handles keyboard events, moves players
}
```

#### Behavior
1. Listen for `keydown` events on document
2. Map key codes to player actions using PLAYER_CONTROLS
3. Call appropriate player method (move or placeBomb)
4. Prevent default for game keys (stop arrow key scrolling)

#### Implementation

```javascript
useEffect(() => {
  if (!isRunning) return;
  
  const handleKeyDown = (event) => {
    const { code } = event;
    
    // Check each player's controls
    gameState.players.forEach((player, index) => {
      if (!player.grid) return; // Player is dead
      
      const controls = PLAYER_CONTROLS[index];
      
      if (code === controls.up) {
        player.move(DIRECTIONS.up);
        event.preventDefault();
      } else if (code === controls.down) {
        player.move(DIRECTIONS.down);
        event.preventDefault();
      } // ... etc for left, right, bomb
    });
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isRunning, gameState]);
```

#### Edge Cases
- Ignore input for dead players (grid === null)
- Multiple keys can be pressed simultaneously (different players)
- Same player can't move faster by holding key (debounce optional)

---

## SoundManager.js

Utility for playing game sounds.

### Class: SoundManager

#### Properties
- `sounds` (Map<string, HTMLAudioElement>) - Preloaded audio elements
- `muted` (boolean) - Global mute toggle
- `volume` (number) - Global volume 0-1

#### Methods

**`preload(soundNames)`**
Load sounds into memory for instant playback.

**`play(name)`**
Play a sound by name. Creates new Audio instance for overlapping sounds.

**`playMusic(name)`**
Play looping background music.

**`stopMusic()`**
Stop background music.

**`setMuted(muted)`**
Toggle mute state.

**`setVolume(volume)`**
Set global volume.

#### Implementation

```javascript
class SoundManager {
  constructor() {
    this.sounds = new Map();
    this.music = null;
    this.muted = false;
    this.volume = 0.5;
  }
  
  preload(names) {
    names.forEach(name => {
      const audio = new Audio(`/sound/${name}.mp3`);
      audio.preload = 'auto';
      this.sounds.set(name, audio);
    });
  }
  
  play(name) {
    if (this.muted) return;
    
    // Clone audio for overlapping playback
    const original = this.sounds.get(name);
    if (!original) return;
    
    const audio = original.cloneNode();
    audio.volume = this.volume;
    audio.play().catch(() => {}); // Ignore autoplay errors
  }
  
  playMusic(name) {
    this.stopMusic();
    this.music = new Audio(`/sound/${name}.mp3`);
    this.music.loop = true;
    this.music.volume = this.volume * 0.5; // Music quieter
    this.music.play().catch(() => {});
  }
  
  stopMusic() {
    if (this.music) {
      this.music.pause();
      this.music = null;
    }
  }
}

export const soundManager = new SoundManager();
```

#### Sound List (to preload)
```javascript
const SOUNDS = [
  'background_music',
  'bomb_armed', 'bomb_dropped', 'ticking',
  'countdown1', 'countdown2', 'countdown3',
  'fireball', 'bonus_revealed', 'bonus_gotten',
  'bug_step', 'dead_bug',
  'hit_wall', 'hit_brick',
  'game_over', 'watch_out_superbomb'
];
```

---

## Integration Notes

### State Flow
1. User starts game → `GameState.generateLevel()`
2. Game loop starts → `useGameLoop` begins ticking
3. Player presses key → `useKeyboard` calls `player.move()`
4. Each tick → Bombs count down, fire spreads
5. Player dies → `checkWinCondition()` 
6. One player left → `gameOver = true`, show winner

### React State Management
The GameState is mutable (entities modify grid directly), but React needs to know when to re-render. Options:

1. **Force re-render on tick** - Increment a counter in state each tick
2. **Use reducer** - Dispatch actions that return new state
3. **Use external store** - Zustand or similar

Recommend option 1 for simplicity. The `useGameLoop` hook increments a tick counter that triggers re-render.

```javascript
const [tick, setTick] = useState(0);
// In game loop:
setTick(t => t + 1);
```
