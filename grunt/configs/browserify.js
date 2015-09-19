/**
 * Configuration Browserify: Static site generator
 *
 * {@link} https://github.com/substack/node-browserify#usage
 * {@link} https://babeljs.io/
 */
module.exports = {
	options: {
		sourceMap: true,
		transform: []
	},
	dev: {
		files: [{
			expand: true,
			cwd: '<%= paths.src %>/js/',
			src: ['*.js'],
			dest: '<%= paths.dev %>/js/',
		}],
	}
};
