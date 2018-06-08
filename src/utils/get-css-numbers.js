import getCss from './get-css';
import getStyles from './get-styles';

/**
 * Sums up all style values of an element
 * @memberof rb
 * @param element {Element}
 * @param styles {String[]} The names of the style properties (i.e. paddingTop, marginTop)
 * @param onlyPositive {Boolean} Whether only positive numbers should be considered
 * @returns {number} Total of all style values
 * @example
 * var innerWidth = rb.getCSSNumbers(domElement, ['paddingLeft', 'paddingRight', 'width'];
 */
export default function getCSSNumbers(element, styles, onlyPositive) {
    let numbers = 0;
    const cStyles = getStyles(element);

    if (!Array.isArray(styles)) {
        styles = [styles];
    }

    for (let i = 0; i < styles.length; i++) {
        const value = getCss(element, styles[i], true, cStyles);

        if (!onlyPositive || value > 0) {
            numbers += value;
        }
    }

    return numbers;
}
