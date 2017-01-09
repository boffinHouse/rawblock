const regAttr = /="*'*\{*([_a-z\-0-9$]+)}*'*"*/;
const regStart = /^\[/;
const $ = window.rb.$;

/**
 * Finds attribute linked elements on the first element in collection.
 * @function external:"jQuery.fn".attrLinked
 * @param {String} attributeSelector Attribute selector pattern to search for. ("[aria-controls="${id}"]")
 * @returns {jQueryfiedObject}
 *
 * @example
 *
 * //<div id="yo"></div>
 * //<a data-target="yo"></a>
 *
 * $('#yo').attrLinked('data-target=id'); // returns '[data-target="yo"]' elements.
 * $('#yo').attrLinked('data-target=id').attrLinked('id=data-target'); // returns '[id="yo"]' elements.
 */
$.fn.attrLinked = function (attributeSelector) {
    let newCollection;
    let elem = this.get(0);

    if (elem) {
        const valueAttr = attributeSelector.match(regAttr);

        if(valueAttr){
            let value = elem[valueAttr[1]];

            if(!value || typeof value != 'string'){
                value = elem.getAttribute(valueAttr[1]) || '';
            }

            if(!regStart.test(attributeSelector)){
                attributeSelector = `[${attributeSelector}]`;
            }

            newCollection = $(attributeSelector.replace(regAttr, `="${value}"`));
        }
    }

    return newCollection || $([]);
};
