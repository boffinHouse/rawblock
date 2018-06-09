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
        global.escape = mod.exports;
    }
})(this, function (exports, _globalRb) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _globalRb2 = _interopRequireDefault(_globalRb);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '`': '&#x60;'
    };

    // Functions for escaping and unescaping strings to/from HTML interpolation.
    var createEscaper = function createEscaper(map) {
        var escaper = function escaper(match) {
            return map[match];
        };
        // Regexes for identifying a key that needs to be escaped
        var source = '(?:' + Object.keys(map).join('|') + ')';
        var testRegexp = new RegExp(source);
        var replaceRegexp = new RegExp(source, 'g');

        return function (string) {
            string = string == null ? '' : '' + string;
            return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
        };
    };

    /**
     * Converts the characters "&", "<", ">", '"', "'", and "\`" in `string` to
     * their corresponding HTML entities.
     *
     * @static
     * @memberOf rb
     * @category String
     * @param {string} [string=''] The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * rb.escape('fred, barney, & pebbles');
     * // => 'fred, barney, &amp; pebbles'
     */
    _globalRb2.default.escape = createEscaper(escapeMap);

    /* eslint-disable no-undef */
    if (!window._) {
        window._ = {};
    }
    if (!_.escape) {
        _.escape = _globalRb2.default.escape;
    }
    /* eslint-enable no-undef */

    exports.default = _globalRb2.default.escape;
});
