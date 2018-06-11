/**
 * Configuration grunt-contrib-clean: Clean files and folders.
 *
 * {link} https://github.com/gruntjs/grunt-contrib-clean
 */
module.exports = {
	options: {
		force: true
	},
	publish: {
        files: [
            {
                src: ['jsdoc', 'components', 'helpers', 'utils', 'polyfills.js', 'core.js', '$.js', 'crucial.js',
					'_basics.scss', '_helpers.scss'],
            }
        ],
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
	},
	scssglobbing: {
		files: [
			{
				src: ['<%= paths.src %>/sass/tmp_*.scss']
			}
		]
	}
};
