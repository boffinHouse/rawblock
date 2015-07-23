/**
 * Configuration hbs
 *
 * {@link} https://github.com/wycats/handlebars.js
 * {@link} https://github.com/gruntjs/grunt-contrib-handlebars
 */
module.exports = {
    install: {
        options: {
            dirs: {
                'js': '<%= paths.src %>/js',
                'sass': '<%= paths.src %>/sass',
                'assemble': '<%= paths.src %>/assemble',
            }
        }
    }
};
