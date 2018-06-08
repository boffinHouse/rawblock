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
export default function getStyles(element, pseudo) {
    let view = element.ownerDocument.defaultView;

    if (!view.opener) {
        view = window;
    }
    return view.getComputedStyle(element, pseudo || null) || {getPropertyValue: rb.$ && rb.$.noop, isNull: true};
}
