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
        global.$_attrLinked = mod.exports;
    }
})(this, function () {
    'use strict';

    var regAttr = /="*'*\{*([_a-z\-0-9$]+)}*'*"*/;
    var regStart = /^\[/;
    var $ = window.rb.$;

    /**
     * Finds attribute linked elements on the first element in collection.
     * @function external:"jQuery.fn".attrLinked
     * @param {String} attributeSelector Attribute selector pattern to search for. ("[aria-controls="${id}"]")
     * @returns {jQueryfiedObject}
     *
     * @example
     *
     * //<div id="yo"></div>
     * //<a data-target="yo"></a>
     *
     * $('#yo').attrLinked('data-target={id}'); // returns '[data-target="yo"]' elements.
     * $('#yo').attrLinked('data-target={id}').attrLinked('id={data-target}'); // returns '[id="yo"]' elements.
     */
    $.fn.attrLinked = function (attributeSelector) {
        var newCollection = void 0;
        var elem = this.get(0);

        if (elem) {
            var valueAttr = attributeSelector.match(regAttr);

            if (valueAttr) {
                var value = elem[valueAttr[1]];

                if (!value || typeof value != 'string') {
                    value = elem.getAttribute(valueAttr[1]) || '';
                }

                if (!regStart.test(attributeSelector)) {
                    attributeSelector = '[' + attributeSelector + ']';
                }

                newCollection = $(attributeSelector.replace(regAttr, '="' + value + '"'));
            }
        }

        return newCollection || $([]);
    };
});
