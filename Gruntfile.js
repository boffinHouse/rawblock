(function() {
	'use strict';

	module.exports = function(grunt) {
		require('jit-grunt')(grunt);
		require('time-grunt')(grunt);

		// Project settings
		var options = {
			config: {
				src: "grunt/configs/*.js" //config tasks
			},
			// define your path structure
			paths: {
				src: 'sources', // Working files assemble / js / img etc
				dev: 'dev', // Development folder
				dist: 'dist', // Production folder
				tmp: 'tmp',
				// helpers folder with grunt tasks
				helper: 'grunt/configs'
			},
			// define your ports for grunt-contrib-connect
			ports: {
				app: '8000',
				test: '9001',
				livereload: 35729
			}
		};

		grunt._rbOptions = options;

		// Load grunt configurations automatically
		var configs = require('load-grunt-configs')(grunt, options);
		grunt.initConfig(configs);

		grunt.task.loadTasks('grunt/tasks');


		// Default standard build Task
		grunt.registerTask('default', [
			'build'
		]);

		// Development task
		grunt.registerTask('dev', [
			'clean:dev',
			//'clean:tmp',
			//'svgmin:dev_bg',
			//'svgmin:dev_file',
			//'svgmin:dev_ico',
			//'svgstore:dev',
			//'string-replace',
			'generate-tmp-styles-scss',
			'concurrent:dev2',
			//'concat:dev',
			'handlebars:dev',
			'browserify:dev',
			'autoprefixer:dev',
			'sync',
			'prettify:dev'
		]);

		// Build task
		grunt.registerTask('build', [
			'dev',
			'connect:livereload',
			'watch'
		]);

		// Distributing task
		grunt.registerTask('dist', [
			'clean:dist',
			//'clean:tmp',
			//'svgmin:dist_bg',
			//'svgmin:dist_file',
			//'svgmin:dist_ico',
			//'svgstore:dist',
			'concurrent:dist',
			//'string-replace',
			//'generate-tmp-styles-scss',
			'sass:dist',
			'assemble:dist',
			'autoprefixer:dist',
			//'group_css_media_queries',
			'cssmin',
			//'requirejs',
			//'concat:dist',
			//'copy:ajax',
			'copy:favicon',
			'handlebars:dist',
			'browserify:dist',
			//'copy:fonts',
			//'copy:icon_sprite',
			//'copy:modernizr',
			//'uglify',
			'prettify:dist'
		]);

	};

})();
