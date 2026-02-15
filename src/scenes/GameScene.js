import Logger from '../utils/Logger.js';
import Player from '../objects/Player.js';
import Spawner from '../objects/Spawner.js';
import {
    PHY_GRAVITY, CAMERA_ZOOM,
    GAME_SPEED_START, GAME_SPEED_INCREMENT, SCORE_INCREMENT_THRESHOLD,
    PLAYER_JUMP_VELOCITY, WIN_SCORE, COLORS, FONTS, ASSETS,
    BG_SCALE, BG_PARALLAX, BG_Y_OFFSET,
    GROUND_WIDTH, GROUND_SCALE, GROUND_Y_OFFSET, GROUND_OVERLAP, GROUND_CLEANUP_THRESHOLD,
    GAP_CHANCE, GAP_SAFETY_MARGIN, SAFE_ZONE_SCORE,
    SPAWN_INITIAL_DELAY
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

        // Background - Position at the very top of the camera view (BG_Y_OFFSET) and set height to visibleHeight
        // This ensures the background perfectly matches the BG_SCALE
        const bgScale = BG_SCALE;
        this.background = this.add.tileSprite(width / 2, BG_Y_OFFSET, visibleWidth, visibleHeight, 'background');
        this.background.setOrigin(0.5, 0);
        this.background.setScrollFactor(0);
        this.background.setTileScale(bgScale, bgScale);

        // Ground - Now a group of segments to create gaps
        this.groundWidth = GROUND_WIDTH; // 640 * 0.3 matches ground.png width scaled
        this.groundY = height - GROUND_Y_OFFSET;
        this.safeZoneScore = SAFE_ZONE_SCORE; // No gaps until this score

        this.grounds = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        // Current X for the next segment to spawn
        this.nextGroundX = -this.groundWidth;
        this.waitingForGapEnd = false;

        // Initialize ground with segments filling the visible screen
        const rightEdge = width / CAMERA_ZOOM;
        while (this.nextGroundX < rightEdge + this.groundWidth) {
            this.addGroundSegment(this.nextGroundX);
            this.nextGroundX += this.groundWidth - 2; // Slight overlap
        }

        // Player
        this.player = new Player(this, 100, height - 200);

        // Collision
        this.physics.add.collider(this.player, this.grounds);

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
        // Spawner for obstacles and collectibles
        this.spawner = new Spawner(this);
        this.spawnTimer = this.time.addEvent({
            delay: SPAWN_INITIAL_DELAY,
            callback: () => this.spawner.spawn(this.gameSpeed),
            callbackScope: this,
            loop: true
        });

        // Colliders for items
        this.physics.add.collider(this.spawner.getObstacles(), this.grounds);
        this.physics.add.collider(this.spawner.getCollectibles(), this.grounds);

        this.physics.add.overlap(this.player, this.spawner.getObstacles(), this.hitObstacle, null, this);
        this.physics.add.overlap(this.player, this.spawner.getCollectibles(), this.collectItem, null, this);

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
            fontSize: FONTS.SIZE_M,
            fill: COLORS.TEXT_MAIN,
            backgroundColor: COLORS.STROKE,
            padding: { x: 10, y: 5 }
        })
            .setOrigin(1, 0)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => this.togglePause());
    }

    update() {
        if (this.isGameOver || this.isPaused) return;

        // Parallax background
        this.background.tilePositionX += this.gameSpeed * BG_PARALLAX;

        // Ground movement
        this.grounds.getChildren().forEach(segment => {
            segment.x -= this.gameSpeed;
            // Clean up off-screen grounds
            if (segment.x < -this.groundWidth * GROUND_CLEANUP_THRESHOLD) {
                segment.destroy();
            }
        });

        // Handle Ground Spawning
        const rightEdge = this.scale.width / CAMERA_ZOOM;
        this.nextGroundX -= this.gameSpeed;

        if (this.nextGroundX < rightEdge + this.groundWidth) {
            // Physics-based gap limit calculation
            const jumpTime = 2 * (Math.abs(PLAYER_JUMP_VELOCITY) / PHY_GRAVITY);
            const maxJumpDistance = this.gameSpeed * jumpTime * 60;
            const maxSafeGap = maxJumpDistance * GAP_SAFETY_MARGIN;

            // Random chance for a gap
            const isSafeZone = this.score < this.safeZoneScore;

            if (Math.random() < GAP_CHANCE && !this.waitingForGapEnd && !isSafeZone) {
                const gapWidth = this.groundWidth + Math.random() * (maxSafeGap - this.groundWidth);
                this.nextGroundX += gapWidth;
                this.waitingForGapEnd = true;
                Logger.info(`Gap generated! Width: ${Math.round(gapWidth)}px (Max safe: ${Math.round(maxSafeGap)}px)`, 'GameScene');
            } else {
                this.addGroundSegment(this.nextGroundX);
                this.nextGroundX += this.groundWidth - GROUND_OVERLAP;
                this.waitingForGapEnd = false;
            }
        }

        // Check for fall (if player falls below ground level)
        if (this.player.y > this.groundY + 100) {
            this.gameOver();
        }

        // Update player (reset jump count)
        this.player.update();

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
        // Check for Win
        if (this.score >= WIN_SCORE) {
            this.winGame();
        }
    }

    winGame() {
        Logger.success(`Success! Target Score Reached: ${WIN_SCORE}`, 'GameScene');
        this.isGameOver = false; // It's a win, not a game over loss
        this.physics.pause();
        this.spawnTimer.paused = true;
        this.time.delayedCall(1000, () => this.scene.start('WinScene', { score: Math.floor(this.score), isGameOver: false }));
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
                fontSize: FONTS.SIZE_L,
                fill: COLORS.TEXT_MAIN,
                stroke: COLORS.STROKE,
                strokeThickness: 6,
                fontFamily: FONTS.MAIN
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
        this.time.delayedCall(1000, () => this.scene.start('WinScene', { score: Math.floor(this.score), isGameOver: true }));
    }

    addGroundSegment(x) {
        const segment = this.grounds.create(x, this.groundY, ASSETS.GROUND);
        segment.setOrigin(0, 0);
        segment.setScale(GROUND_SCALE);

        // Physics body: make it match the top part of the ground
        // We set it to a fixed height to make landing consistent
        segment.body.setSize(segment.width, 100);
        segment.body.setOffset(0, 0);
        segment.refreshBody();

        return segment;
    }
}
