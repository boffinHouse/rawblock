/**
 * Configuration JSdoc3
 *
 * {@link} https://github.com/krampstudio/grunt-jsdoc
 */
module.exports = {
    dist: {
        src: ['js.md', 'src/crucial.js', 'src/main.js', 'src/$.js', 'src/utils/**/*.js', 'src/components/**/*.js', '!src/components/**/*-tests.js'],
        options: {
            destination: 'jsdoc',
            tutorials: 'tutorials/js',
            template: 'node_modules/ink-docstrap/template',
            configure: 'taskrunner/jsdoc/jsdoc.conf.json',
        },
    },
};
