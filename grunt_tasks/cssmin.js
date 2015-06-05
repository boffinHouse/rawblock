/**
 * Minify CSS
 *
 * {link} https://github.com/gruntjs/grunt-contrib-cssmin
 */

module.exports = {
	dist: {
		cwd: '<%= paths.dist %>/css/',
		dest: '<%= paths.dist %>/css/',
		expand: true,
		src: ['*.css']
	}
};