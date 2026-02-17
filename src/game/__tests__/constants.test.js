import { describe, it, expect } from 'vitest';
import {
  GRID_ROWS,
  GRID_COLS,
  TICK_RATE,
  BOMB_TIMER,
  DEFAULT_BOMB_RADIUS,
  BRICK_DENSITY,
  BONUS_CHANCE,
  PLAYER_COLORS,
  PLAYER_CONTROLS,
  DIRECTIONS,
  SOUNDS,
} from '../constants.js';

describe('constants', () => {
  describe('Grid dimensions', () => {
    it('GRID_ROWS is 11 (odd)', () => {
      expect(GRID_ROWS).toBe(11);
      expect(GRID_ROWS % 2).toBe(1);
    });

    it('GRID_COLS is 13 (odd)', () => {
      expect(GRID_COLS).toBe(13);
      expect(GRID_COLS % 2).toBe(1);
    });
  });

  describe('Timing', () => {
    it('TICK_RATE is 300ms', () => {
      expect(TICK_RATE).toBe(300);
    });

    it('BOMB_TIMER is 10 ticks', () => {
      expect(BOMB_TIMER).toBe(10);
    });
  });

  describe('Game parameters', () => {
    it('DEFAULT_BOMB_RADIUS is 2', () => {
      expect(DEFAULT_BOMB_RADIUS).toBe(2);
    });

    it('BRICK_DENSITY is 0.2', () => {
      expect(BRICK_DENSITY).toBe(0.2);
    });

    it('BONUS_CHANCE is 0.3', () => {
      expect(BONUS_CHANCE).toBe(0.3);
    });
  });

  describe('Player colors', () => {
    it('has 4 player colors', () => {
      expect(PLAYER_COLORS).toHaveLength(4);
    });

    it('has the expected colors', () => {
      expect(PLAYER_COLORS).toEqual(['red', 'orange', 'blue', 'green']);
    });
  });

  describe('Player controls', () => {
    it('has controls for 4 players', () => {
      expect(Object.keys(PLAYER_CONTROLS)).toHaveLength(4);
    });

    it('Player 0 uses WASD + Q', () => {
      const p0 = PLAYER_CONTROLS[0];
      expect(p0.up).toBe('KeyW');
      expect(p0.down).toBe('KeyS');
      expect(p0.left).toBe('KeyA');
      expect(p0.right).toBe('KeyD');
      expect(p0.bomb).toBe('KeyQ');
    });

    it('Player 1 uses Arrow keys + Slash', () => {
      const p1 = PLAYER_CONTROLS[1];
      expect(p1.up).toBe('ArrowUp');
      expect(p1.down).toBe('ArrowDown');
      expect(p1.left).toBe('ArrowLeft');
      expect(p1.right).toBe('ArrowRight');
      expect(p1.bomb).toBe('Slash');
    });

    it('Player 2 uses UHJK + Y', () => {
      const p2 = PLAYER_CONTROLS[2];
      expect(p2.up).toBe('KeyU');
      expect(p2.down).toBe('KeyJ');
      expect(p2.left).toBe('KeyH');
      expect(p2.right).toBe('KeyK');
      expect(p2.bomb).toBe('KeyY');
    });

    it('Player 3 uses Numpad', () => {
      const p3 = PLAYER_CONTROLS[3];
      expect(p3.up).toBe('Numpad8');
      expect(p3.down).toBe('Numpad5');
      expect(p3.left).toBe('Numpad4');
      expect(p3.right).toBe('Numpad6');
      expect(p3.bomb).toBe('Numpad7');
    });

    it('each player has exactly 5 controls (up, down, left, right, bomb)', () => {
      for (let i = 0; i < 4; i++) {
        const controls = PLAYER_CONTROLS[i];
        expect(Object.keys(controls)).toHaveLength(5);
        expect(controls).toHaveProperty('up');
        expect(controls).toHaveProperty('down');
        expect(controls).toHaveProperty('left');
        expect(controls).toHaveProperty('right');
        expect(controls).toHaveProperty('bomb');
      }
    });

    it('no key codes are shared between players', () => {
      const allCodes = [];
      for (const controls of Object.values(PLAYER_CONTROLS)) {
        allCodes.push(...Object.values(controls));
      }
      const uniqueCodes = new Set(allCodes);
      expect(uniqueCodes.size).toBe(allCodes.length);
    });
  });

  describe('Directions', () => {
    it('up is 0 (NORTH)', () => {
      expect(DIRECTIONS.up).toBe(0);
    });

    it('right is 90 (EAST)', () => {
      expect(DIRECTIONS.right).toBe(90);
    });

    it('down is 180 (SOUTH)', () => {
      expect(DIRECTIONS.down).toBe(180);
    });

    it('left is 270 (WEST)', () => {
      expect(DIRECTIONS.left).toBe(270);
    });
  });

  describe('Sound list', () => {
    it('has expected sounds', () => {
      expect(SOUNDS).toContain('background_music');
      expect(SOUNDS).toContain('fireball');
      expect(SOUNDS).toContain('bomb_dropped');
      expect(SOUNDS).toContain('dead_bug');
      expect(SOUNDS).toContain('game_over');
    });

    it('has at least 10 sounds', () => {
      expect(SOUNDS.length).toBeGreaterThanOrEqual(10);
    });
  });
});
