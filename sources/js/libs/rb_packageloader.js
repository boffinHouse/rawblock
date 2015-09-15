
(function(factory) {
	if(typeof define === 'function' && define.amd){
		define(factory);
	}
	else if(typeof module == 'object' && module.exports){
		module.exports = factory();
	}
	else {
		factory();
	}
}(function() {
	'use strict';

	var regPath = /^[\.\/]|:\//;
	var rgJS = /\.js/;

	var rejectedPromise = new Promise(function(resolve, reject){
		reject();
	});

	var loadPackage = function(moduleId, onlyKnown){
		var packagePaths;
		var packages = loadPackage.packages[moduleId];
		if(!packages){
			if(!onlyKnown){
				packages = [moduleId];
				packages.isModule = true;
			} else {
				return rejectedPromise;
			}
		}

		packagePaths = packages.map(loadPackage.createPath);

		packagePaths
			.filter(function(path){
				return !loadPackage.promises[path];
			})
			.forEach(loadPackage.loadScript)
		;
		return loadPackage.promises[packagePaths[packagePaths.length - 1]];
	};

	loadPackage.basePath = '';
	loadPackage.modulePath = '';

	loadPackage.packages = {};

	loadPackage.promises = {};

	loadPackage.addPackage = function(moduleId, dependenciesSources){
		if(!Array.isArray(dependenciesSources)){
			dependenciesSources = [dependenciesSources];
		}
		loadPackage.packages[moduleId] = dependenciesSources;
	};

	loadPackage.createPath = function(moduleId, index, packageIds){
		var key = 'basePath';
		if(!regPath.test(moduleId)){
			if(packageIds.isModule){
				key = 'modulePath';
				moduleId = 'rb_' + moduleId;
			}
			moduleId = loadPackage[key] + moduleId;
		}
		if(!rgJS.test(moduleId)){
			moduleId += '.js';
		}
		return moduleId;
	};

	loadPackage.loadScript = function(src){
		loadPackage.promises[src] = new Promise(function(resolve, reject){
			var script = document.createElement('script');
			script.onload = resolve;
			script.onerror = resolve;
			script.src = src;
			script.async = false;
			(document.body || document.documentElement).appendChild(script);
			script = null;
		});
		return loadPackage.promises[src];
	};

	if(!window.rb){
		window.rb = {};
	}
	window.rb.loadPackage = loadPackage;
	window.loadPackage = loadPackage;
	return loadPackage;
}));
