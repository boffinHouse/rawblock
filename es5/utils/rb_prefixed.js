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
        global.rb_prefixed = mod.exports;
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

        if (!window.rb) {
            window.rb = {};
        }
        var style = document.createElement('b').style;
        var rb = window.rb;
        var $ = rb.$;
        var prefixes = ['Webkit', 'webkit', 'Moz', 'moz', 'Ms', 'ms', 'O', 'o'];

        /**
         * Gets a string and returns a prefixed version. If empty string is returned there is no support.
         *
         * @memberof rb
         *
         * @param {String} name
         * @param {Object} [object=document.createElement('b').style]
         * @return {string}
         */
        rb.prefixed = function (name, object) {
            object = object || style;
            var i, partName, testName;
            var ret = '';

            name = $.camelCase(name);

            if (name in object) {
                ret = name;
            }

            if (!ret) {
                partName = $.camelCase('-' + name);
                for (i = 0; i < prefixes.length && !ret; i++) {
                    testName = prefixes[i] + partName;
                    if (testName in object) {
                        ret = testName;
                        break;
                    }
                }
            }

            return ret;
        };

        return rb.prefixed;
    });
});
