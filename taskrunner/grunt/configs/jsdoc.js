/**
 * Configuration JSdoc3
 *
 * {@link} https://github.com/krampstudio/grunt-jsdoc
 */
module.exports = {
    dist: {
        src: ['js.md', '_crucial.js', '_main.js', '_$.js', 'utils/**/*.js', 'components/**/*.js', '!components/**/*-tests.js'],
        options: {
            destination: 'jsdoc',
            tutorials: 'tutorials/js',
            template: 'node_modules/ink-docstrap/template',
            configure: 'taskrunner/jsdoc/jsdoc.conf.json',
        },
    },
};
