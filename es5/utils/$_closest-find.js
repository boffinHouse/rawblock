(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof exports !== "undefined") {
        factory();
    } else {
        var mod = {
            exports: {}
        };
        factory();
        global.$_closestFind = mod.exports;
    }
})(this, function () {
    'use strict';

    var regSplit = /\s*?,\s*?|\s+?/g;
    var $ = window.rb.$;

    /**
     * Invokes on the first element in collection the closest method and on the result the querySelector method.
     * @function external:"jQuery.fn".closestFind
     * @param {String} selectors Two selectors separated by a white space and/or comma. First is used for closest and second for querySelector. Example: `".rb-item, .item-input"`.
     * @returns {jQueryfiedObject}
     */
    $.fn.closestFind = function (selectors) {
        var sels = void 0;
        var closestSel = void 0,
            findSel = void 0;
        var elem = this.get(0);

        if (elem) {
            sels = selectors.split(regSplit);
            closestSel = sels.shift();
            findSel = sels.join(' ');
            elem = elem.closest(closestSel);
            if (elem) {
                elem = elem.querySelector(findSel);
            }
        }

        return $(elem || []);
    };
});
