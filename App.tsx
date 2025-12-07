import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import { Menu, HUD, GameOver, Shop } from './components/UI';
import { GameState, SKINS, Skin } from './constants';
import { audioManager } from './utils/audio';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0); // Current run coins
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('neon_highscore') || '0'));
  const [totalCoins, setTotalCoins] = useState(() => parseInt(localStorage.getItem('neon_coins') || '0'));
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(() => JSON.parse(localStorage.getItem('neon_skins') || '["cyan"]'));
  const [activeSkinId, setActiveSkinId] = useState(() => localStorage.getItem('neon_active_skin') || 'cyan');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Persistence
  useEffect(() => { localStorage.setItem('neon_highscore', highScore.toString()); }, [highScore]);
  useEffect(() => { localStorage.setItem('neon_coins', totalCoins.toString()); }, [totalCoins]);
  useEffect(() => { localStorage.setItem('neon_skins', JSON.stringify(unlockedSkins)); }, [unlockedSkins]);
  useEffect(() => { localStorage.setItem('neon_active_skin', activeSkinId); }, [activeSkinId]);

  const activeSkin = SKINS.find(s => s.id === activeSkinId) || SKINS[0];

  const handleStartGame = () => {
    setScore(0);
    setCoins(0);
    setGameState(GameState.PLAYING);
    if(soundEnabled) audioManager.toggle(true);
  };

  const handleGameOver = () => {
    setGameState(GameState.GAME_OVER);
    if (score > highScore) setHighScore(score);
    setTotalCoins(prev => prev + coins);
  };

  const handleScoreUpdate = (newScore: number) => {
    setScore(newScore);
  };

  const handleCoinsUpdate = (amount: number) => {
    setCoins(prev => prev + amount);
  };

  const handleBuySkin = (skin: Skin) => {
    if (totalCoins >= skin.price) {
      setTotalCoins(prev => prev - skin.price);
      setUnlockedSkins(prev => [...prev, skin.id]);
    }
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    audioManager.toggle(newState);
  };

  return (
    <div className="relative w-full h-screen bg-[#020202] overflow-hidden flex justify-center">
      {/* Main Game Container */}
      <div className="relative w-full max-w-md h-full shadow-2xl overflow-hidden border-x border-white/5">
        
        {/* The Game Layer */}
        <GameCanvas
          gameState={gameState}
          setGameState={setGameState}
          onScoreUpdate={handleScoreUpdate}
          onCoinsUpdate={handleCoinsUpdate}
          activeSkin={activeSkin}
        />

        {/* UI Overlays */}
        {gameState === GameState.MENU && (
          <Menu
            highScore={highScore}
            totalCoins={totalCoins}
            onPlay={handleStartGame}
            onShop={() => setGameState(GameState.SHOP)}
            soundEnabled={soundEnabled}
            toggleSound={toggleSound}
          />
        )}

        {gameState === GameState.PLAYING && (
          <HUD score={score} coins={coins} onPause={() => setGameState(GameState.PAUSED)} />
        )}

        {gameState === GameState.PAUSED && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
             <div className="bg-[#111] border border-white/10 p-8 rounded-2xl flex flex-col gap-4 shadow-[0_0_30px_rgba(0,229,255,0.1)] w-64">
                <h2 className="text-2xl font-bold text-center text-white tracking-widest uppercase mb-4">Paused</h2>
                <button onClick={() => setGameState(GameState.PLAYING)} className="bg-cyan-500 hover:bg-cyan-400 text-black py-3 rounded-lg font-bold uppercase tracking-wider">Resume</button>
                <button onClick={() => setGameState(GameState.MENU)} className="bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg font-bold uppercase tracking-wider">Quit</button>
             </div>
          </div>
        )}

        {gameState === GameState.GAME_OVER && (
          <GameOver
            score={score}
            highScore={highScore}
            earnedCoins={coins}
            onRetry={handleStartGame}
            onHome={() => setGameState(GameState.MENU)}
          />
        )}

        {gameState === GameState.SHOP && (
          <Shop
            coins={totalCoins}
            activeSkinId={activeSkinId}
            unlockedSkins={unlockedSkins}
            onBuy={handleBuySkin}
            onEquip={(skin) => setActiveSkinId(skin.id)}
            onClose={() => setGameState(GameState.MENU)}
          />
        )}
      </div>
    </div>
  );
}