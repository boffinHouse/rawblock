(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './global-rb', './rafqueue', './request-idle-callback'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./global-rb'), require('./rafqueue'), require('./request-idle-callback'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.globalRb, global.rafqueue, global.requestIdleCallback);
        global.debounce = mod.exports;
    }
})(this, function (exports, _globalRb, _rafqueue, _requestIdleCallback) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _globalRb2 = _interopRequireDefault(_globalRb);

    var _rafqueue2 = _interopRequireDefault(_rafqueue);

    var _requestIdleCallback2 = _interopRequireDefault(_requestIdleCallback);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

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
    _globalRb2.default.debounce = function (fn, opts) {
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
                (0, _rafqueue2.default)(later);
            } else if (!isReadCalled && !opts.write) {
                isReadCalled = true;
                (0, _requestIdleCallback2.default)(later);
            } else {
                timeout = null;
                fn.apply(that, args);
            }
        };
        var countFrames = function countFrames() {
            frames++;
            if (timeout) {
                (0, _rafqueue2.default)(countFrames);
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
                    (0, _rafqueue2.default)(countFrames);
                }
                timeout = setTimeout(later, opts.delay);
            }
        };
    };

    exports.default = _globalRb2.default.debounce;
});
