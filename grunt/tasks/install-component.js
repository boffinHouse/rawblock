var fse = require('fs-extra');
var npm = require('npm');

module.exports = function(grunt) {
	'use strict';

	function copyToSource(basePath, dirs, fn){
		var called;
		var index = 0;
		var run = function(){
			if(index < 1 && !called){
				called = true;
				fn();
			}
		};
		var copyToSource = function(basePath){
			var dir;

			for(dir in dirs){
				index++;
				fse.copy(basePath + dir, dirs[dir], {clobber: false}, function(error){
					index--;
					console.log(index);
					run();
				});
			}
		};
		var isDir = function(path){
			return (fse.existsSync(path) && fse.lstatSync(path).isDirectory());
		};
		var stepModules = function(basePath){
			var i, tmpBasePath, depPath, sourcesPath;
			var items = fse.readdirSync(basePath);

			for(i = 0; i < items.length; i++){
				tmpBasePath = basePath + items[i];
				depPath = tmpBasePath + '/node_modules/';
				sourcesPath = tmpBasePath + '/sources/';

				if(isDir(depPath)){
					stepModules(depPath);
				}
				if(isDir(sourcesPath)){
					copyToSource(sourcesPath);
				}
			}
		};

		stepModules(basePath);

		run();
	}

	grunt.registerMultiTask( 'rbinstall', 'npm insall + copy components', function(module_path) {


		var options = this.options({
			tmp: 'tmp_rbinstall',
			dirs: {},
		});

		var done = this.async();

		var copy = function(){
			copyToSource(options.tmp+'/node_modules/', options.dirs, remove);
		};

		var remove = function(){
			fse.remove(options.tmp, function (err) {
				done();
			});
		};

		npm.load(function(er, npm){
			if(er){
				remove();
			} else {
				npm.commands.install(options.tmp, module_path, copy);
			}
		});

	});
};
