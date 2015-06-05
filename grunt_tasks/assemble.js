/**
 * Configuration Assemble: Static site generator
 *
 * {@link} https://github.com/assemble/assemble
 */
module.exports = {

	options: {
		data: '<%= paths.src %>/assemble/data/**/*.{json,yml}',
		helpers: ['handlebars-helper-partial', '<%= paths.src %>/assemble/helpers/**/*.js'],
		layoutdir: '<%= paths.src %>/assemble/layouts/',
		partials: ['<%= paths.src %>/assemble/partials/**/*.hbs']
	},
	dev: {
		options: {
			production: false
		},
		files: [
			{
				cwd: '<%= paths.src %>/assemble/pages/',
				dest: '<%= paths.dev %>/',
				expand: true,
				flatten: true,
				src: ['**/*.hbs']
			}
		]
	},
	dist: {
		options: {
			production: true
		},
		files: [
			{
				cwd: '<%= paths.src %>/assemble/pages/',
				dest: '<%= paths.dist %>/',
				expand: true,
				flatten: true,
				src: ['**/*.hbs']
			}
		]
	}

};