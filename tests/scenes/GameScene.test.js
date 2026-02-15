import GameScene from '../../src/scenes/GameScene.js';
import Player from '../../src/objects/Player.js';
import Spawner from '../../src/objects/Spawner.js';
import Logger from '../../src/utils/Logger.js';

// Mock dependencies
jest.mock('../../src/objects/Player.js');
jest.mock('../../src/objects/Spawner.js');
jest.mock('../../src/utils/Logger.js');

describe('GameScene', () => {
    let scene;
    let mockPlayer;
    let mockSpawner;

    beforeEach(() => {
        // Reset mocks
        Player.mockClear();
        Spawner.mockClear();
        Logger.info.mockClear();
        Logger.warn.mockClear();
        Logger.error.mockClear();

        scene = new GameScene();

        // Mock Phaser Scene properties/systems
        scene.add = {
            tileSprite: jest.fn().mockReturnValue({
                setOrigin: jest.fn(),
                setScrollFactor: jest.fn(),
                setTileScale: jest.fn()
            }),
            text: jest.fn().mockReturnValue({
                setScrollFactor: jest.fn().mockReturnThis(),
                setOrigin: jest.fn().mockReturnThis(),
                setInteractive: jest.fn().mockReturnThis(),
                on: jest.fn().mockReturnThis(),
                setText: jest.fn(),
                setColor: jest.fn(),
                destroy: jest.fn(),
                getBounds: jest.fn().mockReturnValue({ contains: jest.fn() })
            }),
            existing: jest.fn()
        };

        scene.physics = {
            add: {
                group: jest.fn().mockReturnValue({
                    create: jest.fn().mockReturnValue({
                        setOrigin: jest.fn(),
                        setDisplaySize: jest.fn(),
                        setScale: jest.fn(),
                        refreshBody: jest.fn(),
                        width: 476,
                        body: {
                            setSize: jest.fn(),
                            setOffset: jest.fn(),
                            updateFromGameObject: jest.fn()
                        }
                    }),
                    getChildren: jest.fn().mockReturnValue([])
                }),
                collider: jest.fn(),
                overlap: jest.fn(),
                existing: jest.fn()
            },
            pause: jest.fn(),
            resume: jest.fn()
        };

        scene.scale = { width: 800, height: 600 };

        scene.input = {
            on: jest.fn(),
            keyboard: {
                on: jest.fn()
            }
        };

        scene.cameras = {
            main: {
                setZoom: jest.fn(),
                shake: jest.fn(),
                setBackgroundColor: jest.fn()
            }
        };

        scene.time = {
            addEvent: jest.fn().mockReturnValue({ paused: false }),
            delayedCall: jest.fn()
        };

        scene.scene = {
            start: jest.fn()
        };

        // Setup mock instances
        mockPlayer = {
            jump: jest.fn(),
            update: jest.fn(),
            die: jest.fn(),
            y: 500
        };
        Player.mockImplementation(() => mockPlayer);

        mockSpawner = {
            getObstacles: jest.fn().mockReturnValue([]),
            getCollectibles: jest.fn().mockReturnValue([]),
            spawn: jest.fn(),
            update: jest.fn()
        };
        Spawner.mockImplementation(() => mockSpawner);

        // Mock localStorage
        Storage.prototype.getItem = jest.fn(() => null);
        Storage.prototype.setItem = jest.fn();
    });

    test('should create scene elements correctly', () => {
        scene.create();

        expect(scene.add.tileSprite).toHaveBeenCalled();
        expect(Player).toHaveBeenCalled();
        expect(Spawner).toHaveBeenCalled();
        expect(scene.physics.add.collider).toHaveBeenCalled();
        expect(scene.time.addEvent).toHaveBeenCalled();
    });

    test('should handle jumping input', () => {
        scene.create();

        // Simulate jump
        scene.jump();
        expect(mockPlayer.jump).toHaveBeenCalled();
    });

    test('should toggle pause', () => {
        scene.create();

        // Pause
        scene.togglePause();
        expect(scene.isPaused).toBe(true);
        expect(scene.physics.pause).toHaveBeenCalled();

        // Resume
        scene.togglePause();
        expect(scene.isPaused).toBe(false);
        expect(scene.physics.resume).toHaveBeenCalled();
    });

    test('should handle hitting obstacle', () => {
        scene.create();
        const mockObstacle = { destroy: jest.fn() };

        const initialHealth = scene.health;
        scene.hitObstacle(mockPlayer, mockObstacle);

        expect(mockObstacle.destroy).toHaveBeenCalled();
        expect(scene.cameras.main.shake).toHaveBeenCalled();
        expect(scene.health).toBeLessThan(initialHealth);
        expect(Logger.warn).toHaveBeenCalled();
    });

    test('should collect items', () => {
        scene.create();

        // Test Score Item
        const mockCoin = { destroy: jest.fn(), texture: { key: 'coin' } };
        const initialScore = scene.score;
        scene.collectItem(mockPlayer, mockCoin);

        expect(mockCoin.destroy).toHaveBeenCalled();
        expect(scene.score).toBeGreaterThan(initialScore);

        // Test Health Item
        scene.health = 50;
        const mockChoco = { destroy: jest.fn(), texture: { key: 'chocolate' } };
        scene.collectItem(mockPlayer, mockChoco);

        expect(scene.health).toBeGreaterThan(50);
    });

    test('should trigger game over on death', () => {
        scene.create();

        scene.gameOver();

        expect(scene.isGameOver).toBe(true);
        expect(scene.physics.pause).toHaveBeenCalled();
        expect(mockPlayer.die).toHaveBeenCalled();
        expect(scene.time.delayedCall).toHaveBeenCalledWith(1000, expect.any(Function));

        // Simulate delayed call callback
        const callback = scene.time.delayedCall.mock.calls[0][1];
        callback();
        expect(scene.scene.start).toHaveBeenCalledWith('WinScene', expect.any(Object));
    });

    test('should increase difficulty based on score', () => {
        scene.create();
        scene.update();
        expect(mockSpawner.update).toHaveBeenCalled();
    });

    describe('Gameplay Mechanics Logic', () => {
        // Helper to simulate bounding box intersection logic
        const getBounds = (obj) => ({
            x: obj.x || 0,
            y: obj.y || 0,
            width: obj.width || 50,
            height: obj.height || 50,
            left: obj.x || 0,
            right: (obj.x || 0) + (obj.width || 50),
            top: obj.y || 0,
            bottom: (obj.y || 0) + (obj.height || 50)
        });

        const checkOverlap = (a, b) => {
            const boundsA = getBounds(a);
            const boundsB = getBounds(b);
            return !(boundsB.left > boundsA.right ||
                boundsB.right < boundsA.left ||
                boundsB.top > boundsA.bottom ||
                boundsB.bottom < boundsA.top);
        };

        test('jumping should avoid ground obstacles', () => {
            scene.create();

            // Ground level obstacle
            const obstacle = { x: 100, y: 472, width: 32, height: 32, destroy: jest.fn() };

            // Player on ground
            mockPlayer.x = 100;
            mockPlayer.y = 472;
            mockPlayer.width = 32;
            mockPlayer.height = 32;

            expect(checkOverlap(mockPlayer, obstacle)).toBe(true);
            scene.hitObstacle(mockPlayer, obstacle);
            expect(scene.health).toBe(75);

            // Reset and jumping player (Y is lower/smaller for "up")
            scene.health = 100;
            mockPlayer.y = 300; // Jump height

            expect(checkOverlap(mockPlayer, obstacle)).toBe(false);
            // Since overlap is false, hitObstacle would NOT be triggered by physics engine in real game
        });

        test('climbing/jumping should allow getting high-altitude items', () => {
            scene.create();
            const item = { x: 100, y: 300, width: 32, height: 32, destroy: jest.fn(), texture: { key: 'heart' } };

            // Player on ground (too low)
            mockPlayer.x = 100;
            mockPlayer.y = 472;
            expect(checkOverlap(mockPlayer, item)).toBe(false);

            // Player jumping
            mockPlayer.y = 300;
            expect(checkOverlap(mockPlayer, item)).toBe(true);
            scene.collectItem(mockPlayer, item);
            expect(scene.score).toBe(100);
        });

        test('jumping over gaps should keep player alive, while falling into them triggers game over', () => {
            scene.create();
            scene.groundY = 500;

            // Case 1: Player is jumping (High enough)
            mockPlayer.y = 300;
            scene.update();
            expect(scene.isGameOver).toBe(false);

            // Case 2: Player falls below ground level (e.g. into a gap)
            mockPlayer.y = 650; // groundY (500) + 100 = 600 limit
            scene.update();
            expect(scene.isGameOver).toBe(true);
            expect(Logger.error).toHaveBeenCalledWith(expect.stringContaining('Game Over'), 'GameScene');
        });
    });
});
