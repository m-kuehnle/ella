import {
    PHY_GRAVITY, PLAYER_BOUNCE, PLAYER_SCALE, PLAYER_JUMP_VELOCITY, ASSETS,
    PLAYER_HITBOX_WIDTH_RATIO, PLAYER_HITBOX_HEIGHT_RATIO,
    PLAYER_HITBOX_X_OFFSET_RATIO, PLAYER_HITBOX_Y_OFFSET_RATIO,
    PLAYER_MAX_JUMPS
} from '../Constants.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, ASSETS.ELLA);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(false);
        this.setScale(PLAYER_SCALE);

        // FORGIVING PLAYER HITBOX - Tighter to match visual sprite
        this.body.setSize(
            this.width * PLAYER_HITBOX_WIDTH_RATIO,
            this.height * PLAYER_HITBOX_HEIGHT_RATIO
        );
        this.body.setOffset(
            this.width * PLAYER_HITBOX_X_OFFSET_RATIO,
            this.height * PLAYER_HITBOX_Y_OFFSET_RATIO
        );

        this.setBounce(PLAYER_BOUNCE);
        this.setGravityY(PHY_GRAVITY);

        this.jumpCount = 0;
    }

    update() {
        if (this.body.touching.down) {
            this.jumpCount = 0;
        }
    }

    jump() {
        if (this.body.touching.down || this.jumpCount < PLAYER_MAX_JUMPS) {
            this.setVelocityY(PLAYER_JUMP_VELOCITY);
            this.jumpCount++;
        }
    }

    die() {
        this.setTint(0xff0000);
    }
}
