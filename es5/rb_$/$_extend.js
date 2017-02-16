(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './$_is-plain-object'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./$_is-plain-object'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.$_isPlainObject);
        global.$_extend = mod.exports;
    }
})(this, function (exports, _$_isPlainObject) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = extend;

    var _$_isPlainObject2 = _interopRequireDefault(_$_isPlainObject);

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

    function extend() {
        var options = void 0,
            name = void 0,
            src = void 0,
            copy = void 0,
            copyIsArray = void 0,
            clone = void 0;

        var target = arguments[0] || {};
        var i = 1;
        var deep = false;
        var length = arguments.length;

        if (typeof target === 'boolean') {
            deep = target;
            target = arguments[i] || {};
            i++;
        }

        if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== 'object' && typeof target != 'function') {
            target = {};
        }

        if (i === length) {
            target = this;
            i--;
        }

        for (; i < length; i++) {

            if ((options = arguments[i]) != null) {

                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    if (target === copy) {
                        continue;
                    }

                    if (deep && copy && ((0, _$_isPlainObject2.default)(copy) || (copyIsArray = Array.isArray(copy)))) {

                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && Array.isArray(src) ? src : [];
                        } else {
                            clone = src && (0, _$_isPlainObject2.default)(src) ? src : {};
                        }

                        target[name] = extend(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        return target;
    }
});
