// Physics & Camera
export const PHY_GRAVITY = 1000;
export const PLAYER_BOUNCE = 0.0;
export const PLAYER_SCALE = 0.25;
export const PLAYER_JUMP_VELOCITY = -650;
export const CAMERA_ZOOM = 0.8;

// Game Speed & Difficulty
export const GAME_SPEED_START = 5;
export const GAME_SPEED_INCREMENT = 0.1;
export const SCORE_INCREMENT_THRESHOLD = 500;
export const WIN_SCORE = 10000; // Increased for longer runs

// UI & Colors
export const COLORS = {
    TEXT_MAIN: '#ffffff',
    TEXT_ACCENT: '#ff0055',
    TEXT_HIGHLIGHT: '#ff69b4', // Hot pink
    TEXT_ALERT: '#ff0000',
    STROKE: '#000000',
    BACKGROUND_PINK: '#ffc0cb'
};

export const FONTS = {
    MAIN: 'Arial',
    SIZE_L: '48px',
    SIZE_M: '32px',
    SIZE_S: '24px',
    SIZE_XS: '20px'
};

// World & Assets
export const ASSETS = {
    ELLA: 'ella',
    GROUND: 'ground',
    BACKGROUND: 'background',
    OBSTACLE: 'apple_red',
    COLLECTIBLES: ['heart', 'rose', 'chocolate', 'apple_green']
};

// Background Physics
export const BG_SCALE = 1.25;
export const BG_PARALLAX = 0.2;
export const BG_Y_OFFSET = -80;

// Ground Geometry
export const GROUND_WIDTH = 190;
export const GROUND_SCALE = 0.4;
export const GROUND_Y_OFFSET = 128;
export const GROUND_OVERLAP = 2;
export const GROUND_CLEANUP_THRESHOLD = 2; // Multiplier of groundWidth

// Gap Logic
export const GAP_CHANCE = 0.2;
export const GAP_SAFETY_MARGIN = 0.7; // 70% of max jump distance
export const SAFE_ZONE_SCORE = 500;

// Player Settings
export const PLAYER_HITBOX_WIDTH_RATIO = 0.25;
export const PLAYER_HITBOX_HEIGHT_RATIO = 0.6;
export const PLAYER_HITBOX_X_OFFSET_RATIO = 0.37;
export const PLAYER_HITBOX_Y_OFFSET_RATIO = 0.2;
export const PLAYER_MAX_JUMPS = 2;

// Spawner Settings
export const SPAWN_INITIAL_DELAY = 1500;
export const SPAWN_X_OFFSET = 300;
export const SPAWN_CHANCE_OBSTACLE = 0.4;
export const OBSTACLE_SCALE = 0.12;
export const COLLECTIBLE_SCALE = 0.1;
export const OFFSCREEN_THRESHOLD = -200;
