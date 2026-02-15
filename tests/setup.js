require('jest-environment-jsdom');

global.Phaser = {
    Game: class { },
    Scene: class { },
    GameObjects: {
        Sprite: class { },
        Image: class { },
        Text: class { },
        Group: class {
            create() { return { setOrigin: () => { }, setScrollFactor: () => { }, setScale: () => { }, setDepth: () => { }, setVisible: () => { } } }
            getChildren() { return [] }
            clear() { }
        },
        Container: class {
            add() { }
            setPosition() { }
            setDepth() { }
            setScrollFactor() { }
        },
        Rectangle: class {
            setOrigin() { return this; }
            setScrollFactor() { return this; }
            setDepth() { return this; }
            setVisible() { return this; }
            setScale() { return this; }
        }
    },
    Physics: {
        Arcade: {
            Sprite: class {
                constructor() {
                    this.body = {
                        setVelocityX: jest.fn(),
                        setVelocityY: jest.fn(),
                        setGravityY: jest.fn(),
                        setCollideWorldBounds: jest.fn(),
                        setSize: jest.fn(),
                        setOffset: jest.fn(),
                        setImmovable: jest.fn(),
                        enable: true,
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0,
                        touching: { down: false },
                        wasTouching: { down: false },
                        blocked: { down: false }
                    };
                    this.scene = {
                        events: { on: jest.fn(), off: jest.fn() }
                    }
                }
                setCollideWorldBounds = jest.fn(function (v) { this.body.setCollideWorldBounds(v); return this; });
                setBounce = jest.fn().mockReturnThis();
                setGravityY = jest.fn(function (v) { this.body.setGravityY(v); return this; });
                setVelocityY = jest.fn(function (v) { this.body.setVelocityY(v); return this; });
                setVelocityX = jest.fn(function (v) { this.body.setVelocityX(v); return this; });
                setTint = jest.fn().mockReturnThis();
                setScale = jest.fn().mockReturnThis();
                setDepth = jest.fn().mockReturnThis();
                setOrigin = jest.fn().mockReturnThis();
                setScrollFactor = jest.fn().mockReturnThis();
                play = jest.fn().mockReturnThis();
                anims = { play: jest.fn(), stop: jest.fn() };
                destroy = jest.fn();
                setPosition = jest.fn().mockReturnThis();
                setVisible = jest.fn().mockReturnThis();
                setTexture = jest.fn().mockReturnThis();
            }
        }
    },
    Input: {
        Keyboard: {
            KeyCodes: {
                SPACE: 32,
                UP: 38,
                DOWN: 40
            }
        }
    },
    Math: {
        Between: (min, max) => min,
        FloatBetween: (min, max) => min,
        Vector2: class {
            constructor(x, y) { this.x = x; this.y = y; }
        }
    }
};

// Mock Canvas/Context if needed
HTMLCanvasElement.prototype.getContext = () => ({
    fillRect: () => { },
    clearRect: () => { },
    getImageData: (x, y, w, h) => ({ data: new Array(w * h * 4) }),
    putImageData: () => { },
    createImageData: () => ([]),
    setTransform: () => { },
    drawImage: () => { },
    save: () => { },
    fillText: () => { },
    restore: () => { },
    beginPath: () => { },
    moveTo: () => { },
    lineTo: () => { },
    closePath: () => { },
    stroke: () => { },
    translate: () => { },
    scale: () => { },
    rotate: () => { },
    arc: () => { },
    fill: () => { },
    measureText: () => ({ width: 0 }),
    transform: () => { },
    rect: () => { },
    clip: () => { },
});

window.HTMLCanvasElement.prototype.getContext = HTMLCanvasElement.prototype.getContext;
