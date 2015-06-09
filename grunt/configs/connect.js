/**
 * grunt-contrib-connect: Start a connect web server.
 *
 * {@link} https://github.com/gruntjs/grunt-contrib-connect
 */
module.exports = {
	options: {
		port: '<%= ports.app %>',
		livereload: '<%= ports.livereload %>',
		hostname: 'localhost'
	},
	livereload: {
		options: {
			open: true,
			base: ['<%= paths.dev %>']
		}
	}
};