(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './request-idle-callback', './rafqueue'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./request-idle-callback'), require('./rafqueue'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.requestIdleCallback, global.rafqueue);
        global.throttle = mod.exports;
    }
})(this, function (exports, _requestIdleCallback, _rafqueue) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = throttle;

    var _requestIdleCallback2 = _interopRequireDefault(_requestIdleCallback);

    var _rafqueue2 = _interopRequireDefault(_rafqueue);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    /**
     * Throttles a given function
     * @memberof rb
     * @param {function} fn - The function to be throttled.
     * @param {object} [options] - options for the throttle.
     *  @param {object} options.that=null -  the context in which fn should be called.
     *  @param {boolean} options.write=false -  wether fn is used to write layout.
     *  @param {boolean} options.read=false -  wether fn is used to read layout.
     *  @param {number} options.delay=200 -  the throttle delay.
     *  @param {boolean} options.unthrottle=false -  Wether function should be invoked directly.
     * @returns {function} the throttled function.
     */
    function throttle(fn, options) {
        var running = void 0,
            that = void 0,
            args = void 0;

        var lastTime = 0;
        var Date = window.Date;

        var _run = function _run() {
            running = false;
            lastTime = Date.now();
            var nowThat = that;
            var nowArgs = args;

            that = null;
            args = null;

            fn.apply(nowThat, nowArgs);
        };

        var afterAF = function afterAF() {
            (0, _requestIdleCallback2.default)(_run);
        };

        var throttel = function throttel() {

            that = options.that || this;
            args = arguments;

            if (running) {
                return;
            }

            var delay = options.delay;

            running = true;

            if (options.unthrottle) {
                _run();
            } else {
                if (delay && !options.simple) {
                    delay -= Date.now() - lastTime;
                }
                if (delay < 0) {
                    delay = 0;
                }
                if (!delay && (options.read || options.write)) {
                    getAF();
                } else {
                    setTimeout(getAF, delay);
                }
            }
        };

        var getAF = function getAF() {
            (0, _rafqueue2.default)(afterAF);
        };

        if (!options) {
            options = {};
        }

        if (!options.delay) {
            options.delay = 200;
        }

        if (options.write) {
            afterAF = _run;
        } else if (!options.read) {
            getAF = _run;
        }

        throttel._rbUnthrotteled = fn;

        return throttel;
    }

    if (window.rb) {
        window.rb.throttle = throttle;
    }
});
