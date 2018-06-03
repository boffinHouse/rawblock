(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './global-rb'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./global-rb'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.globalRb);
        global.rafqueue = mod.exports;
    }
})(this, function (exports, _globalRb) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = rAFQueue;

    var _globalRb2 = _interopRequireDefault(_globalRb);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var isInProgress = void 0,
        inProgressStack = void 0;
    var fns1 = [];
    var fns2 = [];

    var curFns = fns1;

    var run = function run() {
        inProgressStack = curFns;
        curFns = fns1.length ? fns2 : fns1;

        isInProgress = true;
        while (inProgressStack.length) {
            inProgressStack.shift()();
        }
        isInProgress = false;
    };

    /**
     * Invokes a function inside a rAF call
     * @memberof rb
     * @alias rb#rAFQueue
     * @param fn {Function} the function that should be invoked
     * @param [inProgress] {boolean} Whether the fn should be added to an ongoing rAF or should be appended to the next rAF.
     * @param [hiddenRaf] {boolean} Whether the rAF should also be used if document is hidden.
     */
    function rAFQueue(fn, inProgress, hiddenRaf) {

        if (inProgress && isInProgress) {
            fn();
        } else {
            curFns.push(fn);
            if (curFns.length == 1) {
                (hiddenRaf || !document.hidden ? requestAnimationFrame : setTimeout)(run);
            }
        }
    }

    _globalRb2.default.rAFQueue = rAFQueue;
});
