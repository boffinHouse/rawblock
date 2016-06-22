(function () {
    'use strict';
    if (!window.rb) {
        window.rb = {};
    }

    var pseudoExpando, getPseudoToParse;

    var rb = window.rb;

    var regStartQuote = /^"?'?"?/;
    var regEndQuote = /"?'?"?$/;
    var regEscapedQuote = /\\"/g;

    var removeLeadingQuotes = function (str) {
        return (str || '').replace(regStartQuote, '').replace(regEndQuote, '').replace(regEscapedQuote, '"');
    };

    /* Begin: ID/Symbol */
    /**
     * Returns a Symbol or unique String
     * @memberof rb
     * @param {String} description ID or description of the symbol
     * @type {Function}
     * @returns {String|Symbol}
     */
    rb.Symbol = window.Symbol;
    var id = Math.round(Date.now() * Math.random());

    /**
     * Returns a unique id based on Math.random and Date.now().
     * @memberof rb
     * @returns {string}
     */
    rb.getID = function () {
        id += Math.round(Math.random() * 1000);
        return id.toString(36);
    };

    if (!rb.Symbol) {
        rb.Symbol = function (name) {
            name = name || '_';
            return name + rb.getID();
        };
    }

    /**
     * Parses a string using JSON.parse without throwing an error.
     * @memberof rb
     * @param str
     * @returns {*}
     */
    rb.jsonParse = function (str) {
        var ret;
        try {
            ret = JSON.parse(str);
        } catch (e) { }
        return ret;
    };

    /**
     * Parses the CSS content value of a pseudo element using JSON.parse.
     * @memberof rb
     * @param element {Element} The element to parse.
     * @param [pseudo='::before'] {String}
     * @returns {Object|undefined}
     */
    rb.parsePseudo = function (element, pseudo) {
        var ret;
        var isString = typeof element == 'string';
        var value = isString ?
                element :
                getPseudoToParse(element, pseudo)
            ;

        if(element && !isString){
            element[pseudoExpando] = value;
        }

        ret = rb.jsonParse(removeLeadingQuotes(value));
        return ret;
    };

	/**
     *
     * @param element
     * @param pseudo
     * @returns {*}
     */
    rb.getPseudo = function(element, pseudo){
        var value = rb.getStyles(element, pseudo || '::before').content;
        if(!value && element){
            value = rb.getStyles(element).content;
        }

        return value;
    };

    /**
     * @memberof rb
     * @deprecated do it manually.
     * @param element {Element}
     * @param [pseudo='::before'] {String}
     * @returns {boolean}
     */
    rb.hasPseudoChanged = function(element, pseudo){
        var value = element[pseudoExpando];
        return getPseudoToParse(element, pseudo) != value;
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
    rb.getStyles = function (element, pseudo) {
        var view = element.ownerDocument.defaultView;

        if (!view.opener) {
            view = window;
        }
        return view.getComputedStyle(element, pseudo || null) || {getPropertyValue: rb.$ && rb.$.noop, isNull: true};
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
    var cssConfig = {mqs: {}, currentMQ: '', beforeMQ: ''};
    var parseCSS = function () {
        var mqCallbacks;
        var root = document.documentElement;
        var styles = rb.parsePseudo(root) || {};
        var currentMQStyle = rb.getStyles(root, '::after');
        var currentStyle = '';

        var detectMQChange = function () {
            var nowStyle = currentMQStyle.content;
            if (currentStyle != nowStyle) {
                currentStyle = nowStyle;
                rb.cssConfig.beforeMQ = rb.cssConfig.currentMQ;
                rb.cssConfig.currentMQ = removeLeadingQuotes(currentStyle);
                if (rb.$ && rb.$.Callbacks) {
                    rb.cssConfig.mqChange.fireWith(rb.cssConfig);
                }
            }
        };

        var timedDetectMQChange = (function(){
            var running = false;
            var run = function(){
                detectMQChange();
                run = false;
            };
            return function(){
                if(!running){
                    running = true;
                    setTimeout(run, 9);
                }
            };
        })();

        Object.defineProperty(rb, 'cssConfig', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: Object.assign(cssConfig, styles)
        });

        Object.defineProperty(cssConfig, 'mqChange', {
            configurable: true,
            enumerable: true,
            get: function () {
                if (!mqCallbacks) {
                    rb.resize.on(detectMQChange);
                    mqCallbacks = rb.$.Callbacks();
                }

                return mqCallbacks;
            },
        });

        document.addEventListener('DOMContentLoaded', timedDetectMQChange);

        window.addEventListener('load', timedDetectMQChange);
        detectMQChange();
    };

    Object.defineProperty(rb, 'cssConfig', {
        configurable: true,
        enumerable: true,
        get: function () {
            parseCSS();
            return cssConfig;
        },
    });

    getPseudoToParse = rb.getPseudo;

    pseudoExpando = rb.Symbol('_rbPseudoExpando');

    if (typeof module === 'object' && module.exports) {
        module.exports = rb;
    }
})();
