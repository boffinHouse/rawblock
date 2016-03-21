/**
 * Configuration grunt-contrib-watch:
 * Run predefined tasks whenever watched file
 * patterns are added, changed or deleted.
 *
 * {@link} https://github.com/gruntjs/grunt-contrib-watch
 */
module.exports = {
    configFiles: {
        options: {
            reload: true
        },
        files: [
            '<%= paths.helper.task %>/*.js',
            'Gruntfile.js'
        ]
    },
    livereload: {
        options: {
            livereload: '<%= connect.options.livereload %>'
        },
        files: [
            '<%= paths.dev %>/{,*/}*.html',
            '<%= paths.dev %>/css/{,*/}*.css',
            '<%= paths.dev %>/js/{,*/}*.js'
        ]
    },
    scss: {
        files: ['<%= paths.src %>/sass/**/*.scss', '<%= paths.src %>/components/**/*.scss', '!<%= paths.src %>/sass/tmp_*.scss'],
        tasks: ['css'],
        options: {
            debounceDelay: 100,
            livereload: false
        }
    },
    component: {
        files: ['<%= paths.src %>/components/**/*.scss','<%= paths.src %>/components/**/*.{json,hbs,md}'],
        tasks: ['css', 'newer:assemble:dev', 'prettify:dev'],
    },
    sync_img: {
        files: ['<%= paths.src %>/img/{,*/}*.{svg, png, jpg}'],
        tasks: ['sync:image']
    },
    inline_js: {
        files: ['<%= paths.src %>/js/_inlinehead-behavior.js'],
        tasks: ['uglify:inline']
    },
    js: {
        files: ['<%= paths.src %>/**/*.{js,es6,es2015}'],
        tasks: ['webpack:dev'] //
    },
    //test: {
    //	files: ['<%= paths.src %>/js/**/*.js'],
    //	tasks: ['test'] //
    //},
    templates: {
        files: ['<%= paths.dev %>/js/_inlinehead-behavior.js', '<%= paths.src %>/templates/**/*.{json,hbs,md}', '<%= paths.src %>/components/**/*.{json,hbs,md}'],
        tasks: ['newer:assemble:dev', 'prettify:dev']
    },
    ejs: {
        files: ['<%= paths.src %>/_templates/**/*.{ejs}'],
        tasks: ['ejs']
    }
};
