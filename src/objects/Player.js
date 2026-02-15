import {
    PHY_GRAVITY, PLAYER_BOUNCE, PLAYER_SCALE, ASSETS
} from '../Constants.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, ASSETS.ELLA);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setScale(PLAYER_SCALE);

        // FORGIVING PLAYER HITBOX - Tighter to match visual sprite
        this.body.setSize(this.width * 0.25, this.height * 0.6);
        this.body.setOffset(this.width * 0.37, this.height * 0.2);

        this.setBounce(PLAYER_BOUNCE);
        this.setGravityY(PHY_GRAVITY);
    }

    jump() {
        if (this.body.touching.down) {
            this.setVelocityY(-650);
        }
    }

    die() {
        this.setTint(0xff0000);
    }
}
