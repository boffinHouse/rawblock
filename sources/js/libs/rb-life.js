(function(window, factory) {
	var life = factory(window, window.document);
	window.rbLife = life;
	if(typeof module == 'object' && module.exports){
		module.exports = life;
	}
}(typeof window != 'undefined' ? window : this , function(window, document) {
	'use strict';

	var elements, useMutationEvents, timer;
	var docElem = document.documentElement;

	var life = {};
	var regData = /^data-/;
	var removeElements = [];
	var initClass = 'is-rb-life';
	var attachedClass = 'is-rb-attached';

	life.init = function(options){
		if (elements) {throw('only once');}
		clearTimeout(timer);

		if (options) {
			initClass = options.initClass || initClass;
			attachedClass = options.attachedClass || attachedClass;
			useMutationEvents = options.useMutationEvents || false;
		}

		elements = document.getElementsByClassName(initClass);

		life.batch = life.createBatch();

		life.initObserver();
		life.throttledFindElements();
	};

	life.camelCase = (function() {
		var reg = /-([\da-z])/gi;
		var camelCase = function(all, found) {
			return found.toUpperCase();
		};

		return function(str) {
			return str.replace(reg, camelCase);
		};
	})();

	life.parseValue = (function() {
		var regNumber = /^\-*\+*\d+\.*\d*$/;
		var regObj = /^\[.*\]|\{.*\}$/;
		return function( attrVal ) {

			if(attrVal == 'true'){
				attrVal = true;
			}
			else if(attrVal == 'false'){
				attrVal = false;
			}
			else if(regNumber.test(attrVal)){
				attrVal = parseFloat(attrVal);
			}
			else if(regObj.test(attrVal)){
				try {
					attrVal = JSON.parse( attrVal );
				} catch(e){}
			}
			return attrVal;
		};
	})();

	life.createBatch = function(){
		var runs;
		var batch = [];
		var run = function() {
			while ( batch.length ) {
				batch.shift()();
			}
			runs = false;
		};
		return {
			run: run,
			add: function( fn ) {
				batch.push( fn );
			},
			timedRun: function() {
				if ( !runs ) {
					runs = true;
					setTimeout( run );
				}
			}
		}
	};

	life._failed = {};
	life._behaviors = {};
	life._attached = [];

	life.register = function(name, lifeClass, noCheck) {

		lifeClass.domName = lifeClass.domName || '_rb' + name;

		life._behaviors[ name ] = lifeClass;

		if ( !noCheck ) {
			if(!elements && !timer){
				timer = setTimeout(life.init);
			}
			life.throttledFindElements();
		}
	};

	life.create = function(element, lifeClass) {
		var instance;
		if ( !element._rbWidget ) {
			element[ lifeClass.domName ] = new lifeClass( element, life.getOptions( element ) );
			element._rbWidget = element[ lifeClass.domName ];
		}

		instance = element[ lifeClass.domName ];

		element.classList.add( attachedClass );

		if (instance && (instance.attached || instance.detached)) {
			life._attached.push(element);

			if ( instance.attached ) {
				life.batch.add(function() {
					instance.attached( element );
				});
				life.batch.timedRun();
			}
		}
	};

	life.getOptions = function( element ) {
		var i, name;
		var options = {};
		var attributes = element.attributes;
		var len = attributes.length;

		for ( i = 0; i < len; i++ ) {
			name = attributes[ i ].nodeName;
			if ( !name.indexOf( 'data-' ) ) {
				options[ life.camelCase( name.replace( regData , '' ) ) ] = life.parseValue( attributes[ i ].nodeValue );
			}
		}

		return options;
	};

	life.findElements = function() {
		var module, modulePath, moduleId, i;

		var len = elements.length;

		for ( i = 0; i < len; i++ ) {
			module = elements[ i ];
			modulePath = module.getAttribute( 'data-module' ) || '';
			moduleId = modulePath.split( '/' );
			moduleId = moduleId[ moduleId.length - 1 ];

			if ( life._behaviors[ moduleId ] ) {
				life.create( module, life._behaviors[ moduleId ] );
				removeElements.push( module );
			}
			else if ( life._failed[ moduleId ] ) {
				removeElements.push( module );
			}
			else if ( modulePath && window.System && System.import ) {
				(function (module, modulePath, moduleId) {
					setTimeout(function(){
						System.import(modulePath ).then(function () {
							if (!life._behaviors[ moduleId ]) {
								module.classList.remove(initClass);
								life._failed[ moduleId ] = true;
							}
						});
					});
				})(module, modulePath, moduleId);
			}
			else {
				life._failed[ moduleId ] = true;
				removeElements.push(module);
			}
		}

		while (removeElements.length) {
			removeElements.shift().classList.remove(initClass);
		}
		life.batch.run();
	};

	life.throttledFindElements = (function() {
		var setTimeout = window.setTimeout;
		var runs = false;
		var run = function() {
			runs = false;
			life.findElements();
		};
		return function () {
			if ( !runs ) {
				runs = true;
				setTimeout( run );
			}
		};
	})();

	life.initObserver = function() {
		var removeWidgets = function() {
			var i, len, instance, element;

			for(i = 0, len = life._attached.length; i < len; i++){
				element = life._attached[i];
				if( !document.contains(element) ){
					instance = element._rbWidget;

					element.classList.remove( attachedClass );
					element.classList.add( initClass );
					if ( instance.detached ) {
						instance.detached( element, instance );
					}

					life._attached.splice(i, 1);
					i--;
					len--;
				}
			}
		};

		var onMutation = function( mutations ) {
			var i, mutation;
			var len = mutations.length;

			for ( i = 0; i < len; i++ ) {
				mutation = mutations[ i ];
				if ( mutation.addedNodes.length ) {
					life.throttledFindElements();
				}
				if ( mutation.removedNodes.length ) {
					removeWidgets( mutation.removedNodes );
				}
			}
		};

		if ( !useMutationEvents && window.MutationObserver ) {
			new MutationObserver( onMutation )
				.observe( docElem, { subtree: true, childList: true } )
			;
		} else {
			docElem.addEventListener('DOMNodeInserted', life.throttledFindElements);
			document.addEventListener('DOMContentLoaded', life.throttledFindElements);
			docElem.addEventListener('DOMNodeRemoved', (function(){
				var mutation = {
					addedNodes: []
				};
				var mutations = [
					mutation
				];
				var run = function(){
					onMutation(mutations);
					mutation.removedNodes = false;
				};
				return function(e){
					if (!mutation.removedNodes) {
						mutation.removedNodes = [];
						setTimeout(run, 9);
					}
					if (e.target.nodeType == 1) {
						mutation.removedNodes.push(e.target);
					}
				};
			})());
		}
	};

	return life;
}));
