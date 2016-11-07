/**
 * Configuration JSdoc3
 *
 * {@link} https://github.com/krampstudio/grunt-jsdoc
 */
module.exports = {
	dist : {
		src: ['js.md', '_crucial.js', '_main.js', '_$.js', 'utils/**/*.js', 'components/**/*.js', '!components/**/*-tests.js'],
		options: {
			destination: 'jsdoc',
			template : 'node_modules/jsdoc-oblivion/template',
			configure : 'node_modules/jsdoc-oblivion/template/jsdoc.conf.json',
		},
	},
};
