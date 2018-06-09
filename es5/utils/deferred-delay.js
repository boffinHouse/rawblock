(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './deferred', './global-rb'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./deferred'), require('./global-rb'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.deferred, global.globalRb);
        global.deferredDelay = mod.exports;
    }
})(this, function (exports, _deferred, _globalRb) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = deferredDelay;

    var _deferred2 = _interopRequireDefault(_deferred);

    var _globalRb2 = _interopRequireDefault(_globalRb);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function deferredDelay(delay, readOptimized) {
        var promise = (0, _deferred2.default)();
        var start = Date.now();
        var rAF = readOptimized ? function (fn) {
            setTimeout(fn, 30);
        } : function (fn) {
            _globalRb2.default.rAFQueue(fn, false, true);
        };
        var startRaf = function startRaf() {
            rAF(check);
        };

        var check = function check() {
            if (Date.now() - start >= delay) {
                promise.resolve();
            } else {
                rAF(check);
            }
        };

        if (delay > 31) {
            setTimeout(startRaf, delay - 30);
        } else {
            rAF(check);
        }

        return promise;
    }

    _globalRb2.default.deferredDelay = deferredDelay;
});
