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
        global.$_isPlainObject = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = isPlainObject;
    var class2type = {};
    var toString = class2type.toString;
    var hasOwn = class2type.hasOwnProperty;
    var fnToString = hasOwn.toString;
    var getProto = Object.getPrototypeOf;
    var ObjectFunctionString = fnToString.call(Object);

    function isPlainObject(obj) {
        var proto = void 0,
            Ctor = void 0;

        if (!obj || toString.call(obj) !== '[object Object]') {
            return false;
        }

        proto = getProto(obj);

        if (!proto) {
            return true;
        }

        Ctor = hasOwn.call(proto, 'constructor') && proto.constructor;
        return typeof Ctor === 'function' && fnToString.call(Ctor) === ObjectFunctionString;
    }
});
