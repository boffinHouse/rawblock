if(!window.rb){
	/**
	 * rawblock main object holds classes and util properties and methods to work with rawblock
	 * @namespace rb
	 */
	window.rb = {};
}

(function(window, document, undefined){
	'use strict';

	/* Begin: global vars end */
	var rb = window.rb;

	/**
	 * The jQuery plugin namespace.
	 * @external "jQuery.fn"
	 * @see {@link http://learn.jquery.com/plugins/|jQuery Plugins}
	 */

	/**
	 * Reference to the internally used DOM or jQuery instance
	 * @memberof rb
	 */
	rb.$ = rb.$ || window.jQuery || window.dom;


	var $ = rb.$;
	var regSplit = /\s*?,\s*?|\s+?/g;

	/**
	 * Reference to the root element (mostly html element)
	 * @memberof rb
	 * @type {Element}
	 */
	rb.root = document.documentElement;

	/**
	 * Reference to the jQueryfied root element
	 * @memberof rb
	 * @type {jQueryfiedDOMList}
	 */
	rb.$root = $(rb.root);

	/**
	 * Reference to the jQueryfied window object
	 * @memberof rb
	 * @type {jQueryfiedDOMList}
	 */
	rb.$win = $(window);

	/**
	 * Reference to the jQueryfied document object
	 * @memberof rb
	 * @type {jQueryfiedDOMList}
	 */
	rb.$doc = $(document);

	/* End: global vars end */

	/* Begin: rbSlideUp / rbSlideDown */

	/**
	 * A jQuery plugin to slideUp content. Difference to $.fn.slideUp: The plugin handles content hiding via height 0; visibility: hidden;
	 * Also does not animate padding, margin, borders (use child elements)
	 * @function external:"jQuery.fn".rbSlideUp
	 * @param options {object} All jQuery animate options
	 * @returns {jQueryfiedDOMList}
	 */
	$.fn.rbSlideUp = function(options){
		if(!options){
			options = {};
		}

		if(this.length){
			var opts = Object.assign({}, options, {
				always: function(){
					this.style.display = '';
					this.style.visibility = 'hidden';

					if(options.always){
						return options.always.apply(this, arguments);
					}
				}
			});

			if(opts.easing){
				rb.addEasing(opts.easing);
			}
			this
				.stop()
				.css({overflow: 'hidden', display: 'block', visibility: 'inherit'})
				.animate({height: 0}, opts)
			;
		}
		return this;
	};

	/**
	 * A jQuery plugin to slideDown content. Difference to $.fn.slideDown: The plugin handles content showing also using visibility: 'inherit'
	 * Also does not animate padding, margin, borders (use child elements)
	 * @function external:"jQuery.fn".rbSlideDown
	 * @param options {object} All jQuery animate options
	 * @returns {jQueryfiedDOMList}
	 */
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

	/* End: rbSlideUp / rbSlideDown */


	/* Begin: getScrollingElement/scrollIntoView */

	/**
	 * @memberof rb
	 * @returns {Element} The DOM element that scrolls the viewport (either html or body)
	 */
	rb.getScrollingElement = function(){
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

	/**
	 * A jQuery plugin to scroll an element into the viewort
	 * @function external:"jQuery.fn".scrollIntoView
	 * @param options {object} All jQuery animate options and additional options
	 * @param options.focus {Element} Element that should be focused after animation is done.
	 * @param options.hash {String} Hash to set on the location object
	 *
	 * @returns {jQueryfiedDOMList}
	 */
	$.fn.scrollIntoView = function(options){
		var bbox, distance, scrollingElement, opts;
		var elem = this.get(0);

		if(elem){
			options = options || {};
			bbox = elem.getBoundingClientRect();
			distance = Math.max(Math.abs(bbox.top), Math.abs(bbox.left));
			scrollingElement = rb.getScrollingElement();

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
	/* End: getScrollingElement/scrollIntoView */

	/* Begin: contains */

	/**
	 * Tests whether an element is inside or equal to a list of elements.
	 * @memberof rb
	 * @param containerElements {Element[]} Array of elements that might contain innerElement.
	 * @param innerElement {Element} An element that might be inside of one of containerElements.
	 * @returns {Element|undefined} The first element in containerElements, that contains innerElement or is the innerElement.
	 */
	rb.contains = function(containerElements, innerElement){
		return containerElements.find(rb.contains._contains, innerElement);
	};
	rb.contains._contains = function(element){
		return element == this || element.contains(this);
	};
	/* End: contains */

	/* Begin: throttle */
	/**
	 * Throttles a given function
	 * @memberof rb
	 * @param {function} fn - The function to be throttled.
	 * @param {object} [options] - options for the throttle.
	 *  @param {object} options.that=null -  the context in which fn should be called.
	 *  @param {boolean} options.write=false -  wether fn is used to write layout.
	 *  @param {boolean} options.read=false -  wether fn is used to read layout.
	 *  @param {number} options.delay=200 -  the throttle delay.
	 *  @param {boolean} options.unthrottle=false -  Wether function should be invoked directly.
	 * @returns {function} the throttled function.
	 */
	rb.throttle = function(fn, options){
		var running, that, args;
		var lastTime = 0;
		var Date = window.Date;
		var _run = function(){
			running = false;
			lastTime = Date.now();
			fn.apply(that, args);
		};
		var afterAF = function(){
			setTimeout(_run);
		};
		var getAF = function(){
			rb.rAFQueue(afterAF);
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

			that = options.that || this;
			args = arguments;

			if(options.unthrottle){
				_run();
			} else {
				if(delay && !options.simple){
					delay -= (Date.now() - lastTime);
				}
				if(delay < 0){
					delay = 0;
				}
				setTimeout(getAF, delay);
			}

		};
	};
	/* End: throttle */

	/* Begin: resize */
	var iWidth, cHeight, installed;
	var docElem = rb.root;

	/**
	 *
	 * Resize uitility object to listen/unlisten (on/off) for throttled window.resize events (also see jQuery.fn.elementResize).
	 * @memberof rb
	 * @extends jQuery.Callbacks
	 * @property {object} resize
	 * @property {Function} resize.on Adds the passed function to listen to the global window.resize
	 * @property {Function} resize.off Removes the passed function to unlisten from the global window.resize
	 */
	rb.resize = Object.assign(rb.$.Callbacks(),
		{
			_setup: function(){
				if(!installed){
					installed = true;
					setTimeout(function(){
						iWidth = innerWidth;
						cHeight = docElem.clientHeight;
					});
					window.removeEventListener('resize', this._run);
					window.addEventListener('resize', this._run);
				}
			},
			_teardown: function(){
				if(installed && !this.has()){
					installed = false;
					window.removeEventListener('resize', this._run);
				}
			},
			on: function(fn){
				this.add(fn);
				this._setup();
			},
			off: function(fn){
				this.remove(fn);
				this._teardown();
			},
		}
	);

	rb.resize._run = rb.throttle(function(){
		if(iWidth != innerWidth || cHeight != docElem.clientHeight){
			iWidth = innerWidth;
			cHeight = docElem.clientHeight;

			this.fire();
		}
	}, {that: rb.resize});

	/* End: resize */

	/* Begin: getCSSNumbers */
	/**
	 * Sums up all style values of an element
	 * @memberof rb
	 * @param element {Element}
	 * @param styles {String[]} The names of the style properties (i.e. paddingTop, marginTop)
	 * @param onlyPositive {Boolean} Whether only positive numbers should be considered
	 * @returns {number} Total of all style values
	 * @example
	 * var innerWidth = rb.getCSSNumbers(domElement, ['paddingLeft', 'paddingRight', 'width'];
	 */
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
	/* End: getCSSNumbers */

	/* Begin: camelCase */

	rb.camelCase = (function() {
		var reg = /-([\da-z])/gi;
		var camelCase = function(all, found) {
			return found.toUpperCase();
		};

		/**
		 * camel cases a String
		 * @alias rb#camelCase
		 * @param str {String} String to camelcase
		 * @returns {String} the camel cased string
		 */
		var retCamel = function(str) {
			return str.replace(reg, camelCase);
		};

		return retCamel;
	})();

	/* End: camelCase */

	/* Begin: parseValue */
	rb.parseValue = (function() {
		var regNumber = /^\-{0,1}\+{0,1}\d+?\.{0,1}\d*?$/;
		var regObj = /^\[.*?]|\{.*?}$/;

		/**
		 * Parses a String into another type using JSON.parse, if this fails returns the given string
		 * @alias rb#parseValue
		 * @param {String} attrVal The string to be parsed
		 * @returns {String} The parsed string.
		 */
		var parseValue = function( attrVal ) {

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
				attrVal = rb.jsonParse(attrVal);
			}
			return attrVal;
		};
		return parseValue;
	})();
	/* End: parseValue */

	/* Begin: rAF helpers */

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

		/**
		 * Invokes a function inside a rAF call
		 * @memberof rb
		 * @alias rb#rAFQueue
		 * @param fn {Function} the function that should be invoked
		 * @param inProgress {boolean} Whether the fn should be added to an ongoing rAF or should be appended to the next rAF.
		 */
		return function(fn, inProgress){

			if(inProgress && isInProgress){
				inProgressStack.push(fn);
			} else {
				curFns.push(fn);
				if(curFns.length == 1){
					requestAnimationFrame(run);
				}
			}
		};
	})();

	/**
	 * Generates and returns a new, rAFed version of the passed function, so that the passed function is always called using requestAnimationFrame
	 * @memberof rb
	 * @param fn {Function} The function to be rAFed
	 * @param options {Object} Options object
	 * @param options.that=null {Object} The context in which the function should be invoked. If nothing is passed the context of the wrapper function is used.
	 * @param options.queue=false {Object} Whether the fn should be added to an ongoing rAF (i.e.: `false`) or should be queued to the next rAF (i.e.: `true`).
	 * @param options.throttle=false {boolean} Whether multiple calls in one frame cycle should be throtteled to one.
	 * @returns {Function}
	 */
	rb.rAF = function(fn, options){
		var running, args, that, inProgress;
		var batchStack = [];
		var run = function(){
			running = false;
			if(!options.throttle){
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
			if(!options.throttle){
				batchStack.push([that, args]);
			}
			if(!running){
				running = true;
				rb.rAFQueue(run, inProgress);
			}
		};

		if(!options){
			options = {};
		}

		inProgress = !options.queue;

		if(fn._rbUnrafedFn){
			rb.log('double rafed', fn);
		}

		rafedFn._rbUnrafedFn = fn;

		return rafedFn;
	};

	/* End: rAF helpers */

	/* Begin: rbComponent */

	/**
	 * A jQuery plugin that returns a component instance by using rb.life.getComponent. Or invokes a methods or sets/gets a property
	 * @function external:"jQuery.fn".rbComponent
	 * @see rb.life.getComponent
	 * @param [name] {String} The name of the property or method.
	 * @param [args] {*} The value of the property name to set or an array of arguments in case of a method.
	 *
	 * @returns {ComponentInstance|jQueryfiedDOMList|*}
	 */
	$.fn.rbComponent = function(name, args){
		var ret;
		this.each(function(){
			if(ret === undefined){
				ret = rb.life.getComponent(this, name, args);
			}
		});

		return ret === undefined ?
			this :
			ret
			;
	};
	/* End: rbComponent */

	/* Begin: addEasing */
	var isExtended;
	var copyEasing = function(easing, name){
		var easObj = BezierEasing.css[easing];
		$.easing[easing] = easObj.get;

		if(name && !$.easing[easing]){
			$.easing[name] = $.easing[easing];
		}
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

	/**
	 * Generates an easing function from a CSS easing value and adds it to the rb.$.easing object.
	 * @memberof rb
	 * @param {String} easing The easing value. Expects a string with 4 numbers separated by a "," describing a cubic bezier curve.
	 * @param {String} [name] Human readable name of the easing.
	 * @returns {Function} Easing a function
	 */
	rb.addEasing = function(easing, name){
		var bezierArgs;
		if(typeof easing != 'string'){return;}
		if(window.BezierEasing && !$.easing[easing] && !BezierEasing.css[easing] && (bezierArgs = easing.match(/([0-9\.]+)/g)) && bezierArgs.length == 4){
			extendEasing();
			bezierArgs = bezierArgs.map(function(str){
				return parseFloat(str);
			});
			BezierEasing.css[easing] = BezierEasing.apply(this, bezierArgs);
			copyEasing(easing, name);
		}
		if(!$.easing[easing]) {
			if(window.BezierEasing && BezierEasing.css[easing]){
				copyEasing(easing, name);
			} else {
				$.easing[easing] =  $.easing.ease || $.easing.swing;
			}
		}
		return $.easing[easing];
	};
	extendEasing();
	setTimeout(extendEasing);
	/* End: addEasing */

	/* Begin: ID/Symbol */
	/**
	 * Returns a Symbol or unique String
	 * @memberof rb
	 * @param {String} description ID or description of the symbol
	 * @type {Function}
	 * @returns {String|Symbol}
	 */
	rb.Symbol = window.Symbol;
	var id = Math.round(Date.now() * Math.random());

	/**
	 * Returns a unique id based on Math.random and Date.now().
	 * @memberof rb
	 * @returns {string}
	 */
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

	/* End: ID/Symbol */

	/* Begin: elementResize */
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
		remove: function(element, fn){
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

			var runFire = function(){

				if(heightChange){
					element[elementResize.expando].heightCbs.fire(data);
				}
				if(widthChange){
					element[elementResize.expando].widthCbs.fire(data);
				}

				data.cbs.fire(data);

				heightChange = false;
				widthChange = false;
			};

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
					addEvents();
				}
				block = false;
			};

			var write = rb.rAF(function(){
				expandChild.style.width = data.exChildWidth;
				expandChild.style.height = data.exChildHeight;
				setTimeout(scrollWrite, 20);
			}, {throttle: true});

			var read = function(){
				data.exChildWidth = expandElem.offsetWidth + 9 + 'px';
				data.exChildHeight = expandElem.offsetHeight + 9 + 'px';

				data.exScrollLeft = expandElem.scrollWidth;
				data.exScrollTop = expandElem.scrollHeight;

				data.shrinkScrollLeft = shrinkElem.scrollWidth;
				data.shrinkScrollTop = shrinkElem.scrollHeight;

				write();
			};
			var onScroll = rb.throttle(function(){
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
					block = widthChange && heightChange;
					read();
				}

			});

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
		}),
	};

	/**
	 * A jQuery plugin that invokes a callback as soon as the dimension of an element changes
	 * @function external:"jQuery.fn".elementResize
	 * @param action {String} "add" or "remove". Whether the function should be added or removed
	 * @param fn {Function} The resize listener function that should be added or removed.
	 * @param [options] {Object}
	 * @param [options.noWidth=false] {Boolean} Only height changes to this element should fire the callback function.
	 * @param [options.noHeight=false] {Boolean} Only width changes to this element should fire the callback function.
	 * @returns {jQueryfiedObject}
	 */
	$.fn.elementResize = function(action, fn, options){
		if(action != 'remove'){
			action = 'add';
		}
		return this.each(function(){
			elementResize[action](this, fn, options);
		});
	};
	/* End: elementResize */

	/**
	 * Invokes on the first element in collection the closest method and on the result the querySelector method.
	 * @function external:"jQuery.fn".closestFind
	 * @param {String} selectors Two selectors separated by a white space and/or comma. First is used for closest and second for querySelector. Example: `".rb-item, .item-input"`.
	 * @returns {jQueryfiedObject}
	 */
	$.fn.closestFind = function(selectors){
		var sels;
		var closestSel, findSel;
		var elem = this.get(0);
		if(elem){
			sels = selectors.split(regSplit);
			closestSel = sels.shift();
			findSel = sels.join(' ');
			elem = elem.closest(closestSel);
			if(elem){
				elem = elem.querySelector(findSel);
			}
		}
		return $(elem || []);
	};

	/* Begin: is-teaser delegate */
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
				event = new MouseEvent('click', {cancelable: true, bubbles: true, shiftKey: e.shiftKey, altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey});
				link.dispatchEvent(event);
			} else if(link.click) {
				link.click();
			}
		}
	});
	/* End: is-teaser delegate */

	/**
	 * Sets focus to an element. Note element has to be focusable
	 * @memberof rb
	 * @type function
	 * @param element The element that needs to get focus.
	 * @param [delay] {Number} The delay to focus the element.
	 */
	rb.setFocus = rb.rAF(function(element, delay){
		try {
			if(element.tabIndex < 0 && !element.getAttribute('tabindex')){
				element.setAttribute('tabindex', -1);
			}
			setTimeout(function(){
				element.focus();
				rb.$doc.trigger('rbscriptfocus');
			}, delay || 4);
		} catch(e){}
	}, {queue: true, throttle: true});

	/* Begin: focus-within polyfill */
	var running = false;
	var isClass = 'is-focus-within';
	var isClassSelector = '.' + isClass;

	var updateFocus = function(){
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
	};

	var update = function(){
		if(!running){
			running = true;
			rb.rAFQueue(updateFocus, true);
		}
	};

	document.addEventListener('focus', update, true);
	document.addEventListener('blur', update, true);
	update();
	/* End: focus-within polyfill */


	/* * * Begin: keyboard-focus * * */
	var keyboardBlocktimer, keyboardFocusElem;
	var hasKeyboardFocus = false;
	var isKeyboardBlocked = false;
	var root = rb.root;

	var unblockKeyboardFocus = function(){
		isKeyboardBlocked = false;
	};

	var blockKeyboardFocus = function(){
		isKeyboardBlocked = true;
		clearTimeout(keyboardBlocktimer);
		keyboardBlocktimer = setTimeout(unblockKeyboardFocus, 99);
	};

	var _removeChildFocus = function(){
		if(keyboardFocusElem && keyboardFocusElem != document.activeElement){
			keyboardFocusElem.classList.remove('is-keyboardfocus');
			keyboardFocusElem = null;
		}
	};

	var removeChildFocus = function(){
		if(keyboardFocusElem){
			rb.rAFQueue(_removeChildFocus);
		}
	};

	var _removeKeyBoardFocus = rb.rAF(function(){
		hasKeyboardFocus = false;
		_removeChildFocus();
		root.classList.remove('is-keyboardfocus-within');
	}, {throttle: true});

	var removeKeyBoardFocus = function(){
		if(hasKeyboardFocus){
			_removeKeyBoardFocus();
		}
		blockKeyboardFocus();
	};

	var setKeyboardFocus = rb.rAF(function(){

		if(!isKeyboardBlocked || hasKeyboardFocus){

			if(keyboardFocusElem != document.activeElement){
				_removeChildFocus();
				keyboardFocusElem = document.activeElement;

				if(keyboardFocusElem){
					keyboardFocusElem.classList.add('is-keyboardfocus');
				}
			}

			if(!hasKeyboardFocus){
				root.classList.add('is-keyboardfocus-within');
			}
			hasKeyboardFocus = true;
		}
	}, {throttle: true});

	var pointerEvents = (window.PointerEvent) ?
			['pointerdown', 'pointerup'] :
			['mousedown', 'mouseup', 'touchstart', 'touchend']
		;

	root.addEventListener('blur', removeChildFocus, true);
	root.addEventListener('focus', setKeyboardFocus, true);

	pointerEvents.forEach(function(eventName){
		document.addEventListener(eventName, removeKeyBoardFocus, true);
	});

	document.addEventListener('click', blockKeyboardFocus, true);

	window.addEventListener('focus', blockKeyboardFocus);
	document.addEventListener('focus', blockKeyboardFocus);

	rb.$doc.on('rbscriptfocus', blockKeyboardFocus);
	/* End: keyboard-focus */

	var console = window.console || {};
	var log = console.log && console.log.bind ? console.log : rb.$.noop;

	/**
	 * Adds a log method and a isDebug property to an object, which can be muted by setting isDebug to false.
	 * @memberof rb
	 * @param obj    {Object}
	 * @param [initial] {Boolean}
	 */
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
		var applyBehavior = function(clickElem, e){
			var i, len, attr, found;
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
		};
		setup = rb.$;
		document.addEventListener('keydown', function(e){
			var elem = e.target;
			if(e.keyCode == 40 && elem.classList.contains('js-click') && (elem.getAttribute('aria-haspopup') || elem.getAttribute('data-module'))){
				applyBehavior(elem, e);
			}
		}, true);
		document.addEventListener('click', function(e){
			var clickElem = e.target.closest('.js-click');
			while(clickElem){
				applyBehavior(clickElem, e);

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

	/**
	 * Allows to add fast click listeners. For elements with the class `js-click` and a data-{name} attribute.
	 * @property rb.click.add {Function} add the given name and the function as a delegated click handler.
	 * @memberof rb
	 */
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

	var regNum = /:(\d)+\s*$/;
	var regTarget = /^\s*?\.?([a-z0-9_]+)\((.*?)\)\s*?/i;

	/**
	 * Returns an array of elements based on a string.
	 * @memberof rb
	 * @param targetStr {String} Either a whitespace separated list of ids or q jQuery traversal method. ("foo-1 bar-2", "next(.input)")
	 * @param element {Element} The element that should be used as starting point for the jQuery traversal method.
	 * @returns {Element[]}
	 */
	rb.elementFromStr = function(targetStr, element){
		var i, len, target, temp, num, match;

		if (targetStr){
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
			} else {
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
	var componentExpando = rb.Symbol('_rbComponent');
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
					if(this[life.componentExpando]){
						return this[life.componentExpando][action]();
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
			life.getComponent(elem);
			rb.rAFQueue(function(){
				elem.classList.remove('js-click');
			}, true);
			lifeBatch.run();
		});
	};

	var initWatchCss = function(){
		initWatchCss = $.noop;
		var elements = document.getElementsByClassName(attachedClass);

		rb.resize.on(function(){
			var i, elem, component;
			var len = elements.length;
			for(i = 0; i < len; i++){
				elem = elements[i];
				component = elem && elem[componentExpando];

				if(component && component.parseOptions && component._afterStyle && component._afterStyle.content != component._styleOptsStr){
					component.parseOptions();
				}
			}
		});
	};

	var initObserver = function() {
		var removeComponents = (function(){
			var runs, timer;
			var i = 0;
			var main = function() {
				var len, instance, element;
				var start = Date.now();
				for(len = life._attached.length; i < len && Date.now() - start < 6; i++){
					element = life._attached[i];

					if( element && (instance = element[componentExpando]) && !docElem.contains(element) ){
						element.classList.add( initClass );
						life.destroyComponent(instance, i);

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
					removeComponents();
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
	life.componentExpando = componentExpando;

	life._failed = {};
	rb.components = {};
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

		initWatchCss();
	};

	/**
	 * Registers a class with a name. An instance of this class will be constructed with the element as the first argument. If the Class has a attached or detached method these methods also will be invoked, if the element is removed or added to the DOM. In most cases the given class inherits from `rb.Component`.
	 * @memberof rb
	 * @param {String} name The name of your component.
	 * @param Class {Class} The Component class for your component.
	 *
	 * @example
	 * class MyButton {
	 *      constructor(element){
	 *
	 *      }
	 * }
	 *
	 * //<button class="js-rb-life" data-module="my-button"></button>
	 * rb.life.register('my-button', MyButton);
	 *
	 * @example
	 * class Time {
	 *      constructor(element){
	 *          this.element = element;
	 *      }
	 *
	 *      attached(){
	 *          this.timer = setInterval(() = > {
	 *              this.element.innerHTML = new Date().toLocaleString();
	 *          }, 1000);
	 *      }
	 *
	 *      detached(){
	 *          clearInterval(this.timer);
	 *      }
	 * }
	 *
	 * //<span class="js-rb-life" data-module="time"></span>
	 * rb.life.register('time', Time);
	 *
	 */
	life.register = function(name, Class, _noCheck) {
		var proto = Class.prototype;
		var superProto = Object.getPrototypeOf(proto);
		var superClass = superProto.constructor;

		if(proto instanceof rb.Component){
			extendStatics(Class, proto, superClass, 'defaults');
			extendStatics(Class, proto, superClass, 'events');

			if(!proto.hasOwnProperty('name')){
				proto.name = name;
			}
		}

		if(rb.components[ name ]){
			rb.log(name +' already exists.');
		}

		rb.components[ name ] = Class;

		if(name.charAt(0) == '_'){return;}

		if ( !_noCheck ) {
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
				registerElement(name, Class);
			}
		});
	};

	life.create = function(element, LifeClass, _fromWebComponent) {
		var instance;

		if ( !(instance = element[componentExpando]) ) {
			instance = new LifeClass( element );
			element[componentExpando] = instance;
		}

		rb.rAFQueue(function(){
			element.classList.add( attachedClass );
		}, true);

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
		var removeInitClass = rb.rAF(function(){
			while (removeElements.length) {
				removeElements.shift().classList.remove(initClass);
			}
		});

		var findElements = rb.throttle(function() {

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

				if ( rb.components[ moduleId ] ) {
					life.create( module, rb.components[ moduleId ] );
					removeElements.push( module );
				}
				else if ( life._failed[ moduleId ] ) {
					removeElements.push( module );
				}
				else if ( modulePath && rb.loadPackage ) {
					/* jshint loopfunc: true */
					(function (module, modulePath, moduleId) {
						rb.loadPackage(modulePath).then(function () {
							if (!rb.components[ moduleId ]) {
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
		}, {delay: 50});

		return findElements;
	})();

	life.destroyComponent = function(instance, index){
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

					//always allow NFE call for frequently called methods without this._super, but functionName._supbase
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
	var componentExpando = life.componentExpando;
	var regData = /^data-/;
	var regName = /\{name}/g;

	var _setupEventsByEvtObj = function(that){
		var evt, namedStr, evtName, selector;
		var evts = that.constructor.events;

		for(evt in evts){
			namedStr = evt.replace(regName, that.name);
			selector = namedStr.split(' ');
			evtName = selector.shift();

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

				if(args.length == 2 && evtName.startsWith('elemresize')){
					that.$element.elementResize('add', args[1], {
						noWidth: evtName.endsWith('height'),
						noHeight: evtName.endsWith('width'),
					});
				} else {
					that.$element.on.apply(that.$element, args);
				}

			})(evtName, selector.join(' '), evts[evt]);
		}
	};

	/**
	 * returns the component instance of an element
	 * @memberof rb
	 * @param {Element} element - DOM element
	 * @param {String} [moduleId] - optional name of the component
	 * @returns {Object} A component instance
	 */
	life.getComponent = function(element, moduleId){
		var component = element && element[componentExpando];

		if(!component){

			if(!rb.components[moduleId]){
				moduleId = (element.getAttribute( 'data-module' ) || '').split('/');

				if(!moduleId.length){
					moduleId = (element.localeName || '').split('-');
				}

				moduleId = moduleId[ moduleId.length - 1 ];
			}

			if(rb.components[ moduleId ]){
				component = life.create(element, rb.components[ moduleId ]);
			}
		}
		return component;
	};

	rb.Component = rb.Class.extend(
		/** @lends rb.Component.prototype */
		{

			/**
			 * constructs the class
			 * @classdesc Component Base Class - all UI components should extend this class. This Class adds some neat stuff to parse/change options, bind and trigger events as also handles the components life cycle (init, attached, detached).
			 * @param element
			 * @constructs
			 *
			 * @example
			 * rb.Component.extend('myComponent', {
			 *      defaults: {
			 *          className: 'toggle-class',
			 *      },
			 *      init: function(element){
			 *          this._super(element);
			 *
			 *          this.changeClass = rb.rAF(this.changeClass);
			 *      },
			 *      events: {
			 *          'click .change-btn': 'changeClass',
			 *      },
			 *      changeClass: function(){
			 *          this.$element.toggleClass(this.options.className);
			 *      }
			 * });
			 *
			 * @example
			 * class MyComponent extends rb.Component {
			 *      static get defaults(){
			 *          return {
			 *              className: 'toggle-class',
			 *          }
			 *      }
			 *
			 *      constructor(element){
			 *          super(element);
			 *          this.changeClass = rb.rAF(this.changeClass);
			 *      }
			 *
			 *      static get events(){
			 *          return {
			 *              'click .change-btn': 'changeClass',
			 *          }
			 *      }
			 *
			 *      changeClass(){
			 *          this.$element.toggleClass(this.options.className);
			 *      }
			 * }
			 *
			 * rb.life.register('myComponent', MyComponent);
			 */
			init: function(element){

				this.element = element;
				this.$element = $(element);
				this.options = {};
				this._afterStyle = rb.getStyles(element, '::after');

				element[componentExpando] = this;

				this.parseOptions(this.options);

				if(this.options.name){
					this.name = this.options.name;
				}

				this._evtName = this.name + 'changed';
				this._beforeEvtName = this.name + 'change';


				this.setOption('debug', this.options.debug == null ? rb.isDebug : this.options.debug);

				_setupEventsByEvtObj(this);
			},

			/**
			 * defaults Object, represent the default options of the component.
			 * While a parsed option can be of any type, it is recommended to only use immutable values as defaults.
			 */
			defaults: {},

			/**
			 * Shortcut to rb.getComponent.
			 * @function
			 */
			component: life.getComponent,

			/**
			 * returns id of an element, if no id exist generates one for the element
			 * @param [element] {Element} element, if no element is given. the component element is used.
			 * @returns {String} id
			 */
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

			/**
			 * Dispatches an event on the component element and returns the Event object.
			 * @param [type='changed'] {String|Object} The event.type that should be created. If no type is given the name 'changed' is used. Automatically prefixes the type with the name of the component. If an opbject is passed this will be used as the `event.detail` property.
			 * @param [detail] {Object} The value for the event.detail property to transport event related informations.
			 * @returns {Event}
			 */
			_trigger: function(type, detail){
				var evt;
				if(typeof type == 'object'){
					detail = type;
					type = detail.type;
				}
				if(type == null){
					type = this._evtName;
				} else if(!type.includes(this.name)){
					type = this.name + type;
				}
				evt = $.Event(type, {detail: detail || {}});
				this.$element.trigger(evt);
				return evt;
			},

			/**
			 * Uses `rb.elementFromStr` with this.element as the element argument
			 * @param {String} string
			 * @returns {Element[]}
			 */
			getElementsFromString: function(string){
				return rb.elementFromStr(string, this.element);
			},

			/**
			 * shortcut to rb.setFocus
			 * @borrows rb.setFocus as setFocus
			 */
			setFocus: rb.setFocus,

			/**
			 * Sets the focus and remembers the activeElement before. If setComponentFocus is invoked with no argument. The element with class `js-autofocus` inside of the component element is focused.
			 * @param [element] {Element|Boolean|String} The element that should be focused. In case a string is passed the string is converted to an element using `rb.elementFromStr`
			 * @param [delay] {Number} The delay that should be used to focus an element.
			 */
			setComponentFocus: function(element, delay){
				this._activeElement = document.activeElement;
				var focusElement;

				if(typeof element == 'number'){
					delay = element;
					element = null;
				}

				if(element && element !== true){
					if(element.nodeType == 1){
						focusElement = element;
					} else if(typeof element == 'string'){
						focusElement = rb.elementFromStr(element, this.element)[0];
					}
				} else {
					focusElement = this.element.querySelector('.js-autofocus');
				}

				if(!focusElement && (element === true || this.element.classList.contains('js-autofocus'))){
					focusElement = this.element;
				}

				if(focusElement){
					this.setFocus(focusElement, delay);
				}
			},

			/**
			 * Restores the focus to the element, that had focus before `setComponentFocus` was invoked.
			 * @param [checkInside] {Boolean} If checkInside is true, the focus is only restored, if the current activeElement is inside the component itself.
			 */
			restoreFocus: function(checkInside){
				var activeElem = this._activeElement;
				if(!activeElem){return;}

				this._activeElement = null;
				if(!checkInside || this.element == document.activeElement || this.element.contains(document.activeElement)){
					this.setFocus(activeElem);
				}
			},

			/**
			 * Parses the Options from HTML (data-* attributes) and CSS using rb.parsePseudo. This function is automatically invoked by the init.
			 * @param opts
			 */
			parseOptions: function(opts){
				var options = Object.assign(opts || {}, this.constructor.defaults, this.parseCSSOptions(), this.parseHTMLOptions());
				this.setOptions(options);
			},

			/**
			 * Sets mutltiple options at once.
			 * @param opts
			 */
			setOptions: function(opts){
				for(var prop in opts){
					if(opts[prop] !== this.options[prop]){
						this.setOption(prop, opts[prop]);
					}
				}
			},

			/**
			 * sets an option. The function should be extended to react to dynamic option changes after instantiation.
			 * @param name {String} Name of the option.
			 * @param value {*} Value of the option.
			 */
			setOption: function(name, value){
				this.options[name] = value;
				if(name == 'debug' && value){
					this.isDebug = true;
				} else if(name == 'name'){
					rb.log('don\'t change name after init.');
				}
			},

			/**
			 * parses the HTML options (data-*) of a given Element.
			 * @param [element] {Element}
			 * @returns {{}}
			 */
			parseHTMLOptions: function(element){
				element = (element || this.element);
				var i, name;
				var attributes = element.attributes;
				var options = rb.jsonParse(element.getAttribute('data-options')) || {};
				var len = attributes.length;

				for ( i = 0; i < len; i++ ) {
					name = attributes[ i ].nodeName;
					if ( name != 'data-options' && name.startsWith( 'data-' ) ) {
						options[ rb.camelCase( name.replace( regData , '' ) ) ] = rb.parseValue( attributes[ i ].nodeValue );
					}
				}

				return options;
			},

			/**
			 * parses the CSS options (::after pseudo) of a given Element.
			 * @param [element] {Element}
			 * @returns {{}}
			 */
			parseCSSOptions: function(element){
				if(element == this.element){
					element = null;
				}
				var style = (element ? rb.getStyles(element, '::after') : this._afterStyle).content || '';
				if(element || !this._styleOptsStr || style != this._styleOptsStr){
					if(!element){
						this._styleOptsStr = style;
					}
					style = rb.parsePseudo(style);
				}
				return style || false;
			},

			destroy: function(){
				life.destroyComponent(this);
			},

			_super: function(){
				this.log('no _super');
			}
		}
	);

	rb.addLog(rb.Component.prototype, false);

	rb.Component.extend = function(name, prop, noCheck){
		var Class = rb.Class.extend.call(this, prop);

		if(prop.statics){
			Object.assign(Class, prop.statics);
			Class.prototype.statics = null;
		}

		life.register(name, Class, noCheck);
		return Class;
	};

	rb.Component.mixin = function(Class, prop){
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

})(window, document, rb.life);

(function (window, document, undefined) {
	'use strict';
	var rb = window.rb;
	var $ = rb.$;


	rb.Component.extend('button',
		/** @lends rb.components.button.prototype */
		{
			/**
			 * @static
			 * @property {Object} defaults
			 * @property {String} defaults.target="" String that references the target element. Is processed by rb.elementFromStr.
			 * @property {String} defaults.type="toggle" Method name to invoke on target component.
			 * @property {*} defaults.args=null Arguments to be used to invoke target method.
			 */
			defaults: {
				target: '',
				type: 'toggle',
				args: null,
			},
			/**
			 * @constructs
			 * @classdesc Class component to create a button.
			 * @name rb.components.button
			 * @extends rb.Component
			 * @param {Element} element
			 * @example
			 * <button type="button"
			 *  data-module="button"
			 *  class="js-click"
			 *  aria-controls="panel-1"
			 *  data-type="open">
			 *      click me
			 * </button>
			 * <div id="panel-1" data-module="panel"></div>
			 */
			init: function(element) {

				this._super(element);

				this._setTarget = rb.rAF(this._setTarget, {throttle: true});
				this.setOption('args', this.options.args);
			},

			events: {
				click: '_onClick',
			},
			_onClick: function(){
				var args;
				var target = this.getTarget() || {};
				var component = this.component(target);

				if (!component) {
					return;
				}

				if(this.options.type in component){
					args = this.options.args;
					component.activeButtonComponent = this;
					if(typeof component[this.options.type] == 'function'){
						component[this.options.type].apply(component, args);
					} else {
						component[this.options.type] = args;
					}
				}
			},

			setOption: function(name, value){
				var dom;
				this._super(name, value);

				if(name == 'target'){
					dom = rb.elementFromStr(value, this.element)[0];
					if(dom){
						this.setTarget(dom);
					}
				} else if(name == 'args'){
					if(value == null){
						value = [];
					} else if(!Array.isArray(value)){
						value = [value];
					}
					this.options.args = value;
				}
			},
			_setTarget: function(){
				var id = this.getId(this.target);
				this._isTargeting = false;
				this.element.removeAttribute('data-target');
				this.$element.attr({'aria-controls': id});
				this.targetAttr = id;
				this.options.target = id;
			},

			/**
			 * Changes/sets the target element.
			 * @param {Element} element
			 */
			setTarget: function(element) {
				this.target = element;
				this._isTargeting = true;
				this._setTarget();
			},

			/**
			 * Returns the current target component of the button
			 * @returns {Element}
			 */
			getTarget: function() {
				var target = this._isTargeting ?
					this.targetAttr :
					this.element.getAttribute('data-target') || this.$element.attr('aria-controls') || this.options.target;

				if (!this.target || (target != this.targetAttr)) {
					this.targetAttr = target;
					this.target = rb.elementFromStr(target, this.element)[0];
				}

				return this.target;
			},
		},
		true
	);

})(window, document);

