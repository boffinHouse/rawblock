if(!window.rb){
	window.rb = {};
}

if(!window.rb.$){
	window.rb.$ = window.jQuery || window.dom;
}

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
	var dom = rb.$;

	dom.fn.rbSlideUp = function(options){
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

	dom.fn.rbSlideDown = function(options){
		if(!options){
			options = {};
		}

		return this.each(function(){
			var endValue;
			var $panel = dom(this);
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
	var dom = rb.$;

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

	dom.fn.scrollIntoView = function(options){
		var bbox, distance, scrollingElement;
		var elem = this.get(0);

		if(elem){
			options = options || {};
			bbox = elem.getBoundingClientRect();
			distance = Math.max(Math.abs(bbox.top), Math.abs(bbox.left));
			scrollingElement = getScrollingElement();

			dom(scrollingElement).animate(
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
	var requestAnimationFrame = requestAnimationFrame || setTimeout;

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
			requestAnimationFrame(afterAF);
		};

		if(!options){
			options = {};
		}

		if(!options.delay){
			options.delay = 99;
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
	rb.resize = {
		fns: [],
		setup: function(){
			if(!installed){
				installed = true;
				setTimeout(function(){
					iWidth = innerWidth;
					cHeight = docElem.clientHeight;
				});
				window.addEventListener('resize', this.run);
			}
		},
		teardown: function(){
			if(installed && !this.fns.length){
				installed = false;
				window.removeEventListener('resize', this.run);
			}
		},
		on: function(fn, thisArg){
			this.fns.push(fn);
			this.setup();
		},
		off: function(fn){

		},
	};

	rb.resize.run = rb.throttle(function(){
		var i, len;
		if(iWidth != innerWidth || cHeight != docElem.clientHeight){
			iWidth = innerWidth;
			cHeight = docElem.clientHeight;

			for(i = 0, len = this.fns.length; i < len; i++){
				this.fns[i]();
			}
		}
	}, {that:rb.resize});
})();

(function(){
	'use strict';
	rb.getCSSNumbers = function(element, styles, onlyPositive){
		var i, value;
		var $element = dom(element);
		var numbers = 0;
		if(!Array.isArray(styles)){
			styles = [styles];
		}

		for(i = 0; i < styles.length; i++){
			value = parseFloat($element.css(styles[i])) || 0;
			if(!onlyPositive || value > 0){
				numbers += value;
			}
		}

		return numbers;
	};
})();
