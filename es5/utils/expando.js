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
        global.expando = mod.exports;
    }
})(this, function (exports, _globalRb) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = expando;

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

    /**
     * Sets/Gets expando property of an object
     *
     * @param obj {Object}
     * @param expando {String|Symbol}
     * @param [name] {String|Object}
     * @param [value] {*}
     * @return {*}
     *
     * @example
     * //sets expando properties by merging name object into expando object
     * expando(divElement, expando, {isValid: true, tested: true});
     *
     * //sets expando property by setting name of expando object
     * expando(divElement, expando, 'isValid', true);
     *
     * //gets hole expando object
     * expando(divElement, expando);
     *
     * //gets isValid property of expando
     * expando(divElement, expando, isValid);
     */
    function expando(obj, expando, name, value) {
        var nameType = typeof name === 'undefined' ? 'undefined' : _typeof(name);
        var isSring = nameType == 'string';

        if (!obj[expando]) {
            obj[expando] = {};
        }

        if (isSring && arguments.length == 4) {
            if (value !== undefined) {
                obj[expando][name] = value;
            } else if (name in obj[expando]) {
                delete obj[expando];
            }
        } else if (nameType == 'object') {
            Object.assign(obj[expando], name);
        }

        return isSring ? obj[expando][name] : obj[expando];
    }

    _globalRb2.default.expando = expando;
});
