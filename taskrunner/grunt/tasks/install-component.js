var fse = require('fs-extra');
var npm = require('npm');
var path = require('path');

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
				fse.copy(path.join(basePath, dir), dirs[dir], {clobber: false}, function(error){
					index--;
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
				depPath = path.join(tmpBasePath, '/node_modules/');
				sourcesPath = path.join(tmpBasePath, '/sources/');

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

	grunt.registerMultiTask( 'rbinstall', 'npm install + copy components', function() {


		var options = this.options({
			tmp: 'tmp_rbinstall',
			dirs: {},
		});
		var modules = (grunt.option('rbm') || grunt.option('rbmodule') || '').split(/\s*,\s*/g);

		var done = this.async();

		var copy = function(){
			copyToSource(path.join(options.tmp, '/node_modules/'), options.dirs, remove);
		};

		var remove = function(){
			fse.remove(options.tmp, function (err) {
				done();
			});
		};

		if(!modules.length){
			console.log('Set your module[s] grunt rbinstall --rbm=modulename');
		}

		npm.load(function(er, npm){
			if(er){
				console.log('no module found');
				done();
			} else {
				npm.commands.install(options.tmp, modules, copy);
			}
		});

	});
};
