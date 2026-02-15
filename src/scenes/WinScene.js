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
        this.add.tileSprite(0, 0, width, height, 'background').setOrigin(0, 0);

        // Message
        const title = this.isGameOver ? "Game Over!" : "Level Clear!";
        const message = `${title}\n\nGreat Job Ella!\n\nFinal Score: ${this.score}`;

        this.add.text(width / 2, height / 3, message, {
            font: '32px Arial',
            fill: this.isGameOver ? '#ff0000' : '#ff0055',
            align: 'center',
            stroke: '#ffffff',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Buttons
        const continueButton = this.add.text(width / 2, height * 0.7, 'PLAY AGAIN', {
            font: '40px Arial',
            fill: '#ffffff',
            backgroundColor: '#ff69b4',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive();

        continueButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // Menu Button
        const menuText = this.add.text(width / 2, height * 0.90, 'Back to Menu', {
            font: '24px Arial',
            fill: '#ffffff',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5).setInteractive();

        menuText.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}
