
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

	var loadPackage = function(moduleId){
		var packagePaths;
		var packages = loadPackage.packages[moduleId];
		if(!packages){
			packages = [moduleId];
			packages.isModule = true;
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
		if(!regPath.test(moduleId)){
			moduleId = loadPackage[packageIds.isModule ? 'modulePath' : 'basePath'] + moduleId;
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

	window.loadPackage = loadPackage;
	return loadPackage;
}));
