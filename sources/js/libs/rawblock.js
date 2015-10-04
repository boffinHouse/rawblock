if(!window.rb){
	window.rb = {};
}

(function(window, document, undefined){
	'use strict';
	window.rb.$ = window.rb.$ || window.jQuery || window.dom;

	var rb = window.rb;
	var $ = rb.$;

	rb.root = document.documentElement;

	rb.$root = $(rb.root);

	rb.$win = $(window);
	rb.$doc = $(document);

	/* global vars end */

	/* rbSlideUp / rbSlideDown */
	$.fn.rbSlideUp = function(options){
		if(!options){
			options = {};
		}

		if(this.length){
			var opts = Object.assign({}, options, {
				always: function(){
					this.style.display = '';
					this.style.visibility = '';

					if(options.always){
						return options.always.apply(this, arguments);
					}
				}
			});

			this
				.stop()
				.css({overflow: 'hidden', display: 'block', visibility: 'inherit'})
				.animate({height: 0}, opts)
			;
		}
		return this;
	};

	$.fn.rbSlideDown = function(options){
		var opts;
		if(!options){
			options = {};
		}

		if(this.length){
			opts = Object.assign({}, options, {
				always: function(){
					this.style.overflow = '';
					this.style.height = '';

					if(options.always){
						return options.always.apply(this, arguments);
					}
				},
			});
		}

		return this.each(function(){
			var endValue;
			var $panel = $(this);
			var startHeight = this.clientHeight + 'px';

			$panel.css({overflow: 'hidden', display: 'block', height: 'auto', visibility: 'inherit'});

			endValue = this.clientHeight;

			$panel
				.css({height: startHeight})
				.animate({height: endValue}, opts)
			;
		});
	};

	/* scrollIntoView */

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

	rb.getScrollingElement = getScrollingElement;

	$.fn.scrollIntoView = function(options){
		var bbox, distance, scrollingElement, opts;
		var elem = this.get(0);

		if(elem){
			options = options || {};
			bbox = elem.getBoundingClientRect();
			distance = Math.max(Math.abs(bbox.top), Math.abs(bbox.left));
			scrollingElement = getScrollingElement();

			if(options.easing){
				rb.addEasing(options.easing);
			}

			if(!options.duration){
				options.duration = Math.min(1700, Math.max(99, distance * 0.6));
			}

			opts = Object.assign({}, options, {
				always: function(){
					if(options.focus){
						rb.setFocus(options.focus);
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
				}
			});

			$(scrollingElement).animate(
				{
					scrollTop: scrollingElement.scrollTop + bbox.top + (options.offsetTop || 0),
					scrollLeft: scrollingElement.scrollLeft + bbox.left + (options.offsetLeft || 0),
				},
				opts
			);
		}
		return this;
	};

	/* contains */
	rb.contains = function(elements, needle){
		return elements.find(rb.contains._contains, needle);
	};
	rb.contains._contains = function(element){
		return element == this || element.contains(this);
	};

	/* throttle */
	var setImmediate = window.setImmediate || setTimeout;

	/**
	 *
	 * @param {function} fn - The function to be throttled
	 * @param {object} options - options for the throttle
	 *  @param {object} options.that -  the context in which fn should be called
	 *  @param {boolean} options.write -  wether fn is used to write layout (default is read)
	 *  @param {number} options.delay = 200 -  the throttle delay
	 * @returns {function} the throttled function
	 */
	rb.throttle = function(fn, options){
		var running, that, args;
		var lastTime = 0;
		var Date = window.Date;
		var _run = function(){
			running = false;
			lastTime = options.simple || Date.now();
			fn.apply(that, args);
		};
		var afterAF = function(){
			setImmediate(_run);
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
			afterAF = _run;
		} else if(!options.read){
			getAF = _run;
		}

		return function(){
			if(running){
				return;
			}
			var delay = options.delay;
			running =  true;

			if(!options.simple){
				delay -= (Date.now() - lastTime);
				if(delay < 0){
					delay = 0;
				}
			}
			that = options.that || this;
			args = arguments;
			setTimeout(getAF, delay);
		};
	};

	/* resize */
	var iWidth, cHeight, installed;
	var docElem = rb.root;

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
	}, {that: rb.resize});


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
		var regNumber = /^\-{0,1}\+{0,1}\d+?\.{0,1}\d*?$/;
		var regObj = /^\[.*?]|\{.*?}$/;
		return function( attrVal ) {

			if(attrVal == 'true'){
				attrVal = true;
			}
			else if(attrVal == 'false'){
				attrVal = false;
			} else if(attrVal == 'null'){
				attrVal = null;
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
		var running, args, that, options;
		var batchStack = [];
		var run = function(){
			running = false;
			if(options.batch){
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
			that = options.that || this;
			if(options.batch){
				batchStack.push([that, args]);
			}
			if(!running){
				running = true;
				rb.rAFQueue.add(run, inProgress);
			}
		};

		if(thisArg && typeof thisArg == 'object' && (('that' in thisArg) || ('batch' in thisArg) || ('inProgress' in thisArg))){
			options = thisArg;
		} else {

			//ToDo: remove deprecated warning and refactor
			if(thisArg || isBatched || inProgress){
				throw('deprecated use of rAF');
			}
			options = {};
		}

		if(options.inProgress){
			rb.log('deprecated use of rAF (inProgress)');
		}

		inProgress = !options.queue;

		if(fn._rbUnrafedFn){
			rb.log('double rafed', fn);
		}

		rafedFn._rbUnrafedFn = fn;

		return rafedFn;
	};

	/* rbWidget */
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

	/* Symbol */
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

	var elementResize = {
		add: function(element, fn, options){
			if(!element[elementResize.expando]){
				element[elementResize.expando] = {
					width: element.offsetWidth,
					height: element.offsetHeight,
					cbs: $.Callbacks(),
					widthCbs: $.Callbacks(),
					heightCbs: $.Callbacks(),
					wasStatic: rb.getStyles(element).position == 'static',
				};

				this.addMarkup(element, element[elementResize.expando]);
			}
			if(options && options.noWidth){
				element[elementResize.expando].heightCbs.add(fn);
			} else if(options && options.noHeight){
				element[elementResize.expando].widthCbs.add(fn);
			} else {
				element[elementResize.expando].cbs.add(fn);
			}
			return element[elementResize.expando];
		},
		remove: function(element, fn, options){
			if(element[elementResize.expando]){
				element[elementResize.expando].cbs.remove(fn);
				element[elementResize.expando].heightCbs.remove(fn);
				element[elementResize.expando].widthCbs.remove(fn);
			}
		},
		expando: rb.Symbol('_elementResize'),
		addMarkup: rb.rAF(function(element, data){
			var fire, widthChange, heightChange;
			var first = true;
			var expandElem, shrinkElem, expandChild, block;
			var posStyle = 'position:absolute;top:0;left:0;display: block;'; //
			var wrapperStyle = posStyle + 'bottom:0;right:0;';
			var wrapper = document.createElement('span');

			var addEvents = function(){
				expandElem.addEventListener('scroll', onScroll);
				shrinkElem.addEventListener('scroll', onScroll);
			};

			var runFire = rb.throttle(function(){

				if(heightChange){
					element[elementResize.expando].heightCbs.fire();
				}
				if(widthChange){
					element[elementResize.expando].widthCbs.fire();
				}

				data.cbs.fire();
				heightChange = false;
				widthChange = false;
			});

			var scrollWrite = function(){
				expandElem.scrollLeft = data.exScrollLeft;
				expandElem.scrollTop = data.exScrollTop;
				shrinkElem.scrollLeft = data.shrinkScrollLeft;
				shrinkElem.scrollTop = data.shrinkScrollTop;

				if(fire){
					runFire();
				}

				if(first){
					first = false;
					setTimeout(onScroll);
					addEvents();
				}
				block = false;
			};

			var write = rb.rAF(function(){
				expandChild.style.width = data.exChildWidth;
				expandChild.style.height = data.exChildHeight;
				setTimeout(scrollWrite, 8);
			});

			var read = function(){
				data.exChildWidth = expandElem.offsetWidth + 10 + 'px';
				data.exChildHeight = expandElem.offsetHeight + 10 + 'px';

				data.exScrollLeft = expandElem.scrollWidth;
				data.exScrollTop = expandElem.scrollHeight;

				data.shrinkScrollLeft = shrinkElem.scrollWidth;
				data.shrinkScrollTop = shrinkElem.scrollHeight;

				write();
			};
			var onScroll = function(){
				if(block){
					return;
				}

				var width = element.offsetWidth;
				var height = element.offsetHeight;

				var curWidthChange = width != data.width;
				var curHeightChange = height != data.height;
				fire = curHeightChange || curWidthChange;

				if(fire){
					widthChange = curWidthChange || widthChange;
					heightChange = curHeightChange || heightChange;
					data.height = height;
					data.width = width;
					block = true;
					read();
				}

			};

			wrapper.className = 'js-element-resize';
			wrapper.setAttribute('style', wrapperStyle +'visibility:hidden;z-index: -1;');
			wrapper.innerHTML = '<span style="'+ wrapperStyle +'overflow: scroll;">' +
				'<span style="'+ posStyle +'"><\/span>' +
				'<\/span>' +
				'<span style="'+ wrapperStyle +'overflow: scroll;">' +
				'<span style="'+ posStyle +'width: 200%; height: 200%;"><\/span>' +
				'<\/span>';

			expandElem = wrapper.children[0];
			shrinkElem = wrapper.children[1];
			expandChild = expandElem.children[0];

			if(data.wasStatic){
				element.style.position = 'relative';
			}

			element.appendChild(wrapper);
			setTimeout(read);
		}, {batch: true}),
	};

	$.fn.elementResize = function(action, fn, options){
		if(action != 'remove'){
			action = 'add';
		}
		return this.each(function(){
			elementResize[action](this, fn, options);
		});
	};

	/* is-teaser delegate */
	var getSelection = window.getSelection || function(){return {};};
	var regInputs = /^(?:input|select|textarea|button|a)$/i;

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

	rb.setFocus = function(elem){
		try {
			setTimeout(function(){
				elem.focus();
				rb.$doc.trigger('rbscriptfocus');
			}, 9);
		} catch(e){}
	};

	/* focus-within polyfill */

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


	/* keyboard-focus */
	var keyboardBlocktimer;
	var hasKeyboardFocus = false;
	var isKeyboardBlocked = false;
	var root = rb.root;

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
	});

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
	});

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

	rb.$doc.on('rbscriptfocus', blockKeyboardFocus);


	var regStartQuote = /^"?'?"?/;
	var regEndQuote = /"?'?"?$/;
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

	var cssConfig = {mqs: {}, currentMQ: '', beforeMQ: '', mqChange: rb.$.Callbacks()};
	var parseCSS = function(){
		var root = rb.root;

		var styles = rb.parsePseudo(root) || {};
		var beforeStyle = rb.getStyles(root, '::before');
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

		Object.defineProperty(rb, 'cssConfig', {
			configurable: true,
			enumerable: true,
			writable: true,
			value: Object.assign(cssConfig, styles)
		});

		rb.resize.on(detectMQChange);

		detectMQChange();
	};

	Object.defineProperty(rb, 'cssConfig', {
		configurable: true,
		enumerable: true,
		get: function(){
			parseCSS();
			return cssConfig;
		}
	});


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

	var cbs = [];
	var setup = function(){
		setup = rb.$;
		document.addEventListener('click', function(e){
			var i, len, attr, found;
			var clickElem = e.target.closest('.js-click');
			while(clickElem){
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

				clickElem = clickElem.parentNode;
				if(clickElem && clickElem.closest){
					clickElem = clickElem.closest('.js-click');
				}

				if(clickElem && !clickElem.closest){
					clickElem = null;
				}
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


	var regSplit = /\s*?,\s*?|\s+?/g;
	var regNum = /:(\d)+\s*$/;
	var regTarget = /^\s*?\.?([a-z0-9_]+)\((.*?)\)\s*?/i;

	[['closestNext', 'nextElementSibling'], ['closestPrev', 'previousElementSibling']].forEach(function(action){
		$.fn[action[0]] = function(sel){
			var array = [];
			var found = false;

			this.each(function(i, elem){
				var element = found || elem[action[1]];
				while(!found && element){
					if((!sel || element.matches(sel))){
						found = true;
						array.push(element);
						break;
					} else {
						element = element[action[1]];
					}
				}
			});
			return $( array );
		};
	});

	rb.elementFromStr = function(targetStr, element){
		var i, len, target, temp, num, match;
		if((num = targetStr.match(regNum))){
			targetStr = targetStr.replace(num[0], '');
			num = num[1];
		}
		if ((match = targetStr.match(regTarget))) {

			if(match[1] == '$' || match[1] == 'sel'){
				target = Array.from(document.querySelectorAll(match[2]));
			} else if($.fn[match[1]]){
				if(!match[2]){
					match[2] = null;
				}
				target = $(element)[match[1]](match[2]).get();
			}
		} else if (targetStr) {
			targetStr = targetStr.split(regSplit);
			target = [];
			for(i = 0, len = targetStr.length; i < len; i++){
				temp = targetStr[i] && document.getElementById(targetStr[i]);
				if(temp){
					target.push(temp);
				}
			}
		}

		if(num && target){
			target = target[num] ? [target[num]] : [];
		}

		return target || [];
	};

	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	rb.getPropertyDescriptor = function getPropertyDescriptor(o, name) {
		var proto = o, descriptor;
		if(name in proto){
			while (proto && !(descriptor = getOwnPropertyDescriptor(proto, name))){
				proto = Object.getPrototypeOf(proto);
			}
		}
		return descriptor;
	};
})(window, document);

(function(window, document) {
	'use strict';

	var elements, useMutationEvents, implicitlyStarted, lifeBatch;

	var life = {};
	var removeElements = [];
	var initClass = 'js-rb-life';
	var attachedClass = 'js-rb-attached';
	var rb = window.rb;
	var $ = rb.$;
	var widgetExpando = rb.Symbol('_rbWidget');
	var expando = rb.Symbol('_rbCreated');
	var docElem = rb.root;

	var registerElement = function(name, LifeClass){
		var proto = Object.create(HTMLElement.prototype);
		var protoClass = LifeClass.prototype;

		proto.createdCallback = function(){
			life.create(this, LifeClass, true);
		};

		['attached', 'detached'].forEach(function(action){
			var cb;
			if(protoClass[action]){
				cb = action + 'Callback';
				proto[cb] = function(){
					if(this[life.widgetExpando]){
						return this[life.widgetExpando][action]();
					}
				};
			}
		});

		document.registerElement('rb-' + name, {
			prototype: proto
		});
	};

	var extendStatics = function(Class, proto, SuperClasss, prop){

		Object.defineProperty(Class, prop, {
			configurable: true,
			enumerable: true,
			writable: true,
			value: Object.assign({}, SuperClasss[prop], proto[prop], Class[prop])
		});

		if(proto[prop]){
			proto[prop] = null;
		}
	};

	var initClickCreate = function(){
		initClickCreate = $.noop;
		rb.click.add('module', function(elem){
			life.getWidget(elem);
			rb.rAFQueue.add(function(){
				elem.classList.remove('js-click');
			}, true);
			lifeBatch.run();
		});
	};

	var initObserver = function() {
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
					life.searchModules();
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
			docElem.addEventListener('DOMNodeInserted', life.searchModules);
			document.addEventListener('DOMContentLoaded', life.searchModules);
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

	var createBatch = function(){
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

	window.rb.life = life;

	life.autoStart = true;

	life.expando = expando;
	life.widgetExpando = widgetExpando;

	life._failed = {};
	rb.widgets = {};
	rb.components = rb.widgets;
	life._behaviors = rb.widgets;
	life._attached = [];
	life.customElements = false;

	life.init = function(options){
		if (elements) {rb.log('only once');return;}

		if (options) {
			useMutationEvents = options.useMutationEvents || false;
		}

		elements = document.getElementsByClassName(initClass);

		lifeBatch = createBatch();

		initObserver();
		life.searchModules();

		initClickCreate();
	};

	life.register = function(name, LifeClass, noCheck) {
		var proto = LifeClass.prototype;
		var superProto = Object.getPrototypeOf(proto);
		var superClass = superProto.constructor;

		extendStatics(LifeClass, proto, superClass, 'defaults');
		extendStatics(LifeClass, proto, superClass, 'events');

		if(!proto.hasOwnProperty('name')){
			proto.name = name;
		}

		if(rb.widgets[ name ]){
			rb.log(name +' already exists.');
		}

		rb.widgets[ name ] = LifeClass;

		if(name.charAt(0) == '_'){return;}

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
				life.searchModules();
			}
		}

		setTimeout(function(){
			if(life.customElements && document.registerElement){
				registerElement(name, LifeClass);
			}
		});
	};

	life.create = function(element, LifeClass, _fromWebComponent) {
		var instance;

		if ( !(instance = element[widgetExpando]) ) {
			instance = new LifeClass( element );
			element[widgetExpando] = instance;
		}

		rb.rAFQueue.add(function(){
			element.classList.add( attachedClass );
		});

		if (!_fromWebComponent && !element[expando] && instance && (instance.attached || instance.detached)) {

			if((instance.attached || instance.detached)){
				if(life._attached.indexOf(element) == -1){
					life._attached.push(element);
				}
				if(instance.attached){
					lifeBatch.add(function() {
						instance.attached();
					});
				}
			}

			lifeBatch.timedRun();
		}
		element[expando] = true;
		instance._created = true;

		return instance;
	};

	life.searchModules = (function() {
		var setImmediate = window.setImmediate || window.setTimeout;
		var requestAnimationFrame = window.requestAnimationFrame;
		var runs = false;
		var removeInitClass = rb.rAF(function(){
			while (removeElements.length) {
				removeElements.shift().classList.remove(initClass);
			}
		});

		var findElements = function() {

			var module, modulePath, moduleId, i;

			var len = elements.length;
			runs = false;

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

			removeInitClass();
			lifeBatch.run();
		};
		var rAFRun = function() {
			setImmediate(findElements);
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

	return life;
})(window, document);

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * modified for better ES5 support by alex
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
	var rb = window.rb;
	var fnTest = (/xyz/.test(function(){var a = xyz;})) ?
			/\b_super\b/ :
			/.*/
		;

	// The base Class implementation (does nothing)
	var ES5Class = function(){};

	ES5Class.mixin = function(prototype, _super, prop){
		var name, origDescriptor, descProp, superDescriptor;

		if(arguments.length < 3){
			prop = _super;
			_super = prototype;
		}

		// Copy the properties over onto the new prototype
		for (name in prop) {
			origDescriptor = Object.getOwnPropertyDescriptor(prop, name);
			if(!origDescriptor){continue;}

			superDescriptor = (name in _super && rb.getPropertyDescriptor(_super, name));

			for(descProp in origDescriptor){
				// Check if we're overwriting an existing function...
				if(superDescriptor && typeof origDescriptor[descProp] == "function" && typeof superDescriptor[descProp] == "function"){

					//...and using super keyword
					if(fnTest.test(origDescriptor[descProp])){
						/* jshint loopfunc: true */
						origDescriptor[descProp] = (function(_superFn, fn){
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
							})(superDescriptor[descProp], origDescriptor[descProp]);
					}

					//always allow NFE call for frequently called methods without this._super, but functionName._super
					//see http://techblog.netflix.com/2014/05/improving-performance-of-our-javascript.html
					origDescriptor[descProp]._supbase = superDescriptor[descProp];
				}
			}

			Object.defineProperty(prototype, name, origDescriptor);
		}
	};

	// Create a new Class that inherits from this class
	ES5Class.extend = function(prop) {
		var _super = this.prototype;
		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		var prototype = Object.create(_super);

		ES5Class.mixin(prototype, _super, prop);

		// The dummy class constructor
		function Class() {
			// All construction is actually done in the init method
			if(('init' in this)){
				this.init.apply(this, arguments);
			}
		}

		// Populate our constructed prototype object
		Class.prototype = prototype;

		// Enforce the constructor to be what we expect
		Class.prototype.constructor = Class;

		// And make this class extendable
		Class.extend = this.extend || ES5Class.extend;

		return Class;
	};
	rb.Class = ES5Class;
})();

(function(window, document, life, undefined){
	'use strict';

	var rb = window.rb;
	var $ = rb.$;
	var widgetExpando = life.widgetExpando;
	var regData = /^data-/;
	var regName = /\{name}/g;

	life.getWidget = function(element, key, args){
		var ret, moduleId;
		var widget = element && element[widgetExpando];

		if(!widget){

			if(rb.widgets[key]){
				moduleId = key;
				key = false;
			} else {
				moduleId = (element.getAttribute( 'data-module' ) || '').split('/');

				if(!moduleId.length){
					moduleId = (element.localeName || '').split('-');
				}

				moduleId = moduleId[ moduleId.length - 1 ];
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


	life.Widget = rb.Class.extend({
		/**
		 * Component Base Class - all UI components should extend this class.
		 * This Class adds some neat stuff to parse/change options, bind and trigger events as also handles the components life cycle (init, attached, detached).
		 * @class
		 * @exports rb#Widget
		 */
		init: function(element){
			this.element = element;
			this.$element = $(element);
			this.options = {};

			this.parseOptions(this.options, this.constructor.defaults);

			if(this.options.name){
				this.name = this.options.name;
			}

			this._evtName = this.name + 'changed';
			this._beforeEvtName = this.name + 'change';

			element[widgetExpando] = this;

			this._setupLifeOptions();

			this.setOption('debug', this.options.debug == null ? rb.isDebug : this.options.debug);
			this._setupEventsByEvtObj();
		},

		/**
		 * defaults Object, represent the default options of the component.
		 * While an option can be of any type, it is recommended to only use immutable values as defaults.
		 */
		defaults: {},

		/**
		 * returns the widget instance of an element or sets/gets/invokes a property of another widget instance
		 * @param {object} element - DOM element
		 * œparam {string} [name] - property name or method name of the component instance
		 * @param {string} [value] - value or in case of a method arguments {array}
		 */
		widget: life.getWidget,

		_setupEventsByEvtObj: function(){
			var evt, namedStr, evtName, selector;
			var evts = this.constructor.events;
			var that = this;

			for(evt in evts){
				namedStr = evt.replace(regName, that.name);
				selector = namedStr.split(' ');
				evtName = namedStr.shift();

				/* jshint loopfunc: true */
				(function(evtName, selector, method){
					var args = [evtName];

					if(selector){
						args.push(selector);
					}

					args.push((typeof method == 'string') ? function(e){
						return that[method].apply(that, arguments);
					} :
					function(){
						return method.apply(that, arguments);
					});

					if(args.length == 2 && selector.startsWith('elemresize')){
						that.$element.elementResize('add', args[1], {
							noWidth: selector.endsWith('height'),
							noHeight: selector.endsWith('width'),
						});
					} else {
						that.$element.on.apply(that.$element, args);
					}

				})(evtName, selector.join(' '), evts[evt]);
			}
		},

		_setupLifeOptions: function(){
			var runner, styles;
			var old = {};
			var that = this;

			if (this.options.watchCss) {
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
			var id;
			if(!element){
				element = this.element;
			}

			if (!(id = element.id)) {
				id = 'rbjsid-' + rb.getID();
				element.id = id;
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

		setFocus: rb.setFocus,

		setWidgetFocus: function(element){
			this._activeElement = document.activeElement;
			var focusElement;

			if(element && element !== true){
				if(element.nodeType == 1){
					focusElement = element;
				} else if(typeof element == 'string'){
					focusElement = rb.elementFromStr(element, this.element)[0];
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
			if(!checkInside || this.element == document.activeElement || this.element.contains(document.activeElement)){
				this.setFocus(activeElem);
			}
		},

		parseOptions: function(opts, defaults){
			var options = Object.assign(opts || {}, defaults, this.parseCSSOptions(), this.parseHTMLOptions());
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
			} else if(name == 'name'){
				rb.log('don\'t change name after init.');
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

	life.Widget.extend = function(name, prop, noCheck){
		var Class = rb.Class.extend.call(this, prop);

		if(prop.statics){
			Object.assign(Class, prop.statics);
			Class.prototype.statics = null;
		}

		life.register(name, Class, noCheck);
		return Class;
	};

	life.Widget.mixin = function(Class, prop){
		if(prop.defaults){
			Class.defaults = Object.assign(Class.defaults || {}, prop.defaults);
		}
		if(prop.statics){
			Object.assign(Class, prop.statics);
		}
		if(prop.events){
			Class.events = Object.assign(Class.events || {}, prop.events);
			prop.events = null;
		}
		rb.Class.mixin(Class.prototype, prop);

		return Class;
	};

	rb.Widget = life.Widget;
	rb.Component = rb.Widget;
})(window, document, rb.life);

(function (window, document, undefined) {
	'use strict';
	var rb = window.rb;
	var $ = rb.$;

	var Button = rb.Widget.extend('button', {
		defaults: {
			target: '',
			type: 'toggle',
		},

		init: function(element) {

			this._super(element);

			this._setTarget = rb.rAF(this._setTarget);
		},

		events: {
			click: '_onClick',
		},

		_onClick: function(){
			var target = this.getTarget() || {};
			var widget = this.widget(target);

			if (!widget) {
				return;
			}

			if(widget[this.options.type]){
				widget.activeButtonWidget = this;
				widget[this.options.type]();
			}
		},

		_setTarget: function(){
			var id = this.getId(this.target);
			this.isTargeting = false;
			this.element.removeAttribute('data-target');
			this.$element.attr({
				'aria-controls': id
			});
			this.targetAttr = id;
		},

		setTarget: function(dom) {
			this.target = dom;
			this.isTargeting = true;
			this._setTarget();
		},

		getTarget: function() {
			var target = this.$element.attr('data-target') || this.$element.attr('aria-controls') || '';

			if (!this.target || (!this.isTargeting && target != this.targetAttr)) {
				this.targetAttr = target;
				this.target = rb.elementFromStr(target, this.element)[0];
			}

			return this.target;
		},
	}, true);

})(window, document);

