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
export default window.rb.if = function iff(condition, yes, no) {
    return condition ? yes : (no || '');
};
