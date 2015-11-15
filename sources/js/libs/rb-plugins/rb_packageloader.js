(function(window, document) {
	'use strict';

	var regPath = /^[\.\/]|:\//;
	var rgJS = /\.js/;

	var rejectedPromise = new Promise(function(resolve, reject){
		setTimeout(reject);
	}).catch(function(){});

	var loadPackage = function(moduleId, onlyKnown){
		var packagePaths;
		var packages = loadPackage.packages[moduleId];
		if(!packages){
			if(!onlyKnown && (!loadPackage.onlyKnown || onlyKnown === false)){
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
	loadPackage.onlyKnown = false;

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
		loadPackage.promises[src] = new Promise(function(resolve){
			var script = document.createElement('script');
			script.onload = resolve;
			script.onerror = resolve;
			script.src = src;
			script.async = false;
			(rb.rAFQueue || requestAnimationFrame)(function(){
				(document.body || document.documentElement).appendChild(script);
				script = null;
			});
		});
		return loadPackage.promises[src];
	};

	if(!window.rb){
		window.rb = {};
	}
	window.rb.loadPackage = loadPackage;
	return loadPackage;
})(window, document);
