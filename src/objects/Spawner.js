import {
    ASSETS, GROUND_Y_OFFSET, SPAWN_X_OFFSET, SPAWN_CHANCE_OBSTACLE,
    OBSTACLE_SCALE, COLLECTIBLE_SCALE, OFFSCREEN_THRESHOLD
} from '../Constants.js';

export default class Spawner {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = this.scene.physics.add.group();
        this.collectibles = this.scene.physics.add.group();
    }

    spawn(gameSpeed) {
        const { width, height } = this.scene.scale;
        const bottomY = height - GROUND_Y_OFFSET;

        // Spawn further off-screen to handle wider views
        const spawnX = width + SPAWN_X_OFFSET;

        if (Math.random() < SPAWN_CHANCE_OBSTACLE) {
            this.spawnObstacle(spawnX, bottomY, gameSpeed);
        } else {
            this.spawnCollectible(spawnX, bottomY, gameSpeed);
        }
    }

    spawnObstacle(x, bottomY, gameSpeed) {
        // Obstable (Red Apple) ALWAYS on ground to force jump
        const yPos = bottomY - 20;

        const obstacle = this.obstacles.create(x, yPos, ASSETS.OBSTACLE);
        obstacle.setScale(OBSTACLE_SCALE);
        obstacle.setVelocityX(-gameSpeed * 60);
        obstacle.body.allowGravity = false;
        obstacle.setImmovable(true);

        // FORGIVING CIRCLE HITBOX
        obstacle.body.setCircle(obstacle.width * 0.3, obstacle.width * 0.2, obstacle.height * 0.2);
    }

    spawnCollectible(x, bottomY, gameSpeed) {
        const types = ASSETS.COLLECTIBLES;
        const type = Phaser.Utils.Array.GetRandom(types);

        // Default spawn logic
        let yPos = bottomY - 50 - (Math.random() * 100);

        // Green Apple (Health) ALWAYS in air to force jump
        if (type === 'apple_green') {
            yPos = bottomY - 150 - (Math.random() * 50);
        }

        const item = this.collectibles.create(x, yPos, type);
        item.setScale(COLLECTIBLE_SCALE);
        item.setVelocityX(-gameSpeed * 60);
        item.body.allowGravity = false;

        // FORGIVING HITBOX
        item.body.setCircle(item.width * 0.4, item.width * 0.1, item.height * 0.1);
    }

    update() {
        // Remove off-screen items
        this.obstacles.getChildren().forEach(obstacle => {
            if (obstacle.x < OFFSCREEN_THRESHOLD) {
                obstacle.destroy();
            }
        });

        this.collectibles.getChildren().forEach(item => {
            if (item.x < OFFSCREEN_THRESHOLD) {
                item.destroy();
            }
        });
    }

    getObstacles() {
        return this.obstacles;
    }

    getCollectibles() {
        return this.collectibles;
    }
}
