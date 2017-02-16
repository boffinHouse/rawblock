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
        global.layoutobserve = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var observeClass = void 0,
        observedElements = void 0;

    var rb = window.rb;
    var $ = rb.$;
    var layoutObserveProp = rb.Symbol('layoutObserve');
    var rbRic = rb.rIC;

    var isInstalled = false;
    var resumeElementIndex = 0;
    var elementIndex = 0;

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
        var element = void 0,
            start = void 0,
            observer = void 0,
            event = void 0;
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
    }, { read: true, delay: 400 });

    var addEvents = function addEvents() {
        if (isInstalled) {
            return;
        }
        isInstalled = true;

        observeClass = ['js', 'rb', 'layoutobserve'].join(rb.cssConfig.nameSeparator || rb.nameSeparator);
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

    rb.events.special.rb_layoutchange = rb.events.special.rb_layoutchange || {
        add: function add(elem, fn, _opts) {
            var observer = elem[layoutObserveProp];

            if (!observer) {
                observer = {
                    cbs: $.Callbacks()
                };

                elem[layoutObserveProp] = observer;

                addEvents();

                rb.rAFQueue(function () {
                    elem.classList.add(observeClass);
                }, true);
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

    exports.default = rb.events.special.rb_layoutchange;


    if (typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production') {
        if (rb.z__layoutobserve) {
            rb.logError('layoutobserve should only be added once');
        }
        rb.z__layoutobserve = true;
    }
});
