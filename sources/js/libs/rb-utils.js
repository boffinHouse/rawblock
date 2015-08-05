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
			rb.rAFQueue(afterAF);
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
			var index = this.fns.indexOf(fn);
			if(index != -1){
				this.fns.splice(index, 1);
				this.teardown();
			}
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
				console.error('only one element resize handler allowed');
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
	rb.getCSSNumbers = function(element, styles, onlyPositive){
		var i, value;
		var $element = rb.$(element);
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

(function(){
	'use strict';
	rb.rAFQueue = (function(){

		var fns = [];
		var run = function(){
			var i, len;
			var fns2 = fns;

			fns = [];
			for(i = 0, len = fns2.length; i < len; i++){
				if(fns2[i]){
					fns2[i]();
				}
			}
		};
		var add = function(fn){
			fns.push(fn);
			if(fns.length == 1){
				requestAnimationFrame(run);
			}
		};

		add.clear = function(fn){
			var index = fns.indexOf(fn);

			if(index != -1){
				fns.splice(index, 1);
			}
		};

		return add;
	})();

	rb.rAF = function(fn, thisArg){
		var running, args, that;
		var run = function(){
			running = false;
			fn.apply(that, args);
		};
		return function(){
			args = arguments;
			that = thisArg || this || window;
			if(!running){
				running = true;
				rb.rAFQueue(run);
			}
		};
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
