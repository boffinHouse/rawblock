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
        global.rb_loadscript = mod.exports;
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

        if (!window.rb) {
            window.rb = {};
        }
        var rb = window.rb;
        var promises = {};

        /**
         * Loads a script and returns a promise.
         * @memberof rb
         *
         * @param src
         * @param [async=false]
         * @returns {Promise}
         */
        rb.loadScript = function (src, async) {
            if (!promises[src]) {
                promises[src] = new Promise(function (resolve) {
                    var script = document.createElement('script');
                    var inject = function inject() {
                        (document.body || document.documentElement).appendChild(script);
                        script = null;
                    };
                    script.addEventListener('load', resolve);
                    script.addEventListener('error', function () {
                        rb.logWarn('load script error. Configure rb.packageConfig? src: ' + src);
                        resolve();
                    });
                    script.src = src;
                    script.async = !!async;

                    if (document.body) {
                        (rb.rAFQueue || requestAnimationFrame)(inject);
                    } else {
                        inject();
                    }
                });
            }
            return promises[src];
        };

        rb.loadScript.rb_promises = promises;

        return rb.loadScript;
    });
});