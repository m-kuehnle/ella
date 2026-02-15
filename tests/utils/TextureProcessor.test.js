import TextureProcessor from '../../src/utils/TextureProcessor.js';
import Logger from '../../src/utils/Logger.js';

jest.mock('../../src/utils/Logger.js');

describe('TextureProcessor', () => {
    let scene;
    let processor;
    let mockContext;
    let mockCanvas;

    beforeEach(() => {
        mockContext = {
            drawImage: jest.fn(),
            getImageData: jest.fn(() => ({
                data: new Uint8ClampedArray([
                    255, 255, 255, 255, // White pixel (should become transparent)
                    0, 0, 0, 255        // Black pixel (should stay opaque)
                ])
            })),
            putImageData: jest.fn(),
        };

        mockCanvas = {
            getContext: jest.fn(() => mockContext),
            refresh: jest.fn(),
        };

        scene = {
            textures: {
                exists: jest.fn(),
                get: jest.fn(),
                createCanvas: jest.fn(() => mockCanvas),
            },
        };

        processor = new TextureProcessor(scene);
    });

    test('should warn if source texture does not exist', () => {
        scene.textures.exists.mockReturnValue(false);
        processor.makeTransparent('missing', 'target');
        expect(Logger.warn).toHaveBeenCalledWith(expect.stringContaining('missing'), 'TextureProcessor');
    });

    test('should process texture if exists', () => {
        scene.textures.exists.mockReturnValue(true);
        scene.textures.get.mockReturnValue({
            getSourceImage: () => ({ width: 2, height: 1 })
        });

        processor.makeTransparent('source', 'target');

        expect(scene.textures.createCanvas).toHaveBeenCalledWith('target', 2, 1);
        expect(mockContext.drawImage).toHaveBeenCalled();
        expect(mockContext.getImageData).toHaveBeenCalled();
        expect(mockContext.putImageData).toHaveBeenCalled();

        // check if white pixel was made transparent
        // The first pixel is white (255, 255, 255), so alpha (index 3) should be set to 0
        const putImageDataCall = mockContext.putImageData.mock.calls[0];
        const imageData = putImageDataCall[0];
        expect(imageData.data[3]).toBe(0); // Transparent
        expect(imageData.data[7]).toBe(255); // Opaque (Black pixel)
    });

    test('should handle errors gracefully', () => {
        scene.textures.exists.mockReturnValue(true);
        scene.textures.get.mockImplementation(() => {
            throw new Error('Texture error');
        });

        processor.makeTransparent('source', 'target');

        expect(Logger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to process'), 'TextureProcessor');
    });

    test('processAll should iterate mapping', () => {
        // Mock makeTransparent to track calls
        const originalMakeTransparent = processor.makeTransparent;
        processor.makeTransparent = jest.fn();

        processor.processAll({
            'target1': 'source1',
            'target2': 'source2'
        });

        expect(processor.makeTransparent).toHaveBeenCalledTimes(2);
        expect(processor.makeTransparent).toHaveBeenCalledWith('source1', 'target1');
        expect(processor.makeTransparent).toHaveBeenCalledWith('source2', 'target2');
        expect(Logger.success).toHaveBeenCalled();
    });
});
