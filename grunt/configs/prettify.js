
module.exports = {
	options: {
		condense: false,
			indent: 1,
			indent_char: '	',
			indent_inner_html: false,
			max_preserve_newlines: 1,
			preserve_newlines: true,
			unformatted: [
			"a",
			"b",
			"code",
			"em",
			"i",
			"mark",
			"strong",
			"pre"
		]
	},
	dev: {
		options: {
			brace_style: 'expand'
		},
		files: [
			{
				cwd: 'build/',
				dest: 'build/',
				expand: true,
				ext: '.html',
				src: ['*.html']
			}
		]
	},
	dist: {
		options: {
			brace_style: 'collapse'
		},
		files: [
			{
				cwd: 'dist/',
				dest: 'dist/',
				expand: true,
				ext: '.html',
				src: ['*.html']
			}
		]
	}
}