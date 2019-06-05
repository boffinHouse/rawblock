module.exports = {
    options: {
        presets: ['react', 'es2015-loose', 'es2016', 'es2017', 'stage-2'],
        plugins: [
            ['transform-runtime', {
                'polyfill': false,
                'regenerator': true,
            }],
            'transform-es2015-modules-umd',
        ],
    },
    publish: {
        files: [
            {
                expand: true,
                cwd: 'src/',
                src: ['**/*.js', '!**/*-tests.js', '!**/*-spec.js'],
                dest: '',
            },
        ],
    },
    tests: {
        options: {
            presets: ['es2015-loose', 'es2016', 'es2017', 'stage-2'],
            plugins: [],
        },
        files: [
            {
                expand: true,
                cwd: 'src/components/',
                src: ['**/*-tests.js'],
                dest: 'tmp/tests/components/',
            },
            {
                expand: true,
                cwd: 'tests/qunit/tests/',
                src: ['**/*-tests.js'],
                dest: 'tmp/tests/',
            },
        ],
    },
};
