(function(window, factory) {
	var dom = factory(window, window.document);
	window.dom = dom;
	if(typeof module == 'object' && module.exports){
		module.exports = dom;
	}
}(typeof window != 'undefined' ? window : this , function(window, document) {
	'use strict';

	var Dom = function(elements, context){

		if(!(this instanceof Dom)){
			return new Dom(elements);
		}
		if(typeof elements == 'string'){
			elements = Array.from((context || document).querySelectorAll(elements));
		} else if(typeof elements == 'function'){
			if(Dom.isReady){
				elements(Dom);
			} else {
				document.addEventListener('DOMContentLoaded', function(){
					elements(Dom);
				});
			}
			return;
		}

		if(!Array.isArray(elements)){
			if(!elements){
				elements = [];
			} else if(elements.nodeName || !('length' in elements) || elements == window){
				elements = [elements];
			} else {
				elements = Array.from(elements);
			}
		}

		this.elements = elements;
		this.length = this.elements.length || 0;
	};
	var fn = Dom.prototype;
	var steps = {};
	var tween = function(element, endProps, options){

		var easing, isStopped, isJumpToEnd;
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
			hardStop = true;
		};
		var tweenObj = {};
		var stepObj = {};
		var step = function() {
			if(hardStop){return;}
			var prop, value, eased;
			var pos = (Date.now() - start) / options.duration;

			if(pos > 1 || isJumpToEnd){
				pos = 1;
			}

			if(!isStopped){
				eased = easing(pos);

				for(prop in startProps){
					value = (endProps[prop] - startProps[prop]) * eased + startProps[prop];

					if(prop in steps){

						if(!stepObj[prop]) {
							stepObj[prop] = {
								elem: element,
								start: startProps[prop],
								end: endProps[prop],
								options: options,
							};
						}

						stepObj[prop].pos = eased;
						stepObj[prop].now = value;
						steps[prop](stepObj[prop]);

					} else if(prop in elementStyle){
						if(!Dom.cssNumber[prop]){
							value += 'px';
						}
						elementStyle[prop] = value;
					} else {
						element[prop] = value;
					}
				}

				if(options.progress){
					options.progress(tweenObj, pos);
				}
			}

			if(pos < 1){
				if(!isStopped){
					rAF(step);
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

		easing = Dom.easing[options.easing] || Dom.easing.ease || Dom.easing.swing;
		element._rbTweenStop = stop;
		tweenObj.opts = options;
		tweenObj.props = endProps;

		rAF(step);
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
				startProps[prop] = element[prop] || 0;
			}
		}
	};

	Object.assign(Dom, {
		easing: {
			linear: function(pos) {
				return pos;
			},
			swing: function(p) {
				return 0.5 - Math.cos( p * Math.PI ) / 2;
			}
		},
		fx: {
			step: steps
		},
		fn: Dom.prototype,
		cssNumber: {
			"opacity": true,
		},
		isReady: document.readyState != 'loading',
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

			if(options.cancelable == null){
				options.cancelable = true;
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
				rb.log('not supported: '+ flags);
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
			var ret, num;
			styles = styles || rb.getStyles(elem, null);
			ret = styles.getPropertyValue(name) || styles[name];

			if(extra){
				num = parseFloat(ret);
				if(extra === true || !isNaN(num)){
					ret = num || 0;
				}
			}
			return ret;
		},
	});

	Object.assign(fn, {
		get: function(number){
			return arguments.length ? this.elements[number] : this.elements;
		},
		eq: function(number){
			return new Dom(this.elements[number] ? [this.elements[number]] : []);
		},
		css: function(style){
			var elem;
			if(typeof style == 'string'){
				elem = this.elements[0];
				return elem && Dom.css(elem, style);
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

	[['find', 'querySelectorAll', true], ['children', 'children']].forEach(function(action, test){
		var isMatched = !!action[2];
		fn[action[0]] = function(sel){
			var array = [];
			this.elements.forEach(function(elem){
				var i, len;
				var elements = test ? elem[action[1]] : elem[action[1]](sel);
				for(i = 0, len = elements.length; i < len; i++){
					if((isMatched || !sel || elements[i].matches(sel)) && array.indexOf(elements[i]) == -1){
						array.push(elements[i]);
					}
				}
			});

			return new Dom( array );
		};
	});

	[['closest', 'closest', true, false, true], ['next', 'nextElementSibling', false, true], ['prev', 'previousElementSibling', false, true], ['parent', 'parentNode']].forEach(function(action){
		var isMatched = !!action[2];
		var isUnique = !!action[3];
		var isMethod = !!action[4];
		fn[action[0]] = function(sel){
			var array = [];
			this.elements.forEach(function(elem){
				var element = isMethod ? elem[action[1]](sel) : elem[action[1]];
				if(element && (isMatched || !sel || element.matches(sel)) && (isUnique || array.indexOf(element) == -1)){
					array.push(element);
				}
			});
			return new Dom( array );
		};
	});

	fn.detach = fn.remove;

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

	//['every', 'findIndex', 'includes', 'indexOf', 'lastIndexOf', 'some'].forEach(function(name){
	//	fn[name] = function(){
	//		return this.elements[name].apply(this.elements, arguments);
	//	};
	//});

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

	if(!Dom.isReady){
		document.addEventListener("DOMContentLoaded", function() {
			Dom.isReady = true;
		});
	}

	if(!window.rb){
		window.rb = {};
	}

	if(!window.rb.$){
		window.rb.$ = Dom;
	}

	return Dom;
}));
