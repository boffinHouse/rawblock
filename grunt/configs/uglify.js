/**
 * Configuration uglify
 *
 * {@link} https://github.com/gruntjs/grunt-contrib-uglify
 */
module.exports = {
	options: {
		screwIE8: true
	},
	dist: {
		files: [{
			expand: true,
			cwd: '<%= paths.dev %>/js/',
			src: ['**/*.js'],
			dest: '<%= paths.dist %>/js/',
		}],
	}
};
