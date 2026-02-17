import React, { useState, useCallback } from 'react';
import Menu from './components/Menu.jsx';
import Game from './components/Game.jsx';
import GameOver from './components/GameOver.jsx';
import './styles/Game.css';

/**
 * Root component: manages screen transitions between menu, game, and game-over.
 */
function App() {
  const [screen, setScreen] = useState('menu');      // 'menu' | 'game' | 'gameover'
  const [playerCount, setPlayerCount] = useState(2);
  const [winner, setWinner] = useState(null);
  // Key to force-remount <Game> on restart
  const [gameKey, setGameKey] = useState(0);

  const handleStart = useCallback((count) => {
    setPlayerCount(count);
    setWinner(null);
    setGameKey(k => k + 1);
    setScreen('game');
  }, []);

  const handleGameOver = useCallback((w) => {
    setWinner(w);
    setScreen('gameover');
  }, []);

  const handleRestart = useCallback(() => {
    setWinner(null);
    setGameKey(k => k + 1);
    setScreen('game');
  }, []);

  const handleMenu = useCallback(() => {
    setScreen('menu');
  }, []);

  return (
    <div className="app">
      {screen === 'menu' && (
        <Menu onStart={handleStart} />
      )}
      {screen === 'game' && (
        <Game
          key={gameKey}
          playerCount={playerCount}
          onGameOver={handleGameOver}
        />
      )}
      {screen === 'gameover' && (
        <GameOver
          winner={winner}
          onRestart={handleRestart}
          onMenu={handleMenu}
        />
      )}
    </div>
  );
}

export default App;
