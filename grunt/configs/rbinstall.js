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
                'js': '<%= paths.src %>/js/modules',
                'sass': '<%= paths.src %>/sass/_blocks',
                'assemble': '<%= paths.src %>/assemble/partials/_blocks',
                'data': '<%= paths.src %>/assemble/data',
            }
        }
    }
};
