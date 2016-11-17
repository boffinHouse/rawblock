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
        global.rb_lazyeach = mod.exports;
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

        rb.lazyEach = function (list, handler, max, index) {

            var item, start;
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

        return rb.lazyEach;
    });
});
