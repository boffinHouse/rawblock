(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './utils/global-rb'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./utils/global-rb'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.globalRb);
        global._crucial = mod.exports;
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

    var getPseudoToParse = void 0;

    var regStartQuote = /^"?'?"?/;
    var regEndQuote = /"?'?"?$/;
    var regEscapedQuote = /\\"/g;

    var removeLeadingQuotes = function removeLeadingQuotes(str) {
        return str && str.replace(regStartQuote, '').replace(regEndQuote, '').replace(regEscapedQuote, '"');
    };

    /**
     * Parses a string using JSON.parse without throwing an error.
     * @memberof rb
     * @param str
     * @returns {*}
     */
    _globalRb2.default.jsonParse = function (str) {
        var ret;
        if (str) {
            try {
                ret = JSON.parse(str);
            } catch (e) {
                //continue
            }
        }
        return ret;
    };

    /**
     * Parses the CSS content value of a pseudo element using JSON.parse.
     * @memberof rb
     * @param element {Element} The element to parse.
     * @param privateExpando {Symbol|String}
     * @returns {Object|undefined}
     */
    _globalRb2.default.parsePseudo = function (element, privateExpando) {
        var ret;
        var isString = typeof element == 'string';
        var value = isString ? element : getPseudoToParse(element);

        if (element && !isString && privateExpando) {
            element[privateExpando] = value;
        }

        ret = _globalRb2.default.jsonParse(removeLeadingQuotes(value));
        return ret;
    };

    /**
     *
     * @param element
     * @returns {*}
     */
    _globalRb2.default.getPseudo = function (element) {
        // Get data from hidden elements can be tricky:
        // IE11 on Win7 does return content: 'none' for before. But can return fontFamily for the before element. (Safari 10 does not return the right fontFamily!.)
        // Safari 8 does return content: ''|null for before. But can only read content for the element itself.
        var beforeStyles = _globalRb2.default.getStyles(element, '::before');
        var value = beforeStyles.content;
        var isValueNone = value == 'none';

        if ((isValueNone || !value) && element) {
            if (isValueNone) {
                value = beforeStyles.fontFamily;
            } else {
                value = _globalRb2.default.getStyles(element).content;
            }
        }

        return value;
    };

    /**
     * @memberof rb
     * @param element {Element}
     * @param privateExpando {Symbol|String}
     * @returns {boolean}
     */
    _globalRb2.default.hasPseudoChanged = function (element, privateExpando) {
        var value = element[privateExpando];
        return getPseudoToParse(element) != value;
    };

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
    _globalRb2.default.getStyles = function (element, pseudo) {
        var view = element.ownerDocument.defaultView;

        if (!view.opener) {
            view = window;
        }
        return view.getComputedStyle(element, pseudo || null) || { getPropertyValue: _globalRb2.default.$ && _globalRb2.default.$.noop, isNull: true };
    };

    /**
     * Parsed global data from Stylesheet (html::before and html::before)
     * @alias rb.cssConfig
     * @property cssConfig {Object}
     * @property cssConfig.mqs {Object} Map of different media queries
     * @property cssConfig.currentMQ {String} Currently active media query
     * @property cssConfig.beforeMQ {String} Media query that was active before
     * @property cssConfig.mqChange {Object} jQuery Callback object to listen for media query changes.
     *
     */
    var cssConfig = { mqs: {}, currentMQ: '', beforeMQ: '' };
    var parseCSS = function parseCSS() {
        var mqCallbacks;
        var root = document.documentElement;
        var styles = _globalRb2.default.parsePseudo(root) || {};
        var currentMQStyle = _globalRb2.default.getStyles(root, '::after');
        var currentStyle = '';

        var detectMQChange = function detectMQChange() {
            var nowStyle = currentMQStyle.content;
            if (currentStyle != nowStyle) {
                currentStyle = nowStyle;
                _globalRb2.default.cssConfig.beforeMQ = _globalRb2.default.cssConfig.currentMQ;
                _globalRb2.default.cssConfig.currentMQ = removeLeadingQuotes(currentStyle);
                if (_globalRb2.default.$ && _globalRb2.default.$.Callbacks) {
                    _globalRb2.default.cssConfig.mqChange.fireWith(_globalRb2.default.cssConfig);
                }
            }
        };

        var timedDetectMQChange = function () {
            var running = false;
            var _run = function run() {
                detectMQChange();
                _run = false;
            };
            return function () {
                if (!running) {
                    running = true;
                    setTimeout(_run, 9);
                }
            };
        }();

        Object.defineProperty(_globalRb2.default, 'cssConfig', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: Object.assign(cssConfig, styles)
        });

        Object.defineProperty(cssConfig, 'mqChange', {
            configurable: true,
            enumerable: true,
            get: function get() {
                if (!mqCallbacks) {
                    _globalRb2.default.resize.on(detectMQChange);
                    mqCallbacks = _globalRb2.default.$.Callbacks();
                }

                return mqCallbacks;
            }
        });

        document.addEventListener('DOMContentLoaded', timedDetectMQChange);

        window.addEventListener('load', timedDetectMQChange);
        detectMQChange();
    };

    Object.defineProperty(_globalRb2.default, 'cssConfig', {
        configurable: true,
        enumerable: true,
        get: function get() {
            parseCSS();
            return cssConfig;
        }
    });

    getPseudoToParse = _globalRb2.default.getPseudo;

    exports.default = _globalRb2.default;
});
