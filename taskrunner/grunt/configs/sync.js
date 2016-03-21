/**
 * grunt-sync: Task to synchronize two directories.
 * Similar to grunt-copy but updates only files that
 * have been changed.
 *
 * {@link} https://github.com/tomusdrw/grunt-sync
 */
module.exports = {
	favicon: {
		files: [
			{
				cwd: '<%= paths.src %>/img/appicons/',
				dest: '<%= paths.dev %>/img/appicons/',
				src: '**/*.ico'
			}
		]
	},
	fonts: {
		files: [
			{
				cwd: '<%= paths.src %>/fonts/',
				dest: '<%= paths.dev %>/fonts/',
				src: '**/*'
			}
		]
	},
	images: {
		files: [
			{
				cwd: '<%= paths.src %>/img/',
				dest: '<%= paths.dev %>/img',
				src: ['**/*']
			}
		]
	},
	dev: {
		files: [
			{
				cwd: '<%= paths.src %>/js/modules/',
				dest: '<%= paths.dev %>/js/modules/',
				expand: true,
				src: ['**/*.js']
			}
		]
	}
};
