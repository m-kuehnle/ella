import Logger from '../utils/Logger.js';
import { COLORS, FONTS, ASSETS, BG_SCALE, BG_Y_OFFSET } from '../Constants.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        Logger.info('MenuScene create() called', 'MenuScene');
        const { width, height } = this.scale;

        // Background
        this.background = this.add.tileSprite(width / 2, BG_Y_OFFSET, width, height / 0.8, 'background');
        this.background.setOrigin(0.5, 0);
        this.background.setTileScale(BG_SCALE, BG_SCALE);

        // Add some floating hearts in background
        this.createHearts(width, height);

        // Title Group for better positioning
        const titleY = height * 0.25;

        // Shadow/Glow layer
        this.add.text(width / 2 + 4, titleY + 4, "Ella's\nValentine Run", {
            fontFamily: FONTS.MAIN,
            fontSize: '64px',
            fill: COLORS.STROKE,
            align: 'center',
            fontWeight: 'bold'
        }).setOrigin(0.5).setAlpha(0.3);

        const title = this.add.text(width / 2, titleY, "Ella's\nValentine Run", {
            fontFamily: FONTS.MAIN,
            fontSize: '64px',
            fill: COLORS.TEXT_ACCENT,
            align: 'center',
            stroke: COLORS.TEXT_MAIN,
            strokeThickness: 8,
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // Floating Title Animation
        this.tweens.add({
            targets: title,
            y: titleY - 20,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Ella Sprite with a "breath" animation
        const ella = this.add.image(width / 2, height * 0.5, ASSETS.ELLA);
        ella.setScale(0.4);
        this.tweens.add({
            targets: ella,
            scale: 0.42,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Quad.easeInOut'
        });

        // Start Button
        const btnY = height * 0.75;
        const startBtn = this.add.container(width / 2, btnY);

        const btnBg = this.add.rectangle(0, 0, 260, 70, 0xff0055, 1)
            .setInteractive({ useHandCursor: true });
        btnBg.setStrokeStyle(4, 0xffffff);

        const btnText = this.add.text(0, 0, 'START GAME', {
            fontFamily: FONTS.MAIN,
            fontSize: FONTS.SIZE_M,
            fill: COLORS.TEXT_MAIN,
            fontWeight: 'bold'
        }).setOrigin(0.5);

        startBtn.add([btnBg, btnText]);

        // Button Interactions
        btnBg.on('pointerover', () => {
            this.tweens.add({
                targets: startBtn,
                scale: 1.1,
                duration: 100
            });
            btnBg.setFillStyle(0xff69b4);
        });

        btnBg.on('pointerout', () => {
            this.tweens.add({
                targets: startBtn,
                scale: 1.0,
                duration: 100
            });
            btnBg.setFillStyle(0xff0055);
        });

        btnBg.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // High Score
        const highScoreValue = localStorage.getItem('ella_highscore') || 0;
        this.add.text(width / 2, height * 0.9, `BEST SCORE: ${Math.floor(highScoreValue)}`, {
            fontFamily: FONTS.MAIN,
            fontSize: FONTS.SIZE_S,
            fill: COLORS.TEXT_ACCENT,
            fontWeight: 'bold',
            stroke: COLORS.STROKE,
            strokeThickness: 2
        }).setOrigin(0.5);
    }

    createHearts(width, height) {
        for (let i = 0; i < 10; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const heart = this.add.image(x, y, 'heart');
            heart.setScale(Phaser.Math.FloatBetween(0.05, 0.15));
            heart.setAlpha(Phaser.Math.FloatBetween(0.2, 0.5));

            this.tweens.add({
                targets: heart,
                y: y - 100,
                x: x + Phaser.Math.Between(-50, 50),
                alpha: 0,
                duration: Phaser.Math.Between(3000, 6000),
                repeat: -1,
                ease: 'Linear'
            });
        }
    }

    update() {
        this.background.tilePositionX += 0.5;
    }
}
