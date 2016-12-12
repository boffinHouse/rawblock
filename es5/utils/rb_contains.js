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
        global.rb_contains = mod.exports;
    }
})(this, function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var rb = window.rb;
    var _contains = function _contains(element) {
        return element == this || element.contains(this);
    };
    /**
     * Tests whether an element is inside or equal to a list of elements.
     * @memberof rb
     * @param containerElements {Element[]|Element} Array of elements that might contain innerElement.
     * @param innerElement {Element} An element that might be inside of one of containerElements.
     * @returns {Element|undefined|null} The first element in containerElements, that contains innerElement or is the innerElement.
     */
    rb.contains = function (containerElements, innerElement) {
        return Array.isArray(containerElements) ? containerElements.find(_contains, innerElement) : _contains.call(innerElement, containerElements) ? containerElements : null;
    };
    rb.contains._contains = _contains;

    exports.default = rb.contains;
});
