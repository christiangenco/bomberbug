# BomberBug Port - Project Overview

## What is BomberBug?

A Bomberman clone originally written in Java (2009) using the GridWorld framework. Players control bugs on a grid, placing bombs to destroy bricks and eliminate opponents. Supports 2-4 local players.

## Project Goal

Port the game to modern JavaScript/React while preserving the original gameplay and assets.

## Directory Structure

```
~/projects/bomberbug/
├── plans/                    # This planning documentation
├── archive-2016-react-attempt/  # Previous incomplete port (React 0.14, Gulp)
├── archive-2020-cra-attempt/    # Previous incomplete port (CRA, has all assets!)
└── src/                      # New implementation (to be created)
```

## Available Assets (from archive-2020-cra-attempt/public/)

### Sprites (public/img/)
- BomberBug.gif - Player character
- Bomb.gif, Bomb0-3.gif - Bomb with countdown states
- BombCentralFire.GIF, BombSuperBomb.GIF - Explosion center
- Wall.GIF - Indestructible block
- Brick.GIF - Destructible block
- Fire.GIF, FireMiddle.GIF - Explosion flames
- Bonus.GIF, BonusAddMoreBombs.GIF, BonusExpandBombRadius.GIF, BonusSuperBomb.GIF
- RandomBug.GIF, KittyCat.gif - AI enemies

### Sounds (public/sound/)
- background_music.mp3
- bomb_armed.mp3, bomb_dropped.mp3, ticking.mp3
- countdown1-3.mp3, fireball.mp3
- bonus_revealed.mp3, bonus_gotten.mp3
- bug_step.mp3, dead_bug.mp3
- hit_wall.mp3, hit_brick.mp3
- game_over.mp3, watch_out_superbomb.mp3

## Implementation Phases

| Phase | Description | Est. Time |
|-------|-------------|-----------|
| 1 | Core Engine (Grid, Location, Entity) | 2-3 hours |
| 2 | Game Entities (Wall, Brick, Bomb, etc.) | 3-4 hours |
| 3 | Game Logic (state, loop, input) | 2-3 hours |
| 4 | React UI (components, rendering) | 2-3 hours |
| 5 | Polish (animations, menus, multiplayer) | 1-2 hours |

**Total estimated time: 10-15 hours**

## Tech Stack

- React 18+ (functional components, hooks)
- Vite (faster than CRA, modern tooling)
- CSS Grid for layout
- Web Audio API for sounds
- No external game libraries needed

## Reference Files

Key files from the original Java implementation:
- `archive-2016-react-attempt/java/BomberBug.java` - Player logic
- `archive-2016-react-attempt/java/BugWorld.java` - Level generation, game loop
- `archive-2016-react-attempt/java/Bomb.java` - Explosion mechanics
- `archive-2016-react-attempt/java/Bonus.java` - Power-up system

## Next Steps

1. Read `01-core-engine.md` and implement Grid/Location/Entity
2. Follow each subsequent plan document in order
3. Test incrementally - render grid before adding entities
