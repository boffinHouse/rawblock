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
			livereload: '<%= connect.options.livereload %>'
		},
		files: [
			'<%= paths.dev %>/{,*/}*.html',
			'<%= paths.dev %>/css/{,*/}*.css',
			'<%= paths.dev %>/js/{,*/}*.js'
		]
	},
	scss: {
		files: ['<%= paths.src %>/sass/**/*.scss', '<%= paths.src %>/components/**/*.scss','!<%= paths.src %>/sass/tmp_*.scss'],
		tasks: ['scssglobbing', 'sass:dev', 'clean:scssglobbing', 'autoprefixer:dev'],
		options: {
			debounceDelay: 100,
			livereload: false
		}
	},
	sync_img: {
		files: ['<%= paths.src %>/img/{,*/}*.{svg, png, jpg}'],
		tasks: ['sync:js']
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
		files: ['<%= paths.src %>/templates/**/*.{json,hbs}', '<%= paths.src %>/components/**/*.{json,hbs}'],
		tasks: ['newer:assemble:dev', 'prettify:dev']
	},
	ejs: {
		files: ['<%= paths.src %>/_templates/**/*.{ejs}'],
		tasks: ['ejs']
	},
};
