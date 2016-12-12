(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.rb_debounce = mod.exports;
    }
})(this, function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
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
        var args = void 0,
            that = void 0,
            timestamp = void 0,
            timeout = void 0,
            isWriteCalled = void 0,
            isReadCalled = void 0,
            frames = void 0;

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

    exports.default = rb.debounce;
});
