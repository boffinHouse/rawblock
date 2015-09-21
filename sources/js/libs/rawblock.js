if(!window.rb){
	window.rb = {};
}

window.rb.$ = window.jQuery || window.dom;

(function(docElem){
	'use strict';
	docElem.classList.remove('no-js');
	docElem.classList.add('js');
})(document.documentElement);

/* rbSlideUp / rbSlideDown */
(function(){
	'use strict';
	var $ = rb.$;

	$.fn.rbSlideUp = function(options){
		if(!options){
			options = {};
		}

		this
			.stop()
			.css({overflow: 'hidden', display: 'block', visibility: 'visible'})
			.animate({height: 0}, {
				duration: options.duration || 400,
				easing: options.easing,
				always: function(){
					this.style.display = '';
					this.style.visibility = '';

					if(options.always){
						return options.always.apply(this, arguments);
					}
				},
			})
		;
	};

	$.fn.rbSlideDown = function(options){
		if(!options){
			options = {};
		}

		return this.each(function(){
			var endValue;
			var $panel = $(this);
			var startHeight = this.clientHeight + 'px';

			$panel.css({overflow: 'hidden', display: 'block', height: 'auto', visibility: 'visible'});

			endValue = this.clientHeight;

			$panel
				.css({height: startHeight})
				.animate({height: endValue}, {
					duration: options.duration || 400,
					easing: options.easing,
					always: function(){
						this.style.overflow = '';
						this.style.height = '';

						if(options.always){
							return options.always.apply(this, arguments);
						}
					},
				})
			;
		});
	};
})();

/* scrollIntoView */
(function(window){
	'use strict';
	var document = window.document;
	var $ = rb.$;

	var getScrollingElement = function(){
		var bH, dH, isCompat;
		var scrollingElement = document.scrollingElement;

		if(!scrollingElement && document.body){
			bH = document.body.scrollHeight;
			dH = rb.root.scrollHeight;
			isCompat = document.compatMode == 'BackCompat';

			scrollingElement = (dH <= bH || isCompat) ?
				document.body :
				rb.root;

			if(dH != bH || isCompat){
				document.scrollingElement = scrollingElement;
			}
		}

		return scrollingElement || rb.root;
	};

	rb.root = document.documentElement;

	rb.$root = $(rb.root);

	rb.getScrollingElement = getScrollingElement;

	$.fn.scrollIntoView = function(options){
		var bbox, distance, scrollingElement;
		var elem = this.get(0);

		if(elem){
			options = options || {};
			bbox = elem.getBoundingClientRect();
			distance = Math.max(Math.abs(bbox.top), Math.abs(bbox.left));
			scrollingElement = getScrollingElement();

			$(scrollingElement).animate(
				{
					scrollTop: scrollingElement.scrollTop + bbox.top + (options.offsetTop || 0),
					scrollLeft: scrollingElement.scrollLeft + bbox.left + (options.offsetLeft || 0),
				},
				{
					duration: options.duration || Math.min(1700, Math.max(99, distance * 0.6)),
					always: function(){
						if(options.focus){
							try {
								options.focus.focus();
							} catch(e){}
						}

						if(options.hash){
							location.hash = typeof options.hash == 'string' ?
								options.hash :
							elem.id || elem.name
							;
						}

						if(options.always){
							options.always.call(elem);
						}
					},
					easing: options.easing
				}
			);
		}
		return this;
	};
})(window);

(function(rb){
	'use strict';
	rb.contains = function(elements, needle){
		return elements.find(rb.contains._contains, needle);
	};
	rb.contains._contains = function(element){
		return element == this || element.contains(this);
	};
})(rb);

/* throttle */
(function(){
	'use strict';
	var setImmediate = window.setImmediate || setTimeout;

	/**
	 *
	 * @param {Function} fn - The function to be throttled
	 * @param {Object} options - options for the throttle
	 *  @param {Object} options.that -  the context in which fn should be called
	 *  @param {Boolean} options.write -  wether fn is used to write layout (default is read)
	 *  @param {Number} options.delay = 200 -  the throttle delay
	 * @returns {Function} the throttled function
	 */
	rb.throttle = function(fn, options){
		var running, that, args;
		var lastTime = 0;
		var Date = window.Date;
		var run = function(){
			running = false;
			lastTime = Date.now();
			fn.apply(that, args);
		};
		var afterAF = function(){
			setImmediate(run);
		};
		var getAF = function(){
			rb.rAFQueue.add(afterAF);
		};

		if(!options){
			options = {};
		}

		if(!options.delay){
			options.delay = 200;
		}

		if(options.write){
			afterAF = run;
		}

		return function(){
			if(running){
				return;
			}
			var delay = options.delay - (Date.now() - lastTime);
			running =  true;

			if(delay < 6){
				delay = 6;
			}
			that = options.that || this;
			args = arguments;
			setTimeout(getAF, delay);
		};
	};
})();

/* resize */
(function(){
	'use strict';

	var iWidth, cHeight, installed;
	var docElem = document.documentElement;

	rb.resize = Object.assign(rb.$.Callbacks(), {

		setup: function(){
			if(!installed){
				installed = true;
				setTimeout(function(){
					iWidth = innerWidth;
					cHeight = docElem.clientHeight;
				});
				window.removeEventListener('resize', this.run);
				window.addEventListener('resize', this.run);
			}
		},
		teardown: function(){
			if(installed && !this.has()){
				installed = false;
				window.removeEventListener('resize', this.run);
			}
		},
		on: function(fn){
			this.add(fn);
			this.setup();
		},
		off: function(fn){
			this.remove(fn);
			this.teardown();
		},
	});

	rb.resize.run = rb.throttle(function(){
		if(iWidth != innerWidth || cHeight != docElem.clientHeight){
			iWidth = innerWidth;
			cHeight = docElem.clientHeight;

			this.fire();
		}
	}, {that:rb.resize});
})();

(function(){
	'use strict';
	var $ = rb.$;
	$.fn.elementResize = function(action, fn, options){
		if(!options){
			options = {};
		}
		var add = rb.rAF(function(){
			var width, height;
			var iframe = $(document.createElement('iframe'))
					.addClass('js-element-resize')
					.css({
						position: 'absolute',
						top: '0px',
						left: '0px',
						bottom: '0px',
						right: '0px',
						visibility: 'visible',
						'min-width': '100%',
						'min-height': '100%',
						'z-index': '-1',
						border: 'none',
						background: 'transparent',
						opacity: 0
					})
					.attr({
						role: 'presentation',
						tabindex: '-1',
						frameborder: '0',
					})
					.get(0)
				;

			if($(this).find('iframe.js-element-resize').length){
				rb.log('only one element resize handler allowed');
			}

			$(this).css({position: 'relative'});
			this.appendChild(iframe);

			setTimeout(function(){
				width = iframe.offsetWidth;
				height = iframe.offsetHeight;

				iframe.contentWindow.addEventListener('resize', function(){
					if( (!options.noWidth && width != iframe.offsetWidth)  || (!options.noHeight && height != iframe.offsetHeight)){
						width = iframe.offsetWidth;
						height = iframe.offsetHeight;
						fn();
					}
				});
			});
		});
		var remove = rb.rAF(function(){
			$(this).find('iframe.js-element-resize').remove();
		});

		return this.each(action == 'remove' ? remove : add);
	};
})();

(function(){
	'use strict';
	var $ = rb.$;
	rb.getCSSNumbers = function(element, styles, onlyPositive){
		var i, value;
		var numbers = 0;
		var cStyles = rb.getStyles(element);
		if(!Array.isArray(styles)){
			styles = [styles];
		}

		for(i = 0; i < styles.length; i++){
			value = $.css(element, styles[i], true, cStyles);

			if(!onlyPositive || value > 0){
				numbers += value;
			}
		}

		return numbers;
	};

	rb.camelCase = (function() {
		var reg = /-([\da-z])/gi;
		var camelCase = function(all, found) {
			return found.toUpperCase();
		};

		return function(str) {
			return str.replace(reg, camelCase);
		};
	})();

	rb.parseValue = (function() {
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

	rb.rAFQueue = (function(){
		var isInProgress, inProgressStack;
		var fns1 = [];
		var fns2 = [];
		var curFns = fns1;

		var run = function(){
			inProgressStack = curFns;
			curFns = fns1.length ? fns2 : fns1;

			isInProgress = true;
			while(inProgressStack.length){
				inProgressStack.shift()();
			}
			isInProgress = false;
		};
		var add = function(fn, inProgress){

			if(inProgress && isInProgress){
				inProgressStack.push(fn);
			} else {
				curFns.push(fn);
				if(curFns.length == 1){
					requestAnimationFrame(run);
				}
			}
		};
		var remove = function(fn){
			var index = curFns.indexOf(fn);

			if(index != -1){
				curFns.splice(index, 1);
			}
		};

		return {
			add: add,
			remove: remove,
		};
	})();

	rb.rAF = function(fn, thisArg, inProgress, isBatched){
		var running, args, that;
		var batchStack = [];
		var run = function(){
			running = false;
			if(isBatched){
				while(batchStack.length){
					args = batchStack.shift();
					fn.apply(args[0], args[1]);
				}
			} else {
				fn.apply(that, args);
			}
		};
		var rafedFn = function(){
			args = arguments;
			that = thisArg || this || window;
			if(isBatched){
				batchStack.push([that, args]);
			}
			if(!running){
				running = true;
				rb.rAFQueue.add(run, inProgress);
			}
		};

		if(typeof thisArg == 'boolean' && arguments.length < 4){
			inProgress = thisArg;
			isBatched = inProgress;
			thisArg = null;
		}

		rafedFn._rbUnrafedFn = fn;

		return rafedFn;
	};
})();

/* rbWidget */
(function(undefined){
	'use strict';
	var $ = rb.$;

	$.fn.rbWidget = function(name, args){
		var ret;
		this.each(function(){
			if(ret === undefined){
				ret = rb.life.getWidget(this, name, args);
			}
		});

		return ret === undefined ?
			this :
			ret
			;
	};

})();

(function(){
	'use strict';
	var $ = rb.$;
	var isExtended;
	var copyEasing = function(easing){
		var easObj = BezierEasing.css[easing];
		$.easing[easing] = function(number){
			return easObj.get(number);
		};
	};
	var extendEasing = function(){
		var easing;
		if(!isExtended && window.BezierEasing && $){
			isExtended = true;
			for(easing in BezierEasing.css){
				copyEasing(easing);
			}
		}
	};

	rb.addEasing = function(easing){
		var bezierArgs;
		if(window.BezierEasing && !$.easing[easing] && !BezierEasing.css[easing] && (bezierArgs = easing.match(/([0-9\.]+)/g)) && bezierArgs.length == 4){
			extendEasing();
			bezierArgs = bezierArgs.map(function(str){
				return parseFloat(str);
			});
			BezierEasing.css[easing] = BezierEasing.apply(this, bezierArgs);
			copyEasing(easing);
		}
		if(!$.easing[easing]) {
			if(window.BezierEasing && BezierEasing.css[easing]){
				copyEasing(easing);
			} else {
				$.easing[easing] =  $.easing.ease || $.easing.swing;
			}
		}
		return $.easing[easing];
	};
	extendEasing();
	setTimeout(extendEasing);
})();

(function(){
	'use strict';
	rb.Symbol = window.Symbol;
	var id = Math.round(Date.now() * Math.random());
	rb.getID = function(){
		id++;
		return id + '-' + Math.round(Math.random() * 1000000000000000000);
	};

	if(!rb.Symbol){
		rb.Symbol = function(name){
			name = name || '_';
			return name + rb.getID();
		};
	}
})();

( function() {
	'use strict';
	var getSelection = window.getSelection || function(){return {};};
	var regInputs = /^(?:input|select|textarea|button)$/i;

	document.addEventListener('click', function(e){

		if(e.defaultPrevented || regInputs.test(e.target.nodeName || '') || e.target.matches('a[href], a[href] *') || !e.target.matches('.is-teaser, .is-teaser *')){return;}
		var event, selection;
		var item = e.target.closest('.is-teaser');
		var link = item.querySelector('.is-teaser-link');

		if(link){
			selection = getSelection();
			if(selection.anchorNode && !selection.isCollapsed && item.contains(selection.anchorNode)){
				return;
			}
			if(window.MouseEvent && link.dispatchEvent){
				event = new MouseEvent('click', {shiftKey: e.shiftKey, altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey});
				event.stopImmediatePropagation();
				link.dispatchEvent(event);
			} else if(link.click) {
				link.click();
			}
		}
	});
})();

/*! focus-within polyfill */
(function(window, document){
	'use strict';

	var running = false;
	var isClass = 'is-focus-within';
	var isClassSelector = '.' + isClass;

	function updateFocus(){
		var oldFocusParents, i, len;

		var parent = document.activeElement;
		var newFocusParents = [];

		while((parent = parent.parentNode) && parent.classList && !parent.classList.contains(isClass)){
			newFocusParents.push(parent);
		}

		if((oldFocusParents = parent.querySelectorAll && parent.querySelectorAll(isClassSelector))){
			for(i = 0, len = oldFocusParents.length; i < len; i++){
				oldFocusParents[i].classList.remove(isClass);
			}
		}
		for(i = 0, len = newFocusParents.length; i < len; i++){
			newFocusParents[i].classList.add(isClass);
		}

		running = false;
	}

	function update(){
		if(!running){
			running = true;
			rb.rAFQueue.add(updateFocus, true);
		}
	}

	document.addEventListener('focus', update, true);
	document.addEventListener('blur', update, true);
	update();

})(window, document);

/* keyboard-focus */
(function(window, document){
	'use strict';
	var keyboardBlocktimer;
	var hasKeyboardFocus = false;
	var isKeyboardBlocked = false;
	var root = document.documentElement;
	var dom = rb.$;

	var unblockKeyboardFocus = function(){
		isKeyboardBlocked = false;
	};

	var blockKeyboardFocus = function(){
		isKeyboardBlocked = true;
		clearTimeout(keyboardBlocktimer);
		keyboardBlocktimer = setTimeout(unblockKeyboardFocus, 66);
	};

	var _removeKeyBoardFocus = rb.rAF(function(){
		hasKeyboardFocus = false;
		root.classList.remove('is-keyboardfocus');
	}, null, true);

	var removeKeyBoardFocus = function(){
		if(hasKeyboardFocus){
			_removeKeyBoardFocus();
		}
		blockKeyboardFocus();
	};

	var setKeyboardFocus = rb.rAF(function(){
		if(!isKeyboardBlocked){
			hasKeyboardFocus = true;
			root.classList.add('is-keyboardfocus');
		}
	}, null, true);

	var pointerEvents = (window.PointerEvent) ?
			['pointerdown', 'pointerup'] :
			['mousedown', 'mouseup', 'touchstart', 'touchend']
		;

	root.addEventListener('focus', setKeyboardFocus, true);

	pointerEvents.forEach(function(eventName){
		document.addEventListener(eventName, removeKeyBoardFocus, true);
	});

	document.addEventListener('click', blockKeyboardFocus, true);

	window.addEventListener('focus', blockKeyboardFocus);
	document.addEventListener('focus', blockKeyboardFocus);

	if(dom){
		dom(document).on('rbscriptfocus', blockKeyboardFocus);
	}

})(window, document);


(function(){
	'use strict';
	var regStartQuote = /^"*'*"*/;
	var regEndQuote = /"*'*"*$/;
	var regEscapedQuote = /\\"/g;
	rb.removeLeadingQuotes = function(str){
		return (str || '').replace(regStartQuote, '').replace(regEndQuote, '').replace(regEscapedQuote, '"');
	};

	rb.parsePseudo = function(element, pseudo){
		var ret;
		var value = typeof element == 'string' ?
				element :
				rb.getStyles(element, pseudo || '::after').content
			;
		try {
			ret = JSON.parse(rb.removeLeadingQuotes(value));
		} catch(e){}
		return ret;
	};

	rb.getStyles = function(elem, pseudo){
		var view = elem.ownerDocument.defaultView;

		if(!view.opener){
			view = window;
		}
		return view.getComputedStyle(elem, pseudo || null) || {getPropertyValue: rb.$.noop};
	};
})();

(function(){
	'use strict';
	var i = 0;
	var parseCSS = function(){
		var head = document.getElementsByTagName('head')[0];
		if(!head && i < 999){
			setTimeout(parseCSS);
			return;
		}
		var styles = rb.parsePseudo(head) || {};
		var beforeStyle = rb.getStyles(head, '::before');
		var currentStyle = '';

		var detectMQChange = function(){
			var nowStyle = beforeStyle.content;
			if(currentStyle != nowStyle){
				currentStyle = nowStyle;
				rb.cssConfig.beforeMQ = rb.cssConfig.currentMQ;
				rb.cssConfig.currentMQ = rb.removeLeadingQuotes(currentStyle);
				rb.cssConfig.mqChange.fireWith(rb.cssConfig);
			}
		};

		rb.cssConfig = Object.assign({mqs: {}, currentMQ: '', beforeMQ: ''}, styles, {mqChange: rb.$.Callbacks()});

		rb.resize.on(detectMQChange);

		detectMQChange();
	};
	parseCSS();
})();

(function(){
	'use strict';
	var console = window.console || {};
	var log = console.log && console.log.bind ? console.log : rb.$.noop;

	rb.addLog = function(obj, initial){
		var realLog = log.bind(console);
		var fakeLog = rb.$.noop;

		obj.__isDebug = initial;
		obj.log = obj.__isDebug ? realLog : fakeLog;

		Object.defineProperty(obj, 'isDebug', {
			configurable: true,
			enumerable: true,
			get: function(){
				return this.__isDebug;
			},
			set: function(value){
				this.__isDebug = !!value;
				this.log = (this.__isDebug) ? realLog : fakeLog;
			}
		});
	};

	rb.addLog(rb, true);
})();

(function(){
	'use strict';
	var rb = window.rb;

	var cbs = [];
	var setup = function(){
		setup = rb.$;
		document.addEventListener('click', function(e){
			var i, len, attr, found;
			var clickElem = e.target.closest('.js-click');
			if(!clickElem){return;}

			for(i = 0, len = cbs.length; i < len;i++){
				attr = clickElem.getAttribute(cbs[i].attr);

				if(attr != null){
					found = true;
					cbs[i].fn(clickElem, e, attr);
					break;
				}
			}

			if(!found){
				clickElem.classList.remove('js-click');
			}
		}, true);
	};

	rb.click = {
		cbs: cbs,
		add: function(name, fn){
			cbs.push({
				attr: 'data-'+name,
				fn: fn,
			});
			if(cbs.length == 1){
				setup();
			}
		}
	};
})();

(function(){
	'use strict';
	var regSplit = /\s*,\s*/g;
	var regTarget = /^\s*([a-z0-9-_]+)\((.+)\)\s*$/i;

	rb.elementFromStr = function(targetStr, element){
		var i, len, target, temp;
		if (targetStr.match(regTarget)) {
			if (RegExp.$1 == 'closest') {
				target = element.closest(RegExp.$2);
			} else if ( !((RegExp.$1 || '').indexOf('sel')) ) {
				target = document.querySelectorAll(RegExp.$2);
			} else if(!((RegExp.$1 || '').indexOf('child'))){
				target = element.querySelectorAll(RegExp.$2);
			}
		} else if (targetStr) {
			targetStr = targetStr.split(regSplit);
			target = [];
			for(i = 0, len = targetStr.length; i < len; i++){
				temp = document.getElementById(targetStr[i]);
				if(temp){
					target.push(temp);
				}
			}
		}
		if(target && target.nodeType != 1 && 'length' in target && target.length < 2){
			target = target[0];
		}
		return target || null;
	}
})();

(function(window, document) {
	'use strict';

	var elements, useMutationEvents, implicitlyStarted;
	var docElem = document.documentElement;

	var life = {};
	var removeElements = [];
	var initClass = 'js-rb-life';
	var attachedClass = 'js-rb-attached';
	var rb = window.rb;
	var $ = rb.$;
	var widgetExpando = rb.Symbol('_rbWidget');
	var expando = rb.Symbol('_rbCreated');

	window.rb.life = life;

	life.autoStart = true;

	life.init = function(options){
		if (elements) {rb.log('only once');return;}

		if (options) {
			useMutationEvents = options.useMutationEvents || false;
		}

		elements = document.getElementsByClassName(initClass);

		life.batch = life.createBatch();

		life.initObserver();
		life.throttledFindElements();

		life.initClickCreate();
	};

	life.expando = expando;
	life.widgetExpando = widgetExpando;

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
		};
	};

	life._failed = {};
	life._behaviors = {};
	rb.widgets = life._behaviors;
	life._attached = [];

	life.register = function(name, LifeClass, noCheck) {

		rb.widgets[ name ] = LifeClass;

		if ( !noCheck ) {
			if(!elements && !implicitlyStarted){
				implicitlyStarted = true;
				setTimeout(function(){
					if(!elements && life.autoStart){
						$(function(){
							if(!elements) {
								life.init();
							}
						});
					}
				});
			} else if(elements) {
				life.throttledFindElements();
			}
		}
	};

	life.create = function(element, LifeClass) {
		var instance, trigger;
		if ( !(instance = element[widgetExpando]) ) {
			instance = new LifeClass( element );
			trigger = true;
		}

		rb.rAFQueue.add(function(){
			element.classList.add( attachedClass );
		});

		if (!element[expando] && instance && (instance.attached || instance.detached || instance.attachedOnce)) {

			if(instance.attached || instance.detached){
				life._attached.push(element);
				if(instance.attached){
					life.batch.add(function() {
						instance.attached();
					});
				}
			}

			if(instance.attachedOnce && trigger){
				life.batch.add(function() {
					instance.attachedOnce();
				});
			}
			life.batch.timedRun();
		}
		element[expando] = true;

		if(trigger){
			life.batch.add(function() {
				instance._trigger('created');
			});
		}
		return instance;
	};

	life.findElements = function() {
		var module, modulePath, moduleId, i;

		var len = elements.length;

		for ( i = 0; i < len; i++ ) {
			module = elements[ i ];

			if(module[expando]){
				removeElements.push( module );
				continue;
			}

			modulePath = module.getAttribute( 'data-module' ) || '';
			moduleId = modulePath.split( '/' );
			moduleId = moduleId[ moduleId.length - 1 ];

			if ( rb.widgets[ moduleId ] ) {
				life.create( module, rb.widgets[ moduleId ] );
				removeElements.push( module );
			}
			else if ( life._failed[ moduleId ] ) {
				removeElements.push( module );
			}
			else if ( modulePath && rb.loadPackage ) {
				/* jshint loopfunc: true */
				(function (module, modulePath, moduleId) {
					rb.loadPackage(modulePath).then(function () {
						if (!rb.widgets[ moduleId ]) {
							life._failed[ moduleId ] = true;
						}
					});
				})(module, modulePath, moduleId);
			}
			else {
				life._failed[ moduleId ] = true;
				removeElements.push(module);
			}
		}

		life.removeInitClass();
		life.batch.run();
	};

	life.removeInitClass = rb.rAF(function(){
		while (removeElements.length) {
			removeElements.shift().classList.remove(initClass);
		}
	}, null, true);

	life.throttledFindElements = (function() {
		var setImmediate = window.setImmediate || window.setTimeout;
		var requestAnimationFrame = window.requestAnimationFrame;
		var runs = false;
		var runImmediate = function() {
			runs = false;
			life.findElements();
		};
		var rAFRun = function() {
			setImmediate(runImmediate);
		};
		return function () {
			if ( !runs ) {
				runs = true;
				requestAnimationFrame( rAFRun );
			}
		};
	})();

	life.destroyWidget = function(instance, index){
		var element = instance.element;

		if(index == null){
			index = life._attached.indexOf(element);
		}
		element.classList.remove( attachedClass );

		if(element[expando]){
			delete element[expando];
		}
		if ( instance.detached ) {
			instance.detached( element, instance );
		}

		life._attached.splice(index, 1);
	};

	life.initClickCreate = function(){
		life.initClickCreate = $.noop;
		rb.click.add('module', function(elem){
			life.getWidget(elem);
			rb.rAFQueue.add(function(){
				elem.classList.remove('js-click');
			}, true);
			life.batch.run();
		});
	};

	life.initObserver = function() {
		var removeWidgets = (function(){
			var runs, timer;
			var i = 0;
			var main = function() {
				var len, instance, element;
				var start = Date.now();
				for(len = life._attached.length; i < len && Date.now() - start < 6; i++){
					element = life._attached[i];

					if( element && (instance = element[widgetExpando]) && !docElem.contains(element) ){
						element.classList.add( initClass );
						life.destroyWidget(instance, i);

						i--;
						len--;
					}
				}

				if(i < len){
					timer = setTimeout(main, 40);
				} else {
					timer = false;
				}
				runs = false;
			};
			return function(){
				if(!runs){
					runs = true;
					i = 0;
					if(timer){
						clearTimeout(timer);
					}
					setTimeout(main , 99);
				}
			};
		})();

		var onMutation = function( mutations ) {
			var i, mutation;
			var len = mutations.length;

			for ( i = 0; i < len; i++ ) {
				mutation = mutations[ i ];
				if ( mutation.addedNodes.length ) {
					life.throttledFindElements();
				}
				if ( mutation.removedNodes.length ) {
					removeWidgets();
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
})(window, document);

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
	var initializing = false;
	var fnTest = (/xyz/.test(function(){var a = xyz;})) ?
			/\b_super\b/ :
			/.*/
		;

	// The base Class implementation (does nothing)
	window.rb.life.Class = function(){};

	// Create a new Class that inherits from this class
	window.rb.life.Class.extend = function(prop) {
		var name, prototype, origDescriptor, descProp, superDescriptor;
		var _super = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		prototype = new this();
		initializing = false;

		// Copy the properties over onto the new prototype
		for (name in prop) {
			origDescriptor = Object.getOwnPropertyDescriptor(prop, name);
			if(!origDescriptor){continue;}

			superDescriptor = (name in _super && Object.getOwnPropertyDescriptor(_super, name));

			for(descProp in origDescriptor){
				// Check if we're overwriting an existing function and using super keyword
				origDescriptor[descProp] = superDescriptor && typeof origDescriptor[descProp] == "function" &&
				typeof superDescriptor[descProp] == "function" && fnTest.test(origDescriptor[descProp]) ?
					/* jshint loopfunc: true */
					(function(_superFn, fn){
						return function() {
							var tmp = this._super;

							// Add a new ._super() method that is the same method
							// but on the super-class
							this._super = _superFn;

							// The method only need to be bound temporarily, so we
							// remove it when we're done executing
							var ret = fn.apply(this, arguments);
							this._super = tmp;

							return ret;
						};
					})(superDescriptor[descProp], origDescriptor[descProp]) :
					origDescriptor[descProp]
				;
			}

			Object.defineProperty(prototype, name, origDescriptor);
		}

		// The dummy class constructor
		function Class() {
			// All construction is actually done in the init method
			if ( !initializing && this.init )
				this.init.apply(this, arguments);
		}

		// Populate our constructed prototype object
		Class.prototype = prototype;

		// Enforce the constructor to be what we expect
		Class.prototype.constructor = Class;

		// And make this class extendable
		Class.extend = this.extend || window.rb.life.Class.extend;

		return Class;
	};
})();

(function(window, document, life, undefined){
	'use strict';

	var regData = /^data-/;
	var $ = window.rb.$;
	var widgetExpando = life.widgetExpando;

	life.getWidget = function(element, key, args){
		var ret, moduleId;
		var widget = element && element[widgetExpando];

		if(!widget){

			moduleId = (element.getAttribute( 'data-module' ) || '').split( '/' );
			moduleId = moduleId[ moduleId.length - 1 ];
			if(typeof key == 'object'){
				options = key;
			}

			if(rb.widgets[ moduleId ]){
				widget = life.create(element, rb.widgets[ moduleId ]);
			}
		}

		ret = widget;
		if(widget && key){
			ret = widget[key];

			if(typeof ret == 'function'){
				ret = ret.apply(widget, args || []);
			} else if(args !== undefined){
				widget[key] = args;
				ret = undefined;
			}
		}
		return ret;
	};

	life.Widget = life.Class.extend({
		defaults: {},
		init: function(element){
			this.element = element;
			this.$element = $(element);
			this.options = {};

			this._evtName = this.name + 'changed';
			this._beforeEvtName = this.name + 'change';

			element[widgetExpando] = this;

			this.parseOptions(this.options, this.constructor.defaults);

			this.setupLifeOptions();

			this.setOption('debug', this.options.debug == null ? rb.isDebug : this.options.debug);
		},
		widget: life.getWidget,
		setupLifeOptions: function(){
			var runner, styles;
			var old = {};
			var that = this;

			if (this.options.watchCSS) {
				styles = rb.getStyles(that.element, '::after');
				old.attached = this.attached;
				old.detached = this.detached;
				runner = function() {
					if(that._styleOptsStr != (styles.content || '')){
						that.parseOptions(null, that.constructor.defaults);
					}
				};

				this.attached = function(){
					rb.resize.on(runner);
					if(old.attached){
						return old.attached.apply(this, arguments);
					}
				};
				this.detached = function(){
					rb.resize.off(runner);
					if(old.detached){
						return old.detached.apply(this, arguments);
					}
				};

				if(!old.attached && !old.detached && life._attached.indexOf(this.element) == -1){
					life._attached.push(this.element);
				}
			}
		},

		getId: function(element){
			var id = (element || this.element).id;
			if (!id) {
				id = 'rbjsid-' + rb.getID();
				(element || this.element).id = id;
			}
			return id;
		},

		_trigger: function(name, detail){
			var evt;
			if(typeof name == 'object'){
				detail = name;
				name = detail.type;
			}
			if(name == null){
				name = this._evtName;
			} else if(!name.includes(this.name)){
				name = this.name + name;
			}
			evt = $.Event(name, {detail: detail || {}});
			this.$element.trigger(evt);
			return evt;
		},

		setFocus: function(elem){
			try {
				setTimeout(function(){
					elem.focus();
				}, 0);
			} catch(e){}
		},
		setWidgetFocus: function(element){
			this._activeElement = document.activeElement;
			var focusElement;

			if(element && element !== true){
				if(element.nodeType == 1){
					focusElement = element;
				} else if(typeof element == 'string'){
					focusElement = this.element.querySelector(element);
				}
			} else {
				focusElement = this.element.querySelector('.js-autofocus');
			}
			if(!focusElement && element === true){
				focusElement = this.element;
			}
			if(focusElement){
				this.setFocus(focusElement);
			}
		},
		restoreFocus: function(checkInside){
			var activeElem = this._activeElement;
			if(!activeElem){return;}

			this._activeElement = null;
			if(!checkInside || this.element.contains(document.activeElement)){
				this.setFocus(activeElem);
			}
		},
		parseOptions: function(opts, defaults){
			var options = Object.assign(opts || {}, defaults || {}, this.parseCSSOptions() || {}, this.parseHTMLOptions());
			this.setOptions(options);
		},

		setOptions: function(opts){
			for(var prop in opts){
				if(opts[prop] !== this.options[prop]){
					this.setOption(prop, opts[prop]);
				}
			}
		},

		setOption: function(name, value){
			this.options[name] = value;
			if(name == 'debug' && value){
				this.isDebug = true;
			}
		},

		parseHTMLOptions: function(element){
			var i, name;
			var options = {};
			var attributes = (element || this.element).attributes;
			var len = attributes.length;

			for ( i = 0; i < len; i++ ) {
				name = attributes[ i ].nodeName;
				if ( !name.indexOf( 'data-' ) ) {
					options[ rb.camelCase( name.replace( regData , '' ) ) ] = rb.parseValue( attributes[ i ].nodeValue );
				}
			}

			return options;
		},

		parseCSSOptions: function(element){
			var style = rb.getStyles(element || this.element, '::after').content || '';
			if(style && (element || !this._styleOptsStr || style != this._styleOptsStr )){
				if(!element){
					this._styleOptsStr = style;
				}
				style = rb.parsePseudo(style);
			}
			return style || false;
		},

		destroy: function(){
			life.destroyWidget(this);
		}
	});

	rb.addLog(life.Widget.prototype, false);

	life.Widget.extend = function(name, prop){
		var Class;

		if(!prop.name){
			prop.name = name;
		}

		Class = life.Class.extend.call(this, prop);
		Class.defaults = Object.assign({}, this.defaults || {}, prop.defaults || {});

		if(prop.statics || this.statics){
			Object.assign(Class, this.statics || {}, prop.statics || {});
		}

		life.register(name, Class);
		return Class;
	};

	rb.Widget = life.Widget;
})(window, document, rb.life);
