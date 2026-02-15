import Logger from '../../src/utils/Logger.js';

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({}),
    })
);

describe('Logger', () => {
    beforeEach(() => {
        fetch.mockClear();
        jest.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    test('logs info message correctly', async () => {
        await Logger.info('test message', 'TestScene');

        expect(console.log).toHaveBeenCalledWith('[TestScene] INFO: test message');
        expect(fetch).toHaveBeenCalledWith('/log', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
                level: 'INFO',
                message: 'test message',
                scene: 'TestScene'
            })
        }));
    });

    test('logs error message correctly', async () => {
        await Logger.error('error occurred', 'GameScene');

        expect(console.log).toHaveBeenCalledWith('[GameScene] ERROR: error occurred');
        expect(fetch).toHaveBeenCalledWith('/log', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
                level: 'ERROR',
                message: 'error occurred',
                scene: 'GameScene'
            })
        }));
    });

    test('handles fetch error gracefully', async () => {
        fetch.mockImplementationOnce(() => Promise.reject('API is down'));

        await expect(Logger.log('test', 'INFO', 'Scene')).resolves.not.toThrow();
        expect(console.log).toHaveBeenCalled();
    });
});
