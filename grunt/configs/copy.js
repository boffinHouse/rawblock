/**
 * Copy files and folders.
 *
 * {link} https://github.com/gruntjs/grunt-contrib-copy
 */

module.exports = {
	favicon: {
		cwd: '<%= paths.src %>/img/appicons/',
		dest: '<%= paths.dist %>/img/appicons/',
		expand: true,
		src: ['**/*.ico']
	},
	dist: {
		cwd: '<%= paths.src %>/js/modules/',
		dest: '<%= paths.dist %>/js/modules/',
		expand: true,
		src: ['**/*.js']
	}
	//fonts: {
	//	cwd: '<%= paths.src %>/fonts/',
	//	dest: '<%= paths.dist %>/fonts/',
	//	expand: true,
	//	src: ['**/*']
	//},
};
