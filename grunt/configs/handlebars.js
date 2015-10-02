/**
 * Configuration hbs
 *
 * {@link} https://github.com/wycats/handlebars.js
 * {@link} https://github.com/gruntjs/grunt-contrib-handlebars
 */
module.exports = {
	options: {
		partialsUseNamespace: true,
		namespace: 'hbstemplate',
		commonjs: true,
		processName: function(filePath) {
			var pieces = filePath.split("/");
			return pieces[pieces.length - 1].replace('.hbs', '');
		},
		processPartialName: function(filePath) { // input:  templates/_header.hbs
			var pieces = filePath.split("/");
			return pieces[pieces.length - 1].replace('.hbs', ''); // output: _header.hbs
		}
	},
	dev: {
		files: {
			'<%= paths.src %>/js/templates.js': ['<%= paths.src %>/hbs/**/*.hbs', '<%= paths.src %>/assemble/partials/**/*-hybrid.hbs']
		}
	},
	dist: {
		files: {
			'<%= paths.src %>/js/templates.js': ['<%= paths.src %>/hbs/**/*.hbs', '<%= paths.src %>/assemble/partials/**/*-hybrid.hbs']
		}
	},
};
