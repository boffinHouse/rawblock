(function(window, document) {
	'use strict';
	if(!window.rb){
		window.rb = {};
	}
	var rb = window.rb;
	var regPath = /^[\.\/]|:\//;
	var rgJS = /\.js/;

	var rejectedPromise = new Promise(function(resolve, reject){
		setTimeout(reject);
	}).catch(function(){});

	var packages = {};
	var promises = {};

	var packageConfig = {
		basePath: '',
		modulePath: '',
		onlyKnown: false,
	};

	var createPath = function(moduleId, index, packageIds){
		var key = 'basePath';
		if(!regPath.test(moduleId)){
			if(packageIds.isModule){
				key = 'modulePath';
				moduleId = moduleId;
			}
			moduleId = packageConfig[key] + moduleId;
		}
		if(!rgJS.test(moduleId)){
			moduleId += '.js';
		}
		return moduleId;
	};

	rb.packageConfig = packageConfig;

	/**
	 * Loads a given package and returns a Promise. If it's a registered package the sources will be prefixed using `rb.packageConfig.basePath` option otherwise the packageName will be used as source and prefixed with the `rb.packageConfig.modulePath` option.
	 * @memberof rb
	 *
	 * @see rb.registerPackage
	 *
	 * @param {String} packageName
	 * @returns {Promise}
	 */
	rb.loadPackage = function(packageName, onlyKnown){
		var packagePaths;
		var packages = packages[packageName];
		if(!packages){
			if(!onlyKnown && (!packageConfig.onlyKnown || onlyKnown === false)){
				packages = [packageName];
				packages.isModule = true;
			} else {
				return rejectedPromise;
			}
		}

		packagePaths = packages.map(createPath);

		packagePaths
			.filter(function(path){
				return !promises[path];
			})
			.forEach(rb.loadScript)
		;
		return promises[packagePaths[packagePaths.length - 1]];
	};

	/**
	 * Registers a package name with one or multiple sources. If a package is loaded all sources are loaded async but executed in order. The sources will be prefixed with `rb.packageConfig..basePath` and suffixed with `.js` (if last is missing).
	 * Different packages can have overlapping sources/dependencies. If an array of packageName is passed these are treated as aliases.
	 *
	 * @memberof rb
	 *
	 * @param {String|String[]} packageName
	 * @param {String|String[]} srces
	 *
	 * @example
	 * //aliasing
	 * rb.registerPackage(['accordion', 'tabs', 'panelgroup'], ['js/panelgroup.js']);
	 *
	 * rb.registerPackage('form-validation', ['js/form-validation.js']);
	 * rb.registerPackage('checkout-form', ['js/form-validation.js', 'js/checkout-form.js']);
	 */
	rb.registerPackage = function(packageName, srces){
		var addPackage = function(packageName){
			packages[packageName] = srces;
		};
		if(!Array.isArray(srces)){
			srces = [srces];
		}
		if(Array.isArray(packageName)){
			packageName.forEach(addPackage);
		} else {
			addPackage(packageName)
		}
	};

	/**
	 * Loads a script and returns a promise.
	 * @memberof rb
	 *
	 * @param src
	 * @returns {Promise}
	 */
	rb.loadScript = function(src){
		promises[src] = new Promise(function(resolve){
			var script = document.createElement('script');
			script.onload = resolve;
			script.onerror = function(){
				rb.log('package error. Configure rb.packageConfig? src: ' + src);
				resolve();
			};
			script.src = src;
			script.async = false;
			(rb.rAFQueue || requestAnimationFrame)(function(){
				(document.body || document.documentElement).appendChild(script);
				script = null;
			});
		});
		return promises[src];
	};
})(window, document);
