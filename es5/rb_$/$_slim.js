(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.$_slim = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    var dataSymbol = void 0,
        regFocusable = void 0;
    var specialEvents = {};
    var target2 = '';
    if ((typeof target2 === 'undefined' ? 'undefined' : _typeof(target2)) !== 'object' && typeof target2 != 'function') {
        target2 = {};
    }

    var Dom = function Dom(elements, context) {

        if (!(this instanceof Dom)) {
            return new Dom(elements, context);
        }
        if (typeof elements == 'string') {
            elements = Array.from((context || document).querySelectorAll(elements));
        } else if (typeof elements == 'function') {
            if (Dom.isReady) {
                elements(Dom);
            } else {
                document.addEventListener('DOMContentLoaded', function () {
                    elements(Dom);
                });
            }
            return;
        }

        if (!Array.isArray(elements)) {
            if (!elements) {
                elements = [];
            } else if (elements.nodeName || !('length' in elements) || elements == window) {
                elements = [elements];
            } else {
                elements = Array.from(elements.elements || elements);
            }
        }

        this.elements = elements;
        this.length = this.elements.length || 0;
    };
    var regComma = /^\d+,\d+(px|em|rem|%|deg)$/;
    var regWhite = /\s+/g;
    var fn = Dom.prototype;
    var class2type = {};
    var toString = class2type.toString;
    var hasOwn = class2type.hasOwnProperty;
    var fnToString = hasOwn.toString;
    var getProto = Object.getPrototypeOf;
    var ObjectFunctionString = fnToString.call(Object);

    Object.assign(Dom, {
        isPlainObject: function isPlainObject(obj) {
            var proto, Ctor;

            if (!obj || toString.call(obj) !== '[object Object]') {
                return false;
            }

            proto = getProto(obj);

            if (!proto) {
                return true;
            }

            Ctor = hasOwn.call(proto, 'constructor') && proto.constructor;
            return typeof Ctor === 'function' && fnToString.call(Ctor) === ObjectFunctionString;
        },
        extend: function extend() {
            var options, name, src, copy, copyIsArray, clone;
            var target = arguments[0] || {};
            var i = 1;
            var length = arguments.length;
            var deep = false;

            if (typeof target === 'boolean') {
                deep = target;
                target = arguments[i] || {};
                i++;
            }

            if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== 'object' && typeof target != 'function') {
                target = {};
            }

            if (i === length) {
                target = this;
                i--;
            }

            for (; i < length; i++) {

                if ((options = arguments[i]) != null) {

                    for (name in options) {
                        src = target[name];
                        copy = options[name];

                        if (target === copy) {
                            continue;
                        }

                        if (deep && copy && (Dom.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {

                            if (copyIsArray) {
                                copyIsArray = false;
                                clone = src && Array.isArray(src) ? src : [];
                            } else {
                                clone = src && Dom.isPlainObject(src) ? src : {};
                            }

                            target[name] = Dom.extend(deep, clone, copy);
                        } else if (copy !== undefined) {
                            target[name] = copy;
                        }
                    }
                }
            }

            return target;
        },
        event: {
            special: specialEvents
        },
        fn: Dom.prototype,
        cssNumber: {
            opacity: true
        },
        cssHooks: {},
        support: {},
        isReady: document.readyState != 'loading',
        noop: function noop() {},
        q: function q(sel, context) {
            return new Dom((context || document).querySelectorAll(sel));
        },
        Event: function Event(type, options) {
            var event = rb.events.Event(type, options);

            if (!event.isDefaultPrevented || event.isDefaultPrevented._deprecated) {
                event.isDefaultPrevented = function () {
                    return event.defaultPrevented;
                };
            }

            return event;
        },
        Callbacks: function Callbacks(flags) {
            if (flags) {
                rb.log('not supported: ' + flags);
            }
            var list = [];

            return {
                add: function add(fn) {
                    list.push(fn);
                },
                remove: function remove(fn) {
                    var index = list.indexOf(fn);

                    if (index != -1) {
                        list.splice(index, 1);
                    }
                },
                fire: function fire() {
                    this.fireWith(this, arguments);
                },
                fireWith: function fireWith(that, args) {
                    var i, len;
                    for (i = 0, len = list.length; i < len; i++) {
                        if (list[i]) {
                            list[i].apply(that, [].concat(args));
                        }
                    }
                },
                has: function has() {
                    return !!list.length;
                }
            };
        },
        css: function css(elem, name, extra, styles) {
            var ret, num;
            if (Dom.cssHooks[name] && Dom.cssHooks[name].get) {
                ret = Dom.cssHooks[name].get(elem);
            } else {
                styles = styles || rb.getStyles(elem, null);
                ret = styles.getPropertyValue(name) || styles[name];
            }

            if (ret && regComma.test(ret)) {
                ret = ret.replace(',', '.');
            }

            if (extra) {
                num = parseFloat(ret);
                if (extra === true || !isNaN(num)) {
                    ret = num || 0;
                }
            }
            return ret;
        },
        camelCase: function () {
            var reg = /-([\da-z])/gi;
            var camelCase = function camelCase(all, found) {
                return found.toUpperCase();
            };

            var retCamel = function retCamel(str) {
                return str.replace(reg, camelCase);
            };

            return retCamel;
        }(),
        propHooks: {},
        prop: function prop(element, name, value) {
            var hook = Dom.propHooks[name];

            if (value === undefined) {
                return hook && hook.get ? hook.get(element) : element[name];
            }

            if (hook && hook.set) {
                hook.set(element, value);
            } else {
                element[name] = value;
            }
        }
    });

    Object.assign(fn, {
        get: function get(number) {
            return arguments.length ? this.elements[number] : this.elements;
        },
        eq: function eq(number) {
            return new Dom(this.elements[number] ? [this.elements[number]] : []);
        },
        css: function css(style) {
            var elem;
            if (typeof style == 'string') {
                elem = this.elements[0];
                return elem && Dom.css(elem, style);
            }
            this.elements.forEach(function (elem) {
                var prop;
                var eStyle = elem.style;
                for (prop in style) {
                    if (Dom.cssHooks[prop] && Dom.cssHooks[prop].set) {
                        Dom.cssHooks[prop].set(elem, style[prop]);
                    } else {
                        eStyle[prop] = style[prop];
                    }
                }
            });
            return this;
        },
        prop: function prop(props) {
            var elem;
            if (typeof props == 'string') {
                elem = this.elements[0];
                return elem && Dom.prop(elem, props);
            }
            this.elements.forEach(function (elem) {
                var prop;
                for (prop in props) {
                    Dom.prop(elem, prop, props[prop]);
                }
            });
            return this;
        },
        attr: function attr(attrs) {
            var elem;
            if (typeof attrs == 'string') {
                elem = this.elements[0];
                return elem && elem.getAttribute(attrs);
            }
            this.elements.forEach(function (elem) {
                var attr;
                for (attr in attrs) {
                    elem.setAttribute(attr, attrs[attr]);
                }
            });
            return this;
        },
        removeAttr: function removeAttr(attr) {
            this.elements.forEach(function (elem) {
                elem.removeAttribute(attr);
            });
            return this;
        },
        is: function is(sel) {
            return this.elements.some(function (elem) {
                return elem.matches(sel);
            });
        },
        html: function html(htmlstringOrDom) {
            var elem;

            if (!arguments.length) {
                elem = this.elements[0];
                return elem && elem.innerHTML || '';
            }

            this.elements.forEach(function (elem) {
                elem.innerHTML = '';
            });

            this.append(htmlstringOrDom);

            return this;
        },
        before: function before(htmlstringOrDom) {
            var isHTMLString = (typeof htmlstringOrDom === 'undefined' ? 'undefined' : _typeof(htmlstringOrDom)) != 'object';
            var target = !isHTMLString ? this.first() : this;

            target.elements.forEach(function (elem) {
                var parentElement;
                if (isHTMLString) {
                    elem.insertAdjacentHTML('beforebegin', htmlstringOrDom);
                } else {
                    parentElement = elem.parentNode;
                    if (parentElement) {
                        parentElement.insertBefore(getNodesAsOne(htmlstringOrDom), elem);
                    }
                }
            });
            return this;
        },
        prepend: function prepend(htmlstringOrDom) {
            var isHTMLString = (typeof htmlstringOrDom === 'undefined' ? 'undefined' : _typeof(htmlstringOrDom)) != 'object';
            var target = !isHTMLString ? this.first() : this;

            target.elements.forEach(function (elem) {
                if (isHTMLString) {
                    elem.insertAdjacentHTML('afterbegin', htmlstringOrDom);
                } else {
                    elem.insertBefore(getNodesAsOne(htmlstringOrDom), elem.firstChild);
                }
            });
            return this;
        },
        prependTo: function prependTo(target) {
            new Dom(target).prepend(this);
            return this;
        },
        append: function append(htmlstringOrDom) {
            var isHTMLString = (typeof htmlstringOrDom === 'undefined' ? 'undefined' : _typeof(htmlstringOrDom)) != 'object';
            var target = !isHTMLString ? this.last() : this;

            target.elements.forEach(function (elem) {
                if (isHTMLString) {
                    elem.insertAdjacentHTML('beforeend', htmlstringOrDom);
                } else {
                    elem.insertBefore(getNodesAsOne(htmlstringOrDom), null);
                }
            });

            return this;
        },
        appendTo: function appendTo(target) {
            new Dom(target).append(this);
            return this;
        },
        after: function after(htmlstringOrDom) {
            var isHTMLString = (typeof htmlstringOrDom === 'undefined' ? 'undefined' : _typeof(htmlstringOrDom)) != 'object';
            var target = !isHTMLString ? this.last() : this;

            target.elements.forEach(function (elem) {
                var parentElement;
                if (isHTMLString) {
                    elem.insertAdjacentHTML('afterend', htmlstringOrDom);
                } else {
                    parentElement = elem.parentNode;
                    if (parentElement) {
                        parentElement.insertBefore(getNodesAsOne(htmlstringOrDom), elem.nextElementSibling);
                    }
                }
            });
            return this;
        },
        each: function each(cb) {
            this.elements.forEach(function (elem, index) {
                cb.call(elem, index, elem);
            });
            return this;
        },
        remove: function remove() {
            this.elements.forEach(function (elem) {
                var parent = elem.parentNode;
                if (parent && parent.removeChild) {
                    parent.removeChild(elem);
                }
            });
            return this;
        },
        trigger: function trigger(type, options) {
            var firstEvent;

            if ((typeof type === 'undefined' ? 'undefined' : _typeof(type)) == 'object') {
                firstEvent = type;
                type = firstEvent.type;
            }

            if (!options) {
                options = {};
            }

            if (options.bubbles == null) {
                options.bubbles = true;
            }

            this.elements.forEach(function (elem) {
                var event = firstEvent || new CustomEvent(type, options);
                firstEvent = null;
                elem.dispatchEvent(event);
            });

            return this;
        },
        index: function index(elem) {
            if (!elem.nodeName && elem.get) {
                elem = elem.get(0);
            }
            return this.elements.indexOf(elem);
        },
        add: function add(elem) {
            if (this.elements && this.elements.indexOf(elem) == -1) {
                this.elements.push(elem);
            }
            return this;
        },
        first: function first() {
            return Dom(this.elements[0]);
        },
        last: function last() {
            return Dom(this.elements[this.elements.length - 1]);
        }
    });

    function getNodesAsOne(nodes) {
        var node = nodes;

        if (!nodes.nodeType) {
            if (nodes instanceof Dom) {
                nodes = nodes.get();
            }

            if (nodes.length == 1) {
                node = nodes[0];
            } else {
                node = document.createDocumentFragment();
                Array.from(nodes).forEach(function (elem) {
                    node.appendChild(elem);
                });
            }
        }

        return node;
    }

    ['scrollTop', 'scrollLeft'].forEach(function (name) {
        fn[name] = function (value) {
            var elem;
            var ret = this;
            if (value == null) {
                ret = 0;
                elem = this[0];

                if (elem) {
                    ret = (elem == window || elem == document ? document.scrollingElement : elem)[name];
                }
            } else {
                this.elements.forEach(function (elem) {
                    if (elem == window || elem == document) {
                        elem = document.scrollingElement;
                    }
                    elem[name] = value;
                });
            }
            return ret;
        };
    });

    [['find', 'querySelectorAll', true], ['children', 'children']].forEach(function (action) {
        var isMatched = !!action[2];
        var isMethod = !!action[2];
        fn[action[0]] = function (sel) {
            var array = [];
            this.elements.forEach(function (elem, index) {
                var i, len;
                var elements = isMethod ? elem[action[1]](sel) : elem[action[1]];
                for (i = 0, len = elements.length; i < len; i++) {
                    if ((isMatched || !sel || elements[i].matches(sel)) && (!index || array.indexOf(elements[i]) == -1)) {
                        array.push(elements[i]);
                    }
                }
            });

            return new Dom(array);
        };
    });

    [['closest', 'closest', true, false, true], ['next', 'nextElementSibling', false, true], ['prev', 'previousElementSibling', false, true], ['parent', 'parentNode']].forEach(function (action) {
        var isMatched = !!action[2];
        var isUnique = !!action[3];
        var isMethod = !!action[4];
        fn[action[0]] = function (sel) {
            var array = [];
            this.elements.forEach(function (elem, index) {
                var element = isMethod ? elem[action[1]](sel) : elem[action[1]];
                if (element && (isMatched || !sel || element.matches(sel)) && (isUnique || !index || array.indexOf(element) == -1)) {
                    array.push(element);
                }
            });
            return new Dom(array);
        };
    });

    [['prevAll', 'previousElementSibling'], ['nextAll', 'nextElementSibling'], ['parents', 'parentNode']].forEach(function (action) {
        fn[action[0]] = function (sel) {
            var array = [];
            this.elements.forEach(function (elem, index) {
                var element = elem[action[1]];

                while (element && element.nodeType == 1) {
                    if ((!sel || element.matches(sel)) && (!index || array.indexOf(element) == -1)) {
                        array.push(element);
                    }
                    element = element[action[1]];
                }
            });

            return new Dom(array);
        };
    });

    fn.detach = fn.remove;

    ['add', 'remove', 'toggle'].forEach(function (action) {
        var isToggle = action == 'toggle';
        fn[action + 'Class'] = function (cl) {
            var args = isToggle ? arguments : cl.split(regWhite);
            this.elements.forEach(function (elem) {
                var list = elem.classList;
                list[action].apply(list, args);
            });
            return this;
        };
    });

    //new array or returns array
    ['map', 'filter', 'not'].forEach(function (name) {
        var isNot;
        var arrayFn = name;
        if (isNot = name == 'not') {
            arrayFn = 'filter';
        }
        fn[name] = function (fn) {
            var needle;
            var type = typeof fn === 'undefined' ? 'undefined' : _typeof(fn);

            if (type != 'function') {
                needle = fn;
                if (!this.length) {
                    fn = Dom.noop;
                } else if (type == 'string') {
                    fn = function fn() {
                        return this.matches(needle);
                    };
                } else if (type == 'object') {
                    if (typeof needle.length == 'number' && !needle.nodeType) {
                        if (!Array.isArray(needle)) {
                            needle = needle instanceof Dom ? needle.get() : Array.from(needle);
                        }

                        fn = function fn() {
                            return needle.includes(this);
                        };
                    } else {
                        fn = function fn() {
                            return this == needle;
                        };
                    }
                }
            }

            return new Dom(this.elements[arrayFn](function (elem, index) {
                var ret = fn.call(elem, index, elem);
                return isNot ? !ret : ret;
            }));
        };
    });

    ['slice'].forEach(function (name) {
        fn[name] = function () {
            return new Dom(this.elements[name].apply(this.elements, arguments));
        };
    });

    //['every', 'findIndex', 'includes', 'indexOf', 'lastIndexOf', 'some'].forEach(function(name){
    //	fn[name] = function(){
    //		return this.elements[name].apply(this.elements, arguments);
    //	};
    //});

    [['on', 'addEventListener'], ['off', 'removeEventListener']].forEach(function (action) {
        Dom.fn[action[0]] = function (type, sel, fn) {
            var useFn;
            if (typeof sel == 'function') {
                fn = sel;
                sel = null;
            }

            if (sel) {
                useFn = rb.events.proxies.delegate(fn, sel);
            } else {
                useFn = fn;
            }

            this.elements.forEach(function (elem) {
                elem[action[1]](type, useFn, false);
            });

            return this;
        };
    });

    Dom.data = function (element, name, value) {
        if (!dataSymbol) {
            dataSymbol = rb.Symbol('_rb$data');
        }
        var data = element[dataSymbol];

        if (!data) {
            data = {};
            element[dataSymbol] = data;
        }

        if (value !== undefined) {
            data[name] = value;
        }

        return name ? data[name] : data;
    };

    if (!('onfocusin' in window) || !('onfocusout' in window)) {
        [['focusin', 'focus'], ['focusout', 'blur']].forEach(function (evts) {
            specialEvents[evts[0]] = {
                setup: function setup(data, ns, handler) {
                    var focusHandler = function focusHandler(e) {
                        handler({ type: evts[0], target: e.target });
                    };

                    Dom.data(this, '_handler' + evts[0], focusHandler);
                    this.addEventListener(evts[1], focusHandler, true);
                },
                teardown: function teardown() {
                    var focusHandler = Dom.data(this, '_handler' + evts[0]);
                    if (focusHandler) {
                        this.removeEventListener(evts[1], focusHandler, true);
                    }
                }
            };
        });
    }

    if (document.createElement('a').tabIndex !== 0 || document.createElement('i').tabIndex != -1) {
        regFocusable = /^(?:a|area|input|select|textarea|button)$/i;
        Dom.propHooks.tabIndex = {
            get: function get(element) {
                var tabIndex = element.getAttribute('tabindex');

                return tabIndex ? parseInt(tabIndex, 10) : regFocusable.test(element.nodeName) ? 0 : -1;
            }
        };
    }

    (function () {
        var added, isBorderBoxRelieable;
        var div = document.createElement('div');

        var read = function read() {
            var width;
            if (isBorderBoxRelieable == null && div) {
                width = parseFloat(rb.getStyles(div).width);
                isBorderBoxRelieable = width < 4.02 && width > 3.98;
                (rb.rAFQueue || requestAnimationFrame)(function () {
                    if (div) {
                        div.remove();
                        div = null;
                    }
                });
            }
        };
        var add = function add() {
            if (!added) {
                added = true;
                document.documentElement.appendChild(div);

                setTimeout(read, 9);
            }
        };

        var boxSizingReliable = function boxSizingReliable() {
            if (isBorderBoxRelieable == null) {
                add();
                read();
            }
            return isBorderBoxRelieable;
        };

        div.style.cssText = 'position:absolute;top:0;visibility:hidden;' + 'width:4px;border:0;padding:1px;box-sizing:border-box;';

        if (window.CSS && CSS.supports && CSS.supports('box-sizing', 'border-box')) {
            isBorderBoxRelieable = true;
        } else {
            requestAnimationFrame(add);
        }

        Dom.support.boxSizingReliable = boxSizingReliable;

        [['height', 'Height'], ['width', 'Width']].forEach(function (names) {
            var cssName = names[0];
            var extras = cssName == 'height' ? ['Top', 'Bottom'] : ['Left', 'Right'];

            ['inner', 'outer', ''].forEach(function (modifier) {
                var fnName = modifier ? modifier + names[1] : names[0];
                fn[fnName] = function (margin, value) {
                    var styles, extraStyles, isBorderBox, doc;
                    var ret = 0;
                    var elem = this.elements[0];
                    if (margin != null && (typeof margin !== 'boolean' || value)) {
                        rb.log(modifier + names[1] + ' is only supported as getter');
                    }

                    if (elem) {
                        if (elem.nodeType == 9) {
                            doc = elem.documentElement;
                            ret = Math.max(elem.body['scroll' + names[1]], doc['scroll' + names[1]], elem.body['offset' + names[1]], doc['offset' + names[1]], doc['client' + names[1]]);
                        } else if (elem.nodeType) {
                            styles = rb.getStyles(elem);
                            ret = Dom.css(elem, cssName, true, styles);
                            isBorderBox = styles.boxSizing == 'border-box' && boxSizingReliable();

                            switch (modifier) {
                                case '':
                                    if (isBorderBox) {
                                        extraStyles = ['border' + extras[0] + 'Width', 'border' + extras[1] + 'Width', 'padding' + extras[0], 'padding' + extras[1]];

                                        ret -= rb.getCSSNumbers(elem, extraStyles, true);
                                    }
                                    break;
                                case 'inner':
                                    if (isBorderBox) {
                                        extraStyles = ['border' + extras[0] + 'Width', 'border' + extras[1] + 'Width'];
                                        ret -= rb.getCSSNumbers(elem, extraStyles, true);
                                    } else {
                                        extraStyles = ['padding' + extras[0], 'padding' + extras[1]];

                                        ret += rb.getCSSNumbers(elem, extraStyles, true);
                                    }
                                    break;
                                case 'outer':
                                    if (!isBorderBox) {
                                        extraStyles = ['border' + extras[0] + 'Width', 'border' + extras[1] + 'Width', 'padding' + extras[0], 'padding' + extras[1]];
                                        ret += rb.getCSSNumbers(elem, extraStyles, true);
                                    }

                                    if (margin === true) {
                                        ret += rb.getCSSNumbers(elem, ['margin' + extras[0], 'margin' + extras[1]], true);
                                    }
                                    break;
                                default:
                                    rb.logWarn('no modifiert', modifier);
                            }
                        } else if ('innerWidth' in elem) {
                            ret = modifier == 'outer' ? elem['inner' + names[1]] : elem.document.documentElement['client' + names[1]];
                        }
                    }
                    return ret;
                };
            });
        });
    })();

    if (!Dom.isReady) {
        document.addEventListener('DOMContentLoaded', function () {
            Dom.isReady = true;
        });
    }

    if (!window.rb) {
        window.rb = {};
    }

    if (!window.rb.$) {
        /**
         * @memberOf rb
         * @type Function
         *
         * @param elements {String|Element|NodeList|Array]
         *
         * @returns {jQueryfiedDOMList}
         */
        window.rb.$ = Dom;
    }

    exports.default = Dom;
});
