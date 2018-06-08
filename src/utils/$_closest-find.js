const regSplit = /\s*?,\s*?|\s+?/g;
const $ = window.rb.$;

/**
 * Invokes on the first element in collection the closest method and on the result the querySelector method.
 * @function external:"jQuery.fn".closestFind
 * @param {String} selectors Two selectors separated by a white space and/or comma. First is used for closest and second for querySelector. Example: `".rb-item, .item-input"`.
 * @returns {jQueryfiedObject}
 */
$.fn.closestFind = function (selectors) {
    let sels;
    let closestSel, findSel;
    let elem = this.get(0);

    if (elem) {
        sels = selectors.split(regSplit);
        closestSel = sels.shift();
        findSel = sels.join(' ');
        elem = elem.closest(closestSel);
        if (elem) {
            elem = elem.querySelector(findSel);
        }
    }

    return $(elem || []);
};
