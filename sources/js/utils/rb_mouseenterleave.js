(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';
    var rb = window.rb;
    var $ = rb.$ || window.jQuery;

    var testEnterLeave = function( target, event ) {
        var related = event.relatedTarget;
        return ( !related || (related !== target && !target.contains(related )) );
    };

    [['rbmouseenter', 'mouseover'], ['rbmouseleave', 'mouseout']].forEach(function(evt){
        rb.events.special[evt[0]] = {
            add: function(element, handler, options){
                var delegate = options && options.delegate || '';
                var proxy = rb.events.proxy(handler, evt[0], delegate);

                if(!proxy){
                    proxy = function(e){
                        var target = e.target;
                        if(delegate){
                            e.delegatedTarget = e.target.closest(delegate);
                            if(!e.delegatedTarget){return;}
                            target = e.delegatedTarget;
                        }

                        if(testEnterLeave(target, e)){
                            return handler.call(this, e);
                        }
                    };

                    rb.events.proxy(handler, evt[0], delegate, proxy );
                }

                element.addEventListener(evt[1], proxy, !!(options && options.capture));
            },
            remove: function(element, handler, options){
                var delegate = options && options.delegate || '';
                var proxy = rb.events.proxy(handler, evt[0], delegate);

                element.removeEventListener(evt[1], proxy || handler, !!(options && options.capture));
            }
        };
    });


    return rb.events;
}));
