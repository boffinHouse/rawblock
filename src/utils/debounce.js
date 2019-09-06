import rb from './global-rb';
import rAFQueue from './rafqueue';
import { measurePhase } from './rafqueue';

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
    let args, that, timestamp, timeout, isWriteCalled, isReadCalled, frames;

    const later = function(){
        const last = Date.now() - timestamp;

        if (last < opts.delay || frames < opts.minFrame) {
            isWriteCalled = false;
            isReadCalled = false;
            timeout = setTimeout(later, Math.max(opts.delay - last, (opts.minFrame - frames) * 17));
        } else if(!isWriteCalled) {
            isWriteCalled = true;
            rAFQueue(later);
        }  else if(!isReadCalled && !opts.write) {
            isReadCalled = true;
            measurePhase().then(later);
        } else {
            timeout = null;
            fn.apply(that, args);
        }
    };
    const countFrames = function(){
        frames++;
        if(timeout && opts.minFrame < frames){
            rAFQueue(countFrames);
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
                rAFQueue(countFrames);
            }
            timeout = setTimeout(later, opts.delay);
        }
    };
};

export default rb.debounce;
