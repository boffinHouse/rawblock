(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './global-rb', './rafqueue'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./global-rb'), require('./rafqueue'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.globalRb, global.rafqueue);
        global.rafs = mod.exports;
    }
})(this, function (exports, _globalRb, _rafqueue) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.rAF = rAF;
    exports.rAFs = rAFs;

    exports.default = function (fn) {
        return typeof fn == 'function' ? rAF.apply(undefined, arguments) : rAFs.apply(undefined, arguments);
    };

    var _globalRb2 = _interopRequireDefault(_globalRb);

    var _rafqueue2 = _interopRequireDefault(_rafqueue);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    /**
     * Generates and returns a new, rAFed version of the passed function, so that the passed function is always called using requestAnimationFrame. Normally all methods/functions, that mutate the DOM/CSSOM, should be wrapped using `rb.rAF` to avoid layout thrashing.
     * @memberof rb
     * @param fn {Function} The function to be rAFed
     * @param options {Object} Options object
     * @param options.that=null {Object} The context in which the function should be invoked. If nothing is passed the context of the wrapper function is used.
     * @param options.queue=false {Object} Whether the fn should be added to an ongoing rAF (i.e.: `false`) or should be queued to the next rAF (i.e.: `true`).
     * @param options.throttle=false {boolean} Whether multiple calls in one frame cycle should be throtteled to one.
     * @returns {Function}
     *
     * @example
     *  class Foo {
     *      constructor(element){
     *          this.element = element;
     *          this.changeLayout = rb.rAF(this.changeLayout);
     *      }
     *
     *      changeLayout(width){
     *          this.element.classList[width > 800 ? 'add' : 'remove']('is-large');
     *      }
     *
     *      measureLayout(){
     *          this.changeLayout(this.element.offsetWidth);
     *      }
     *  }
     */
    function rAF(fn, options) {
        var running = void 0,
            args = void 0,
            that = void 0,
            inProgress = void 0;
        var batchStack = [];
        var run = function run() {
            running = false;
            if (!options.throttle) {
                while (batchStack.length) {
                    args = batchStack.shift();
                    fn.apply(args[0], args[1]);
                }
            } else {
                fn.apply(that, args);
            }
        };
        var rafedFn = function rafedFn() {
            args = arguments;
            that = options.that || this;
            if (!options.throttle) {
                batchStack.push([that, args]);
            }
            if (!running) {
                running = true;
                (0, _rafqueue2.default)(run, inProgress);
            }
        };

        if (!options) {
            options = {};
        }

        inProgress = !options.queue;

        if (fn._rbUnrafedFn && _globalRb2.default.log) {
            _globalRb2.default.log('double rafed', fn);
        }

        rafedFn._rbUnrafedFn = fn;

        return rafedFn;
    }

    /* End: rAF helpers */

    /* Begin: rAFs helper */

    /**
     * Invokes `rb.rAF` on multiple methodNames of on object.
     *
     * @memberof rb
     *
     * @param {Object} obj
     * @param {Object} [options]
     * @param {...String} methodNames
     *
     * @example
     * rb.rAFs(this, {throttle: true}, 'renderList', 'renderCircle');
     */
    function rAFs(obj) {
        var options = void 0;
        var args = Array.from(arguments);

        args.shift();

        if (_typeof(args[0]) == 'object') {
            options = args.shift();
        }

        args.forEach(function (fn) {
            obj[fn] = _globalRb2.default.rAF(obj[fn], options);
        });
    }

    Object.assign(_globalRb2.default, { rAF: rAF, rAFs: rAFs });
});
