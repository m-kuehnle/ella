import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import WinScene from './scenes/WinScene.js';

// Baseline dimensions
const BASE_WIDTH = 360;
const BASE_HEIGHT = 640;

// Calculate dynamic width to favor wider devices on desktop
const getWidth = () => {
    const ratio = window.innerWidth / window.innerHeight;
    // Limit width to 640 to keep it from stretching too much on Ultrawide
    if (ratio > 1) return Math.min(640, BASE_HEIGHT * ratio);
    return BASE_WIDTH;
};

const config = {
    type: Phaser.AUTO,
    width: getWidth(),
    height: BASE_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#ffc0cb',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: true
        }
    },
    scene: [
        BootScene,
        PreloadScene,
        MenuScene,
        GameScene,
        WinScene
    ]
};

const game = new Phaser.Game(config);
window.game = game;
