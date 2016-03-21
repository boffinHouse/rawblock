/**
 * Configuration JSdoc3
 *
 * {@link} https://github.com/krampstudio/grunt-jsdoc
 */
module.exports = {
	dist : {
		src: ['sources/**/*.js', 'sources/js/libs/readme.md', '!sources/assemble/**/*.js'],
		options: {
			destination: 'jsdoc',
			template : 'node_modules/jsdoc-oblivion/template',
			configure : 'node_modules/jsdoc-oblivion/template/jsdoc.conf.json',
		}
	}
};
