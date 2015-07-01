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
		files: {
			'<%= paths.dev %>/js/head.js': ['<%= paths.src %>/js/head.js'],
			'<%= paths.dev %>/js/polyfills.js': ['<%= paths.src %>/js/polyfills.js'],
			'<%= paths.dev %>/js/body-async.js': ['<%= paths.src %>/js/body-async.js']
		}
	},
	dist: {
		files: {
			'<%= paths.dist %>/js/head.js': ['<%= paths.src %>/js/head.js'],
			'<%= paths.dist %>/js/polyfills.js': ['<%= paths.src %>/js/polyfills.js'],
			'<%= paths.dist %>/js/body-async.js': ['<%= paths.src %>/js/body-async.js']
		}
	},
};
