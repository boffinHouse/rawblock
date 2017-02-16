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
        global.lazyeach = mod.exports;
    }
})(this, function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var rb = window.rb;

    rb.lazyEach = function (list, handler, max, index) {

        var item = void 0,
            start = void 0;
        var length = list.length;

        if (!max) {
            max = 4;
        }

        if (!index) {
            index = 0;
        }

        for (; index < length; index++) {
            item = list[index];

            if (item) {
                handler(item);
            }

            if (!start) {
                start = Date.now();
            } else if (Date.now() - start >= max) {
                /* jshint loopfunc: true */
                rb.rIC(function () {
                    // eslint-disable-line no-loop-func
                    rb.lazyList(list, handler, max, index);
                });
                break;
            }
        }
    };

    exports.default = rb.lazyEach;
});
