(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define([], factory);
	} else if (typeof exports !== "undefined") {
		factory();
	} else {
		var mod = {
			exports: {}
		};
		factory();
		global.rb_transformHook = mod.exports;
	}
})(this, function () {
	'use strict';

	(function () {
		'use strict';

		var rb = window.rb;
		var $ = rb.$;

		var hookExpando = rb.Symbol('_rbCssTransformHooks');
		var supports3dTransform = window.CSS && CSS.supports && CSS.supports('(transform: translate3d(0,0,0))');
		var defaults = {};
		var units = {};

		var setTransformString = function setTransformString(element) {
			var prop;
			var props = element[hookExpando];
			var transforms = [];
			for (prop in props) {
				if (props[prop] !== defaults[prop]) {
					transforms.push(prop + '(' + props[prop] + units[prop] + ')');
				}
			}
			element.style.transform = transforms.join(' ');
		};

		var createHook = function createHook(name, defaultVal, unit) {
			var rbName = 'rb' + name;
			defaults[name] = defaultVal || 0;
			units[name] = unit || '';

			$.cssNumber[rbName] = true;

			$.fx.step[rbName] = function (fx) {
				$.cssHooks[rbName].set(fx.elem, fx.now);
			};

			$.cssHooks[rbName] = {
				get: function get(element, computed, extra) {
					var value = element[hookExpando] && element[hookExpando][name] || defaultVal || 0;
					if (!extra) {
						value += unit;
					}

					return value;
				},
				set: function set(element, value) {
					if (!element[hookExpando]) {
						element[hookExpando] = {};
					}
					element[hookExpando][name] = value === '' ? defaultVal : value;
					setTransformString(element);
				}
			};
		};

		createHook('rotate', 0, 'deg');
		createHook('skewX', 0, 'deg');
		createHook('skewY', 0, 'deg');
		createHook('scaleX', 1, '');
		createHook('scaleY', 1, '');
		createHook('translateX', 0, 'px');
		createHook('translateY', 0, 'px');

		if (supports3dTransform) {
			createHook('translateZ', 0, 'px');
			createHook('rotateX', 0, 'deg');
			createHook('rotateY', 0, 'deg');
		}
	})();
});
