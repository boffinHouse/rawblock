if(!window.rb){
	window.rb = {};
}

if(!window.rb.$){
	window.rb.$ = window.jQuery || window.dom;
}

(function(docElem){
	'use strict';
	docElem.classList.remove('no-js');
	docElem.classList.add('js');
})(document.documentElement);

/*! focus-within polyfill */
(function(window, document){
	'use strict';

	var requestAnimationFrame = window.requestAnimationFrame || setTimeout;
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
			requestAnimationFrame(updateFocus);
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
	var isKeyboardBlocked = false;
	var root = document.documentElement;
	var dom = rb.$;

	var unblockKeyboardFocus = function(){
		isKeyboardBlocked = false;
	};
	var blockKeyboadFocus = function(){
		isKeyboardBlocked = true;
		clearTimeout(keyboardBlocktimer);
		keyboardBlocktimer = setTimeout(unblockKeyboardFocus, 66);
	};
	var removeKeyBoadFocus = function(){
		root.classList.remove('is-keyboardfocus');
		blockKeyboadFocus();
	};
	var setKeyboardFocus = function(){
		if(!isKeyboardBlocked){
			root.classList.add('is-keyboardfocus');
		}
	};
	var pointerEvents = (window.PointerEvent) ?
			['pointerdown', 'pointerup'] :
			['mousedown', 'mouseup', 'touchstart', 'touchend']
		;

	root.addEventListener('focus', setKeyboardFocus, true);

	pointerEvents.forEach(function(eventName){
		document.addEventListener(eventName, removeKeyBoadFocus, true);
	});

	document.addEventListener('click', blockKeyboadFocus, true);

	window.addEventListener('focus', blockKeyboadFocus);
	document.addEventListener('focus', blockKeyboadFocus);

	if(dom){
		dom(document).on('rbscriptfocus', blockKeyboadFocus);
	}

})(window, document);

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

		if(!scrollingElement){
			bH = document.body.scrollHeight;
			dH = document.documentElement.scrollHeight;
			isCompat = document.compatMode == 'BackCompat';
			scrollingElement = (dH <= bH || isCompat) ?
				document.body :
				document.documentElement;

			if(scrollingElement && (dH != bH || isCompat)){
				document.scrollingElement = scrollingElement;
			}
		}

		return scrollingElement;
	};

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
						src: 'javascript:false',
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

	rb.rAF = function(fn, thisArg, inProgress){
		var running, args, that;
		var run = function(){
			running = false;
			fn.apply(that, args);
		};
		var rafedFn = function(){
			args = arguments;
			that = thisArg || this || window;
			if(!running){
				running = true;
				rb.rAFQueue.add(run, inProgress);
			}
		};

		if(typeof thisArg == 'boolean'){
			inProgress = thisArg;
			thisArg = false;
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
	var regStartQuote = /^"*'*"*/;
	var regEndQuote = /"*'*"*$/;
	var regEscapedQuote = /\\"/g;
	rb.removeLeadingQuotes = function(str){
		return (str || '').replace(regStartQuote, '').replace(regEndQuote, '').replace(regEscapedQuote, '"');
	};

	rb.parsePseudo = function(element, pseudo){
		var ret;
		var value = typeof element != 'object' ?
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
	var head = document.getElementsByTagName('head')[0];
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


