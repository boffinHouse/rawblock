(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', 'babel-runtime/helpers/typeof'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('babel-runtime/helpers/typeof'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global._typeof);
        global.rb_deserialize = mod.exports;
    }
})(this, function (module, _typeof2) {
    'use strict';

    var _typeof3 = _interopRequireDefault(_typeof2);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    (function (factory) {
        if ((typeof module === 'undefined' ? 'undefined' : (0, _typeof3.default)(module)) === 'object' && module.exports) {
            module.exports = factory();
        } else {
            factory();
        }
    })(function () {
        'use strict';
        /* jshint eqnull: true */

        var rb = window.rb;

        var regQ = /^\?/;

        var addProps = function addProps(param) {
            if (!param) {
                return;
            }

            param = param.split('=');

            this[decodeURIComponent(param[0])] = decodeURIComponent(param[1] || '');
        };

        rb.deserialize = function (str) {
            var obj = {};

            str.replace(regQ, '').replace('+', ' ').split('&').forEach(addProps, obj);

            return obj;
        };

        return rb.deserialize;
    });
});
