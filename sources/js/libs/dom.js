(function(window, factory) {
	var dom = factory(window, window.document);
	window.dom = dom;
	if(typeof module == 'object' && module.exports){
		module.exports = dom;
	}
}(typeof window != 'undefined' ? window : this , function(window, document) {
	'use strict';
	var slice = [].slice;
	var Dom = function(elements){

		if(typeof elements == 'string'){
			return Dom.q(elements);
		}
		if(!(this instanceof Dom)){
			return new Dom(elements);
		}

		/*
		if(typeof elements == 'function'){
			if(Dom.isReady){
				elements(Dom);
			} else {
				document.addEventListener('DOMContentLoaded', function(){
					elements(Dom);
				});
			}
		}
		*/
		if(!Array.isArray(elements)){
			if(!elements){
				elements = [];
			} else if(elements.nodeName || !('length' in elements) || elements == window){
				elements = [elements];
			} else {
				elements = slice.call(elements);
			}
		}

		this.elements = elements;
		this.length = this.elements.length || 0;
	};
	var fn = Dom.prototype;
	var defaultEasing = {
		get: function(pos){
			return pos;
		}
	};
	var tween = function(element, endProps, options){

		var easing, isStopped, isJumpToEnd, bezierArgs;
		var hardStop = false;
		var start = Date.now();
		var elementStyle = element.style;
		var startProps = {};
		var rAF = rb.rAFQueue;
		var stop = function(clearQueue, jumpToEnd){
			isStopped = true;
			if(jumpToEnd){
				isJumpToEnd = true;
			}
			step();
			rAF.remove(step);
		};

		var step = function() {
			if(hardStop){return;}
			var prop, value, eased;
			var pos = (Date.now() - start) / options.duration;

			if(pos > 1 || isJumpToEnd){
				pos = 1;
			}

			if(!isStopped){
				eased = easing.get(pos);

				for(prop in startProps){
					value = (endProps[prop] - startProps[prop]) * eased + startProps[prop];

					if(prop in elementStyle){
						if(!Dom.cssNumber[prop]){
							value += 'px';
						}
						elementStyle[prop] = value;
					} else {
						element[prop] = value;
					}
				}
			}

			if(pos < 1){
				if(!isStopped){
					rAF.add(step);
				} else if(options.always){
					options.always.call(element);
				}
			} else{
				if(element._rbTweenStop){
					delete element._rbTweenStop;
				}
				if(options.complete && !isStopped){
					options.complete.call(element);
				}
				if(options.always){
					options.always.call(element);
				}
			}
		};

		tween.getStartValues(element, elementStyle, startProps, endProps);

		options = Object.assign({duration: 400, easing: 'ease'}, options || {});

		if(window.BezierEasing && !BezierEasing.css[options.easing] && (bezierArgs = options.easing.match(/([0-9\.]+)/g)) && bezierArgs.length == 4){
			bezierArgs = bezierArgs.map(function(str){
				return parseFloat(str);
			});
			BezierEasing.css[options.easing] = BezierEasing.apply(this, bezierArgs);
		}

		easing = window.BezierEasing && (BezierEasing.css[options.easing] || BezierEasing.css.ease) || defaultEasing;

		element._rbTweenStop = stop;

		rAF.add(step);
	};

	tween.getStartValues = function(element, elementStyle, startProps, endProps){
		var prop;
		for(prop in endProps){
			if(typeof endProps[prop] == 'string'){
				endProps[prop] = parseFloat(endProps[prop]) || 0;
			}
			if(prop in elementStyle){
				startProps[prop] = parseFloat(getComputedStyle(element).getPropertyValue(prop)) || 0;
			} else {
				startProps[prop] = element[prop];
			}
		}
	};

	Object.assign(Dom, {
		fn: Dom.prototype,
		cssNumber: {
			"columnCount": true,
			"fillOpacity": true,
			"flexGrow": true,
			"flexShrink": true,
			"fontWeight": true,
			"lineHeight": true,
			"opacity": true,
			"order": true,
			"orphans": true,
			"widows": true,
			"zIndex": true,
			"zoom": true
		},
		//isReady: document.readyState != 'loading',
		noop: function(){},
		q: function(sel, context){
			return new Dom( (context || document).querySelectorAll(sel) );
		},
		Event: function(type, options){
			var event;
			if(!options){
				options = {};
			}

			if(options.bubbles == null){
				options.bubbles = true;
			}
			event = new CustomEvent(type, options);

			if(!event.isDefaultPrevented){
				event.isDefaultPrevented = function(){
					return event.defaultPrevented;
				};
			}

			return event;
		},
		Callbacks: function(flags){
			if(flags){
				console.error('not supported: '+ flags);
			}
			var list = [];

			return {
				add: function(fn){
					list.push(fn);
				},
				remove: function(fn){
					var index = list.indexOf(fn);

					if(index != -1){
						list.splice(index, 1);
					}
				},
				fire: function(){
					this.fireWith(this, arguments);
				},
				fireWith: function(that, args){
					var i, len;
					for(i = 0, len = list.length; i < len; i++){
						list[i].apply(that, args);
					}
				},
				has: function(){
					return !!list.length;
				}
			};
		},
		css: function( elem, name, extra, styles ) {
			var ret;
			styles = styles || getComputedStyle(elem, null);
			ret = name in styles ? styles[name] : styles.getPropertyValue(name);

			if(extra){
				ret = parseFloat(ret) || 0;
			}
			return ret;
		},
	});

	Object.assign(fn, {
		find: function(sel){
			var array = [];
			this.elements.forEach(function(elem){
				var i, len;
				var elements = elem.querySelectorAll(sel);
				for(i = 0, len = elements.length; i < len; i++){
					if(array.indexOf(elements[i]) == -1){
						array.push(elements[i]);
					}
				}
			});

			return new Dom( array );
		},
		closest: function(sel){
			var array = [];
			this.elements.forEach(function(elem){
				var element = elem.closest(sel);
				if(array.indexOf(element) == -1){
					array.push(element);
				}
			});
			return new Dom( array );
		},
		get: function(number){
			return arguments.length ? this.elements[number] : this.elements;
		},
		eq: function(number){
			return new Dom(this.elements[number] ? [this.elements[number]] : []);
		},
		css: function(style){
			var elem;
			if(typeof style == 'string'){
				elem = this.elements[0]
				return elem && DOM.css(elem, style);
			}
			this.elements.forEach(function(elem){
				var prop;
				var eStyle = elem.style;
				for(prop in style){
					eStyle[prop] = style[prop];
				}
			});
			return this;
		},
		prop: function(props){
			var elem;
			if(typeof props == 'string'){
				elem = this.elements[0];
				return elem && elem[props];
			}
			this.elements.forEach(function(elem){
				var prop;
				for(prop in props){
					elem[prop] = props[prop];
				}
			});
			return this;
		},
		attr: function(attrs){
			var elem;
			if(typeof attrs == 'string'){
				elem = this.elements[0];
				return elem && elem.getAttribute(attrs);
			}
			this.elements.forEach(function(elem){
				var attr;
				for(attr in attrs){
					elem.setAttribute(attr, attrs[attr]);
				}
			});
			return this;
		},
		removeAttr: function(attr){
			this.elements.forEach(function(elem){
				elem.removeAttribute(attr);
			});
			return this;
		},
		is: function(sel){
			return this.elements.some(function(elem){
				return elem.matches(sel);
			});
		},
		html: function(html){
			var elem;
			var isString = typeof html == 'string';
			if(!arguments.length){
				elem = this.elements[0];
				return elem && elem.innerHTML || '';
			}
			this.elements.forEach(function(elem){
				if(isString){
					elem.innerHTML = html;
				} else {
					elem.innerHTML = '';
					elem.appendChild(html);
				}
			});
			return this;
		},
		before: function(html){
			var isString = typeof html == 'string';
			this.elements.forEach(function(elem){
				var parentElement;
				if (isString){
					elem.insertAdjacentHTML('beforebegin', html);
				} else {
					parentElement = elem.parentNode;
					if(parentElement){
						parentElement.insertBefore(html, elem);
					}
				}
			});
			return this;
		},
		prepend: function(html){
			var isString = typeof html == 'string';
			this.elements.forEach(function(elem){
				if (isString){
					elem.insertAdjacentHTML('afterbegin', html);
				} else {
					elem.insertBefore(html, elem.firstChild);
				}
			});
			return this;
		},
		append: function(html){
			var isString = typeof html == 'string';
			this.elements.forEach(function(elem){
				if (isString){
					elem.insertAdjacentHTML('beforeend', html);
				} else {
					elem.insertBefore(html, null);
				}
			});
			return this;
		},
		after: function(html){
			var isString = typeof html == 'string';
			this.elements.forEach(function(elem){
				var parentElement;
				if (isString){
					elem.insertAdjacentHTML('afterend', html);
				} else {
					parentElement = elem.parentNode;
					if(parentElement){
						parentElement.insertBefore(html, elem.nextElementSibling);
					}
				}
			});
			return this;
		},
		each: function(cb){
			this.elements.forEach(function(elem, index){
				cb.call(elem, index, elem);
			});
			return this;
		},
		remove: function(){
			this.elements.forEach(function(elem){
				var parent = elem.parentNode;
				if(parent && parent.removeChild){
					parent.removeChild(elem);
				}
			});
			return this;
		},
		trigger: function(type, options){
			var firstEvent;

			if(typeof type == 'object'){
				firstEvent = type;
				type = firstEvent.type;
			}

			if(!options){
				options = {};
			}

			if(options.bubbles == null){
				options.bubbles = true;
			}

			this.elements.forEach(function(elem){
				var event = firstEvent || new CustomEvent(type, options);
				firstEvent = null;
				elem.dispatchEvent(event);
			});

			return this;
		},
		animate: function(endProps, options){
			this.elements.forEach(function(elem){
				tween(elem, endProps, options);
			});
			return this;
		},
		stop: function(clearQueue, jumpToEnd){
			this.elements.forEach(function(elem) {
				if (elem._rbTweenStop) {
					elem._rbTweenStop(clearQueue, jumpToEnd);
				}
			});
			return this;
		},
		index: function(elem){
			if(!elem.nodeName && elem.get){
				elem = elem.get(0);
			}
			return this.elements.indexOf(elem);
		},
	});

	['add', 'remove', 'has', 'toggle'].forEach(function(action){
		fn[action + 'Class'] =  function(cl){
			this.elements.forEach(function(elem){
				elem.classList[action](cl);
			});
			return this;
		};

		if(action == 'has'){
			action = 'contains';
		}
	});

	//new array or returns array
	['map', 'filter'].forEach(function(name){
		fn[name] = function(fn){
			var sel;

			if(typeof fn == 'string'){
				sel = fn;
				fn = function(){
					return this.matches(sel);
				};
			}
			return new Dom(this.elements[name](function(elem, index){
				return fn.call(elem, index, elem);
			}));
		};
	});

	['every', 'findIndex', 'includes', 'indexOf', 'lastIndexOf', 'some'].forEach(function(name){
		fn[name] = function(){
			return this.elements[name].apply(this.elements, arguments);
		};
	});

	[['on', 'addEventListener'], ['off', 'removeEventListener']].forEach(function(action){
		Dom.fn[action[0]] = function(type, sel, fn, capture){
			var useFn;
			if(typeof sel == 'function'){
				capture = fn;
				fn = sel;
				sel = null;
			}

			if(sel){
				if(!fn[sel]){
					fn[sel] = function(e){
						e.delegatedTarget = e.target.closest(sel);
						if(!e.delegatedTarget){return;}
						return fn.apply(this, arguments);
					};
				}
				useFn = fn[sel];
			} else {
				useFn = fn;
			}

			this.elements.forEach(function(elem){
				elem[action[1]](type, useFn, capture || false);
			});

			return this;
		};
	});

	if(!window.rb){
		window.rb = {};
	}

	if(!window.rb.$){
		window.rb.$ = window.dom;
	}

	return Dom;
}));
