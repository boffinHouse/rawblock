(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.templateRenderPartial = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.registerTemplate = registerTemplate;
    exports.default = renderPartial;
    var rb = window.rb;

    function registerTemplate(name, fun) {

        if (typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production') {
            if (rb.templates[name]) {
                rb.logWarn(name + ' template already exists.', rb.templates[name], fun);
            }
        }

        if (typeof fun == 'string') {
            fun = rb.template(fun);
        }

        rb.templates[name] = fun;
    }

    rb.registerTemplate = registerTemplate;

    function renderPartial(name, obj) {
        var html = '';

        if (rb.templates[name]) {
            html = rb.templates[name](obj);
        } else {
            if (typeof process != 'undefined' && process.env && process.env.NODE_ENV != 'production') {
                rb.logError(name + ' for partial not found and lazyload templates not supported');
            }
        }

        return html;
    }

    rb.renderPartial = renderPartial;
});
