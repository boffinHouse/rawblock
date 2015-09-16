(function() {
	'use strict';

	module.exports = function(grunt) {
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

		grunt.registerTask('svg', [
			'svgmin:svgLogo',
			'svgstore:svgLogo'
		]);

		// Build task
		grunt.registerTask('build', [
			'dev',
			'connect:livereload',
			'watch'
		]);

		grunt.registerTask('dev', [
			'clean:dev',
			'svg',
			//'string-replace',
			'generate-tmp-styles-scss',
			'concurrent:dev2',
			'handlebars:dev',
			'browserify:dev',
			'autoprefixer:dev',
			'clean:tmp',
			'sync',
			'prettify:dev'
		]);

		grunt.registerTask('dist', [
			'clean:dist',
			'clean:tmp',
			//'string-replace',
			'generate-tmp-styles-scss',
			'sass:dist',
			'assemble:dist',
			'autoprefixer:dist',
			//'group_css_media_queries',
			'cssmin',
			'copy:favicon',
			'handlebars:dist',
			'browserify:dist',
			//'copy:fonts',
			'prettify:dist'
		]);

	};

})();
