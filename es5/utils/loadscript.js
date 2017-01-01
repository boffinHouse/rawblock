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
        global.loadscript = mod.exports;
    }
})(this, function (exports, _deferred) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _deferred2 = _interopRequireDefault(_deferred);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var rb = window.rb;
    var promises = {};

    /**
     * Loads a script and returns a promise.
     * @memberof rb
     *
     * @param src
     * @param [options={}]
     * @param options.async
     * @param options.defer
     * @param options.instantInject
     * @returns {Promise}
     */
    rb.loadScript = function (src) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (!promises[src]) {
            (function () {
                var script = document.createElement('script');

                var inject = function inject() {
                    (document.body || document.documentElement).appendChild(script);
                    script = null;
                };

                promises[src] = (0, _deferred2.default)();

                script.addEventListener('load', function () {
                    promises[src].resolve();
                });
                script.addEventListener('error', function () {
                    rb.logWarn('load script error. Configure rb.packageConfig? src: ' + src);
                    promises[src].resolve();
                });

                script.src = src;
                script.async = !!options.async;
                script.defer = !!options.defer;

                if (document.body && !options.instantInject) {
                    (rb.rAFQueue || requestAnimationFrame)(inject);
                } else {
                    inject();
                }
            })();
        }
        return promises[src];
    };

    rb.loadScript.rb_promises = promises;

    exports.default = rb.loadScript;
});
