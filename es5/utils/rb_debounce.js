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
        global.rb_debounce = mod.exports;
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

        var rb = window.rb || {};

        /**
         *
         * @memberof rb
         *
         * @param fn {Function}
         * @param opts
         * @param opts.delay
         * @param opts.that
         * @param opts.write
         * @returns {Function}
         *
         */
        rb.debounce = function (fn, opts) {
            var args, that, timestamp, timeout, isWriteCalled, isReadCalled, frames;

            var later = function later() {
                var last = Date.now() - timestamp;

                if (last < opts.delay || frames < opts.minFrame) {
                    isWriteCalled = false;
                    isReadCalled = false;
                    timeout = setTimeout(later, Math.max(opts.delay - last, (opts.minFrame - frames) * 17));
                } else if (!isWriteCalled) {
                    isWriteCalled = true;
                    rb.rAFQueue(later);
                } else if (!isReadCalled && !opts.write) {
                    isReadCalled = true;
                    rb.rIC(later);
                } else {
                    timeout = null;
                    fn.apply(that, args);
                }
            };
            var countFrames = function countFrames() {
                frames++;
                if (timeout) {
                    rb.rAFQueue(countFrames);
                }
            };

            opts = Object.assign({ delay: 100, minFrame: 0 }, opts);

            opts.delay = Math.max(40, opts.delay) - 18;

            return function () {
                timestamp = Date.now();
                frames = 0;

                args = arguments;
                that = opts.that || this;

                if (!timeout) {
                    if (opts.minFrame) {
                        rb.rAFQueue(countFrames);
                    }
                    timeout = setTimeout(later, opts.delay);
                }
            };
        };

        return rb.debounce;
    });
});
