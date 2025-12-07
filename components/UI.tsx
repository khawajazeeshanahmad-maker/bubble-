import React from 'react';
import { Play, RotateCcw, Home as HomeIcon, ShoppingCart, Volume2, VolumeX, Pause, Store, X } from 'lucide-react';
import { SKINS, Skin } from '../constants';

// --- BUTTON COMPONENT ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon';
  icon?: React.ReactNode;
}
export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', icon, className = '', ...props }) => {
  const base = "transform active:scale-95 transition-all duration-200 font-bold rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider";
  
  // Neon Styles
  const styles = {
    primary: "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)] py-4 px-12 text-lg border border-cyan-300",
    secondary: "bg-transparent text-white border border-white/30 hover:bg-white/10 hover:border-white/60 py-3 px-8 text-md backdrop-blur-sm",
    icon: "p-3 bg-white/5 border border-white/20 hover:bg-white/15 text-cyan-400 backdrop-blur-sm rounded-full"
  };
  
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {icon}
      {children}
    </button>
  );
};

// --- MENU ---
interface MenuProps {
  highScore: number;
  totalCoins: number;
  onPlay: () => void;
  onShop: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}
export const Menu: React.FC<MenuProps> = ({ highScore, totalCoins, onPlay, onShop, soundEnabled, toggleSound }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 backdrop-blur-sm animate-fade-in">
    <div className="mb-16 text-center">
      <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-600 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] italic tracking-tighter transform -skew-x-12">
        NEON<br/>RISE
      </h1>
      <p className="text-cyan-200/60 mt-2 font-light tracking-[0.3em] text-sm">ASCEND THE VOID</p>
    </div>
    
    <div className="space-y-6 flex flex-col items-center w-full max-w-xs relative z-20">
      <Button onClick={onPlay} icon={<Play size={20} fill="currentColor" />}>Start Game</Button>
      
      <div className="flex gap-4 w-full justify-center">
        <Button variant="secondary" className="flex-1" onClick={onShop} icon={<Store size={18} />}>Skins</Button>
      </div>

      <div className="flex items-center gap-4 bg-black/60 border border-white/10 px-6 py-2 rounded-full text-white/80 font-mono text-sm">
         <span className="text-yellow-400 flex items-center gap-1"><span className="text-lg">●</span> {totalCoins}</span>
         <span className="w-px h-4 bg-white/20"></span>
         <span className="text-cyan-400">BEST: {highScore}</span>
      </div>
    </div>

    <button onClick={toggleSound} className="absolute top-6 right-6 p-3 text-white/50 hover:text-white transition-colors">
      {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
    </button>
    
    <div className="absolute bottom-8 text-white/20 text-xs uppercase tracking-widest">
      Swipe to Move
    </div>
  </div>
);

// --- HUD ---
interface HUDProps {
  score: number;
  coins: number;
  onPause: () => void;
}
export const HUD: React.FC<HUDProps> = ({ score, coins, onPause }) => (
  <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10 pointer-events-none select-none">
    <div className="flex flex-col gap-1">
      <div className="text-5xl font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] italic tracking-tighter">
        {score}
      </div>
    </div>
    
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-yellow-400 font-bold text-lg bg-black/40 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/10">
        <span>●</span> {coins}
      </div>
      <button onClick={onPause} className="pointer-events-auto p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white backdrop-blur-sm transition-colors border border-white/10">
        <Pause size={24} />
      </button>
    </div>
  </div>
);

// --- GAME OVER ---
interface GameOverProps {
  score: number;
  highScore: number;
  earnedCoins: number;
  onRetry: () => void;
  onHome: () => void;
}
export const GameOver: React.FC<GameOverProps> = ({ score, highScore, earnedCoins, onRetry, onHome }) => (
  <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white">
    <h2 className="text-5xl font-black mb-8 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)] tracking-widest uppercase">Failed</h2>
    
    <div className="flex gap-4 mb-8">
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col items-center w-32">
        <div className="text-xs uppercase text-white/40 tracking-widest mb-1">Score</div>
        <div className="text-3xl font-bold text-white">{score}</div>
      </div>
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col items-center w-32">
        <div className="text-xs uppercase text-white/40 tracking-widest mb-1">Best</div>
        <div className="text-3xl font-bold text-cyan-400">{highScore}</div>
      </div>
    </div>
    
    <div className="mb-10 text-yellow-400 font-mono flex items-center gap-2 bg-yellow-400/10 px-4 py-2 rounded-full border border-yellow-400/20">
      <span>●</span> +{earnedCoins} collected
    </div>

    <div className="flex flex-col gap-4 w-56">
      <Button onClick={onRetry} icon={<RotateCcw size={18} />}>Retry</Button>
      <Button variant="secondary" onClick={onHome} icon={<HomeIcon size={18} />}>Main Menu</Button>
    </div>
  </div>
);

// --- SHOP ---
interface ShopProps {
  coins: number;
  activeSkinId: string;
  onBuy: (skin: Skin) => void;
  onEquip: (skin: Skin) => void;
  unlockedSkins: string[];
  onClose: () => void;
}
export const Shop: React.FC<ShopProps> = ({ coins, activeSkinId, onBuy, onEquip, unlockedSkins, onClose }) => (
  <div className="absolute inset-0 z-20 bg-[#050505] flex flex-col">
    <div className="p-6 flex justify-between items-center bg-white/5 border-b border-white/10">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2 uppercase tracking-widest">
        <ShoppingCart className="text-cyan-400" /> Skins
      </h2>
      <button onClick={onClose} className="text-white/50 hover:text-white">
        <X size={24} />
      </button>
    </div>
    
    <div className="px-6 py-4 bg-black/40 flex justify-between items-center">
       <span className="text-white/60 text-sm uppercase tracking-wider">Balance</span>
       <span className="text-yellow-400 font-mono font-bold">● {coins}</span>
    </div>

    <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-4 content-start">
      {SKINS.map((skin) => {
        const isUnlocked = unlockedSkins.includes(skin.id);
        const isActive = activeSkinId === skin.id;

        return (
          <div key={skin.id} className={`relative bg-white/5 p-4 rounded-xl flex flex-col items-center gap-4 border transition-all ${isActive ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] bg-cyan-900/10' : 'border-white/10 hover:border-white/30'}`}>
            <div 
              className="w-16 h-16 rounded-full shadow-lg relative transition-transform hover:scale-110" 
              style={{ 
                background: skin.color,
                boxShadow: `0 0 20px ${skin.glow}` 
              }} 
            >
              <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-pulse"></div>
            </div>
            
            <div className="text-center w-full">
              <div className="font-bold text-white uppercase tracking-wider text-sm mb-2">{skin.name}</div>
              
              {isActive ? (
                <div className="text-cyan-400 text-xs font-bold uppercase tracking-widest py-2 border-t border-white/10 w-full">Selected</div>
              ) : isUnlocked ? (
                <button onClick={() => onEquip(skin)} className="bg-white/10 hover:bg-white/20 text-white text-xs py-2 px-4 rounded w-full font-semibold uppercase tracking-wider transition-colors">
                  Equip
                </button>
              ) : (
                <button 
                  onClick={() => onBuy(skin)} 
                  disabled={coins < skin.price}
                  className={`text-xs py-2 px-4 rounded w-full font-bold uppercase tracking-wider flex items-center justify-center gap-1 ${coins >= skin.price ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
                >
                  <span>●</span> {skin.price}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);