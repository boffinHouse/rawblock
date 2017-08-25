(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './global-rb'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./global-rb'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.globalRb);
        global.deserialize = mod.exports;
    }
})(this, function (exports, _globalRb) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _globalRb2 = _interopRequireDefault(_globalRb);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    var regQ = /^\?/;
    var regPlus = /\+/g;
    var regArray = /\[]$/;

    var addProps = function addProps(param) {
        if (!param) {
            return;
        }

        param = param.split('=');

        var key = decodeURIComponent(param[0]);
        var value = decodeURIComponent(param[1] || '');

        if (regArray.test(key)) {
            key = key.replace(regArray, '');

            if (!(key in this)) {
                this[key] = [];
            }
        }

        var type = _typeof(this[key]);

        if (key in this && type == 'string') {
            this[key] = [this[key]];
            type = 'object';
        }

        if (type == 'object') {
            this[key].push(value);
        } else {
            this[key] = value;
        }
    };

    _globalRb2.default.deserialize = function (str) {
        var obj = {};

        (str || '').replace(regQ, '').replace(regPlus, ' ').split('&').forEach(addProps, obj);

        return obj;
    };

    exports.default = _globalRb2.default.deserialize;
});
