(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', 'babel-runtime/helpers/typeof'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('babel-runtime/helpers/typeof'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global._typeof);
        global.rb_layoutobserve = mod.exports;
    }
})(this, function (module, _typeof2) {
    'use strict';

    var _typeof3 = _interopRequireDefault(_typeof2);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    (function (factory) {
        if ((typeof module === 'undefined' ? 'undefined' : (0, _typeof3.default)(module)) === 'object' && module.exports) {
            module.exports = factory();
        } else {
            factory();
        }
    })(function () {
        'use strict';
        /* jshint eqnull: true */

        var observeClass, observedElements;
        var rb = window.rb;
        var $ = rb.$;
        var elementIndex = 0;
        var resumeElementIndex = 0;
        var isInstalled = false;
        var layoutObserveProp = rb.Symbol('layoutObserve');
        var rbRic = rb.rIC;

        var timedOutCheck = function timedOutCheck() {
            rbRic(resumeCheckElements);
        };

        var rIC = function rIC() {
            rb.rAFQueue(timedOutCheck, true);
        };

        var resumeCheckElements = function resumeCheckElements() {
            if (resumeElementIndex == elementIndex) {
                checkElements();
            }
        };
        var checkElements = function checkElements(e) {
            var element, start, observer, event;
            var length = observedElements.length;

            for (; elementIndex < length; elementIndex++) {
                element = observedElements[elementIndex];

                if (element) {

                    if (!(observer = element[layoutObserveProp])) {
                        /* jshint loopfunc: true */
                        rb.rAFQueue(function () {
                            // eslint-disable-line no-loop-func
                            element.classList.remove(observeClass);
                        }, true);
                        continue;
                    }

                    event = [{ target: element, type: 'rb_layoutchange', originalEvent: e }];

                    observer.cbs.fireWith(element, event);

                    if (!start) {
                        start = Date.now();
                    } else if (Date.now() - start > 3) {
                        elementIndex++;
                        resumeElementIndex = elementIndex;
                        rIC();
                        return;
                    }
                }
            }

            elementIndex = 0;
        };

        var throtteledCheckElements = rb.throttle(function (e) {
            elementIndex = 0;
            checkElements(e);
        }, { read: true, delay: 450 });

        var addEvents = function addEvents() {
            if (isInstalled) {
                return;
            }
            isInstalled = true;

            observeClass = ['js', 'rb', 'layoutobserve'].join(rb.nameSeparator);
            observedElements = document.getElementsByClassName(observeClass);

            window.addEventListener('scroll', throtteledCheckElements, true);
            rb.resize.on(throtteledCheckElements);

            if (window.MutationObserver) {
                new MutationObserver(throtteledCheckElements).observe(rb.root, { childList: true, subtree: true, attributes: true });
            } else {
                rb.root.addEventListener('DOMNodeInserted', throtteledCheckElements, true);
                rb.root.addEventListener('DOMAttrModified', throtteledCheckElements, true);
                setInterval(throtteledCheckElements, 999);
            }

            window.addEventListener('hashchange', throtteledCheckElements, true);

            ['focus', 'click', 'mouseover', 'load', 'transitionend', 'animationend', 'webkitAnimationEnd'].forEach(function (name) {
                document.addEventListener(name, throtteledCheckElements, true);
            });
        };

        rb.events.special.rb_layoutchange = {
            add: function add(elem, fn, _opts) {
                var observer = elem[layoutObserveProp];

                if (!observer) {
                    observer = {
                        cbs: $.Callbacks()
                    };

                    elem[layoutObserveProp] = observer;

                    rb.rAFQueue(function () {
                        elem.classList.add(observeClass);
                    }, true);

                    addEvents();
                }

                observer.cbs.add(fn);
            },
            remove: function remove(elem, fn, _opts) {
                var observer = elem[layoutObserveProp];

                if (!observer) {
                    return;
                }

                observer.cbs.remove(fn);

                if (!observer.cbs.has()) {
                    delete elem[layoutObserveProp];
                    rb.rAFQueue(function () {
                        elem.classList.remove(observeClass);
                    }, true);
                }
            }
        };

        rb.events.special.rb_layoutobserve = rb.events.special.rb_layoutchange;

        return rb.events.special.rb_layoutchange;
    });
});
