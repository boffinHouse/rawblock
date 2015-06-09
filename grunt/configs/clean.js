/**
 * Configuration grunt-contrib-clean: Clean files and folders.
 *
 * {link} https://github.com/gruntjs/grunt-contrib-clean
 */
module.exports = {
	options: {
		force: true
	},
	dev: {
		files: [
			{
				src: ['<%= paths.dev %>']
			}
		]
	},
	dist: {
		files: [
			{
				src: ['<%= paths.dist %>']
			}
		]
	},
	tmp: {
		files: [
			{
				src: ['<%= paths.tmp %>']
			}
		]
	}
};