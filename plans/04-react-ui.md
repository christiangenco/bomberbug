# Phase 4: React UI

## Overview

React components that render the game state and provide user interface. The rendering is "dumb" - it just displays what's in the GameState.

## Files to Create

```
src/
  components/
    Game.js           # Main container, orchestrates everything
    Grid.js           # Renders the game grid
    Cell.js           # Renders a single cell with entity
    Entity.js         # Renders entity sprite
    HUD.js            # Player status display
    Menu.js           # Start screen, player selection
    GameOver.js       # Win/lose screen
    Controls.js       # Control reference display
    index.js          # Re-export all
  styles/
    Game.css
    Grid.css
    Menu.css
  App.js              # Root component
```

---

## App.js

Root component managing top-level state.

```jsx
function App() {
  const [screen, setScreen] = useState('menu'); // 'menu' | 'game' | 'gameover'
  const [playerCount, setPlayerCount] = useState(2);
  const [winner, setWinner] = useState(null);
  
  return (
    <div className="app">
      {screen === 'menu' && (
        <Menu 
          onStart={(count) => {
            setPlayerCount(count);
            setScreen('game');
          }}
        />
      )}
      {screen === 'game' && (
        <Game 
          playerCount={playerCount}
          onGameOver={(winner) => {
            setWinner(winner);
            setScreen('gameover');
          }}
        />
      )}
      {screen === 'gameover' && (
        <GameOver 
          winner={winner}
          onRestart={() => setScreen('game')}
          onMenu={() => setScreen('menu')}
        />
      )}
    </div>
  );
}
```

---

## Game.js

Main game container that sets up state and hooks.

### Responsibilities
- Create GameState instance
- Set up useGameLoop and useKeyboard hooks
- Render Grid and HUD
- Handle pause/resume

### Structure

```jsx
function Game({ playerCount, onGameOver }) {
  const [gameState] = useState(() => new GameState({ playerCount, level: 1 }));
  const [isRunning, setIsRunning] = useState(true);
  const [tick, setTick] = useState(0);
  
  // Set up game loop
  useGameLoop(gameState, isRunning, setTick);
  
  // Set up keyboard input
  useKeyboard(gameState, isRunning);
  
  // Check for game over
  useEffect(() => {
    if (gameState.gameOver) {
      setIsRunning(false);
      onGameOver(gameState.winner);
    }
  }, [tick, gameState, onGameOver]);
  
  // Preload sounds on mount
  useEffect(() => {
    soundManager.preload(SOUNDS);
    soundManager.playMusic('background_music');
    return () => soundManager.stopMusic();
  }, []);
  
  return (
    <div className="game">
      <HUD players={gameState.players} />
      <Grid grid={gameState.grid} />
      <Controls playerCount={playerCount} />
      <button onClick={() => setIsRunning(r => !r)}>
        {isRunning ? 'Pause' : 'Resume'}
      </button>
    </div>
  );
}
```

---

## Grid.js

Renders the game grid using CSS Grid layout.

### Props
- `grid` (Grid) - The game grid to render

### Structure

```jsx
function Grid({ grid }) {
  const cells = [];
  
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const location = new Location(row, col);
      const entity = grid.get(location);
      cells.push(
        <Cell 
          key={`${row}-${col}`}
          row={row}
          col={col}
          entity={entity}
        />
      );
    }
  }
  
  return (
    <div 
      className="grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
        gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
      }}
    >
      {cells}
    </div>
  );
}
```

### CSS (Grid.css)

```css
.grid {
  aspect-ratio: 13 / 11;  /* Match GRID_COLS / GRID_ROWS */
  max-width: 80vmin;
  max-height: 80vmin;
  margin: 0 auto;
  background: #333;
  border: 4px solid #666;
  gap: 1px;
}
```

---

## Cell.js

Renders a single grid cell.

### Props
- `row` (number)
- `col` (number)
- `entity` (Entity | null)

### Structure

```jsx
function Cell({ row, col, entity }) {
  // Checkerboard background for empty cells
  const isLight = (row + col) % 2 === 0;
  
  return (
    <div 
      className={`cell ${isLight ? 'cell--light' : 'cell--dark'}`}
    >
      {entity && <EntitySprite entity={entity} />}
    </div>
  );
}
```

### CSS

```css
.cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell--light {
  background: #4a4;
}

.cell--dark {
  background: #3a3;
}
```

---

## EntitySprite.js

Renders the sprite for an entity.

### Props
- `entity` (Entity)

### Structure

```jsx
function EntitySprite({ entity }) {
  const spriteName = getSpriteName(entity);
  const rotation = entity.direction || 0;
  
  return (
    <img
      className="entity-sprite"
      src={`/img/${spriteName}`}
      alt={entity.constructor.name}
      style={{
        transform: `rotate(${rotation}deg)`,
      }}
    />
  );
}

function getSpriteName(entity) {
  const baseName = entity.constructor.name;
  const suffix = entity.getImageSuffix?.() || '';
  
  // Map class names to sprite files
  const spriteMap = {
    'Wall': 'Wall.GIF',
    'Brick': 'Brick.GIF',
    'Fire': suffix === 'Middle' ? 'FireMiddle.GIF' : 'Fire.GIF',
    'Bomb': `Bomb${suffix}.gif`,
    'BomberBug': 'BomberBug.gif',
    'RandomBug': 'RandomBug.GIF',
    'Bonus': `Bonus${suffix}.GIF`,
  };
  
  return spriteMap[baseName] || 'Bonus.GIF';
}
```

### CSS

```css
.entity-sprite {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;  /* Keep pixel art crisp */
}
```

---

## HUD.js

Displays player status information.

### Props
- `players` (BomberBug[])

### Structure

```jsx
function HUD({ players }) {
  return (
    <div className="hud">
      {players.map((player, index) => (
        <PlayerStatus 
          key={index}
          player={player}
          playerIndex={index}
        />
      ))}
    </div>
  );
}

function PlayerStatus({ player, playerIndex }) {
  const isAlive = player.grid !== null;
  
  return (
    <div className={`player-status ${!isAlive ? 'player-status--dead' : ''}`}>
      <span 
        className="player-status__color"
        style={{ backgroundColor: PLAYER_COLORS[playerIndex] }}
      />
      <span className="player-status__name">
        Player {playerIndex + 1}
      </span>
      {isAlive && (
        <>
          <span>💣 {player.maxBombs}</span>
          <span>💥 {player.bombRadius}</span>
          {player.hasSuperBomb && <span>⭐</span>}
        </>
      )}
      {!isAlive && <span>💀</span>}
    </div>
  );
}
```

---

## Menu.js

Start screen with player count selection.

### Props
- `onStart` (function) - Called with player count

### Structure

```jsx
function Menu({ onStart }) {
  const [playerCount, setPlayerCount] = useState(2);
  
  return (
    <div className="menu">
      <h1>🐛 BomberBug 💣</h1>
      
      <div className="menu__players">
        <label>Players:</label>
        {[2, 3, 4].map(count => (
          <button
            key={count}
            className={playerCount === count ? 'active' : ''}
            onClick={() => setPlayerCount(count)}
          >
            {count}
          </button>
        ))}
      </div>
      
      <button 
        className="menu__start"
        onClick={() => onStart(playerCount)}
      >
        Start Game
      </button>
      
      <div className="menu__controls">
        <h2>Controls</h2>
        <ControlsList />
      </div>
    </div>
  );
}
```

---

## GameOver.js

End screen showing winner.

### Props
- `winner` (BomberBug | null)
- `onRestart` (function)
- `onMenu` (function)

### Structure

```jsx
function GameOver({ winner, onRestart, onMenu }) {
  return (
    <div className="game-over">
      <h1>Game Over!</h1>
      
      {winner ? (
        <p style={{ color: winner.color }}>
          {winner.color.toUpperCase()} Bug Wins! 🎉
        </p>
      ) : (
        <p>It's a Draw! 🤝</p>
      )}
      
      <div className="game-over__buttons">
        <button onClick={onRestart}>Play Again</button>
        <button onClick={onMenu}>Main Menu</button>
      </div>
    </div>
  );
}
```

---

## Controls.js

Reference card for player controls.

```jsx
function Controls({ playerCount }) {
  const controlLabels = ['↑', '↓', '←', '→', '💣'];
  
  return (
    <div className="controls">
      {Array.from({ length: playerCount }, (_, i) => (
        <div key={i} className="controls__player">
          <strong style={{ color: PLAYER_COLORS[i] }}>P{i + 1}:</strong>
          {Object.values(PLAYER_CONTROLS[i]).map((key, j) => (
            <span key={j}>
              {controlLabels[j]} {formatKey(key)}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function formatKey(code) {
  return code
    .replace('Key', '')
    .replace('Arrow', '')
    .replace('Numpad', 'Num');
}
```

---

## Responsive Design Considerations

```css
/* Mobile-friendly sizing */
@media (max-width: 600px) {
  .grid {
    max-width: 95vw;
  }
  
  .hud {
    flex-direction: column;
    font-size: 0.8rem;
  }
  
  .controls {
    display: none;  /* No keyboard on mobile anyway */
  }
}
```

---

## Performance Notes

1. **Memoize Cell components** - Use `React.memo()` to prevent re-rendering cells that haven't changed
2. **Key by location** - Use `${row}-${col}` as key, not index
3. **Avoid inline styles** - Move static styles to CSS classes
4. **Image preloading** - Load sprites in advance to prevent flicker

```jsx
// Memoized Cell
const Cell = React.memo(function Cell({ row, col, entity }) {
  // ...
}, (prev, next) => {
  // Only re-render if entity changed
  return prev.entity === next.entity;
});
```
