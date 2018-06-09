(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '../utils/global-rb'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('../utils/global-rb'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.globalRb);
        global.$_param = mod.exports;
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

    var $ = _globalRb2.default.$;
    var r20 = /%20/g;
    var rbracket = /\[]$/;

    function buildParams(prefix, obj, add) {
        var name = void 0;

        if (Array.isArray(obj)) {
            obj.forEach(function (v, i) {
                if (rbracket.test(prefix)) {
                    add(prefix, v);
                } else {
                    buildParams(prefix + '[' + ((typeof v === 'undefined' ? 'undefined' : _typeof(v)) === 'object' && v != null ? i : '') + ']', v, add);
                }
            });
        } else if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) == 'object') {
            for (name in obj) {
                buildParams(prefix + '[' + name + ']', obj[name], add);
            }
        } else {
            add(prefix, obj);
        }
    }

    /**
     * This is a direct copy of jQuery's param method without traditional option.
     * @param a
     * @returns {string}
     */
    var param = $ && $.param || function (a) {
        var prefix = void 0;
        var s = [];
        var add = function add(key, value) {
            value = typeof value == 'function' ? value() : value == null ? '' : value;
            s[s.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
        };

        if (Array.isArray(a)) {
            a.forEach(function (item) {
                add(item.name, item.value);
            });
        } else {
            for (prefix in a) {
                buildParams(prefix, a[prefix], add);
            }
        }

        // Return the resulting serialization
        return s.join('&').replace(r20, '+');
    };

    _globalRb2.default.param = param;

    if ($ && !$.param) {
        $.param = param;
    }

    exports.default = param;
});
