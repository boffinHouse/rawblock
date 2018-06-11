(function () {
    'use strict';

    module.exports = function (grunt) {
        require('jit-grunt')(grunt, {
            'phantomcss': '@micahgodbolt/grunt-phantomcss'
        });
        require('time-grunt')(grunt);

        // Project settings
        var options = {
            config: {
                src: 'taskrunner/grunt/configs/*.js',
            },
            paths: {
                src: 'sources',
                dev: 'dev',
                dist: 'dist',
                tmp: 'tmp',
                helper: {
                    task: 'taskrunner/grunt/configs',
                    settings: 'taskrunner/task-settings',
                }
            },
            ports: {
                app: '8000',
                test: '9001',
                livereload: 35730,
            },
        };

        grunt._rbOptions = options;

        var configs = require('load-grunt-configs')(grunt, options);

        grunt.initConfig(configs);

        grunt.task.loadTasks('taskrunner/grunt/tasks');

        grunt.registerTask('default', [
            'build',
        ]);

        grunt.registerTask('lint', [
            'eslint',
        ]);

        grunt.registerTask('test', [
            'webpack:dev',
            'babel:tests',
            'karma',
            'qunit',
        ]);

        grunt.registerTask('prepublish', [
            'lint',
            'test',
            'clean:publish',
            'jsdoc',
            'babel:publish',
            'copy:publish',
        ]);

        grunt.registerTask('svg', [
            'svgmin:svgIcons',
            'svgstore:svgIcons',
            'clean:tmp',
        ]);

        grunt.registerTask('css', [
            'scssglobbing',
            'sass:dev',
            'postcss',
            'clean:scssglobbing',
        ]);

        // Build task
        grunt.registerTask('build', [
            'dev',
            'connect:livereload',
            'watch',
        ]);

        grunt.registerTask('dev', [
            'clean:dev',
            'clean:tmp',
            //'csscomb',
            'svg',
            'css',
            'eslint',
            'uglify:inline',
            'assemble:dev',
            'jst',
            'webpack:dev',
            'sync',
            'prettify:dev',
        ]);

        grunt.registerTask('dist', [
            'clean:dist',
            'clean:tmp',
            'dev',
            'test',
            'copy:fonts',
            'copy:favicon',
            'copy:dist',
            'cssmin',
            'uglify:dist',
        ]);
    };

})();
