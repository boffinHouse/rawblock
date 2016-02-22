(function () {
    'use strict';

    module.exports = function (grunt) {
        require('jit-grunt')(grunt);
        require('time-grunt')(grunt);

        // Project settings
        var options = {
            config: {
                src: "grunt/configs/*.js"
            },
            paths: {
                src: 'sources',
                dev: 'dev',
                dist: 'dist',
                tmp: 'tmp',
                helper: 'grunt/configs'
            },
            ports: {
                app: '8000',
                test: '9001',
                livereload: 35730
            }
        };

        grunt._rbOptions = options;

        var configs = require('load-grunt-configs')(grunt, options);
        grunt.initConfig(configs);

        grunt.task.loadTasks('grunt/tasks');

        grunt.registerTask('default', [
            'build'
        ]);

        grunt.registerTask('test', [
            'jshint',
            'qunit'
        ]);

        grunt.registerTask('svg', [
            'svgmin:svgLogo',
            'svgstore:svgLogo',
            'svgmin:svgIcons',
            'svgstore:svgIcons'
        ]);

        // Build task
        grunt.registerTask('build', [
            'dev',
            'connect:livereload',
            'watch'
        ]);

        grunt.registerTask('css', [
            'scssglobbing',
            'sass:dev',
            'autoprefixer:dev',
            'clean:scssglobbing',
        ]);

        grunt.registerTask('dev', [
            'clean:dev',
            'clean:tmp',
            'svg',
            'css',
            'jshint',
            'uglify:inline',
            'concurrent:dev2',
            'handlebars:dev',
            'jst',
            'webpack:dev',
            'sync',
            'prettify:dev',
        ]);

        grunt.registerTask('dist', [
            'clean:dist',
            'clean:tmp',
            'scssglobbing',
            'sass:dist',
            'uglify:inline',
            'assemble:dist',
            'autoprefixer:dist',
            'cssmin',
            'copy:favicon',
            'handlebars:dist',
            'jst',
            'webpack:dist',
            'test',
            'copy:fonts',
            'prettify:dist',
            'clean:scssglobbing',
        ]);
    };

})();
