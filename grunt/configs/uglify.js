/**
 * Configuration uglify
 *
 * {@link} https://github.com/gruntjs/grunt-contrib-uglify
 */
module.exports = {
    options: {
        screwIE8: true
    },
    inline: {
        files: {
            '<%= paths.dev %>/js/_inlinehead-behavior.js': ['<%= paths.src %>/js/_inlinehead-behavior.js']
        }
    },
    dist: {
        cwd: '<%= paths.dist %>/js/',
        dest: '<%= paths.dist %>/js/',
        expand: true,
        src: ['**/*.js']
    }
};
