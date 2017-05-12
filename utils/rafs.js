import rAFQueue from './rafqueue';

/**
 * Generates and returns a new, rAFed version of the passed function, so that the passed function is always called using requestAnimationFrame. Normally all methods/functions, that mutate the DOM/CSSOM, should be wrapped using `rb.rAF` to avoid layout thrashing.
 * @memberof rb
 * @param fn {Function} The function to be rAFed
 * @param options {Object} Options object
 * @param options.that=null {Object} The context in which the function should be invoked. If nothing is passed the context of the wrapper function is used.
 * @param options.queue=false {Object} Whether the fn should be added to an ongoing rAF (i.e.: `false`) or should be queued to the next rAF (i.e.: `true`).
 * @param options.throttle=false {boolean} Whether multiple calls in one frame cycle should be throtteled to one.
 * @returns {Function}
 *
 * @example
 *  class Foo {
	 *      constructor(element){
	 *          this.element = element;
	 *          this.changeLayout = rb.rAF(this.changeLayout);
	 *      }
	 *
	 *      changeLayout(width){
	 *          this.element.classList[width > 800 ? 'add' : 'remove']('is-large');
	 *      }
	 *
	 *      measureLayout(){
	 *          this.changeLayout(this.element.offsetWidth);
	 *      }
	 *  }
 */
export function rAF(fn, options) {
    let running, args, that, inProgress;
    const batchStack = [];
    const run = function () {
        running = false;
        if (!options.throttle) {
            while (batchStack.length) {
                args = batchStack.shift();
                fn.apply(args[0], args[1]);
            }
        } else {
            fn.apply(that, args);
        }
    };
    const rafedFn = function () {
        args = arguments;
        that = options.that || this;
        if (!options.throttle) {
            batchStack.push([that, args]);
        }
        if (!running) {
            running = true;
            rAFQueue(run, inProgress);
        }
    };

    if (!options) {
        options = {};
    }

    inProgress = !options.queue;

    if (fn._rbUnrafedFn) {
        rb.log('double rafed', fn);
    }

    rafedFn._rbUnrafedFn = fn;

    return rafedFn;
}

/* End: rAF helpers */

/* Begin: rAFs helper */

/**
 * Invokes `rb.rAF` on multiple methodNames of on object.
 *
 * @memberof rb
 *
 * @param {Object} obj
 * @param {Object} [options]
 * @param {...String} methodNames
 *
 * @example
 * rb.rAFs(this, {throttle: true}, 'renderList', 'renderCircle');
 */
export function rAFs(obj) {
    let options;
    const args = Array.from(arguments);

    args.shift();

    if (typeof args[0] == 'object') {
        options = args.shift();
    }

    args.forEach(function (fn) {
        obj[fn] = rb.rAF(obj[fn], options);
    });
}

export default function(fn){
    return typeof fn == 'function' ? rAF(...arguments) : rAFs(...arguments);
}

if(window.rb){
    Object.assign(window.rb, {rAF, rAFs});
}
