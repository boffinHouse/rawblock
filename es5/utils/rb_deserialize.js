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
        global.rb_deserialize = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
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

    exports.default = rb.deserialize;
});
