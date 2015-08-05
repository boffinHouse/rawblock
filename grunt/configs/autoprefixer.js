/**
 * grunt-autoprefixer: parses CSS and adds vendor-prefixed CSS properties using the Can I Use database.
 *
 * {@link} https://github.com/nDmitry/grunt-autoprefixer
 */
module.exports = {
	options: {
		browsers: ['last 2 versions']
	},
	dev: {
		options: {
			map: true
		},
		src: '<%= paths.dev %>/css/*.css'
	},
	dist: {
		src: '<%= paths.dist %>/css/*.css'
	}
};
