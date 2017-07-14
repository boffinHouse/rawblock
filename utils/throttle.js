import rIC from './request-idle-callback';
import rAFQueue from './rafqueue';

/**
 * Throttles a given function
 * @memberof rb
 * @param {function} fn - The function to be throttled.
 * @param {object} [options] - options for the throttle.
 *  @param {object} options.that=null -  the context in which fn should be called.
 *  @param {boolean} options.write=false -  wether fn is used to write layout.
 *  @param {boolean} options.read=false -  wether fn is used to read layout.
 *  @param {number} options.delay=200 -  the throttle delay.
 *  @param {boolean} options.unthrottle=false -  Wether function should be invoked directly.
 * @returns {function} the throttled function.
 */
export default function throttle(fn, options) {
    let running, that, args;

    let lastTime = 0;
    let Date = window.Date;

    const _run = function () {
        running = false;
        lastTime = Date.now();
        const nowThat = that;
        const nowArgs = args;

        that = null;
        args = null;

        fn.apply(nowThat, nowArgs);
    };

    let afterAF = function () {
        rIC(_run);
    };

    const throttel = function () {

        that = options.that || this;
        args = arguments;

        if (running) {
            return;
        }

        let delay = options.delay;

        running = true;

        if (options.unthrottle) {
            _run();
        } else {
            if (delay && !options.simple) {
                delay -= (Date.now() - lastTime);
            }
            if (delay < 0) {
                delay = 0;
            }
            if(!delay && (options.read || options.write)){
                getAF();
            } else {
                setTimeout(getAF, delay);
            }
        }
    };

    let getAF = function () {
        rAFQueue(afterAF);
    };

    if (!options) {
        options = {};
    }

    if (!options.delay) {
        options.delay = 200;
    }

    if (options.write) {
        afterAF = _run;
    } else if (!options.read) {
        getAF = _run;
    }

    throttel._rbUnthrotteled = fn;

    return throttel;
}

if(window.rb){
    window.rb.throttle = throttle;
}
