(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.requestIdleCallback = mod.exports;
    }
})(this, function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var rIC = window.requestIdleCallback ? function (fn) {
        return requestIdleCallback(fn, { timeout: 99 });
    } : function (fn) {
        return setTimeout(fn);
    };

    exports.default = rIC;


    if (window.rb) {
        window.rb.rIC = rIC;
    }
});
