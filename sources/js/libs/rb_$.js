(function(window, factory) {
	var dom = factory(window, window.document);
	if(typeof module == 'object' && module.exports){
		module.exports = dom;
	}
}(typeof window != 'undefined' ? window : this , function(window, document) {
	'use strict';

	var eventSymbol, dataSymbol;
	var specialEvents = {};
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
	var regUnit = /^\d+\.*\d*(px|em|rem|%|deg)$/;
	var fn = Dom.prototype;
	var steps = {};
	var tween = function(element, endProps, options){

		var easing, isStopped, isJumpToEnd;
		var hardStop = false;
		var start = Date.now();
		var elementStyle = element.style;
		var props = {};
		var rAF = rb.rAFQueue;
		var stop = function(clearQueue, jumpToEnd){
			isStopped = true;
			if(jumpToEnd){
				isJumpToEnd = true;
			}
			if(clearQueue && Dom.fn.clearQueue && options.queue !== false){
				new Dom(element).clearQueue(options.queue);
			}
			step();
			hardStop = true;
		};
		var tweenObj = {};
		var alwaysEnd = function(){
			if(options.always){
				options.always.call(element);
			}
			if(Dom.dequeue){
				if(options.queue !== false){
					Dom.dequeue(element, options.queue);
				}
			}
		};
		var step = function() {
			if(hardStop){return;}
			var prop, value, eased;
			var pos = (Date.now() - start) / options.duration;

			if(pos > 1 || isJumpToEnd){
				pos = 1;
			}

			if(!isStopped){
				eased = easing(pos);

				for(prop in props){
					value = (props[prop].end - props[prop].start) * eased + props[prop].start;

					if(prop in steps){
						props[prop].pos = eased;
						props[prop].now = value;
						steps[prop](props[prop]);
					} else if(prop in elementStyle){
						if(!Dom.cssNumber[prop]){
							value += props[prop].unit;
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
				} else {
					alwaysEnd();
				}
			} else{
				if(element._rbTweenStop){
					delete element._rbTweenStop;
				}
				if(options.complete && !isStopped){
					options.complete.call(element);
				}
				alwaysEnd();
			}
		};

		options = Object.assign({duration: 400, easing: 'ease'}, options || {});

		tween.createPropValues(element, elementStyle, props, endProps, options);

		easing = Dom.easing[options.easing] || Dom.easing.ease || Dom.easing.swing;
		element._rbTweenStop = stop;
		tweenObj.opts = options;
		tweenObj.props = endProps;

		rAF(step);
	};

	tween.createPropValues = function(element, elementStyle, props, endProps, options){
		var prop, unit, tmpValue;
		var styles = rb.getStyles(element);
		for(prop in endProps){
			props[prop] = {
				elem: element,
				options: options,
			};

			if(typeof endProps[prop] == 'string'){
				unit = endProps[prop].match(regUnit);
				tmpValue = parseFloat(endProps[prop]);

				props[prop].end = isNaN(tmpValue) ? endProps[prop] : tmpValue;
			} else {
				props[prop].end = endProps[prop] || 0;
			}

			props[prop].unit = unit && unit[1] || 'px';

			if(Dom.cssHooks[prop] && Dom.cssHooks[prop].get){
				props[prop].start = Dom.cssHooks[prop].get(element);
			} else if(prop in elementStyle){
				props[prop].start = (styles.getPropertyValue(prop) || styles[prop]);
			} else {
				props[prop].start = element[prop] || 0;
			}

			tmpValue = parseFloat(props[prop].start);

			props[prop].start = isNaN(tmpValue) ? props[prop].start : tmpValue;
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
		event: {
			special: specialEvents,
		},
		fn: Dom.prototype,
		cssNumber: {
			"opacity": true,
		},
		cssHooks: {},
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
			if(Dom.cssHooks[name] && Dom.cssHooks[name].get){
				ret = Dom.cssHooks[name].get(elem);
			} else {
				styles = styles || rb.getStyles(elem, null);
				ret = styles.getPropertyValue(name) || styles[name];
			}

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
					if(Dom.cssHooks[prop] && Dom.cssHooks[prop].set){
						Dom.cssHooks[prop].set(elem, style[prop]);
					} else {
						eStyle[prop] = style[prop];
					}
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
			var elem, isString;
			if(!arguments.length){
				elem = this.elements[0];
				return elem && elem.innerHTML || '';
			}
			isString = typeof html != 'object';
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
			var isString = typeof html != 'object';
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
			var isString = typeof html != 'object';
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
			var isString = typeof html != 'object';
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
			var isString = typeof html != 'object';
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
			var queue = (!options || options.queue !== false) && Dom.queue;
			var start = function(){
				tween(this, endProps, options);
			};

			this.elements.forEach(function(elem){
				var queues;
				var queueName = options && options.queue;
				if(queue){
					queues = Dom.queue(elem, queueName, start);
					if(queues.length == 1){
						Dom.queue(elem, queueName, function(){
							Dom.dequeue(elem, queueName);
						});
						if(!queueName || queueName == 'fx'){
							Dom.dequeue(elem, queueName);
						}
					}
				} else {
					tween(elem, endProps, options);
				}
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
		var isMethod = !!action[2];
		fn[action[0]] = function(sel){
			var array = [];
			this.elements.forEach(function(elem, index){
				var i, len;
				var elements = isMethod ? elem[action[1]](sel) : elem[action[1]];
				for(i = 0, len = elements.length; i < len; i++){
					if((isMatched || !sel || elements[i].matches(sel)) && (!index || array.indexOf(elements[i]) == -1)){
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
			this.elements.forEach(function(elem, index){
				var element = isMethod ? elem[action[1]](sel) : elem[action[1]];
				if(element && (isMatched || !sel || element.matches(sel)) && (isUnique || !index || array.indexOf(element) == -1)){
					array.push(element);
				}
			});
			return new Dom( array );
		};
	});

	[['prevAll', 'previousElementSibling'], ['nextAll', 'nextElementSibling'], ['parents', 'parentNode']].forEach(function(action){
		fn[action[0]] = function(sel){
			var array = [];
			this.elements.forEach(function(elem, index){
				var element = elem[action[1]];

				while(element && element.nodeType == 1){
					if((!sel || element.matches(sel)) && (!index || array.indexOf(element) == -1)){
						array.push(element);
					}
					element = element[action[1]];
				}
			});

			return new Dom( array );
		};
	});

	fn.detach = fn.remove;

	['add', 'remove', 'toggle'].forEach(function(action){
		fn[action + 'Class'] =  function(cl){
			this.elements.forEach(function(elem){
				elem.classList[action](cl);
			});
			return this;
		};
	});

	//new array or returns array
	['map', 'filter', 'not'].forEach(function(name){
		var isNot;
		var arrayFn = name;
		if((isNot = name == 'not')){
			arrayFn = 'filter';
		}
		fn[name] = function(fn){
			var needle;
			var type = typeof fn;

			if (type != 'function'){
				needle = fn;
				if (!this.length) {
					fn = Dom.noop;
				} else if (type == 'string') {
					fn = function(){
						return this.matches(needle);
					};
				} else if (type == 'object') {
					fn = function(){
						return this == needle;
					};
				}
			}

			return new Dom(this.elements[arrayFn](function(elem, index){
				var ret = fn.call(elem, index, elem);
				return isNot ? !ret : ret;
			}));
		};
	});

	//['every', 'findIndex', 'includes', 'indexOf', 'lastIndexOf', 'some'].forEach(function(name){
	//	fn[name] = function(){
	//		return this.elements[name].apply(this.elements, arguments);
	//	};
	//});

	function handleSpecialEvents(element, type, action, fn){
		if(!specialEvents[type]){
			return;
		}
		if(!eventSymbol){
			eventSymbol = rb.Symbol('_rb$Events');
		}
		var eventData = element[eventSymbol];

		if((!eventData || !eventData[type]) && action == 'off'){return;}

		if(action == 'off'){
			eventData[type].cbs.remove(fn);

			if(!eventData.type.cbs.has()){
				if(specialEvents[type].teardown){
					specialEvents[type].teardown.call(element);
				}
				eventData.type = null;
			}
		} else {
			if(!eventData){
				eventData = {};
				element[eventSymbol] = eventData;
			}
			if(!eventData[type]){
				if(specialEvents[type].setup){
					specialEvents[type].setup.call(element, null, '', function(e, data){
						var target = e.target || (data && data.target) || element;
						eventData[type].cbs.fireWith(target, [{type: e.type || type, target: target}]);
					});
				}
				eventData[type] = {cbs: Dom.Callbacks()};
			}

			eventData[type].cbs.add(fn);
		}
	}

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
				handleSpecialEvents(elem, type, action[0], useFn);
				elem[action[1]](type, useFn, capture || false);
			});

			return this;
		};
	});

	Dom.data = function(element, name, value){
		if(!dataSymbol){
			dataSymbol = rb.Symbol('_rb$data');
		}
		var data = element[dataSymbol];

		if(!data){
			data = {};
			element[dataSymbol] = data;
		}

		if(value !== undefined){
			data[name] = value;
		}

		return name ? data[name] : data;
	};

	if ( !('onfocusin' in window) || !('onfocusout' in window) ) {
		[['focusin', 'focus'], ['focusout', 'blur']].forEach(function(evts){
			specialEvents[evts[0]] = {
				setup: function(data, ns, handler){
					var focusHandler = function(e){
						handler({type: evts[0], target: e.target});
					};

					Dom.data(this, '_handler' + evts[0], focusHandler);
					this.addEventListener(evts[1], focusHandler, true);
				},
				teardown: function(){
					var focusHandler = Dom.data(this, '_handler' + evts[0]);
					if(focusHandler){
						this.removeEventListener(evts[1], focusHandler, true);
					}
				}
			};
		});
	}

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
