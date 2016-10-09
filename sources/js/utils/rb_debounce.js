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
     * @memberof rb
     *
     * @param fn {Function}
     * @param opts
     * @param opts.delay
     * @param opts.that
     * @param opts.write
     * @returns {Function}
     *
     */
    rb.debounce = function(fn, opts){
        var args, that, timestamp, timeout, isWriteCalled, isReadCalled, frames;

        var later = function(){
            var last = Date.now() - timestamp;

            if (last < opts.delay || frames < opts.minFrame) {
                isWriteCalled = false;
                isReadCalled = false;
                timeout = setTimeout(later, Math.max(opts.delay - last, (opts.minFrame - frames) * 17));
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
        var countFrames = function(){
            frames++;
            if(timeout){
                rb.rAFQueue(countFrames);
            }
        };


        opts = Object.assign({delay: 100, minFrame: 0}, opts);

        opts.delay = Math.max(40, opts.delay) - 18;

        return function(){
            timestamp = Date.now();
            frames = 0;

            args = arguments;
            that = opts.that || this;

            if (!timeout) {
                if(opts.minFrame){
                    rb.rAFQueue(countFrames);
                }
                timeout = setTimeout(later, opts.delay);
            }
        };
    };

    return rb.debounce;
}));
