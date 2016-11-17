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
        global.rb_deserialize = mod.exports;
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
        /* jshint eqnull: true */

        var rb = window.rb;

        var regQ = /^\?/;

        var addProps = function addProps(param) {
            if (!param) {
                return;
            }

            param = param.split('=');

            this[decodeURIComponent(param[0])] = decodeURIComponent(param[1] || '');
        };

        rb.deserialize = function (str) {
            var obj = {};

            str.replace(regQ, '').replace('+', ' ').split('&').forEach(addProps, obj);

            return obj;
        };

        return rb.deserialize;
    });
});
