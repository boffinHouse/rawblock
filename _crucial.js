import rb from './utils/global-rb';

let getPseudoToParse;

const regStartQuote = /^"?'?"?/;
const regEndQuote = /"?'?"?$/;
const regEscapedQuote = /\\"/g;

const removeLeadingQuotes = function (str) {
    return str && str.replace(regStartQuote, '').replace(regEndQuote, '').replace(regEscapedQuote, '"');
};

/**
 * Parses a string using JSON.parse without throwing an error.
 * @memberof rb
 * @param str
 * @returns {*}
 */
rb.jsonParse = function (str) {
    let ret;

    if(str){
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
rb.parsePseudo = function (element, privateExpando) {
    let ret;
    const isString = typeof element == 'string';
    const value = isString ?
            element :
            getPseudoToParse(element)
        ;

    if(element && !isString && privateExpando){
        element[privateExpando] = value;
    }

    ret = rb.jsonParse(removeLeadingQuotes(value));
    return ret;
};

/**
 *
 * @param element
 * @returns {*}
 */
rb.getPseudo = function(element){
    // Get data from hidden elements can be tricky:
    // IE11 on Win7 does return content: 'none' for before. But can return fontFamily for the before element. (Safari 10 does not return the right fontFamily!.)
    // Safari 8 does return content: ''|null for before. But can only read content for the element itself.
    const beforeStyles = rb.getStyles(element, '::before');
    let value = beforeStyles.content;
    const isValueNone = value == 'none';

    if((isValueNone || !value) && element){
        if(isValueNone){
            value = beforeStyles.fontFamily;
        } else {
            value = rb.getStyles(element).content;
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
rb.hasPseudoChanged = function(element, privateExpando){
    const value = element[privateExpando];
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
rb.getStyles = function (element, pseudo) {
    let view = element.ownerDocument.defaultView;

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
const cssConfig = {mqs: {}, currentMQ: '', beforeMQ: ''};
const parseCSS = function () {
    let mqCallbacks;
    const root = document.documentElement;
    const styles = rb.parsePseudo(root) || {};
    const currentMQStyle = rb.getStyles(root, '::after');
    let currentStyle = '';

    const detectMQChange = function () {
        const nowStyle = currentMQStyle.content;

        if (currentStyle != nowStyle) {
            currentStyle = nowStyle;
            rb.cssConfig.beforeMQ = rb.cssConfig.currentMQ;
            rb.cssConfig.currentMQ = removeLeadingQuotes(currentStyle);
            if (rb.$ && rb.$.Callbacks) {
                rb.cssConfig.mqChange.fireWith(rb.cssConfig);
            }
        }
    };

    const timedDetectMQChange = (function(){
        let running = false;
        let run = function(){
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

export default rb;
