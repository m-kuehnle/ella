import Logger from '../utils/Logger.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load minimal assets here if needed (e.g. loading bar)
    }

    create() {
        Logger.info('Boot Scene Started.', 'BootScene');
        this.scene.start('PreloadScene');
    }
}
