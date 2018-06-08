import rb from './utils/global-rb';
import './crucial';
import deferred from './utils/deferred';
import rIC from './utils/request-idle-callback';
import rAFQueue from './utils/rafqueue';
import './utils/rafs';
import throttle from './utils/throttle';
import getId from './utils/get-id';
import addLog from './utils/add-log';
import getCSSNumbers from './utils/get-css-numbers';

rb.getCSSNumbers = getCSSNumbers;


if(typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production'){
    require('./utils/debughelpers');
}

addLog(rb, (typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production') ? true : 1);

if(typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production'){
    rb.logWarn('rawblock dev mode active. Do not use in production');
}

(function (window, document, _undefined) {
    'use strict';

    /* Begin: global vars end */
    const regnameSeparator = /\{-}/g;
    const regSplit = /\s*?,\s*?|\s+?/g;
    const slice = Array.prototype.slice;

    /**
     * The jQuery or dom.js (rb.$) plugin namespace.
     * @external "jQuery.fn"
     * @see {@link http://learn.jquery.com/plugins/|jQuery Plugins}
     */

    /**
     * Reference to the internally used dom.js or jQuery instance
     * @memberof rb
     */
    if(!rb.$){
        rb.$ = window.jQuery;
    }

    const $ = rb.$;

    /**
     * Reference to the root element (mostly html element)
     * @memberof rb
     * @type {Element}
     */
    rb.root = document.documentElement;

    /**
     * Reference to the jQueryfied/rb.$ root element
     * @memberof rb
     * @type {jQueryfiedDOMList}
     */
    rb.$root = $(rb.root);

    /**
     * Reference to the jQueryfied/rb.$ window object
     * @memberof rb
     * @type {jQueryfiedDOMList}
     */
    rb.$win = $(window);

    /**
     * Reference to the jQueryfied//rb.$ document object
     * @memberof rb
     * @type {jQueryfiedDOMList}
     */
    rb.$doc = $(document);

    /**
     * Namespace for global template functions. Compiled JavaScript templates should be added to this hash object. (see jst grunt task).
     * @memberof rb
     */
    rb.templates = {};

    rb.statePrefix = 'is-';
    rb.utilPrefix = 'u-';
    rb.jsPrefix = '';
    rb.nameSeparator = '-';
    rb.elementSeparator = '-';
    rb.attrSel = '';

    /* End: global vars end */

    /* Begin: ID/Symbol */
    /**
     * Returns a Symbol or unique String
     * @memberof rb
     * @param {String} description ID or description of the symbol
     * @type {Function}
     * @returns {String|Symbol}
     */
    rb.Symbol = window.Symbol;

    if (!rb.Symbol) {
        rb.Symbol = function (name) {
            name = name || '_';
            return name + getId();
        };
    }

    /* End: ID/Symbol */

    /**
     * A jQuery/rb.$ plugin to add or remove state classes.
     * @param state {string}
     * @param [addRemove] {boolean}
     * @returns {jQueryfiedDOMList}
     */
    $.fn.rbToggleState = function(state, addRemove){
        if(this.length){
            state = rb.statePrefix + (state.replace(regnameSeparator, rb.nameSeparator));
            this.toggleClass(state, addRemove);
        }

        return this;
    };

    $.fn.rbChangeState = $.fn.rbToggleState;

    /**
     * Works same as jQuery.fn.addClass, but does this in a rAF
     * @function external:"jQuery.fn".addClassRaf
     */
    /**
     * Works same as jQuery.fn.removeClass, but does this in a rAF
     * @function external:"jQuery.fn".removeClassRaf
     */
    /**
     * Works same as jQuery.fn.toggleClass, but does this in a rAF
     * @function external:"jQuery.fn".toggleClassRaf
     */
    /**
     * Works same as jQuery.fn.append, but does this in a rAF
     * @function external:"jQuery.fn".appendRaf
     */
    /**
     * Works same as jQuery.fn.appendTo, but does this in a rAF
     * @function external:"jQuery.fn".appendToRaf
     */
    /**
     * Works same as jQuery.fn.prepend, but does this in a rAF
     * @function external:"jQuery.fn".prependRaf
     */
    /**
     * Works same as jQuery.fn.prependTo, but does this in a rAF
     * @function external:"jQuery.fn".prependToRaf
     */
    /**
     * Works same as jQuery.fn.removeClass, but does this in a rAF
     * @function external:"jQuery.fn".removeClassRaf
     */
    /**
     * Works same as jQuery.fn.after, but does this in a rAF
     * @function external:"jQuery.fn".afterRaf
     */
    /**
     * Works same as jQuery.fn.before, but does this in a rAF
     * @function external:"jQuery.fn".beforeRaf
     */
    /**
     * Works same as jQuery.fn.insertAfter, but does this in a rAF
     * @function external:"jQuery.fn".insertAfterRaf
     */
    /**
     * Works same as jQuery.fn.insertBefore, but does this in a rAF
     * @function external:"jQuery.fn".insertBeforeRaf
     */
    /**
     * Works same as jQuery.fn.html, but does this in a rAF
     * @function external:"jQuery.fn".htmlRaf
     */
    /**
     * Works same as jQuery.fn.text, but does this in a rAF
     * @function external:"jQuery.fn".textRaf
     */
    /**
     * Works same as jQuery.fn.removeClass, but does this in a rAF
     * @function external:"jQuery.fn".removeClassRaf
     */
    /**
     * Works same as jQuery.fn.remove, but does this in a rAF
     * @function external:"jQuery.fn".removeRaf
     */
    /**
     * Works same as jQuery.fn.removeAttr, but does this in a rAF
     * @function external:"jQuery.fn".removeAttrRaf
     */
    /**
     * Works same as jQuery.fn.attr, but does this in a rAF
     * @function external:"jQuery.fn".attrRaf
     */
    /**
     * Works same as jQuery.fn.prop, but does this in a rAF
     * @function external:"jQuery.fn".propRaf
     */
    /**
     * Works same as jQuery.fn.css, but does this in a rAF
     * @function external:"jQuery.fn".cssRaf
     */
    /**
     * Works same as jQuery.fn.rbToggleState, but does this in a rAF
     * @function external:"jQuery.fn".rbToggleStateRaf
     */
    ['addClass', 'removeClass', 'toggleClass', 'append', 'appendTo', 'prepend', 'prependTo', 'after', 'before',
        'insertAfter', 'insertBefore', 'html', 'text', 'remove', 'removeAttr', 'attr', 'prop', 'css', 'rbToggleState'].forEach(($name) => {
        $.fn[`${$name}Raf`] = function(){
            if(this.length){
                rAFQueue(()=>{
                    this[$name](...arguments);
                }, true);
            }
            return this;
        };
    });

    /* Begin: getScrollingElement */

    /**
     * @memberof rb
     * @deprecated use `document.scrollingElement` instead
     * @returns {Element} The DOM element that scrolls the viewport (either html or body)
     */
    rb.getScrollingElement = function () {
        return document.scrollingElement;
    };

	/**
     * Alias to `getScrollingElement` can be used to override scrollingElement for project-specific needs.
     * @type function
     * @memberof rb
     */
    rb.getPageScrollingElement = rb.getScrollingElement;

    rb.getScrollingEventObject = function(element){
        var scrollObj;

        if(!element){
            element = rb.getPageScrollingElement();
        }

        if(element.matches && element.ownerDocument && element.matches('html, body')){
            scrollObj = element.ownerDocument.defaultView;
        } else if('addEventListener' in element){
            scrollObj = element;
        } else {
            scrollObj = window;
        }
        return scrollObj;
    };
    /* End: getScrollingElement */

    /* Begin: resize */
    var iWidth, cHeight, installed;
    var docElem = rb.root;

    /**
     *
     * Resize uitility object to listen/unlisten (on/off) for throttled window.resize events.
     * @memberof rb
     * @extends jQuery.Callbacks
     * @property {object} resize
     * @property {Function} resize.on Adds the passed function to listen to the global window.resize
     * @property {Function} resize.off Removes the passed function to unlisten from the global window.resize
     */
    rb.resize = Object.assign(rb.$.Callbacks(),
        {
            _setup: function () {
                if (!installed) {
                    installed = true;
                    rIC(function () {
                        iWidth = innerWidth;
                        cHeight = docElem.clientHeight;
                    });
                    window.removeEventListener('resize', this._run);
                    window.addEventListener('resize', this._run);
                }
            },
            _teardown: function () {
                if (installed && !this.has()) {
                    installed = false;
                    window.removeEventListener('resize', this._run);
                }
            },
            on: function (fn) {
                this.add(fn);
                this._setup();
            },
            off: function (fn) {
                this.remove(fn);
                this._teardown();
            },
        }
    );

    rb.resize._run = throttle(function () {
        if (iWidth != innerWidth || cHeight != docElem.clientHeight) {
            iWidth = innerWidth;
            cHeight = docElem.clientHeight;

            this.fire();
        }
    }, {that: rb.resize, read: true});

    /* End: resize */

    /* Begin: memoize */

	/**
	 * Simple memoize method
     * @param fn {function}
     * @param [justOne] {boolean}
     * @returns {Function}
     */
    rb.memoize = function(fn, justOne){
        var cache = {};
        return justOne ?
            function(argsString){
                if(argsString in cache){
                    return cache[argsString];
                }
                cache[argsString] = fn.call(this, argsString);
                return cache[argsString];
            } :
            function(){
                var args = slice.call(arguments);
                var argsString = args.join(',');
                if(argsString in cache){
                    return cache[argsString];
                }
                cache[argsString] = fn.apply(this, args);
                return cache[argsString];
            }
        ;
    };
    /* End: memoize */

    /* Begin: parseValue */
    rb.parseValue = (function () {
        var regNumber = /^-{0,1}\+{0,1}\d+?\.{0,1}\d*?$/;
        /**
         * Parses a String into another type using JSON.parse, if this fails returns the given string
         * @alias rb#parseValue
         * @param {String} attrVal The string to be parsed
         * @returns {String} The parsed string.
         */
        var parseValue = function (attrVal) {

            if (attrVal == 'true') {
                attrVal = true;
            }
            else if (attrVal == 'false') {
                attrVal = false;
            } else if (attrVal == 'null') {
                attrVal = null;
            }
            else if (regNumber.test(attrVal)) {
                attrVal = parseFloat(attrVal);
            }
            else if ((attrVal.startsWith('{') && attrVal.endsWith('}')) || (attrVal.startsWith('[') && attrVal.endsWith(']'))) {
                try {
                    attrVal = JSON.parse(attrVal);
                } catch (e) {
                    //continue
                }
            }
            return attrVal;
        };
        return parseValue;
    })();
    /* End: parseValue */

    /* Begin: rbComponent */

    /**
     * A jQuery plugin that returns a component instance by using rb.getComponent.
     * @function external:"jQuery.fn".rbComponent
     * @see rb.getComponent
     * @param [name] {String} The name of the property or method.
     * @param [initialOpts] {Object}
     *
     * @returns {ComponentInstance|jQueryfiedDOMList}
     */
    $.fn.rbComponent = function (name, initialOpts) {
        var ret;
        var elem = this.get(0);

        if(elem){
            ret = rb.getComponent(elem, name, initialOpts);
        }

        return ret;
    };
    /* End: rbComponent */

    /* Begin: addEasing */
    let BezierEasing;
    const easingMap = {
        ease: '0.25,0.1,0.25,1',
        linear: '0,0,1,1',
        'ease-in': '0.42,0,1,1',
        'ease-out': '0,0,0.58,1',
        'ease-in-out': '0.42,0,0.58,1',
    };
    /**
     * Generates an easing function from a CSS easing value and adds it to the rb.$.easing object. requires npm module: "bezier-easing".
     * @memberof rb
     * @param {String} easing The easing value. Expects a string with 4 numbers separated by a "," describing a cubic bezier curve.
     * @param {String} [name] Human readable name of the easing.
     * @returns {Function} Easing a function
     */
    const regEasingNumber = /([0-9.]+)/g;
    rb.addEasing = function (easing, name) {
        let bezierArgs;

        if (typeof easing != 'string') {
            return;
        }

        if(easingMap[easing]){
            name = easing;
            easing = easingMap[easing];
        }

        BezierEasing = BezierEasing || rb.BezierEasing || window.BezierEasing;

        if (BezierEasing && !$.easing[easing] && (bezierArgs = easing.match(regEasingNumber)) && bezierArgs.length == 4) {
            bezierArgs = bezierArgs.map(function (str) {
                return parseFloat(str);
            });

            $.easing[easing] = BezierEasing.apply(this, bezierArgs);

            if(typeof $.easing[easing] == 'object' && typeof $.easing[easing].get == 'function'){
                $.easing[easing] = $.easing[easing].get;
            }

            if(name && !$.easing[name]){
                $.easing[name] = $.easing[easing];
            }
        }

        return $.easing[easing] || $.easing.swing || $.easing.linear;
    };
    /* End: addEasing */

    /* Begin: rb.events */

    rb.events = {
        _init: function() {
            this.proxyKey = rb.Symbol('_fnProxy');
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

            if(typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production'){
                if(!event.isDefaultPrevented){
                    event.isDefaultPrevented = function(){
                        rb.logError('deprecated');
                    };
                }
            }

            return event;
        },
        dispatch: function(element, type, options){
            const event = this.Event(type, options);
            element.dispatchEvent(event);
            return event;
        },
        proxy: function(fn, type, key, proxy){
            if(!proxy){
                return fn[this.proxyKey] && fn[this.proxyKey][type] && fn[this.proxyKey][type][key];
            }
            if(!fn[this.proxyKey]){
                fn[this.proxyKey] = {};
            }
            if(!fn[this.proxyKey][type]){
                fn[this.proxyKey][type] = {};
            }
            if(!fn[this.proxyKey][type][key]){
                fn[this.proxyKey][type][key] = proxy;
            }
            if(fn != proxy){
                this.proxy(proxy, type, key, proxy);
            }
        },
        _runDelegate: function(event, target, handler, context, args){
            if(!target){return;}

            var ret;
            var oldDelegatedTarget = event.delegatedTarget;
            var oldDelegateTarget = event.delegateTarget;

            event.delegatedTarget = target;
            event.delegateTarget = target;

            ret = handler.apply(context, args);

            event.delegatedTarget = oldDelegatedTarget;
            event.delegateTarget = oldDelegateTarget;

            return ret;
        },
        proxies: {
            closest: function(handler, selector){
                var proxy = rb.events.proxy(handler, 'closest', selector);

                if(!proxy){
                    proxy = function(e){
                        return rb.events._runDelegate(e, e.target.closest(selector), handler, this, arguments);
                    };
                    rb.events.proxy(handler, 'closest', selector, proxy);
                }

                return proxy;
            },
            matches: function(handler, selector){
                var proxy = rb.events.proxy(handler, 'matches', selector);

                if(!proxy){
                    proxy = function(e){
                        return rb.events._runDelegate(e, e.target.matches(selector) ? e.target : null, handler, this, arguments);
                    };
                    rb.events.proxy(handler, 'matches', selector, proxy);
                }

                return proxy;
            },
            keycodes: function(handler, keycodes){
                var keycodesObj;
                var proxy = rb.events.proxy(handler, 'keycodes', keycodes);

                if(!proxy){
                    proxy = function(e){
                        if(!keycodesObj){
                            keycodesObj = keycodes.trim().split(regSplit).reduce(function(obj, value){
                                obj[value] = true;
                                return obj;
                            }, {});
                        }

                        if(keycodesObj[e.keyCode]){
                            return handler.apply(this, arguments);
                        }
                    };
                    rb.events.proxy(handler, 'keycodes', keycodes, proxy);
                }

                return proxy;
            },
            once: function(handler, once, opts, type){
                var proxy = rb.events.proxy(handler, 'once', '');
                if(!proxy){
                    proxy = function(e){
                        var ret = handler.apply(this, arguments);
                        rb.events.remove(e && e.target || this, type, handler, opts);
                        return ret;
                    };
                    rb.events.proxy(handler, 'once', '', proxy);
                }
                return proxy;
            },
        },
        applyProxies: function(handler, opts, type){
            var proxy;
            if(opts){
                for(proxy in opts){
                    if(this.proxies[proxy] && proxy != 'once'){
                        handler = this.proxies[proxy](handler, opts[proxy], opts, type);
                    }
                }

                if('once' in opts){
                    handler = this.proxies.once(handler, opts.once, opts, type);
                }
            }

            return handler;
        },
        special: {},
    };

    rb.events.proxies.delegate = rb.events.proxies.closest;

    [['add', 'addEventListener'], ['remove', 'removeEventListener']].forEach(function(action){
        /**
         *
         * @name rb.event.add
         *
         * @param element
         * @param type
         * @param handler
         * @param opts
         */
        /**
         *
         * @name rb.event.remove
         *
         * @param element
         * @param type
         * @param handler
         * @param opts
         */
        rb.events[action[0]] = function(element, type, handler, opts){
            if(!this.special[type] || this.special[type].applyProxies !== false){
                handler = rb.events.applyProxies(handler, opts, type);
            }
            if(this.special[type]){
                this.special[type][action[0]](element, handler, opts);
            } else {
                const evtOpts = (opts && (opts.capture || opts.passive)) ?
                    {passive: !!opts.passive, capture: !!opts.capture} :
                    false
                ;

                element[action[1]](type, handler, evtOpts);

                if(typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production'){
                    rb.debugHelpers.onEventsAdd(element, type, handler, opts);
                }
            }
        };
    });

    rb.events._init();

    /* End: rb.events */

    /**
     * Sets focus to an element. Note element has to be focusable
     * @memberof rb
     * @type function
     * @param element The element that needs to get focus.
     * @param [delay] {Number} The delay to focus the element.
     */
    rb.setFocus = (function(){
        var element, attempts, abort, focusTimer;
        var scrollableElements = [];
        var regKeyboadElements = /^(?:input|textarea)$/i;
        var btns = {button: 1, submit: 1, reset: 1, image: 1, file: 1};

        var calcScrollableElements = function(){
            var parent = element.parentNode;
            while(parent){
                if(parent.offsetHeight < parent.scrollHeight || parent.offsetWidth < parent.scrollWidth){
                    scrollableElements.push([parent, parent.scrollTop, parent.scrollLeft]);
                }
                parent = parent.parentNode;
            }
            parent = document.scrollingElement;
            scrollableElements.push([parent, parent.scrollTop, parent.scrollLeft]);
        };

        var restoreScrollPosition = function(){
            var i;

            for(i = 0; i < scrollableElements.length; i++){
                scrollableElements[i][0].scrollTop = scrollableElements[i][1];
                scrollableElements[i][0].scrollLeft = scrollableElements[i][2];
            }
            scrollableElements = [];
        };

        var setAbort = function(){
            abort = true;
        };

        var cleanup = function(){
            element = null;
            attempts = 0;
            abort = false;
            document.removeEventListener('focus', setAbort, true);
            if(focusTimer){
                clearTimeout(focusTimer);
                focusTimer = null;
            }
        };

        var doFocus = function () {

            if(!element || abort || attempts > 9){
                cleanup();
            } else if(rb.getStyles(element).visibility != 'hidden' && (element.offsetHeight || element.offsetWidth)){
                rb.isScriptFocus = true;
                rb.$doc.trigger('rbscriptfocus');
                calcScrollableElements();

                if ($.prop(element, 'tabIndex') < 0 && !element.getAttribute('tabindex')) {
                    element.setAttribute('tabindex', '-1');
                    element.classList.add('js' + rb.nameSeparator + 'rb' + rb.nameSeparator + 'scriptfocus');
                }
                try {
                    element.focus();
                } catch (e){
                    //continue
                }
                restoreScrollPosition();
                rb.isScriptFocus = false;
                cleanup();
            } else {
                if(attempts == 2){
                    document.addEventListener('focus', setAbort, true);
                }
                attempts++;
                waitForFocus(150);
            }
        };

        var waitForFocus = function (delay) {
            if (element !== document.activeElement) {
                focusTimer = setTimeout(doFocus, delay || 40);
            }
        };

        return function(givenElement, delay){
            if (givenElement && givenElement !== document.activeElement && element !== givenElement) {
                cleanup();

                element = givenElement;

                if(regKeyboadElements.test(element.nodeName) && !btns[element.type]){
                    doFocus();
                } else {
                    waitForFocus(delay);
                }
            }
        };
    })();

    var cbs = [];
    var setupClick = function () {
        var clickClass = ['js', 'rb', 'click'].join(rb.nameSeparator);
        var clickSel = '.' + clickClass;
        var applyBehavior = function (clickElem, e) {
            var i, len, attr, found;
            for (i = 0, len = cbs.length; i < len; i++) {
                attr = clickElem.getAttribute(cbs[i].attr);

                if (attr != null) {
                    found = true;
                    cbs[i].fn(clickElem, e, attr);
                    break;
                }
            }

            if (!found) {
                clickElem.classList.remove(clickClass);
            }
        };
        setupClick = rb.$.noop;

        document.addEventListener('keydown', function (e) {
            const elem = e.target;
            if ((e.keyCode == 40 || e.keyCode == 32 || e.keyCode == 13) && elem.classList.contains(clickClass)) {
                applyBehavior(elem, e);
            }
        }, true);

        document.addEventListener('change', function (e) {
            const elem = e.target;
            if (elem.classList.contains(clickClass)) {
                applyBehavior(elem, e);
            }
        }, true);

        document.addEventListener('click', function (e) {
            if(e.button){return;}

            var clickElem = e.target.closest(clickSel);

            while (clickElem) {
                applyBehavior(clickElem, e);

                clickElem = clickElem.parentNode;
                if (clickElem && clickElem.closest) {
                    clickElem = clickElem.closest(clickSel);
                }

                if (clickElem && !clickElem.closest) {
                    clickElem = null;
                }
            }

        }, true);

        return clickClass;
    };

    /**
     * Allows to add click listeners for fast event delegation. For elements with the class `js-rb-click` and a data-{name} attribute.
     * @property rb.click.add {Function} add the given name and the function as a delegated click handler.
     * @memberof rb
     * @example
     * //<a class="js-rb-click" data-lightbox="1"></a>
     * rb.click.add('lightbox', function(element, event, attrValue){
	 *
	 * });
     */
    rb.click = {
        cbs: cbs,
        add: function (name, fn) {
            cbs.push({
                attr: 'data-' + name,
                fn: fn,
            });

            if (cbs.length == 1) {
                rb.ready.then(()=>{
                    this.clickClass = setupClick();
                });
            }
        },
    };

    const regNum = /:(\d)+\s*$/;
    const regTarget = /^\s*?\.?([a-z0-9_$]+)\((.*?)\)\s*?/i;
    const regPropTarget = /^@(.+)/;

    /**
     * Returns an array of elements based on a string.
     * @memberof rb
     * @param targetStr {String} Either a whitespace separated list of ids ("foo-1 bar-2"), a jQuery traversal method ("next(.input)"), a DOM property prefixed with a '@' ("@form"), a predefined value (window, document, scrollingElement, scrollingEventObject) or a $$() wrapped selector to search the entire document.
     * @param element {Element} The element that should be used as starting point for the jQuery traversal method.
     * @returns {Element[]}
     */
    rb.getElementsByString = function (targetStr, element) {
        var i, len, target, temp, num, match;

        if (targetStr) {
            if ((num = targetStr.match(regNum))) {
                targetStr = targetStr.replace(num[0], '');
                num = num[1];
            }

            switch (targetStr){
                case 'window':
                    target = [window];
                    break;
                case 'document':
                    target = [document];
                    break;
                case 'scrollingElement':
                    target = [rb.getPageScrollingElement()];
                    break;
                case 'scrollingEventObject':
                    target = [rb.getScrollingEventObject()];
                    break;
                default:
                    if((match = targetStr.match(regPropTarget)) && (match[1] in element)){
                        target = element[match[1]];

                        if('length' in target && !target.nodeType && ((target.length - 1) in target)){
                            target = Array.from(target);
                        } else {
                            target = [target];
                        }

                    } else if ((match = targetStr.match(regTarget))) {

                        if (match[1] == '$' || match[1] == '$$' || match[1] == 'sel') {
                            target = Array.from(document.querySelectorAll(match[2]));
                        } else if ($.fn[match[1]]) {
                            if (!match[2]) {
                                match[2] = null;
                            }
                            target = $(element)[match[1]](match[2]).get();
                        }
                    } else {
                        targetStr = targetStr.split(regSplit);
                        target = [];

                        for (i = 0, len = targetStr.length; i < len; i++) {
                            temp = targetStr[i] && document.getElementById(targetStr[i]);
                            if (temp) {
                                target.push(temp);
                            }
                        }
                    }
                    break;
            }

            if (num && target) {
                target = target[num] ? [target[num]] : [];
            }
        }

        return target || [];
    };

    rb.elementFromStr = rb.getElementsByString;

    /**
     * Parses data-* attributes and returns an object.
     *
     * @memberof rb
     * @param {Element} element
     * @param {Object} [attrsObject]
     * @param {String} [prefix]
     * @param {String} [exclude]
     * @return {Object}
     */
    rb.parseDataAttrs = function(element, attrsObject, prefix, exclude){
        let i, name;
        const attributes = element.attributes;
        const len = attributes.length;

        if(!attrsObject){
            attrsObject = {};
        }

        prefix = prefix ? prefix + '-' : '';

        prefix = 'data-' + prefix;

        for (i = 0; i < len; i++) {
            name = attributes[i].nodeName;
            if (name != exclude && name.startsWith(prefix)) {
                attrsObject[$.camelCase(name.replace(prefix, ''))] = rb.parseValue(attributes[i].nodeValue);
            }
        }

        return attrsObject;
    };

    const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

    /**
     * Returns the descriptor of a property. Moves up the prototype chain to do so.
     *
     * @memberof rb
     * @static
     *
     * @param {Object} object
     * @param {String} name
     * @returns {Object|undefined}
     */
    rb.getPropertyDescriptor = function getPropertyDescriptor(object, name) {
        var proto = object, descriptor;
        if (name in proto) {
            while (proto && !(descriptor = getOwnPropertyDescriptor(proto, name))) {
                proto = Object.getPrototypeOf(proto);
            }
        }
        return descriptor;
    };

})(window, document);

(function (window, document) {
    'use strict';

    let elements, useMutationEvents, liveBatch, initClass, attachedClass, watchCssClass, started;

    const live = {};
    const removeElements = [];
    const rb = window.rb;
    const $ = rb.$;
    const componentExpando = rb.Symbol('_rbComponent');
    const expando = rb.Symbol('_rbCreated');
    const docElem = rb.root;
    const hooksCalled = {};
    const unregisteredFoundHook = {};
    const componentPromises = {};
    const _CssCfgExpando = rb.Symbol('_CssCfgExpando');

    const extendEvents = function(value, args){
        let prop;
        const toMerge = args.shift();

        if(toMerge){
            for(prop in toMerge){
                if(!value[prop]){
                    value[prop] = [];
                }

                if(Array.isArray(toMerge[prop])){
                    value[prop] = toMerge[prop].concat(value[prop]);
                } else {
                    value[prop].unshift(toMerge[prop]);
                }
            }
        }

        if(args.length){
            extendEvents(value, args);
        }

        return value;
    };

    const extendStatics = function (Class, proto, SuperClasss, prop) {
        var value;
        var classObj = SuperClasss[prop] == Class[prop] ? null : Class[prop];

        if(prop == 'events'){
            value = extendEvents({}, [SuperClasss[prop], proto[prop], classObj]);
        } else {
            value = $.extend(true, {}, SuperClasss[prop], proto[prop], classObj);
        }

        Object.defineProperty(Class, prop, {
            configurable: true,
            enumerable: true,
            writable: true,
            value: value,
        });

        if (proto[prop]) {
            Object.defineProperty(proto, prop, {
                configurable: true,
                enumerable: true,
                writable: true,
                value: null,
            });
        }
    };

    let initClickCreate = function () {
        initClickCreate = $.noop;
        rb.click.add('module', function (elem) {
            rb.getComponent(elem);
            rAFQueue(function () {
                elem.classList.remove(rb.click.clickClass);

                if(!elem.classList.contains(attachedClass)){
                    elem.classList.add(initClass);
                    live.searchModules();
                }
            }, true);
            liveBatch.run();
        });
    };

    let initWatchCss = function () {
        initWatchCss = $.noop;
        const elements = document.getElementsByClassName(attachedClass);
        const cssElements = document.getElementsByClassName(watchCssClass);

        rb.checkCssCfgs = function () {
            let i, elem, component;
            let len = elements.length;

            for (i = 0; i < len; i++) {
                elem = elements[i];
                component = elem && elem[componentExpando];

                if (component && component.origName && component.parseOptions && rb.hasComponentCssChanged(elem, component.origName)) {
                    component.parseOptions();
                }
            }

            for (i = 0, len = cssElements.length; i < len; i++) {
                elem = cssElements[i];

                component = elem.getAttribute('data-module');

                if (component && rb.hasComponentCssChanged(elem, component)) {
                    live.import(component, elem, true);
                }
            }
        };

        rb.resize.on(rb.checkCssCfgs);
    };

    const initObserver = function () {
        const removeComponents = (function () {
            let runs, timer;
            let i = 0;

            const main = function () {
                let len, instance, element;
                const start = Date.now();

                for (len = live._attached.length; i < len && Date.now() - start < 3; i++) {
                    element = live._attached[i];

                    if (element && (instance = element[componentExpando]) && !docElem.contains(element)) {
                        element.classList.add(initClass);
                        live.destroyComponent(instance, i, element);

                        i--;
                        len--;
                    }
                }

                if (i < len) {
                    timer = setTimeout(main, 40);
                } else {
                    timer = false;
                }
                runs = false;
            };
            return function () {
                if (!runs) {
                    runs = true;
                    i = 0;
                    if (timer) {
                        clearTimeout(timer);
                    }
                    setTimeout(main, 99);
                }
            };
        })();

        const onMutation = function (mutations) {
            let i, mutation;
            const len = mutations.length;

            for (i = 0; i < len; i++) {
                mutation = mutations[i];
                if (mutation.addedNodes.length) {
                    live.searchModules();
                }
                if (mutation.removedNodes.length) {
                    removeComponents();
                }
            }
        };

        if (!useMutationEvents && window.MutationObserver) {
            new MutationObserver(onMutation)
                .observe(docElem, {subtree: true, childList: true})
            ;
        } else {
            docElem.addEventListener('DOMNodeInserted', live.searchModules);
            document.addEventListener('DOMContentLoaded', live.searchModules);
            docElem.addEventListener('DOMNodeRemoved', (function () {
                const mutation = {
                    addedNodes: [],
                };
                const mutations = [
                    mutation,
                ];
                const run = function () {
                    onMutation(mutations);
                    mutation.removedNodes = false;
                };
                return function (e) {
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

    const createBatch = function () {
        let runs;
        const batch = [];
        const run = function () {
            while (batch.length) {
                batch.shift()();
            }
            runs = false;
        };
        return {
            run: run,
            add: function (fn) {
                batch.push(fn);
            },
            timedRun: function () {
                if (!runs) {
                    runs = true;
                    setTimeout(run);
                }
            },
        };
    };

    const extendOptions = function(obj){
        if(obj){
            ['statePrefix', 'utilPrefix', 'jsPrefix', 'nameSeparator', 'elementSeparator', 'attrSel'].forEach(function(prefixName){
                if(prefixName in obj && typeof obj[prefixName] == 'string') {
                    rb[prefixName] = obj[prefixName];
                }
            });
        }
    };

    let mainInit = function(){

        window.removeEventListener('click', mainInit, true);
        mainInit = false;

        extendOptions(rb.cssConfig);

        initClass = ['js', 'rb', 'live'].join(rb.nameSeparator);
        attachedClass = ['js', 'rb', 'attached'].join(rb.nameSeparator);
        watchCssClass = ['js', 'rb', 'watchcss'].join(rb.nameSeparator);

        elements = document.getElementsByClassName(initClass);

        initObserver();

        initClickCreate();

        initWatchCss();

        rb.ready.resolve();
    };

    rb._extendEvts = extendEvents;

    rb.ready = deferred();

    rb.live = live;

    live.autoStart = true;

    live.expando = expando;
    live.componentExpando = componentExpando;

    live._failed = {};

    /**
     * List of all component classes registered by `rb.live.register`.
     * @memberof rb
     * @type {{}}
     */
    rb.components = {};
    live._attached = [];
    live.customElements = false;

    live.init = function (options) {
        if (started) {
            return;
        }

        started = true;

        if (options) {
            useMutationEvents = options.useMutationEvents || false;

            extendOptions(options);
        }

        if(mainInit){
            window.addEventListener('click', mainInit, true);
        }

        liveBatch = createBatch();

        live.searchModules._rbUnthrotteled();
    };


    /**
     * Registers a component class with a name and manages its livecycle. An instance of this class will be automatically constructed with the found element as the first argument. If the class has an `attached` or `detached` instance method these methods also will be invoked, if the element is removed or added from/to the DOM. In most cases the given class inherits from [`rb.Component`]{@link rb.Component}. All component classes are added to the `rb.components` namespace.
     *
     * The DOM element/markup of a component class must have a `data-module` attribute with the name as its value. The `data-module` is split by a "/" and only the last part is used as the component name. The part before can be optionally used for [`rb.live.addImportHook`]{@link rb.live.addImportHook}.
     *
     * Usually the element should also have the class `js-rb-live` to make sure it is constructed as soon as it is attached to the document. If the component element has the class `js-rb-click` instead it will be constructed on first click.
     *
     * @memberof rb
     * @param {String} name The name of your component.
     * @param Class {Class} The Component class for your component.
     *
     * @return Class {Class}
     *
     * @example
     * class MyButton {
	 *      constructor(element){
	 *
	 *      }
	 * }
     *
     * //<button class="js-rb-live" data-module="my-button"></button>
     * rb.live.register('my-button', MyButton);
     *
     * @example
     * class Time {
	 *      constructor(element, _initialDefaultOpts){
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
     * //<span class="js-rb-live" data-module="time"></span>
     * rb.live.register('time', Time);
     *
     */
    live.register = function (name, Class, extend) {
        const proto = Class.prototype;
        const superProto = Object.getPrototypeOf(proto);
        const superClass = superProto.constructor;
        const isRbComponent = proto instanceof rb.Component;

        if (isRbComponent) {
            extendStatics(Class, proto, superClass, 'defaults');
            extendStatics(Class, proto, superClass, 'events');

            if (!proto.hasOwnProperty('name')) {
                proto.name = name;
            }
        }


        if (rb.components[name] && !extend) {
            rb.log(name + ' already exists.');
        }

        rb.components[name] = Class;

        if(typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production'){
            rb.debugHelpers.onRegisterComponent(name, Class);
        }

        if(componentPromises[name]){
            componentPromises[name].resolve(Class);
        }

        if (elements && name.charAt(0) != '_') {
            live.searchModules();
        }

        return Class;
    };



    /**
     * Allows to add import callbacks for not yet registered components. The importCallback is only called once per component class name. The names parameter is either the component name or '*' as a wildcard. In case names is an array of strings these are treated as aliases for the same module. (rb-plugins/rb_packageloader automatically adds a wildcard hook.) If only importCallback is passed it will be also treated as a wildcard.
     *
     * There can be only one importHook for a module name.
     *
     * @memberof rb
     *
     * @param {String|String[]} [names] Component name or Component names/aliases for the module.
     * @param {Function} importCallback Callback that should import/require the module.
     *
     * @example
     * //create a short cut.
     * var addImportHook = rb.live.addImportHook;
     *
     * addImportHook('slider', function(moduleName, moduleAttributeValue, reject, element){
	 *      //non-standard futuristic import
	 *      System.import('./components/slider-v2').catch(reject);
	 * });
     *
     * //Add component class with different aliases
     * addImportHook(['accordion', 'tabs', 'panelgroup'], function(){
	 *      //webpack require
	 *      require.ensure([], function(require){
	 *          require('./components/panelgroups/index');
	 *      });
	 * });
     *
     * //Multiple component aliases with multiple modules
     * addImportHook(['accordion', 'tabs', 'panelgroup', 'slider'], function(){
	 *      //AMD or webpack require
	 *      require(['./components/slider', './components/panelgroup', './components/panel']);
	 * });
     *
     * //dynamic catch all hook
     * addImportHook(function(moduleName, moduleAttributeValue){
	 *      //AMD or webpack require
	 *      require(['./components/' + moduleAttributeValue]);
	 * });
     */
    live.addImportHook = function (names, importCallback) {
        const add = function (name) {
            if (unregisteredFoundHook[name]) {
                rb.log('overrides ' + name + ' import hook', names, importCallback);
            }
            unregisteredFoundHook[name] = importCallback;
        };

        if (typeof names == 'function') {
            importCallback = names;
            names = '*';
        }
        if (Array.isArray(names)) {
            names.forEach(add);
        } else {
            add(names);
        }
    };

    live.import = function(moduleId, element, lazy){
        const hook = (unregisteredFoundHook[moduleId] || unregisteredFoundHook['*']);


        if(!componentPromises[moduleId] && (hook || rb.components[moduleId])){
            componentPromises[moduleId] = deferred();

            if(rb.components[moduleId]){
                componentPromises[moduleId].resolve();
            }
        }

        if (!rb.components[moduleId] && hook) {
            if(!hooksCalled[moduleId]){
                let cssConfig = element && lazy && rb.parseComponentCss(element, moduleId);

                if(cssConfig && cssConfig.switchedOff){
                    if(!element.classList.contains(watchCssClass)){
                        rAFQueue(function () {
                            element.classList.add(watchCssClass);
                        }, true);
                    }
                } else {
                    hooksCalled[moduleId] = true;
                    hook(moduleId, moduleId, function() {
                        live._failed[moduleId] = true;
                        componentPromises[moduleId].reject();
                    });
                }
            }
        } else {
            live._failed[moduleId] = true;
        }

        return componentPromises[moduleId];
    };
    /**
     * Constructs a component class with the given element. Also attaches the attached classes and calls optionally the `attached` callback method. This method is normally only used automatically/internally by the mutation observer.
     *
     * @memberof rb
     * @see rb.getComponent
     *
     * @param element
     * @param liveClass
     * @returns {Object}
     */
    live.create = function (element, liveClass, initialOpts) {
        let instance;

        if (mainInit) {
            mainInit();
        }

        if (!(instance = element[componentExpando])) {
            instance = new liveClass(element, initialOpts);
            element[componentExpando] = instance;
        }

        rAFQueue(function () {
            element.classList.add(attachedClass);
            element.classList.remove(watchCssClass);
        }, true);

        if (!element[expando] && instance && (instance.attached || instance.detached)) {

            if (live._attached.indexOf(element) == -1) {
                live._attached.push(element);
            }
            if (instance.attached) {
                liveBatch.add(function () {
                    instance.attached();
                });
            }

            liveBatch.timedRun();
        }
        element[expando] = true;
        instance._created = true;

        return instance;
    };

    live.searchModules = (function () {
        var removeInitClass = rb.rAF(function () {
            while (removeElements.length) {
                removeElements.shift().classList.remove(initClass);
            }
        });
        var failed = function (element, id) {
            live._failed[id] = true;
            removeElements.push(element);
            rb.logError('failed', id, element);
        };

        var findElements = throttle(function () {
            let element, moduleId, i, componentPromise, len;

            if(mainInit){
                mainInit();
            }

            len = elements.length;

            if (!len) {
                return;
            }

            if(typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production'){
                rb.debugHelpers.onSearchElementsStart();
            }

            for (i = 0; i < len; i++) {
                element = elements[i];

                if (element[expando]) {
                    removeElements.push(element);
                    continue;
                }

                moduleId = element.getAttribute('data-module') || '';

                if (!rb.components[moduleId]) {
                    componentPromise = live.import(moduleId, element, true);
                }

                if (rb.components[moduleId]) {
                    live.create(element, rb.components[moduleId]);
                    removeElements.push(element);
                }
                else if (live._failed[moduleId]) {
                    failed(element, moduleId);
                }
                else if(!componentPromise) {
                    failed(element, moduleId);
                }
            }

            if(typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production'){
                rb.debugHelpers.onSearchElementsEnd(len);
            }

            removeInitClass();
            liveBatch.run();
        }, {delay: 50, read: true});

        return findElements;
    })();

    live.destroyComponent = function (instance, index, element) {

        if (!element) {
            element = instance.element;
        }

        if (index == null) {
            index = live._attached.indexOf(element);
        }
        element.classList.remove(attachedClass);

        if (element[expando]) {
            delete element[expando];
        }
        if (instance.detached) {
            instance.detached(element, instance);
        }

        live._attached.splice(index, 1);
    };

    rb.hasComponentCssChanged = function(element, _name){
        return rb.hasPseudoChanged(element, _CssCfgExpando);
    };

    rb.parseComponentCss = function(element, _name){
        return rb.parsePseudo(element, _CssCfgExpando) || null;
    };

    return live;
})(window, document);

(function (window, document, live, _undefined) {
    'use strict';

    const rb = window.rb;
    const $ = rb.$;
    const componentExpando = live.componentExpando;
    const regHTMLSel = /\.{(htmlName|name)}(.+?)(?=(\s|$|\+|\)|\(|\[|]|>|<|~|\{|}|,|'|"|:))/g;
    const regName = /\{name}/g;
    const regJsName = /\{jsName}/g;
    const regHtmlName = /\{htmlName}/g;
    const regnameSeparator = /\{-}/g;
    const regElementSeparator = /\{e}/g;
    const regUtilPrefix = /\{u}/g;
    const regStatePrefix = /\{is}/g;
    const handlerOptionsSymbol = rb.Symbol('handlerOptions');

    const _setupEventsByEvtObj = function (that) {
        var eventsObjs, evt, oldCallbacks;
        var delegateEvents = [];
        var evts = that.constructor.events;



        for (evt in evts) {

            if(that.replaceEventKey){
                evt = that.replaceEventKey(evt);
            }

            eventsObjs = rb.parseEventString(evt);

            /* jshint loopfunc: true */
            (function (eventsObjs, methods) {
                var handler = function(){
                    if(that.options.switchedOff && !handler[handlerOptionsSymbol].neverSwitchOff){return;}

                    var i = 0;
                    var args = Array.from(arguments);

                    var runSuper = function(){
                        var method = methods[i];

                        if(typeof method == 'string'){
                            method = that[method];
                        }

                        i++;

                        if(typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production'){
                            if(!method){
                                rb.logInfo('no super event handler', that, args);
                            }
                        }

                        return method ? method.apply(that, args) : null;
                    };

                    args.push(runSuper);

                    return runSuper();
                };

                eventsObjs.forEach(function(eventObj){
                    var prop, eventName;
                    var opts = {};
                    eventName = that.interpolateName(eventObj.event, true);

                    for(prop in eventObj.opts){
                        opts[prop] = that.interpolateName(eventObj.opts[prop]);
                    }

                    handler[handlerOptionsSymbol] = opts;

                    if(!opts['@']){
                        rb.events.add(that.element, eventName, handler, opts);
                    } else {
                        delegateEvents.push([null, eventName, handler, opts]);
                    }
                });
            })(eventsObjs, evts[evt]);
        }

        if(delegateEvents.length){
            oldCallbacks = {
                attached: that.attached,
                detached: that.detached,
            };

            [['attached', 'add'], ['detached', 'remove']].forEach(function(descriptor){
                that[descriptor[0]] = function(){
                    var i, len, opts;

                    for(i = 0, len = delegateEvents.length; i < len; i++){
                        opts = delegateEvents[i][3];

                        if(!delegateEvents[i][0]){
                            delegateEvents[i][0] = that.getElementsByString(opts['@']) || delegateEvents[i][0];

                            if(delegateEvents[i][0] && delegateEvents[i][0].length < 2){
                                delegateEvents[i][0] = delegateEvents[i][0][0];
                            }
                        }

                        if(delegateEvents[i][0]){
                            if(Array.isArray(delegateEvents[i][0])){
                                delegateEvents[i][0].forEach(function(elem) { // eslint-disable-line no-loop-func
                                    rb.events[descriptor[1]](elem, delegateEvents[i][1], delegateEvents[i][2], opts);
                                });
                            } else {
                                rb.events[descriptor[1]](delegateEvents[i][0], delegateEvents[i][1], delegateEvents[i][2], opts);
                            }
                        } else {
                            rb.logInfo('element not found', opts['@'], that);
                        }

                        if(descriptor[0] == 'remove'){
                            delegateEvents[i][0] = null;
                        }
                    }

                    if(oldCallbacks[descriptor[0]]){
                        return oldCallbacks[descriptor[0]].apply(this, arguments);
                    }
                };
            });
        }
    };

    const replaceHTMLSel = rb.memoize((function(){
        const replacer = function(full, f1, f2){
            return '[' + rb.attrSel + '~="{htmlName}' + f2 +'"]';
        };
        return function(str){
            return str.replace(regHTMLSel, replacer);
        };
    })(), true);

    rb.parseEventString = rb.memoize(function(eventStr){
        var i, len, data, opts, char;
        var events = [];

        var mode = 1;

        var optsName = '';
        var optsValue = '';
        var openingCount = 0;
        var selector = '';

        for(i = 0, len = eventStr.length; i < len; i++){
            char = eventStr[i];

            if(!data){
                data = {
                    event: '',
                    opts: {},
                };
                opts = data.opts;
            }

            if(mode != 3 && mode != 4 && char == ','){
                events.push(data);
                if(mode == 2){
                    opts[optsName] = optsValue  || ' ';
                    optsName = '';
                    optsValue = '';
                }

                if(!data.event && opts.event){
                    data.event = opts.event;
                }

                data = null;
                mode = 1;
                continue;
            }

            if(mode == 1){
                if(char == ':'){
                    mode = 2;

                } else if(data.event && char == ' '){
                    mode = 4;
                } else if(char != ' ') {
                    data.event += char;
                }
            } else if(mode == 2){
                if(char == '('){
                    mode = 3;
                    openingCount++;
                } else if(char == ':'){
                    if(optsName){
                        opts[optsName] = ' ';
                        optsName = '';
                    }
                } else if(char == ' '){
                    mode = 4;
                } else {
                    optsName += char;
                }
            } else if(mode == 3){
                if(char == '('){
                    openingCount++;
                } else  if(char == ')'){
                    openingCount--;

                    if(!openingCount){
                        opts[optsName] = optsValue || ' ';
                        optsName = '';
                        optsValue = '';
                        mode = 2;
                        continue;
                    }
                }

                optsValue += char;
            } else if(mode == 4){
                selector += char;
            }
        }

        if(data){
            events.push(data);

            if(optsName){
                opts[optsName] = optsValue || ' ';
            }

            if(!data.event && opts.event){
                data.event = opts.event;
            }

            if(selector){
                for(i = 0, len = events.length; i < len; i++){
                    if(!events[i].opts.closest){
                        events[i].opts.closest = selector;
                    }
                }
            }
        }

        return events;
    }, true);

    /**
     * returns the component instance of an element. If the component is not yet initialized it will be initialized.
     *
     * @memberof rb
     * @param {Element} element - DOM element
     * @param {String} [componentName] - optional name of the component (if component isn't created yet and the element has no `data-module="componentName"`).
     * @param {Object} [initialOpts] - only use if component is not created otherwise use `setOption`/`setOptions`
     * @returns {Object} A component instance
     */
    rb.getComponent = function (element, componentName, initialOpts) {
        var component = element && element[componentExpando];

        if (!component && element) {

            if (!componentName) {
                componentName = element.getAttribute('data-module') || '';
            }

            if (rb.components[componentName]) {
                component = live.create(element, rb.components[componentName], initialOpts);
            }
        }

        if(!component){
            if(componentName){
                live.import(componentName);
            }
            rb.logInfo('component not found', element, componentName);
        }
        return component || null;
    };

    live.getComponent = rb.getComponent;


    /**
     * Component Base Class - all UI components should extend this class. This Class adds some neat stuff to parse/change options (is automatically done in constructor), listen and trigger events, react to responsive state changes and establish BEM style classes as also a11y focus management.
     *
     * For the live cycle features see [rb.live.register]{@link rb.live.register}.
     *
     * @alias rb.Component
     *
     * @param element
     * @param [initialDefaults] {Object}
     *
     * @example
     * //<div class="js-rb-live" data-module="my-module"></div>
     * rb.live.register('my-component', class MyComponent extends rb.Component {
     *      static get defaults(){
     *          return {
     *              className: 'toggle-class',
     *          };
     *      }
     *
     *      static get events(){
     *          return {
     *              'click:closest(.change-btn)': 'changeClass',
     *          };
     *      }
     *
     *      constructor(element, initialDefaults){
     *          super(element, initialDefaults);
     *          this.rAFs('changeClass');
     *      }
     *
     *      changeClass(){
     *          this.$element.toggleClass(this.options.className);
     *      }
     * });
     */
    class Component  {

        constructor(element, initialDefaults){

            const origName = this.name;

            /**
             * Reference to the main element.
             * @type {Element}
             */
            this.element = element;
            this.$element = $(element);

            /**
             * Current options object constructed by defaults and overriding markup/CSS.
             * @type {{}}
             */
            this.options = {};

            this._initialDefaults = initialDefaults;
            this._stickyOpts = {};
            element[componentExpando] = this;

            this.origName = origName;

            this.parseOptions(this.options);

            this.name = this.options.name || rb.jsPrefix + origName;
            this.jsName = this.options.jsName || origName;

            this._evtName = this.jsName + 'changed';
            this._beforeEvtName = this.jsName + 'change';

            addLog(this, this.options.debug == null ? rb.isDebug : this.options.debug);

            /**
             * Template function or hash of template functions to be used with `this.render`. On instantiation the `rb.template['nameOfComponent']` is referenced.
             * @type {Function|{}}
             */
            this.templates = rb.templates[this.jsName] || rb.templates[origName] || {};

            this.beforeConstruct();

            _setupEventsByEvtObj(this);
        }

        beforeConstruct(){}

        /**
         * Returns the component of an element. If a string is used, uses `this.getElementsByString` or `this.query` to get the element.
         *
         * @param element {Element|String}
         * @param [moduleName] {String}
         * @param [initialOpts] {Object}
         */
        component(element, moduleName, initialOpts){
            if(typeof element == 'string'){
                element = this.interpolateName(element);
                element = rb.getElementsByString(element, this.element)[0] || this.query(element);
            }

            return rb.getComponent(element, moduleName, initialOpts);
        }

        rAFs(){
            return rb.rAFs(this, ...arguments);
        }

        /**
         * returns the id of an element, if no id exist generates one for the element
         * @param {Element} [element], if no element is given. the component element is used.
         * @param {Boolean} [async=true], sets the id async in a rAF
         * @returns {String} id
         */
        getId(element, async) {
            let id;

            if(typeof element == 'boolean'){
                async = element;
                element = null;
            }

            if (!element) {
                element = this.element;
            }

            if(async == null){
                async = true;
            }

            if (!(id = element.id)) {
                id = 'js' + rb.nameSeparator + getId();
                if(async){
                    rAFQueue(()=> {
                        element.id = id;
                    }, true);
                } else {
                    element.id = id;
                }
            }

            return id;
        }

        /**
         * Dispatches an event on the component element and returns the Event object.
         * @param [type='changed'] {String|Object} The event.type that should be created. If no type is given the name 'changed' is used. Automatically prefixes the type with the name of the component. If an opbject is passed this will be used as the `event.detail` property.
         * @param [detail] {Object} The value for the event.detail property to transport event related information.
         * @returns {Event}
         */
        trigger(type, detail) {
            let opts;

            if (typeof type == 'object') {
                detail = type;
                type = detail.type;
            }

            if (type == null) {
                type = this._evtName;
            } else if (!type.startsWith(this.jsName)) {
                type = this.jsName + type;
            }

            opts = {detail: detail || {}};

            if(detail){
                if('bubbles' in detail){
                    opts.bubbles = detail.bubbles;
                }
                if('cancelable' in detail){
                    opts.cancelable = detail.cancelable;
                }
            }

            return rb.events.dispatch(this.element, type, opts);
        }

        /**
         * Dispatches an event on the component element at the next rAF.
         *
         * @see rb.Component.prototype.trigger
         */
        triggerRaf(){
            rAFQueue(() => {
                this.trigger(...arguments);
            }, true);
        }

        /**
         * Uses [`rb.getElementsByString`]{@link rb.getElementsByString} with this.element as the element argument and interpolates string using `this.interpolateName`.
         * @param {String} string
         * @param {Element} [element=this.element]
         * @returns {Element[]}
         */
        getElementsByString(string, element) {
            return rb.getElementsByString(this.interpolateName(string), element || this.element);
        }

        _trigger(){
            this.logInfo('_trigger is deprecated use trigger instead');
            return this.trigger.apply(this, arguments);
        }

        /*
         * shortcut to [`rb.setFocus`]{@link rb.setFocus}
         * @borrows rb.setFocus as setFocus
         */
        setFocus(){
            return rb.setFocus(...arguments);
        }

        /**
         * Interpolates {name}, {jsName} and {htmlName} to the name of the component. Helps to generate BEM-style Class-Structure.
         * @param {String} str
         * @param {Boolean} [isJs=false]
         * @returns {string}
         *
         * @example
         * //assume the name of the component is dialog
         * this.interpolateName('.{name}__button'); //return '.dialog__button'
         */
        interpolateName(str, isJs) {

            if(!isJs && rb.attrSel){
                str = replaceHTMLSel(str);
            }

            return str
                .replace(regName, isJs ? this.jsName : this.name)
                .replace(regJsName, this.jsName)
                .replace(regHtmlName, this.name)
                .replace(regnameSeparator, rb.nameSeparator)
                .replace(regElementSeparator, rb.elementSeparator)
                .replace(regUtilPrefix, rb.utilPrefix)
                .replace(regStatePrefix, rb.statePrefix)
                ;
        }

        /**
         * Returns first matched element. Interpolates selector with `interpolateName`.
         * @param {String} selector
         * @param {Element} [context=this.element]
         * @returns {Element}
         */
        query(selector, context) {
            return (context || this.element).querySelector(this.interpolateName(selector));
        }

        _qSA(selector, context){
            return (context || this.element).querySelectorAll(this.interpolateName(selector));
        }

        /**
         * Returns Array of matched elements. Interpolates selector with `interpolateName`.
         * @param {String} selector
         * @param {Element} [context=this.element]
         * @returns {Element[]}
         */
        queryAll(selector, context) {
            return Array.from(this._qSA(selector, context));
        }

        /**
         * Returns jQuery list of matched elements. Interpolates selector with `interpolateName`.
         * @param {String} selector
         * @param {Element} [context=this.element]
         * @returns {jQueryfiedNodeList}
         */
        $queryAll(selector, context) {
            return $(this._qSA(selector, context));
        }

        /*
         * Parses the Options from HTML (data-* attributes) and CSS using rb.parsePseudo. This function is automatically invoked by the init/constructor.
         * @param opts
         * @param initialOpts
         */
        parseOptions(opts) {
            const options = $.extend(true, opts || {}, this.constructor.defaults, this._initialDefaults, rb.parseComponentCss(this.element, this.origName), this.parseHTMLOptions(), this._stickyOpts);
            this.setOptions(options);
        }

        /*
         * Sets mutltiple options at once.
         * @param opts
         */
        setOptions(opts, isSticky) {

            if(opts !== this.options){
                let oldValue, newValue;

                for (var prop in opts) {
                    newValue = opts[prop];
                    oldValue = this.options[prop];

                    if (newValue !== oldValue &&
                        (!oldValue || typeof newValue != 'object' || typeof oldValue != 'object' ||
                        JSON.stringify(newValue) != JSON.stringify(oldValue))) {
                        this.setOption(prop, newValue, isSticky);
                    }
                }
            }
        }

        /**
         * Sets an option. The function should be extended to react to dynamic option changes after instantiation.
         * @param name {String} Name of the option.
         * @param value {*} Value of the option.
         * @param isSticky=false {boolean} Whether the option can't be overwritten with CSS option.
         *
         * @example
         * class MyComponent extends rb.Component {
         *      setOptions(name, value, isSticky){
         *          super.setOption(name, value, isSticky);
         *
         *          if(name == 'foo'){
         *              this.updateFoo();
         *          }
         *      }
         * }
         */
        setOption(name, value, isSticky) {
            this.options[name] = value;

            if(isSticky){
                this._stickyOpts[name] = value;
            }

            if (name == 'debug') {
                this.isDebug = value;
            } else if ((name == 'name' || name == 'jsName') && this.name && this.jsName && this.logWarn) {
                this.logWarn('don\'t change name after init.');
            }
        }

        /**
         * Convenient method to render a template. Expects a template function with the given name added to the templates hash property of the component. The data will be extended with the name of the component.
         * @param {String} [name]
         * @param {Object} data
         * @returns {String}
         *
         * @example
         * //sources/_templates/my-component/main.ejs:
         *
         * //<div class="rb-<%= component %>">
         * //    <h1 class="<%= component %>-header">
         * //        <%- title ->
         * //    </h1>
         * //</div>
         *
         * //require('sources/js/_templates/my-component.js');
         *
         * rb.live.register('my-component', class MyComponent extends rb.Component {
         *      renderMain(){
         *          this.element.innerHTML = this.render('main', {title: 'foo'});
         *      }
         * });
         */
        render(name, data) {
            if (typeof name == 'object') {
                data = name;
                name = '';
            }
            if (!data.name) {
                data.name = this.name;
            }

            if (!data.component) {
                data.component = this.component;
            }

            return this.templates[name] ?
                this.templates[name](data) :
                (!name && typeof this.templates == 'function') ?
                    this.templates(data) :
                    ''
                ;
        }

        /*
         * parses the HTML options (data-*) of a given Element. This method is automatically invoked by the constructor or in case of a CSS option change.
         * @returns {{}}
         */
        parseHTMLOptions(_element) {
            if(_element){
                rb.logError('use `rb.parseDataAttrs` instead of parseHTMLOptions.');
                return {};
            }

            const element = this.element;
            const mainOptions = 'data-' + this.origName + '-options';
            const options = rb.jsonParse(element.getAttribute(mainOptions)) || {};

            return rb.parseDataAttrs(element, options, this.origName, mainOptions);
        }

        destroy() {
            live.destroyComponent(this);
        }

        /**
         * Passes args to `console.log` if isDebug option is `true.
         * @param {...*} args
         */
        log() {

        }
    }

    Object.assign(Component, {
        /**
         * defaults Object, represent the default options of the component.
         * While a parsed option can be of any type, it is recommended to only use immutable values as defaults.
         *
         * @static
         * @memberOf rb.Component
         *
         * @see rb.Component.prototype.setOption
         *
         * @prop {Boolean} defaults.debug=rb.isDebug If `true` log method wirtes into console. Inherits from `rb.isDebug`.
         * @prop {String|undefined} defaults.name=undefined Overrides the name of the component, which is used for class names by `interpolateName` and its dependent methods.
         * @prop {Boolean} defaults.jsName=undefined Overrides the jsName of the component, which is used for events by `interpolateName` and its dependent methods.
         *
         * @example
         * <!-- overriding defaults with markup -->
         * <div data-module="mymodule" data-mymodule-options='{"fooBar": false, "baz": true}'></div>
         * <div data-module="mymodule" data-mymodule-foo-bar="false" data-mymodule-baz="true"></div>
         *
         * @example
         *
         * //creating a new component with different defaults:
         * rb.live.register('special-accordion', class SpecialAccordion extends rb.components.accordion {
         *      static get defaults(){
         *          return {
         *              multiple: true,
         *          };
         *      }
         * });
         *
         * //overriding defaults (before initialization for all instances) with JS
         * rb.components.accordion.defaults.multiple = true;
         *
         * //overriding defaults (after initialization for one instance) with JS
         * var accordion = rb.getComponent(accordionElement);
         * accordion.setOption('multiple', true);
         *
         * @example
         * //overriding defaults using Sass
         * .rb-accordion {
         *      (at)include rb-js-export((
         *          multiple: false
         *      ));
         * }
         *
         * //also works responsive:
         * (at)media (max-width: 800px) {
         *   .rb-accordion {
         *      (at)include rb-js-export((
         *          multiple: false
         *      ));
         *   }
         * }
         *
         */
        defaults: {
            debug: null,
            switchedOff: false,
            name: '',
            jsName: '',
        },

        /**
         * Events object can be used to specify events, that will be bound to the component element.
         *
         * The key specifies the event type and optional a selector (separated by a whitespace) for event delegation. The key will be interpolated with [`this.interpolateName`]{@link rb.Component#interpolateName}.
         *
         * The key also allows comma separated multiple events as also modifiers (`'event1,event2:modifier()'`). As modifier `"event:capture()"`, `"event:keycodes(13 32)"`, `"event:matches(.selector)"` and `"event:closest(.selector)"` (alias for `"event .selector"`) are known. The delegated element is available through the `delegatedTarget` property.
         *
         * The value is either a string representing the name of a component method or a function reference. The function is always executed in context of the component.
         *
         * @static
         * @memberOf rb.Component
         *
         * @example
         *
         * class MyComponent extends rb.Component {
         *      constructor(element, initialDefaults){
         *          super(element, initialDefaults);
         *          this.child = this.query('.{name}__close-button');
         *
         *          rb.rAFs(this, 'setLayout');
         *      }
         *
         *      static get events(){
         *          return {
         *              'mouseenter': '_onInteraction',
         *              'click .{name}__close-button': 'close',
         *              'focus:capture():matches(input, select)': '_onFocus',
         *              'mouseenter:capture():matches(.teaser)': '_delegatedMouseenter',
         *              'keypress:keycodes(13 32):matches(.ok-btn)': '_ok',
         *              'click:closest(.ok-btn)': '_ok',
         *              'submit:@(closest(form))': '_submit',
         *          }
         *      }
         * }
         */
        events: {},

        register: live.register,
        $: $,
    });

    Component.prototype.getElementsFromString = Component.prototype.getElementsByString;

    rb.Component = Component;



})(window, document, rb.live);

export const Component = rb.Component;

export default window.rb;


