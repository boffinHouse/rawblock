(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', 'babel-runtime/helpers/typeof', './rb_$/$_slim', './rb_$/$_fx'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('babel-runtime/helpers/typeof'), require('./rb_$/$_slim'), require('./rb_$/$_fx'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global._typeof, global.$_slim, global.$_fx);
        global._$ = mod.exports;
    }
})(this, function (module, _typeof2, $) {
    'use strict';

    var _typeof3 = _interopRequireDefault(_typeof2);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    (function () {
        'use strict';

        if ((typeof module === 'undefined' ? 'undefined' : (0, _typeof3.default)(module)) == 'object' && module.exports && typeof require != 'undefined') {
            module.exports = $;
        }
    })();
});
