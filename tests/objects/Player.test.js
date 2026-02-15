import Player from '../../src/objects/Player.js';
import { PLAYER_JUMP_VELOCITY } from '../../src/Constants.js';

describe('Player', () => {
    let scene;
    let player;

    beforeEach(() => {
        // Mock scene
        scene = {
            add: {
                existing: jest.fn(),
            },
            physics: {
                add: {
                    existing: jest.fn(),
                },
            },
        };

        player = new Player(scene, 100, 200);
    });

    test('should initialize correctly', () => {
        expect(player).toBeDefined();
        expect(scene.add.existing).toHaveBeenCalledWith(player);
        expect(scene.physics.add.existing).toHaveBeenCalledWith(player);
        expect(player.body.setGravityY).toHaveBeenCalled();
        expect(player.setBounce).toHaveBeenCalled();
        expect(player.setCollideWorldBounds).toHaveBeenCalledWith(false);
    });

    test('should jump if touching down', () => {
        player.body.touching.down = true;
        player.jump();
        expect(player.body.setVelocityY).toHaveBeenCalledWith(PLAYER_JUMP_VELOCITY);
    });


    test('should allow multiple jumps in the air', () => {
        player.body.touching.down = false;
        player.jumpCount = 0;

        // First air jump
        player.jump();
        expect(player.body.setVelocityY).toHaveBeenCalledWith(PLAYER_JUMP_VELOCITY);
        expect(player.jumpCount).toBe(1);

        // Second air jump
        player.jump();
        expect(player.body.setVelocityY).toHaveBeenCalledTimes(2);
        expect(player.jumpCount).toBe(2);

        // Third jump (should fail)
        player.jump();
        expect(player.body.setVelocityY).toHaveBeenCalledTimes(2);
        expect(player.jumpCount).toBe(2);
    });

    test('should reset jumpCount when grounded', () => {
        player.jumpCount = 2;
        player.body.touching.down = true;
        player.update();
        expect(player.jumpCount).toBe(0);
    });

    test('die should set tint', () => {
        player.setTint = jest.fn();
        player.die();
        expect(player.setTint).toHaveBeenCalledWith(0xff0000);
    });
});
