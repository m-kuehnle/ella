module.exports = {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    setupFiles: ['<rootDir>/tests/setup.js'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/tests/styleMock.js',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/tests/fileMock.js',
    },
};
