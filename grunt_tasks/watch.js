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
			'<%= paths.helper %>/*.js',
			'Gruntfile.js'
		]
	},
	livereload: {
		options: {
			livereload: ['<%= connect.options.livereload %>']
		},
		files: [
			'<%= paths.dev %>/{,*/}*.html',
			'<%= paths.dev %>/css/{,*/}*.css',
			'<%= paths.dev %>/js/{,*/}*.js'
		]
	},
	scss: {
		files: ['<%= paths.src %>/sass/**/*.scss'],
		tasks: ['generate-tmp-styles-scss', 'sass:dev', 'autoprefixer:dev'],
		options: {
			debounceDelay: 0,
			livereload: false
		}
	},
	sync_img: {
		files: ['<%= paths.src %>/img/{,*/}*.{svg, png, jpg}'],
		tasks: ['sync:js']
	},
	js: {
		files: ['<%= paths.src %>/js/**/*.js'],
		tasks: ['newer:browserify:dev']
	},
	templates: {
		files: ['<%= paths.src %>/assemble/**/*.{json,hbs}'],
		tasks: ['newer:assemble:dev', 'prettify:dev']
	}
};
