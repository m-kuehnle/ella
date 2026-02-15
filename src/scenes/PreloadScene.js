import Logger from '../utils/Logger.js';
import TextureProcessor from '../utils/TextureProcessor.js';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        Logger.info('Starting asset preload...', 'PreloadScene');
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.progressBar = this.add.graphics();
        this.progressBox = this.add.graphics();
        this.progressBox.fillStyle(0x222222, 0.8);
        this.progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        this.loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading Assets...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        this.loadingText.setOrigin(0.5, 0.5);

        this.load.on('progress', (value) => {
            this.progressBar.clear();
            this.progressBar.fillStyle(0xff69b4, 1);
            this.progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('loaderror', (file) => {
            Logger.error(`Failed to load asset: ${file.key}`, 'PreloadScene');
        });

        this.load.path = 'assets/';
        this.load.image('ella_raw', 'ella.png');
        this.load.image('ground_raw', 'ground.png');
        this.load.image('background', 'background.png');

        // Load item assets (they currently have white backgrounds)
        this.load.image('apple_red_raw', 'apple_red.png');
        this.load.image('apple_green_raw', 'apple_green.png');
        this.load.image('heart_raw', 'heart.png');
        this.load.image('rose_raw', 'rose.png');
        this.load.image('chocolate_raw', 'chocolate.png');
    }

    processImages() {
        const processor = new TextureProcessor(this);

        try {
            processor.processAll({
                'ella': 'ella_raw',
                'apple_red': 'apple_red_raw',
                'apple_green': 'apple_green_raw',
                'heart': 'heart_raw',
                'rose': 'rose_raw',
                'chocolate': 'chocolate_raw',
                'ground': 'ground_raw'
            });

            Logger.success('Texture processing complete.', 'PreloadScene');
        } catch (error) {
            Logger.error(`Critical error in texture processing: ${error.message}`, 'PreloadScene');
        }

        Logger.info('Attempting to start MenuScene...', 'PreloadScene');
        this.scene.start('MenuScene');
    }

    create() {
        Logger.success('Assets loaded. Processing...', 'PreloadScene');

        if (this.progressBar) this.progressBar.destroy();
        if (this.progressBox) this.progressBox.destroy();
        if (this.loadingText) this.loadingText.destroy();

        // Process images then start menu
        // Use a small delay to ensure UI updates before freezing for processing
        this.time.delayedCall(50, () => {
            this.processImages();
        });
    }
}
