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
        global.templateRenderPartial = mod.exports;
    }
})(this, function (exports, _globalRb) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.registerTemplate = registerTemplate;
    exports.default = renderPartial;

    var _globalRb2 = _interopRequireDefault(_globalRb);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function registerTemplate(name, fun) {

        if (typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production') {
            if (_globalRb2.default.templates[name]) {
                _globalRb2.default.logWarn(name + ' template already exists.', _globalRb2.default.templates[name], fun);
            }
        }

        if (typeof fun == 'string') {
            fun = _globalRb2.default.template(fun);
        }

        _globalRb2.default.templates[name] = fun;
    }

    _globalRb2.default.registerTemplate = registerTemplate;

    function renderPartial(name, obj) {
        var html = '';

        if (_globalRb2.default.templates[name]) {
            html = _globalRb2.default.templates[name](obj);
        } else {
            if (typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production') {
                _globalRb2.default.logError(name + ' for partial not found and lazyload templates not supported');
            }
        }

        return html;
    }

    _globalRb2.default.renderPartial = renderPartial;
});
