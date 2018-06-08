import rb from './global-rb';

/**
 * Returns yes, if condition is true-thy no/empty string otherwise. Can be used inside of [`rb.template`]{@link rb.template}
 *
 * @memberOf rb
 *
 * @param condition
 * @param {String} yes
 * @param {String} [no=""]
 * @returns {string}
 */
export default function iff(condition, yes, no) {
    return condition ? yes : (no || '');
}

rb.if = iff;
