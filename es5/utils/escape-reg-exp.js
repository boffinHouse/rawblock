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
        global.escapeRegExp = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = escapeRegExp;
    var regEscape = exports.regEscape = /[-/\\^$*+?.()|[\]{}]/g;

    function escapeRegExp(str) {
        return str.replace(regEscape, '\\$&');
    }
});
