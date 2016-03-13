/**
 * Plugin for beautifying HTML
 *
 * {@link} https://github.com/jonschlinkert/grunt-prettify
 */
module.exports = {
	options: {
		condense: false,
			indent: 1,
			indent_char: '	',
			indent_inner_html: false,
			indent_scripts: 'normal',
			brace_style: 'keep',
			max_preserve_newlines: 0,
			preserve_newlines: true,
			unformatted: [
			"a",
			"b",
			"code",
			"em",
			"i",
			"mark",
			"strong",
			"pre",
		]
	},
	dev: {
		files: [
			{
				cwd: '<%= paths.dev %>/',
				dest: '<%= paths.dev %>/',
				expand: true,
				ext: '.html',
				src: ['*.html']
			}
		]
	},
}
