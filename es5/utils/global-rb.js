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
        global.globalRb = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var glob = typeof window != 'undefined' ? window : typeof global != 'undefined' ? global : undefined || {};

    if (!glob.rb) {
        glob.rb = {};
    }

    var rb = glob.rb;

    /**
     * rawblock main object holds classes and util properties and methods to work with rawblock
     * @namespace rb
     */

    exports.default = rb;
});
