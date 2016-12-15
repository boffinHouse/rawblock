(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof exports !== "undefined") {
        factory();
    } else {
        var mod = {
            exports: {}
        };
        factory();
        global.rb_focusWithin = mod.exports;
    }
})(this, function () {
    'use strict';

    var rb = window.rb;

    rb.ready.then(function () {
        var running = false;

        var isClass = rb.utilPrefix + 'focus' + rb.nameSeparator + 'within';
        var isClassSelector = '.' + isClass;

        var updateFocus = function updateFocus() {
            var oldFocusParents = void 0,
                newFocusParents = void 0,
                i = void 0,
                len = void 0;

            var parent = document.activeElement;

            if (parent) {
                newFocusParents = [];

                while (parent && parent.classList && !parent.classList.contains(isClass)) {
                    newFocusParents.push(parent);
                    parent = parent.parentNode;
                }

                if (oldFocusParents = parent.querySelectorAll && parent.querySelectorAll(isClassSelector)) {
                    for (i = 0, len = oldFocusParents.length; i < len; i++) {
                        oldFocusParents[i].classList.remove(isClass);
                    }
                }
                for (i = 0, len = newFocusParents.length; i < len; i++) {
                    newFocusParents[i].classList.add(isClass);
                }
            }

            running = false;
        };

        var update = function update() {
            if (!running) {
                running = true;
                rb.rAFQueue(updateFocus, true);
            }
        };

        document.addEventListener('focus', update, true);
        document.addEventListener('blur', update, true);
        update();
    });

    if (typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production') {
        if (rb.z__focuswithin) {
            rb.logError('focuswithin should only be added once');
        }
        rb.z__focuswithin = true;
    }
});
