import Logger from '../utils/Logger.js';
import Player from '../objects/Player.js';
import Spawner from '../objects/Spawner.js';
import {
    PHY_GRAVITY, CAMERA_ZOOM,
    GAME_SPEED_START, GAME_SPEED_INCREMENT, SCORE_INCREMENT_THRESHOLD,
    WIN_SCORE, COLORS, FONTS, ASSETS
} from '../Constants.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        Logger.info('Game Scene Created. Starting run.', 'GameScene');
        const { width, height } = this.scale;

        // Calculate visible area for zoom (0.8x)
        const visibleWidth = width / CAMERA_ZOOM;
        const visibleHeight = height / CAMERA_ZOOM;

        // Background
        this.background = this.add.tileSprite(width / 2, height / 2, visibleWidth, visibleHeight, 'background');
        this.background.setScrollFactor(0);

        // Ground
        this.ground = this.add.tileSprite(width / 2, height - 30, visibleWidth, 100, 'ground');
        this.physics.add.existing(this.ground, true);
        this.ground.body.updateFromGameObject();

        // Player
        this.player = new Player(this, 100, height - 200);

        // Collision
        this.physics.add.collider(this.player, this.ground);

        // Input
        this.input.on('pointerdown', (pointer) => {
            // Ignore if clicking on pause button
            if (this.pauseButton && this.pauseButton.getBounds().contains(pointer.x, pointer.y)) return;
            this.jump();
        }, this);
        this.input.keyboard.on('keydown-SPACE', this.jump, this);
        this.input.keyboard.on('keydown-P', this.togglePause, this);

        // Game Speed & Score
        this.gameSpeed = GAME_SPEED_START;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('ella_highscore')) || 0;

        // UI
        this.createUI(width);

        // Spawner
        this.spawner = new Spawner(this);

        // Colliders for items
        this.physics.add.collider(this.spawner.getObstacles(), this.ground);
        this.physics.add.collider(this.spawner.getCollectibles(), this.ground);

        this.physics.add.overlap(this.player, this.spawner.getObstacles(), this.hitObstacle, null, this);
        this.physics.add.overlap(this.player, this.spawner.getCollectibles(), this.collectItem, null, this);

        // Spawning Event
        this.spawnTimer = this.time.addEvent({
            delay: 1500,
            callback: () => this.spawner.spawn(this.gameSpeed),
            callbackScope: this,
            loop: true
        });

        // Camera
        this.cameras.main.setZoom(CAMERA_ZOOM);

        this.isGameOver = false;
        this.isPaused = false;
    }

    createUI(width) {
        // Score
        this.scoreText = this.add.text(40, 40, 'Score: 0', {
            fontSize: FONTS.SIZE_S,
            fill: COLORS.TEXT_MAIN,
            stroke: COLORS.STROKE,
            strokeThickness: 3,
            fontFamily: FONTS.MAIN
        }).setScrollFactor(0);

        // High Score
        this.highScoreText = this.add.text(40, 70, `High Score: ${this.highScore}`, {
            fontSize: FONTS.SIZE_XS,
            fill: COLORS.TEXT_HIGHLIGHT,
            stroke: COLORS.STROKE,
            strokeThickness: 3,
            fontFamily: FONTS.MAIN
        }).setScrollFactor(0);

        // Health
        this.health = 100;
        this.healthText = this.add.text(width - 40, 40, 'Energy: 100%', {
            fontSize: FONTS.SIZE_S,
            fill: COLORS.TEXT_HIGHLIGHT,
            stroke: COLORS.STROKE,
            strokeThickness: 3,
            fontFamily: FONTS.MAIN
        }).setOrigin(1, 0).setScrollFactor(0);

        // Pause Button
        this.pauseButton = this.add.text(width - 40, 80, 'II', {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        })
            .setOrigin(1, 0)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => this.togglePause());
    }

    update() {
        if (this.isGameOver || this.isPaused) return;

        // Move background
        this.background.tilePositionX += this.gameSpeed;
        this.ground.tilePositionX += this.gameSpeed;

        // Update Spawner (clean up off-screen)
        this.spawner.update();

        // Increase difficulty
        if (this.score > 0 && this.score % SCORE_INCREMENT_THRESHOLD === 0) {
            this.gameSpeed += GAME_SPEED_INCREMENT;
        }

        this.score += 1;
        this.scoreText.setText('Score: ' + Math.floor(this.score));

        // Update High Score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreText.setText('High Score: ' + Math.floor(this.highScore));
            localStorage.setItem('ella_highscore', Math.floor(this.highScore));
        }

        // Win Condition
        if (this.score >= WIN_SCORE) {
            this.winGame();
        }
    }

    jump() {
        if (!this.isGameOver && !this.isPaused) {
            this.player.jump();
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.physics.pause();
            this.spawnTimer.paused = true;
            this.pauseText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'PAUSED', {
                fontSize: '48px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6
            }).setOrigin(0.5).setScrollFactor(0);
        } else {
            this.physics.resume();
            this.spawnTimer.paused = false;
            if (this.pauseText) this.pauseText.destroy();
        }
    }

    hitObstacle(player, obstacle) {
        obstacle.destroy();
        this.cameras.main.shake(200, 0.01);
        this.health -= 25;
        Logger.warn(`Ella hit an obstacle! Health: ${this.health}%`, 'GameScene');
        this.updateHealthUI();
        if (this.health <= 0) this.gameOver();
    }

    collectItem(player, item) {
        const type = item.texture.key;
        item.destroy();
        if (type === 'chocolate' || type === 'apple_green') {
            this.health = Math.min(this.health + 10, 100);
            Logger.success(`Collected ${type}! Health healed to ${this.health}%`, 'GameScene');
        } else {
            this.score += 100;
            Logger.info(`Collected ${type}! Bonus score: +100`, 'GameScene');
        }
        this.updateHealthUI();
    }

    updateHealthUI() {
        this.healthText.setText('Energy: ' + this.health + '%');
        this.healthText.setColor(this.health < 30 ? COLORS.TEXT_ALERT : COLORS.TEXT_HIGHLIGHT);
    }

    gameOver() {
        Logger.error(`Game Over! Final Score: ${Math.floor(this.score)}`, 'GameScene');
        this.isGameOver = true;
        this.physics.pause();
        this.spawnTimer.paused = true;
        this.player.die();
        this.time.delayedCall(1000, () => this.scene.start('MenuScene'));
    }

    winGame() {
        Logger.success(`WIN! Ella reached the goal with score: ${Math.floor(this.score)}`, 'GameScene');
        this.isGameOver = true;
        this.physics.pause();
        this.spawnTimer.paused = true;
        this.scene.start('WinScene', { score: Math.floor(this.score) });
    }
}
