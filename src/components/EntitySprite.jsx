import React from 'react';
import { BomberBug } from '../entities/BomberBug.js';
import { RandomBug } from '../entities/RandomBug.js';
import { Fire } from '../entities/Fire.js';
import { Bomb } from '../entities/Bomb.js';

/**
 * Sprite file lookup map.
 * Keys are entity constructor names; values are functions or strings.
 */
const SPRITE_MAP = {
  Wall:      () => 'Wall.GIF',
  Brick:     () => 'Brick.GIF',
  RandomBug: () => 'RandomBug.GIF',
  BlockBug:  () => 'RandomBug.GIF',
  BomberBug: () => 'BomberBug.gif',
  Bonus:     (e) => `Bonus${e.getImageSuffix()}.GIF`,
  Bomb:      (e) => {
    const suffix = e.getImageSuffix();
    if (suffix === 'CentralFire') return 'BombCentralFire.GIF';
    if (suffix === 'SuperBomb') return 'BombSuperBomb.GIF';
    if (suffix) return `Bomb${suffix}.gif`;
    return 'Bomb.gif';
  },
  Fire:      (e) => {
    const suffix = e.getImageSuffix();
    return suffix === 'Middle' ? 'FireMiddle.GIF' : 'Fire.GIF';
  },
};

/** Hue-rotation degrees to tint the base red BomberBug sprite. */
const HUE_ROTATIONS = {
  red:    0,
  orange: 30,
  blue:   200,
  green:  100,
};

function getSpriteSrc(entity) {
  const name = entity.constructor.name;
  const resolver = SPRITE_MAP[name];
  return `/img/${resolver ? resolver(entity) : 'Bonus.GIF'}`;
}

/**
 * Renders the sprite image for a single entity.
 * Applies hue-rotate tinting for BomberBug players.
 * Applies fire pulse CSS class for Fire entities.
 * Applies bomb pulse CSS class for Bomb entities.
 */
function EntitySprite({ entity }) {
  const src = getSpriteSrc(entity);
  const isFire = entity instanceof Fire;
  const isBug = entity instanceof BomberBug || entity instanceof RandomBug;
  const isBomb = entity instanceof Bomb;

  const style = {};
  if (isBug) {
    // Rotate sprite to face movement direction (0°=North=up, 90°=East=right, etc.)
    if (entity.direction) {
      style.transform = `rotate(${entity.direction}deg)`;
    }
    if (entity.color && HUE_ROTATIONS[entity.color] !== undefined) {
      const deg = HUE_ROTATIONS[entity.color];
      if (deg !== 0) {
        style.filter = `hue-rotate(${deg}deg)`;
      }
    }
  }

  let className = 'entity-sprite';
  if (isFire) {
    className += ' entity-sprite--fire';
  } else if (isBomb && !entity.exploding) {
    // Urgent pulsing when timer is low (1 tick left)
    className += entity.timer <= 1
      ? ' entity-sprite--bomb-urgent'
      : ' entity-sprite--bomb';
  }

  return (
    <img
      className={className}
      src={src}
      alt={entity.constructor.name}
      style={style}
      draggable={false}
    />
  );
}

export default React.memo(EntitySprite);
