// Game Physics & Config
export const GRAVITY = 0.6;
export const JUMP_FORCE = -14;
export const MOVEMENT_LERP = 0.15; // How snappy the horizontal movement is
export const TERMINAL_VELOCITY = 15;

// Dimensions
export const GAME_WIDTH = 400;
export const PLATFORM_WIDTH_MIN = 70;
export const PLATFORM_WIDTH_MAX = 110;
export const PLATFORM_HEIGHT = 12;
export const PLAYER_RADIUS = 12;
export const COIN_RADIUS = 8;
export const OBSTACLE_RADIUS = 15;

// Colors (Neon Palette)
export const COLORS = {
  background: '#050505',
  text: '#FFFFFF',
  textAccent: '#00FFCC', // Neon Cyan
  platforms: '#00E5FF', // Cyan
  platformMoving: '#E040FB', // Neon Purple
  platformBreak: '#FFEA00', // Neon Yellow
  obstacle: '#FF1744', // Neon Red
  particles: ['#00E5FF', '#E040FB', '#FFEA00', '#FFFFFF']
};

// Types
export enum GameState {
  MENU,
  PLAYING,
  PAUSED,
  GAME_OVER,
  SHOP
}

export interface Platform {
  id: number;
  x: number;
  y: number;
  width: number;
  type: 'STATIC' | 'MOVING' | 'BREAKING';
  movingRight?: boolean;
  broken?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface Coin {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  type: 'SPIKE' | 'ORB';
}

export interface Skin {
  id: string;
  name: string;
  color: string;
  price: number;
  glow: string;
}

export const SKINS: Skin[] = [
  { id: 'cyan', name: 'Cyber', color: '#00E5FF', price: 0, glow: '#00E5FF' },
  { id: 'pink', name: 'Plasma', color: '#E040FB', price: 100, glow: '#E040FB' },
  { id: 'lime', name: 'Toxic', color: '#76FF03', price: 250, glow: '#76FF03' },
  { id: 'white', name: 'Starlight', color: '#FFFFFF', price: 500, glow: '#FFFFFF' },
  { id: 'red', name: 'Fury', color: '#FF1744', price: 1000, glow: '#FF1744' },
];