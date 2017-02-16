const rCRLF = /\r?\n/g;
const rcheckableType = ( /^(?:checkbox|radio)$/i );
const rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i;
const rsubmittable = /^(?:input|select|textarea|keygen)/i;

/**
 *
 * @param elements {Element, Element[]}
 * @return {Array}
 */
export default function serialize(elements){
    const array = [];

    if(!Array.isArray(elements)){
        elements = elements.nodeType ? [elements] : Array.from(elements);
    }

    elements.forEach(function(element){
        const elements = element.elements && Array.from(element.elements) || [element];

        elements.forEach(function(element){
            let type, options, i, len;

            if( element.name && !element.matches(':disabled') &&
                rsubmittable.test( element.nodeName || '' ) &&
                (type = element.type) && !rsubmitterTypes.test(type) &&
                (element.checked || !rcheckableType.test( type )) ) {

                if( (options = element.selectedOptions) ){
                    for(i = 0, len = options.length; i < len; i++){
                        array.push({name: element.name, value: (options[i].value || '').replace( rCRLF, '\r\n' )});
                    }
                } else {
                    array.push({name: element.name, value: (element.value || '').replace( rCRLF, '\r\n' )});
                }

            }
        });
    });

    return array;
}
