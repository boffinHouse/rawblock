module.exports = function(grunt) {

	var template = require('rb_template').template;

	/**
	 * EJS grunt task
	 */
	grunt.registerMultiTask('ejs', 'Compile ejs templates.', function() {

		var options = this.options({
			src: 'sources/ejs/',
			dest: 'sources/js/ejs/',
		});

		grunt.file.expand(options.src + '*').forEach(function(dir){
			var outputFile;
			var module = dir.split('/');
			var output = [];

			module = module[module.length - 1];
			outputFile = options.dest + module +'-ejs.js';

			grunt.file.expand(dir +'/**/*.ejs').forEach(function(file){
				var compiled;
				var filename = file.split('/');
				var src = grunt.file.read(file);

				try {
					compiled = template(src).source;
				}
				catch(e) {
					grunt.log.error(e);
					grunt.fail.warn('_.template failed to compile "' + file + '".');
				}

				if(compiled){
					compiled = compiled.replace(/\t+|\n+/g, '').replace(/<!--[\s\S]*?-->/g, '');

					filename = filename[filename.length -1].replace('.ejs', '');

					output.push('rb.ejs["' + module +'"]' +
						'["' + filename + '"] = ' + compiled + ';');
				}
			});

			if(output.length > 0) {

				output.unshift('if(!window.rb){window.rb = {};}rb.ejs = rb.ejs || {};' +
					'rb.ejs["' + module +'"] = rb.ejs["' + module +'"] || {};');

				grunt.file.write(outputFile, '/* jshint ignore:start */\n' + output.join('\n') + '\n/* jshint ignore:end */');
				grunt.log.writeln('File ' + outputFile + ' created.');

			}

		});
	});
};
