(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';
    var rb = window.rb;
    var defaultCSSProp = '--rb-cfg';
    var watchCSSProp = '--rb-watch-css';

    var regStartQuote = /^\s?"?'?"?/;
    var regEndQuote = /"?'?"?\s?$/;
    var regEscapedQuote = /\\"/g;

    var removeLeadingQuotes = function (str) {
        return str && str.replace(regStartQuote, '').replace(regEndQuote, '').replace(regEscapedQuote, '"');
    };

    function getComponentCss(element, name){
        var prop, style, rets;

        var ret = 'null';
        var styles = rb.getStyles(element);
        var defaults = rb.components[name].defaults;

        name = '--' + name + '-';

        if(styles.getPropertyValue(watchCSSProp)){
            rets = [];

            for(prop in defaults){
                style = styles.getPropertyValue(name + prop);

                if(style){
                    rets.push('"'+ prop +'":'+ removeLeadingQuotes(style));
                }
            }

            if(rets.length){
                ret = '{' + rets.join(',') + '}';
            }
        }

        return ret;
    }

    rb.parseCss = function(element, name){
        var styles = element.nodeType ? rb.getStyles(element) : element;

        return rb.jsonParse(
            removeLeadingQuotes(styles.getPropertyValue(name || defaultCSSProp) || '')
        );
    };

    rb.hasComponentCssChanged = function(element, name, symbol){
        var nowStyles = getComponentCss(element, name);
        var cachedStyles = element[symbol];

        element[symbol] = nowStyles;

        return nowStyles != cachedStyles;
    };

    rb.parseComponentCss = function(element, name, symbol){
        var styles = element[symbol] || getComponentCss(element, name);

        if(symbol){
            element[symbol] = styles;
        }

        return rb.jsonParse(styles);
    };

    return rb.parseCss;
}));
