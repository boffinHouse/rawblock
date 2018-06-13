(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './get-css', './get-styles'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./get-css'), require('./get-styles'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.getCss, global.getStyles);
        global.getCssNumbers = mod.exports;
    }
})(this, function (exports, _getCss, _getStyles) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = getCSSNumbers;

    var _getCss2 = _interopRequireDefault(_getCss);

    var _getStyles2 = _interopRequireDefault(_getStyles);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    /**
     * Sums up all style values of an element
     * @memberof rb
     * @param element {Element}
     * @param styles {String[]} The names of the style properties (i.e. paddingTop, marginTop)
     * @param onlyPositive {Boolean} Whether only positive numbers should be considered
     * @returns {number} Total of all style values
     * @example
     * var innerWidth = rb.getCSSNumbers(domElement, ['paddingLeft', 'paddingRight', 'width'];
     */
    function getCSSNumbers(element, styles, onlyPositive) {
        var numbers = 0;
        var cStyles = (0, _getStyles2.default)(element);

        if (!Array.isArray(styles)) {
            styles = [styles];
        }

        for (var i = 0; i < styles.length; i++) {
            var value = (0, _getCss2.default)(element, styles[i], true, cStyles);

            if (!onlyPositive || value > 0) {
                numbers += value;
            }
        }

        return numbers;
    }
});
