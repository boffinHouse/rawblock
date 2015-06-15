(function(window, factory) {
	var dom = factory(window, window.document);
	window.dom = dom;
	if(typeof module == 'object' && module.exports){
		module.exports = dom;
	}
}(typeof window != 'undefined' ? window : this , function(window, document) {
	'use strict';
	var slice = [].slice;
	var dom = function(elements){

		if(typeof elements == 'string'){
			return dom.q(elements);
		}
		if(!this){
			return new dom(elements);
		}

		if(!Array.isArray(elements)){
			if(!elements){
				elements = [];
			} else if(elements.nodeName || !('length' in elements)){
				elements = [elements];
			} else {
				elements = slice.call(elements);
			}
		}

		this.elements = elements;
	};
	var fn = dom.prototype;

	dom.fn = dom.prototype;

	dom.q = function(sel, context){
		return new dom( (context || document).querySelectorAll(sel) );
	};

	dom.Event = function(type, options){
		if(!options){
			options = {};
		}

		if(options.bubbles == null){
			options.bubbles = true;
		}

		return new CustomEvent(type, options);
	};

	fn.find = function(sel){
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

		return new dom( array );
	};

	fn.closest = function(sel){
		var array = [];
		this.elements.forEach(function(elem){
			var element = elem.closest(sel);
			if(array.indexOf(element) == -1){
				array.push(element);
			}
		});
		return new dom( array );
	};

	fn.get = function(number){
		return arguments.length ? this.elements[number] : this.elements;
	};

	[['on', 'addEventListener'], ['off', 'removeEventListener']].forEach(function(action){
		dom.fn[action[0]] = function(type, sel, fn, capture){
			var useFn;
			if(typeof sel == 'function'){
				capture = fn;
				fn = sel;
				sel = null;
			}

			if(sel){
				if(!fn[sel]){
					fn[sel] = function(e){
						e.delegateTarget = e.target.closest(sel);
						if(!e.delegateTarget){return;}
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

	fn.css = function(style, pseudo){
		var elem;
		if(typeof style == 'string'){
			elem = this.elements[0];
			return elem && getComputedStyle(elem, pseudo).getPropertyValue(style);
		}
		this.elements.forEach(function(elem){
			var prop;
			var eStyle = elem.style;
			for(prop in style){
				eStyle[prop] = style[prop];
			}
		});
		return this;
	};

	fn.prop = function(props){
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
	};

	fn.attr = function(attrs){
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
	};

	['add', 'remove'].forEach(function(action){
		fn[action + 'Class'] =  function(cl){
			this.elements.forEach(function(elem){
				elem.classList[action](cl);
			});
			return this;
		};
	});

	fn.matches = function(sel){
		return this.elements.some(function(elem){
			return elem.matches(sel);
		});
	};

	fn.html = function(html){
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
	};

	fn.before = function(html){
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
	};

	fn.prepend = function(html){
		var isString = typeof html == 'string';
		this.elements.forEach(function(elem){
			if (isString){
				elem.insertAdjacentHTML('afterbegin', html);
			} else {
				elem.insertBefore(html, elem.firstChild);
			}
		});
		return this;
	};

	fn.append = function(html){
		var isString = typeof html == 'string';
		this.elements.forEach(function(elem){
			if (isString){
				elem.insertAdjacentHTML('beforeend', html);
			} else {
				elem.insertBefore(html, null);
			}
		});
		return this;
	};

	fn.after = function(html){
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
	};

	fn.each = function(cb){
		this.elements.forEach(cb);
		return this;
	};

	fn.trigger = function(type, options, getEvent){
		var ret, firstEvent;

		if(typeof type == 'object'){
			firstEvent = type;
			type = firstEvent.type;
		}

		if(typeof options == 'boolean'){
			getEvent = options;
			options = null;
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

			if(!ret && getEvent){
				ret = event;
			}
			elem.dispatchEvent(event);
		});

		return ret || this;
	};

	['forEach', 'reverse', 'sort', 'push'].forEach(function(name){
		fn[name] = function(){
			this.elements[name].apply(this.elements, arguments);
			return this;
		};
	});

	//new array or returns array
	['map', 'filter', 'pop', 'shift', 'slice', 'splice', 'unshift'].forEach(function(name){
		fn[name] = function(){
			return new dom(this.elements[name].apply(this.elements, arguments));
		};
	});

	['every', 'findIndex', 'includes', 'indexOf', 'lastIndexOf', 'some'].forEach(function(name){
		fn[name] = function(){
			return this.elements[name].apply(this.elements, arguments);
		};
	});

	return dom;
}));
