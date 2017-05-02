import rb from './global-rb';

/**
 * Sets/Gets expando property of an object
 *
 * @param obj {Object}
 * @param expando {String|Symbol}
 * @param [name] {String|Object}
 * @param [value] {*}
 * @return {*}
 *
 * @example
 * //sets expando properties by merging name object into expando object
 * expando(divElement, expando, {isValid: true, tested: true});
 *
 * //sets expando property by setting name of expando object
 * expando(divElement, expando, 'isValid', true);
 *
 * //gets hole expando object
 * expando(divElement, expando);
 *
 * //gets isValid property of expando
 * expando(divElement, expando, isValid);
 */
export default function expando(obj, expando, name, value){
    const nameType = typeof name;
    const isSring = nameType == 'string';

    if(!obj[expando]){
        obj[expando] = {};
    }

    if(isSring && arguments.length == 4){
        if(value !== undefined){
            obj[expando][name] = value;
        } else if( (name in obj[expando]) ){
            delete obj[expando];
        }
    } else if(nameType == 'object'){
        Object.assign(obj[expando], name);
    }

    return isSring ? obj[expando][name] : obj[expando];
}

rb.expando = expando;
