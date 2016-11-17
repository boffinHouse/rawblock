(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', 'babel-runtime/helpers/typeof'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('babel-runtime/helpers/typeof'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global._typeof);
        global.rb_parsecss = mod.exports;
    }
})(this, function (module, _typeof2) {
    'use strict';

    var _typeof3 = _interopRequireDefault(_typeof2);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    (function (factory) {
        if ((typeof module === 'undefined' ? 'undefined' : (0, _typeof3.default)(module)) === 'object' && module.exports) {
            module.exports = factory();
        } else {
            factory();
        }
    })(function () {
        'use strict';

        var rb = window.rb;
        var defaultCSSProp = '--rb-cfg';
        var watchCSSProp = '--rb-watch-css';

        var regStartQuote = /^\s?"?'?"?/;
        var regEndQuote = /"?'?"?\s?$/;
        var regEscapedQuote = /\\"/g;

        var removeLeadingQuotes = function removeLeadingQuotes(str) {
            return str && str.replace(regStartQuote, '').replace(regEndQuote, '').replace(regEscapedQuote, '"');
        };

        function getComponentCss(element, name) {
            var prop, style, rets;

            var ret = 'null';
            var styles = rb.getStyles(element);
            var defaults = rb.components[name].defaults;

            name = '--' + name + '-';

            if (styles.getPropertyValue(watchCSSProp)) {
                rets = [];

                for (prop in defaults) {
                    style = styles.getPropertyValue(name + prop);

                    if (style) {
                        rets.push('"' + prop + '":' + removeLeadingQuotes(style));
                    }
                }

                if (rets.length) {
                    ret = '{' + rets.join(',') + '}';
                }
            }

            return ret;
        }

        function parseCss(element, name) {
            var styles = element.nodeType ? rb.getStyles(element) : element;

            return rb.jsonParse(removeLeadingQuotes(styles.getPropertyValue(name || defaultCSSProp) || ''));
        }

        function hasComponentCssChanged(element, name, symbol) {
            var nowStyles = getComponentCss(element, name);
            var cachedStyles = element[symbol] && element[symbol][name];

            if (!element[symbol]) {
                element[symbol] = {};
            }
            element[symbol][symbol] = nowStyles;

            return nowStyles != cachedStyles;
        }

        function parseComponentCss(element, name, symbol) {
            var styles = element[symbol] && element[symbol][name] || getComponentCss(element, name);

            if (symbol) {
                if (!element[symbol]) {
                    element[symbol] = {};
                }
                element[symbol][name] = styles;
            }

            return rb.jsonParse(styles);
        }

        rb.enableCustomCss = function () {
            rb.parseComponentCss = parseComponentCss;
            rb.hasComponentCssChanged = hasComponentCssChanged;
        };

        return parseCss;
    });
});
