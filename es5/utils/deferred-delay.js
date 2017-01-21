(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './deferred'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./deferred'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.deferred);
        global.deferredDelay = mod.exports;
    }
})(this, function (exports, _deferred) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = deferredDelay;

    var _deferred2 = _interopRequireDefault(_deferred);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function deferredDelay(delay) {
        var promise = (0, _deferred2.default)();
        var start = Date.now();
        var startRaf = function startRaf() {
            rb.rAFQueue(check, false, true);
        };

        var check = function check() {
            if (Date.now() - start >= delay) {
                promise.resolve();
            } else {
                rb.rAFQueue(check, false, true);
            }
        };

        if (delay > 35) {
            setTimeout(startRaf, delay - 35);
        } else {
            rb.rAFQueue(check, false, true);
        }

        return promise;
    }

    window.rb.deferredDelay = deferredDelay;
});
