(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './intersect'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./intersect'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.intersect);
        global.lazylive = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });


    var started = void 0,
        observeClass = void 0,
        observedElements = void 0,
        initClass = void 0,
        clickClass = void 0;

    var rb = window.rb;
    var $ = rb.$;
    var intersect = rb.events.special.rb_intersect;

    var onIntersect = function onIntersect(e) {
        var element = e.target;

        intersect.remove(element, onIntersect, { margin: 666 });

        initComponent(element);
    };

    var observe = function observe() {
        if (observedElements.length) {
            var elements = Array.from(observedElements);

            elements.forEach(function (element) {
                intersect.add(element, onIntersect, { margin: 666 });
            });

            $(elements).removeClassRaf(observeClass);
        }
    };

    var throttleObserve = rb.throttle(observe);

    function initComponent(element) {
        var module = element.getAttribute('data-module');

        if (rb.components[module]) {
            rb.ready.then(function () {
                rb.getComponent(element, module);
            });
        } else {
            var loadModule = element.getAttribute('data-loadmodule') != null;

            if (!element.classList.contains(initClass) && !element.classList.contains(clickClass)) {
                $(element).addClassRaf(initClass);
            }

            rb.live.import(module, element, !loadModule);
        }

        $('[data-module="' + module + '"].' + clickClass + '.' + observeClass).removeClassRaf(observeClass);
    }

    function start() {
        if (started) {
            return;
        }
        started = true;

        var nameSeparator = rb.cssConfig.nameSeparator || rb.nameSeparator;

        observeClass = ['js', 'rb', 'lazylive'].join(nameSeparator);
        initClass = ['js', 'rb', 'live'].join(nameSeparator);
        clickClass = ['js', 'rb', 'click'].join(nameSeparator);

        observedElements = document.getElementsByClassName(observeClass);

        if (window.MutationObserver) {
            new MutationObserver(throttleObserve).observe(rb.root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
        } else {
            rb.root.addEventListener('DOMNodeInserted', throttleObserve, true);
            rb.root.addEventListener('DOMAttrModified', throttleObserve, true);
            setInterval(throttleObserve, 999);
        }

        observe();
    }

    rb.ready.then(start);

    rb.startLazyModules = start;

    exports.default = start;
});
