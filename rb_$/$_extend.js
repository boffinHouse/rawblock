import isPlainObject from './$_is-plain-object';

export default function extend() {
    let options, name, src, copy, copyIsArray, clone;

    let target = arguments[ 0 ] || {};
    let i = 1;
    let deep = false;
    const length = arguments.length;

    if ( typeof target === 'boolean' ) {
        deep = target;
        target = arguments[ i ] || {};
        i++;
    }

    if ( typeof target !== 'object' && typeof target != 'function' ) {
        target = {};
    }

    if (i === length) {
        target = this;
        i--;
    }

    for ( ; i < length; i++ ) {

        if ( (options = arguments[i]) != null ) {

            for (name in options) {
                src = target[name];
                copy = options[name];

                if (target === copy) {
                    continue;
                }

                if ( deep && copy && (isPlainObject(copy) ||
                    ( copyIsArray = Array.isArray(copy) ) ) ) {

                    if ( copyIsArray ) {
                        copyIsArray = false;
                        clone = src && Array.isArray( src ) ? src : [];

                    } else {
                        clone = src && isPlainObject( src ) ? src : {};
                    }

                    target[name] = extend( deep, clone, copy );

                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    return target;
}
