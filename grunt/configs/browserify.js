/**
 * Configuration Browserify: Static site generator
 *
 * {@link} https://github.com/substack/node-browserify#usage
 * {@link} https://babeljs.io/
 */
module.exports = {
	options: {
		sourceMap: true,
		transform: ['babelify']
	},
	dev: {
		files: {
			'<%= paths.dev %>/js/head-sync.js': ['<%= paths.src %>/js/head-sync.js'],
			'<%= paths.dev %>/js/polyfills.js': ['<%= paths.src %>/js/polyfills.js'],
			'<%= paths.dev %>/js/head-async.js': ['<%= paths.src %>/js/head-async.js']
		}
	},
	dist: {
		files: {
			'<%= paths.dist %>/js/head-sync.js': ['<%= paths.src %>/js/head-sync.js'],
			'<%= paths.dist %>/js/polyfills.js': ['<%= paths.src %>/js/polyfills.js'],
			'<%= paths.dist %>/js/head-async.js': ['<%= paths.src %>/js/head-async.js']
		}
	},
};
