(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        factory();
    }
}(function () {
    'use strict';
    /* jshint eqnull: true */
    var rb = window.rb || {};

	/**
     *
     * @param fn
     * @param opts
     * @param opts.delay
     * @param opts.that
     * @param opts.write
     * @returns {Function}
     */
    rb.debounce = function(fn, opts){
        var args, that, timestamp, timeout, isWriteCalled, isReadCalled;

        var later = function(){
            var last = Date.now() - timestamp;

            if (last < opts.delay) {
                isWriteCalled = false;
                isReadCalled = false;
                timeout = setTimeout(later, opts.delay - last);
            } else if(!isWriteCalled) {
                isWriteCalled = true;
                rb.rAFQueue(later);
            }  else if(!isReadCalled && !opts.write) {
                isReadCalled = true;
                rb.rIC(later);
            } else {
                timeout = null;
                fn.apply(that, args);
            }
        };

        opts = Object.assign({delay: 100}, opts);

        opts.delay = Math.max(40, opts.delay) - 18;

        return function(){
            timestamp = Date.now();
            args = arguments;
            that = opts.that || this;

            if (!timeout) {
                timeout = setTimeout(later, opts.delay);
            }
        };
    };

    return rb.debounce;
}));
