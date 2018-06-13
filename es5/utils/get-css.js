(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './get-styles'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./get-styles'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.getStyles);
        global.getCss = mod.exports;
    }
})(this, function (exports, _getStyles) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.cssHooks = undefined;
    exports.default = getCss;

    var _getStyles2 = _interopRequireDefault(_getStyles);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var regComma = /^\d+,\d+(px|em|rem|%|deg)$/;

    var cssHooks = exports.cssHooks = {};

    function getCss(elem, name, extra, styles) {
        var ret = void 0,
            num = void 0;

        if (cssHooks[name] && cssHooks[name].get) {
            ret = cssHooks[name].get(elem);
        } else {
            styles = styles || (0, _getStyles2.default)(elem, null);
            ret = styles.getPropertyValue(name) || styles[name];
        }

        if (ret && regComma.test(ret)) {
            ret = ret.replace(',', '.');
        }

        if (extra) {
            num = parseFloat(ret);
            if (extra === true || !isNaN(num)) {
                ret = num || 0;
            }
        }
        return ret;
    }
});
