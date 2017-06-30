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
        global.cssSupports = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var CSS = window.CSS;

    var cssSupports = CSS && CSS.supports ? function () {
        return CSS.supports.apply(CSS, arguments);
    } : function () {
        return '';
    };

    if (window.rb) {
        rb.cssSupports = cssSupports;
    }

    exports.default = cssSupports;
});
