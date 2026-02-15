import { COLORS, FONTS, BG_SCALE, BG_Y_OFFSET } from '../Constants.js';

export default class WinScene extends Phaser.Scene {
    constructor() {
        super('WinScene');
    }

    init(data) {
        this.score = data.score || 0;
        this.isGameOver = data.isGameOver || false;
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.background = this.add.tileSprite(width / 2, BG_Y_OFFSET, width, height / 0.8, 'background');
        this.background.setOrigin(0.5, 0);
        this.background.setTileScale(BG_SCALE, BG_SCALE);

        // Success vs Game Over Theme
        const themeColor = this.isGameOver ? COLORS.TEXT_ALERT : COLORS.TEXT_ACCENT;
        const mainTitle = this.isGameOver ? 'GAME OVER' : 'VALENTINE SUCCESS!';
        const subTitle = this.isGameOver ? "Don't give up, Ella!" : "Amazing run, Ella!";

        // Title
        this.add.text(width / 2, height * 0.2, mainTitle, {
            fontFamily: FONTS.MAIN,
            fontSize: '56px',
            fill: themeColor,
            stroke: COLORS.TEXT_MAIN,
            strokeThickness: 8,
            fontWeight: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, height * 0.3, subTitle, {
            fontFamily: FONTS.MAIN,
            fontSize: FONTS.SIZE_S,
            fill: COLORS.TEXT_MAIN,
            stroke: COLORS.STROKE,
            strokeThickness: 4
        }).setOrigin(0.5);

        // Animated Score
        const scoreText = this.add.text(width / 2, height * 0.45, 'SCORE: 0', {
            fontFamily: FONTS.MAIN,
            fontSize: '64px',
            fill: COLORS.TEXT_MAIN,
            fontWeight: 'bold',
            stroke: themeColor,
            strokeThickness: 4
        }).setOrigin(0.5);

        let displayScore = 0;
        this.tweens.add({
            targets: { val: 0 },
            val: this.score,
            duration: 1000,
            ease: 'Power2',
            onUpdate: (tween) => {
                displayScore = Math.floor(tween.getValue());
                scoreText.setText(`SCORE: ${displayScore}`);
            }
        });

        // Buttons
        this.createButton(width / 2, height * 0.65, 'PLAY AGAIN', () => {
            this.scene.start('GameScene');
        });

        this.createButton(width / 2, height * 0.8, 'BACK TO MENU', () => {
            this.scene.start('MenuScene');
        });

        // Floating hearts
        this.createHearts(width, height);
    }

    createButton(x, y, text, callback) {
        const container = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 240, 60, 0xff0055, 1)
            .setInteractive({ useHandCursor: true });
        bg.setStrokeStyle(3, 0xffffff);

        const txt = this.add.text(0, 0, text, {
            fontFamily: FONTS.MAIN,
            fontSize: FONTS.SIZE_S,
            fill: COLORS.TEXT_MAIN,
            fontWeight: 'bold'
        }).setOrigin(0.5);

        container.add([bg, txt]);

        bg.on('pointerover', () => {
            container.setScale(1.1);
            bg.setFillStyle(0xff69b4);
        });

        bg.on('pointerout', () => {
            container.setScale(1.0);
            bg.setFillStyle(0xff0055);
        });

        bg.on('pointerdown', callback);

        return container;
    }

    createHearts(width, height) {
        for (let i = 0; i < 6; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const heart = this.add.image(x, y, 'heart');
            heart.setScale(Phaser.Math.FloatBetween(0.05, 0.1));
            heart.setAlpha(0.3);

            this.tweens.add({
                targets: heart,
                y: y - 50,
                alpha: 0,
                duration: 4000,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    update() {
        this.background.tilePositionX += 0.3;
    }
}
