module.exports = function(grunt) {

	var template = require('rb_template').template;

	grunt.registerMultiTask('ejs', 'Compile ejs templates.', function() {

		var options = this.options({
			src: 'sources/_templates/',
			dest: 'sources/js/_templates/',
			suffix: '',
		});

		grunt.file.expand(options.src + '*').forEach(function(dir){
			var outputFile, isStandalone;
			var module = dir.split('/');
			var output = [];
			var compileFile = function(file){
				var compiled;
				var filename = file.split('/');
				var src = grunt.file.read(file);

				try {
					compiled = template(src).source;
				}
				catch(e) {
					grunt.log.error(e);
					grunt.fail.warn('rb.template failed to compile "' + file + '".');
				}

				if(compiled){
					compiled = compiled.replace(/\t+|\n+/g, '').replace(/<!--[\s\S]*?-->/g, '');

					filename = filename[filename.length -1].replace('.ejs', '');

					output.push('rb.templates["' + module +'"]' +
						(isStandalone ? '' : '["' + filename + '"]')+' = ' + compiled + ';');
				}
			};


			module = module[module.length - 1].split('.')[0];
			outputFile = options.dest + module + options.suffix +'.js';

			if(grunt.file.isDir(dir)){
				isStandalone = false;
				grunt.file.expand(dir +'/**/*.ejs').forEach(compileFile);
			} else {
				isStandalone = true;
				compileFile(dir);
			}

			if(output.length > 0) {

				output.unshift((isStandalone ? '' : 'rb.templates["' + module +'"] = rb.templates["' + module +'"] || {};'));

				grunt.file.write(outputFile, '/* jshint ignore:start */\n' + output.join('\n') + '\n/* jshint ignore:end */');
				grunt.log.writeln('File ' + outputFile + ' created.');

			}

		});
	});
};
