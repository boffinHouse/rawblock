(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '../utils/glob', '../utils/global-rb', '../utils/serialize', './$_param'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('../utils/glob'), require('../utils/global-rb'), require('../utils/serialize'), require('./$_param'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.glob, global.globalRb, global.serialize, global.$_param);
        global.$_serialize = mod.exports;
    }
})(this, function (exports, _glob, _globalRb, _serialize) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _glob2 = _interopRequireDefault(_glob);

    var _globalRb2 = _interopRequireDefault(_globalRb);

    var _serialize2 = _interopRequireDefault(_serialize);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var $ = _globalRb2.default.$ || _glob2.default.jQuery;

    if (!$.fn.serializeArray || !$.fn.serialize) {

        $.fn.serializeArray = function () {
            return (0, _serialize2.default)(this.get());
        };

        $.fn.serialize = function () {
            return $.param(this.serializeArray());
        };
    }

    exports.default = $.fn.serializeArray;
});
