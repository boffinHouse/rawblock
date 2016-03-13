/**
 * grunt-phantomcss
 *
 * {@link} https://github.com/micahgodbolt/grunt-phantomcss
 */
module.exports = {
    options: {},
    desktop: {
        options: {
            screenshots: 'visual-tests/screenshots/desktop',
            results: 'visual-tests/results/desktop',
            viewportSize: [1280, 800],
        },
        src: [
            'tests/visual/casper-start.js',
            'sources/components/**/tests/visual/*.js',
        ],
    },
    tablet: {
        options: {
            screenshots: 'visual-tests/screenshots/tablet',
            results: 'visual-tests/results/tablet',
            viewportSize: [768, 1024],
        },
        src: [
            'tests/visual/casper-start.js',
            'sources/components/**/tests/visual/*.js',
        ],
    },
    mobile: {
        options: {
            screenshots: 'visual-tests/screenshots/mobile',
            results: 'visual-tests/results/mobile',
            viewportSize: [375, 627],
        },
        src: [
            'tests/visual/casper-start.js',
            'sources/components/**/tests/visual/*.js',
        ],
    },
};
