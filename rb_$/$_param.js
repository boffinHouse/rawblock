const rb = window.rb;
const $ = rb.$;
const r20 = /%20/g;
const rbracket = /\[]$/;

function buildParams( prefix, obj, add ) {
    let name;

    if ( Array.isArray( obj ) ) {
        obj.forEach(function( v, i ) {
            if ( rbracket.test( prefix ) ) {
                add( prefix, v );

            } else {
                buildParams(
                    prefix + '[' + ( typeof v === 'object' && v != null ? i : '' ) + ']',
                    v,
                    add
                );
            }
        } );

    } else if (typeof obj == 'object' ) {
        for ( name in obj ) {
            buildParams( prefix + '[' + name + ']', obj[ name ], add );
        }

    } else {
        add( prefix, obj );
    }
}

/**
 * This is a direct copy of jQuery's param method without traditional option.
 * @param a
 * @returns {string}
 */
const param = $.param || function( a ) {
    let prefix;
    const s = [];
    const add = function( key, value ) {
        value = typeof value == 'function' ? value() : ( value == null ? '' : value );
        s[ s.length ] = encodeURIComponent( key ) + '=' + encodeURIComponent( value );
    };

    if ( Array.isArray( a ) ) {
        a.forEach(function(item) {
            add( item.name, item.value );
        } );

    } else {
        for ( prefix in a ) {
            buildParams(prefix, a[ prefix ], add);
        }
    }

    // Return the resulting serialization
    return s.join('&').replace(r20, '+');
};

if($ && !$.param){
    $.param = param;
}

export default param;
