/**
 * grunt-autoprefixer: parses CSS and adds vendor-prefixed CSS properties using the Can I Use database.
 *
 * {@link} https://github.com/nDmitry/grunt-autoprefixer
 */
module.exports = {
	options: {
		browsers: ['last 2 version', 'ie >= 10', 'Android >= 4.2', 'Firefox ESR']
	},
	dev: {
		options: {
			map: true
		},
		src: '<%= paths.dev %>/css/*.css'
	},
};
