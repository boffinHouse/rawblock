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
     * @returns {Function}
     */
    rb.debounce = function(fn, opts){
        var args, that, timestamp, timeout;

        var later = function(){
            var last = Date.now() - timestamp;

            if (last < opts.delay) {
                timeout = setTimeout(later, opts.delay - last);
            } else {
                timeout = null;
                fn.apply(that, args);
            }
        };

        opts = Object.assign({delay: 100}, opts);

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
