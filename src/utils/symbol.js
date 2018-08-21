import rb from './global-rb';
import getId from './get-id';

/**
 * Returns a Symbol or unique String
 * @memberof rb
 * @param {String} description ID or description of the symbol
 * @type {Function}
 * @returns {String|Symbol}
 */
rb.Symbol = window.Symbol;

if (!rb.Symbol) {
    rb.Symbol = function (name) {
        name = name || '_';
        return name + getId();
    };
}

export default rb.Symbol;
