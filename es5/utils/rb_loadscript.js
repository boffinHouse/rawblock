(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.rb_loadscript = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
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

    exports.default = rb.loadScript;
});
