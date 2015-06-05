/**
 * grunt-fileindex: Write index files of directory contents
 *
 * {@link} https://github.com/Bartvds/grunt-fileindex
 */
module.exports = {
	libsassGlobbing: {
		options: {
			format: function (list, options, dest) {
				var i = 0;
				var imports = [];

				for (i; i < list.length; i++) {
					var listEl = list[i];

					var listElName = listEl.replace(/_([^_]*)$/, ""+'$1').replace(/\.scss|\.sass/gi, "");
					imports += '@import "' + listElName + '";\n';
				}

				return imports;
			}
		},
		files: [
			{
				cwd: '<%= paths.src %>/sass/',
				dest: '<%= paths.src %>/sass/styles.scss',
				src: [
					'mixins/**/*.scss',
					'variables/**/*.scss',
					'extends/**/*.scss',
					'_normalize-basics.scss',
					'_basics.scss',
					'_blocks/**/*'
				]
			}
		]
	}
};