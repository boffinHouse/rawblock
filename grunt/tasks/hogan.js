module.exports = function(grunt) {

	var Hogan = require('hogan.js');

	/**
	 * Hogan grunt task
	 */

	grunt.registerMultiTask('hogan', 'Compile hogan templates.', function() {

		var options = this.options({
			src: 'sources/hogan/',
			dest: 'sources/js/hogan/',
		});
		grunt.file.expand(options.src + '*').forEach(function(dir){
			var outputFile;
			var module = dir.split('/');
			var output = [];


			module = module[module.length - 1];
			outputFile = options.dest + module +'-hogan.js';

			grunt.file.expand(dir +'/**/*.hogan').forEach(function(file){
				var compiled;
				var filename = file.split('/');
				var src = grunt.file.read(file);


				try {
					compiled = Hogan.compile(src, {asString: true});
				}
				catch(e) {
					grunt.log.error(e);
					grunt.fail.warn('Hogan failed to compile "' + file + '".');
				}

				if(compiled){
					compiled = compiled.replace(/\t+|\n+/g, '').replace(/<!--[\s\S]*?-->/g, '');

					filename = filename[filename.length -1].replace('.hogan', '');

					output.push('rb.hoganTemplates["' + module +'"]' +
						'["' + filename + '"] = new Hogan.Template(' + compiled + ');');
				}
			});

			if(output.length > 0) {

				output.unshift('if(!window.rb){window.rb = {};}rb.hoganTemplates = rb.hoganTemplates || {};' +
					'rb.hoganTemplates["' + module +'"] = rb.hoganTemplates["' + module +'"] || {};');

				grunt.file.write(outputFile, '/* jshint ignore:start */\n' + output.join('\n') + '\n/* jshint ignore:end */');
				grunt.log.writeln('File ' + outputFile + ' created.');

			}

		});
	});
};
