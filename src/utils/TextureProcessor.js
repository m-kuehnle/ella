import Logger from './Logger.js';

export default class TextureProcessor {
    constructor(scene) {
        this.scene = scene;
    }

    makeTransparent(sourceKey, targetKey, threshold = 230) {
        if (!this.scene.textures.exists(sourceKey)) {
            Logger.warn(`Source image missing for transparency: ${sourceKey}`, 'TextureProcessor');
            return;
        }

        try {
            const source = this.scene.textures.get(sourceKey).getSourceImage();
            const canvas = this.scene.textures.createCanvas(targetKey, source.width, source.height);
            const context = canvas.getContext();

            context.drawImage(source, 0, 0);
            const imageData = context.getImageData(0, 0, source.width, source.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // If the pixel is very close to white, make it transparent
                if (r > threshold && g > threshold && b > threshold) {
                    data[i + 3] = 0;
                }
            }

            context.putImageData(imageData, 0, 0);
            canvas.refresh();
            // Logger.info(`Processed transparency for: ${targetKey}`, 'TextureProcessor');
        } catch (e) {
            Logger.error(`Failed to process texture ${targetKey}: ${e.message}`, 'TextureProcessor');
        }
    }

    processAll(mapping) {
        Object.entries(mapping).forEach(([target, source]) => {
            this.makeTransparent(source, target);
        });
        Logger.success('All textures processed.', 'TextureProcessor');
    }
}
