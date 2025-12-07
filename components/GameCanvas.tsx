import React, { useRef, useEffect } from 'react';
import { 
  GameState, 
  GRAVITY, 
  JUMP_FORCE, 
  GAME_WIDTH, 
  PLAYER_RADIUS,
  COLORS,
  PLATFORM_WIDTH_MIN,
  PLATFORM_WIDTH_MAX,
  PLATFORM_HEIGHT,
  Platform,
  Particle,
  COIN_RADIUS,
  Coin,
  Obstacle,
  OBSTACLE_RADIUS,
  MOVEMENT_LERP
} from '../constants';
import { audioManager } from '../utils/audio';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  onScoreUpdate: (score: number) => void;
  onCoinsUpdate: (coins: number) => void;
  activeSkin: { color: string; glow: string };
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  setGameState, 
  onScoreUpdate, 
  onCoinsUpdate,
  activeSkin 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game Logic References
  const engineRef = useRef({
    player: { x: GAME_WIDTH / 2, y: 0, vx: 0, vy: 0 },
    targetX: GAME_WIDTH / 2, // Where the user is touching
    platforms: [] as Platform[],
    coins: [] as Coin[],
    obstacles: [] as Obstacle[],
    particles: [] as Particle[],
    cameraY: 0,
    score: 0,
    maxHeight: 0,
    gameHeight: 0,
    lastTime: 0,
    gameOverHandled: false
  });

  // Handle Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        engineRef.current.gameHeight = canvas.height;
      }
    };
    
    window.addEventListener('resize', resize);
    resize();
    initGame();

    return () => window.removeEventListener('resize', resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initGame = () => {
    const { current: engine } = engineRef;
    const startY = engine.gameHeight - 100;
    
    engine.player = { x: GAME_WIDTH / 2, y: startY, vx: 0, vy: JUMP_FORCE };
    engine.targetX = GAME_WIDTH / 2;
    engine.score = 0;
    engine.maxHeight = 0;
    engine.cameraY = 0;
    engine.particles = [];
    engine.coins = [];
    engine.obstacles = [];
    engine.gameOverHandled = false;
    
    // Initial Platforms
    engine.platforms = [];
    // Start platform
    engine.platforms.push({
        id: -1, x: 0, y: startY + 50, width: GAME_WIDTH, type: 'STATIC'
    });
    
    // Generate initial set
    for (let i = 0; i < 10; i++) {
        spawnPlatform(startY - (i * 100 + 100));
    }
    
    onScoreUpdate(0);
  };

  const spawnPlatform = (y: number) => {
      const engine = engineRef.current;
      const width = PLATFORM_WIDTH_MIN + Math.random() * (PLATFORM_WIDTH_MAX - PLATFORM_WIDTH_MIN);
      const x = Math.random() * (GAME_WIDTH - width);
      
      let type: Platform['type'] = 'STATIC';
      // Increase difficulty based on height (score)
      if (Math.abs(y) > 2000 && Math.random() > 0.7) type = 'MOVING';
      if (Math.abs(y) > 4000 && Math.random() > 0.8) type = 'BREAKING';

      engine.platforms.push({ id: Math.random(), x, y, width, type });

      // Chance for coin
      if (Math.random() > 0.8) {
          engine.coins.push({
              id: Math.random(),
              x: x + width / 2,
              y: y - 40,
              collected: false
          });
      }

      // Chance for obstacle (Spike)
      if (Math.abs(y) > 1000 && Math.random() > 0.9) {
         // Place obstacle in random spot, not necessarily on platform
         engine.obstacles.push({
             id: Math.random(),
             x: Math.random() * GAME_WIDTH,
             y: y - 50,
             type: 'SPIKE'
         });
      }
  };

  // Reset when starting play
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
       initGame();
       engineRef.current.lastTime = performance.now();
       requestAnimationFrame(gameLoop);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  const createParticles = (x: number, y: number, color: string, count = 5) => {
    for (let i = 0; i < count; i++) {
      engineRef.current.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1.0,
        color
      });
    }
  };

  const gameLoop = (time: number) => {
    if (gameState !== GameState.PLAYING) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const engine = engineRef.current;
    engine.lastTime = time;

    // --- PHYSICS ---

    // Horizontal Movement (Smooth Damp to target)
    // We update targetX via touch events
    const dx = engine.targetX - engine.player.x;
    engine.player.x += dx * MOVEMENT_LERP;
    
    // Vertical Movement
    engine.player.vy += GRAVITY;
    engine.player.y += engine.player.vy;

    // Screen wrapping (Horizontal)
    if (engine.player.x > GAME_WIDTH) engine.player.x = 0;
    if (engine.player.x < 0) engine.player.x = GAME_WIDTH;

    // Camera Logic: Keep player near center vertically
    // We interpret "Up" as negative Y in Canvas
    const targetCamY = engine.player.y - engine.gameHeight * 0.6;
    if (targetCamY < engine.cameraY) {
        engine.cameraY = targetCamY;
        const currentHeight = Math.floor(Math.abs(engine.cameraY / 10));
        if (currentHeight > engine.score) {
            engine.score = currentHeight;
            onScoreUpdate(engine.score);
        }
    }

    // --- COLLISIONS ---

    // Platforms
    // Only collide if falling downwards
    if (engine.player.vy > 0) { 
        engine.platforms.forEach(p => {
            if (p.broken) return;
            // AABB Collision with tolerance
            if (
                engine.player.x + PLAYER_RADIUS > p.x &&
                engine.player.x - PLAYER_RADIUS < p.x + p.width &&
                engine.player.y + PLAYER_RADIUS >= p.y && 
                engine.player.y + PLAYER_RADIUS <= p.y + 20 // tolerance
            ) {
                // Bounce
                engine.player.vy = JUMP_FORCE;
                createParticles(engine.player.x, p.y, activeSkin.glow, 4);
                audioManager.playJump();

                if (p.type === 'BREAKING') {
                    p.broken = true;
                    createParticles(p.x + p.width/2, p.y, COLORS.platformBreak, 8);
                }
            }
        });
    }

    // Moving Platforms Logic
    engine.platforms.forEach(p => {
        if (p.type === 'MOVING') {
            if (p.movingRight === undefined) p.movingRight = Math.random() > 0.5;
            p.x += p.movingRight ? 2 : -2;
            if (p.x > GAME_WIDTH - p.width) p.movingRight = false;
            if (p.x < 0) p.movingRight = true;
        }
    });

    // Coins
    engine.coins.forEach(c => {
        if (c.collected) return;
        const dist = Math.hypot(engine.player.x - c.x, engine.player.y - c.y);
        if (dist < PLAYER_RADIUS + COIN_RADIUS) {
            c.collected = true;
            onCoinsUpdate(1);
            createParticles(c.x, c.y, '#FFD700', 6);
            audioManager.playCoin();
        }
    });

    // Obstacles
    engine.obstacles.forEach(o => {
        const dist = Math.hypot(engine.player.x - o.x, engine.player.y - o.y);
        if (dist < PLAYER_RADIUS + OBSTACLE_RADIUS) {
            // Hit obstacle
            if (!engine.gameOverHandled) {
                engine.gameOverHandled = true;
                audioManager.playGameOver();
                setGameState(GameState.GAME_OVER);
            }
        }
    });

    // Death (Fall off bottom of screen)
    if (engine.player.y > engine.cameraY + engine.gameHeight + 100 && !engine.gameOverHandled) {
        engine.gameOverHandled = true;
        audioManager.playGameOver();
        setGameState(GameState.GAME_OVER);
        return;
    }

    // Level Generation / Cleanup
    // Remove items far below camera
    const cleanupThreshold = engine.cameraY + engine.gameHeight + 200;
    engine.platforms = engine.platforms.filter(p => p.y < cleanupThreshold);
    engine.coins = engine.coins.filter(c => c.y < cleanupThreshold);
    engine.obstacles = engine.obstacles.filter(o => o.y < cleanupThreshold);

    // Generate new platforms above
    const highestPlatformY = engine.platforms.length > 0 ? Math.min(...engine.platforms.map(p => p.y)) : 0;
    if (highestPlatformY > engine.cameraY - 100) {
        spawnPlatform(highestPlatformY - (60 + Math.random() * 60));
    }

    // Particles
    engine.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
    });
    engine.particles = engine.particles.filter(p => p.life > 0);

    // --- RENDERING ---
    const scale = canvas.width / GAME_WIDTH;
    
    // Clear & Background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(0, -engine.cameraY);

    // Grid Effect in Background (Parallax-ish)
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let i=0; i<GAME_WIDTH; i+=50) {
        ctx.moveTo(i, engine.cameraY);
        ctx.lineTo(i, engine.cameraY + engine.gameHeight / scale);
    }
    ctx.stroke();

    // Platforms
    engine.platforms.forEach(p => {
        if (p.broken) return;
        
        ctx.shadowBlur = 10;
        if (p.type === 'MOVING') {
            ctx.fillStyle = COLORS.platformMoving;
            ctx.shadowColor = COLORS.platformMoving;
        } else if (p.type === 'BREAKING') {
            ctx.fillStyle = COLORS.platformBreak;
            ctx.shadowColor = COLORS.platformBreak;
        } else {
            ctx.fillStyle = COLORS.platforms;
            ctx.shadowColor = COLORS.platforms;
        }

        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.width, PLATFORM_HEIGHT, 4);
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    // Coins
    engine.coins.forEach(c => {
        if (c.collected) return;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FFD700';
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(c.x, c.y, COIN_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    // Obstacles
    engine.obstacles.forEach(o => {
        ctx.shadowBlur = 10;
        ctx.shadowColor = COLORS.obstacle;
        ctx.fillStyle = COLORS.obstacle;
        
        ctx.beginPath();
        // Draw spike
        ctx.moveTo(o.x, o.y - OBSTACLE_RADIUS);
        ctx.lineTo(o.x + OBSTACLE_RADIUS, o.y + OBSTACLE_RADIUS);
        ctx.lineTo(o.x - OBSTACLE_RADIUS, o.y + OBSTACLE_RADIUS);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    // Player
    ctx.shadowBlur = 20;
    ctx.shadowColor = activeSkin.glow;
    ctx.fillStyle = activeSkin.color;
    ctx.beginPath();
    ctx.arc(engine.player.x, engine.player.y, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    // Inner white core
    ctx.shadowBlur = 5;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(engine.player.x, engine.player.y, PLAYER_RADIUS * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Particles
    engine.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    });

    ctx.restore();
    requestAnimationFrame(gameLoop);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (gameState !== GameState.PLAYING) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scale = GAME_WIDTH / rect.width;
    const x = (e.clientX - rect.left) * scale;
    
    engineRef.current.targetX = x;
  };

  // For touch devices specifically to ensure smooth dragging
  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameState !== GameState.PLAYING) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scale = GAME_WIDTH / rect.width;
    const x = (e.touches[0].clientX - rect.left) * scale;
    
    engineRef.current.targetX = x;
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block touch-none cursor-crosshair"
      onPointerMove={handlePointerMove}
      onTouchMove={handleTouchMove}
      onPointerDown={handlePointerMove} // Initial tap moves target
    />
  );
};

export default GameCanvas;