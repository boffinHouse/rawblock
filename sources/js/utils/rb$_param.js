(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';
    /* jshint eqnull: true */
    var rb = window.rb;
    var $ = rb.$;
    var r20 = /%20/g;
    var rbracket = /\[\]$/;

    function buildParams( prefix, obj, add ) {
        var name;

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
                buildParams( prefix + '[' + name + ']', obj[ name ], traditional, add );
            }

        } else {
            add( prefix, obj );
        }
    }


    if(!$.param){
	    /**
         * This is a direct copy of jQuery's param method without traditional option.
         * @param a
         * @returns {string}
         */
        $.param = function( a ) {
            var prefix;
            var s = [];
            var add = function( key, value ) {
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
    }

    return $.param;
}));
