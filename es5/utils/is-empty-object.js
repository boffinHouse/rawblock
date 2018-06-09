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
        global.isEmptyObject = mod.exports;
    }
})(this, function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = isEmptyObject;
    function isEmptyObject(obj) {
        var ret = true;

        if (obj) {
            /* eslint-disable no-unused-vars */
            for (var p in obj) {
                ret = false;
                break;
            }
        }

        return ret;
    }
});
