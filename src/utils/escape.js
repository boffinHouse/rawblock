import rb from './global-rb';

const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;',
};

// Functions for escaping and unescaping strings to/from HTML interpolation.
const createEscaper = function (map) {
    const escaper = function (match) {
        return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    const source = '(?:' + Object.keys(map).join('|') + ')';
    const testRegexp = new RegExp(source);
    const replaceRegexp = new RegExp(source, 'g');

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
rb.escape = createEscaper(escapeMap);

/* eslint-disable no-undef */
if (!window._) {
    window._ = {};
}
if (!_.escape) {
    _.escape = rb.escape;
}
/* eslint-enable no-undef */

export default rb.escape;
