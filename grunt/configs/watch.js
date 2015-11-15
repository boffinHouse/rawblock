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
		files: ['<%= paths.src %>/sass/**/*.scss', '!<%= paths.src %>/sass/tmp_*.scss'],
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
	clienthbs: {
		files: ['<%= paths.src %>/assemble/**/*-hybrid.hbs', '<%= paths.src %>/hbs/**/*.hbs'],
		tasks: ['handlebars:dev']
	},
	js: {
		files: ['<%= paths.src %>/js/**/*.js'],
		tasks: ['browserify:dev'] //
	},
	jsmodules: {
		files: ['<%= paths.src %>/js/*/**/*.js'],
		tasks: ['newer:jshint', 'sync:dev'] //newer:
	},
	//test: {
	//	files: ['<%= paths.src %>/js/**/*.js'],
	//	tasks: ['test'] //
	//},
	templates: {
		files: ['<%= paths.src %>/assemble/**/*.{json,hbs}'],
		tasks: ['newer:assemble:dev', 'prettify:dev']
	},
	ejs: {
		files: ['<%= paths.src %>/ejs/**/*.{ejs}'],
		tasks: ['ejs']
	},
};
