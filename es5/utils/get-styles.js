(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.getStyles = mod.exports;
    }
})(this, function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = getStyles;
    /**
     * Returns the ComputedStyleObject of an element.
     * @memberof rb
     * @param element {Element}
     * @param [pseudo] {String|null} Either `'::after'`, `'::before'` or `null`/`undefined`
     * @returns {CssStyle}
     *
     * @example
     * rb.getStyles(element).position // returns 'absolute', 'relative' ...
     */
    function getStyles(element, pseudo) {
        var view = element.ownerDocument.defaultView;

        if (!view.opener) {
            view = window;
        }
        return view.getComputedStyle(element, pseudo || null) || { getPropertyValue: rb.$ && rb.$.noop, isNull: true };
    }
});
