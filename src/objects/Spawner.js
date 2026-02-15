import { ASSETS } from '../Constants.js';

export default class Spawner {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = this.scene.physics.add.group();
        this.collectibles = this.scene.physics.add.group();
    }

    spawn(gameSpeed) {
        const { width, height } = this.scene.scale;
        const groundHeight = 50;
        const bottomY = height - groundHeight;

        // Spawn further off-screen to handle wider views
        const spawnX = width + 300;

        if (Math.random() < 0.4) {
            this.spawnObstacle(spawnX, bottomY, gameSpeed);
        } else {
            this.spawnCollectible(spawnX, bottomY, gameSpeed);
        }
    }

    spawnObstacle(x, bottomY, gameSpeed) {
        // Obstable (Red Apple) ALWAYS on ground to force jump
        const yPos = bottomY - 20;

        const obstacle = this.obstacles.create(x, yPos, ASSETS.OBSTACLE);
        obstacle.setScale(0.12);
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
        item.setScale(0.1);
        item.setVelocityX(-gameSpeed * 60);
        item.body.allowGravity = false;

        // FORGIVING HITBOX
        item.body.setCircle(item.width * 0.4, item.width * 0.1, item.height * 0.1);
    }

    update() {
        // Remove off-screen items
        this.obstacles.getChildren().forEach(obstacle => {
            if (obstacle.x < -200) {
                obstacle.destroy();
            }
        });

        this.collectibles.getChildren().forEach(item => {
            if (item.x < -200) {
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
