import Logger from '../utils/Logger.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        Logger.info('MenuScene create() called', 'MenuScene');
        const { width, height } = this.scale;

        // Background
        this.background = this.add.tileSprite(width / 2, height / 2, width, height, 'background');

        // Title
        const title = this.add.text(width / 2, height / 3, "Ella's\nSuper Run", {
            font: '48px Arial',
            fill: '#ff0055',
            align: 'center',
            stroke: '#ffffff',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Tween title
        this.tweens.add({
            targets: title,
            scale: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Ella Sprite
        const ella = this.add.image(width / 2, height / 2, 'ella');
        ella.setScale(0.4);

        // Start Button
        const startButton = this.add.text(width / 2, height * 0.70, 'Tap to Start', {
            font: '32px Arial',
            fill: '#ffffff',
            backgroundColor: '#ff69b4',
            padding: { x: 30, y: 15 },
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 2, fill: true }
        }).setOrigin(0.5).setInteractive();

        // High Score
        const highScore = localStorage.getItem('ella_highscore') || 0;
        this.add.text(width / 2, height * 0.85, `High Score: ${highScore}`, {
            font: '24px Arial',
            fill: '#ffffff',
            stroke: '#ff0055',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Button Pulse
        this.tweens.add({
            targets: startButton,
            scale: 1.05,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }

    update() {
        this.background.tilePositionX += 1;
    }
}
