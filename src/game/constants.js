export const GRID_ROWS = 11;        // Must be odd for wall pattern
export const GRID_COLS = 13;        // Must be odd for wall pattern
export const TICK_RATE = 300;       // ms between game ticks
export const BOMB_TIMER = 10;       // Ticks before explosion (~3 seconds at 300ms/tick)
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

export const SOUNDS = [
  'background_music',
  'bomb_armed', 'bomb_dropped', 'ticking',
  'countdown1', 'countdown2', 'countdown3',
  'fireball', 'bonus_revealed', 'bonus_gotten',
  'bug_step', 'dead_bug',
  'hit_wall', 'hit_brick',
  'game_over', 'watch_out_superbomb',
];
