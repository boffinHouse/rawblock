// Karma configuration
// Generated on Fri Mar 21 2014 13:56:03 GMT+0100 (CET)

const BROWSER_NAME = 'Chrome';


module.exports = function (config) {
    config.set({

        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
        ],
        frameworks: ['jasmine'],
        runnerPort: 9999,
        files: [
            '../dev/js/_rb_polyfills.js',
            '../dev/js/_crucial-behavior.js',
            '../dev/js/_main-behavior.js',
            '../tests/test-helper.js',

            {
                pattern: '../dev/js/*.js.map',
                included: false,
            },

            '../tests/specs/**/*-spec.js',
            '../components/**/*-spec.js',
            '../utils/**/*-spec.js',
            {
                pattern: '../tests/specs/**/*-fixture.*',
                included: false,
            },
            {
                pattern: '../utils/**/*-fixture.*',
                included: false,
            },
            {
                pattern: '../components/**/*-fixture.*',
                included: false,
            },
        ],
        autoWatch: false,

        singleRun: true,
        browsers: [BROWSER_NAME],
        background: false,

        // coverage reporter generates the coverage
        reporters: ['progress'],
        preprocessors: {

        },
    });
};
