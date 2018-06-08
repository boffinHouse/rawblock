module.exports = {
    options: {
        presets: ['es2015-loose', 'es2016', 'es2017'],
        plugins: [
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
