(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod);
        global.rb_lazyeach = mod.exports;
    }
})(this, function (module) {
    'use strict';

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    (function (factory) {
        if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
            module.exports = factory();
        } else {
            factory();
        }
    })(function () {
        'use strict';
        /* jshint eqnull: true */

        var rb = window.rb;

        rb.lazyEach = function (list, handler, max, index) {

            var item, start;
            var length = list.length;

            if (!max) {
                max = 4;
            }

            if (!index) {
                index = 0;
            }

            for (; index < length; index++) {
                item = list[index];

                if (item) {
                    handler(item);
                }

                if (!start) {
                    start = Date.now();
                } else if (Date.now() - start >= max) {
                    /* jshint loopfunc: true */
                    rb.rIC(function () {
                        // eslint-disable-line no-loop-func
                        rb.lazyList(list, handler, max, index);
                    });
                    break;
                }
            }
        };

        return rb.lazyEach;
    });
});
