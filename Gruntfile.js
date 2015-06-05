(function() {
	'use strict';

	module.exports = function(grunt) {
		require('jit-grunt')(grunt);
		require('time-grunt')(grunt);

		// Project settings
		var options = {
			config: {
				src: "grunt_tasks/*.js" //config tasks
			},
			// define your path structure
			paths: {
				src: 'sources', // Working files assemble / js / img etc
				dev: 'dev', // Development folder
				dist: 'dist', // Production folder
				tmp: 'tmp',
				// helpers folder with grunt tasks
				helper: 'grunt_tasks'
			},
			// define your ports for grunt-contrib-connect
			ports: {
				app: '8000',
				test: '9001',
				livereload: 35729
			}
		};

		// Load grunt configurations automatically
		var configs = require('load-grunt-configs')(grunt, options);
		grunt.initConfig(configs);


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
			'autoprefixer:dev',
			//'concat:dev',
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
			//'modernizr',
			'autoprefixer:dist',
			//'group_css_media_queries',
			'cssmin',
			//'requirejs',
			//'concat:dist',
			//'copy:ajax',
			'copy:favicon',
			//'copy:fonts',
			//'copy:icon_sprite',
			'browserify',
			//'copy:modernizr',
			//'uglify',
			'prettify:dist'
		]);


		// task to generate styles.scss without sass-globbing
		grunt.registerTask('generate-tmp-styles-scss', 'Generate styles tmp file', function () {
			var resultContent = grunt.file.read(options.paths.src +'/sass/_styles-config.scss');

			//get rid of ../../-prefix, since libsass does not support them in @import-statements+includePaths option
			resultContent = resultContent.replace(/\"\.\.\/\.\.\//g, '"');

			var importMatches = resultContent.match(/^@import.+\*.*$/mg);

			if (importMatches) {
				importMatches.forEach(function(initialMatch) {
					// remove all " or '
					var match = initialMatch.replace(/["']/g,'');
					// remove the preceeding @import
					match = match.replace(/^@import/g,'');
					// lets get rid of the final ;
					match = match.replace(/;$/g,'');
					// remove all whitespaces
					match = match.trim();

					// get all files, which match this pattern
					var files = grunt.file.expand(
						{
							'cwd': options.paths.src+'/sass/',
							'filter': 'isFile'
						},
						match
					);

					var replaceContent = [];

					files.forEach(function(matchedFile)
					{
						replaceContent.push('@import "' + matchedFile + '";');
					});

					resultContent = resultContent.replace(initialMatch, replaceContent.join("\n"));
				});
			}
			grunt.file.write(options.paths.src +'/sass/styles.scss', resultContent);
		});


	};

})();
