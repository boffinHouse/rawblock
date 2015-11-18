module.exports = function(grunt) {

	var jsdoc2md = require('jsdoc-to-markdown')
	var fs = require('fs')
	var dmd = require('dmd')
	var util = require('util')
	var path = require('path')
	var collectJson = require('collect-json');




	/**
	 * EJS grunt task
	 */
	grunt.registerMultiTask('jsdoc2md', 'generate JSdoc classes into markdown files', function() {
		var destination = '';
		var done = this.async();
		var writeMarkdownFile = function(data, classes, index) {
			var className = classes[index];
			var fileName = path.join(destination, className );
			var template = util.format('{{#class name="%s"}}{{>docs}}{{/class}}', className);
			var dmdStream = dmd({ template: template });
			var next = function () {
				var next = index + 1;
				if (classes[next]) {
					writeMarkdownFile(data, classes, next);
				} else {
					done();
				}
			};

			if(className){
				dmdStream
					.pipe(fs.createWriteStream(path.join(fileName +'.md')))
					.on('close', next)
				;
				dmdStream.end(JSON.stringify(data));
			} else {
				next();
			}
		};

		this.files.forEach(function(file){
			destination = file.dest;
			grunt.file.mkdir(destination);

			file.src.filter(function(filepath) {
				// Remove nonexistent files (it's up to you to filter or warn here).
				if (!grunt.file.exists(filepath)) {
					grunt.log.warn('Source file "' + filepath + '" not found.');
					return false;
				} else {
					return true;
				}
			}).map(function(filepath) {

				jsdoc2md({ src: filepath, json: true })
					.pipe(collectJson(function (data) {
						/* reduce the jsdoc-parse output to an array of class names */
						var classes = data.reduce(function (prev, curr) {
							if (curr.kind === 'class') {
								prev.push(curr.name);
							}
							return prev;
						}, []);


						/* render an output file for each class */
						writeMarkdownFile(data, classes, 0)
					}));
			});

		})
	});
};
